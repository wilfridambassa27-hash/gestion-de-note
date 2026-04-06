'use client'

import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence, useInView } from 'framer-motion'
import {
  GraduationCap, BarChart2, Zap, Users, FileText, QrCode,
  ShieldCheck, Layers, ArrowRight, Play, X, Menu,
  Globe, Sparkles, Award,
  Fingerprint, Timer, Waypoints, LineChart, Key, Medal
} from 'lucide-react'

/* ── Animated Counter ── */
function Counter({ to, duration = 2 }: { to: number; duration?: number }) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true })
  useEffect(() => {
    if (!inView) return
    let start = 0
    const step = Math.ceil(to / (duration * 60))
    const timer = setInterval(() => {
      start += step
      if (start >= to) { setCount(to); clearInterval(timer) } else setCount(start)
    }, 1000 / 60)
    return () => clearInterval(timer)
  }, [inView, to, duration])
  return <span ref={ref}>{count.toLocaleString()}</span>
}

const FEATURES = [
  { icon: Fingerprint, label: 'Bulletins QR certifiés', color: '#10b981', desc: 'Générez des bulletins infalsifiables grâce à notre technologie de signature cryptographique exclusive. Chaque document produit possède un QR code unique permettant une vérification instantanée de son authenticité par n\'importe quelle université partenaire ou employeur à travers le monde.' },
  { icon: Timer, label: 'Saisie ultra-rapide', color: '#f59e0b', desc: 'Notre interface de saisie asynchrone a été optimisée pour la performance et le confort de frappe. Profitez de raccourcis clavier avancés, d\'une validation instantanée et d\'une sauvegarde automatique qui vous permettent d\'enregistrer les notes d\'une promotion entière en moins de deux minutes chrono.' },
  { icon: Waypoints, label: 'Multi-rôles', color: '#6366f1', desc: 'Quatre niveaux d\'accès distincts et cloisonnés garantissent une expérience sur mesure. Que vous soyez administrateur gérant les infrastructures, enseignant saisissant des notes, étudiant consultant ses résultats ou parent suivant l\'évolution, la plateforme s\'adapte à vos besoins spécifiques.' },
  { icon: LineChart, label: 'Analytics en temps réel', color: '#ec4899', desc: 'Ne naviguez plus à l\'aveugle. Obtenez instantanément des visuels dynamiques, la courbe de progression des étudiants, les médianes de classe ou les taux de réussite par module. Croisez vos données instantanément pour prendre des décisions académiques plus stratégiques et proactives.' },
  { icon: Key, label: 'Sécurité maximale', color: '#06b6d4', desc: 'L\'intégrité de vos données académiques est notre priorité absolue. Nous appliquons un chiffrement systématique de bout en bout sur toutes les évaluations et conservons des journaux d\'audit infalsifiables retraçant avec précision toutes les actions et sauvegardes automatiques de la base de données.' },
  { icon: Medal, label: 'Certification intégrée', color: '#8b5cf6', desc: 'L\'édition des actes académiques ne nécessite plus de validation manuelle lourde. Générez en un seul clic les relevés de notes complets sur l\'année, les attestations de niveau et les diplômes finalisés, prêts pour impression haute définition ou envoi numérique officiel avec accréditation d\'état.' },
]

