// pages/login.js
import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import styles from '../styles/Login.module.css';

export default function Login() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    cpf: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [debugInfo, setDebugInfo] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setDebugInfo(null);

    try {
      // Normalizar o CPF antes de enviar
      const normalizedCpf = formData.cpf.replace(/[^\d]/g, '');
    
      console.log('Enviando dados de login:', {
        email: formData.email.trim(),
        cpf: normalizedCpf
      });
    
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: formData.email.trim(),
          cpf: normalizedCpf
        })
      });

      const data = await response.json();
      console.log('Resposta do servidor:', data);

      if (data.success) {
        // Login bem-sucedido
        localStorage.setItem('token', data.token);
        localStorage.setItem('userId', data.userId);
        router.push(`/profile?token=${data.token}&userId=${data.userId}`);
      } else if (data.debug) {
        // Informações de depuração
        setDebugInfo(data);
      } else {
        // Erro normal
        throw new Error(data.error || 'Erro ao fazer login');
      }
    } catch (error) {
      console.error('Erro de login:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailOnlyLogin = async () => {
    if (!formData.email.trim()) {
      setError('Por favor, informe seu email');
      return;
    }
    
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/login-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: formData.email.trim()
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao fazer login');
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('userId', data.userId);
      router.push(`/profile?token=${data.token}&userId=${data.userId}`);
    } catch (error) {
      console.error('Erro de login:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Função para criar uma conta de teste se não houver usuários
  const createTestAccount = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/create-test-user', {
        method: 'POST'
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setFormData({
          email: data.email,
          cpf: data.cpf
        });
        setDebugInfo({
          message: `Conta de teste criada! Email: ${data.email}, CPF: ${data.cpf}`,
          testAccount: true
        });
      } else {
        throw new Error(data.error || 'Erro ao criar conta de teste');
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>Acesse sua conta</h1>
        <p className={styles.subtitle}>
          Entre com seu email e CPF para verificar sua participação no sorteio
        </p>

        {error && <div className={styles.errorMessage}>{error}</div>}

        {debugInfo && (
          <div className={styles.debugInfo}>
            <h3>Informações de Depuração:</h3>
            <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
            
            {debugInfo.message === 'Não há usuários cadastrados no banco de dados' && (
              <button 
                type="button" 
                className={styles.button}
                onClick={createTestAccount}
              >
                Criar Conta de Teste
              </button>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="Seu email cadastrado"
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="cpf">CPF</label>
            <input
              type="text"
              id="cpf"
              name="cpf"
              value={formData.cpf}
              onChange={handleChange}
              required
              placeholder="Seu CPF (apenas números)"
            />
          </div>

          <button 
            type="submit" 
            className={styles.button}
            disabled={loading}
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <div className={styles.links}>
          <p>
            Ainda não se cadastrou?{' '}
            <Link href="/form" className={styles.link}>
              Participar do sorteio
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
