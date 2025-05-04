// pages/profile.js
import { useSession, signOut } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { useRouter }           from 'next/router';
import styles                  from '../styles/Profile.module.css';
import { Home, Share2, ExternalLink } from "lucide-react";
import { NavBarLoggedIn } from "@/components/ui/NavBarLoggedIn";

export default function Profile() {
  const { data: session, status } = useSession();
  const router                    = useRouter();
  const [user,    setUser]        = useState(null);
  const [loading, setLoading]     = useState(true);

  // navItems now handled by NavBarLoggedIn

  /* ---------- redirect se não autenticado ---------- */
  useEffect(() => {
    if (status === 'unauthenticated') router.replace('/login');
  }, [status, router]);

  /* ---------- carrega dados ---------- */
  useEffect(() => {
    if (status !== 'authenticated') return;
    fetch('/api/me', { credentials:'include' })
      .then(r => r.json())
      .then(({ user }) => setUser(user))
      .finally(() => setLoading(false));
  }, [status]);

  if (loading || status === 'loading') {
    return (
      <div className={styles.container}>
        <p>Carregando…</p>
      </div>
    );
  }

  /* ---------- helpers ---------- */
  const dateBR = d => d ? new Date(d).toLocaleDateString('pt-BR') : '—';
  const renderTags = arr =>
    arr?.length ? (
      <ul className={styles.tagList}>
        {arr.map(t => <li key={t} className={styles.tag}>{t}</li>)}
      </ul>
    ) : <p className={styles.emptyMessage}>Nenhum informado</p>;

  /* ---------- REDES SOCIAIS conectadas ---------- */
  const socialMedia   = user.socialMedia ?? {};
  const socialLabel   = { twitch:'Twitch', twitter:'Twitter', youtube:'YouTube',
                          instagram:'Instagram', facebook:'Facebook' };

  // função que aplica a MESMA lógica usada em /connect-social
  const extractUsername = (platform, data = {}) => {
    switch (platform) {
      case 'twitter':
        return (
             data.username
          ?? data.name
          ?? data.userData?.data?.username       // API v2
          ?? data.userData?.username             // API v1 “include_entities”
          ?? data.userData?.screen_name
          ?? data.userData?.name
          ?? ''
        );

      case 'twitch':
        return data.username ?? data.name ?? '';

      case 'youtube':
        return data.username ?? data.name ?? data.userData?.name ?? '';

      default:
        return data.username ?? data.name ?? '';
    }
  };

  const socialConnected = Object.entries(socialMedia)
    .filter(([,v]) => v?.connected)
    .map(([k,v]) => ({
      key  : k,
      label: socialLabel[k] ?? k,
      name: extractUsername(k, v).trim()
    }));

  /* ---------- render ---------- */
  return (
    <>
      <NavBarLoggedIn />
      <div className={styles.container}>
        <div className={styles.card}>
          <h1 className={styles.title}>Perfil do Fã</h1>

          {/* ===== Informações Básicas ===== */}
          <section className={styles.section}>
            <h2>Informações Básicas</h2>
            <div className={styles.infoGrid}>
              <div className={styles.infoItem}>
                <span className={styles.label}>Nome:</span>
                <span className={styles.value}>{user.name}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.label}>E-mail:</span>
                <span className={styles.value}>{user.email}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.label}>CPF:</span>
                <span className={styles.value}>{user.cpf}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.label}>Nascimento:</span>
                <span className={styles.value}>{dateBR(user.birthDate)}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.label}>Telefone:</span>
                <span className={styles.value}>{user.phone}</span>
              </div>
            </div>
          </section>

          {/* ===== Endereço ===== */}
          <section className={styles.section}>
            <h2>Endereço</h2>
            <p>
              {user.address.street}, {user.address.number}
              {user.address.complement && ` – ${user.address.complement}`},{' '}
              {user.address.neighborhood}, {user.address.city} –{' '}
              {user.address.state} • CEP {user.address.zipCode}
            </p>
          </section>

          {/* ===== Interesses & Atividades ===== */}
          <section className={styles.section}>
            <h2>Interesses & Atividades</h2>
            <div className={styles.interestsGrid}>
              <div className={styles.interestItem}>
                <p className={styles.label}>Jogos Favoritos</p>
                {renderTags(user.favoriteGames)}
              </div>
              <div className={styles.interestItem}>
                <p className={styles.label}>Times Favoritos</p>
                {renderTags(user.favoriteTeams)}
              </div>
              <div className={styles.interestItem}>
                <p className={styles.label}>Jogadores Favoritos</p>
                {renderTags(user.favoritePlayers)}
              </div>
              <div className={styles.interestItem}>
                <p className={styles.label}>Eventos que Participou</p>
                {renderTags(user.attendedEvents)}
              </div>
              <div className={styles.interestItem}>
                <p className={styles.label}>Produtos Comprados</p>
                {renderTags(user.purchasedMerchandise)}
              </div>
            </div>
          </section>

          {/* ===== Redes Sociais Vinculadas ===== */}
          <section className={styles.section}>
            <h2>Redes Sociais</h2>

            {socialConnected.length ? (
              socialConnected.map(({key,label,name}) => (
                <p key={key}>
                  {label}: <span>@{name}</span>
                </p>
              ))
            ) : (
              <p className={styles.emptyMessage}>Nenhuma conta vinculada</p>
            )}

            <button
              className={styles.button}
              onClick={() => router.push('/connect-social')}
            >
              Gerenciar Conexões
            </button>
          </section>

          {/* ===== Sair ===== */}
          <div className={styles.buttonGroup}>
            <button
              className={styles.logoutButton}
              onClick={() => signOut({ callbackUrl:'/login' })}
            >
              Sair
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
