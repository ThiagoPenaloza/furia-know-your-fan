// pages/login.js
import { useState } from 'react';
import { useRouter } from 'next/router';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import styles from '../styles/Login.module.css';

export default function Login() {
  const router = useRouter();

  /* ---------- state ---------- */
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  /* ---------- handlers ---------- */
  const handleChange = e => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const res = await signIn('credentials', {
      redirect: false,
      email:    form.email,
      password: form.password
    });
    if (res.error) setError(res.error);
    else          router.replace('/profile');
    setLoading(false);
  };

  /* ---------- render ---------- */
  return (
    <div className={styles.container}>
      <form onSubmit={handleSubmit} className={styles.card}>
        <h1>Entrar</h1>
        {error && <div className={styles.error}>Falha no OAuth: {error}</div>}
        <input name="email"    type="email"    onChange={handleChange} placeholder="Email"    required/>
        <input name="password" type="password" onChange={handleChange} placeholder="Senha"    required/>
        <button disabled={loading}>{loading?'Entrando…':'Entrar'}</button>
        <p>
          Não tem conta? <Link href="/form">Cadastre-se</Link>
        </p>
      </form>
    </div>
  );
}
