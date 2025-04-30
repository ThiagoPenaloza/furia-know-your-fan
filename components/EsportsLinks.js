import { useState, useEffect } from 'react'

export default function EsportsLinks({ value, onChange }) {
  const [url, setUrl] = useState('')

  useEffect(() => {
    onChange(value)
  }, [value, onChange])

  function addLink() {
    if (!url) return
    // heurística simples: se conter “furia” ou “esport” no texto da URL
    const lower = url.toLowerCase()
    const relevant = (lower.includes('furia') || lower.includes('esport'))
    onChange([...value, { url, relevant }])
    setUrl('')
  }

  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <div style={{ display: 'flex', gap: 8 }}>
        <input
          style={{ flex: 1 }}
          placeholder="URL de site ou artigo de e-sports"
          value={url}
          onChange={e => setUrl(e.target.value)}
        />
        <button onClick={addLink} disabled={!url}>Adicionar</button>
      </div>
      <ul>
        {value.map((item, idx) => (
          <li key={idx}>
            <a href={item.url} target="_blank" rel="noopener noreferrer">
              {item.url}
            </a> – {item.relevant ? 'Relevante' : 'Não relevante'}
          </li>
        ))}
      </ul>
    </div>
  )
}