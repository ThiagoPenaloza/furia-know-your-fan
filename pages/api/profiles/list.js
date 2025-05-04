import dbConnect from '../../../lib/db';
import User from '../../../models/User';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session) {
      return res.status(401).json({ error: 'Não autenticado' });
    }

    await dbConnect();
    
    // Otimização 1: Use projeção para buscar apenas os campos necessários
    // Otimização 2: Use lean() para retornar objetos JavaScript simples em vez de documentos Mongoose
    const user = await User.findById(session.user.id)
      .select('externalProfiles')
      .lean();

    // Otimização 3: Adicione cache-control para reduzir requisições repetidas
    res.setHeader('Cache-Control', 'private, max-age=30'); // Cache por 30 segundos
    
    return res.status(200).json({ 
      profiles: user?.externalProfiles || [] 
    });
    
  } catch (error) {
    console.error('Erro ao listar perfis:', error);
    return res.status(500).json({ error: 'Erro ao processar solicitação' });
  }
}