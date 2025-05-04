import { getServerSession } from 'next-auth/next'
import { authOptions }      from './auth/[...nextauth]'
import dbConnect            from '../../lib/db'
import User                 from '../../models/User'

export default async function handler(req, res) {
  try {
    /* ── sessão ── */
    const session = await getServerSession(req, res, authOptions)
    if (!session || !session.user?.id) {
      return res.status(401).json({ error: 'Não autenticado' })
    }

    /* ── dados do usuário ── */
    await dbConnect()
    const user = await User.findById(session.user.id).lean()
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' })
    }

    return res.status(200).json({ user })   // front-end continua usando "fan"
  } catch (err) {
    console.error('GET /api/me error:', err)
    return res.status(500).json({ error: 'Erro interno no servidor' })
  }
}
