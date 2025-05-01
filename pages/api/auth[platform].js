// pages/api/auth/[platform].js
import dbConnect from '../../../lib/db';
import User from '../../../models/User';

// Configurações OAuth para cada plataforma
const oauthConfig = {
  instagram: {
    authUrl: 'https://api.instagram.com/oauth/authorize',
    clientId: process.env.INSTAGRAM_CLIENT_ID,
    redirectUri: `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/callback/instagram`,
    scope: 'user_profile,user_media',
  },
  twitter: {
    authUrl: 'https://twitter.com/i/oauth2/authorize',
    clientId: process.env.TWITTER_CLIENT_ID,
    redirectUri: `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/callback/twitter`,
    scope: 'tweet.read,users.read,follows.read',
  },
  facebook: {
    authUrl: 'https://www.facebook.com/v12.0/dialog/oauth',
    clientId: process.env.FACEBOOK_CLIENT_ID,
    redirectUri: `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/callback/facebook`,
    scope: 'public_profile,user_likes,user_posts',
  },
  twitch: {
    authUrl: 'https://id.twitch.tv/oauth2/authorize',
    clientId: process.env.TWITCH_CLIENT_ID,
    redirectUri: `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/callback/twitch`,
    scope: 'user:read:follows',
  },
  youtube: {
    authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    clientId: process.env.YOUTUBE_CLIENT_ID,
    redirectUri: `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/callback/youtube`,
    scope: 'https://www.googleapis.com/auth/youtube.readonly',
  },
};

export default async function handler(req, res) {
  const { platform } = req.query;
  const { userId, token } = req.query;
  
  // Verificar se a plataforma é suportada
  if (!oauthConfig[platform]) {
    return res.status(400).json({ error: 'Plataforma não suportada' });
  }
  
  // Verificar se o userId e token foram fornecidos
  if (!userId || !token) {
    return res.status(400).json({ error: 'Parâmetros inválidos' });
  }
  
  try {
    // Conectar ao banco de dados
    await dbConnect();
    
    // Verificar se o usuário existe
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }
    
    // Gerar um estado para segurança do OAuth
    const state = Buffer.from(JSON.stringify({
      userId,
      token,
      platform
    })).toString('base64');
    
    // Construir a URL de autorização
    const config = oauthConfig[platform];
    const authUrl = new URL(config.authUrl);
    
    // Adicionar parâmetros à URL
    authUrl.searchParams.append('client_id', config.clientId);
    authUrl.searchParams.append('redirect_uri', config.redirectUri);
    authUrl.searchParams.append('response_type', 'code');
    authUrl.searchParams.append('scope', config.scope);
    authUrl.searchParams.append('state', state);
    
    // Redirecionar para a URL de autorização
    res.redirect(authUrl.toString());
  } catch (error) {
    console.error(`Erro ao iniciar autenticação ${platform}:`, error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
}