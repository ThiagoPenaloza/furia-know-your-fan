import Link from "next/link";
import { useSession, signIn, signOut } from "next-auth/react";
import styles from "../styles/Header.module.css";

export default function Header() {
  const { data: session, status } = useSession();

  const authButton =
    status === "loading" ? null : session ? (
      <button onClick={() => signOut()} className={styles.authButton}>
        Sair
      </button>
    ) : (
      <button onClick={() => signIn()} className={styles.authButton}>
        Entrar
      </button>
    );

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <Link href="/" className={styles.logo}>
          FURIA&nbsp;<span className={styles.logoAccent}>Match</span>
        </Link>

        <nav className={styles.nav}>
          <Link href="/connect-social" className={styles.navLink}>
            Redes&nbsp;Sociais
          </Link>

          {session && (
            <Link href="/profile" className={styles.navLink}>
              Perfil
            </Link>
          )}

          {authButton}
        </nav>
      </div>
    </header>
  );
}
