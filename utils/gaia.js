// utils/gaia.js
export const GAIA_BASE = process.env.NEXT_PUBLIC_GAIA_BASE_URL
export const GAIA_KEY  = process.env.NEXT_PUBLIC_GAIA_API_KEY

async function gaiaFetch(path, body) {
  const res = await fetch(`${GAIA_BASE}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${GAIA_KEY}`
    },
    body: JSON.stringify(body)
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Gaia error ${res.status}: ${text}`)
  }
  return res.json()
}

export async function gaiaChat(messages, model) {
  const payload = { model, messages }
  const json = await gaiaFetch('/chat/completions', payload)
  // retira o conteúdo da primeira escolha
  return json.choices?.[0]?.message?.content?.trim()
}