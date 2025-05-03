// pages/index.js
import Link from 'next/link'

export default function Landing() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        background: '#111',
        color: '#fff',
        textAlign: 'center',
        padding: '0 20px',
      }}
    >
      <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>
        Participe do Sorteio
        <br />
        de uma Camisa da FURIA!
      </h1>

      <p style={{ fontSize: '1.25rem', marginBottom: '2rem' }}>
        Complete o formulário e concorra a um kit exclusivo
        <br />
        com camisa oficial e brindes FURIA.
      </p>

      <div style={{ display: 'flex', gap: '1rem' }}>
        <Link
          href="/form"
          style={{
            padding: '1rem 2rem',
            fontSize: '1.25rem',
            background: '#f7c600',
            border: 'none',
            borderRadius: 4,
            cursor: 'pointer',
            color: '#000',
            textDecoration: 'none',
            fontWeight: 'bold',
          }}
        >
          Participar do Sorteio
        </Link>

        <Link
          href="/login"
          style={{
            padding: '1rem 2rem',
            fontSize: '1.25rem',
            background: 'transparent',
            border: '2px solid #f7c600',
            borderRadius: 4,
            cursor: 'pointer',
            color: '#f7c600',
            textDecoration: 'none',
            fontWeight: 'bold',
          }}
        >
          Já me Cadastrei
        </Link>
      </div>
    </div>
  )
}
