import dbConnect from '../../../lib/db'
import User from '../../../models/User'
import Account from '../../../models/Account'
import { getSession } from 'next-auth/react'

export default async function handler(req, res) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    await dbConnect()
    const session = await getSession({ req })
    
    if (!session) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    // Delete user's accounts (OAuth connections)
    await Account.deleteMany({ userId: session.user.id })
    
    // Delete the user
    await User.findByIdAndDelete(session.user.id)

    res.status(204).end()
  } catch (error) {
    console.error('Delete account error:', error)
    res.status(500).json({ error: 'Failed to delete account' })
  }
}