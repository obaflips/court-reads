// fillAmount: 0 = empty, 0.5 = half, 1 = full
function Backboard({ fillAmount = 0, size = 'md', uniqueId }) {
  const sizes = {
    sm: { width: 14, height: 14 },
    md: { width: 20, height: 20 },
    lg: { width: 28, height: 28 },
  }

  const { width, height } = sizes[size] || sizes.md
  const isFilled = fillAmount > 0
  const isPartial = fillAmount > 0 && fillAmount < 1

  // Calculate fill percentage for gradient (convert to percentage of backboard width)
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
        <linearGradient id={`backboard-fill-${uniqueId}`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset={`${fillPercent}%`} stopColor="#FFC200" />
          <stop offset={`${fillPercent}%`} stopColor="#4b5563" stopOpacity="0.3" />
        </linearGradient>
      </defs>

      {/* Backboard */}
      <rect
        x="2"
        y="4"
        width="20"
        height="12"
        rx="1"
        fill={isPartial ? `url(#backboard-fill-${uniqueId})` : (isFilled ? '#FFC200' : '#4b5563')}
        opacity={isFilled ? 1 : 0.3}
      />

      {/* Rim */}
      <ellipse
        cx="12"
        cy="18"
        rx="4"
        ry="1.5"
        fill="none"
        stroke={isFilled ? '#ff6b35' : '#666'}
        strokeWidth="1.5"
      />

      {/* Net lines */}
      {isFilled && (
        <>
          <line x1="9" y1="19" x2="10" y2="22" stroke="#ccc" strokeWidth="0.5" />
          <line x1="12" y1="19.5" x2="12" y2="23" stroke="#ccc" strokeWidth="0.5" />
          <line x1="15" y1="19" x2="14" y2="22" stroke="#ccc" strokeWidth="0.5" />
        </>
      )}

      {/* Shatter effect for filled */}
      {isFilled && (
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
          <Backboard
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
