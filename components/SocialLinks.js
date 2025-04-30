import { useState, useEffect } from 'react'

export default function SocialLinks({ value, onChange }) {
  const [url, setUrl] = useState('')

  useEffect(() => {
    onChange(value)
  }, [value, onChange])

  function addLink() {
    if (!url) return
    // marcamos “pendente” para futura validação manual
    onChange([...value, { url, status: 'Pendente' }])
    setUrl('')
  }

  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <div style={{ display: 'flex', gap: 8 }}>
        <input
          style={{ flex: 1 }}
          placeholder="URL do seu perfil social"
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
            </a> – {item.status}
          </li>
        ))}
      </ul>
    </div>
  )
}