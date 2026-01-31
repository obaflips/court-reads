import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getAllData } from '../api/airtable'
import Header from '../components/Header'
import RatingBackboards from '../components/RatingBackboards'

export default function BookDetail() {
  const { id } = useParams()
  const [book, setBook] = useState(null)
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

  if (loading) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="max-w-4xl mx-auto px-4 py-8">
          {/* Back button skeleton */}
          <div className="h-5 w-32 bg-emerald-200 rounded mb-8 animate-pulse" />

          {/* Book Info Section skeleton */}
          <div className="bg-white border-4 border-emerald-200 rounded-xl p-6 md:p-8 animate-pulse">
            <div className="flex flex-col md:flex-row gap-8">
              <div className="w-48 md:w-56 h-72 md:h-80 bg-emerald-100 rounded-lg mx-auto md:mx-0" />
              <div className="flex-1 space-y-4">
                <div className="h-10 bg-emerald-100 rounded w-3/4" />
                <div className="h-6 bg-emerald-100 rounded w-1/3" />
                <div className="h-10 bg-emerald-100 rounded w-1/2 mt-4" />
                <div className="flex gap-6 mt-6">
                  <div className="space-y-2">
                    <div className="h-4 bg-emerald-100 rounded w-16" />
                    <div className="h-6 bg-emerald-100 rounded w-24" />
                  </div>
                  <div className="space-y-2">
                    <div className="h-4 bg-emerald-100 rounded w-16" />
                    <div className="h-6 bg-emerald-100 rounded w-32" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Player Comp Section skeleton */}
          <div className="mt-8 space-y-4 animate-pulse">
            <div className="h-6 bg-emerald-200 rounded w-40" />
            <div className="bg-white border-4 border-emerald-200 rounded-xl overflow-hidden">
              <div className="bg-emerald-100 p-6">
                <div className="h-8 bg-emerald-200 rounded w-2/3 mx-auto" />
              </div>
              <div className="p-6">
                <div className="flex flex-col md:flex-row gap-8">
                  <div className="flex-1 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="h-24 bg-emerald-100 rounded-lg" />
                      <div className="h-24 bg-emerald-100 rounded-lg" />
                      <div className="col-span-2 h-20 bg-emerald-100 rounded-lg" />
                    </div>
                  </div>
                  <div className="flex-1 h-56 bg-emerald-100 rounded-lg" />
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
          {/* Error Icon */}
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
                <>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </>
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

  const mainCharacter = book.characters?.[0]
  const player = mainCharacter?.player

  // Format date
  const formatDate = (dateStr) => {
    if (!dateStr) return null
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  // Extract YouTube video ID for embedding
  const getYouTubeEmbedUrl = (url) => {
    if (!url) return null
    const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/)
    return match ? `https://www.youtube.com/embed/${match[1]}` : null
  }

  const embedUrl = player?.videoUrl ? getYouTubeEmbedUrl(player.videoUrl) : null

  return (
    <div className="min-h-screen hardwood-bg court-lines">
      <Header />

      <main className="relative z-10 max-w-4xl mx-auto px-4 py-8">
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

        {/* Book Info Section */}
        <section className="bg-white border-4 border-emerald-700 rounded-xl p-6 md:p-8 shadow-lg">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Book Cover */}
            <div className="flex-shrink-0">
              {book.coverUrl ? (
                <img
                  src={book.coverUrl}
                  alt={book.title}
                  className="w-48 md:w-56 h-auto rounded-lg shadow-xl border-2 border-emerald-200 mx-auto md:mx-0"
                />
              ) : (
                <div className="w-48 md:w-56 h-72 md:h-80 bg-emerald-100 rounded-lg flex items-center justify-center border-2 border-emerald-200">
                  <span className="text-emerald-400">No Cover</span>
                </div>
              )}
            </div>

            {/* Book Details */}
            <div className="flex-1">
              <h2
                className="text-3xl md:text-4xl font-bold text-emerald-800"
                style={{ fontFamily: 'var(--font-family-display)' }}
              >
                {book.title}
              </h2>
              <p className="text-xl text-stone-600 mt-2">by {book.author}</p>

              {/* Series Info */}
              {book.series && (
                <Link
                  to={`/series/${book.seriesId}`}
                  className="mt-4 inline-block bg-emerald-50 border-2 border-emerald-600 px-4 py-2 rounded-lg hover:bg-emerald-100 transition-colors"
                >
                  <span className="text-emerald-700 font-medium">
                    {book.series.name}
                  </span>
                  <span className="text-stone-500 ml-2">
                    Book {book.seriesPosition} of {book.series.totalBooks}
                  </span>
                  <span className="text-amber-600 ml-2">→</span>
                </Link>
              )}

              {/* Rating & Date */}
              <div className="mt-6 flex flex-wrap items-center gap-6">
                <div>
                  <div className="text-sm text-stone-500 uppercase tracking-wider mb-1">Rating</div>
                  <RatingBackboards rating={book.rating} />
                </div>
                {book.dateFinished && (
                  <div>
                    <div className="text-sm text-stone-500 uppercase tracking-wider mb-1">Finished</div>
                    <div className="text-stone-800">{formatDate(book.dateFinished)}</div>
                  </div>
                )}
              </div>

              {/* Purchase Link */}
              {book.purchaseUrl && (
                <a
                  href={book.purchaseUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 mt-6 bg-amber-500 text-white font-semibold px-6 py-3 rounded-lg hover:bg-amber-600 transition-colors"
                >
                  Get This Book
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              )}
            </div>
          </div>
        </section>

        {/* Player Comp Section */}
        {mainCharacter && player && (
          <section className="mt-8">
            <h3
              className="text-2xl font-bold text-emerald-700 mb-6 uppercase tracking-wider"
              style={{ fontFamily: 'var(--font-family-display)' }}
            >
              The Player Comp
            </h3>

            <div className="bg-white border-4 border-amber-500 rounded-xl overflow-hidden shadow-lg">
              {/* Comp Header */}
              <div className="bg-gradient-to-r from-emerald-700 to-emerald-800 p-6 text-center">
                <div
                  className="text-3xl md:text-4xl text-amber-400 font-bold"
                  style={{ fontFamily: 'var(--font-family-display)' }}
                >
                  {mainCharacter.name} <span className="text-white">is</span> {player.name}
                </div>
                {mainCharacter.tagline && (
                  <p className="text-xl text-emerald-100 mt-3 italic">"{mainCharacter.tagline}"</p>
                )}
              </div>

              {/* Player Info */}
              <div className="p-6">
                <div className="flex flex-col md:flex-row gap-8">
                  {/* Player Stats */}
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold text-emerald-800 mb-4">Player Profile</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-emerald-50 border-2 border-emerald-200 rounded-lg p-4">
                        <div className="text-sm text-stone-500 uppercase tracking-wider">Number</div>
                        <div
                          className="text-3xl font-bold text-amber-600 mt-1"
                          style={{ fontFamily: 'var(--font-family-display)' }}
                        >
                          #{player.number || '—'}
                        </div>
                      </div>
                      <div className="bg-emerald-50 border-2 border-emerald-200 rounded-lg p-4">
                        <div className="text-sm text-stone-500 uppercase tracking-wider">Position</div>
                        <div
                          className="text-3xl font-bold text-amber-600 mt-1"
                          style={{ fontFamily: 'var(--font-family-display)' }}
                        >
                          {player.position || '—'}
                        </div>
                      </div>
                      <div className="col-span-2 bg-amber-50 border-2 border-amber-200 rounded-lg p-4">
                        <div className="text-sm text-stone-500 uppercase tracking-wider">Team</div>
                        <div className="text-xl font-semibold text-stone-800 mt-1">
                          {player.currentTeam || '—'}
                        </div>
                      </div>
                    </div>

                    {/* Character Description */}
                    {mainCharacter.description && (
                      <div className="mt-6">
                        <h4 className="text-lg font-semibold text-emerald-800 mb-2">Why This Comp?</h4>
                        <p className="text-stone-600 leading-relaxed">{mainCharacter.description}</p>
                      </div>
                    )}
                  </div>

                  {/* Video */}
                  {embedUrl && (
                    <div className="flex-1">
                      <h4 className="text-lg font-semibold text-emerald-800 mb-4">Highlight Reel</h4>
                      <div className="aspect-video rounded-lg overflow-hidden border-2 border-emerald-200">
                        <iframe
                          src={embedUrl}
                          title={`${player.name} highlights`}
                          className="w-full h-full"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>
        )}

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
                    {char.name} <span className="text-stone-500 font-normal">is</span> {char.player?.name || 'TBD'}
                  </div>
                  {char.tagline && (
                    <p className="text-stone-500 mt-1 italic">"{char.tagline}"</p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      <footer className="border-t border-emerald-200 py-8 text-center text-stone-500 text-sm mt-12">
        <p>A personal project by a fantasy reader who watches too much basketball</p>
      </footer>
    </div>
  )
}
