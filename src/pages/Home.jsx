import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getAllData } from '../api/airtable'

const C = {
  green:   '#00653A',
  greenDk: '#003e22',
  gold:    '#FFC200',
  goldDk:  '#C99700',
  cyan:    '#00b8b8',
  dark:    '#0a1612',
  cream:   '#fdf6e3',
  stone:   '#5a5953',
  hot:     '#ff5a1f',
}

const COVER_PALETTES = [
  ['#1a472a', '#40916c'],
  ['#023047', '#126782'],
  ['#3d0c11', '#9b2335'],
  ['#4a1942', '#7b2d8b'],
  ['#1b2838', '#2b4c7e'],
  ['#2d3436', '#636e72'],
  ['#4a3728', '#8b6355'],
  ['#1a3a1a', '#2d6a2d'],
]
function getBookColors(title = '') {
  const sum = [...title].reduce((a, c) => a + c.charCodeAt(0), 0)
  return COVER_PALETTES[sum % COVER_PALETTES.length]
}

function BookCover({ title = '', author = '', coverUrl = '', w = 80 }) {
  const h = Math.round(w * 1.45)
  if (coverUrl) {
    return (
      <img
        src={coverUrl}
        alt={title}
        style={{ width: w, height: h, objectFit: 'cover', flexShrink: 0, display: 'block' }}
      />
    )
  }
  const [c1, c2] = getBookColors(title)
  const fs = w * 0.13
  return (
    <div style={{
      width: w, height: h, flexShrink: 0, overflow: 'hidden', position: 'relative',
      background: `linear-gradient(135deg, ${c1} 0%, ${c1} 55%, ${c2} 55%, ${c2} 100%)`,
      boxShadow: 'inset 0 0 0 1px rgba(0,0,0,.25)',
      color: '#f6e8c4',
    }}>
      <div style={{ position: 'absolute', inset: 0, padding: w * 0.08, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div style={{ fontFamily: "'Anton','Impact',sans-serif", fontSize: fs * 1.15, lineHeight: 1.0, textShadow: '0 1px 2px rgba(0,0,0,.45)', textTransform: 'uppercase' }}>
          {title}
        </div>
        <div style={{ fontFamily: "'Oswald',sans-serif", fontSize: fs * 0.65, opacity: 0.92, textTransform: 'uppercase', letterSpacing: '0.04em', textAlign: 'right' }}>
          {author}
        </div>
      </div>
      <div style={{ position: 'absolute', top: 0, bottom: 0, left: 0, width: '6%', background: 'rgba(0,0,0,.2)' }} />
    </div>
  )
}

function Stamp({ children, color = C.hot, rotate = -6, size = 80 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: color, color: '#fff',
      border: `3px solid ${C.dark}`,
      boxShadow: `3px 3px 0 ${C.dark}`,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      transform: `rotate(${rotate}deg)`, textAlign: 'center',
      fontFamily: "'Anton','Impact',sans-serif",
      fontSize: size * 0.13, lineHeight: 1, letterSpacing: '0.02em',
    }}>
      {children}
    </div>
  )
}

const TICKER_PICKS = [
  ['@molly.k', 'Fourth Wing', 'Trae Young', '+18.4'],
  ['@devon-9', 'Way of Kings', 'Giannis', '+22.1'],
  ['@bookbrat', 'Babel', 'Haliburton', '+15.7'],
  ['@henryx', 'Project HM', 'Jokic', '+11.3'],
  ['@jjbooks', 'Name of the Wind', 'Curry', '+9.8'],
  ['@samtravis', 'Iron Flame', 'Kawhi', '+17.0'],
  ['@lib.7', 'Atlas Six', 'Wemby', '+8.5'],
]

