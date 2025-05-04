import { ComprehendClient, DetectEntitiesCommand, DetectKeyPhrasesCommand, DetectSentimentCommand } from "@aws-sdk/client-comprehend";
import dbConnect from '../../../lib/db';
import User from '../../../models/User';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import * as cheerio from 'cheerio';

// Configurar cliente Comprehend
const comprehendClient = new ComprehendClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  }
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session) {
      return res.status(401).json({ error: 'Não autenticado' });
    }

    const { url } = req.body;
    if (!url) {
      return res.status(400).json({ error: 'URL é obrigatória' });
    }

    // Validar URL
    let validUrl;
    try {
      validUrl = new URL(url);
    } catch (e) {
      return res.status(400).json({ error: 'URL inválida' });
    }
    
    // 1. Extrair o site da URL
    let site = '';
    if (url.includes('liquipedia.net')) site = 'Liquipedia';
    else if (url.includes('hltv.org')) site = 'HLTV';
    else if (url.includes('battlefy.com')) site = 'Battlefy';
    else if (url.includes('faceit.com')) site = 'Faceit';
    else if (url.includes('esea.net')) site = 'ESEA';
    else site = 'Outro';

    // Verificar se o perfil já existe
    await dbConnect();
    const existingProfile = await User.findOne({
      _id: session.user.id,
      'externalProfiles.url': url
    });
    
    if (existingProfile) {
      return res.status(400).json({ 
        error: 'Este perfil já foi adicionado anteriormente.' 
      });
    }

    // 2. Buscar o conteúdo da página
    const response = await fetch(url);
    const html = await response.text();
    
    // 3. Extrair texto do HTML
    const extractedText = extractTextFromHtml(html);
    
    // 4. Buscar dados do usuário para contexto
    const user = await User.findById(session.user.id).lean();
    
    // Garantir que o texto não exceda 5000 bytes
    const truncateToBytes = (text, maxBytes) => {
      const encoder = new TextEncoder();
      const bytes = encoder.encode(text);
      if (bytes.length <= maxBytes) return text;
      
      // Se exceder, truncar para um tamanho seguro
      return new TextDecoder().decode(bytes.slice(0, maxBytes - 10));
    };

    // Limitar o texto a 4990 bytes para garantir que esteja abaixo do limite
    const safeText = truncateToBytes(extractedText, 4990);

    // 5. Analisar com Amazon Comprehend
    const [entitiesResponse, keyPhrasesResponse, sentimentResponse] = await Promise.all([
      // Detectar entidades (nomes, organizações, etc)
      comprehendClient.send(new DetectEntitiesCommand({
        Text: safeText,
        LanguageCode: "en"
      })),
      
      // Detectar frases-chave
      comprehendClient.send(new DetectKeyPhrasesCommand({
        Text: safeText,
        LanguageCode: "en"
      })),
      
      // Detectar sentimento
      comprehendClient.send(new DetectSentimentCommand({
        Text: safeText,
        LanguageCode: "en"
      }))
    ]);
    
    // 6. Extrair entidades e frases relevantes
    const entities = entitiesResponse.Entities || [];
    const keyPhrases = keyPhrasesResponse.KeyPhrases || [];
    const sentiment = sentimentResponse.Sentiment;
    const sentimentScore = sentimentResponse.SentimentScore;
    
    // 7. Calcular pontuação de relevância
    const { 
      relevanceScore, 
      matchedItems,
      summary 
    } = calculateRelevance(entities, keyPhrases, user, sentiment, sentimentScore);
    
    // 8. Salvar no banco de dados
    const profile = {
      url,
      site,
      validated: relevanceScore > 0.3, // Considerar relevante se pontuação > 0.3
      relevanceScore,
      aiSummary: summary,
      addedAt: new Date()
    };
    
    const updatedUser = await User.findByIdAndUpdate(
      session.user.id,
      { $push: { externalProfiles: profile } },
      { new: true }
    );

    // Encontrar o perfil recém-adicionado para obter o ID
    const addedProfile = updatedUser.externalProfiles.find(p => p.url === url);

    // 9. Retornar resultado
    return res.status(200).json({ 
      success: true, 
      profile: addedProfile,
      message: profile.validated 
        ? 'Perfil validado com sucesso!' 
        : 'Perfil adicionado, mas com baixa relevância.'
    });
    
  } catch (error) {
    console.error('Erro na validação de perfil:', error);
    return res.status(500).json({ error: 'Erro ao processar solicitação' });
  }
}

