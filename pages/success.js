// pages/success.js
import Link from 'next/link';
import styles from '../styles/Success.module.css';

export default function Success() {
  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.iconWrapper}>
          <svg className={styles.checkIcon} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
        </div>
        
        <h1 className={styles.title}>Cadastro Realizado com Sucesso!</h1>
        
        <p className={styles.message}>
          Parabéns! Seu perfil de fã FURIA foi criado com sucesso. 
          Agora você está participando do sorteio da camisa oficial e 
          receberá atualizações exclusivas sobre eventos e promoções.
        </p>
        
        <div className={styles.infoBox}>
          <h3>O que acontece agora?</h3>
          <ul>
            <li>Sua inscrição será analisada por nossa equipe</li>
            <li>O sorteio acontecerá no final do mês</li>
            <li>Você receberá um e-mail com mais informações</li>
            <li>Fique de olho nas suas redes sociais cadastradas</li>
          </ul>
        </div>
        
        <div className={styles.socialShare}>
          <p>Compartilhe com seus amigos:</p>
          <div className={styles.socialButtons}>
            <a href="https://twitter.com/intent/tweet?text=Acabei%20de%20me%20cadastrar%20para%20concorrer%20a%20uma%20camisa%20oficial%20da%20FURIA!%20%23DIADEFURIA" target="_blank" rel="noopener noreferrer" className={styles.twitterButton}>
              Twitter
            </a>
            <a href="https://www.facebook.com/sharer/sharer.php?u=https://furia.gg" target="_blank" rel="noopener noreferrer" className={styles.facebookButton}>
              Facebook
            </a>
            <a href="https://wa.me/?text=Acabei%20de%20me%20cadastrar%20para%20concorrer%20a%20uma%20camisa%20oficial%20da%20FURIA!%20Cadastre-se%20também:%20https://furia.gg" target="_blank" rel="noopener noreferrer" className={styles.whatsappButton}>
              WhatsApp
            </a>
          </div>
        </div>
        
        <Link href="/" className={styles.homeButton}>
          Voltar para a Página Inicial
        </Link>
      </div>
    </div>
  );
}
