// lib/auth.js
import jwt from 'jsonwebtoken';

export function verifyToken(token) {
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'seu_segredo_temporario');
    return { valid: true, payload };
  } catch (error) {
    return { valid: false, error: error.message };
  }
}

export function authMiddleware(handler) {
  return async (req, res) => {
    // Obter o token do cabeçalho Authorization
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token de autenticação não fornecido' });
    }
    
    const token = authHeader.split(' ')[1];
    const { valid, payload, error } = verifyToken(token);
    
    if (!valid) {
      return res.status(401).json({ 
        error: 'Token inválido ou expirado', 
        details: error 
      });
    }
    
    // Adicionar o payload do token ao objeto req
    req.user = payload;
    
    // Chamar o handler original
    return handler(req, res);
  };
}