export default function HomePage() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [videoOpen, setVideoOpen]   = useState(false)
  const [scrolled, setScrolled]     = useState(false)

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 24)
    window.addEventListener('scroll', fn)
    return () => window.removeEventListener('scroll', fn)
  }, [])

  return (
    <div style={{
      minHeight: '100vh',
      fontFamily: "'Outfit', sans-serif",
      overflowX: 'hidden',
      color: '#0b0f19',
      backgroundImage: `
        radial-gradient(at 0% 0%,   hsla(110,100%,97%,1) 0, transparent 55%),
        radial-gradient(at 50% 0%,  hsla(150,100%,98%,1) 0, transparent 55%),
        radial-gradient(at 100% 0%, hsla(140,100%,97%,1) 0, transparent 55%),
        radial-gradient(at 0% 50%,  hsla(110,100%,98%,1) 0, transparent 55%),
        radial-gradient(at 100% 50%,hsla(160,100%,97%,1) 0, transparent 55%),
        radial-gradient(at 0% 100%, hsla(140,100%,97%,1) 0, transparent 55%),
        radial-gradient(at 50% 100%,hsla(110,100%,98%,1) 0, transparent 55%),
        radial-gradient(at 100% 100%,hsla(160,100%,97%,1) 0, transparent 55%)
      `,
      backgroundColor: '#f0fdf4',
      backgroundAttachment: 'fixed',
    }}>

      {/* ─── NAVBAR ─── */}
      <nav style={{
        position: 'fixed', top: '1rem', left: '50%',
        transform: 'translateX(-50%)', zIndex: 50,
        width: '96%', maxWidth: '1400px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0.75rem 2rem',
        background: scrolled ? 'rgba(255,255,255,0.88)' : 'rgba(255,255,255,0.5)',
        backdropFilter: 'blur(18px)',
        border: '1px solid rgba(29,255,47,0.14)',
        borderRadius: '1.5rem',
        boxShadow: scrolled ? '0 6px 24px rgba(0,0,0,0.06)' : 'none',
        transition: 'all 0.4s ease',
      }}>
        <Link href="/" style={{ display:'flex', alignItems:'center', gap:'0.65rem', textDecoration:'none' }}>
          <div style={{
            width:'2.2rem', height:'2.2rem', background:'#0b0f19',
            borderRadius:'0.6rem', display:'flex', alignItems:'center',
            justifyContent:'center', boxShadow:'0 0 12px rgba(29,255,47,0.3)',
          }}>
            <GraduationCap style={{ color:'#1dff2f', width:'1.1rem', height:'1.1rem' }} />
          </div>
          <span style={{ fontWeight:900, fontSize:'0.95rem', color:'#0b0f19',
            letterSpacing:'-0.04em', textTransform:'uppercase' }}>
            EduNotes<span style={{ color:'#1dff2f' }}>.</span>
          </span>
        </Link>

        <div style={{ display:'flex', alignItems:'center', gap:'2.5rem' }} className="hidden md:flex">
          {[{label:'Fonctionnalités', href:'#features'}, {label:'Démo', href:'#demo'}, {label:'Institutions', href:'#institutions'}].map(item => (
            <a key={item.label} href={item.href} style={{
              fontSize:'0.58rem', fontWeight:900, textTransform:'uppercase',
              letterSpacing:'0.2em', color:'#475569', textDecoration:'none', transition:'color 0.2s',
            }}
              onClick={(e) => {
                if (item.label === 'Démo') {
                  e.preventDefault()
                  setVideoOpen(true)
                }
              }}
              onMouseEnter={e => (e.currentTarget.style.color = '#16a34a')}
              onMouseLeave={e => (e.currentTarget.style.color = '#475569')}
            >{item.label}</a>
          ))}
          <Link href="/login" style={{
            padding:'0.55rem 1.5rem',
            background:'#0b0f19', color:'#1dff2f',
            fontWeight:900, borderRadius:'9999px',
            fontSize:'0.58rem', textTransform:'uppercase', letterSpacing:'0.15em',
            textDecoration:'none',
            border:'1px solid rgba(29,255,47,0.3)',
            boxShadow:'0 0 14px rgba(29,255,47,0.15)',
          }}>Connexion Élite</Link>
        </div>

        <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden"
          style={{ padding:'0.5rem', background:'rgba(29,255,47,0.08)',
            borderRadius:'0.6rem', border:'1px solid rgba(29,255,47,0.2)',
            cursor:'pointer', color:'#0b0f19' }}>
          <Menu style={{ width:'1.1rem', height:'1.1rem' }} />
        </button>
      </nav>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div initial={{ opacity:0, y:-16 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-16 }}
            style={{
              position:'fixed', top:'5rem', left:'1rem', right:'1rem', zIndex:60,
              background:'rgba(255,255,255,0.96)', backdropFilter:'blur(20px)',
              border:'1px solid rgba(29,255,47,0.18)', padding:'1.5rem',
              borderRadius:'1.5rem', boxShadow:'0 20px 60px rgba(0,0,0,0.1)',
            }}>
            <div style={{ display:'flex', flexDirection:'column', gap:'0.75rem' }}>
              {[{label:'Fonctionnalités', href:'#features'}, {label:'Démo', href:'#demo'}, {label:'Institutions', href:'#institutions'}].map(item => (
                <a key={item.label} href={item.href} onClick={(e) => {
                  if (item.label === 'Démo') { e.preventDefault(); setVideoOpen(true); }
                  setMobileOpen(false);
                }} style={{
                  display:'block', padding:'0.85rem', background:'rgba(29,255,47,0.05)',
                  color:'#0b0f19', textAlign:'center', fontWeight:800, borderRadius:'0.9rem',
                  textDecoration:'none', fontSize:'0.65rem', textTransform:'uppercase', letterSpacing:'0.15em',
                  border:'1px solid rgba(29,255,47,0.1)'
                }}>{item.label}</a>
              ))}
              <Link href="/login" style={{
                display:'block', padding:'0.85rem', background:'#0b0f19', color:'#1dff2f',
                textAlign:'center', fontWeight:900, borderRadius:'0.9rem',
                textDecoration:'none', fontSize:'0.68rem', textTransform:'uppercase', letterSpacing:'0.15em',
              }}>CONNEXION</Link>
              <button onClick={() => setMobileOpen(false)} style={{
                display:'block', width:'100%', padding:'0.85rem',
                border:'1px solid rgba(0,0,0,0.1)', background:'transparent',
                color:'#64748b', fontWeight:900, borderRadius:'0.9rem',
                cursor:'pointer', fontSize:'0.58rem', textTransform:'uppercase', letterSpacing:'0.1em',
              }}>Fermer</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── HERO SECTION ─── full width ─── */}
      <section style={{
        width: '100%',
        padding: '8.5rem 5% 4rem',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '3%',
        alignItems: 'center',
        minHeight: '100vh',
        boxSizing: 'border-box',
      }} className="hero-grid">

        {/* LEFT — Description */}
        <motion.div initial={{ opacity:0, x:-30 }} animate={{ opacity:1, x:0 }}
          transition={{ duration:0.8 }}
          style={{ display:'flex', flexDirection:'column', gap:'1.75rem' }}>

          {/* Badge */}
          <div style={{
            display:'inline-flex', alignItems:'center', gap:'0.5rem',
            padding:'0.4rem 1rem',
            background:'rgba(29,255,47,0.07)',
            border:'1px solid rgba(29,255,47,0.2)',
            borderRadius:'9999px', width:'fit-content',
          }}>
            <span style={{
              width:'0.4rem', height:'0.4rem', background:'#1dff2f',
              borderRadius:'50%', boxShadow:'0 0 7px rgba(29,255,47,0.7)',
              display:'inline-block', animation:'pulseGreen 2s infinite',
            }} />
            <span style={{ fontSize:'0.7rem', fontWeight:900, color:'#16a34a',
              textTransform:'uppercase', letterSpacing:'0.3em' }}>
              Plateforme Académique Élite — v4.0
            </span>
          </div>

          {/* Headline */}
          <div>
            <h1 style={{
              fontSize:'clamp(3rem,5.5vw,6.5rem)',
              fontWeight:900, lineHeight:0.92, letterSpacing:'-0.05em', margin:'0 0 0.35rem',
            }}>
              La gestion des notes,
            </h1>
            <h1 style={{
              fontSize:'clamp(3rem,5.5vw,6.5rem)',
              fontWeight:900, lineHeight:0.92, letterSpacing:'-0.05em', margin:0,
              color:'#1dff2f',
              textShadow:'0 0 40px rgba(29,255,47,0.3)',
            }}>
              réinventée.
            </h1>
          </div>

          {/* Description */}
          <p style={{ fontSize:'1.15rem', color:'#475569', lineHeight:1.8, maxWidth:'34rem', margin:0 }}>
            <strong style={{ color:'#0b0f19' }}>EduNotes</strong> est la plateforme SaaS tout-en-un
            pour les établissements d'excellence. Saisie de notes, bulletins certifiés par QR code,
            analytics en temps réel et gestion multi-rôles — le tout dans une interface pensée pour la performance académique.
          </p>

          {/* Sub-features pills */}
          <div style={{ display:'flex', flexWrap:'wrap', gap:'0.5rem' }}>
            {[
              { icon: QrCode,     label: 'Bulletins QR' },
              { icon: BarChart2,  label: 'Analytics live' },
              { icon: Layers,     label: 'Multi-rôles' },
              { icon: ShieldCheck,label: 'Sécurisé' },
            ].map(({ icon: Icon, label }) => (
              <div key={label} style={{
                display:'inline-flex', alignItems:'center', gap:'0.35rem',
                padding:'0.4rem 0.9rem',
                background:'rgba(255,255,255,0.7)',
                border:'1px solid rgba(29,255,47,0.15)',
                borderRadius:'9999px', backdropFilter:'blur(10px)',
              }}>
                <Icon style={{ width:'0.95rem', height:'0.95rem', color:'#16a34a' }} />
                <span style={{ fontSize:'0.82rem', fontWeight:700, color:'#334155' }}>{label}</span>
              </div>
            ))}
          </div>

          {/* STATS row */}
          <div style={{ display:'flex', gap:'2rem', flexWrap:'wrap' }}>
            {[
              { to:2800,  label:'Utilisateurs', accent:'#1dff2f' },
              { to:156,   label:'Institutions',  accent:'#6366f1' },
              { to:48500, label:'Notes saisies',  accent:'#f59e0b' },
            ].map(s => (
              <div key={s.label}>
                <div style={{ fontSize:'2.4rem', fontWeight:900, color:s.accent,
                  letterSpacing:'-0.05em', lineHeight:1 }}>
                  <Counter to={s.to} /><span>+</span>
                </div>
                <div style={{ fontSize:'0.75rem', fontWeight:700, color:'#94a3b8',
                  textTransform:'uppercase', letterSpacing:'0.1em', marginTop:'0.2rem' }}>
                  {s.label}
                </div>
              </div>
            ))}
          </div>

          {/* CTA buttons */}
          <div style={{ display:'flex', gap:'0.9rem', flexWrap:'wrap' }}>
            <Link href="/login" style={{
              display:'inline-flex', alignItems:'center', gap:'0.5rem',
              padding:'0.85rem 2.1rem',
              background:'#0b0f19', color:'#1dff2f',
              fontWeight:900, fontSize:'0.8rem',
              textTransform:'uppercase', letterSpacing:'0.2em',
              borderRadius:'9999px', textDecoration:'none',
              border:'1px solid rgba(29,255,47,0.3)',
              boxShadow:'0 0 22px rgba(29,255,47,0.2)',
            }}>
              Démarrer maintenant <ArrowRight style={{ width:'1rem', height:'1rem' }} />
            </Link>
            <button onClick={() => setVideoOpen(true)} style={{
              display:'inline-flex', alignItems:'center', gap:'0.5rem',
              padding:'0.85rem 1.75rem',
              background:'rgba(255,255,255,0.75)', color:'#0b0f19',
              fontWeight:900, fontSize:'0.8rem',
              textTransform:'uppercase', letterSpacing:'0.2em',
              borderRadius:'9999px', cursor:'pointer',
              border:'1px solid rgba(0,0,0,0.1)',
              backdropFilter:'blur(10px)',
            }}>
              <Play style={{ width:'1rem', height:'1rem', color:'#16a34a' }} />
              Voir la démo
            </button>
          </div>
        </motion.div>

        {/* RIGHT — Photo étudiants IUG Dell */}
        <motion.div initial={{ opacity:0, x:30, scale:0.96 }}
          animate={{ opacity:1, x:0, scale:1 }}
          transition={{ duration:0.9, delay:0.2 }}
          style={{ position:'relative', height:'100%', display:'flex', alignItems:'center' }}>

          <div style={{
            borderRadius:'1.75rem',
            overflow:'hidden',
            /* cadre très discret : border fine et ombre légère */
            border:'1px solid rgba(0,0,0,0.07)',
            boxShadow:'0 24px 70px rgba(0,0,0,0.1), 0 0 0 1px rgba(255,255,255,0.5)',
            background:'#fff',
            position:'relative',
            width:'100%',
          }}>
            <img
              src="/images/student_iug_dell.png"
              alt="Étudiants IUG travaillant sur des ordinateurs Dell"
              style={{ width:'100%', height:'auto', display:'block', borderRadius:'1.75rem' }}
            />
            {/* Léger gradient en haut pour fondre avec le fond de page */}
            <div style={{
              position:'absolute', inset:0,
              background:'linear-gradient(160deg, rgba(240,253,244,0.12) 0%, transparent 40%)',
              pointerEvents:'none', borderRadius:'1.75rem',
            }} />
          </div>

          {/* Badge flottant bas-gauche */}
          <motion.div
            animate={{ y:[0, -7, 0] }}
            transition={{ duration:3, repeat:Infinity, ease:'easeInOut' }}
            style={{
              position:'absolute', bottom:'-1.2rem', left:'-1.2rem',
              padding:'0.85rem 1.25rem',
              background:'rgba(255,255,255,0.96)',
              backdropFilter:'blur(20px)',
              border:'1px solid rgba(0,0,0,0.07)',
              borderRadius:'1.25rem',
              boxShadow:'0 10px 32px rgba(0,0,0,0.08)',
              display:'flex', alignItems:'center', gap:'0.65rem',
            }}>
            <div style={{
              width:'2.2rem', height:'2.2rem', background:'#1dff2f',
              borderRadius:'0.6rem',
              display:'flex', alignItems:'center', justifyContent:'center',
            }}>
              <ShieldCheck style={{ width:'1rem', height:'1rem', color:'#0b0f19' }} />
            </div>
            <div>
              <div style={{ fontSize:'0.48rem', fontWeight:900, color:'#16a34a',
                textTransform:'uppercase', letterSpacing:'0.15em' }}>Certifié Elite</div>
              <div style={{ fontSize:'0.85rem', fontWeight:900, color:'#0b0f19' }}>100 % Intégrité</div>
            </div>
          </motion.div>

          {/* Badge flottant haut-droite */}
          <motion.div
            animate={{ y:[0, 5, 0] }}
            transition={{ duration:2.5, repeat:Infinity, ease:'easeInOut', delay:0.5 }}
            style={{
              position:'absolute', top:'-0.75rem', right:'-0.75rem',
              padding:'0.7rem 1.1rem',
              background:'#0b0f19',
              border:'1px solid rgba(29,255,47,0.25)',
              borderRadius:'1rem',
              boxShadow:'0 0 18px rgba(29,255,47,0.18)',
              display:'flex', alignItems:'center', gap:'0.45rem',
            }}>
            <span style={{ fontSize:'0.5rem', fontWeight:900, color:'#1dff2f',
              textTransform:'uppercase', letterSpacing:'0.12em' }}>IUG Live</span>
            <span style={{
              width:'0.4rem', height:'0.4rem', background:'#1dff2f',
              borderRadius:'50%', boxShadow:'0 0 7px rgba(29,255,47,0.9)',
              display:'inline-block', animation:'pulseGreen 1.5s infinite',
            }} />
          </motion.div>
        </motion.div>
      </section>

      {/* ─── FEATURES + STATS ─── full width ─── */}
      <section id="features" style={{
        width:'100%', padding:'4rem 5%', boxSizing:'border-box',
        background:'rgba(255,255,255,0.28)', backdropFilter:'blur(6px)',
        borderTop:'1px solid rgba(29,255,47,0.08)',
        borderBottom:'1px solid rgba(29,255,47,0.08)',
      }}>
        <div style={{ maxWidth:'1400px', margin:'0 auto', display:'flex', flexDirection:'column', gap:'3rem' }}>

          {/* Section title */}
          <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between', flexWrap:'wrap', gap:'1rem' }}>
            <div>
              <h2 style={{ fontSize:'clamp(2rem,3.2vw,3.2rem)', fontWeight:900,
                letterSpacing:'-0.05em', margin:'0 0 0.5rem' }}>
                <span style={{ color:'#1dff2f' }}>Fonctionnalités</span> Elite
              </h2>
              <p style={{ fontSize:'1.05rem', color:'#64748b', margin:0 }}>
                La plateforme tout-en-un pour l'excellence académique.
              </p>
            </div>
            {/* Stats inline — à droite du titre */}
            <div style={{ display:'flex', gap:'2rem', flexWrap:'wrap' }}>
              {[
                { to:2800,  label:'Utilisateurs', accent:'#1dff2f',  icon: Users    },
                { to:48500, label:'Notes saisies', accent:'#6366f1',  icon: FileText },
                { to:156,   label:'Institutions',  accent:'#f59e0b',  icon: Globe    },
              ].map((s, i) => (
                <motion.div key={i}
                  initial={{ opacity:0, y:10 }}
                  whileInView={{ opacity:1, y:0 }}
                  viewport={{ once:true }}
                  transition={{ delay:i*0.1 }}
                  style={{ display:'flex', alignItems:'center', gap:'0.65rem' }}>
                  <div style={{
                    width:'2.25rem', height:'2.25rem',
                    background:`${s.accent}15`,
                    borderRadius:'0.65rem',
                    display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0,
                  }}>
                    <s.icon style={{ width:'1rem', height:'1rem', color:s.accent }} />
                  </div>
                  <div>
                    <div style={{ fontSize:'1.8rem', fontWeight:900, color:'#0b0f19',
                      letterSpacing:'-0.05em', lineHeight:1 }}>
                      <Counter to={s.to} /><span style={{ color:s.accent }}>+</span>
                    </div>
                    <div style={{ fontSize:'0.7rem', fontWeight:700, color:'#94a3b8',
                      textTransform:'uppercase', letterSpacing:'0.1em' }}>{s.label}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Features — 4 en haut, 2 en bas au centre */}
          <div style={{
            display:'flex',
            flexWrap:'wrap',
            justifyContent: 'center', /* Centre les 2 cartes de la rangée du bas */
            gap:'1.5rem',
            maxWidth:'1050px', /* Idéal pour 4 cartes fines par ligne */
            margin:'0 auto',
          }} className="features-grid">
            {FEATURES.map((f, i) => (
              <motion.div key={f.label}
                initial={{ opacity:0, y:30 }}
                whileInView={{ opacity:1, y:0 }}
                viewport={{ once:true }}
                transition={{ delay:i*0.1 }}
                whileHover={{ scale: 1.02, y: -10, boxShadow:'0 40px 80px rgba(0,0,0,0.12)' }}
                style={{
                  '--glow-color': f.color,
                  flex: '0 0 calc(25% - 1.125rem)', /* 4 items per row accounting for 1.5rem gap */
                  minWidth: '220px',
                  display:'flex', flexDirection: 'column', alignItems:'center', gap:'1rem',
                  padding:'3rem 1.25rem', /* Padding réduit pour plus de finesse */
                  background:'rgba(255,255,255,0.92)',
                  backdropFilter:'blur(16px)',
                  border:'1px solid rgba(255,255,255,0.8)',
                  borderRadius:'2rem',
                  boxShadow:'0 20px 40px rgba(0,0,0,0.07), 0 1px 3px rgba(0,0,0,0.04)',
                  transition:'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                  cursor:'pointer',
                  textAlign: 'center',
                  minHeight: '22rem', /* Plus délicat visuellement */
                } as React.CSSProperties} className="feature-card">
                {/* Icône — fine et élégante */}
                <div className="icon-wrapper" style={{
                  width:'4rem', height:'4rem', /* Plus petit et élégant */
                  background:`linear-gradient(135deg, ${f.color}25 0%, ${f.color}05 100%)`,
                  borderRadius:'1.25rem',
                  display:'flex', alignItems:'center', justifyContent:'center',
                  border:`1px solid ${f.color}40`,
                  flexShrink:0,
                  boxShadow:`inset 0 0 20px ${f.color}30`,
                  position:'relative', zIndex:2,
                }}>
                  <f.icon className="icon-svg" style={{ width:'2rem', height:'2rem', color:f.color }} />
                </div>
                {/* Textes */}
                <div style={{ position:'relative', zIndex:2 }} className="feature-card-text">
                  <h3 style={{
                    fontSize:'1.1rem', fontWeight:700, color:'#0b0f19', /* Poids encore diminué (700) */
                    letterSpacing:'0.04em', margin:0,
                    textTransform:'uppercase', lineHeight:1.3,
                  }}>
                    {f.label}
                  </h3>
                  <div className="feature-desc-wrapper">
                    <p className="feature-desc" style={{
                      fontSize:'0.85rem', color:'#64748b', fontWeight:300, /* Typographie légère (300) et plus petite */
                      lineHeight:1.75, margin:0, paddingTop:'0.75rem',
                    }}>
                      {f.desc}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

        </div>
      </section>

      {/* ─── INSTITUTIONS LOGOS MARQUEE ─── full width ─── */}
      <section id="institutions" style={{ 
        width: '100%', padding: '6rem 0', background: '#ffffff', 
        borderBottom: '1px solid rgba(0,0,0,0.05)', overflow: 'hidden' 
      }}>
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.25em', color: '#94a3b8', margin: 0 }}>
            Ils nous font confiance
          </h2>
          <p style={{ fontSize: '2.4rem', fontWeight: 900, color: '#0b0f19', letterSpacing: '-0.04em', margin: '0.5rem 0 0' }}>
            Plus de 150 <span style={{ color: '#16a34a' }}>institutions partenaires</span>
          </p>
        </div>
        
        <div className="marquee-container" style={{ display: 'flex', whiteSpace: 'nowrap', maskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)' }}>
          <div className="marquee-content" style={{ display: 'flex', gap: '5rem', alignItems: 'center' }}>
            {['IUG - Sup de Co', 'Lycée Jos', 'Institut Saint-Jean', 'Lycée Leclerc', 'Collège Vogt', 'Lycée Bilingue', 'IUG - Sup de Co', 'Lycée Jos', 'Institut Saint-Jean', 'Lycée Leclerc', 'Collège Vogt', 'Lycée Bilingue'].map((name, i) => (
              <div key={i} style={{ 
                fontSize: '1.4rem', fontWeight: 900, color: '#cbd5e1', 
                textTransform: 'uppercase', letterSpacing: '0.05em',
                display: 'flex', alignItems: 'center', gap: '0.75rem',
                filter: 'grayscale(100%) opacity(70%)',
                transition: 'all 0.3s ease',
                cursor: 'default'
              }}
                onMouseEnter={e => { e.currentTarget.style.filter = 'grayscale(0%) opacity(100%)'; e.currentTarget.style.color = '#0b0f19' }}
                onMouseLeave={e => { e.currentTarget.style.filter = 'grayscale(100%) opacity(70%)'; e.currentTarget.style.color = '#cbd5e1' }}
              >
                <div style={{ width: '2rem', height: '2rem', background: 'rgba(0,0,0,0.04)', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Globe style={{ color: '#94a3b8', width: '1.2rem', height: '1.2rem' }} />
                </div>
                {name}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA DARK ─── full width ─── */}
      <section style={{ width:'100%', padding:'2rem 5% 4rem', boxSizing:'border-box' }}>
        <motion.div
          initial={{ opacity:0, scale:0.97 }}
          whileInView={{ opacity:1, scale:1 }}
          viewport={{ once:true }}
          style={{
            maxWidth:'900px', margin:'0 auto',
            padding:'3.5rem 4rem',
            background:'#0b0f19',
            borderRadius:'2rem',
            border:'1px solid rgba(29,255,47,0.15)',
            boxShadow:'0 0 60px rgba(29,255,47,0.07)',
            textAlign:'center',
            display:'flex', flexDirection:'column', alignItems:'center', gap:'1.5rem',
          }}>
          <Sparkles style={{ width:'2rem', height:'2rem', color:'#1dff2f' }} />
          <h2 style={{ fontSize:'clamp(2.2rem,4vw,3.8rem)', fontWeight:900,
            letterSpacing:'-0.05em', color:'#fff', lineHeight:0.95, margin:0 }}>
            Rejoignez l'excellence <span style={{ color:'#1dff2f' }}>Elite.</span>
          </h2>
          <p style={{ fontSize:'1.05rem', color:'#94a3b8', maxWidth:'28rem', lineHeight:1.75, margin:0 }}>
            Ne vous contentez pas de gérer les notes.<br />
            Dominez l'administration académique avec EduNotes.
          </p>
          <Link href="/login" style={{
            display:'inline-flex', alignItems:'center', gap:'0.6rem',
            padding:'0.9rem 2.5rem',
            background:'#1dff2f', color:'#0b0f19',
            fontWeight:900, fontSize:'0.8rem',
            textTransform:'uppercase', letterSpacing:'0.25em',
            borderRadius:'9999px', textDecoration:'none',
            boxShadow:'0 0 28px rgba(29,255,47,0.38)',
          }}>
            Accéder à la console Maître <ArrowRight style={{ width:'1rem', height:'1rem' }} />
          </Link>
        </motion.div>
      </section>

      {/* ─── FOOTER ─── full width ─── */}
      <footer style={{
        borderTop:'1px solid rgba(29,255,47,0.08)',
        padding:'2.5rem 5%',
        width:'100%', boxSizing:'border-box',
      }}>
        <div style={{ maxWidth:'1400px', margin:'0 auto',
          display:'flex', justifyContent:'space-between',
          alignItems:'center', flexWrap:'wrap', gap:'1.25rem' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'0.65rem' }}>
            <div style={{
              width:'2.4rem', height:'2.4rem', background:'#0b0f19',
              borderRadius:'0.7rem', display:'flex', alignItems:'center',
              justifyContent:'center', boxShadow:'0 0 12px rgba(29,255,47,0.22)',
            }}>
              <GraduationCap style={{ color:'#1dff2f', width:'1.1rem', height:'1.1rem' }} />
            </div>
            <span style={{ fontWeight:900, fontSize:'0.95rem', color:'#0b0f19',
              letterSpacing:'-0.04em', textTransform:'uppercase' }}>EduNotes Elite</span>
          </div>

          <div style={{ display:'flex', gap:'2rem' }}>
            {['Termes','Confidentialité','Support Elite'].map(item => (
              <a key={item} href="#" style={{
                fontSize:'0.55rem', fontWeight:900, color:'#94a3b8',
                textTransform:'uppercase', letterSpacing:'0.12em', textDecoration:'none', transition:'color 0.2s',
              }}
                onMouseEnter={e => (e.currentTarget.style.color = '#16a34a')}
                onMouseLeave={e => (e.currentTarget.style.color = '#94a3b8')}
              >{item}</a>
            ))}
          </div>

          <div style={{ fontSize:'0.5rem', fontWeight:900, color:'#cbd5e1',
            textTransform:'uppercase', letterSpacing:'0.18em' }}>
            © 2026 ELITE EDUNOTES ENTERPRISE
          </div>
        </div>
      </footer>

      {/* ─── VIDEO MODAL ─── */}
      <AnimatePresence>
        {videoOpen && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            style={{
              position:'fixed', inset:0, zIndex:1000,
              background:'rgba(0,0,0,0.82)', backdropFilter:'blur(12px)',
              display:'flex', alignItems:'center', justifyContent:'center', padding:'1.5rem',
            }}
            onClick={() => setVideoOpen(false)}>
            <motion.div initial={{ scale:0.9, opacity:0 }} animate={{ scale:1, opacity:1 }}
              exit={{ scale:0.9, opacity:0 }}
              style={{
                position:'relative', maxWidth:'56rem', width:'100%',
                background:'#0b0f19', borderRadius:'2rem',
                overflow:'hidden', border:'1px solid rgba(29,255,47,0.15)',
              }}
              onClick={e => e.stopPropagation()}>
              <button onClick={() => setVideoOpen(false)} style={{
                position:'absolute', top:'1rem', right:'1rem', zIndex:10,
                padding:'0.55rem', background:'rgba(255,255,255,0.1)',
                border:'1px solid rgba(255,255,255,0.2)',
                borderRadius:'9999px', cursor:'pointer', color:'#fff',
              }}>
                <X style={{ width:'0.9rem', height:'0.9rem' }} />
              </button>
              <video src="/8830391-hd_1080_1920_30fps.mp4" autoPlay controls
                style={{ width:'100%', maxHeight:'80vh', objectFit:'contain' }} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @keyframes pulseGreen {
          0%,100% { opacity:1; transform:scale(1); }
          50%      { opacity:0.65; transform:scale(1.2); }
        }
        @keyframes rotateGlow {
          0% { transform: translate(-50%, -50%) rotate(0deg); }
          100% { transform: translate(-50%, -50%) rotate(360deg); }
        }
        
        /* 1. Base Feature Card */
        .feature-card {
          position: relative;
          overflow: hidden;
          z-index: 1;
        }
        
        /* 2. Glow animé au survol (Lueur Néon dynamique par couleur) */
        .feature-card::before {
          content: '';
          position: absolute;
          top: 50%; left: 50%;
          width: 180%; height: 600%;
          background: conic-gradient(from 0deg, transparent 70%, var(--glow-color) 100%);
          animation: rotateGlow 3.5s linear infinite;
          opacity: 0;
          transition: opacity 0.5s ease;
          z-index: -1;
          pointer-events: none;
        }
        .feature-card:hover {
          border-color: var(--glow-color) !important;
        }
        .feature-card:hover::before {
          opacity: 0.7; /* Légèrement réduit pour ne pas trop éblouir avec les nouvelles couleurs */
        }
        
        /* 3. Apparition progressive du texte (Expand & Reveal) */
        .feature-desc-wrapper {
          display: grid;
          grid-template-rows: 0fr;
          transition: grid-template-rows 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        .feature-card:hover .feature-desc-wrapper {
          grid-template-rows: 1fr;
        }
        .feature-desc {
          overflow: hidden;
          opacity: 0;
          transition: opacity 0.3s ease, transform 0.4s ease;
          transform: translateY(-8px);
        }
        .feature-card:hover .feature-desc {
          opacity: 1;
          transform: translateY(0);
          transition-delay: 0.15s;
        }

        /* 4. Mini-animations d'icône au survol */
        .icon-svg {
          transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), filter 0.4s ease;
        }
        .feature-card:hover .icon-svg {
          transform: scale(1.23) rotate(8deg);
          filter: drop-shadow(0 0 16px var(--glow-color));
        }

        /* 5. Infinite horizontal marquee */
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(calc(-50% - 2.5rem)); }
        }
        .marquee-container {
          width: 100%;
          overflow: hidden;
        }
        .marquee-content {
          animation: marquee 25s linear infinite;
          width: inline-block;
          will-change: transform;
        }
        .marquee-content:hover {
          animation-play-state: paused;
        }

        @media (max-width: 1100px) {
          /* Adjust features grid/list if needed */
        }
        @media (max-width: 700px) {
          .hero-grid     { grid-template-columns: 1fr !important; min-height: auto !important; }
          .feature-card  { flex-direction: column !important; text-align: center !important; gap: 1.5rem !important; padding: 2rem !important; }
          .feature-card-text { text-align: center !important; }
          .feature-card-arrow { display: none !important; }
        }
        @media (max-width: 480px) {
          /* additional small screen tweaks */
        }
      `}</style>
    </div>
  )
}
