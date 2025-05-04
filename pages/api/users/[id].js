import dbConnect from '../../../lib/db'
import User      from '../../../models/User'

export default async function handler (req, res) {
  if (req.method !== 'DELETE')
    return res.status(405).json({ error: 'Method not allowed' })

  try {
    await dbConnect()
    const { id } = req.query
    await User.findByIdAndDelete(id)
    res.status(204).end()          // No-Content (sucesso)
  } catch (err) {
    console.error('[DELETE user] ', err)
    res.status(500).json({ error: 'Falha ao excluir usuário' })
  }
}