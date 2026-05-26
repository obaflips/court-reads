import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import SurpriseModal from './SurpriseModal'

const C = {
  green: '#00653A',
  gold:  '#FFC200',
  cyan:  '#00b8b8',
  dark:  '#0a1612',
  hot:   '#ff5a1f',
}

export default function Navbar() {
  const location = useLocation()
  const [showSurpriseModal, setShowSurpriseModal] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const isActive = (path) => location.pathname === path || (path !== '/' && location.pathname.startsWith(path))

  const navItems = [
    { label: 'HOME', to: '/' },
    { label: 'DRAFT', to: '/draft' },
    { label: 'SCOUT REPORTS', to: '/scout-reports' },
    { label: 'HALL OF FAME', to: '/hall-of-fame' },
  ]

  return (
    <>
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 40,
        background: C.dark, borderBottom: `4px solid ${C.gold}`,
        height: 60, display: 'flex', alignItems: 'center', padding: '0 24px',
      }}>
        <Link to="/" style={{ textDecoration: 'none', flexShrink: 0 }}>
          <div style={{
            fontFamily: "'Anton','Impact',sans-serif",
            fontSize: 26, color: C.gold,
            textShadow: `2px 2px 0 ${C.hot}`, letterSpacing: '0.02em',
            textTransform: 'uppercase', lineHeight: 1,
          }}>
            COURT<span style={{ color: C.cyan }}>'</span>READS
          </div>
        </Link>

        <div style={{ flex: 1 }} />

        {/* Desktop nav */}
        <div className="hidden md:flex" style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
          {navItems.map((item) => {
            const active = isActive(item.to)
            return (
              <Link key={item.to} to={item.to} style={{ textDecoration: 'none' }}>
                <span style={{
                  padding: '8px 14px', fontSize: 12, cursor: 'pointer', display: 'block',
                  fontFamily: "'Oswald',sans-serif", fontWeight: 700, letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                  color: active ? C.dark : C.gold,
                  background: active ? C.gold : 'transparent',
                  border: active ? `2px solid ${C.gold}` : '2px solid transparent',
                }}>
                  {item.label}
                </span>
              </Link>
            )
          })}
          <button
            onClick={() => setShowSurpriseModal(true)}
            style={{
              marginLeft: 8, height: 36, padding: '0 16px',
              background: C.hot, color: '#fff',
              border: `2px solid ${C.dark}`,
              boxShadow: `3px 3px 0 ${C.dark}`,
              fontFamily: "'Anton','Impact',sans-serif",
              fontSize: 13, cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.04em',
            }}
          >
            SURPRISE ME
          </button>
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden"
          style={{ color: C.gold, background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}
          aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
        >
          <svg width={24} height={24} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {mobileMenuOpen
              ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            }
          </svg>
        </button>
      </nav>

      {/* Spacer */}
      <div style={{ height: 60 }} />

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div style={{
          position: 'fixed', top: 60, left: 0, right: 0, zIndex: 39,
          background: C.dark, borderBottom: `3px solid ${C.gold}`,
          padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 4,
        }}>
          {navItems.map(item => (
            <Link key={item.to} to={item.to} onClick={() => setMobileMenuOpen(false)} style={{ textDecoration: 'none' }}>
              <div style={{
                padding: '10px 14px',
                fontFamily: "'Oswald',sans-serif", fontWeight: 700, fontSize: 14,
                textTransform: 'uppercase', letterSpacing: '0.06em',
                color: isActive(item.to) ? C.dark : C.gold,
                background: isActive(item.to) ? C.gold : 'transparent',
              }}>
                {item.label}
              </div>
            </Link>
          ))}
          <button
            onClick={() => { setShowSurpriseModal(true); setMobileMenuOpen(false) }}
            style={{
              marginTop: 8, padding: '10px 14px', textAlign: 'left',
              background: C.hot, color: '#fff',
              border: 'none', cursor: 'pointer',
              fontFamily: "'Anton','Impact',sans-serif",
              fontSize: 14, textTransform: 'uppercase', letterSpacing: '0.04em',
            }}
          >
            SURPRISE ME
          </button>
        </div>
      )}

      <SurpriseModal
        isOpen={showSurpriseModal}
        onClose={() => setShowSurpriseModal(false)}
      />
    </>
  )
}
