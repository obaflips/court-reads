import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getAllData } from '../api/airtable'
import Header from '../components/Header'
import GoldRatingBackboards from '../components/GoldRatingBackboards'

function TrophyIcon({ className = "" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 15c-1.95 0-3.61-1.27-4.19-3.03C6.19 12.31 5 11.3 5 10V5h14v5c0 1.3-1.19 2.31-2.81 1.97C15.61 13.73 13.95 15 12 15z" />
      <path d="M5 5V3h14v2H5z" opacity="0.3" />
      <path d="M2 5h3v5c0 .55-.45 1-1 1H3c-.55 0-1-.45-1-1V5zM19 5h3v5c0 .55-.45 1-1 1h-1c-.55 0-1-.45-1-1V5z" />
      <path d="M9 18h6v3H9z" />
      <path d="M7 21h10v1H7z" />
      <path d="M11 15h2v3h-2z" />
    </svg>
  )
}

function MedalBadge({ rank }) {
  const colors = {
    1: { bg: 'bg-gradient-to-br from-amber-300 to-amber-500', text: 'text-amber-900', label: '1ST' },
    2: { bg: 'bg-gradient-to-br from-gray-300 to-gray-400', text: 'text-gray-700', label: '2ND' },
    3: { bg: 'bg-gradient-to-br from-orange-400 to-orange-600', text: 'text-orange-900', label: '3RD' },
  }

  const style = colors[rank]
  if (!style) return null

  return (
    <div className={`absolute -top-3 -left-3 w-12 h-12 ${style.bg} rounded-full flex items-center justify-center shadow-lg z-10`}>
      <span className={`text-xs font-bold ${style.text}`} style={{ fontFamily: 'var(--font-family-display)' }}>
        {style.label}
      </span>
    </div>
  )
}

