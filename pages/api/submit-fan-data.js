// pages/api/submit-fan-data.js
import { IncomingForm } from 'formidable';
import fs from 'fs';
import path from 'path';
import dbConnect from '../../lib/db';
import Fan from '../../models/Fan';

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
      email: getFieldValue(fields.email),
      // Normalizar o CPF antes de salvar
      cpf: getFieldValue(fields.cpf).replace(/[^\d]/g, ''),
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
        instagram: getFieldValue(fields['socialMedia.instagram']),
        twitter: getFieldValue(fields['socialMedia.twitter']),
        facebook: getFieldValue(fields['socialMedia.facebook']),
        twitch: getFieldValue(fields['socialMedia.twitch']),
        youtube: getFieldValue(fields['socialMedia.youtube']),
      },
      
      gamingProfiles: {
        steam: getFieldValue(fields['gamingProfiles.steam']),
        epic: getFieldValue(fields['gamingProfiles.epic']),
        battleNet: getFieldValue(fields['gamingProfiles.battleNet']),
        riotGames: getFieldValue(fields['gamingProfiles.riotGames']),
        origin: getFieldValue(fields['gamingProfiles.origin']),
      },
    };

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
    const conflict = await Fan.findOne({
      $or: [
        { cpf: fanData.cpf },
        { email: fanData.email.toLowerCase().trim() }
      ]
    });
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

    const fan = new Fan(fanData);
    await fan.save();

    // Gerar um token simples para autenticação
    const token = Buffer.from(`${fan._id}:${Date.now()}`).toString('base64');

    // Retornar sucesso
    return res.status(201).json({
      success: true,
      message: 'Dados salvos com sucesso',
      token,
      userId: fan._id
    });
  } catch (error) {
    console.error('Error processing form submission:', error);
    return res.status(500).json({ 
      error: 'Internal server error', 
      details: error.message 
    });
  }
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