export default function Home() {
  const navigate = useNavigate()
  const [totalBooks, setTotalBooks] = useState('—')
  const [totalComps, setTotalComps] = useState('—')
  const [hofBooks, setHofBooks] = useState([])

  useEffect(() => {
    getAllData().then(data => {
      const books = data.books || []
      setTotalBooks(books.length)
      const compsCount = books.filter(b => b.characters?.some(c => c.player)).length
      setTotalComps(compsCount)
      const hof = books
        .filter(b => b.rating > 0 && b.characters?.some(c => c.player))
        .sort((a, b) => {
          if (b.rating !== a.rating) return b.rating - a.rating
          return new Date(b.dateFinished || 0) - new Date(a.dateFinished || 0)
        })
        .slice(0, 5)
      setHofBooks(hof)
    }).catch(() => {})
  }, [])

  const navItems = [
    { label: 'HOME', to: '/' },
    { label: 'DRAFT', to: '/draft' },
    { label: 'SCOUT REPORTS', to: '/scout-reports' },
    { label: 'HALL OF FAME', to: '/hall-of-fame' },
  ]

  return (
    <div style={{
      minHeight: '100vh', background: C.cream, display: 'flex', flexDirection: 'column',
      fontFamily: "'DM Sans', system-ui, sans-serif", color: C.dark, position: 'relative',
    }}>
      {/* TOP BAR */}
      <div style={{
        background: C.dark, height: 60, display: 'flex', alignItems: 'center',
        padding: '0 24px', borderBottom: `4px solid ${C.gold}`,
        position: 'sticky', top: 0, zIndex: 40, flexShrink: 0,
      }}>
        <Link to="/" style={{ textDecoration: 'none' }}>
          <div style={{
            fontFamily: "'Anton','Impact',sans-serif",
            fontSize: 30, color: C.gold,
            textShadow: `2px 2px 0 ${C.hot}`, letterSpacing: '0.02em',
            textTransform: 'uppercase', lineHeight: 1,
          }}>
            COURT<span style={{ color: C.cyan }}>'</span>READS
          </div>
        </Link>
        <div style={{ flex: 1 }} />
        <nav style={{ display: 'flex', gap: 4 }}>
          {navItems.map((item, i) => (
            <Link key={item.to} to={item.to} style={{ textDecoration: 'none' }}>
              <span style={{
                padding: '8px 14px', fontSize: 12, cursor: 'pointer', display: 'block',
                fontFamily: "'Oswald',sans-serif", fontWeight: 700, letterSpacing: '0.04em',
                textTransform: 'uppercase',
                color: i === 0 ? C.dark : C.gold,
                background: i === 0 ? C.gold : 'transparent',
                border: i === 0 ? `2px solid ${C.gold}` : '2px solid transparent',
              }}>
                {item.label}
              </span>
            </Link>
          ))}
        </nav>
      </div>

      {/* DIAGONAL SLASH BAR */}
      <div style={{ display: 'flex', height: 30, flexShrink: 0, position: 'relative', zIndex: 5 }}>
        <div className="cr-slash-r" style={{
          background: C.hot, color: '#fff', padding: '0 36px 0 22px',
          fontFamily: "'Oswald',sans-serif", fontWeight: 700, textTransform: 'uppercase',
          fontSize: 11, display: 'flex', alignItems: 'center', letterSpacing: '0.16em',
          flexShrink: 0,
        }}>
          ● LIVE · 2025-26 SEASON · WEEK 12
        </div>
        <div className="cr-slash-r" style={{
          background: C.cyan, color: C.dark, marginLeft: -22, padding: '0 36px 0 32px',
          fontFamily: "'JetBrains Mono','IBM Plex Mono',monospace", fontWeight: 700,
          fontSize: 11, display: 'flex', alignItems: 'center', letterSpacing: '0.08em',
          flexShrink: 0,
        }}>
          GAME OF THE WEEK · YOU vs. THE HALL OF FAME
        </div>
        <div style={{
          flex: 1, background: C.dark, color: C.gold, display: 'flex', alignItems: 'center',
          justifyContent: 'flex-end', padding: '0 22px',
          fontFamily: "'JetBrains Mono','IBM Plex Mono',monospace", fontSize: 11, letterSpacing: '0.16em',
        }}>
          {totalBooks !== '—' ? `${totalBooks} BOOKS IN POOL` : ''}
        </div>
      </div>

      {/* HERO */}
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 460px', position: 'relative', overflow: 'hidden' }}>

        {/* halftone background detail */}
        <div className="cr-halftone" style={{
          position: 'absolute', left: 36, top: 80, width: 480, height: 480,
          opacity: 0.5, pointerEvents: 'none',
        }} />

        {/* LEFT */}
        <div style={{ padding: '48px 40px 40px 40px', position: 'relative', zIndex: 2 }}>

          <div style={{
            fontFamily: "'Oswald',sans-serif", fontWeight: 700, fontSize: 11,
            color: C.hot, letterSpacing: '0.22em', textTransform: 'uppercase',
          }}>
            ● 2025-26 SEASON
          </div>

          <div className="cr-shadow" style={{
            fontFamily: "'Anton','Impact',sans-serif",
            fontSize: 'clamp(72px, 10vw, 144px)', color: C.green, marginTop: 12,
            lineHeight: 1.0, textTransform: 'uppercase', letterSpacing: '0.01em',
          }}>
            DRAFT A<br />BETTER<br />
            <span style={{ color: C.gold, textShadow: `3px 3px 0 ${C.green}` }}>SHELF.</span>
          </div>

          {/* cyan underline accent */}
          <div style={{ width: 220, height: 8, background: C.cyan, marginTop: 14, boxShadow: `4px 4px 0 ${C.dark}` }} />

          <div style={{
            fontFamily: "'Oswald',sans-serif", fontWeight: 600,
            fontSize: 17, color: C.dark, marginTop: 28, maxWidth: 520,
            lineHeight: 1.4, letterSpacing: '0.01em',
          }}>
            Books become NBA players. You draft 5.
            We simulate a real basketball game vs. the Hall of Fame
            and read you the box score.
          </div>

          {/* CTAs */}
          <div style={{ display: 'flex', gap: 12, marginTop: 28, flexWrap: 'wrap' }}>
            <Link to="/draft" style={{ textDecoration: 'none' }}>
              <button style={{
                background: C.gold, color: C.dark, border: `3px solid ${C.dark}`,
                height: 56, padding: '0 26px', fontSize: 22, cursor: 'pointer',
                boxShadow: `4px 4px 0 ${C.dark}`, letterSpacing: '0.04em',
                display: 'flex', alignItems: 'center', gap: 10,
                fontFamily: "'Anton','Impact',sans-serif", textTransform: 'uppercase',
              }}>
                ▶ TIP OFF
              </button>
            </Link>
            <Link to="/scout-reports" style={{ textDecoration: 'none' }}>
              <button style={{
                background: C.dark, color: C.cyan, border: `3px solid ${C.dark}`,
                height: 56, padding: '0 22px', fontSize: 13, cursor: 'pointer',
                boxShadow: `4px 4px 0 ${C.cyan}`,
                fontFamily: "'Oswald',sans-serif", fontWeight: 700, letterSpacing: '0.04em',
                textTransform: 'uppercase',
              }}>
                VIEW THE LIBRARY
              </button>
            </Link>
          </div>

          {/* The Story panel */}
          <div style={{
            marginTop: 40, background: '#fff', border: `3px solid ${C.dark}`,
            maxWidth: 540, boxShadow: `4px 4px 0 ${C.dark}`,
          }}>
            <div style={{
              background: C.green, padding: '6px 14px',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <span style={{
                fontFamily: "'Oswald',sans-serif", fontWeight: 700, color: C.gold,
                fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase',
              }}>★ THE STORY</span>
              <span style={{
                fontFamily: "'JetBrains Mono','IBM Plex Mono',monospace",
                color: 'rgba(255,255,255,.7)', fontSize: 10,
              }}>EST. 2024</span>
            </div>
            <div style={{ padding: '14px 18px' }}>
              <div style={{
                fontFamily: "'Oswald',sans-serif", fontWeight: 700,
                color: C.green, fontSize: 22, letterSpacing: '0.04em', textTransform: 'uppercase',
              }}>
                WHAT IS COURT READS?
              </div>
              <div style={{ fontSize: 14, color: C.stone, marginTop: 10, lineHeight: 1.55 }}>
                Started as a reading tracker. It escalated. Now I assign NBA comps to
                fantasy books based on vibes — then draft them into fantasy lineups.
                Created by a lifelong Sonics fan with nothing to do on game nights.
              </div>
            </div>
          </div>

          {/* Mini stat strip */}
          <div style={{ display: 'flex', gap: 8, marginTop: 28, maxWidth: 540 }}>
            {[
              { n: totalBooks, l: 'BOOKS' },
              { n: totalComps, l: 'COMPS' },
              { n: '5', l: 'HALL OF FAME' },
              { n: '4', l: 'AI OPPONENTS' },
            ].map((s, i) => (
              <div key={i} style={{
                flex: 1, padding: '10px 4px', textAlign: 'center',
                background: '#fff', border: `2px solid ${C.dark}`,
              }}>
                <div className="cr-shadow-soft" style={{
                  fontFamily: "'Anton','Impact',sans-serif",
                  fontSize: 36, color: i % 2 ? C.goldDk : C.green, lineHeight: 1,
                }}>
                  {s.n}
                </div>
                <div style={{
                  fontFamily: "'JetBrains Mono','IBM Plex Mono',monospace",
                  fontSize: 9, color: C.stone, marginTop: 2, letterSpacing: '0.14em',
                }}>
                  {s.l}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT — Tonight's Matchup */}
        <div style={{ padding: '32px 28px 32px 12px', position: 'relative' }}>
          {/* GAME OF THE WEEK sticker */}
          <div style={{ position: 'absolute', top: 8, right: 8, zIndex: 4 }}>
            <Stamp color={C.hot} rotate={-8} size={90}>
              <div style={{ fontSize: 10 }}>GAME OF</div>
              <div style={{ fontSize: 22, lineHeight: 0.95 }}>THE WEEK</div>
            </Stamp>
          </div>

          {/* card */}
          <div className="cr-halftone-dark" style={{
            background: C.dark, color: '#fff',
            border: `3px solid ${C.dark}`,
            boxShadow: `5px 5px 0 ${C.cyan}`,
            position: 'relative', overflow: 'hidden',
          }}>
            {/* top strip */}
            <div style={{
              background: `linear-gradient(90deg, ${C.hot} 0%, ${C.gold} 100%)`,
              color: C.dark, padding: '6px 14px',
              fontFamily: "'Oswald',sans-serif", fontWeight: 700,
              fontSize: 12, letterSpacing: '0.16em', textTransform: 'uppercase',
              display: 'flex', justifyContent: 'space-between',
            }}>
              <span>★ TONIGHT&apos;S MATCHUP</span>
              <span style={{ fontFamily: "'JetBrains Mono','IBM Plex Mono',monospace", fontSize: 10 }}>WK 12</span>
            </div>

            <div style={{ padding: '22px 22px 18px' }}>
              {/* YOU row */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div className="cr-chrome" style={{
                  width: 62, height: 62, color: C.dark,
                  border: `2px solid ${C.dark}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: "'Anton','Impact',sans-serif", fontSize: 24, textTransform: 'uppercase',
                }}>YOU</div>
                <div>
                  <div style={{
                    fontFamily: "'Anton','Impact',sans-serif", fontSize: 28, color: '#fff',
                    textShadow: `2px 2px 0 ${C.dark}`, textTransform: 'uppercase',
                  }}>YOUR SQUAD</div>
                  <div style={{
                    fontFamily: "'JetBrains Mono','IBM Plex Mono',monospace",
                    fontSize: 10, color: '#aaa', marginTop: 4,
                  }}>0-0 · OPEN ROSTER</div>
                </div>
              </div>

              {/* VS */}
              <div className="cr-shadow-hot" style={{
                fontFamily: "'Anton','Impact',sans-serif",
                fontSize: 70, color: C.gold, lineHeight: 0.9, margin: '8px 0',
                textAlign: 'center', transform: 'skewX(-8deg)',
                textTransform: 'uppercase',
              }}>VS</div>

              {/* HOF row */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{
                  width: 62, height: 62, background: '#fff', color: C.green,
                  border: `2px solid ${C.dark}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: "'Anton','Impact',sans-serif", fontSize: 24,
                  boxShadow: 'inset 0 -2px 0 rgba(0,0,0,.2)', textTransform: 'uppercase',
                }}>HOF</div>
                <div>
                  <div style={{
                    fontFamily: "'Anton','Impact',sans-serif", fontSize: 28, color: C.gold,
                    textShadow: `2px 2px 0 ${C.dark}`, textTransform: 'uppercase',
                  }}>THE LEGENDS</div>
                  <div style={{
                    fontFamily: "'JetBrains Mono','IBM Plex Mono',monospace",
                    fontSize: 10, color: '#aaa', marginTop: 4,
                  }}>148-12 · UNDEFEATED</div>
                </div>
              </div>

              {/* starting five */}
              <div style={{ marginTop: 18, borderTop: `2px solid rgba(255,194,0,.25)`, paddingTop: 12 }}>
                <div style={{
                  fontFamily: "'Oswald',sans-serif", fontWeight: 700,
                  fontSize: 10, color: C.cyan, marginBottom: 8, letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                }}>
                  HOST&apos;S STARTING 5
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  {hofBooks.length > 0
                    ? hofBooks.map((book) => (
                        <div key={book.id} style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ border: `2px solid ${C.gold}`, padding: 1 }}>
                            <BookCover
                              title={book.title}
                              author={book.author}
                              coverUrl={book.coverUrl}
                              w={56}
                            />
                          </div>
                        </div>
                      ))
                    : [...Array(5)].map((_, i) => (
                        <div key={i} style={{ flex: 1, minWidth: 0 }}>
                          <div style={{
                            border: `2px solid rgba(255,194,0,.3)`,
                            background: 'rgba(255,255,255,.04)',
                            height: 81,
                          }} />
                        </div>
                      ))
                  }
                </div>

                {/* Start Draft CTA */}
                <Link to="/draft" style={{ textDecoration: 'none', display: 'block', marginTop: 14 }}>
                  <button style={{
                    width: '100%', height: 44,
                    background: C.gold, color: C.dark,
                    border: `3px solid ${C.dark}`,
                    boxShadow: `3px 3px 0 ${C.dark}`,
                    fontFamily: "'Anton','Impact',sans-serif",
                    fontSize: 18, letterSpacing: '0.04em', textTransform: 'uppercase',
                    cursor: 'pointer',
                  }}>
                    ▶ START YOUR DRAFT
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM TICKER */}
      <div style={{
        background: C.dark, borderTop: `3px solid ${C.gold}`,
        height: 46, display: 'flex', alignItems: 'stretch',
        overflow: 'hidden', flexShrink: 0,
      }}>
        <div className="cr-slash-r" style={{
          background: C.gold, color: C.dark, padding: '0 26px 0 22px',
          display: 'flex', alignItems: 'center', gap: 8,
          fontFamily: "'Anton','Impact',sans-serif",
          fontSize: 16, letterSpacing: '0.04em', textTransform: 'uppercase',
          flexShrink: 0,
        }}>
          <span className="cr-pulse" style={{ width: 7, height: 7, borderRadius: '50%', background: C.hot, flexShrink: 0 }} />
          LATEST PICKS
        </div>
        <div style={{ flex: 1, overflow: 'hidden', display: 'flex', alignItems: 'center' }}>
          <div className="cr-marquee" style={{ display: 'flex', gap: 38, whiteSpace: 'nowrap', paddingLeft: 24 }}>
            {[0, 1].map((j) => (
              <div key={j} style={{ display: 'flex', gap: 38, flexShrink: 0 }}>
                {TICKER_PICKS.map((row, i) => (
                  <span key={i} style={{
                    fontFamily: "'JetBrains Mono','IBM Plex Mono',monospace",
                    fontSize: 12, color: '#fff',
                    display: 'inline-flex', gap: 8, alignItems: 'center',
                  }}>
                    <span style={{ color: C.cyan }}>{row[0]}</span>
                    <span style={{ opacity: 0.4 }}>→</span>
                    <span style={{ color: C.gold, fontWeight: 700 }}>{row[1]}</span>
                    <span style={{ opacity: 0.4 }}>·</span>
                    <span style={{ opacity: 0.85 }}>{row[2]}</span>
                    <span style={{ color: '#7be495', fontWeight: 700, marginLeft: 4 }}>{row[3]}</span>
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