// Função para extrair texto do HTML
function extractTextFromHtml(html) {
  try {
    const $ = cheerio.load(html);
    
    // Remover elementos que geralmente não contêm conteúdo relevante
    $('script, style, meta, link, head, footer, nav, iframe, svg').remove();
    
    // Extrair texto de elementos principais que podem conter informações do perfil
    const mainContent = $('main, article, .content, .profile, .player-profile, .user-profile');
    
    // Se encontrou conteúdo principal, use-o; caso contrário, use o body
    const textContent = mainContent.length 
      ? mainContent.text() 
      : $('body').text();
    
    // Limpar o texto
    return textContent
      .replace(/\s+/g, ' ')
      .trim();
  } catch (error) {
    console.error('Erro ao extrair texto:', error);
    // Fallback para o método simples se o Cheerio falhar
    return html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ' ')
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, ' ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }
}

// Função para calcular relevância
function calculateRelevance(entities, keyPhrases, user, sentiment, sentimentScore) {
  // Arrays de interesses do usuário (converter para minúsculas para comparação)
  const userGames = (user.favoriteGames || []).map(g => g.toLowerCase());
  const userTeams = (user.favoriteTeams || []).map(t => t.toLowerCase());
  const userPlayers = (user.favoritePlayers || []).map(p => p.toLowerCase());
  
  // Extrair textos das entidades e frases-chave
  const entityTexts = entities.map(e => e.Text.toLowerCase());
  const phraseTexts = keyPhrases.map(p => p.Text.toLowerCase());
  const allTexts = [...entityTexts, ...phraseTexts];
  
  // Encontrar correspondências
  const matchedGames = userGames.filter(game => 
    allTexts.some(text => text.includes(game))
  );
  
  const matchedTeams = userTeams.filter(team => 
    allTexts.some(text => text.includes(team))
  );
  
  const matchedPlayers = userPlayers.filter(player => 
    allTexts.some(text => text.includes(player))
  );
  
  // Calcular pontuação
  // Fórmula: (0.4 * % jogos correspondentes) + (0.3 * % times) + (0.3 * % jogadores)
  const gameScore = userGames.length ? (matchedGames.length / userGames.length) * 0.4 : 0;
  const teamScore = userTeams.length ? (matchedTeams.length / userTeams.length) * 0.3 : 0;
  const playerScore = userPlayers.length ? (matchedPlayers.length / userPlayers.length) * 0.3 : 0;
  
  // Adicionar bônus para sentimento positivo
  let sentimentBonus = 0;
  if (sentiment === 'POSITIVE') {
    sentimentBonus = 0.1;
  } else if (sentiment === 'NEGATIVE') {
    sentimentBonus = -0.05;
  }
  
  // Garantir que a pontuação esteja entre 0 e 1
  const relevanceScore = Math.min(1, Math.max(0, gameScore + teamScore + playerScore + sentimentBonus));
  
  // Criar resumo
  const matchedItems = {
    games: matchedGames,
    teams: matchedTeams,
    players: matchedPlayers
  };
  
  let summary = "Este perfil ";
  
  if (matchedItems.games.length || matchedItems.teams.length || matchedItems.players.length) {
    summary += "contém referências a ";
    
    const parts = [];
    if (matchedItems.games.length) {
      parts.push(`jogos que você gosta (${matchedItems.games.join(', ')})`);
    }
    if (matchedItems.teams.length) {
      parts.push(`times que você segue (${matchedItems.teams.join(', ')})`);
    }
    if (matchedItems.players.length) {
      parts.push(`jogadores que você acompanha (${matchedItems.players.join(', ')})`);
    }
    
    summary += parts.join(' e ');
  } else {
    summary += "não contém referências diretas aos seus interesses em e-sports";
  }
  
  // Adicionar informação de sentimento ao resumo
  let sentimentInfo = "";
  if (sentiment === 'POSITIVE') {
    sentimentInfo = " O conteúdo tem um tom positivo.";
  } else if (sentiment === 'NEGATIVE') {
    sentimentInfo = " O conteúdo tem um tom negativo.";
  } else if (sentiment === 'MIXED') {
    sentimentInfo = " O conteúdo tem opiniões mistas.";
  }
  
  summary += sentimentInfo;
  
  return {
    relevanceScore,
    matchedItems,
    summary
  };
}