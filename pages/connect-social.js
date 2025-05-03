// pages/connect-social.js
import { useEffect, useState } from 'react';
import { useSession, signIn } from 'next-auth/react';
import TwitchLogo               from '../components/icons/TwitchLogo';
import TwitterLogo              from '../components/icons/TwitterLogo';  // ← adicionado
import YouTubeLogo              from '../components/icons/YouTubeLogo';   // ← novo
import styles                   from '../styles/ConnectSocial.module.css';

export default function ConnectSocial() {
  const { data: session, status } = useSession();
  const [user, setUser]   = useState(null);
  const [loading, setLoading] = useState(true);

  // Se não logado, manda para login
  useEffect(() => {
    if (status === 'unauthenticated') window.location.href = '/login';
  }, [status]);

  // Busca perfil
  useEffect(() => {
    if (status !== 'authenticated') return;
    (async () => {
      const res = await fetch('/api/me', { credentials:'include' });
      const { user } = await res.json();
      setUser(user);
      setLoading(false);
    })();
  }, [status]);

  // inicia o fluxo OAuth da Twitch
  const connectTwitch = () =>
    signIn('twitch', { callbackUrl: '/connect-social' });

  // inicia o fluxo OAuth do Twitter
  const connectTwitter = () =>
    signIn('twitter', { callbackUrl: '/connect-social' });

  // inicia o fluxo OAuth do Google
  const connectYouTube = () =>
    signIn('google', { callbackUrl: '/connect-social' });

  const unlinkTwitch = async () => {
    await fetch('/api/social/unlink/twitch', { method:'DELETE' });
    const res = await fetch('/api/me', { credentials:'include' });
    const { user } = await res.json();
    setUser(user);
  };

  const unlinkTwitter = async () => {
    await fetch('/api/social/unlink/twitter', { method:'DELETE' });
    const res = await fetch('/api/me', { credentials:'include' });
    const { user } = await res.json();
    setUser(user);
  };

  const unlinkYouTube = async () => {
    await fetch('/api/social/unlink/youtube', { method:'DELETE' });
    const res = await fetch('/api/me', { credentials:'include' });
    const { user } = await res.json();
    setUser(user);
  };

  // estado de “carregando”
  if (status === 'loading' || loading)
    return <div className={styles.container}><div className={styles.card}><h1>Carregando…</h1></div></div>;

  // se o perfil não veio (req. 500/401 etc.)
  if (!user) {
    return (
      <div className={styles.container}>
        <div className={styles.card}>
          <h1>Falha ao carregar perfil</h1>
        </div>
      </div>
    )
  }

  const raw   = user.socialMedia?.twitch  ?? {}
  const rawTw = user.socialMedia?.twitter ?? {}
  const rawYt = user.socialMedia?.youtube ?? {}

  const twitch = {
    connected : raw.connected,
    username  : raw.username ?? raw.name,
    avatar    :
        raw.avatar
     ?? raw.image
     ?? raw.userData?.image
     ?? raw.userData?.profile_image_url
     ?? raw.userData?.picture
  };

  const twitter = {
    connected : !!rawTw.connected,
    // tenta raiz → userData.data → outros fallbacks
    username  :
        rawTw.username
     ?? rawTw.name
     ?? rawTw.userData?.data?.username        // v2
     ?? rawTw.userData?.username              // v1 “include_entities”
     ?? rawTw.userData?.screen_name
     ?? rawTw.userData?.name,                 // último recurso
    avatar    :
        rawTw.avatar
     ?? rawTw.image
     ?? rawTw.userData?.data?.profile_image_url
     ?? rawTw.userData?.profile_image_url
     ?? rawTw.userData?.profile_image_url_https
     ?? rawTw.userData?.image                // v1
     ?? rawTw.userData?.picture
  };

  const youtube = {
    connected : !!rawYt.connected,
    username  :
        rawYt.username
     ?? rawYt.name
     ?? rawYt.userData?.name,
    avatar    :
        rawYt.avatar
     ?? rawYt.image
     ?? rawYt.userData?.picture      // caso venha como “picture”
     ?? rawYt.userData?.image        // caso venha como “image”
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>Conecte suas Redes Sociais</h1>
        <div className={styles.socialGrid}>
          {/* TWITCH CARD */}
          <div className={styles.socialCard}>
            <div className={styles.avatarWrapper}>
              {twitch.connected && twitch.avatar ? (
                <img src={twitch.avatar} alt={twitch.username} className={styles.avatar}/>
              ) : (
                <TwitchLogo size={60} />
              )}
            </div>
            <h3>
              <TwitchLogo size={20} className={styles.logoInline} />
              Twitch
            </h3>
            <p>
              {twitch?.connected
                ? `@${twitch.username}`
                : 'Conecte sua conta para compartilhar streams que você assiste'}
            </p>
            {twitch?.connected ? (
              <button
                className={styles.unlinkButton}
                onClick={unlinkTwitch}
              >
                Desvincular Conta
              </button>
            ) : (
              <button
                className={styles.connectButton}
                onClick={connectTwitch}
                disabled={status !== 'authenticated'}
              >
                Conectar
              </button>
            )}
          </div>
          {/* TWITTER CARD */}
          <div className={styles.socialCard}>
            <div className={styles.avatarWrapper}>
              {twitter.connected && twitter.avatar ? (
                <img src={twitter.avatar} alt={twitter.username} className={styles.avatar}/>
              ) : (
                <TwitterLogo size={60} />
              )}
            </div>
            <h3>
              <TwitterLogo size={20} className={styles.logoInline} />
              Twitter
            </h3>
            <p>
              {twitter?.connected
                ? `@${twitter.username}`
                : 'Conecte para exibir seus últimos tweets'}
            </p>
            {twitter?.connected ? (
              <button
                className={styles.unlinkButton}
                onClick={unlinkTwitter}
              >
                Desvincular Conta
              </button>
            ) : (
              <button
                className={styles.connectButton}
                onClick={connectTwitter}
                disabled={status !== 'authenticated'}
              >
                Conectar
              </button>
            )}
          </div>
          {/* ────────── 🆕 YOUTUBE CARD ────────── */}
          <div className={styles.socialCard}>
            <div className={styles.avatarWrapper}>
              {youtube.connected && youtube.avatar ? (
                <img
                  src={youtube.avatar}
                  alt={youtube.username}
                  className={styles.avatar}
                />
              ) : (
                <YouTubeLogo size={60} />
              )}
            </div>
            <h3>
              <YouTubeLogo size={20} className={styles.logoInline} />
              YouTube
            </h3>
            <p>
              {youtube.connected
                ? `@${youtube.username}`
                : 'Conecte para exibir seu canal do YouTube'}
            </p>
            {youtube.connected ? (
              <button
                className={styles.unlinkButton}
                onClick={unlinkYouTube}
              >
                Desvincular Conta
              </button>
            ) : (
              <button
                className={styles.connectButton}
                onClick={connectYouTube}
                disabled={status !== 'authenticated'}
              >
                Conectar
              </button>
            )}
          </div>
          {/* Adicione outros cards de redes sociais aqui, se quiser */}
        </div>
      </div>
    </div>
  );
}