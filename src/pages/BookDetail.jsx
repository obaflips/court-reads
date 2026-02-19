import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getAllData } from '../api/airtable'
import { getPlayerStats } from '../api/nbaStats'
import Navbar from '../components/Navbar'
import RatingBackboards from '../components/RatingBackboards'

export default function BookDetail() {
  const { id } = useParams()
  const [book, setBook] = useState(null)
  const [playerStats, setPlayerStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await getAllData()
        const foundBook = data.books.find(b => b.id === id)
        if (!foundBook) {
          setError('Book not found')
        } else {
          setBook(foundBook)
          const player = foundBook.characters?.[0]?.player
          if (player?.name) {
            getPlayerStats(player.name).then(setPlayerStats).catch(() => {})
          }
        }
      } catch (err) {
        console.error('Error fetching data:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [id])

  const formatDate = (dateStr) => {
    if (!dateStr) return null
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  }

  if (loading) {
    return (
      <div className="min-h-screen hardwood-bg court-lines">
        <Navbar />
        <main className="relative z-10 max-w-4xl mx-auto px-4 py-8">
          <div className="h-5 w-32 bg-emerald-200 rounded mb-8 animate-pulse" />
          <div className="bg-white border-4 border-emerald-200 rounded-xl overflow-hidden animate-pulse">
            <div className="h-9 bg-emerald-100" />
            <div className="flex flex-col md:flex-row">
              <div className="w-36 md:w-44 h-60 bg-emerald-100 m-6 rounded-lg flex-shrink-0" />
              <div className="flex-1 p-6 space-y-4">
                <div className="h-8 bg-emerald-100 rounded w-3/4" />
                <div className="h-5 bg-emerald-100 rounded w-1/3" />
                <div className="h-7 bg-emerald-100 rounded w-2/3 mt-6" />
                <div className="h-4 bg-emerald-100 rounded w-1/2" />
                <div className="flex gap-2 mt-4">
                  {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className="flex-1 h-14 bg-emerald-100 rounded-lg" />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    )
  }

  if (error) {
    const isNotFound = error === 'Book not found'
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="mb-6">
            <svg className="w-20 h-20 mx-auto text-amber-500" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              {isNotFound ? (
                <>
                  <circle cx="12" cy="12" r="10" strokeWidth="2" />
                  <path strokeLinecap="round" strokeWidth="2" d="M8 15s1.5-2 4-2 4 2 4 2" />
                  <circle cx="9" cy="9" r="1" fill="currentColor" />
                  <circle cx="15" cy="9" r="1" fill="currentColor" />
                </>
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              )}
            </svg>
          </div>
          <h1
            className="text-3xl md:text-4xl font-bold text-emerald-800"
            style={{ fontFamily: 'var(--font-family-display)' }}
          >
            {isNotFound ? 'BOOK NOT FOUND' : 'TECHNICAL FOUL'}
          </h1>
          <p className="text-stone-600 mt-4">
            {isNotFound
              ? "This book doesn't seem to be in our roster. It may have been removed or the link might be incorrect."
              : error}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            <Link
              to="/scout-reports"
              className="px-6 py-3 bg-amber-500 text-white font-semibold rounded-lg hover:bg-amber-600 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
            >
              All Books
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

  const mainCharacter = book.characters?.[0]
  const player = mainCharacter?.player

  return (
    <div className="min-h-screen hardwood-bg court-lines">
      <Navbar />

      <main className="relative z-10 max-w-4xl mx-auto px-4 py-8">
        {/* Back Button */}
        <Link
          to="/scout-reports"
          className="inline-flex items-center gap-2 text-emerald-700 hover:text-amber-600 transition-colors mb-8"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          All Books
        </Link>

        {/* Unified scouting report card */}
        <section className="bg-white border-4 border-emerald-700 rounded-xl overflow-hidden shadow-lg">
          {/* Header strip */}
          <div className="bg-gradient-to-r from-emerald-700 to-emerald-800 px-6 py-2 flex items-center justify-between">
            <span className="text-amber-400 font-bold tracking-wider text-sm">SCOUTING REPORT</span>
            {player && (
              <span className="text-emerald-300 text-sm">
                {[player.position, player.currentTeam].filter(Boolean).join(' · ')}
              </span>
            )}
          </div>

          {/* Cover + details side by side */}
          <div className="flex flex-col md:flex-row">
            {/* Book cover */}
            <div className="flex-shrink-0 p-6 flex items-start justify-center md:justify-start md:border-r-2 md:border-emerald-100">
              {book.coverUrl ? (
                <img
                  src={book.coverUrl}
                  alt={book.title}
                  className="w-36 md:w-44 h-auto rounded-lg shadow-lg border border-emerald-100"
                />
              ) : (
                <div className="w-36 md:w-44 h-56 bg-emerald-100 rounded-lg flex items-center justify-center border border-emerald-200">
                  <span className="text-emerald-400">No Cover</span>
                </div>
              )}
            </div>

            {/* All details */}
            <div className="flex-1 p-6">
              {/* Book title + author */}
              <h2
                className="text-2xl md:text-3xl font-bold text-emerald-800"
                style={{ fontFamily: 'var(--font-family-display)' }}
              >
                {book.title}
              </h2>
              <p className="text-stone-500 mt-1">by {book.author}</p>

              {/* Series link */}
              {book.series && (
                <Link
                  to={`/series/${book.seriesId}`}
                  className="mt-3 inline-block bg-emerald-50 border border-emerald-200 px-3 py-1 rounded text-sm text-emerald-700 hover:bg-emerald-100 transition-colors"
                >
                  {book.series.name} · Book {book.seriesPosition} of {book.series.totalBooks}
                  <span className="text-amber-500 ml-1">→</span>
                </Link>
              )}

              {/* Comp line — integrated into the same card */}
              {mainCharacter && player && (
                <div className="mt-5 pt-4 border-t-2 border-emerald-100">
                  <div
                    className="text-lg md:text-xl font-bold"
                    style={{ fontFamily: 'var(--font-family-display)' }}
                  >
                    <span className="text-amber-600">{mainCharacter.name}</span>
                    <span className="text-stone-400 font-normal mx-2 text-base">is</span>
                    <span className="text-emerald-800">{player.name}</span>
                  </div>
                  {mainCharacter.tagline && (
                    <p className="text-stone-500 italic text-sm mt-1">"{mainCharacter.tagline}"</p>
                  )}
                </div>
              )}

              {/* Rating + finished date */}
              <div className="mt-4 flex flex-wrap items-center gap-4">
                <RatingBackboards rating={book.rating} />
                {book.dateFinished && (
                  <span className="text-sm text-stone-400">{formatDate(book.dateFinished)}</span>
                )}
              </div>

              {/* Stat line */}
              {playerStats && (
                <div className="mt-4 flex gap-2">
                  {[
                    { label: 'PPG', value: playerStats.ppg?.toFixed(1) },
                    { label: 'RPG', value: playerStats.rpg?.toFixed(1) },
                    { label: 'APG', value: playerStats.apg?.toFixed(1) },
                    { label: 'SPG', value: playerStats.spg?.toFixed(1) },
                    { label: 'BPG', value: playerStats.bpg?.toFixed(1) },
                  ].map(({ label, value }) => (
                    <div
                      key={label}
                      className="flex-1 text-center bg-emerald-50 border border-emerald-200 rounded-lg py-2 px-1"
                    >
                      <div
                        className="text-lg md:text-xl font-bold text-emerald-800"
                        style={{ fontFamily: 'var(--font-family-display)' }}
                      >
                        {value}
                      </div>
                      <div className="text-xs text-stone-400 uppercase tracking-wider">{label}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* Purchase link */}
              {book.purchaseUrl && (
                <a
                  href={book.purchaseUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 mt-5 bg-amber-500 text-white font-semibold px-5 py-2.5 rounded-lg hover:bg-amber-600 transition-colors text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
                >
                  Get This Book
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              )}
            </div>
          </div>

          {/* Why this comp — stays in the same card, below the fold */}
          {mainCharacter?.description && (
            <div className="px-6 py-5 border-t-2 border-emerald-100 bg-stone-50">
              <h4 className="text-xs font-bold text-emerald-700 uppercase tracking-wider mb-2">
                Why this comp?
              </h4>
              <p className="text-stone-600 leading-relaxed">{mainCharacter.description}</p>
            </div>
          )}
        </section>

        {/* Additional Characters */}
        {book.characters && book.characters.length > 1 && (
          <section className="mt-8">
            <h3
              className="text-xl font-bold text-emerald-700 mb-4 uppercase tracking-wider"
              style={{ fontFamily: 'var(--font-family-display)' }}
            >
              More Comps
            </h3>
            <div className="grid gap-4">
              {book.characters.slice(1).map((char) => (
                <div
                  key={char.id}
                  className="bg-white border-2 border-emerald-200 rounded-lg p-4"
                >
                  <div
                    className="text-lg text-amber-600 font-semibold"
                    style={{ fontFamily: 'var(--font-family-display)' }}
                  >
                    {char.name}{' '}
                    <span className="text-stone-500 font-normal">is</span>{' '}
                    {char.player?.name || 'TBD'}
                  </div>
                  {char.tagline && (
                    <p className="text-stone-500 mt-1 italic text-sm">"{char.tagline}"</p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  )
}
