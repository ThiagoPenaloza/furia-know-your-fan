// pages/index.js
import { useEffect, useRef } from 'react'
import Link                  from 'next/link'
import { gsap }              from 'gsap'
import styles                from '../styles/Landing.module.css'

export default function Landing() {
  /* ----- refs p/ animação ----- */
  const scope = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.timeline({ defaults:{ ease:'power3.out', duration:1 } })
        .to('.fadeIn',    { opacity:1, y:0 })
        .from('.title',   { opacity:0, y:20 }, '-=0.6')
        .from('.subtitle',{ opacity:0, y:20 }, '-=0.5')
        // ----------- anima os dois <a> de forma explícita -----------
        .fromTo(
          '.btnRow a',
          { opacity:0, y:20 },
          { opacity:1, y:0, stagger:0.1 },
          '-=0.4'
        )
    }, scope)
    return () => ctx.revert()
  }, [])

  return (
    <div ref={scope} className={styles.page}>
      {/* Header já vem do _app.js */}

      <div className={`${styles.overlay} overlay fadeIn`}>
        <h1 className={`${styles.title} title`}>Participe do Sorteio <br/> da <span style={{color:'#f7c600'}}>FURIA</span>!</h1>
        <p className={`${styles.subtitle} subtitle`}>
          Complete o formulário e concorra a um kit exclusivo <br/> com camisa oficial e brindes FURIA.
        </p>

        <div className={`btnRow ${styles.btnRow}`}>
          <Link href="/form"  className={styles.btnPrimary}>Participar</Link>
          <Link href="/login" className={styles.btnGhost}>Já me cadastrei</Link>
        </div>
      </div>
    </div>
  )
}
