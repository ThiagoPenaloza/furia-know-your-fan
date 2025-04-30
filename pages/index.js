// pages/index.js
import Link from 'next/link'

export default function Landing() {
  return (
    <div style={{
      display:'flex',
      flexDirection:'column',
      alignItems:'center',
      justifyContent:'center',
      height:'100vh',
      background: '#111',
      color: '#fff',
      textAlign: 'center',
      padding: '0 20px'
    }}>
      <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>
        Participe do Sorteio<br/>
        de uma Camisa da FURIA!
      </h1>
      <p style={{ fontSize: '1.25rem', marginBottom: '2rem' }}>
        Complete o formulário e concorra a um kit exclusivo<br/>
        com camisa oficial e brindes FURIA.
      </p>

      <Link href="/form">
        {/* O Link injeta onClick e role no <button> */}
        <button style={{
          padding: '1rem 2rem',
          fontSize: '1.25rem',
          background: '#f7c600',
          border: 'none',
          borderRadius: 4,
          cursor: 'pointer'
        }}>
          Participar do Sorteio
        </button>
      </Link>
    </div>
  )
}