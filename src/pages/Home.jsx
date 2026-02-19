import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'

export default function Home() {
  return (
    <div className="min-h-screen hardwood-bg court-lines">
      <Navbar />

      <main className="relative z-10 max-w-4xl mx-auto px-4 py-12">
        {/* Page Title */}
        <div className="text-center mb-12">
          <h1
            className="text-5xl md:text-6xl lg:text-7xl font-black text-emerald-800 tracking-tight"
            style={{ fontFamily: 'var(--font-family-impact)' }}
          >
            COURT READS
          </h1>
          <p
            className="text-xl md:text-2xl font-bold text-amber-600 mt-2 tracking-wider"
            style={{ fontFamily: 'var(--font-family-display)' }}
          >
            WHERE FANTASY MEETS THE HARDWOOD
          </p>
        </div>


        {/* What is Court Reads? */}
        <div className="bg-white border-4 border-emerald-700 rounded-xl overflow-hidden shadow-lg mb-12">
          <div className="bg-gradient-to-r from-emerald-700 to-amber-500 px-6 py-2">
            <span className="text-white font-bold tracking-wider text-sm">THE STORY</span>
          </div>
          <div className="p-6 md:p-8">
            <h2
              className="text-2xl md:text-3xl font-black text-emerald-800 mb-4"
              style={{ fontFamily: 'var(--font-family-impact)' }}
            >
              WHAT IS COURT READS?
            </h2>
            <p className="text-stone-600 leading-relaxed">
              This started as a reading tracker. It escalated. Now I assign NBA comps to fantasy books based on vibes. Created by a lifelong Sonics fan with nothing to do on game nights.
            </p>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-12">
          <div className="bg-white border-4 border-emerald-700 rounded-xl overflow-hidden shadow-lg">
            <div className="bg-gradient-to-r from-emerald-700 to-emerald-800 px-4 py-2">
              <span className="text-amber-400 font-bold tracking-wider text-sm">FULL EXPERIENCE</span>
            </div>
            <div className="p-6">
              <Link
                to="/draft"
                className="block px-6 py-4 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-bold text-xl rounded-xl hover:from-amber-600 hover:to-amber-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-center"
                style={{ fontFamily: 'var(--font-family-impact)' }}
              >
                START YOUR DRAFT
              </Link>
              <p className="text-stone-500 text-sm mt-3">
                Snake draft with AI opponents. 5 rounds, real stakes (sort of).
              </p>
            </div>
          </div>

          <div className="bg-white border-4 border-emerald-700 rounded-xl overflow-hidden shadow-lg">
            <div className="bg-gradient-to-r from-amber-500 to-amber-600 px-4 py-2">
              <span className="text-white font-bold tracking-wider text-sm">QUICK START</span>
            </div>
            <div className="p-6">
              <Link
                to="/quick-pick"
                className="block px-6 py-4 border-3 border-emerald-700 text-emerald-700 font-bold text-xl rounded-xl hover:bg-emerald-50 transition-all text-center"
                style={{ fontFamily: 'var(--font-family-impact)' }}
              >
                QUICK PICK 5
              </Link>
              <p className="text-stone-500 text-sm mt-3">
                Just pick 5 players and see what books come back. No pressure.
              </p>
            </div>
          </div>
        </div>

        {/* Explore Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <Link
            to="/scout-reports"
            className="group bg-white border-4 border-emerald-700 rounded-xl p-6 shadow-lg hover:border-amber-500 transition-colors"
          >
            <div className="flex items-center gap-3 mb-2">
              <svg className="w-6 h-6 text-emerald-700 group-hover:text-amber-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8" strokeWidth="2" />
                <path d="m21 21-4.35-4.35" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <h3
                className="text-xl font-bold text-emerald-800 group-hover:text-amber-600 transition-colors"
                style={{ fontFamily: 'var(--font-family-impact)' }}
              >
                BROWSE THE SHELF
              </h3>
            </div>
            <p className="text-stone-500 text-sm">
              See every book, character, and player comp on my reading list.
            </p>
          </Link>

          <Link
            to="/hall-of-fame"
            className="group bg-white border-4 border-emerald-700 rounded-xl p-6 shadow-lg hover:border-amber-500 transition-colors"
          >
            <div className="flex items-center gap-3 mb-2">
              <svg className="w-6 h-6 text-emerald-700 group-hover:text-amber-500 transition-colors" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 15c-1.95 0-3.61-1.27-4.19-3.03C6.19 12.31 5 11.3 5 10V5h14v5c0 1.3-1.19 2.31-2.81 1.97C15.61 13.73 13.95 15 12 15z" />
                <path d="M9 18h6v3H9z" />
                <path d="M7 21h10v1H7z" />
                <path d="M11 15h2v3h-2z" />
              </svg>
              <h3
                className="text-xl font-bold text-emerald-800 group-hover:text-amber-600 transition-colors"
                style={{ fontFamily: 'var(--font-family-impact)' }}
              >
                HALL OF FAME
              </h3>
            </div>
            <p className="text-stone-500 text-sm">
              My top-rated reads — the team to beat.
            </p>
          </Link>
        </div>
      </main>

      <footer className="relative z-10 border-t border-emerald-200 py-8 text-center text-stone-500 text-sm mt-12">
        <p>A personal project by a fantasy reader who watches too much basketball</p>
      </footer>
    </div>
  )
}
