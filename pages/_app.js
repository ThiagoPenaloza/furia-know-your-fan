import '../styles/theme.css';
import '../styles/globals.css';
import { SessionProvider } from 'next-auth/react';
import { NavBar } from '@/components/ui/tubelight-navbar'
import { NavBarLoggedIn } from '@/components/ui/NavBarLoggedIn'
import { Home, UserPlus, LogIn } from 'lucide-react'
import { Logo } from "@/components/Logo";
import { useRouter } from 'next/router'

export default function MyApp({ Component, pageProps: { session, ...pageProps }, router }) {
  const currentRouter = useRouter();
  
  // Array de rotas que devem usar a NavBarLoggedIn
  const loggedInRoutes = ['/profile', '/connect-social'];
  
  const getNavItems = () => {
    return [
      {
        name: "Home",
        url: "/",
        icon: Home
      },
      {
        name: "Cadastrar",
        url: "/form",
        icon: UserPlus
      },
      {
        name: "Entrar",
        url: "/login",
        icon: LogIn
      }
    ];
  }

  // Verifica se deve mostrar a navbar logada
  const shouldShowLoggedNav = loggedInRoutes.includes(currentRouter.pathname);

  return (
    <SessionProvider session={session}>
      <Logo />
      {shouldShowLoggedNav ? (
        <NavBarLoggedIn />
      ) : (
        <NavBar items={getNavItems()} />
      )}
      <Component {...pageProps} />
    </SessionProvider>
  );
}