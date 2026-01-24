export default function Stats({ books, totalComps }) {
  const totalBooks = books.length
  const avgRating = books.length
    ? (books.reduce((sum, b) => sum + (b.rating || 0), 0) / books.length).toFixed(1)
    : '0.0'

  return (
    <div className="grid grid-cols-3 gap-2 sm:gap-4 max-w-2xl mx-auto my-8 px-4">
      <div className="text-center p-3 sm:p-4 border border-sonics-green/30 rounded-lg bg-sonics-green/5">
        <div
          className="text-2xl sm:text-3xl md:text-4xl font-bold text-sonics-gold"
          style={{ fontFamily: 'var(--font-family-display)' }}
        >
          {totalBooks}
        </div>
        <div className="text-xs sm:text-sm text-gray-400 uppercase tracking-wider mt-1">
          Books Read
        </div>
      </div>

      <div className="text-center p-3 sm:p-4 border border-sonics-green/30 rounded-lg bg-sonics-green/5">
        <div
          className="text-2xl sm:text-3xl md:text-4xl font-bold text-sonics-gold"
          style={{ fontFamily: 'var(--font-family-display)' }}
        >
          {totalComps}
        </div>
        <div className="text-xs sm:text-sm text-gray-400 uppercase tracking-wider mt-1">
          Player Comps
        </div>
      </div>

      <div className="text-center p-3 sm:p-4 border border-sonics-green/30 rounded-lg bg-sonics-green/5">
        <div
          className="text-2xl sm:text-3xl md:text-4xl font-bold text-sonics-gold"
          style={{ fontFamily: 'var(--font-family-display)' }}
        >
          {avgRating}
        </div>
        <div className="text-xs sm:text-sm text-gray-400 uppercase tracking-wider mt-1">
          Avg Rating
        </div>
      </div>
    </div>
  )
}
