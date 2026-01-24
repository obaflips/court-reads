import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import SurpriseModal from './SurpriseModal'

export default function Navbar() {
  const location = useLocation()
  const [showSurpriseModal, setShowSurpriseModal] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const isActive = (path) => location.pathname === path

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/build-lineup', label: 'Build Lineup' },
    { path: '/hall-of-fame', label: 'Hall of Fame' },
  ]

  const handleSurpriseClick = () => {
    setShowSurpriseModal(true)
    setMobileMenuOpen(false)
  }

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-40 bg-sonics-green shadow-lg">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link
              to="/"
              className="flex items-center gap-2 hover:opacity-90 transition-opacity"
            >
              <span
                className="text-2xl md:text-3xl font-black tracking-tight text-sonics-gold"
                style={{ fontFamily: 'var(--font-family-display)' }}
              >
                COURT READS
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-4 py-2 rounded-lg font-medium transition-all focus:outline-none focus:ring-2 focus:ring-sonics-gold focus:ring-offset-2 focus:ring-offset-sonics-green ${
                    isActive(link.path)
                      ? 'bg-sonics-gold text-sonics-dark'
                      : 'text-white/90 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <button
                onClick={handleSurpriseClick}
                className="ml-2 px-4 py-2 bg-sonics-gold text-sonics-dark font-bold rounded-lg hover:bg-sonics-gold/90 transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-sonics-green"
                style={{ fontFamily: 'var(--font-family-display)' }}
              >
                SURPRISE ME
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-white hover:bg-white/10 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-sonics-gold"
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
            mobileMenuOpen ? 'max-h-64 opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="px-4 py-3 space-y-1 bg-sonics-green border-t border-white/10">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-4 py-3 rounded-lg font-medium transition-all focus:outline-none focus:ring-2 focus:ring-sonics-gold focus:ring-inset ${
                  isActive(link.path)
                    ? 'bg-sonics-gold text-sonics-dark'
                    : 'text-white/90 hover:bg-white/10 hover:text-white'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <button
              onClick={handleSurpriseClick}
              className="w-full mt-2 px-4 py-3 bg-sonics-gold text-sonics-dark font-bold rounded-lg hover:bg-sonics-gold/90 transition-colors text-center focus:outline-none focus:ring-2 focus:ring-white focus:ring-inset"
              style={{ fontFamily: 'var(--font-family-display)' }}
            >
              SURPRISE ME
            </button>
          </div>
        </div>
      </nav>

      {/* Spacer to prevent content from going under fixed navbar */}
      <div className="h-16" />

      <SurpriseModal
        isOpen={showSurpriseModal}
        onClose={() => setShowSurpriseModal(false)}
      />
    </>
  )
}
