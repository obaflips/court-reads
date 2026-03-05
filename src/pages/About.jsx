import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'

export default function About() {
  return (
    <div className="min-h-screen hardwood-bg court-lines">
      <Navbar />

      <main className="relative z-10 max-w-4xl mx-auto px-4 py-12">
        {/* Page Title */}
        <div className="text-center mb-12">
          <h1
            className="text-4xl md:text-5xl lg:text-6xl font-black text-emerald-800 tracking-tight"
            style={{ fontFamily: 'var(--font-family-impact)' }}
          >
            ABOUT
          </h1>
        </div>

        {/* Origin Story */}
        <div className="bg-white border-4 border-emerald-700 rounded-xl overflow-hidden shadow-lg mb-8">
          <div className="bg-gradient-to-r from-emerald-700 to-amber-500 px-6 py-2 flex justify-between items-center">
            <span className="text-white font-bold tracking-wider text-sm">ABOUT THIS SITE</span>
            <span className="text-white font-bold text-sm">THE ORIGIN STORY</span>
          </div>
          <div className="p-6 md:p-8">
            <p className="text-stone-600 leading-relaxed mb-4">
              [YOUR NAME] has been reading epic fantasy since [YEAR] and watching too much NBA since [YEAR].
              The Sonics colors are not an accident.
            </p>
            <p className="text-stone-600 leading-relaxed mb-4">
              This site started when [ORIGIN COMP — e.g., "I realized Kelsier from The Final Empire is Kevin
              Durant on a team he doesn't fully trust"] and I needed somewhere to put that observation.
              Every book I finish gets a comp. Some of them are obvious. Some of them I'll defend forever.
            </p>
            <p className="text-stone-600 leading-relaxed">
              I read mostly [SUBGENRE — e.g., secondary world epic and grimdark]. My ratings are honest.
              The Hall of Fame is the Hall of Fame.
            </p>
          </div>
        </div>

        {/* Detailed Guide */}
        <div className="space-y-6 mb-12">
          {/* Draft */}
          <div className="bg-white border-4 border-emerald-700 rounded-xl overflow-hidden shadow-lg">
            <div className="bg-gradient-to-r from-emerald-700 to-emerald-800 px-6 py-2 flex justify-between items-center">
              <span className="text-white font-bold tracking-wider text-sm">STEP 1</span>
              <span className="text-amber-400 font-bold text-sm">DRAFT</span>
            </div>
            <div className="p-6 md:p-8">
              <h3
                className="text-2xl font-bold text-emerald-800 mb-3"
                style={{ fontFamily: 'var(--font-family-impact)' }}
              >
                DRAFT YOUR TEAM
              </h3>
              <p className="text-stone-600 leading-relaxed mb-3">
                The Draft is a snake draft against AI opponents — you take turns picking from the available pool of books, and the AI teams will try to snag the best ones before you can. It's 5 rounds, and order matters.
              </p>
              <p className="text-stone-600 leading-relaxed">
                Each book you pick reveals a character — that's your player. The draft is blind: you see the books, but the characters are only revealed one by one as picks come in.
              </p>
            </div>
          </div>

          {/* Match */}
          <div className="bg-white border-4 border-emerald-700 rounded-xl overflow-hidden shadow-lg">
            <div className="bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-2 flex justify-between items-center">
              <span className="text-white font-bold tracking-wider text-sm">STEP 2</span>
              <span className="text-emerald-900 font-bold text-sm">MATCH</span>
            </div>
            <div className="p-6 md:p-8">
              <h3
                className="text-2xl font-bold text-emerald-800 mb-3"
                style={{ fontFamily: 'var(--font-family-impact)' }}
              >
                GET YOUR READS
              </h3>
              <p className="text-stone-600 leading-relaxed mb-3">
                Here's the thing — every book in the draft pool has a character matched to an NBA player. When you draft a book, its character is revealed — that's your player comp.
              </p>
              <p className="text-stone-600 leading-relaxed">
                The comparisons are based on how the character plays their role in the story: their style, their personality, their arc. A cerebral point guard might match a strategic wizard. A dominant center might match an immovable warrior-king. You get the idea.
              </p>
            </div>
          </div>

          {/* Challenge */}
          <div className="bg-white border-4 border-emerald-700 rounded-xl overflow-hidden shadow-lg">
            <div className="bg-gradient-to-r from-emerald-700 to-amber-500 px-6 py-2 flex justify-between items-center">
              <span className="text-white font-bold tracking-wider text-sm">STEP 3</span>
              <span className="text-white font-bold text-sm">COMPETE</span>
            </div>
            <div className="p-6 md:p-8">
              <h3
                className="text-2xl font-bold text-emerald-800 mb-3"
                style={{ fontFamily: 'var(--font-family-impact)' }}
              >
                CHALLENGE THE HALL
              </h3>
              <p className="text-stone-600 leading-relaxed mb-3">
                Once your lineup is set, you can run a simulated game against the Hall of Fame — my 5 highest-rated books of all time. The sim uses each player's real career stats to generate a box score.
              </p>
              <p className="text-stone-600 leading-relaxed">
                It's not exactly ESPN, but it's fun to see if your picks can hang with the best books I've read.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex justify-center">
          <Link
            to="/draft"
            className="px-8 py-4 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-bold text-lg rounded-xl hover:from-amber-600 hover:to-amber-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-center"
            style={{ fontFamily: 'var(--font-family-impact)' }}
          >
            START YOUR DRAFT
          </Link>
        </div>
      </main>

      <footer className="relative z-10 border-t border-emerald-200 py-8 text-center text-stone-500 text-sm mt-12">
        <p>[YOUR NAME] · built in [CITY] · reading [CURRENT BOOK] · rooting for [YOUR TEAM]</p>
      </footer>
    </div>
  )
}
