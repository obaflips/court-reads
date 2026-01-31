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

        {/* Three-step guide */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* Step 1 */}
          <div className="bg-white border-4 border-emerald-700 rounded-xl overflow-hidden shadow-lg">
            <div className="bg-gradient-to-r from-emerald-700 to-emerald-800 px-4 py-2 flex justify-between items-center">
              <span className="text-white font-bold tracking-wider text-sm">STEP 1</span>
              <span className="text-amber-400 font-bold text-sm">DRAFT</span>
            </div>
            <div className="p-6 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-emerald-50 border-2 border-emerald-200 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-emerald-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3
                className="text-xl font-bold text-emerald-800 mb-2"
                style={{ fontFamily: 'var(--font-family-impact)' }}
              >
                DRAFT YOUR TEAM
              </h3>
              <p className="text-stone-600 text-sm">
                Pick your favorite NBA players in a fantasy draft against AI opponents, or use Quick Pick to grab your starting 5.
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="bg-white border-4 border-emerald-700 rounded-xl overflow-hidden shadow-lg">
            <div className="bg-gradient-to-r from-amber-500 to-amber-600 px-4 py-2 flex justify-between items-center">
              <span className="text-white font-bold tracking-wider text-sm">STEP 2</span>
              <span className="text-emerald-900 font-bold text-sm">MATCH</span>
            </div>
            <div className="p-6 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-amber-50 border-2 border-amber-200 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3
                className="text-xl font-bold text-emerald-800 mb-2"
                style={{ fontFamily: 'var(--font-family-impact)' }}
              >
                GET YOUR READS
              </h3>
              <p className="text-stone-600 text-sm">
                Every player on my reading list is matched to a fantasy book character. Your picks reveal your personalized reading list.
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="bg-white border-4 border-emerald-700 rounded-xl overflow-hidden shadow-lg">
            <div className="bg-gradient-to-r from-emerald-700 to-amber-500 px-4 py-2 flex justify-between items-center">
              <span className="text-white font-bold tracking-wider text-sm">STEP 3</span>
              <span className="text-white font-bold text-sm">COMPETE</span>
            </div>
            <div className="p-6 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-emerald-50 border-2 border-emerald-200 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-emerald-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              </div>
              <h3
                className="text-xl font-bold text-emerald-800 mb-2"
                style={{ fontFamily: 'var(--font-family-impact)' }}
              >
                CHALLENGE THE HALL
              </h3>
              <p className="text-stone-600 text-sm">
                Simulate a game with your drafted team against the Hall of Fame — my top-rated reads of all time.
              </p>
            </div>
          </div>
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
            <p className="text-stone-600 leading-relaxed mb-4">
              Court Reads started as a way to track my reading list — I'm a fantasy reader and an NBA fan, and I kept noticing how book characters reminded me of real players. So I built a site around it.
            </p>
            <p className="text-stone-600 leading-relaxed">
              Every book I've read gets matched to NBA players based on the characters. The draft and challenge features are just a fun way to explore those comparisons and maybe find your next read.
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
