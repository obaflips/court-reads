import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { getAllData } from '../api/airtable'
import { getPlayerStats } from '../api/nbaStats'
import Navbar from '../components/Navbar'

// Icons
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

// Scouting Report Header
function ScoutingHeader({ books, totalComps }) {
  const avgRating = books.length
    ? (books.reduce((sum, b) => sum + (b.rating || 0), 0) / books.length).toFixed(1)
    : '0.0'

  const seriesCount = new Set(books.filter(b => b.seriesId).map(b => b.seriesId)).size

  return (
    <div className="bg-white border-4 border-emerald-700 rounded-xl overflow-hidden shadow-lg">
      {/* Top gradient bar */}
      <div className="bg-gradient-to-r from-emerald-700 to-amber-500 px-6 py-2 flex justify-between items-center">
        <span className="text-white font-bold tracking-wider text-sm">COURT READS SCOUTING REPORT</span>
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
                COURT READS
              </h1>
              <span className="text-amber-600 font-bold text-lg md:text-xl">EST. 2025</span>
            </div>
            <p className="text-emerald-700 font-bold tracking-wide mt-2 text-lg">
              WHERE FANTASY MEETS THE HARDWOOD
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

// Latest Scout (Featured Book)
function LatestScout({ book }) {
  const [playerStats, setPlayerStats] = useState(null)

  const mainCharacter = book?.characters?.[0]
  const player = mainCharacter?.player

  useEffect(() => {
    if (player?.name) {
      getPlayerStats(player.name).then(setPlayerStats)
    }
  }, [player?.name])

  if (!book) return null

  return (
    <div className="bg-white border-4 border-amber-500 rounded-xl overflow-hidden shadow-lg">
      {/* Top gradient bar */}
      <div className="bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-2 flex justify-between items-center">
        <div className="flex items-center gap-2 text-white font-bold tracking-wider text-sm">
          <ActivityIcon className="w-4 h-4" />
          LATEST SCOUT
        </div>
        <span className="text-white/90 text-sm">JUST ADDED</span>
      </div>

      {/* Main content - 3 columns */}
      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Column 1: Character (3 cols) */}
          <div className="lg:col-span-3 space-y-4">
            <div>
              <div className="text-emerald-700 text-xs font-bold uppercase tracking-wider mb-1">Character</div>
              <h2
                className="text-3xl md:text-4xl lg:text-5xl font-black text-emerald-800 leading-none"
                style={{ fontFamily: 'var(--font-family-impact)' }}
              >
                {mainCharacter?.name || 'Unknown'}
              </h2>
            </div>

            {mainCharacter?.tagline && (
              <div>
                <div className="text-amber-600 text-xs font-bold uppercase tracking-wider mb-1">Tagline</div>
                <span className="inline-block bg-gradient-to-r from-amber-500 to-amber-600 text-white px-3 py-1 rounded-lg font-semibold text-sm">
                  {mainCharacter.tagline}
                </span>
              </div>
            )}

            {player?.position && (
              <div className="pt-2">
                <span className="inline-block bg-stone-100 border border-stone-300 text-stone-700 px-3 py-1 rounded font-mono text-sm">
                  {player.position}
                </span>
              </div>
            )}
          </div>

          {/* Column 2: Book & Player (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            {/* Book info box */}
            <div className="bg-stone-50 border border-stone-300 rounded-lg p-4">
              <div className="text-stone-500 text-xs font-bold uppercase tracking-wider mb-2">From the Book</div>
              <Link to={`/book/${book.id}`} className="flex gap-3 hover:text-emerald-700 transition-colors">
                {book.coverUrl && (
                  <img
                    src={book.coverUrl}
                    alt={book.title}
                    className="w-12 h-18 object-cover rounded shadow-sm flex-shrink-0 border border-stone-200"
                  />
                )}
                <div>
                  <div className="text-stone-900 text-xl font-bold">{book.title}</div>
                  <div className="text-stone-600">{book.author}</div>
                </div>
              </Link>
              <div className="border-t border-stone-200 mt-3 pt-3">
                <div className="text-stone-500 text-xs font-bold uppercase tracking-wider mb-1">Book Rating</div>
                <span className="inline-flex items-center gap-1 bg-amber-500 text-white px-3 py-1 rounded font-bold">
                  {'★'.repeat(book.rating || 0)}{'☆'.repeat(5 - (book.rating || 0))}
                  <span className="ml-1">{book.rating}/5</span>
                </span>
              </div>
            </div>

            {/* Player comparison */}
            {player && (
              <>
                <div className="border-t border-stone-200 pt-4">
                  <div className="text-amber-600 text-xs font-bold uppercase tracking-wider mb-3">NBA Comparison</div>
                  <div className="flex items-center gap-4">
                    {/* Jersey number */}
                    <div className="w-16 h-20 bg-gradient-to-b from-emerald-700 to-emerald-800 border-2 border-amber-500 rounded-lg flex items-center justify-center shadow-md">
                      <span className="text-white text-2xl font-bold font-mono">
                        #{player.number || '00'}
                      </span>
                    </div>
                    <div>
                      <div className="text-stone-900 text-lg font-bold">{player.name}</div>
                      <div className="text-stone-600">{player.currentTeam}</div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Column 3: Stats (5 cols) */}
          <div className="lg:col-span-5">
            <div className="bg-emerald-50 border-2 border-emerald-700 rounded-lg p-4 h-full">
              <div className="text-emerald-800 text-sm font-bold uppercase tracking-wider mb-4">Career Averages</div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white rounded-lg p-3 text-center border border-emerald-200">
                  <div className="text-2xl md:text-3xl font-bold text-emerald-800 font-mono">
                    {playerStats?.ppg?.toFixed(1) || '—'}
                  </div>
                  <div className="text-emerald-600 text-xs font-semibold uppercase">PPG</div>
                </div>
                <div className="bg-white rounded-lg p-3 text-center border border-emerald-200">
                  <div className="text-2xl md:text-3xl font-bold text-emerald-800 font-mono">
                    {playerStats?.rpg?.toFixed(1) || '—'}
                  </div>
                  <div className="text-emerald-600 text-xs font-semibold uppercase">RPG</div>
                </div>
                <div className="bg-white rounded-lg p-3 text-center border border-emerald-200">
                  <div className="text-2xl md:text-3xl font-bold text-emerald-800 font-mono">
                    {playerStats?.apg?.toFixed(1) || '—'}
                  </div>
                  <div className="text-emerald-600 text-xs font-semibold uppercase">APG</div>
                </div>
                <div className="bg-white rounded-lg p-3 text-center border border-emerald-200">
                  <div className="text-2xl md:text-3xl font-bold text-emerald-800 font-mono">
                    {playerStats?.per?.toFixed(1) || '—'}
                  </div>
                  <div className="text-emerald-600 text-xs font-semibold uppercase">PER</div>
                </div>
              </div>

              <div className="flex items-center justify-center gap-2 mt-4 text-emerald-700 text-sm font-semibold">
                <TrendingUpIcon className="w-4 h-4" />
                <span>IMPACT PLAYER</span>
                <span className="text-emerald-500">•</span>
                <span>HIGH EFFICIENCY</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Roster Depth Chart
function RosterDepthChart({ books, searchQuery, setSearchQuery }) {
  const [viewMode, setViewMode] = useState('roster')

  return (
    <div className="bg-white border-4 border-emerald-700 rounded-xl overflow-hidden shadow-lg">
      {/* Top gradient bar */}
      <div className="bg-gradient-to-r from-emerald-700 to-emerald-800 px-6 py-2 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <div className="flex items-center gap-2 text-white font-bold tracking-wider text-sm">
          <AwardIcon className="w-4 h-4" />
          2025-26 ROSTER DEPTH CHART
        </div>
        <div className="flex items-center gap-1 bg-emerald-900/50 rounded-lg p-1">
          <button
            onClick={() => setViewMode('roster')}
            className={`px-3 py-1 rounded text-sm font-semibold transition-colors ${
              viewMode === 'roster' ? 'bg-white text-emerald-800' : 'text-white/80 hover:text-white'
            }`}
          >
            ROSTER
          </button>
          <button
            onClick={() => setViewMode('stats')}
            className={`px-3 py-1 rounded text-sm font-semibold transition-colors ${
              viewMode === 'stats' ? 'bg-white text-emerald-800' : 'text-white/80 hover:text-white'
            }`}
          >
            STATS
          </button>
        </div>
      </div>

      {/* Search bar */}
      <div className="p-4 border-b border-stone-200">
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search books, characters, players..."
            className="w-full pl-10 pr-4 py-2 bg-white border border-stone-300 rounded-lg text-stone-900 placeholder-stone-400 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition-colors"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-emerald-50 text-emerald-700 text-left text-xs font-bold uppercase tracking-wider">
              <th className="px-4 py-3">Pos</th>
              <th className="px-4 py-3">Character / Book</th>
              <th className="px-4 py-3">Rating</th>
              <th className="px-4 py-3">NBA Comp</th>
              <th className="px-4 py-3 hidden md:table-cell">Tagline</th>
              {viewMode === 'stats' && <th className="px-4 py-3">PPG</th>}
            </tr>
          </thead>
          <tbody>
            {books.map((book) => {
              const mainCharacter = book.characters?.[0]
              const player = mainCharacter?.player

              return (
                <tr
                  key={book.id}
                  className="border-t border-stone-100 hover:bg-amber-50 transition-colors"
                >
                  {/* Position */}
                  <td className="px-4 py-3">
                    <span className="text-amber-600 font-bold font-mono">
                      {player?.position || '—'}
                    </span>
                  </td>

                  {/* Character / Book */}
                  <td className="px-4 py-3">
                    <Link to={`/book/${book.id}`} className="block hover:text-emerald-700 transition-colors">
                      <div className="text-stone-900 font-bold">{mainCharacter?.name || 'Unknown'}</div>
                      <div className="text-stone-500 text-sm">{book.title}</div>
                    </Link>
                  </td>

                  {/* Rating */}
                  <td className="px-4 py-3">
                    <span className="text-amber-600 font-semibold">
                      {'★'.repeat(Math.floor(book.rating || 0))}
                      {book.rating % 1 !== 0 && '½'}
                      <span className="text-stone-300">{'☆'.repeat(5 - Math.ceil(book.rating || 0))}</span>
                    </span>
                  </td>

                  {/* NBA Comp */}
                  <td className="px-4 py-3">
                    {player ? (
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-10 bg-gradient-to-b from-emerald-600 to-emerald-700 rounded flex items-center justify-center text-white text-xs font-bold font-mono">
                          #{player.number || '0'}
                        </div>
                        <span className="text-emerald-700 font-semibold">{player.name}</span>
                      </div>
                    ) : (
                      <span className="text-stone-400">—</span>
                    )}
                  </td>

                  {/* Tagline */}
                  <td className="px-4 py-3 hidden md:table-cell">
                    {mainCharacter?.tagline ? (
                      <span className="text-stone-600 italic text-sm">
                        "{mainCharacter.tagline}"
                      </span>
                    ) : (
                      <span className="text-stone-400">—</span>
                    )}
                  </td>

                  {/* PPG (stats mode) */}
                  {viewMode === 'stats' && (
                    <td className="px-4 py-3">
                      <span className="font-mono text-stone-700">—</span>
                    </td>
                  )}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {books.length === 0 && (
        <div className="p-8 text-center text-stone-500">
          No books found matching your search.
        </div>
      )}
    </div>
  )
}

// Loading skeleton for light mode
function LoadingSkeleton() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Header skeleton */}
        <div className="bg-white border-4 border-emerald-200 rounded-xl p-8 animate-pulse">
          <div className="h-4 bg-emerald-100 rounded w-48 mb-6" />
          <div className="h-16 bg-emerald-100 rounded w-96 mb-4" />
          <div className="h-6 bg-emerald-100 rounded w-64 mb-6" />
          <div className="grid grid-cols-4 gap-3">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-24 bg-emerald-50 rounded-lg" />
            ))}
          </div>
        </div>

        {/* Latest Scout skeleton */}
        <div className="bg-white border-4 border-amber-200 rounded-xl p-8 animate-pulse">
          <div className="h-4 bg-amber-100 rounded w-32 mb-6" />
          <div className="grid grid-cols-3 gap-6">
            <div className="space-y-4">
              <div className="h-12 bg-amber-100 rounded w-full" />
              <div className="h-8 bg-amber-100 rounded w-32" />
            </div>
            <div className="space-y-4">
              <div className="h-32 bg-stone-100 rounded" />
              <div className="h-20 bg-stone-100 rounded" />
            </div>
            <div className="h-48 bg-emerald-50 rounded-lg" />
          </div>
        </div>

        {/* Roster skeleton */}
        <div className="bg-white border-4 border-emerald-200 rounded-xl animate-pulse">
          <div className="h-12 bg-emerald-100" />
          <div className="p-4">
            <div className="h-10 bg-stone-100 rounded-lg mb-4" />
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-16 bg-stone-50 border-t border-stone-100" />
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}

// Error state
function ErrorState({ error }) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="mb-6">
          <svg className="w-24 h-24 mx-auto text-amber-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>

        <h1
          className="text-3xl md:text-4xl font-bold text-emerald-800"
          style={{ fontFamily: 'var(--font-family-impact)' }}
        >
          TECHNICAL FOUL
        </h1>

        <p className="text-stone-600 mt-4">
          We couldn't load the roster. This might be a connection issue.
        </p>

        <p className="text-red-600 mt-2 text-sm bg-red-50 px-4 py-2 rounded-lg inline-block">
          {error}
        </p>

        <div className="mt-8">
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-emerald-700 text-white font-semibold rounded-lg hover:bg-emerald-800 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    </div>
  )
}

export default function Home() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    async function fetchData() {
      try {
        const result = await getAllData()
        setData(result)
      } catch (err) {
        console.error('Error fetching data:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Filter books based on search
  const filteredBooks = useMemo(() => {
    if (!data?.books) return []

    let result = [...data.books]

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim()
      result = result.filter(book => {
        if (book.title?.toLowerCase().includes(query)) return true
        if (book.author?.toLowerCase().includes(query)) return true
        if (book.characters?.some(char => char.name?.toLowerCase().includes(query))) return true
        if (book.characters?.some(char => char.player?.name?.toLowerCase().includes(query))) return true
        return false
      })
    }

    return result
  }, [data?.books, searchQuery])

  if (loading) return <LoadingSkeleton />
  if (error) return <ErrorState error={error} />

  const books = data?.books || []
  const latestBook = books[0]
  const totalComps = books.reduce((sum, book) => sum + (book.characters?.length || 0), 0)

  return (
    <div className="min-h-screen hardwood-bg court-lines">
      <Navbar />

      <main className="relative z-10 max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Scouting Report Header */}
        <ScoutingHeader books={books} totalComps={totalComps} />

        {/* Latest Scout */}
        {latestBook && <LatestScout book={latestBook} />}

        {/* Roster Depth Chart */}
        <RosterDepthChart
          books={filteredBooks}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />
      </main>

      <footer className="relative z-10 border-t border-emerald-200 py-8 text-center text-stone-500 text-sm">
        <p>Where fantasy meets the hardwood</p>
      </footer>
    </div>
  )
}
