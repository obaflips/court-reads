import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getPlayerStats, generateLineups } from '../api/nbaStats'

function LineupCard({ book, rank, statLabel, statValue, accentColor }) {
  const character = book.characters?.[0]
  const player = character?.player

  if (!character || !player) return null

  const colorClasses = {
    gold: {
      border: 'border-amber-500/50',
      bg: 'from-amber-950/40 via-sonics-dark to-amber-950/20',
      accent: 'text-amber-400',
      badge: 'bg-amber-500/20 text-amber-400',
      glow: 'shadow-amber-500/20',
    },
    red: {
      border: 'border-red-500/50',
      bg: 'from-red-950/40 via-sonics-dark to-red-950/20',
      accent: 'text-red-400',
      badge: 'bg-red-500/20 text-red-400',
      glow: 'shadow-red-500/20',
    },
    blue: {
      border: 'border-blue-500/50',
      bg: 'from-blue-950/40 via-sonics-dark to-blue-950/20',
      accent: 'text-blue-400',
      badge: 'bg-blue-500/20 text-blue-400',
      glow: 'shadow-blue-500/20',
    },
  }

  const colors = colorClasses[accentColor] || colorClasses.gold

  return (
    <Link
      to={`/book/${book.id}`}
      className={`block border ${colors.border} rounded-xl bg-gradient-to-br ${colors.bg} p-4 hover:shadow-lg ${colors.glow} transition-all group focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-sonics-dark focus:ring-sonics-gold`}
    >
      <div className="flex items-center gap-4">
        {/* Rank */}
        <div
          className={`text-3xl font-bold ${colors.accent} opacity-50 w-8`}
          style={{ fontFamily: 'var(--font-family-display)' }}
        >
          {rank}
        </div>

        {/* Cover */}
        {book.coverUrl ? (
          <img
            src={book.coverUrl}
            alt={book.title}
            className="w-12 h-16 object-cover rounded shadow-sm"
          />
        ) : (
          <div className="w-12 h-16 bg-gray-800 rounded" />
        )}

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div
            className={`font-semibold ${colors.accent} truncate group-hover:text-white transition-colors`}
            style={{ fontFamily: 'var(--font-family-display)' }}
          >
            {character.name} <span className="text-gray-500 font-normal">is</span> {player.name}
          </div>
          <div className="text-sm text-gray-400 truncate">{book.title}</div>
        </div>

        {/* Stat Badge */}
        <div className={`text-right flex-shrink-0`}>
          <div
            className={`text-lg font-bold ${colors.accent}`}
            style={{ fontFamily: 'var(--font-family-display)' }}
          >
            {statValue}
          </div>
          <div className="text-xs text-gray-500 uppercase">{statLabel}</div>
        </div>
      </div>
    </Link>
  )
}

function LineupSection({ title, subtitle, icon, books, statKey, statLabel, accentColor, formatStat }) {
  if (!books || books.length === 0) return null

  const colorClasses = {
    gold: 'text-amber-400',
    red: 'text-red-400',
    blue: 'text-blue-400',
  }

  return (
    <section className="mb-12">
      <div className="flex items-center gap-3 mb-4">
        <span className="text-3xl">{icon}</span>
        <div>
          <h3
            className={`text-xl font-bold ${colorClasses[accentColor]} uppercase tracking-wider`}
            style={{ fontFamily: 'var(--font-family-display)' }}
          >
            {title}
          </h3>
          <p className="text-sm text-gray-500">{subtitle}</p>
        </div>
      </div>

      <div className="space-y-3">
        {books.map((book, index) => {
          const stats = book.characters?.[0]?.player?.stats
          const statValue = formatStat
            ? formatStat(stats, book)
            : stats?.[statKey]?.toFixed(1) || '—'

          return (
            <LineupCard
              key={book.id}
              book={book}
              rank={index + 1}
              statLabel={statLabel}
              statValue={statValue}
              accentColor={accentColor}
            />
          )
        })}
      </div>
    </section>
  )
}

export default function AutoLineups({ books }) {
  const [lineups, setLineups] = useState({ allNba: [], allOffense: [], allDefense: [] })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadStats() {
      if (!books || books.length === 0) {
        setLoading(false)
        return
      }

      // Get books with player comps
      const booksWithPlayers = books.filter(book =>
        book.characters?.some(char => char.player)
      )

      // Load stats for each player
      const booksWithStats = await Promise.all(
        booksWithPlayers.map(async (book) => {
          const player = book.characters?.[0]?.player
          if (player) {
            const stats = await getPlayerStats(player.name)
            return {
              ...book,
              characters: book.characters.map((char, i) =>
                i === 0 ? { ...char, player: { ...char.player, stats } } : char
              )
            }
          }
          return book
        })
      )

      const generatedLineups = generateLineups(booksWithStats)
      setLineups(generatedLineups)
      setLoading(false)
    }

    loadStats()
  }, [books])

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 my-12">
        <div className="text-center mb-8">
          <div className="h-8 bg-sonics-green/20 rounded w-72 mx-auto mb-3 animate-pulse" />
          <div className="h-4 bg-sonics-green/20 rounded w-56 mx-auto animate-pulse" />
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {[1, 2, 3].map(col => (
            <div key={col} className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-sonics-green/20 rounded animate-pulse" />
                <div className="space-y-2">
                  <div className="h-5 bg-sonics-green/20 rounded w-28 animate-pulse" />
                  <div className="h-3 bg-sonics-green/20 rounded w-24 animate-pulse" />
                </div>
              </div>
              {[1, 2, 3, 4, 5].map(row => (
                <div key={row} className="border border-sonics-green/20 rounded-xl p-4 animate-pulse">
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 bg-sonics-green/20 rounded" />
                    <div className="w-12 h-16 bg-sonics-green/20 rounded" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-sonics-green/20 rounded w-3/4" />
                      <div className="h-3 bg-sonics-green/20 rounded w-1/2" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    )
  }

  const hasAnyLineup = lineups.allNba.length > 0 || lineups.allOffense.length > 0 || lineups.allDefense.length > 0

  if (!hasAnyLineup) return null

  return (
    <div className="max-w-6xl mx-auto px-4 my-12">
      <div className="text-center mb-8">
        <h2
          className="text-2xl md:text-3xl font-bold text-white"
          style={{ fontFamily: 'var(--font-family-display)' }}
        >
          AUTO-GENERATED ALL-STAR TEAMS
        </h2>
        <p className="text-gray-500 mt-2">Based on real NBA career statistics</p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {/* All-NBA Team */}
        <LineupSection
          title="ALL-NBA TEAM"
          subtitle="Top players by efficiency"
          icon="🏆"
          books={lineups.allNba}
          statKey="per"
          statLabel="PER"
          accentColor="gold"
          formatStat={(stats) => stats?.per?.toFixed(1) || '—'}
        />

        {/* All-Offense */}
        <LineupSection
          title="ALL-OFFENSE"
          subtitle="Top scorers by PPG"
          icon="🔥"
          books={lineups.allOffense}
          statKey="ppg"
          statLabel="PPG"
          accentColor="red"
          formatStat={(stats) => stats?.ppg?.toFixed(1) || '—'}
        />

        {/* All-Defense */}
        <LineupSection
          title="ALL-DEFENSE"
          subtitle="Top defenders by STL+BLK"
          icon="🛡️"
          books={lineups.allDefense}
          statKey="spg"
          statLabel="STL+BLK"
          accentColor="blue"
          formatStat={(stats) => {
            if (!stats) return '—'
            return ((stats.spg || 0) + (stats.bpg || 0)).toFixed(1)
          }}
        />
      </div>
    </div>
  )
}
