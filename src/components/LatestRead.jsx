import { Link } from 'react-router-dom'
import RatingBackboards from './RatingBackboards'

export default function LatestRead({ book }) {
  if (!book) return null

  const mainCharacter = book.characters?.[0]
  const player = mainCharacter?.player

  return (
    <section className="max-w-4xl mx-auto my-12 px-4">
      <h2
        className="text-2xl font-bold text-sonics-green mb-6 uppercase tracking-wider"
        style={{ fontFamily: 'var(--font-family-display)' }}
      >
        Latest Read
      </h2>

      <Link
        to={`/book/${book.id}`}
        className="block border border-sonics-green/30 rounded-xl bg-gradient-to-br from-sonics-green/10 to-transparent p-6 hover:border-sonics-green/50 hover:from-sonics-green/15 transition-all group focus:outline-none focus:ring-2 focus:ring-sonics-gold focus:ring-offset-2 focus:ring-offset-sonics-dark"
      >
        <div className="flex flex-col md:flex-row gap-6">
          {/* Book Cover */}
          <div className="flex-shrink-0">
            {book.coverUrl ? (
              <img
                src={book.coverUrl}
                alt={book.title}
                className="w-32 md:w-40 h-auto rounded-lg shadow-lg border border-sonics-green/20 group-hover:shadow-xl transition-shadow"
              />
            ) : (
              <div className="w-32 md:w-40 h-48 md:h-56 bg-sonics-green/20 rounded-lg flex items-center justify-center">
                <span className="text-sonics-green/50 text-sm">No Cover</span>
              </div>
            )}
          </div>

          {/* Book Info */}
          <div className="flex-1">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3
                  className="text-2xl md:text-3xl font-bold text-white group-hover:text-sonics-gold transition-colors"
                  style={{ fontFamily: 'var(--font-family-display)' }}
                >
                  {book.title}
                </h3>
                <p className="text-gray-400 mt-1">by {book.author}</p>
                {book.series && (
                  <Link
                    to={`/series/${book.seriesId}`}
                    className="inline-block text-sonics-green text-sm mt-1 hover:text-sonics-gold transition-colors focus:outline-none focus:ring-2 focus:ring-sonics-green rounded"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {book.series.name} #{book.seriesPosition || '?'} →
                  </Link>
                )}
              </div>
              <div className="flex-shrink-0">
                <RatingBackboards rating={book.rating} />
              </div>
            </div>

            {/* Player Comp */}
            {mainCharacter && player && (
              <div className="mt-6 pt-6 border-t border-sonics-green/20">
                <div className="flex items-center gap-2 text-sm text-gray-500 uppercase tracking-wider mb-2">
                  <span>Player Comp</span>
                </div>
                <div
                  className="text-xl md:text-2xl text-sonics-gold font-semibold"
                  style={{ fontFamily: 'var(--font-family-display)' }}
                >
                  {mainCharacter.name} <span className="text-gray-500">is</span> {player.name}
                </div>
                {mainCharacter.tagline && (
                  <p className="text-gray-400 mt-2 italic">"{mainCharacter.tagline}"</p>
                )}
                {(player.number || player.position || player.currentTeam) && (
                  <p className="text-sm text-gray-500 mt-2">
                    {[
                      player.number && `#${player.number}`,
                      player.position,
                      player.currentTeam
                    ].filter(Boolean).join(' • ')}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </Link>
    </section>
  )
}
