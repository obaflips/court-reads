function GoldBackboard({ filled, size = 'md' }) {
  const sizes = {
    sm: { width: 16, height: 16 },
    md: { width: 22, height: 22 },
    lg: { width: 30, height: 30 },
  }

  const { width, height } = sizes[size] || sizes.md

  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 24 24"
      className={`inline-block ${filled ? 'text-amber-400' : 'text-amber-900/50'}`}
    >
      {/* Backboard */}
      <rect
        x="2"
        y="4"
        width="20"
        height="12"
        rx="1"
        fill="currentColor"
        className={filled ? 'drop-shadow-[0_0_3px_rgba(251,191,36,0.5)]' : 'opacity-40'}
      />
      {/* Rim */}
      <ellipse
        cx="12"
        cy="18"
        rx="4"
        ry="1.5"
        fill="none"
        stroke={filled ? '#f59e0b' : '#78350f'}
        strokeWidth="1.5"
      />
      {/* Net lines */}
      {filled && (
        <>
          <line x1="9" y1="19" x2="10" y2="22" stroke="#fcd34d" strokeWidth="0.5" />
          <line x1="12" y1="19.5" x2="12" y2="23" stroke="#fcd34d" strokeWidth="0.5" />
          <line x1="15" y1="19" x2="14" y2="22" stroke="#fcd34d" strokeWidth="0.5" />
        </>
      )}
      {/* Shatter effect for filled */}
      {filled && (
        <>
          <line x1="8" y1="6" x2="5" y2="3" stroke="#fef3c7" strokeWidth="0.5" opacity="0.8" />
          <line x1="16" y1="6" x2="19" y2="3" stroke="#fef3c7" strokeWidth="0.5" opacity="0.8" />
          <line x1="12" y1="5" x2="12" y2="2" stroke="#fef3c7" strokeWidth="0.5" opacity="0.8" />
        </>
      )}
    </svg>
  )
}

export default function GoldRatingBackboards({ rating, size = 'md' }) {
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
        <GoldBackboard key={i} filled={i < filled} size={size} />
      ))}
    </div>
  )
}
