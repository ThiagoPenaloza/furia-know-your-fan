// pages/connect-social.js
import { useEffect, useState } from 'react'
import { useSession, signIn }  from 'next-auth/react'

import TwitchLogo   from '../components/icons/TwitchLogo'
import TwitterLogo  from '../components/icons/TwitterLogo'
import YouTubeLogo  from '../components/icons/YouTubeLogo'

import styles       from '../styles/ConnectSocial.module.css'

export default function ConnectSocial() {
  /* ===== estado & sessão ===== */
  const { status }       = useSession()
  const [user, setUser]  = useState(null)
  const [loading, setLoading]   = useState(true)
  const [syncing, setSyncing]   = useState(null)        // 'twitch' | 'twitter' | 'youtube'

  /* ===== redireciona se não logado ===== */
  useEffect(() => {
    if (status === 'unauthenticated') window.location.href = '/login'
  }, [status])

  /* ===== carrega perfil (/api/me) ===== */
  const fetchProfile = async () => {
    const r = await fetch('/api/me', { credentials:'include' })
    const { user } = await r.json()
    setUser(user)
  }
  useEffect(() => {
    if (status !== 'authenticated') return
    fetchProfile().finally(() => setLoading(false))
  }, [status])

  /* ===== ações ===== */
  const connect = {
    twitch : () => signIn('twitch',  { callbackUrl:'/connect-social' }),
    twitter: () => signIn('twitter', { callbackUrl:'/connect-social' }),
    youtube: () => signIn('google',  { callbackUrl:'/connect-social' })
  }

  const unlink = async (plat) => {
    await fetch(`/api/social/unlink/${plat}`, { method:'DELETE' })
    fetchProfile()
  }

  const syncNow = async (plat) => {
    setSyncing(plat)
    try {
      await fetch(`/api/social/sync/${plat}`, { method:'POST' })
      await fetchProfile()
    } finally { setSyncing(null) }
  }

  /* ===== loading / erro ===== */
  if (status === 'loading' || loading)
    return (
      <div className={styles.container}>
        <div className={styles.card}><h1>Carregando…</h1></div>
      </div>
    )

  if (!user)
    return (
      <div className={styles.container}>
        <div className={styles.card}><h1>Falha ao carregar perfil</h1></div>
      </div>
    )

  /* ===== helper p/ montar dados de cada rede ===== */
  const pick = (plat) => {
    const raw = user.socialMedia?.[plat] ?? {}

    /* username fallbacks */
    const username =
          raw.username
       ?? raw.name
       ?? raw.userData?.data?.username          // twitter v2
       ?? raw.userData?.username                // twitter v1 “include_entities”
       ?? raw.userData?.screen_name
       ?? raw.userData?.preferred_username      // twitch
       ?? raw.userData?.name
       ?? null

    /* avatar fallbacks */
    const avatar =
          raw.avatar
       ?? raw.image
       ?? raw.picture
       ?? raw.userData?.data?.profile_image_url
       ?? raw.userData?.profile_image_url
       ?? raw.userData?.profile_image_url_https
       ?? raw.userData?.image
       ?? raw.userData?.picture
       ?? null

    return {
      connected : !!raw.connected,
      username,
      avatar,
      follows   : raw.extra?.followsFuria       // pode vir undefined
    }
  }

  const twitch  = pick('twitch')
  const twitter = pick('twitter')
  const youtube = pick('youtube')

  /* ===== componente Card ===== */
  const Card = ({ plat, data, Logo }) => (
    <div className={styles.socialCard}>

      {/* ícone de sync (só se conectado) */}
      {data.connected && (
        <button
          className={styles.refreshButton}
          title="Sincronizar agora"
          onClick={() => syncNow(plat)}
          disabled={syncing === plat}
        >
          🔄
        </button>
      )}

      {/* avatar ou logo */}
      <div className={styles.avatarWrapper}>
        {data.connected && data.avatar
          ? <img src={data.avatar} alt={data.username} className={styles.avatar}/>
          : <Logo size={60} /> }
      </div>

      <h3>
        <Logo size={20} className={styles.logoInline}/>
        {plat === 'twitch' ? 'Twitch' : plat === 'twitter' ? 'Twitter' : 'YouTube'}
      </h3>

      <p>{data.connected ? `@${data.username}` : 'Conecte para exibir suas atividades'}</p>

      {/* mostra segue/não‐segue apenas se já sincronizado */}
      {data.connected && data.follows !== undefined && (
        <p className={data.follows ? styles.good : styles.bad}>
          {data.follows ? 'Segue a FURIA 🎉' : 'Não segue a FURIA'}
        </p>
      )}

      {data.connected ? (
        <button
          className={styles.unlinkButton}
          onClick={() => unlink(plat)}
        >
          Desvincular
        </button>
      ) : (
        <button
          className={styles.connectButton}
          onClick={connect[plat]}
          disabled={status !== 'authenticated'}
        >
          Conectar
        </button>
      )}
    </div>
  )

  /* ===== render ===== */
  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>Conecte suas Redes Sociais</h1>

        <div className={styles.socialGrid}>
          <Card plat="twitch"  data={twitch}  Logo={TwitchLogo}  />
          <Card plat="twitter" data={twitter} Logo={TwitterLogo} />
          <Card plat="youtube" data={youtube} Logo={YouTubeLogo} />
        </div>
      </div>
    </div>
  )
}