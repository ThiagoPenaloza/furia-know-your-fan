import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { NavBarLoggedIn } from "@/components/ui/NavBarLoggedIn";
import styles from '../styles/GamingProfiles.module.css';

export default function GamingProfiles() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [profiles, setProfiles] = useState([]);

  // Redirecionar se não estiver autenticado
  useEffect(() => {
    if (status === 'unauthenticated') router.replace('/login');
  }, [status, router]);

  // Carregar perfis existentes
  useEffect(() => {
    if (status === 'authenticated') {
      // Verificar se há dados em cache e e são recentes (menos de 30 segundos)
      const cachedData = localStorage.getItem('profilesCache');
      const cacheTimestamp = localStorage.getItem('profilesCacheTime');
      const now = Date.now();
    
      if (cachedData && cacheTimestamp && (now - parseInt(cacheTimestamp)) < 30000) {
        // Usar dados do cache
        setProfiles(JSON.parse(cachedData));
        return;
      }
    
      // Se não houver cache ou estiver expirado, buscar da API
      fetch('/api/profiles/list')
        .then(res => res.json())
        .then(data => {
          if (data.profiles) {
            setProfiles(data.profiles);
            // Armazenar em cache
            localStorage.setItem('profilesCache', JSON.stringify(data.profiles));
            localStorage.setItem('profilesCacheTime', now.toString());
          }
        })
        .catch(err => console.error('Erro ao carregar perfis:', err));
    }
  }, [status]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    
    try {
      const res = await fetch('/api/profiles/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setProfiles([...profiles, data.profile]);
        setUrl('');
        setMessage({ type: 'success', text: data.message || 'Perfil validado e adicionado com sucesso!' });
      } else {
        setMessage({ type: 'error', text: data.error || 'Erro ao validar perfil' });
      }
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'Erro de conexão' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (profileId) => {
    if (!confirm('Tem certeza que deseja remover este perfil?')) {
      return;
    }
    
    try {
      const res = await fetch(`/api/profiles/delete?profileId=${profileId}`, {
        method: 'DELETE'
      });
      
      if (res.ok) {
        setProfiles(profiles.filter(p => p._id !== profileId));
        setMessage({ type: 'success', text: 'Perfil removido com sucesso!' });
      } else {
        const data = await res.json();
        setMessage({ type: 'error', text: data.error || 'Erro ao remover perfil' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Erro de conexão' });
    }
  };

  if (status === 'loading') {
    return (
      <>
        <NavBarLoggedIn />
        <div className={styles.container}>
          <div className={styles.card}>
          <h1>Carregando...</h1>
        </div>
      </div>
      </>
    );
  }
  return (
    <>
      <NavBarLoggedIn />
      <div className={styles.container}>
        <div className={styles.card}>
          <h1 className={styles.title}>Seus Perfis de E-sports</h1>
          
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.inputGroup}>
              <label htmlFor="url">Adicionar Perfil de E-sports</label>
              <input
                type="url"
                id="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://liquipedia.net/counterstrike/seu-perfil"
                required
              />
              <p className={styles.hint}>
                Suportamos: Liquipedia, HLTV, Battlefy, Faceit, ESEA, etc.
              </p>
            </div>
            
            <button 
              type="submit" 
              className={styles.submitButton}
              disabled={loading}
            >
              {loading ? 'Validando...' : 'Validar e Adicionar'}
            </button>
          </form>
          
          {message && (
            <div className={`${styles.message} }styles[message.type]}`}>
              {message.text}
            </div>
          )}
          
          <div className={styles.profilesList}>
            <h2>Perfis Validados</h2>
            {profiles.length === 0 ? (
              <p className={styles.emptyMessage}>Nenhum perfil adicionado ainda</p>
            ) : (
              profiles.map((profile, index) => (
                <div key={index} className={styles.profileCard}>
                  <div className={styles.profileHeader}>
                    <h3>{profile.site || 'Site de E-sports'}</h3>
                    <span className={styles.relevanceScore}>
                      Relevância: {Math.round(profile.relevanceScore * 100)}%
                    </span>
                  </div>
                  <a href={profile.url} target="_blank" rel="noopener noreferrer">
                    {profile.url}
                  </a>
                  {profile.aiSummary && (
                    <p className={styles.aiSummary}>{profile.aiSummary}</p>
                  )}
                  <button 
                    onClick={() => handleDelete(profile._id)}
                    className={styles.deleteButton}
                  >
                    Remover
                  </button>
                </div>
              ))
            ) }
          </div>
        </div>
      </div>
    </>
  );
}