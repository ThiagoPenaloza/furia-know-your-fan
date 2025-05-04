// pages/connect-social.js
import { useEffect, useState, useRef } from 'react'
import { useSession, signIn }  from 'next-auth/react'

import TwitchLogo   from '../components/icons/TwitchLogo'
import TwitterLogo  from '../components/icons/TwitterLogo'
import YouTubeLogo  from '../components/icons/YouTubeLogo'

import styles       from '../styles/ConnectSocial.module.css'
import { NavBarLoggedIn } from "@/components/ui/NavBarLoggedIn";
import AnimatedBackground from "@/components/ui/AnimatedBackground"; // <-- IMPORTANTE

export default function ConnectSocial() {
  /* ===== estado & sessão ===== */
  const { status }       = useSession()
  const [user, setUser]  = useState(null)
  const [loading, setLoading]   = useState(true)
  const [syncing, setSyncing]   = useState(null)        // 'twitch' | 'twitter' | 'youtube'
  const [cardsVisible, setCardsVisible] = useState(false)

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

  // Trigger animation when user data is loaded
  useEffect(() => {
    if (!loading && user) {
      setCardsVisible(true)
    }
  }, [loading, user])

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
      <>
        <NavBarLoggedIn />
        <AnimatedBackground />
        <div className={styles.container}>
          <div className={styles.card}><h1>Carregando…</h1></div>
        </div>
      </>
    )

  if (!user)
    return (
      <>
        <NavBarLoggedIn />
        <AnimatedBackground />
        <div className={styles.container}>
          <div className={styles.card}><h1>Falha ao carregar perfil</h1></div>
        </div>
      </>
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
  const Card = ({ plat, data, Logo, animate }) => {
    // Pick per-network accent class
    const platClass =
      plat === "twitch"
        ? styles.twitchCard
        : plat === "twitter"
        ? styles.twitterCard
        : styles.youtubeCard;

    // Animation state for unlink
    const [disconnecting, setDisconnecting] = useState(false);
    const prevConnected = useRef(data.connected);

    // When user clicks unlink, trigger animation before actually unlinking
    const handleUnlink = async () => {
      setDisconnecting(true);
      setTimeout(async () => {
        await unlink(plat);
        setDisconnecting(false);
      }, 420); // match CSS transition duration
    };

    // If connection state changes from true to false (external unlink), reset animation
    useEffect(() => {
      if (prevConnected.current && !data.connected) {
        setDisconnecting(false);
      }
      prevConnected.current = data.connected;
    }, [data.connected]);

    return (
      <div className={`${styles.socialCard} ${platClass} ${animate ? styles.fadeInSocial : ""}`}>
        <div className={styles.socialCardHeader}>
          {data.connected && (
            <span className={styles.logoIcon}>
              <Logo size={38} />
            </span>
          )}
          <h3>
            {plat === "twitch"
              ? "Twitch"
              : plat === "twitter"
              ? "Twitter"
              : "YouTube"}
          </h3>
        </div>

        <div className={styles.avatarWrapper} style={{ position: "relative" }}>
          {/* Only animate if disconnecting, otherwise just switch instantly */}
          {data.connected || disconnecting ? (
            <img
              src={data.avatar}
              alt={data.username}
              className={`${styles.avatar} ${
                data.connected && !disconnecting
                  ? styles.avatarVisible
                  : styles.avatarHidden
              }`}
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                width: "100%",
                height: "100%",
                zIndex: 2,
                pointerEvents: "none",
              }}
            />
          ) : null}
          {/* Show icon in avatar area only if not connected */}
          {(!data.connected || disconnecting) && (
            <span
              className={`${styles.logoIcon} ${
                !data.connected || disconnecting
                  ? styles.iconVisible
                  : styles.iconHidden
              }`}
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                width: "100%",
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 1,
                pointerEvents: "none",
              }}
            >
              <Logo size={38} />
            </span>
          )}
        </div>

        <p>
          {data.connected
            ? `@${data.username}`
            : "Conecte para exibir suas atividades"}
        </p>

        {/* mostra segue/não‐segue apenas se já sincronizado */}
        {data.connected && data.follows !== undefined && (
          <p className={data.follows ? styles.good : styles.bad}>
            {data.follows ? "Segue a FURIA 🎉" : "Não segue a FURIA"}
          </p>
        )}

        {data.connected ? (
          <button
            className={styles.unlinkButton}
            onClick={handleUnlink}
            disabled={disconnecting}
          >
            Desvincular
          </button>
        ) : (
          <button
            className={styles.connectButton}
            onClick={connect[plat]}
            disabled={status !== "authenticated"}
          >
            Conectar
          </button>
        )}
      </div>
    );
  };

  /* ===== render ===== */
  return (
    <>
      <NavBarLoggedIn />
      <AnimatedBackground />
      <div className={styles.container}>
        <div className={styles.card}>
          <h1 className={styles.title}>Conecte suas Redes Sociais</h1>

          <div className={styles.socialGrid}>
            <Card plat="twitch" data={twitch} Logo={TwitchLogo} animate={cardsVisible} />
            <Card plat="twitter" data={twitter} Logo={TwitterLogo} animate={cardsVisible} />
            <Card plat="youtube" data={youtube} Logo={YouTubeLogo} animate={cardsVisible} />
          </div>
        </div>
      </div>
    </>
  );
}
