// pages/api/social/unlink/[platform].js
import { getServerSession } from 'next-auth/next';
import dbConnect from '../../../../lib/db';
import User from '../../../../models/User';
import { authOptions } from '../../auth/[...nextauth]';
import Account from '../../../../models/Account'; // ← novo

export default async function handler(req, res) {
  if (req.method !== 'DELETE')
    return res.status(405).json({ error: 'Method not allowed' });

  const session = await getServerSession(req, res, authOptions);
  if (!session) return res.status(401).json({ error: 'Não autenticado' });

  const { platform } = req.query;
  if (!['twitch','instagram','twitter','facebook','youtube'].includes(platform))
    return res.status(400).json({ error: 'Plataforma inválida' });

  await dbConnect();
  const user = await User.findById(session.user.id);
  if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });

  user.socialMedia[platform] = { connected:false };
  await user.save();

  const { deletedCount } = await Account.deleteMany({
    provider: platform,
    userId  : user._id // Mongoose faz o cast p/ ObjectId
  })

  if (deletedCount === 0)
    console.warn(`[unlink] não encontrou contas de ${platform} para apagar`)

  return res.status(200).json({ success:true });
}