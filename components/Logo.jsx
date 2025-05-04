import Link from "next/link";
import styles from "../styles/Header.module.css";
import { useRouter } from "next/router";

export function Logo() {
  const router = useRouter();

  const handleLogoClick = () => {
    // Force active state to "Home" when logo is clicked
    const navEvent = new CustomEvent("navStateChange", { detail: "Home" });
    window.dispatchEvent(navEvent);
    router.push("/");
  };

  return (
    <div onClick={handleLogoClick} className={styles.logo}>
      <img
        src="/icons/logo-furia.svg"
        alt="FURIA Logo"
        className={styles.logoAccent}
        style={{
          cursor: "pointer",
          width: "120px",
          height: "auto",
          position: "fixed",
          top: "20px",
          left: "20px",
          zIndex: 100,
        }}
      />
    </div>
  );
}
