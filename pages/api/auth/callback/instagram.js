// pages/api/auth/callback/instagram.js
import dbConnect from '../../../../lib/db';
import User from '../../../../models/User';
import axios from 'axios';

export default async function handler(req, res) {
  // Obter o código e o estado da URL de callback
  const { code, state } = req.query;
  
  if (!code || !state) {
    return res.status(400).json({ error: 'Parâmetros inválidos' });
  }
  
  try {
    // Decodificar o estado
    const stateData = JSON.parse(Buffer.from(state, 'base64').toString());
    const { userId, token, platform } = stateData;
    
    // Conectar ao banco de dados
    await dbConnect();
    
    // Verificar se o usuário existe
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }
    
    // Trocar o código por um token de acesso
    const tokenResponse = await axios.post('https://api.instagram.com/oauth/access_token', {
      client_id: process.env.INSTAGRAM_CLIENT_ID,
      client_secret: process.env.INSTAGRAM_CLIENT_SECRET,
      grant_type: 'authorization_code',
      redirect_uri: `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/callback/instagram`,
      code
    }, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
    
    const { access_token, user_id } = tokenResponse.data;
    
    // Obter informações do usuário
    const userInfoResponse = await axios.get(`https://graph.instagram.com/me?fields=id,username&access_token=${access_token}`);
    const { username } = userInfoResponse.data;
    
    // Atualizar o usuário no banco de dados
    user.socialMedia.instagram = {
      username,
      connected: true,
      accessToken: access_token,
      userData: userInfoResponse.data,
      lastSync: new Date()
    };
    
    await user.save();
    
    // Iniciar a análise de dados em segundo plano
    analyzeSocialMediaData(userId, 'instagram');
    
    // Redirecionar de volta para a página de conexão social
    res.redirect(`/connect-social?token=${token}&userId=${userId}&success=true&platform=instagram`);
  } catch (error) {
    console.error('Erro no callback do Instagram:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
}

// Função para analisar dados de redes sociais em segundo plano
async function analyzeSocialMediaData(userId, platform) {
  try {
    // Conectar ao banco de dados
    await dbConnect();
    
    // Buscar o usuário
    const user = await User.findById(userId);
    if (!user || !user.socialMedia[platform].connected) {
      return;
    }
    
    // Obter o token de acesso
    const accessToken = user.socialMedia[platform].accessToken;
    
    // Análise específica para o Instagram
    if (platform === 'instagram') {
      // Buscar mídia recente do usuário
            // Buscar mídia recente do usuário
          // Buscar mídia recente do usuário
          const mediaResponse = await axios.get(
            `https://graph.instagram.com/me/media?fields=id,caption,media_type,media_url,permalink,timestamp&access_token=${accessToken}`
          );
          
          const posts = mediaResponse.data.data || [];
          
          // Analisar posts relacionados a esports e FURIA
          const esportsKeywords = ['esports', 'furia', 'csgo', 'valorant', 'league of legends', 'lol', 'gaming', 'game'];
          const esportsInteractions = [];
          
          for (const post of posts) {
            const caption = post.caption ? post.caption.toLowerCase() : '';
            
            // Verificar se o post contém palavras-chave relacionadas a esports
            const hasEsportsKeywords = esportsKeywords.some(keyword => caption.includes(keyword));
            
            if (hasEsportsKeywords) {
              esportsInteractions.push({
                platform: 'instagram',
                organization: caption.includes('furia') ? 'FURIA' : 'Outros',
                interactionType: 'post',
                content: post.caption,
                date: new Date(post.timestamp)
              });
            }
          }
          
          // Atualizar o usuário com as interações encontradas
          if (esportsInteractions.length > 0) {
            await User.findByIdAndUpdate(userId, {
              $push: { 'socialAnalysis.esportsInteractions': { $each: esportsInteractions } }
            });
          }
          
          // Calcular sentimento em relação à FURIA
          const furiaInteractions = esportsInteractions.filter(interaction => 
            interaction.organization === 'FURIA'
          );
          
          if (furiaInteractions.length > 0) {
            // Aqui você poderia implementar uma análise de sentimento mais sofisticada
            // Por simplicidade, estamos apenas verificando a presença de palavras positivas/negativas
            const positiveWords = ['love', 'amazing', 'great', 'awesome', 'good', 'best', 'win', 'victory'];
            const negativeWords = ['hate', 'bad', 'terrible', 'worst', 'lose', 'lost', 'defeat'];
            
            let sentimentScore = 0;
            let totalWords = 0;
            
            for (const interaction of furiaInteractions) {
              const content = interaction.content.toLowerCase();
              const words = content.split(/\s+/);
              
              for (const word of words) {
                if (positiveWords.includes(word)) sentimentScore += 1;
                if (negativeWords.includes(word)) sentimentScore -= 1;
                totalWords += 1;
              }
            }
            
            // Normalizar o score entre -1 e 1
            const normalizedScore = totalWords > 0 ? sentimentScore / totalWords : 0;
            
            // Atualizar o sentimento do usuário
            await User.findByIdAndUpdate(userId, {
              'socialAnalysis.sentiment.towardsFuria': normalizedScore
            });
          }
        }
        
        // Marcar a última sincronização
        await User.findByIdAndUpdate(userId, {
          [`socialMedia.${platform}.lastSync`]: new Date()
        });
        
        console.log(`Análise de dados do ${platform} concluída para o usuário ${userId}`);
      } catch (error) {
        console.error(`Erro ao analisar dados do ${platform}:`, error);
      }
    }
    