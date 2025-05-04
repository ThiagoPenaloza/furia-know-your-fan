import dbConnect from '../../../lib/db';
import User from '../../../models/User';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import mongoose from 'mongoose';

export default async function handler(req, res) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session) {
      return res.status(401).json({ error: 'Não autenticado' });
    }

    const { profileId } = req.query;
    if (!profileId) {
      return res.status(400).json({ error: 'ID do perfil é obrigatório' });
    }

    await dbConnect();
    
    // Remover o perfil do array externalProfiles
    await User.findByIdAndUpdate(
      session.user.id,
      { $pull: { externalProfiles: { _id: profileId } } }
    );

    return res.status(200).json({ success: true });
    
  } catch (error) {
    console.error('Erro ao excluir perfil:', error);
    return res.status(500).json({ error: 'Erro ao processar solicitação' });
  }
}