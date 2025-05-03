import '../styles/theme.css';      // ← define as variáveis
import '../styles/globals.css';    // ← pode usá-las em seguida
import { SessionProvider } from 'next-auth/react';
import Header from '../components/Header';

export default function MyApp({ Component, pageProps: { session, ...pageProps } }) {
  return (
    <SessionProvider session={session}>
      <Header />
      <Component {...pageProps} />
    </SessionProvider>
  );
}