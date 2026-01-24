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
          <div className="h-5 w-32 bg-sonics-green/20 rounded mb-8 animate-pulse" />

          {/* Book Info Section skeleton */}
          <div className="border border-sonics-green/20 rounded-xl p-6 md:p-8 animate-pulse">
            <div className="flex flex-col md:flex-row gap-8">
              <div className="w-48 md:w-56 h-72 md:h-80 bg-sonics-green/20 rounded-lg mx-auto md:mx-0" />
              <div className="flex-1 space-y-4">
                <div className="h-10 bg-sonics-green/20 rounded w-3/4" />
                <div className="h-6 bg-sonics-green/20 rounded w-1/3" />
                <div className="h-10 bg-sonics-green/20 rounded w-1/2 mt-4" />
                <div className="flex gap-6 mt-6">
                  <div className="space-y-2">
                    <div className="h-4 bg-sonics-green/20 rounded w-16" />
                    <div className="h-6 bg-sonics-green/20 rounded w-24" />
                  </div>
                  <div className="space-y-2">
                    <div className="h-4 bg-sonics-green/20 rounded w-16" />
                    <div className="h-6 bg-sonics-green/20 rounded w-32" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Player Comp Section skeleton */}
          <div className="mt-8 space-y-4 animate-pulse">
            <div className="h-6 bg-sonics-green/20 rounded w-40" />
            <div className="border border-sonics-green/20 rounded-xl overflow-hidden">
              <div className="bg-sonics-green/10 p-6">
                <div className="h-8 bg-sonics-green/20 rounded w-2/3 mx-auto" />
              </div>
              <div className="p-6">
                <div className="flex flex-col md:flex-row gap-8">
                  <div className="flex-1 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="h-24 bg-sonics-green/20 rounded-lg" />
                      <div className="h-24 bg-sonics-green/20 rounded-lg" />
                      <div className="col-span-2 h-20 bg-sonics-green/20 rounded-lg" />
                    </div>
                  </div>
                  <div className="flex-1 h-56 bg-sonics-green/20 rounded-lg" />
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
            <svg className="w-20 h-20 mx-auto text-sonics-gold/70" viewBox="0 0 24 24" fill="none" stroke="currentColor">
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
            className="text-3xl md:text-4xl font-bold text-sonics-gold"
            style={{ fontFamily: 'var(--font-family-display)' }}
          >
            {isNotFound ? 'BOOK NOT FOUND' : 'TECHNICAL FOUL'}
          </h1>

          <p className="text-gray-400 mt-4">
            {isNotFound
              ? "This book doesn't seem to be in our roster. It may have been removed or the link might be incorrect."
              : error}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            <Link
              to="/"
              className="px-6 py-3 bg-sonics-gold text-sonics-dark font-semibold rounded-lg hover:bg-sonics-gold/90 transition-colors focus:outline-none focus:ring-2 focus:ring-sonics-gold focus:ring-offset-2 focus:ring-offset-sonics-dark"
            >
              Back to Roster
            </Link>
            {!isNotFound && (
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-3 border border-sonics-green text-sonics-green font-semibold rounded-lg hover:bg-sonics-green/10 transition-colors focus:outline-none focus:ring-2 focus:ring-sonics-green focus:ring-offset-2 focus:ring-offset-sonics-dark"
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
    <div className="min-h-screen">
      <Header />

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Back Button */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sonics-green hover:text-sonics-gold transition-colors mb-8"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Roster
        </Link>

        {/* Book Info Section */}
        <section className="border border-sonics-green/30 rounded-xl bg-gradient-to-br from-sonics-green/10 to-transparent p-6 md:p-8">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Book Cover */}
            <div className="flex-shrink-0">
              {book.coverUrl ? (
                <img
                  src={book.coverUrl}
                  alt={book.title}
                  className="w-48 md:w-56 h-auto rounded-lg shadow-xl border border-sonics-green/20 mx-auto md:mx-0"
                />
              ) : (
                <div className="w-48 md:w-56 h-72 md:h-80 bg-sonics-green/20 rounded-lg flex items-center justify-center">
                  <span className="text-sonics-green/50">No Cover</span>
                </div>
              )}
            </div>

            {/* Book Details */}
            <div className="flex-1">
              <h2
                className="text-3xl md:text-4xl font-bold text-white"
                style={{ fontFamily: 'var(--font-family-display)' }}
              >
                {book.title}
              </h2>
              <p className="text-xl text-gray-400 mt-2">by {book.author}</p>

              {/* Series Info */}
              {book.series && (
                <Link
                  to={`/series/${book.seriesId}`}
                  className="mt-4 inline-block bg-sonics-green/20 px-4 py-2 rounded-lg hover:bg-sonics-green/30 transition-colors"
                >
                  <span className="text-sonics-green font-medium">
                    {book.series.name}
                  </span>
                  <span className="text-gray-400 ml-2">
                    Book {book.seriesPosition} of {book.series.totalBooks}
                  </span>
                  <span className="text-sonics-gold ml-2">→</span>
                </Link>
              )}

              {/* Rating & Date */}
              <div className="mt-6 flex flex-wrap items-center gap-6">
                <div>
                  <div className="text-sm text-gray-500 uppercase tracking-wider mb-1">Rating</div>
                  <RatingBackboards rating={book.rating} />
                </div>
                {book.dateFinished && (
                  <div>
                    <div className="text-sm text-gray-500 uppercase tracking-wider mb-1">Finished</div>
                    <div className="text-white">{formatDate(book.dateFinished)}</div>
                  </div>
                )}
              </div>

              {/* Purchase Link */}
              {book.purchaseUrl && (
                <a
                  href={book.purchaseUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 mt-6 bg-sonics-gold text-sonics-dark font-semibold px-6 py-3 rounded-lg hover:bg-sonics-gold/90 transition-colors"
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
              className="text-2xl font-bold text-sonics-green mb-6 uppercase tracking-wider"
              style={{ fontFamily: 'var(--font-family-display)' }}
            >
              The Player Comp
            </h3>

            <div className="border border-sonics-green/30 rounded-xl overflow-hidden">
              {/* Comp Header */}
              <div className="bg-sonics-green/20 p-6 text-center">
                <div
                  className="text-3xl md:text-4xl text-sonics-gold font-bold"
                  style={{ fontFamily: 'var(--font-family-display)' }}
                >
                  {mainCharacter.name} <span className="text-white">is</span> {player.name}
                </div>
                {mainCharacter.tagline && (
                  <p className="text-xl text-gray-300 mt-3 italic">"{mainCharacter.tagline}"</p>
                )}
              </div>

              {/* Player Info */}
              <div className="p-6">
                <div className="flex flex-col md:flex-row gap-8">
                  {/* Player Stats */}
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold text-white mb-4">Player Profile</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-sonics-dark border border-sonics-green/20 rounded-lg p-4">
                        <div className="text-sm text-gray-500 uppercase tracking-wider">Number</div>
                        <div
                          className="text-3xl font-bold text-sonics-gold mt-1"
                          style={{ fontFamily: 'var(--font-family-display)' }}
                        >
                          #{player.number || '—'}
                        </div>
                      </div>
                      <div className="bg-sonics-dark border border-sonics-green/20 rounded-lg p-4">
                        <div className="text-sm text-gray-500 uppercase tracking-wider">Position</div>
                        <div
                          className="text-3xl font-bold text-sonics-gold mt-1"
                          style={{ fontFamily: 'var(--font-family-display)' }}
                        >
                          {player.position || '—'}
                        </div>
                      </div>
                      <div className="col-span-2 bg-sonics-dark border border-sonics-green/20 rounded-lg p-4">
                        <div className="text-sm text-gray-500 uppercase tracking-wider">Team</div>
                        <div className="text-xl font-semibold text-white mt-1">
                          {player.currentTeam || '—'}
                        </div>
                      </div>
                    </div>

                    {/* Character Description */}
                    {mainCharacter.description && (
                      <div className="mt-6">
                        <h4 className="text-lg font-semibold text-white mb-2">Why This Comp?</h4>
                        <p className="text-gray-400 leading-relaxed">{mainCharacter.description}</p>
                      </div>
                    )}
                  </div>

                  {/* Video */}
                  {embedUrl && (
                    <div className="flex-1">
                      <h4 className="text-lg font-semibold text-white mb-4">Highlight Reel</h4>
                      <div className="aspect-video rounded-lg overflow-hidden border border-sonics-green/20">
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
              className="text-xl font-bold text-sonics-green mb-4 uppercase tracking-wider"
              style={{ fontFamily: 'var(--font-family-display)' }}
            >
              More Comps
            </h3>
            <div className="grid gap-4">
              {book.characters.slice(1).map((char) => (
                <div
                  key={char.id}
                  className="border border-sonics-green/20 rounded-lg p-4 bg-sonics-green/5"
                >
                  <div
                    className="text-lg text-sonics-gold font-semibold"
                    style={{ fontFamily: 'var(--font-family-display)' }}
                  >
                    {char.name} <span className="text-gray-500 font-normal">is</span> {char.player?.name || 'TBD'}
                  </div>
                  {char.tagline && (
                    <p className="text-gray-400 mt-1 italic">"{char.tagline}"</p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      <footer className="border-t border-sonics-green/20 py-8 text-center text-gray-500 text-sm mt-12">
        <p>Where fantasy meets the hardwood</p>
      </footer>
    </div>
  )
}
