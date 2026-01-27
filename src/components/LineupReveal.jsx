import { useState, useEffect } from 'react'

// Helper to get position display name
function getPositionLabel(position) {
  if (!position) return 'PLAYER'
  const pos = position.toUpperCase()
  if (pos.includes('PG')) return 'POINT GUARD'
  if (pos.includes('SG')) return 'SHOOTING GUARD'
  if (pos.includes('SF')) return 'SMALL FORWARD'
  if (pos.includes('PF')) return 'POWER FORWARD'
  if (pos.includes('C') || pos === 'CENTER') return 'CENTER'
  if (pos.includes('G')) return 'GUARD'
  if (pos.includes('F')) return 'FORWARD'
  return 'PLAYER'
}

export default function LineupReveal({ lineup, lineupWithStats, onRevealComplete }) {
  const [revealedIndex, setRevealedIndex] = useState(-1)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)

  // Auto-reveal players one by one
  useEffect(() => {
    if (!isAutoPlaying) return
    if (revealedIndex >= lineup.length - 1) {
      onRevealComplete?.()
      return
    }

    const timer = setTimeout(() => {
      setRevealedIndex(prev => prev + 1)
    }, revealedIndex === -1 ? 500 : 2000) // First one faster, then 2s between

    return () => clearTimeout(timer)
  }, [revealedIndex, isAutoPlaying, lineup.length, onRevealComplete])

  const handleSkipToEnd = () => {
    setIsAutoPlaying(false)
    setRevealedIndex(lineup.length - 1)
    onRevealComplete?.()
  }

  const currentPlayer = revealedIndex >= 0 ? lineup[revealedIndex] : null
  const currentStats = lineupWithStats?.[revealedIndex]?.playerStats

  return (
    <div className="relative">
      {/* Skip button */}
      {revealedIndex < lineup.length - 1 && (
        <button
          onClick={handleSkipToEnd}
          className="absolute top-0 right-0 text-sm text-stone-400 hover:text-stone-600 transition-colors"
        >
          Skip to lineup →
        </button>
      )}

      {/* Announcement Area */}
      <div className="min-h-[300px] flex flex-col items-center justify-center py-8">
        {revealedIndex === -1 ? (
          // Pre-reveal state
          <div className="text-center animate-pulse">
            <div
              className="text-2xl md:text-3xl font-bold text-emerald-700"
              style={{ fontFamily: 'var(--font-family-display)' }}
            >
              AND NOW...
            </div>
            <div className="text-stone-500 mt-2">Your starting lineup</div>
          </div>
        ) : currentPlayer ? (
          // Player reveal
          <div
            key={revealedIndex}
            className="text-center w-full max-w-md animate-fade-in"
          >
            {/* Position announcement */}
            <div className="text-emerald-600 text-sm uppercase tracking-[0.3em] mb-2">
              At {getPositionLabel(currentPlayer.player?.position)}
            </div>

            {/* Stats line */}
            {currentStats && (
              <div className="text-stone-500 text-sm mb-4">
                Averaging{' '}
                <span className="text-amber-600 font-semibold">{currentStats.ppg?.toFixed(1)}</span> points,{' '}
                <span className="text-amber-600 font-semibold">{currentStats.rpg?.toFixed(1)}</span> rebounds,{' '}
                <span className="text-amber-600 font-semibold">{currentStats.apg?.toFixed(1)}</span> assists
              </div>
            )}

            {/* Jersey number */}
            <div
              className="text-6xl md:text-7xl font-bold text-amber-400 mb-2"
              style={{ fontFamily: 'var(--font-family-display)' }}
            >
              #{currentPlayer.player?.number || '00'}
            </div>

            {/* Character name - the star */}
            <div
              className="text-3xl md:text-4xl font-bold text-emerald-800 mb-1"
              style={{ fontFamily: 'var(--font-family-display)' }}
            >
              {currentPlayer.character?.name || 'Unknown'}
            </div>

            {/* Player comparison */}
            <div className="text-stone-500">
              playing like <span className="text-emerald-700 font-semibold">{currentPlayer.player?.name}</span>
            </div>

            {/* Book info */}
            <div className="mt-4 text-sm text-stone-400">
              from <span className="italic">{currentPlayer.book?.title}</span>
            </div>

            {/* Tagline */}
            {currentPlayer.character?.tagline && (
              <div className="mt-3 text-stone-500 italic text-sm max-w-sm mx-auto">
                "{currentPlayer.character.tagline}"
              </div>
            )}

            {/* Progress dots */}
            <div className="flex justify-center gap-2 mt-8">
              {lineup.map((_, idx) => (
                <div
                  key={idx}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    idx <= revealedIndex
                      ? 'bg-amber-500 scale-100'
                      : 'bg-stone-300 scale-75'
                  }`}
                />
              ))}
            </div>
          </div>
        ) : null}
      </div>

      {/* Revealed roster list */}
      {revealedIndex >= 0 && (
        <div className="mt-6 border-t border-emerald-200 pt-6">
          <div className="text-xs text-stone-400 uppercase tracking-wider mb-3 text-center">
            Starting Five
          </div>
          <div className="grid grid-cols-5 gap-2">
            {lineup.map((item, idx) => {
              const isRevealed = idx <= revealedIndex
              const isCurrent = idx === revealedIndex
              return (
                <div
                  key={idx}
                  className={`text-center p-2 rounded-lg transition-all duration-500 ${
                    isRevealed
                      ? isCurrent
                        ? 'bg-amber-100 border-2 border-amber-400'
                        : 'bg-emerald-50 border border-emerald-200'
                      : 'bg-stone-100 border border-stone-200'
                  }`}
                >
                  {isRevealed ? (
                    <>
                      <div
                        className="text-lg font-bold text-amber-500"
                        style={{ fontFamily: 'var(--font-family-display)' }}
                      >
                        #{item.player?.number || '00'}
                      </div>
                      <div className="text-xs text-emerald-700 font-medium truncate">
                        {item.character?.name?.split(' ')[0] || '???'}
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="text-lg font-bold text-stone-300">?</div>
                      <div className="text-xs text-stone-400">???</div>
                    </>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
