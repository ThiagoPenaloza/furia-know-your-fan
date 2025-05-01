// pages/api/auth/login-email.js
import dbConnect from '../../../lib/db';
import Fan from '../../../models/Fan';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email é obrigatório' });
  }

  try {
    await dbConnect();
    
    console.log('Tentando login apenas com email:', email);
    
    // Buscar o usuário apenas pelo email
    const user = await Fan.findOne({ 
      email: { $regex: new RegExp(`^${email.trim()}$`, 'i') }
    });

    if (!user) {
      return res.status(401).json({ error: 'Email não encontrado' });
    }

    // Gerar um token simples para autenticação
    const token = Buffer.from(`${user._id}:${Date.now()}`).toString('base64');

    return res.status(200).json({
      success: true,
      token,
      userId: user._id
    });
  } catch (error) {
    console.error('Erro de login:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
}