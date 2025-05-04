import { getServerSession }   from 'next-auth/next'
import { authOptions }        from '../../auth/[...nextauth]'
import dbConnect              from '../../../../lib/db'
import User                   from '../../../../models/User'
import Account                from '../../../../models/Account'

const TWITTER_FURIA_ID = process.env.TWITTER_FURIA_ID   // ex.: 38008005
const TWITCH_FURIA_ID  = process.env.TWITCH_FURIA_ID    // ex.: 4883660

export default async function handler (req, res) {
  if (req.method !== 'POST')
    return res.status(405).json({ error:'Method not allowed' })

  const session = await getServerSession(req, res, authOptions)
  if (!session) return res.status(401).json({ error:'Não autenticado' })

  const { platform } = req.query
  if (!['twitter','twitch'].includes(platform))
    return res.status(400).json({ error:'Plataforma inválida' })

  await dbConnect()

  /* ---------- usuário + conta ---------- */
  const user = await User.findById(session.user.id)
  if (!user) return res.status(404).json({ error:'Usuário não encontrado' })

  const account = await Account.findOne({
    provider: platform, userId: user._id
  })
  if (!account)
    return res.status(400).json({ error:`Conta ${platform} não vinculada` })

  /* ---------- consulta API ---------- */
  let followsFuria = false

  /* ===== Twitter ===== */
  if (platform === 'twitter') {
    const r = await fetch(
      `https://api.twitter.com/2/users/${account.providerAccountId}/following`+
      `?target_user_id=${TWITTER_FURIA_ID}`,
      { headers:{ Authorization:`Bearer ${account.access_token}` } }
    )
    if (!r.ok) return res.status(r.status).json({ error:'Falha na API Twitter' })
    const data = await r.json()
    followsFuria = !!data?.data?.following
  }

  /* ===== Twitch ===== */
  if (platform === 'twitch') {
    const r = await fetch(
      `https://api.twitch.tv/helix/users/follows?from_id=${account.providerAccountId}`+
      `&to_id=${TWITCH_FURIA_ID}`,
      {
        headers: {
          'Client-ID'   : process.env.TWITCH_CLIENT_ID,
          Authorization : `Bearer ${account.access_token}`
        }
      }
    )
    if (!r.ok) return res.status(r.status).json({ error:'Falha na API Twitch' })
    const data = await r.json()
    followsFuria = (data.total ?? 0) > 0
  }

  /* ---------- grava em users.socialMedia.xxx.extra ---------- */
  user.socialMedia[platform] = {
    ...user.socialMedia[platform],
    extra: {
      ...(user.socialMedia[platform]?.extra || {}),
      followsFuria,
      lastSync: new Date()
    }
  }
  await user.save()

  res.json({ success:true, followsFuria })
}