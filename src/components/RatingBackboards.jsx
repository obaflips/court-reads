function Backboard({ filled, size = 'md' }) {
  const sizes = {
    sm: { width: 14, height: 14 },
    md: { width: 20, height: 20 },
    lg: { width: 28, height: 28 },
  }

  const { width, height } = sizes[size] || sizes.md

  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 24 24"
      className={`inline-block ${filled ? 'text-sonics-gold' : 'text-gray-600'}`}
    >
      {/* Backboard */}
      <rect
        x="2"
        y="4"
        width="20"
        height="12"
        rx="1"
        fill="currentColor"
        className={filled ? '' : 'opacity-30'}
      />
      {/* Rim */}
      <ellipse
        cx="12"
        cy="18"
        rx="4"
        ry="1.5"
        fill="none"
        stroke={filled ? '#ff6b35' : '#666'}
        strokeWidth="1.5"
      />
      {/* Net lines */}
      {filled && (
        <>
          <line x1="9" y1="19" x2="10" y2="22" stroke="#ccc" strokeWidth="0.5" />
          <line x1="12" y1="19.5" x2="12" y2="23" stroke="#ccc" strokeWidth="0.5" />
          <line x1="15" y1="19" x2="14" y2="22" stroke="#ccc" strokeWidth="0.5" />
        </>
      )}
      {/* Shatter effect for filled */}
      {filled && (
        <>
          <line x1="8" y1="6" x2="5" y2="3" stroke="#fff" strokeWidth="0.5" opacity="0.6" />
          <line x1="16" y1="6" x2="19" y2="3" stroke="#fff" strokeWidth="0.5" opacity="0.6" />
          <line x1="12" y1="5" x2="12" y2="2" stroke="#fff" strokeWidth="0.5" opacity="0.6" />
        </>
      )}
    </svg>
  )
}

export default function RatingBackboards({ rating, size = 'md' }) {
  const maxRating = 5
  const filled = rating || 0

  const gapClasses = {
    sm: 'gap-0',
    md: 'gap-0.5',
    lg: 'gap-1',
  }

  return (
    <div className={`flex ${gapClasses[size] || gapClasses.md}`}>
      {[...Array(maxRating)].map((_, i) => (
        <Backboard key={i} filled={i < filled} size={size} />
      ))}
    </div>
  )
}
