// pages/index.js
import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { gsap } from 'gsap'
import { useSession } from "next-auth/react"
import styles from '../styles/Landing.module.css'
import { Logo } from '@/components/Logo'
import { HoverButton } from '@/components/ui/animated-hover-button'

export default function Landing() {
  /* ----- refs p/ animação ----- */
  const scope = useRef(null)
  const highlightRef = useRef(null)

  useEffect(() => {
    // Add animated class to highlight after initial animations
    setTimeout(() => {
      if (highlightRef.current) {
        highlightRef.current.classList.add(styles.animated)
      }
    }, 2000)

    const ctx = gsap.context(() => {
      // Main timeline with enhanced animations
      const tl = gsap.timeline({ 
        defaults: { 
          ease: 'power3.out', 
          duration: 0.8 
        }
      })

      // Start the animation sequence
      tl
      
      // Card overlay animation with slight bounce
      .to('.overlay-card', { 
        opacity: 1, 
        y: 0, 
        duration: 1,
        ease: 'back.out(1.2)'
      }, '-=0.4')
      
      // Title animation with slight stagger for each word
      .fromTo('.title-word', 
        { opacity: 0, y: 30 },
        { 
          opacity: 1, 
          y: 0, 
          stagger: 0.1,
          ease: 'back.out(1.7)'
        }, 
        '-=0.6'
      )
      
      // Subtitle animation
      .fromTo('.subtitle-text',
        { opacity: 0, y: 20 },
        { 
          opacity: 1, 
          y: 0,
          ease: 'power2.out' 
        }, 
        '-=0.4'
      )
      
      // Button animations with bounce effect
      .fromTo('.btn-primary',
        { opacity: 0, y: 20, scale: 0.9 },
        { 
          opacity: 1, 
          y: 0, 
          scale: 1,
          ease: 'back.out(1.5)'
        }, 
        '-=0.2'
      )
      
      .fromTo('.btn-ghost',
        { opacity: 0, y: 20, scale: 0.9 },
        { 
          opacity: 1, 
          y: 0, 
          scale: 1,
          ease: 'back.out(1.5)'
        }, 
        '-=0.6'
      )
      
      // Add subtle hover animations for buttons
      gsap.utils.toArray('.btn-primary, .btn-ghost').forEach(button => {
        button.addEventListener('mouseenter', () => {
          gsap.to(button, { 
            scale: 1.05, 
            duration: 0.3, 
            ease: 'power1.out' 
          })
        })
        
        button.addEventListener('mouseleave', () => {
          gsap.to(button, { 
            scale: 1, 
            duration: 0.3, 
            ease: 'power1.out' 
          })
        })
      })
    }, scope)
    
    return () => ctx.revert()
  }, [])

  // Split title into words for staggered animation
  const titleWords = ['Participe', 'do', 'Sorteio', 'da', 'FURIA!']

  const { data: session } = useSession();


  return (
    <div className="relative">
      <Logo />
      
      <div ref={scope} className={styles.page}>
        {/* Background overlay is handled by CSS */}
        
        {/* Main content overlay */}
        <div className={`${styles.overlay} overlay-card ${styles.fadeIn}`}>
          <h1 className={`${styles.title}`}>
            {titleWords.map((word, index) => (
              <span key={index} className={`title-word ${word === 'FURIA!' ? styles.highlight : ''}`} ref={word === 'FURIA!' ? highlightRef : null}>
                {word}{' '}
              </span>
            ))}
          </h1>
          
          <p className={`${styles.subtitle} subtitle-text`}>
            Complete o formulário e concorra a um kit exclusivo <br /> 
            com camisa oficial e brindes FURIA.
          </p>

          <div className={`${styles.btnRow}`}>
            <Link href="/form" passHref legacyBehavior>
              <a style={{ textDecoration: "none" }}>
                <HoverButton
                  className="mr-4 bg-white text-black"
                  startColor="#fff"
                  endColor="#fff"
                  animationIntensity="medium"
                  effectColors={["#000"]}
                  style={{ minWidth: 160 }}
                >
                  Participar
                </HoverButton>
              </a>
            </Link>
            <Link href="/login" passHref legacyBehavior>
              <a style={{ textDecoration: "none" }}>
                <HoverButton
                  className=""
                  startColor="#93c5fd"
                  endColor="#3b82f6"
                  animationIntensity="medium"
                  effectColors={["#fff"]}
                  style={{ minWidth: 160 }}
                >
                  Já me cadastrei
                </HoverButton>
              </a>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
