// pages/profile.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import styles from '../styles/Profile.module.css';

export default function Profile() {
  const router = useRouter();
  const { userId, token } = router.query;
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId || !token) return;

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
          <Link href="/">
            <a className={styles.button}>Voltar para a Página Inicial</a>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>Perfil do Fã FURIA</h1>
        
        <div className={styles.profileHeader}>
          <div className={styles.profilePic}>
            {user?.name?.charAt(0) || '?'}
          </div>
          <div className={styles.profileInfo}>
            <h2>{user?.name}</h2>
            <p>{user?.email}</p>
            <p>Membro desde: {new Date(user?.createdAt).toLocaleDateString('pt-BR')}</p>
          </div>
        </div>
        
        <div className={styles.section}>
          <h3>Informações Pessoais</h3>
          <div className={styles.infoGrid}>
            <div className={styles.infoItem}>
              <span className={styles.label}>Nome:</span>
              <span>{user?.name}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.label}>Email:</span>
              <span>{user?.email}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.label}>Telefone:</span>
              <span>{user?.phone}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.label}>Data de Nascimento:</span>
              <span>{new Date(user?.birthDate).toLocaleDateString('pt-BR')}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.label}>Endereço:</span>
              <span>
                {user?.address?.street}, {user?.address?.number}, {user?.address?.neighborhood}, 
                {user?.address?.city} - {user?.address?.state}
              </span>
            </div>
          </div>
        </div>
        
        <div className={styles.section}>
          <h3>Interesses em Esports</h3>
          <div className={styles.interestTags}>
            {user?.favoriteGames?.map((game, index) => (
              <span key={`game-${index}`} className={styles.tag}>{game}</span>
            ))}
            {user?.favoriteTeams?.map((team, index) => (
              <span key={`team-${index}`} className={styles.tag}>{team}</span>
            ))}
            {user?.favoritePlayers?.map((player, index) => (
              <span key={`player-${index}`} className={styles.tag}>{player}</span>
            ))}
          </div>
        </div>
        
        <div className={styles.section}>
          <h3>Redes Sociais Conectadas</h3>
          <div className={styles.socialGrid}>
            <div className={`${styles.socialItem} ${user?.socialMedia?.instagram?.connected ? styles.connected : ''}`}>
              <img src="/images/instagram-icon.png" alt="Instagram" />
              <span>{user?.socialMedia?.instagram?.connected ? 'Conectado' : 'Não conectado'}</span>
            </div>
            <div className={`${styles.socialItem} ${user?.socialMedia?.twitter?.connected ? styles.connected : ''}`}>
              <img src="/images/twitter-icon.png" alt="Twitter" />
              <span>{user?.socialMedia?.twitter?.connected ? 'Conectado' : 'Não conectado'}</span>
            </div>
            <div className={`${styles.socialItem} ${user?.socialMedia?.facebook?.connected ? styles.connected : ''}`}>
              <img src="/images/facebook-icon.png" alt="Facebook" />
              <span>{user?.socialMedia?.facebook?.connected ? 'Conectado' : 'Não conectado'}</span>
            </div>
            <div className={`${styles.socialItem} ${user?.socialMedia?.twitch?.connected ? styles.connected : ''}`}>
              <img src="/images/twitch-icon.png" alt="Twitch" />
              <span>{user?.socialMedia?.twitch?.connected ? 'Conectado' : 'Não conectado'}</span>
            </div>
            <div className={`${styles.socialItem} ${user?.socialMedia?.youtube?.connected ? styles.connected : ''}`}>
              <img src="/images/youtube-icon.png" alt="YouTube" />
              <span>{user?.socialMedia?.youtube?.connected ? 'Conectado' : 'Não conectado'}</span>
            </div>
          </div>
          
          <div className={styles.buttonGroup}>
            <Link href={`/connect-social?token=${token}&userId=${userId}`}>
              <a className={styles.button}>Gerenciar Conexões</a>
            </Link>
          </div>
        </div>
        
        <div className={styles.buttonGroup}>
          <Link href="/">
            <a className={styles.secondaryButton}>Voltar para a Página Inicial</a>
          </Link>
        </div>
      </div>
    </div>
  );
}