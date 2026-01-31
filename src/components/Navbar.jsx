import { useState, useRef, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import SurpriseModal from './SurpriseModal'

export default function Navbar() {
  const location = useLocation()
  const [showSurpriseModal, setShowSurpriseModal] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)

  const isActive = (path) => location.pathname === path

  const isScoutReportsActive = () =>
    location.pathname === '/scout-reports' ||
    location.pathname === '/hall-of-fame' ||
    location.pathname.startsWith('/book/') ||
    location.pathname.startsWith('/series/')

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSurpriseClick = () => {
    setShowSurpriseModal(true)
    setMobileMenuOpen(false)
  }

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-40 bg-white border-b-4 border-emerald-700 shadow-md">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link
              to="/"
              className="flex items-center gap-2 hover:opacity-90 transition-opacity"
            >
              <span
                className="text-2xl md:text-3xl font-black tracking-tight text-emerald-800"
                style={{ fontFamily: 'var(--font-family-impact)' }}
              >
                COURT READS
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-1">
              <Link
                to="/draft"
                className={`px-4 py-2 rounded-lg font-medium transition-all focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:ring-offset-2 ${
                  isActive('/draft')
                    ? 'bg-emerald-700 text-white'
                    : 'text-emerald-700 hover:bg-emerald-50'
                }`}
              >
                Draft
              </Link>

              <Link
                to="/quick-pick"
                className={`px-4 py-2 rounded-lg font-medium transition-all focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:ring-offset-2 ${
                  isActive('/quick-pick')
                    ? 'bg-emerald-700 text-white'
                    : 'text-emerald-700 hover:bg-emerald-50'
                }`}
              >
                Quick Pick
              </Link>

              {/* Scout Reports Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:ring-offset-2 flex items-center gap-1 ${
                    isScoutReportsActive()
                      ? 'bg-emerald-700 text-white'
                      : 'text-emerald-700 hover:bg-emerald-50'
                  }`}
                >
                  Scout Reports
                  <svg
                    className={`w-4 h-4 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {dropdownOpen && (
                  <div className="absolute top-full left-0 mt-1 w-48 bg-white border-2 border-emerald-200 rounded-lg shadow-lg overflow-hidden z-50">
                    <Link
                      to="/scout-reports"
                      onClick={() => setDropdownOpen(false)}
                      className={`block px-4 py-3 text-sm font-medium transition-colors ${
                        isActive('/scout-reports')
                          ? 'bg-emerald-700 text-white'
                          : 'text-emerald-700 hover:bg-emerald-50'
                      }`}
                    >
                      All Books
                    </Link>
                    <Link
                      to="/hall-of-fame"
                      onClick={() => setDropdownOpen(false)}
                      className={`block px-4 py-3 text-sm font-medium transition-colors border-t border-emerald-100 ${
                        isActive('/hall-of-fame')
                          ? 'bg-emerald-700 text-white'
                          : 'text-emerald-700 hover:bg-emerald-50'
                      }`}
                    >
                      Hall of Fame
                    </Link>
                  </div>
                )}
              </div>

              <Link
                to="/about"
                className={`px-4 py-2 rounded-lg font-medium transition-all focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:ring-offset-2 ${
                  isActive('/about')
                    ? 'bg-emerald-700 text-white'
                    : 'text-emerald-700 hover:bg-emerald-50'
                }`}
              >
                How It Works
              </Link>

              <button
                onClick={handleSurpriseClick}
                className="ml-2 px-4 py-2 bg-amber-500 text-white font-bold rounded-lg hover:bg-amber-600 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
                style={{ fontFamily: 'var(--font-family-display)' }}
              >
                SURPRISE ME
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-600"
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
            mobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="px-4 py-3 space-y-1 bg-white border-t border-emerald-200">
            <Link
              to="/draft"
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-4 py-3 rounded-lg font-medium transition-all focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:ring-inset ${
                isActive('/draft')
                  ? 'bg-emerald-700 text-white'
                  : 'text-emerald-700 hover:bg-emerald-50'
              }`}
            >
              Draft
            </Link>
            <Link
              to="/quick-pick"
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-4 py-3 rounded-lg font-medium transition-all focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:ring-inset ${
                isActive('/quick-pick')
                  ? 'bg-emerald-700 text-white'
                  : 'text-emerald-700 hover:bg-emerald-50'
              }`}
            >
              Quick Pick
            </Link>

            {/* Scout Reports group header */}
            <div className="px-4 pt-3 pb-1 text-xs font-bold text-stone-400 uppercase tracking-wider">
              Scout Reports
            </div>
            <Link
              to="/scout-reports"
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-4 py-3 pl-8 rounded-lg font-medium transition-all focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:ring-inset ${
                isActive('/scout-reports')
                  ? 'bg-emerald-700 text-white'
                  : 'text-emerald-700 hover:bg-emerald-50'
              }`}
            >
              All Books
            </Link>
            <Link
              to="/hall-of-fame"
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-4 py-3 pl-8 rounded-lg font-medium transition-all focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:ring-inset ${
                isActive('/hall-of-fame')
                  ? 'bg-emerald-700 text-white'
                  : 'text-emerald-700 hover:bg-emerald-50'
              }`}
            >
              Hall of Fame
            </Link>

            <Link
              to="/about"
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-4 py-3 rounded-lg font-medium transition-all focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:ring-inset ${
                isActive('/about')
                  ? 'bg-emerald-700 text-white'
                  : 'text-emerald-700 hover:bg-emerald-50'
              }`}
            >
              How It Works
            </Link>

            <button
              onClick={handleSurpriseClick}
              className="w-full mt-2 px-4 py-3 bg-amber-500 text-white font-bold rounded-lg hover:bg-amber-600 transition-colors text-center focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-inset"
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
