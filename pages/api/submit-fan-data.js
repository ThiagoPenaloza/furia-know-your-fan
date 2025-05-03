// pages/api/submit-fan-data.js
import { IncomingForm } from 'formidable';
import fs from 'fs';
import path from 'path';
import dbConnect from '../../lib/db';
import User from '../../models/User';

// Configuração para desabilitar o body parser padrão do Next.js
// para poder processar o FormData com arquivos
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Conectar ao banco de dados
    await dbConnect();
    
    // Configurar o formidable para processar o upload de arquivos
    const uploadDir = path.join(process.cwd(), 'uploads');
    
    // Garantir que o diretório de uploads existe
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    const form = new IncomingForm({
      uploadDir,
      keepExtensions: true,
      maxFileSize: 10 * 1024 * 1024, // 10MB
    });

    // Processar o formulário
    const [fields, files] = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) return reject(err);
        resolve([fields, files]);
      });
    });

    // Função auxiliar para obter o valor de um campo
    const getFieldValue = (field) => {
      if (!field) return '';
      return Array.isArray(field) ? field[0] : field;
    };

    // Processar os dados do formulário
    const fanData = {
      name: getFieldValue(fields.name),
      email: getFieldValue(fields.email).toLowerCase().trim(),
      password: getFieldValue(fields.password),
      birthDate: new Date(getFieldValue(fields.birthDate)),
      phone: getFieldValue(fields.phone),
      
      address: {
        street: getFieldValue(fields['address.street']),
        number: getFieldValue(fields['address.number']),
        complement: getFieldValue(fields['address.complement']),
        neighborhood: getFieldValue(fields['address.neighborhood']),
        city: getFieldValue(fields['address.city']),
        state: getFieldValue(fields['address.state']),
        zipCode: getFieldValue(fields['address.zipCode']),
      },
      
      // Processar arrays - verificar se são strings JSON ou arrays
      favoriteGames: processArrayField(fields.favoriteGames),
      favoriteTeams: processArrayField(fields.favoriteTeams),
      favoritePlayers: processArrayField(fields.favoritePlayers),
      attendedEvents: processArrayField(fields.attendedEvents),
      purchasedMerchandise: processArrayField(fields.purchasedMerchandise),
      
      socialMedia: {
              instagram: buildSocialObject(getFieldValue(fields['socialMedia.instagram'])),
              twitter:   buildSocialObject(getFieldValue(fields['socialMedia.twitter'])),
              facebook:  buildSocialObject(getFieldValue(fields['socialMedia.facebook'])),
              twitch:    buildSocialObject(getFieldValue(fields['socialMedia.twitch'])),
              youtube:   buildSocialObject(getFieldValue(fields['socialMedia.youtube'])),
            },
      
      gamingProfiles: {
        steam: getFieldValue(fields['gamingProfiles.steam']),
        epic: getFieldValue(fields['gamingProfiles.epic']),
        battleNet: getFieldValue(fields['gamingProfiles.battleNet']),
        riotGames: getFieldValue(fields['gamingProfiles.riotGames']),
        origin: getFieldValue(fields['gamingProfiles.origin']),
      },
      // normaliza CPF (somente dígitos)
      cpf: getFieldValue(fields.cpf).replace(/[^\d]/g, ''),
    };

    // senha em texto-plano; o pre('save') hasheará
    fanData.password = getFieldValue(fields.password);

    // Processar arquivos
    if (files.idDocument && files.idDocument.filepath) {
      // Em produção, você provavelmente faria upload para S3 ou outro serviço
      // Aqui estamos apenas salvando o caminho do arquivo
      const filename = path.basename(files.idDocument.filepath);
      fanData.idDocument = `/uploads/${filename}`;
    }

    if (files.selfie && files.selfie.filepath) {
      const filename = path.basename(files.selfie.filepath);
      fanData.selfie = `/uploads/${filename}`;
    }

    // ======== Verificação de CPF e email únicos ========
    console.log('fanData.cpf:', fanData.cpf, 'fanData.email:', fanData.email)
    const conflict = await User.findOne({
      $or: [
        { cpf: fanData.cpf },
        { email: fanData.email.toLowerCase().trim() }
      ]
    });
    console.log('findOne conflict:', conflict)
    if (conflict) {
      if (conflict.cpf === fanData.cpf) {
        return res
          .status(409)
          .json({ error: 'Já existe um cadastro com este CPF.' });
      }
      if (conflict.email === fanData.email.toLowerCase().trim()) {
        return res
          .status(409)
          .json({ error: 'Já existe um cadastro com este email.' });
      }
    }

    // senha crua — o hook do Mongoose fará o hash
    fanData.password = getFieldValue(fields.password);

    const user = new User(fanData);
    await user.save();

    // Retornar sucesso
    return res.status(201).json({
      success: true,
      message: 'Dados salvos com sucesso',
      userId: user._id
    });
  } catch (error) {
    console.error('Error processing form submission:', error);
    return res.status(500).json({ 
      error: 'Internal server error', 
      details: error.message 
    });
  }
}



function buildSocialObject(value) {
  if (!value) return { connected:false }
  const username = value.trim().replace(/^@/, '')
  return { username, connected:true }
}

// Função auxiliar para processar campos de array
function processArrayField(field) {
  if (!field) return [];
  
  const value = Array.isArray(field) ? field[0] : field;
  
  if (!value) return [];
  
  try {
    // Tentar fazer parse como JSON
    return JSON.parse(value);
  } catch (e) {
    // Se não for JSON válido, dividir por vírgula
    return value.split(',').map(item => item.trim()).filter(Boolean);
  }
}
