import { useLocation } from 'react-router-dom'
import Navbar from './Navbar'

export default function Header() {
  const location = useLocation()
  const isHome = location.pathname === '/'

  return (
    <>
      <Navbar />

      {/* Homepage tagline section */}
      {isHome && (
        <div className="border-b border-sonics-green/30 py-6 bg-gradient-to-b from-sonics-green/10 to-transparent">
          <div className="max-w-6xl mx-auto px-4 text-center">
            <p className="text-emerald-600 font-bold text-xl md:text-2xl">
              Fantasy Books × NBA Player Comparisons
            </p>
          </div>
        </div>
      )}
    </>
  )
}
