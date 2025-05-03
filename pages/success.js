// pages/success.js
import Link from 'next/link';
import styles from '../styles/Success.module.css';

export default function Success() {
  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1>Cadastro Realizado!</h1>
        <p>Seus dados foram salvos com sucesso.</p>
        <Link href="/profile">
          <a className={styles.button}>Ir para meu Perfil</a>
        </Link>
      </div>
    </div>
  );
}
