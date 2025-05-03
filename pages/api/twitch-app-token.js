import qs from 'querystring';

export default async function handler(req, res) {
  try {
    const body = qs.stringify({
      client_id:     process.env.TWITCH_CLIENT_ID,
      client_secret: process.env.TWITCH_CLIENT_SECRET,
      grant_type:    'client_credentials'
    });

    const resp = await fetch('https://id.twitch.tv/oauth2/token', {
      method: 'POST',
      headers: { 'Content-Type':'application/x-www-form-urlencoded' },
      body
    });
    const data = await resp.json();
    if (!resp.ok) throw new Error(data.message || 'Erro ao obter token');

    return res.status(200).json({ token:data.access_token, expires:data.expires_in });
  } catch (err) {
    return res.status(500).json({ error:err.message });
  }
}