import { Link } from 'react-router-dom'
import RatingBackboards from './RatingBackboards'

// Mobile card view for better responsiveness
function MobileBookCard({ book, index }) {
  const mainCharacter = book.characters?.[0]
  const player = mainCharacter?.player

  return (
    <Link
      to={`/book/${book.id}`}
      className="block border border-sonics-green/30 rounded-xl p-4 hover:border-sonics-green/50 hover:bg-sonics-green/5 transition-all group"
    >
      <div className="flex gap-4">
        {/* Jersey Number + Cover */}
        <div className="flex-shrink-0 flex flex-col items-center gap-2">
          <span
            className="text-xl font-bold text-sonics-gold/70 group-hover:text-sonics-gold transition-colors"
            style={{ fontFamily: 'var(--font-family-display)' }}
          >
            #{String(index + 1).padStart(2, '0')}
          </span>
          {book.coverUrl ? (
            <img
              src={book.coverUrl}
              alt={book.title}
              className="w-16 h-24 object-cover rounded shadow-sm group-hover:shadow-md transition-shadow"
            />
          ) : (
            <div className="w-16 h-24 bg-sonics-green/20 rounded flex items-center justify-center">
              <span className="text-xs text-sonics-green/50">No Cover</span>
            </div>
          )}
        </div>

        {/* Book Info */}
        <div className="flex-1 min-w-0">
          <div
            className="font-semibold text-white group-hover:text-sonics-gold transition-colors truncate"
            style={{ fontFamily: 'var(--font-family-display)' }}
          >
            {book.title}
          </div>
          <div className="text-sm text-gray-400 truncate">{book.author}</div>

          {book.series && (
            <Link
              to={`/series/${book.seriesId}`}
              className="inline-block text-xs text-sonics-green hover:text-sonics-gold mt-1 transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              {book.series.name} #{book.seriesPosition} →
            </Link>
          )}

          <div className="mt-2">
            <RatingBackboards rating={book.rating} size="sm" />
          </div>

          {/* Player Comp */}
          {mainCharacter && player && (
            <div className="mt-2 pt-2 border-t border-sonics-green/20">
              <div
                className="text-sm text-sonics-gold"
                style={{ fontFamily: 'var(--font-family-display)' }}
              >
                {mainCharacter.name} <span className="text-gray-500 font-normal">is</span> {player.name}
              </div>
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}

export default function RosterTable({ books }) {
  if (!books.length) return null

  return (
    <section className="max-w-6xl mx-auto my-12 px-4">
      <h2
        className="text-2xl font-bold text-sonics-green mb-6 uppercase tracking-wider"
        style={{ fontFamily: 'var(--font-family-display)' }}
      >
        The Roster
      </h2>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {books.map((book, index) => (
          <MobileBookCard key={book.id} book={book} index={index} />
        ))}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block border border-sonics-green/30 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-sonics-green/20 text-left">
                <th className="px-4 py-3 text-sonics-gold font-semibold text-sm uppercase tracking-wider w-16">
                  #
                </th>
                <th className="px-4 py-3 text-sonics-gold font-semibold text-sm uppercase tracking-wider w-20">
                  Rating
                </th>
                <th className="px-4 py-3 text-sonics-gold font-semibold text-sm uppercase tracking-wider w-16">
                  Cover
                </th>
                <th className="px-4 py-3 text-sonics-gold font-semibold text-sm uppercase tracking-wider">
                  Book
                </th>
                <th className="px-4 py-3 text-sonics-gold font-semibold text-sm uppercase tracking-wider">
                  Player Comp
                </th>
                <th className="px-4 py-3 text-sonics-gold font-semibold text-sm uppercase tracking-wider hidden lg:table-cell">
                  Tagline
                </th>
              </tr>
            </thead>
            <tbody>
              {books.map((book, index) => {
                const mainCharacter = book.characters?.[0]
                const player = mainCharacter?.player

                return (
                  <tr
                    key={book.id}
                    className="border-t border-sonics-green/10 hover:bg-sonics-green/10 transition-colors cursor-pointer group"
                  >
                    {/* Jersey Number */}
                    <td className="px-4 py-4">
                      <Link to={`/book/${book.id}`} className="block focus:outline-none focus:ring-2 focus:ring-sonics-gold rounded">
                        <span
                          className="text-2xl font-bold text-sonics-gold/70 group-hover:text-sonics-gold transition-colors"
                          style={{ fontFamily: 'var(--font-family-display)' }}
                        >
                          {String(index + 1).padStart(2, '0')}
                        </span>
                      </Link>
                    </td>

                    {/* Rating */}
                    <td className="px-4 py-4">
                      <Link to={`/book/${book.id}`} className="block">
                        <RatingBackboards rating={book.rating} />
                      </Link>
                    </td>

                    {/* Cover */}
                    <td className="px-4 py-4">
                      <Link to={`/book/${book.id}`} className="block">
                        {book.coverUrl ? (
                          <img
                            src={book.coverUrl}
                            alt={book.title}
                            className="w-12 h-16 object-cover rounded shadow-sm group-hover:shadow-md transition-shadow"
                          />
                        ) : (
                          <div className="w-12 h-16 bg-sonics-green/20 rounded flex items-center justify-center">
                            <span className="text-xs text-sonics-green/50">—</span>
                          </div>
                        )}
                      </Link>
                    </td>

                    {/* Title/Author */}
                    <td className="px-4 py-4">
                      <div>
                        <Link to={`/book/${book.id}`} className="block">
                          <div
                            className="font-semibold text-white group-hover:text-sonics-gold transition-colors"
                            style={{ fontFamily: 'var(--font-family-display)' }}
                          >
                            {book.title}
                          </div>
                          <div className="text-sm text-gray-400">
                            {book.author}
                          </div>
                        </Link>
                        {book.series && (
                          <Link
                            to={`/series/${book.seriesId}`}
                            className="inline-block text-xs text-sonics-green hover:text-sonics-gold mt-0.5 transition-colors focus:outline-none focus:ring-2 focus:ring-sonics-green rounded"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {book.series.name} #{book.seriesPosition} →
                          </Link>
                        )}
                      </div>
                    </td>

                    {/* Player Comp */}
                    <td className="px-4 py-4">
                      <Link to={`/book/${book.id}`} className="block">
                        {mainCharacter && player ? (
                          <div
                            className="text-sonics-gold"
                            style={{ fontFamily: 'var(--font-family-display)' }}
                          >
                            {mainCharacter.name} <span className="text-gray-500 font-normal">is</span> {player.name}
                          </div>
                        ) : (
                          <span className="text-gray-500">—</span>
                        )}
                      </Link>
                    </td>

                    {/* Tagline */}
                    <td className="px-4 py-4 hidden lg:table-cell">
                      <Link to={`/book/${book.id}`} className="block">
                        {mainCharacter?.tagline ? (
                          <span className="text-gray-400 italic text-sm line-clamp-2">
                            "{mainCharacter.tagline}"
                          </span>
                        ) : (
                          <span className="text-gray-600">—</span>
                        )}
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}
