// utils/auth.js
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import jwt_decode from 'jwt-decode'; // npm install jwt-decode

export function useAuth() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        
        if (!token) {
          throw new Error('No token found');
        }
        
        // Verificar se o token está expirado
        const decoded = jwt_decode(token);
        const currentTime = Date.now() / 1000;
        
        if (decoded.exp < currentTime) {
          throw new Error('Token expired');
        }
        
        // Verificar o token no servidor
        const response = await fetch('/api/auth/verify', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Invalid token');
        }
        
        const data = await response.json();
        setUser(data.user);
      } catch (error) {
        console.error('Auth error:', error);
        // Limpar token inválido
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        // Redirecionar para login
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };
    
    checkAuth();
  }, [router]);
  
  return { user, loading };
}