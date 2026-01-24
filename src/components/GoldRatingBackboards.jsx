// fillAmount: 0 = empty, 0.5 = half, 1 = full
function GoldBackboard({ fillAmount = 0, size = 'md', uniqueId }) {
  const sizes = {
    sm: { width: 16, height: 16 },
    md: { width: 22, height: 22 },
    lg: { width: 30, height: 30 },
  }

  const { width, height } = sizes[size] || sizes.md
  const isFilled = fillAmount > 0
  const isPartial = fillAmount > 0 && fillAmount < 1

  // Calculate fill percentage for gradient
  const fillPercent = Math.round(fillAmount * 100)

  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 24 24"
      className="inline-block"
    >
      <defs>
        {/* Gradient for partial fill */}
        <linearGradient id={`gold-backboard-fill-${uniqueId}`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset={`${fillPercent}%`} stopColor="#fbbf24" />
          <stop offset={`${fillPercent}%`} stopColor="#78350f" stopOpacity="0.4" />
        </linearGradient>
      </defs>

      {/* Backboard */}
      <rect
        x="2"
        y="4"
        width="20"
        height="12"
        rx="1"
        fill={isPartial ? `url(#gold-backboard-fill-${uniqueId})` : (isFilled ? '#fbbf24' : '#78350f')}
        opacity={isFilled ? 1 : 0.4}
        className={isFilled && !isPartial ? 'drop-shadow-[0_0_3px_rgba(251,191,36,0.5)]' : ''}
      />

      {/* Rim */}
      <ellipse
        cx="12"
        cy="18"
        rx="4"
        ry="1.5"
        fill="none"
        stroke={isFilled ? '#f59e0b' : '#78350f'}
        strokeWidth="1.5"
      />

      {/* Net lines */}
      {isFilled && (
        <>
          <line x1="9" y1="19" x2="10" y2="22" stroke="#fcd34d" strokeWidth="0.5" />
          <line x1="12" y1="19.5" x2="12" y2="23" stroke="#fcd34d" strokeWidth="0.5" />
          <line x1="15" y1="19" x2="14" y2="22" stroke="#fcd34d" strokeWidth="0.5" />
        </>
      )}

      {/* Shatter effect for filled */}
      {isFilled && (
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
  const ratingValue = rating || 0

  const gapClasses = {
    sm: 'gap-0',
    md: 'gap-0.5',
    lg: 'gap-1',
  }

  // Generate unique ID for gradients to avoid conflicts
  const baseId = Math.random().toString(36).substr(2, 9)

  return (
    <div className={`flex ${gapClasses[size] || gapClasses.md}`}>
      {[...Array(maxRating)].map((_, i) => {
        // Calculate how much this backboard should be filled
        let fillAmount = 0
        if (i < Math.floor(ratingValue)) {
          fillAmount = 1 // Fully filled
        } else if (i < ratingValue) {
          fillAmount = ratingValue - i // Partial fill (e.g., 0.5 for half)
        }

        return (
          <GoldBackboard
            key={i}
            fillAmount={fillAmount}
            size={size}
            uniqueId={`${baseId}-${i}`}
          />
        )
      })}
    </div>
  )
}
