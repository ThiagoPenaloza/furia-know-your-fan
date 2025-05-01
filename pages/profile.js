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
          <Link href="/" className='{styles.button'>
            Voltar para a Página Inicial
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
              <span className={styles.label}>CPF:</span>
              <span>{user?.cpf}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.label}>Telefone:</span>
              <span>{user?.phone}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.label}>Data de Nascimento:</span>
              <span>{user?.birthDate ? new Date(user.birthDate).toLocaleDateString('pt-BR') : ''}</span>
            </div>
          </div>
        </div>
        
        <div className={styles.section}>
          <h3>Endereço</h3>
          <div className={styles.infoGrid}>
            <div className={styles.infoItem}>
              <span className={styles.label}>Rua:</span>
              <span>{user?.address?.street}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.label}>Número:</span>
              <span>{user?.address?.number}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.label}>Complemento:</span>
              <span>{user?.address?.complement || '-'}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.label}>Bairro:</span>
              <span>{user?.address?.neighborhood}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.label}>Cidade:</span>
              <span>{user?.address?.city}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.label}>Estado:</span>
              <span>{user?.address?.state}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.label}>CEP:</span>
              <span>{user?.address?.zipCode}</span>
            </div>
          </div>
        </div>
        
        <div className={styles.section}>
          <h3>Interesses em Esports</h3>
          
          <div className={styles.interestGroup}>
            <h4>Jogos Favoritos</h4>
            <div className={styles.interestTags}>
              {user?.favoriteGames && user.favoriteGames.length > 0 ? (
                user.favoriteGames.map((game, index) => (
                  <span key={`game-${index}`} className={styles.tag}>{game}</span>
                ))
              ) : (
                <span className={styles.emptyMessage}>Nenhum jogo favorito informado</span>
              )}
            </div>
          </div>
          
          <div className={styles.interestGroup}>
            <h4>Times Favoritos</h4>
            <div className={styles.interestTags}>
              {user?.favoriteTeams && user.favoriteTeams.length > 0 ? (
                user.favoriteTeams.map((team, index) => (
                  <span key={`team-${index}`} className={styles.tag}>{team}</span>
                ))
              ) : (
                <span className={styles.emptyMessage}>Nenhum time favorito informado</span>
              )}
            </div>
          </div>
          
          <div className={styles.interestGroup}>
            <h4>Jogadores Favoritos</h4>
            <div className={styles.interestTags}>
              {user?.favoritePlayers && user.favoritePlayers.length > 0 ? (
                user.favoritePlayers.map((player, index) => (
                  <span key={`player-${index}`} className={styles.tag}>{player}</span>
                ))
              ) : (
                <span className={styles.emptyMessage}>Nenhum jogador favorito informado</span>
              )}
            </div>
          </div>
          
          <div className={styles.interestGroup}>
            <h4>Eventos que Participou</h4>
            <div className={styles.interestTags}>
              {user?.attendedEvents && user.attendedEvents.length > 0 ? (
                user.attendedEvents.map((event, index) => (
                  <span key={`event-${index}`} className={styles.tag}>{event}</span>
                ))
              ) : (
                <span className={styles.emptyMessage}>Nenhum evento informado</span>
              )}
            </div>
          </div>
          
          <div className={styles.interestGroup}>
            <h4>Produtos que Comprou</h4>
            <div className={styles.interestTags}>
              {user?.purchasedMerchandise && user.purchasedMerchandise.length > 0 ? (
                user.purchasedMerchandise.map((item, index) => (
                  <span key={`item-${index}`} className={styles.tag}>{item}</span>
                ))
              ) : (
                <span className={styles.emptyMessage}>Nenhum produto informado</span>
              )}
            </div>
          </div>
        </div>
        
        <div className={styles.section}>
          <h3>Perfis de Jogos</h3>
          <div className={styles.gamingProfiles}>
            <div className={styles.profileItem}>
              <img src="/images/steam-icon.png" alt="Steam" className={styles.gameIcon} />
              <div className={styles.profileDetails}>
                <span className={styles.profileLabel}>Steam</span>
                <span className={styles.profileValue}>{user?.gamingProfiles?.steam || 'Não informado'}</span>
              </div>
            </div>
            
            <div className={styles.profileItem}>
              <img src="/images/epic-icon.png" alt="Epic Games" className={styles.gameIcon} />
              <div className={styles.profileDetails}>
                <span className={styles.profileLabel}>Epic Games</span>
                <span className={styles.profileValue}>{user?.gamingProfiles?.epic || 'Não informado'}</span>
              </div>
            </div>
            
            <div className={styles.profileItem}>
              <img src="/images/battlenet-icon.png" alt="Battle.net" className={styles.gameIcon} />
              <div className={styles.profileDetails}>
                <span className={styles.profileLabel}>Battle.net</span>
                <span className={styles.profileValue}>{user?.gamingProfiles?.battleNet || 'Não informado'}</span>
              </div>
            </div>
            
            <div className={styles.profileItem}>
              <img src="/images/riot-icon.png" alt="Riot Games" className={styles.gameIcon} />
              <div className={styles.profileDetails}>
                <span className={styles.profileLabel}>Riot Games</span>
                <span className={styles.profileValue}>{user?.gamingProfiles?.riotGames || 'Não informado'}</span>
              </div>
            </div>
            
            <div className={styles.profileItem}>
              <img src="/images/origin-icon.png" alt="Origin" className={styles.gameIcon} />
              <div className={styles.profileDetails}>
                <span className={styles.profileLabel}>Origin</span>
                <span className={styles.profileValue}>{user?.gamingProfiles?.origin || 'Não informado'}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className={styles.section}>
          <h3>Redes Sociais</h3>
          <div className={styles.socialGrid}>
            <div className={`${styles.socialItem} ${user?.socialMedia?.instagram?.connected ? styles.connected : ''}`}>
              <img src="/images/instagram-icon.png" alt="Instagram" />
              <span className={styles.socialLabel}>Instagram</span>
              <span className={styles.socialStatus}>
                {user?.socialMedia?.instagram?.connected ? 'Conectado' : 'Não conectado'}
              </span>
              <span className={styles.socialUsername}>
                {user?.socialMedia?.instagram?.username || '-'}
              </span>
            </div>
            
            <div className={`${styles.socialItem} ${user?.socialMedia?.twitter?.connected ? styles.connected : ''}`}>
              <img src="/images/twitter-icon.png" alt="Twitter" />
              <span className={styles.socialLabel}>Twitter</span>
              <span className={styles.socialStatus}>
                {user?.socialMedia?.twitter?.connected ? 'Conectado' : 'Não conectado'}
              </span>
              <span className={styles.socialUsername}>
                {user?.socialMedia?.twitter?.username || '-'}
              </span>
            </div>
            
            <div className={`${styles.socialItem} ${user?.socialMedia?.facebook?.connected ? styles.connected : ''}`}>
              <img src="/images/facebook-icon.png" alt="Facebook" />
              <span className={styles.socialLabel}>Facebook</span>
              <span className={styles.socialStatus}>
                {user?.socialMedia?.facebook?.connected ? 'Conectado' : 'Não conectado'}
              </span>
              <span className={styles.socialUsername}>
                {user?.socialMedia?.facebook?.username || '-'}
              </span>
            </div>
            
            <div className={`${styles.socialItem} ${user?.socialMedia?.twitch?.connected ? styles.connected : ''}`}>
              <img src="/images/twitch-icon.png" alt="Twitch" />
              <span className={styles.socialLabel}>Twitch</span>
              <span className={styles.socialStatus}>
                {user?.socialMedia?.twitch?.connected ? 'Conectado' : 'Não conectado'}
              </span>
              <span className={styles.socialUsername}>
                {user?.socialMedia?.twitch?.username || '-'}
              </span>
            </div>
            
            <div className={`${styles.socialItem} ${user?.socialMedia?.youtube?.connected ? styles.connected : ''}`}>
              <img src="/images/youtube-icon.png" alt="YouTube" />
              <span className={styles.socialLabel}>YouTube</span>
              <span className={styles.socialStatus}>
                {user?.socialMedia?.youtube?.connected ? 'Conectado' : 'Não conectado'}
              </span>
              <span className={styles.socialUsername}>
                {user?.socialMedia?.youtube?.username || '-'}
              </span>
            </div>
          </div>
          
          <div className={styles.buttonGroup}>
            <Link href={`/connect-social?token=${token}&userId=${userId}`} className={styles.button}>
              Conectar Redes Sociais
            </Link>
          </div>
        </div>
        
        <div className={styles.section}>
          <h3>Documentos</h3>
          <div className={styles.documentsGrid}>
            <div className={styles.documentItem}>
              <div className={styles.documentIcon}>
                <img src="/images/id-icon.png" alt="Documento de Identidade" />
              </div>
              <div className={styles.documentInfo}>
                <h4>Documento de Identidade</h4>
                <p className={styles.documentStatus}>
                  Status: {user?.documents?.idDocument?.verified ? 
                    <span className={styles.verified}>Verificado</span> : 
                    <span className={styles.pending}>Pendente</span>
                  }
                </p>
              </div>
            </div>
            
            <div className={styles.documentItem}>
              <div className={styles.documentIcon}>
                <img src="/images/selfie-icon.png" alt="Selfie" />
              </div>
              <div className={styles.documentInfo}>
                <h4>Selfie</h4>
                <p className={styles.documentStatus}>
                  Status: {user?.documents?.selfie?.verified ? 
                    <span className={styles.verified}>Verificado</span> : 
                    <span className={styles.pending}>Pendente</span>
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div className={styles.buttonGroup}>
          <Link href="/" className={styles.secondaryButton}>
            Voltar para a Página Inicial
          </Link>
          <Link href={`/connect-social?token=${token}&userId=${userId}`} className={styles.button}>
            Conectar Redes Sociais
          </Link>
        </div>
      </div>
    </div>
  );
}
