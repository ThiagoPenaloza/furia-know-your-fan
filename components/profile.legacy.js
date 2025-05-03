// pages/profile.js
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import styles from '../styles/Profile.module.css';

export default function Profile() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Enquanto a sessão estiver carregando
  if (status === 'loading') {
    return <p>Carregando...</p>;
  }

  // Se não tiver sessão, redireciona pro login
  if (!session) {
    if (typeof window !== 'undefined') {
      router.replace('/login');
    }
    return null;
  }

  // Já com session.user disponível
  const user = session.user; // { id, name, email, ... }

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    router.push('/login');
  };

  useEffect(() => {
    fetch('/api/me')
      .then(res => res.json())
      .then(data => setUserData(data))
  }, []);

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
          <button 
            className={styles.button}
            onClick={() => router.reload()}
          >
            Tentar novamente
          </button>
          <Link href="/login" className={styles.link}>
            Voltar para o Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>Perfil do Fã</h1>
        
        {user && (
          <div className={styles.profileContent}>
            <div className={styles.section}>
              <h2>Informações Pessoais</h2>
              <div className={styles.infoGrid}>
                <div className={styles.infoItem}>
                  <span className={styles.label}>Nome:</span>
                  <span className={styles.value}>{user.name}</span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.label}>Email:</span>
                  <span className={styles.value}>{user.email}</span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.label}>CPF:</span>
                  <span className={styles.value}>{user.cpf}</span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.label}>Telefone:</span>
                  <span className={styles.value}>{user.phone}</span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.label}>Data de Nascimento:</span>
                  <span className={styles.value}>
                    {new Date(user.birthDate).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              </div>
            </div>
            
            <div className={styles.section}>
              <h2>Endereço</h2>
              <div className={styles.infoGrid}>
                <div className={styles.infoItem}>
                  <span className={styles.label}>Rua:</span>
                  <span className={styles.value}>{user.address.street}</span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.label}>Número:</span>
                  <span className={styles.value}>{user.address.number}</span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.label}>Complemento:</span>
                  <span className={styles.value}>{user.address.complement || '-'}</span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.label}>Bairro:</span>
                  <span className={styles.value}>{user.address.neighborhood}</span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.label}>Cidade:</span>
                  <span className={styles.value}>{user.address.city}</span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.label}>Estado:</span>
                  <span className={styles.value}>{user.address.state}</span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.label}>CEP:</span>
                  <span className={styles.value}>{user.address.zipCode}</span>
                </div>
              </div>
            </div>
            
            <div className={styles.section}>
              <h2>Interesses</h2>
              <div className={styles.interestsGrid}>
                <div className={styles.interestItem}>
                  <h3>Jogos Favoritos</h3>
                  <ul className={styles.tagList}>
                    {user.favoriteGames && user.favoriteGames.length > 0 ? (
                      user.favoriteGames.map((game, index) => (
                        <li key={index} className={styles.tag}>{game}</li>
                      ))
                    ) : (
                      <li className={styles.emptyMessage}>Nenhum jogo informado</li>
                    )}
                  </ul>
                </div>
                
                <div className={styles.interestItem}>
                  <h3>Times Favoritos</h3>
                  <ul className={styles.tagList}>
                    {user.favoriteTeams && user.favoriteTeams.length > 0 ? (
                      user.favoriteTeams.map((team, index) => (
                        <li key={index} className={styles.tag}>{team}</li>
                      ))
                    ) : (
                      <li className={styles.emptyMessage}>Nenhum time informado</li>
                    )}
                  </ul>
                </div>
                
                <div className={styles.interestItem}>
                  <h3>Jogadores Favoritos</h3>
                  <ul className={styles.tagList}>
                    {user.favoritePlayers && user.favoritePlayers.length > 0 ? (
                      user.favoritePlayers.map((player, index) => (
                        <li key={index} className={styles.tag}>{player}</li>
                      ))
                    ) : (
                      <li className={styles.emptyMessage}>Nenhum jogador informado</li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
            
            <div className={styles.buttonGroup}>
              <Link href={`/connect-social?token=${token}&userId=${userId}`} className={styles.button}>
                Conectar Redes Sociais
              </Link>
              <button 
                className={styles.logoutButton}
                onClick={handleLogout}
              >
                Sair
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
