import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getPlayerStats } from '../api/nbaStats'
import { ActivityIcon } from './ScoutingHeader'

export default function LatestScout({ book }) {
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

              {mainCharacter?.description && (
                <p className="text-stone-600 text-xs mt-4 line-clamp-3 leading-relaxed">
                  {mainCharacter.description.slice(0, 100)}{mainCharacter.description.length > 100 ? '…' : ''}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
