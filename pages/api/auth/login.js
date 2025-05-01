// pages/api/auth/login.js
import dbConnect from '../../../lib/db';
import Fan from '../../../models/Fan';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, cpf } = req.body;

  if (!email || !cpf) {
    return res.status(400).json({ error: 'Email e CPF são obrigatórios' });
  }

  try {
    // Conectar ao banco de dados
    console.log('Conectando ao banco de dados...');
    await dbConnect();
    console.log('Conexão com o banco de dados estabelecida');

    // Normalizar o CPF (remover pontos, traços e espaços)
    const normalizedCpf = cpf.replace(/[^\d]/g, '');
    
    console.log('Tentativa de login:');
    console.log('Email fornecido:', email);
    console.log('CPF normalizado:', normalizedCpf);

    // Verificar se a coleção existe e tem documentos
    // Usando mongoose.connection.db em vez de Fan.db
    const collections = Object.keys(mongoose.connection.collections);
    console.log('Coleções disponíveis:', collections);
    
    // Contar documentos na coleção
    const count = await Fan.countDocuments();
    console.log('Número de documentos na coleção Fan:', count);

    // Se não houver documentos, retornar informação útil
    if (count === 0) {
      return res.status(200).json({ 
        success: false, 
        debug: true,
        message: 'Não há usuários cadastrados no banco de dados',
        collections: collections
      });
    }

    // Buscar todos os usuários para debug (limitado a 5)
    const allUsers = await Fan.find({}).limit(5).select('email cpf');
    
    // Tentar encontrar o usuário por email ou CPF
    const user = await Fan.findOne({
      $or: [
        { email: email },
        { email: { $regex: new RegExp(`^${email}$`, 'i') } },
        { cpf: normalizedCpf },
        { cpf: cpf }
      ]
    });

    if (user) {
      console.log('Usuário encontrado:', user._id.toString());
      
      // Gerar um token JWT
      const token = jwt.sign(
        { sub: user._id },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      return res.status(200).json({
        success: true,
        token,
        userId: user._id
      });
    }

    // Se chegou aqui, não encontrou correspondência
    // Retornar informações de depuração em vez de erro
    return res.status(200).json({ 
      success: false, 
      debug: true,
      message: 'Usuário não encontrado com as credenciais fornecidas',
      emailProvided: email,
      cpfProvided: normalizedCpf,
      usersInDatabase: allUsers.map(u => ({
        id: u._id.toString(),
        email: u.email,
        cpf: u.cpf
      }))
    });
  } catch (error) {
    console.error('Erro de login:', error);
    return res.status(200).json({ 
      success: false,
      debug: true,
      error: error.message,
      stack: error.stack
    });
  }
}
