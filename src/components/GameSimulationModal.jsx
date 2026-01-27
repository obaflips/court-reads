import { useState, useEffect } from 'react'

export default function GameSimulationModal({
  isOpen,
  onClose,
  onPlayAgain,
  onBuildNewLineup,
  simulationResult,
  userTeamName,
  isLoading
}) {
  const [showBoxScores, setShowBoxScores] = useState(false)

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setShowBoxScores(false)
    }
  }, [isOpen])

  if (!isOpen) return null

  const {
    userScore,
    hofScore,
    userWon,
    userBoxScore,
    hofBoxScore,
    gameMVP,
    highlights,
  } = simulationResult || {}

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="simulation-modal-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-sonics-dark via-sonics-green/10 to-sonics-dark border-2 border-sonics-green rounded-2xl shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-black/30 text-gray-400 hover:text-white hover:bg-black/50 transition-colors focus:outline-none focus:ring-2 focus:ring-sonics-gold"
          aria-label="Close modal"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {isLoading ? (
          /* Loading Animation */
          <div className="p-8 py-16 flex flex-col items-center justify-center min-h-[400px]">
            {/* Basketball Animation */}
            <div className="relative w-48 h-48 mb-6">
              {/* Hoop/Backboard */}
              <svg className="absolute bottom-0 left-1/2 -translate-x-1/2 w-32 h-24" viewBox="0 0 100 75">
                <rect x="20" y="0" width="60" height="8" fill="#FFC200" rx="1" />
                <ellipse cx="50" cy="20" rx="18" ry="6" fill="none" stroke="#ff6b35" strokeWidth="3" />
                <path d="M32 22 L38 45 M42 24 L44 50 M50 26 L50 55 M58 24 L56 50 M68 22 L62 45"
                      stroke="#ccc" strokeWidth="1.5" opacity="0.7" />
              </svg>

              {/* Basketball - Animated */}
              <div className="absolute animate-bounce-dunk">
                <svg className="w-16 h-16" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="45" fill="#ff6b35" />
                  <path d="M50 5 Q50 50 50 95" stroke="#333" strokeWidth="2" fill="none" />
                  <path d="M5 50 Q50 50 95 50" stroke="#333" strokeWidth="2" fill="none" />
                  <path d="M15 20 Q50 35 85 20" stroke="#333" strokeWidth="2" fill="none" />
                  <path d="M15 80 Q50 65 85 80" stroke="#333" strokeWidth="2" fill="none" />
                </svg>
              </div>

              {/* Player Silhouette - Animated */}
              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-jump">
                <svg className="w-20 h-32" viewBox="0 0 60 100">
                  <circle cx="30" cy="12" r="10" fill="#00653A" />
                  <rect x="22" y="22" width="16" height="25" rx="3" fill="#00653A" />
                  <path d="M22 25 L8 10" stroke="#00653A" strokeWidth="6" strokeLinecap="round" />
                  <path d="M38 25 L52 10" stroke="#00653A" strokeWidth="6" strokeLinecap="round" />
                  <path d="M26 47 L20 75" stroke="#00653A" strokeWidth="6" strokeLinecap="round" />
                  <path d="M34 47 L40 75" stroke="#00653A" strokeWidth="6" strokeLinecap="round" />
                </svg>
              </div>
            </div>

            <div
              className="text-2xl font-bold text-sonics-gold animate-pulse"
              style={{ fontFamily: 'var(--font-family-display)' }}
            >
              SIMULATING GAME...
            </div>
            <p className="text-gray-400 mt-2 text-sm">
              The Hall of Fame awaits your challenge
            </p>
          </div>
        ) : simulationResult ? (
          /* Results State */
          <div className="p-6 md:p-8">
            {/* Final Score Banner */}
            <div className="text-center mb-8">
              <div
                className="text-sm text-sonics-green uppercase tracking-widest mb-2"
              >
                Final Score
              </div>

              <div className="flex items-center justify-center gap-6 md:gap-10">
                {/* User Team */}
                <div className="text-center">
                  <div
                    className="text-4xl md:text-5xl font-bold text-sonics-gold"
                    style={{ fontFamily: 'var(--font-family-display)' }}
                  >
                    {userScore}
                  </div>
                  <div
                    className="text-sm md:text-base text-white mt-1 max-w-[120px] truncate"
                    style={{ fontFamily: 'var(--font-family-display)' }}
                  >
                    {userTeamName}
                  </div>
                </div>

                {/* VS */}
                <div className="text-gray-500 text-lg">vs</div>

                {/* HOF Team */}
                <div className="text-center">
                  <div
                    className="text-4xl md:text-5xl font-bold text-gray-300"
                    style={{ fontFamily: 'var(--font-family-display)' }}
                  >
                    {hofScore}
                  </div>
                  <div
                    className="text-sm md:text-base text-gray-400 mt-1"
                    style={{ fontFamily: 'var(--font-family-display)' }}
                  >
                    HOF Legends
                  </div>
                </div>
              </div>

              {/* Win/Loss Banner */}
              <div
                className={`mt-4 inline-block px-6 py-2 rounded-full text-lg font-bold ${
                  userWon
                    ? 'bg-sonics-gold/20 text-sonics-gold'
                    : 'bg-red-900/30 text-red-400'
                }`}
                style={{ fontFamily: 'var(--font-family-display)' }}
              >
                {userWon ? 'VICTORY!' : 'DEFEAT'}
              </div>
            </div>

            {/* Game MVP Spotlight */}
            {gameMVP && (
              <div className="bg-black/30 rounded-xl p-4 mb-6 border border-sonics-gold/30">
                <div className="text-center">
                  <div className="text-xs text-sonics-gold uppercase tracking-widest mb-1">
                    Game MVP
                  </div>
                  <div
                    className="text-xl md:text-2xl font-bold text-white"
                    style={{ fontFamily: 'var(--font-family-display)' }}
                  >
                    {gameMVP.characterName}
                  </div>
                  <div className="text-sm text-gray-400">
                    ({gameMVP.playerName})
                  </div>
                  <div className="flex justify-center gap-4 mt-2 text-sm">
                    <span className="text-sonics-gold">{gameMVP.points} PTS</span>
                    <span className="text-gray-400">{gameMVP.rebounds} REB</span>
                    <span className="text-gray-400">{gameMVP.assists} AST</span>
                  </div>
                </div>
              </div>
            )}

            {/* Highlight Plays */}
            {highlights && highlights.length > 0 && (
              <div className="mb-6">
                <div
                  className="text-sm text-sonics-green uppercase tracking-widest mb-3"
                >
                  Game Highlights
                </div>
                <div className="space-y-3 max-h-48 overflow-y-auto pr-2">
                  {highlights.map((highlight, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-lg text-sm ${
                        highlight.team === 'user'
                          ? 'bg-sonics-green/10 border-l-4 border-sonics-green'
                          : 'bg-gray-800/50 border-l-4 border-gray-600'
                      }`}
                    >
                      <p className="text-gray-200">{highlight.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Box Scores (Collapsible) */}
            <div className="mb-6">
              <button
                onClick={() => setShowBoxScores(!showBoxScores)}
                className="w-full flex items-center justify-between p-3 bg-black/20 rounded-lg hover:bg-black/30 transition-colors"
              >
                <span
                  className="text-sm text-sonics-green uppercase tracking-widest"
                >
                  Box Scores
                </span>
                <svg
                  className={`w-5 h-5 text-sonics-green transition-transform ${
                    showBoxScores ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {showBoxScores && (
                <div className="mt-4 space-y-4">
                  {/* User Team Box Score */}
                  <div>
                    <div
                      className="text-sm font-semibold text-sonics-gold mb-2"
                      style={{ fontFamily: 'var(--font-family-display)' }}
                    >
                      {userTeamName}
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="text-gray-500 text-xs uppercase">
                            <th className="text-left py-1 px-2">Player</th>
                            <th className="text-center py-1 px-2">PTS</th>
                            <th className="text-center py-1 px-2">REB</th>
                            <th className="text-center py-1 px-2">AST</th>
                          </tr>
                        </thead>
                        <tbody>
                          {userBoxScore?.map((player, index) => (
                            <tr key={index} className="border-t border-gray-800">
                              <td className="py-2 px-2">
                                <span className="text-white">{player.characterName}</span>
                                <span className="text-gray-500 text-xs ml-1">#{player.number}</span>
                              </td>
                              <td className="text-center py-2 px-2 text-sonics-gold font-semibold">{player.points}</td>
                              <td className="text-center py-2 px-2 text-gray-400">{player.rebounds}</td>
                              <td className="text-center py-2 px-2 text-gray-400">{player.assists}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* HOF Team Box Score */}
                  <div>
                    <div
                      className="text-sm font-semibold text-gray-400 mb-2"
                      style={{ fontFamily: 'var(--font-family-display)' }}
                    >
                      Hall of Fame Legends
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="text-gray-500 text-xs uppercase">
                            <th className="text-left py-1 px-2">Player</th>
                            <th className="text-center py-1 px-2">PTS</th>
                            <th className="text-center py-1 px-2">REB</th>
                            <th className="text-center py-1 px-2">AST</th>
                          </tr>
                        </thead>
                        <tbody>
                          {hofBoxScore?.map((player, index) => (
                            <tr key={index} className="border-t border-gray-800">
                              <td className="py-2 px-2">
                                <span className="text-gray-300">{player.characterName}</span>
                                <span className="text-gray-600 text-xs ml-1">#{player.number}</span>
                              </td>
                              <td className="text-center py-2 px-2 text-gray-300 font-semibold">{player.points}</td>
                              <td className="text-center py-2 px-2 text-gray-500">{player.rebounds}</td>
                              <td className="text-center py-2 px-2 text-gray-500">{player.assists}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={onPlayAgain}
                className="flex-1 text-center px-6 py-3 bg-sonics-gold text-sonics-dark font-semibold rounded-lg hover:bg-sonics-gold/90 transition-colors focus:outline-none focus:ring-2 focus:ring-sonics-gold focus:ring-offset-2 focus:ring-offset-sonics-dark"
              >
                Play Again
              </button>
              <button
                onClick={onBuildNewLineup}
                className="flex-1 px-6 py-3 border border-sonics-green text-sonics-green font-semibold rounded-lg hover:bg-sonics-green/10 transition-colors focus:outline-none focus:ring-2 focus:ring-sonics-green focus:ring-offset-2 focus:ring-offset-sonics-dark"
              >
                Build New Lineup
              </button>
            </div>
          </div>
        ) : (
          /* Error/No Results State */
          <div className="p-8 text-center min-h-[300px] flex items-center justify-center">
            <p className="text-gray-400">Unable to simulate game. Please try again.</p>
          </div>
        )}
      </div>
    </div>
  )
}
