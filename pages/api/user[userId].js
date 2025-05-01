// pages/api/user/[userId].js
import dbConnect from '../../../lib/db';
import Fan from '../../../models/Fan';
import { verifyToken } from '../../../lib/auth';

export default async function handler(req, res) {
  const { userId } = req.query;
  
  // Verificar o token de autenticação
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token de autenticação não fornecido' });
  }
  
  const token = authHeader.split(' ')[1];
  const { valid, payload } = verifyToken(token);
  
  if (!valid) {
    return res.status(401).json({ error: 'Token inválido ou expirado' });
  }
  
  // Verificar se o usuário está tentando acessar seus próprios dados
  if (payload.userId !== userId) {
    return res.status(403).json({ error: 'Acesso não autorizado' });
  }
  
  try {
    await dbConnect();
    
    const user = await Fan.findById(userId);
    
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }
    
    // Retornar os dados do usuário (excluindo informações sensíveis)
    return res.status(200).json({
      id: user._id,
      name: user.name,
      email: user.email,
      cpf: user.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4'), // Formatar CPF
      birthDate: user.birthDate,
      phone: user.phone,
      address: user.address,
      favoriteGames: user.favoriteGames,
      favoriteTeams: user.favoriteTeams,
      favoritePlayers: user.favoritePlayers,
      attendedEvents: user.attendedEvents,
      purchasedMerchandise: user.purchasedMerchandise,
      socialMedia: user.socialMedia,
      gamingProfiles: user.gamingProfiles
    });
  } catch (error) {
    console.error('Erro ao buscar usuário:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
}