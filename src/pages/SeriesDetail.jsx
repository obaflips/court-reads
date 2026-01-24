import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getAllData } from '../api/airtable'
import Header from '../components/Header'
import RatingBackboards from '../components/RatingBackboards'

function calculateTrend(ratings) {
  // Filter out null/undefined ratings
  const validRatings = ratings.filter(r => r != null)
  if (validRatings.length < 2) return 'steady'

  // Calculate trend based on first half vs second half average
  const mid = Math.floor(validRatings.length / 2)
  const firstHalf = validRatings.slice(0, mid)
  const secondHalf = validRatings.slice(mid)

  const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length
  const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length

  const diff = secondAvg - firstAvg
  if (diff > 0.3) return 'rising'
  if (diff < -0.3) return 'falling'
  return 'steady'
}

function TrendIndicator({ trend }) {
  const config = {
    rising: { icon: '↗', color: 'text-green-700', bg: 'bg-green-100', label: 'Rising' },
    falling: { icon: '↘', color: 'text-red-600', bg: 'bg-red-100', label: 'Falling' },
    steady: { icon: '→', color: 'text-amber-600', bg: 'bg-amber-100', label: 'Steady' },
  }

  const { icon, color, bg, label } = config[trend] || config.steady

  return (
    <div className={`flex items-center gap-2 ${color}`}>
      <span className={`text-2xl ${bg} w-10 h-10 rounded-full flex items-center justify-center`}>
        {icon}
      </span>
      <span className="font-medium">{label}</span>
    </div>
  )
}