function HallOfFameCard({ book, rank }) {
  const mainCharacter = book.characters?.[0]
  const player = mainCharacter?.player

  const formatDate = (dateStr) => {
    if (!dateStr) return null
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
  }

  return (
    <Link
      to={`/book/${book.id}`}
      className="group relative block"
    >
      {/* Gold glow effect */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 rounded-2xl opacity-30 group-hover:opacity-60 blur-sm transition-all duration-500 animate-shimmer-slow" />

      {/* Card */}
      <div className="relative border-2 border-amber-500/50 rounded-xl bg-gradient-to-br from-amber-950/40 via-sonics-dark to-amber-950/20 p-5 overflow-hidden group-hover:border-amber-400 transition-all duration-300">
        {/* Shimmer overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-400/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />

        {/* Medal Badge for top 3 */}
        {rank <= 3 && <MedalBadge rank={rank} />}

        {/* Trophy Badge */}
        <div className="absolute top-3 right-3">
          <TrophyIcon className="w-8 h-8 text-amber-500/60 group-hover:text-amber-400 transition-colors" />
        </div>

        <div className="flex gap-5">
          {/* Book Cover */}
          <div className="flex-shrink-0">
            {book.coverUrl ? (
              <img
                src={book.coverUrl}
                alt={book.title}
                className="w-24 h-36 object-cover rounded-lg shadow-lg border border-amber-500/30 group-hover:shadow-amber-500/20 group-hover:shadow-xl transition-shadow"
              />
            ) : (
              <div className="w-24 h-36 bg-amber-900/30 rounded-lg flex items-center justify-center border border-amber-500/30">
                <span className="text-amber-500/50 text-sm">No Cover</span>
              </div>
            )}
          </div>

          {/* Book Info */}
          <div className="flex-1 min-w-0">
            <h3
              className="text-lg font-bold text-white group-hover:text-amber-300 transition-colors truncate"
              style={{ fontFamily: 'var(--font-family-display)' }}
            >
              {book.title}
            </h3>
            <p className="text-gray-400 text-sm truncate">{book.author}</p>

            {book.series && (
              <Link
                to={`/series/${book.seriesId}`}
                className="inline-block text-amber-600 text-xs mt-1 hover:text-amber-400 transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                {book.series.name} #{book.seriesPosition} →
              </Link>
            )}

            <div className="mt-3">
              <GoldRatingBackboards rating={book.rating} />
            </div>

            {/* Player Comp */}
            {mainCharacter && player && (
              <div className="mt-3 pt-3 border-t border-amber-500/20">
                <div
                  className="text-sm text-amber-400 font-semibold"
                  style={{ fontFamily: 'var(--font-family-display)' }}
                >
                  {mainCharacter.name} <span className="text-gray-500">is</span> {player.name}
                </div>
                {mainCharacter.tagline && (
                  <p className="text-amber-200/80 text-xs mt-1 italic line-clamp-2">"{mainCharacter.tagline}"</p>
                )}
                {mainCharacter?.description && (
                  <p className="text-amber-200/60 text-xs mt-2 line-clamp-2">
                    {mainCharacter.description}
                  </p>
                )}
              </div>
            )}

            {book.dateFinished && (
              <p className="text-xs text-gray-300 mt-2">
                Inducted: {formatDate(book.dateFinished)}
              </p>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}

export default function HallOfFame() {
  const [books, setBooks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await getAllData()
        // Get top 5 rated books, sorted by rating (desc), then by date (desc)
        const hofBooks = (data.books || [])
          .filter(book => book.rating > 0)
          .sort((a, b) => {
            if (b.rating !== a.rating) return b.rating - a.rating
            return new Date(b.dateFinished) - new Date(a.dateFinished)
          })
          .slice(0, 5)
        setBooks(hofBooks)
      } catch (err) {
        console.error('Error fetching data:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="max-w-5xl mx-auto px-4 py-8">
          {/* Hero Section skeleton */}
          <div className="text-center mb-12 animate-pulse">
            <div className="w-24 h-24 bg-amber-500/20 rounded-full mx-auto mb-6" />
            <div className="h-12 bg-amber-500/20 rounded w-64 mx-auto mb-4" />
            <div className="h-5 bg-amber-500/20 rounded w-80 mx-auto" />
          </div>

          {/* Stats Banner skeleton */}
          <div className="flex justify-center mb-12">
            <div className="h-16 bg-amber-500/20 rounded-full w-64 animate-pulse" />
          </div>

          {/* Books Grid skeleton */}
          <div className="grid md:grid-cols-2 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="border border-amber-500/20 rounded-xl p-5 animate-pulse">
                <div className="flex gap-5">
                  <div className="w-24 h-36 bg-amber-500/20 rounded-lg" />
                  <div className="flex-1 space-y-3">
                    <div className="h-5 bg-amber-500/20 rounded w-3/4" />
                    <div className="h-4 bg-amber-500/20 rounded w-1/2" />
                    <div className="h-4 bg-amber-500/20 rounded w-1/3" />
                    <div className="h-6 bg-amber-500/20 rounded w-full mt-4" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <div
            className="text-4xl font-bold text-amber-400"
            style={{ fontFamily: 'var(--font-family-display)' }}
          >
            ERROR
          </div>
          <p className="text-red-400 mt-4">{error}</p>
          <Link to="/" className="inline-block mt-6 text-sonics-green hover:text-sonics-gold transition-colors">
            ← Back to Home
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen hardwood-bg court-lines">
      <Header />

      <main className="relative z-10 max-w-5xl mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          {/* Trophy Icon */}
          <div className="relative inline-block mb-6">
            <div className="absolute inset-0 bg-amber-400/30 rounded-full blur-xl animate-pulse" />
            <TrophyIcon className="relative w-24 h-24 text-amber-400 drop-shadow-[0_0_15px_rgba(251,191,36,0.5)] animate-bounce-slow" />
          </div>

          {/* Title */}
          <h1
            className="text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-300 bg-clip-text text-transparent"
            style={{ fontFamily: 'var(--font-family-display)' }}
          >
            HALL OF FAME
          </h1>
          <p className="text-gray-400 mt-4 text-lg">
            My Top 5 Highest Rated Reads
          </p>
        </div>

        {/* Books Grid */}
        {books.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-6">
            {books.map((book, index) => (
              <HallOfFameCard key={book.id} book={book} rank={index + 1} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <TrophyIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No books inducted yet</p>
            <p className="text-gray-600 text-sm mt-2">Add some rated books to see the top 5 here</p>
          </div>
        )}
      </main>
    </div>
  )
}
