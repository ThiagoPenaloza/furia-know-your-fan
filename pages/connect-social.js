// pages/connect-social.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import styles from '../styles/ConnectSocial.module.css';

export default function ConnectSocial() {
  const router = useRouter();
  const { token, userId } = router.query;
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!token || !userId) return;

    async function fetchUserData() {
      try {
        const response = await fetch(`/api/user/${userId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch user data');
        }
        
        const userData = await response.json();
        setUser(userData);
      } catch (err) {
        setError('Não foi possível carregar seus dados. Por favor, tente novamente.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchUserData();
  }, [token, userId]);

  const connectSocialMedia = (platform) => {
    // Save current URL to return after OAuth flow
    localStorage.setItem('returnUrl', window.location.href);
    
    // Redirect to the appropriate OAuth endpoint
    window.location.href = `/api/auth/${platform}?userId=${userId}&token=${token}`;
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.card}>
          <h1>Carregando...</h1>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.card}>
          <h1>Erro</h1>
          <p>{error}</p>
          <Link href="/" className={styles.button}>
            Voltar para a Página Inicial
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>Conecte suas Redes Sociais</h1>
        <p className={styles.subtitle}>
          Conectar suas redes sociais nos ajuda a personalizar sua experiência e 
          analisar seu perfil como fã de esports.
        </p>

        <div className={styles.socialGrid}>
          <div className={styles.socialCard}>
            <div className={styles.socialIcon}>
              <img src="/images/instagram-icon.png" alt="Instagram" />
            </div>
            <h3>Instagram</h3>
            <p>Conecte para compartilhar suas fotos e interações com a FURIA</p>
            <button 
              className={`${styles.connectButton} ${user?.socialMedia?.instagram?.connected ? styles.connected : ''}`}
              onClick={() => connectSocialMedia('instagram')}
              disabled={user?.socialMedia?.instagram?.connected}
            >
              {user?.socialMedia?.instagram?.connected ? 'Conectado' : 'Conectar'}
            </button>

          </div>

          <div className={styles.socialCard}>
            <div className={styles.socialIcon}>
              <img src="/images/twitter-icon.png" alt="Twitter" />
            </div>
            <h3>Twitter</h3>
            <p>Compartilhe seus tweets e interações sobre esports</p>
            <button 
              className={`${styles.connectButton} ${user?.socialMedia?.twitter?.connected ? styles.connected : ''}`}
              onClick={() => connectSocialMedia('twitter')}
              disabled={user?.socialMedia?.twitter?.connected}
            >
              {user?.socialMedia?.twitter?.connected ? 'Conectado' : 'Conectar'}
            </button>
          </div>
          <div className={styles.socialCard}>
            <div className={styles.socialIcon}>
              <img src="/images/twitch-icon.png" alt="Twitch" />
            </div>
            <h3>Twitch</h3>
            <p>Conecte sua conta para compartilhar streams que você assiste</p>
            <button 
              className={`${styles.connectButton} ${user?.socialMedia?.twitch?.connected ? styles.connected : ''}`}
              onClick={() => connectSocialMedia('twitch')}
              disabled={user?.socialMedia?.twitch?.connected}
            >
              {user?.socialMedia?.twitch?.connected ? 'Conectado' : 'Conectar'}
            </button>
          </div>

          <div className={styles.socialCard}>
        <div className={styles.socialIcon}>
            <img src="/images/youtube-icon.png" alt="YouTube" />
        </div>
        <h3>YouTube</h3>
        <p>Compartilhe seus vídeos favoritos e canais que você segue</p>
        <button 
            className={`${styles.connectButton} ${user?.socialMedia?.youtube?.connected ? styles.connected : ''}`}
            onClick={() => connectSocialMedia('youtube')}
            disabled={user?.socialMedia?.youtube?.connected}
        >
            {user?.socialMedia?.youtube?.connected ? 'Conectado' : 'Conectar'}
        </button>
        </div>

        <div className={styles.socialCard}>
        <div className={styles.socialIcon}>
            <img src="/images/facebook-icon.png" alt="Facebook" />
        </div>
        <h3>Facebook</h3>
        <p>Conecte para analisar páginas e grupos de esports que você segue</p>
        <button 
            className={`${styles.connectButton} ${user?.socialMedia?.facebook?.connected ? styles.connected : ''}`}
            onClick={() => connectSocialMedia('facebook')}
            disabled={user?.socialMedia?.facebook?.connected}
        >
            {user?.socialMedia?.facebook?.connected ? 'Conectado' : 'Conectar'}
        </button>
        </div>
        </div>

        <div className={styles.infoBox}>
          <h3>O que acontece quando você conecta suas redes sociais?</h3>
          <ul>
            <li>Analisamos suas interações relacionadas a esports e FURIA</li>
            <li>Identificamos suas preferências para personalizar sua experiência</li>
            <li>Você pode receber conteúdo exclusivo baseado em seus interesses</li>
            <li>Suas informações são tratadas com segurança e privacidade</li>
          </ul>
        </div>

        <div className={styles.buttonGroup}>
          <Link href={`/dashboard?token=${token}&userId=${userId}`} className={styles.skipButton}>
            Pular por enquanto
          </Link>
          <Link href={`/dashboard?token=${token}&userId=${userId}`} className={styles.continueButton}>
            Continuar para o Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}