function RatingBar({ rating, bookNumber, playerNumber, isRead, maxHeight = 160 }) {
  const barHeight = isRead ? (rating / 5) * maxHeight : maxHeight * 0.6

  return (
    <div className="flex flex-col items-center gap-2">
      {/* Bar */}
      <div
        className="relative w-12 md:w-16 rounded-t-lg flex items-end justify-center transition-all"
        style={{ height: `${maxHeight}px` }}
      >
        <div
          className={`w-full rounded-t-lg transition-all duration-500 ${
            isRead
              ? 'bg-gradient-to-t from-emerald-700 to-emerald-500'
              : 'bg-stone-200 border-2 border-dashed border-stone-300'
          }`}
          style={{ height: `${barHeight}px` }}
        >
          {/* Player number or ? */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span
              className={`text-lg font-bold ${isRead ? 'text-white' : 'text-stone-400'}`}
              style={{ fontFamily: 'var(--font-family-display)' }}
            >
              {isRead ? (playerNumber ? `#${playerNumber}` : '—') : '?'}
            </span>
          </div>
        </div>
      </div>

      {/* Book number label */}
      <div className="text-center">
        <div className="text-xs text-stone-500">Book</div>
        <div
          className={`text-sm font-bold ${isRead ? 'text-emerald-800' : 'text-stone-400'}`}
          style={{ fontFamily: 'var(--font-family-display)' }}
        >
          {bookNumber}
        </div>
      </div>
    </div>
  )
}

function RatingProgressionChart({ seriesBooks, totalBooks }) {
  // Create array for all books in series (read and unread)
  const allBooks = []

  // Check if any books have series positions set
  const hasPositions = seriesBooks.some(b => b.seriesPosition != null)

  for (let i = 1; i <= totalBooks; i++) {
    let book = null

    if (hasPositions) {
      // Match by series position (convert to number for comparison)
      book = seriesBooks.find(b => Number(b.seriesPosition) === i)
    } else {
      // No positions set - use books in order they appear
      book = seriesBooks[i - 1] || null
    }

    allBooks.push({
      position: i,
      book: book || null,
      isRead: !!book,
      rating: book?.rating || null,
      playerNumber: book?.characters?.[0]?.player?.number || null,
    })
  }

  // Get read books for trend line
  const readBooks = allBooks.filter(b => b.isRead && b.rating)

  return (
    <div className="bg-white border-4 border-emerald-600 rounded-xl p-6 shadow-lg">
      <h3
        className="text-lg font-bold text-emerald-700 mb-6 uppercase tracking-wider"
        style={{ fontFamily: 'var(--font-family-display)' }}
      >
        Rating Progression
      </h3>

      <div className="relative">
        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 bottom-8 w-8 flex flex-col justify-between text-xs text-stone-500">
          <span>5★</span>
          <span>4★</span>
          <span>3★</span>
          <span>2★</span>
          <span>1★</span>
        </div>

        {/* Chart area */}
        <div className="ml-10">
          {/* Grid lines */}
          <div className="absolute left-10 right-0 top-0" style={{ height: '160px' }}>
            {[0, 1, 2, 3, 4].map(i => (
              <div
                key={i}
                className="absolute left-0 right-0 border-t border-stone-200"
                style={{ top: `${i * 25}%` }}
              />
            ))}
          </div>

          {/* Bars */}
          <div className="flex items-end gap-2 md:gap-4 overflow-x-auto pb-4" style={{ minHeight: '200px' }}>
            {allBooks.map((item, index) => (
              <RatingBar
                key={index}
                rating={item.rating}
                bookNumber={item.position}
                playerNumber={item.playerNumber}
                isRead={item.isRead}
              />
            ))}
          </div>

          {/* Trend line (SVG overlay) */}
          {readBooks.length >= 2 && (
            <svg
              className="absolute left-10 top-0 pointer-events-none"
              style={{ height: '160px', width: `calc(100% - 2.5rem)` }}
            >
              <polyline
                fill="none"
                stroke="#FFC200"
                strokeWidth="2"
                strokeDasharray="5,5"
                points={readBooks.map((b, i) => {
                  const x = (b.position - 1) * 72 + 32 // Approximate x position
                  const y = 160 - (b.rating / 5) * 160
                  return `${x},${y}`
                }).join(' ')}
              />
            </svg>
          )}
        </div>
      </div>
    </div>
  )
}

export default function SeriesDetail() {
  const { seriesId } = useParams()
  const [series, setSeries] = useState(null)
  const [seriesBooks, setSeriesBooks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await getAllData()

        // Find the series
        const foundSeries = data.series.find(s => s.id === seriesId)
        if (!foundSeries) {
          setError('Series not found')
          return
        }

        // Get all books in this series
        const booksInSeries = data.books
          .filter(b => b.seriesId === seriesId)
          .sort((a, b) => (a.seriesPosition || 0) - (b.seriesPosition || 0))

        // Get author from first book
        if (booksInSeries.length > 0 && !foundSeries.author) {
          foundSeries.author = booksInSeries[0].author
        }

        setSeries(foundSeries)
        setSeriesBooks(booksInSeries)
      } catch (err) {
        console.error('Error fetching data:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [seriesId])

  if (loading) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="max-w-5xl mx-auto px-4 py-8">
          {/* Back button skeleton */}
          <div className="h-5 w-32 bg-emerald-200 rounded mb-8 animate-pulse" />

          {/* Series Header skeleton */}
          <div className="mb-8 animate-pulse">
            <div className="h-10 bg-emerald-200 rounded w-2/3 mb-3" />
            <div className="h-6 bg-emerald-200 rounded w-1/3" />
          </div>

          {/* Stats Grid skeleton */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-white border-2 border-emerald-200 rounded-xl p-4 animate-pulse">
                <div className="h-4 bg-emerald-100 rounded w-16 mb-2" />
                <div className="h-8 bg-emerald-100 rounded w-20" />
              </div>
            ))}
          </div>

          {/* Chart skeleton */}
          <div className="bg-white border-2 border-emerald-200 rounded-xl p-6 mb-8 animate-pulse">
            <div className="h-5 bg-emerald-100 rounded w-40 mb-6" />
            <div className="h-48 bg-emerald-100 rounded" />
          </div>

          {/* Table skeleton */}
          <div className="h-5 bg-emerald-200 rounded w-48 mb-4 animate-pulse" />
          <div className="bg-white border-2 border-emerald-200 rounded-xl overflow-hidden animate-pulse">
            <div className="h-12 bg-emerald-100" />
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-20 border-t border-emerald-100" />
            ))}
          </div>
        </main>
      </div>
    )
  }

  if (error) {
    const isNotFound = error === 'Series not found'

    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="mb-6">
            <svg className="w-20 h-20 mx-auto text-amber-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {isNotFound ? (
                <>
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <line x1="9" y1="9" x2="15" y2="15" />
                  <line x1="15" y1="9" x2="9" y2="15" />
                </>
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              )}
            </svg>
          </div>

          <h1
            className="text-3xl md:text-4xl font-bold text-emerald-800"
            style={{ fontFamily: 'var(--font-family-display)' }}
          >
            {isNotFound ? 'SERIES NOT FOUND' : 'TECHNICAL FOUL'}
          </h1>

          <p className="text-stone-600 mt-4">
            {isNotFound
              ? "This series doesn't exist in our library."
              : error}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            <Link
              to="/"
              className="px-6 py-3 bg-amber-500 text-white font-semibold rounded-lg hover:bg-amber-600 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
            >
              Back to Roster
            </Link>
            {!isNotFound && (
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-3 border border-emerald-700 text-emerald-700 font-semibold rounded-lg hover:bg-emerald-50 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:ring-offset-2"
              >
                Try Again
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Calculate stats
  const booksRead = seriesBooks.length
  const totalBooks = series.totalBooks || seriesBooks.length
  const ratings = seriesBooks.map(b => b.rating).filter(r => r != null)
  const avgRating = ratings.length > 0
    ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1)
    : '—'
  const trend = calculateTrend(seriesBooks.map(b => b.rating))

  return (
    <div className="min-h-screen">
      <Header />

      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* Back Button */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-emerald-700 hover:text-amber-600 transition-colors mb-8"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Roster
        </Link>

        {/* Series Header */}
        <div className="mb-8">
          <h1
            className="text-3xl md:text-4xl font-bold text-emerald-800"
            style={{ fontFamily: 'var(--font-family-display)' }}
          >
            {series.name}
          </h1>
          {series.author && (
            <p className="text-xl text-stone-600 mt-2">by {series.author}</p>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {/* Progress */}
          <div className="bg-white border-2 border-emerald-200 rounded-xl p-4 shadow-sm">
            <div className="text-sm text-stone-500 uppercase tracking-wider mb-1">Progress</div>
            <div
              className="text-2xl md:text-3xl font-bold text-amber-600"
              style={{ fontFamily: 'var(--font-family-display)' }}
            >
              {booksRead}/{totalBooks}
            </div>
            <div className="text-xs text-stone-500 mt-1">books read</div>
          </div>

          {/* Average Rating */}
          <div className="bg-white border-2 border-emerald-200 rounded-xl p-4 shadow-sm">
            <div className="text-sm text-stone-500 uppercase tracking-wider mb-1">Avg Rating</div>
            <div
              className="text-2xl md:text-3xl font-bold text-amber-600"
              style={{ fontFamily: 'var(--font-family-display)' }}
            >
              {avgRating}
            </div>
            <div className="text-xs text-stone-500 mt-1">out of 5</div>
          </div>

          {/* Team Name */}
          <div className="bg-white border-2 border-emerald-200 rounded-xl p-4 shadow-sm">
            <div className="text-sm text-stone-500 uppercase tracking-wider mb-1">Series Team</div>
            <div
              className="text-lg md:text-xl font-bold text-emerald-800 leading-tight"
              style={{ fontFamily: 'var(--font-family-display)' }}
            >
              {series.teamName || '—'}
            </div>
          </div>

          {/* Trend */}
          <div className="bg-white border-2 border-emerald-200 rounded-xl p-4 shadow-sm">
            <div className="text-sm text-stone-500 uppercase tracking-wider mb-1">Trend</div>
            <TrendIndicator trend={trend} />
          </div>
        </div>

        {/* Rating Progression Chart */}
        <div className="mb-8">
          <RatingProgressionChart seriesBooks={seriesBooks} totalBooks={totalBooks} />
        </div>

        {/* Series Team Roster */}
        <section>
          <h2
            className="text-xl font-bold text-emerald-700 mb-4 uppercase tracking-wider"
            style={{ fontFamily: 'var(--font-family-display)' }}
          >
            Series Team Roster
          </h2>

          <div className="bg-white border-4 border-emerald-600 rounded-xl overflow-hidden shadow-lg">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-emerald-700 text-left">
                    <th className="px-4 py-3 text-amber-400 font-semibold text-sm uppercase tracking-wider w-12">
                      #
                    </th>
                    <th className="px-4 py-3 text-amber-400 font-semibold text-sm uppercase tracking-wider w-16">
                      Cover
                    </th>
                    <th className="px-4 py-3 text-amber-400 font-semibold text-sm uppercase tracking-wider w-24">
                      Rating
                    </th>
                    <th className="px-4 py-3 text-amber-400 font-semibold text-sm uppercase tracking-wider">
                      Book
                    </th>
                    <th className="px-4 py-3 text-amber-400 font-semibold text-sm uppercase tracking-wider">
                      Player Comp
                    </th>
                    <th className="px-4 py-3 text-amber-400 font-semibold text-sm uppercase tracking-wider hidden md:table-cell">
                      Tagline
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: totalBooks }, (_, i) => i + 1).map(position => {
                    // Check if any books have series positions set
                    const hasPositions = seriesBooks.some(b => b.seriesPosition != null)
                    let book = null

                    if (hasPositions) {
                      book = seriesBooks.find(b => Number(b.seriesPosition) === position)
                    } else {
                      book = seriesBooks[position - 1] || null
                    }

                    const isRead = !!book
                    const mainCharacter = book?.characters?.[0]
                    const player = mainCharacter?.player

                    return (
                      <tr
                        key={position}
                        className={`border-t border-emerald-100 ${
                          isRead ? 'hover:bg-emerald-50' : 'opacity-50'
                        } transition-colors`}
                      >
                        {/* Position Number */}
                        <td className="px-4 py-4">
                          <span
                            className={`text-xl font-bold ${isRead ? 'text-amber-500' : 'text-stone-400'}`}
                            style={{ fontFamily: 'var(--font-family-display)' }}
                          >
                            {String(position).padStart(2, '0')}
                          </span>
                        </td>

                        {/* Cover */}
                        <td className="px-4 py-4">
                          {isRead ? (
                            book.coverUrl ? (
                              <Link to={`/book/${book.id}`}>
                                <img
                                  src={book.coverUrl}
                                  alt={book.title}
                                  className="w-12 h-16 object-cover rounded shadow-sm hover:shadow-md transition-shadow border border-emerald-200"
                                />
                              </Link>
                            ) : (
                              <div className="w-12 h-16 bg-emerald-100 rounded" />
                            )
                          ) : (
                            <div className="w-12 h-16 bg-stone-100 rounded border border-dashed border-stone-300 flex items-center justify-center">
                              <span className="text-stone-400 text-lg">?</span>
                            </div>
                          )}
                        </td>

                        {/* Rating */}
                        <td className="px-4 py-4">
                          {isRead ? (
                            <RatingBackboards rating={book.rating} />
                          ) : (
                            <span className="text-stone-400">—</span>
                          )}
                        </td>

                        {/* Title */}
                        <td className="px-4 py-4">
                          {isRead ? (
                            <Link to={`/book/${book.id}`} className="block hover:text-emerald-700 transition-colors">
                              <div
                                className="font-semibold text-stone-800"
                                style={{ fontFamily: 'var(--font-family-display)' }}
                              >
                                {book.title}
                              </div>
                            </Link>
                          ) : (
                            <div className="text-stone-400 italic">Coming soon...</div>
                          )}
                        </td>

                        {/* Player Comp */}
                        <td className="px-4 py-4">
                          {isRead && mainCharacter && player ? (
                            <div
                              className="text-amber-600"
                              style={{ fontFamily: 'var(--font-family-display)' }}
                            >
                              {mainCharacter.name} <span className="text-stone-500 font-normal">is</span> {player.name}
                            </div>
                          ) : (
                            <span className="text-stone-400">—</span>
                          )}
                        </td>

                        {/* Tagline */}
                        <td className="px-4 py-4 hidden md:table-cell">
                          {isRead && mainCharacter?.tagline ? (
                            <span className="text-stone-500 italic text-sm">
                              "{mainCharacter.tagline}"
                            </span>
                          ) : (
                            <span className="text-stone-400">—</span>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-emerald-200 py-8 text-center text-stone-500 text-sm mt-12">
        <p>Where fantasy meets the hardwood</p>
      </footer>
    </div>
  )
}
