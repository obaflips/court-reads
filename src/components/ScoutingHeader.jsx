function ActivityIcon({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function AwardIcon({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <circle cx="12" cy="8" r="7" strokeWidth="2" />
      <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function TrendingUpIcon({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <polyline points="17 6 23 6 23 12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function SearchIcon({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <circle cx="11" cy="11" r="8" strokeWidth="2" />
      <path d="m21 21-4.35-4.35" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

export { ActivityIcon, AwardIcon, TrendingUpIcon, SearchIcon }

export function ScoutingReportHeader({ books, totalComps }) {
  const avgRating = books.length
    ? (books.reduce((sum, b) => sum + (b.rating || 0), 0) / books.length).toFixed(1)
    : '0.0'

  const seriesCount = new Set(books.filter(b => b.seriesId).map(b => b.seriesId)).size

  return (
    <div className="bg-white border-4 border-emerald-700 rounded-xl overflow-hidden shadow-lg">
      {/* Top gradient bar */}
      <div className="bg-gradient-to-r from-emerald-700 to-amber-500 px-6 py-2 flex justify-between items-center">
        <span className="text-white font-bold tracking-wider text-sm">SCOUT REPORTS</span>
        <span className="text-white/90 text-sm">2025-26 SEASON</span>
      </div>

      {/* Main header content */}
      <div className="p-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6">
          <div>
            <div className="flex items-baseline gap-3">
              <h1
                className="text-5xl md:text-6xl lg:text-7xl font-black text-emerald-800 tracking-tight"
                style={{ fontFamily: 'var(--font-family-impact)' }}
              >
                SCOUT REPORTS
              </h1>
            </div>
            <p className="text-emerald-700 font-bold tracking-wide mt-2 text-lg">
              MY READING LIST, NBA-STYLE
            </p>
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-emerald-50 border-2 border-emerald-200 rounded-lg p-4 text-center">
            <div className="text-3xl md:text-4xl font-bold text-emerald-800 font-mono">{books.length}</div>
            <div className="text-emerald-600 text-sm font-semibold uppercase tracking-wider">Books</div>
          </div>
          <div className="bg-amber-50 border-2 border-amber-200 rounded-lg p-4 text-center">
            <div className="text-3xl md:text-4xl font-bold text-amber-700 font-mono">{totalComps}</div>
            <div className="text-amber-600 text-sm font-semibold uppercase tracking-wider">Comps</div>
          </div>
          <div className="bg-emerald-50 border-2 border-emerald-200 rounded-lg p-4 text-center">
            <div className="text-3xl md:text-4xl font-bold text-emerald-800 font-mono">{avgRating}</div>
            <div className="text-emerald-600 text-sm font-semibold uppercase tracking-wider">Avg Rating</div>
          </div>
          <div className="bg-amber-50 border-2 border-amber-200 rounded-lg p-4 text-center">
            <div className="text-3xl md:text-4xl font-bold text-amber-700 font-mono">{seriesCount}</div>
            <div className="text-amber-600 text-sm font-semibold uppercase tracking-wider">Series</div>
          </div>
        </div>
      </div>
    </div>
  )
}
