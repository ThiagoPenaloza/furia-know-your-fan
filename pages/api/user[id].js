// pages/api/user/[id].js
import dbConnect from '../../../lib/db';
import User from '../../../models/User';

export default async function handler(req, res) {
  const { id } = req.query;
  
  // Verificar se o token de autorização foi fornecido
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token de autorização não fornecido' });
  }
  
  // Extrair o token
  const token = authHeader.split(' ')[1];
  
  try {
    // Conectar ao banco de dados
    await dbConnect();
    
    // Buscar o usuário pelo ID
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }
    
    // Aqui você poderia implementar uma verificação mais robusta do token
    // Por exemplo, verificar se o token foi emitido para este usuário específico
    // e se ainda não expirou
    
    // Por simplicidade, estamos apenas retornando os dados do usuário
    // Em um ambiente de produção, você deve implementar uma autenticação mais segura
    
    // Remover campos sensíveis antes de enviar a resposta
    const userResponse = user.toObject();
    
    // Remover tokens de acesso das redes sociais
    if (userResponse.socialMedia) {
      Object.keys(userResponse.socialMedia).forEach(platform => {
        if (userResponse.socialMedia[platform]) {
          delete userResponse.socialMedia[platform].accessToken;
        }
      });
    }
    
    // Remover outros campos sensíveis se necessário
    delete userResponse.__v;
    
    return res.status(200).json(userResponse);
  } catch (error) {
    console.error('Erro ao buscar dados do usuário:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
}
