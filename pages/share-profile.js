import { useState, useEffect } from 'react'
import { useSession }          from 'next-auth/react'

export default function ShareProfile() {
  const { data:session, status } = useSession()
  const [links, setLinks] = useState([])
  const [url, setUrl]     = useState('')

  const fetchLinks = async () => {
    const r = await fetch('/api/profiles')
    const { profiles } = await r.json()
    setLinks(profiles)
  }

  useEffect(() => { if (status==='authenticated') fetchLinks() }, [status])

  const submit = async (e) => {
    e.preventDefault()
    await fetch('/api/profiles', {
      method:'POST',
      headers:{ 'Content-Type':'application/json' },
      body:JSON.stringify({ url })
    })
    setUrl('')
    fetchLinks()
  }

  if (status==='loading') return <p>Carregando…</p>

  return (
    <div>
      <h1>Adicionar perfil de e-sports</h1>
      <form onSubmit={submit}>
        <input
          value={url}
          onChange={e=>setUrl(e.target.value)}
          placeholder="https://liquipedia.net/..."
          required
        />
        <button>Enviar</button>
      </form>

      <ul>
        {links.map(l => (
          <li key={l.url}>
            {l.url} — {l.validated
              ? `✅ (${(l.relevanceScore*100).toFixed()}%)`
              : '⏳ em validação'}
          </li>
        ))}
      </ul>
    </div>
  )
}