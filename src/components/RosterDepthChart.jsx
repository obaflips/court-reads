import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getPlayerStats } from '../api/nbaStats'
import { AwardIcon, SearchIcon } from './ScoutingHeader'

export default function RosterDepthChart({ books, searchQuery, setSearchQuery }) {
  const [viewMode, setViewMode] = useState('roster')
  const [playerStats, setPlayerStats] = useState({})
  const [statsLoading, setStatsLoading] = useState(false)

  // Fetch stats when switching to stats mode
  useEffect(() => {
    if (viewMode !== 'stats') return
    if (books.length === 0) return

    const playersToFetch = books
      .map(b => b.characters?.[0]?.player?.name)
      .filter(name => name && !playerStats[name])

    if (playersToFetch.length === 0) return

    setStatsLoading(true)

    async function fetchAll() {
      const results = {}
      await Promise.all(
        playersToFetch.map(async (name) => {
          const stats = await getPlayerStats(name)
          results[name] = stats
        })
      )
      setPlayerStats(prev => ({ ...prev, ...results }))
      setStatsLoading(false)
    }

    fetchAll()
  }, [viewMode, books])

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
              <th className="px-4 py-3">Book Rating</th>
              <th className="px-4 py-3">NBA Comp</th>
              {viewMode === 'roster' ? (
                <th className="px-4 py-3 hidden md:table-cell">Tagline</th>
              ) : (
                <>
                  <th className="px-4 py-3 text-center">PPG</th>
                  <th className="px-4 py-3 text-center hidden sm:table-cell">RPG</th>
                  <th className="px-4 py-3 text-center hidden sm:table-cell">APG</th>
                  <th className="px-4 py-3 text-center hidden md:table-cell">PER</th>
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {books.map((book) => {
              const mainCharacter = book.characters?.[0]
              const player = mainCharacter?.player
              const stats = player?.name ? playerStats[player.name] : null

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

                  {viewMode === 'roster' ? (
                    /* Tagline */
                    <td className="px-4 py-3 hidden md:table-cell">
                      {mainCharacter?.tagline ? (
                        <span className="text-stone-600 italic text-sm">
                          "{mainCharacter.tagline}"
                        </span>
                      ) : (
                        <span className="text-stone-400">—</span>
                      )}
                    </td>
                  ) : (
                    /* Stats columns */
                    <>
                      <td className="px-4 py-3 text-center">
                        <span className="font-mono text-stone-700 font-semibold">
                          {statsLoading && !stats ? '...' : stats?.ppg?.toFixed(1) ?? '—'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center hidden sm:table-cell">
                        <span className="font-mono text-stone-600">
                          {statsLoading && !stats ? '...' : stats?.rpg?.toFixed(1) ?? '—'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center hidden sm:table-cell">
                        <span className="font-mono text-stone-600">
                          {statsLoading && !stats ? '...' : stats?.apg?.toFixed(1) ?? '—'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center hidden md:table-cell">
                        <span className="font-mono text-amber-600 font-semibold">
                          {statsLoading && !stats ? '...' : stats?.per?.toFixed(1) ?? '—'}
                        </span>
                      </td>
                    </>
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
