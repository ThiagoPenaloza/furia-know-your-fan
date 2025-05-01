// pages/api/auth/verify.js
import { authMiddleware } from '../../../lib/auth';
import dbConnect from '../../../lib/db';
import Fan from '../../../models/Fan';

async function handler(req, res) {
  try {
    await dbConnect();
    
    const user = await Fan.findById(req.user.userId).select('-cpf');
    
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }
    
    return res.status(200).json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Erro ao verificar token:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
}

export default authMiddleware(handler);
