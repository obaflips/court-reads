import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getAllData } from '../api/airtable'
import { getPlayerStats } from '../api/nbaStats'
import Header from '../components/Header'
import RatingBackboards from '../components/RatingBackboards'
import LineupReveal from '../components/LineupReveal'
import GameSimulationModal from '../components/GameSimulationModal'
import { generateTeamName } from '../utils/teamNameGenerator'
import { simulateGame, formatTeamStats, calculateTeamStats } from '../utils/gameSimulator'

const MODES = {
  BOOK: 'book',
  PLAYER: 'player',
}

function isGuard(position) {
  if (!position) return false
  const pos = position.toUpperCase()
  return pos.includes('PG') || pos.includes('SG') || pos === 'G' || pos === 'GUARD'
}

function isFrontcourt(position) {
  if (!position) return false
  const pos = position.toUpperCase()
  return pos.includes('SF') || pos.includes('PF') || pos.includes('C') ||
         pos === 'F' || pos === 'FORWARD' || pos === 'CENTER'
}

export default function BuildLineup() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [mode, setMode] = useState(MODES.BOOK)
  const [selections, setSelections] = useState([])
  const [enforcePositions, setEnforcePositions] = useState(false)
  const [lineup, setLineup] = useState(null)
  const [validationError, setValidationError] = useState(null)

  // Enhanced lineup state
  const [teamName, setTeamName] = useState('')
  const [teamStats, setTeamStats] = useState(null)
  const [lineupWithStats, setLineupWithStats] = useState(null)
  const [statsLoading, setStatsLoading] = useState(false)

  // Simulation state
  const [showSimModal, setShowSimModal] = useState(false)
  const [simLoading, setSimLoading] = useState(false)
  const [simResult, setSimResult] = useState(null)
  const [hofLineup, setHofLineup] = useState(null)

  // Reveal state
  const [revealComplete, setRevealComplete] = useState(false)

  useEffect(() => {
    async function fetchData() {
      try {
        const result = await getAllData()
        setData(result)
      } catch (err) {
        console.error('Error fetching data:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  // Get books that have player comps
  const booksWithComps = data?.books?.filter(book =>
    book.characters?.some(char => char.player)
  ) || []

  // Get unique players that have character comps
  const playersWithComps = []
  const seenPlayerIds = new Set()
  data?.books?.forEach(book => {
    book.characters?.forEach(char => {
      if (char.player && !seenPlayerIds.has(char.player.id)) {
        seenPlayerIds.add(char.player.id)
        playersWithComps.push({
          ...char.player,
          character: char,
          book: book,
        })
      }
    })
  })

  const items = mode === MODES.BOOK ? booksWithComps : playersWithComps

  const handleSelect = (id) => {
    setValidationError(null)
    if (selections.includes(id)) {
      setSelections(selections.filter(s => s !== id))
    } else if (selections.length < 5) {
      setSelections([...selections, id])
    }
  }

  const getSelectedItems = () => {
    if (mode === MODES.BOOK) {
      return selections.map(id => booksWithComps.find(b => b.id === id)).filter(Boolean)
    } else {
      return selections.map(id => playersWithComps.find(p => p.id === id)).filter(Boolean)
    }
  }

  const validatePositions = () => {
    if (!enforcePositions) return true

    const selectedItems = getSelectedItems()
    let guards = 0
    let frontcourt = 0

    selectedItems.forEach(item => {
      const position = mode === MODES.BOOK
        ? item.characters?.[0]?.player?.position
        : item.position

      if (isGuard(position)) guards++
      if (isFrontcourt(position)) frontcourt++
    })

    if (guards < 2) {
      setValidationError(`Need at least 2 guards. You have ${guards}.`)
      return false
    }
    if (frontcourt < 2) {
      setValidationError(`Need at least 2 forwards/centers. You have ${frontcourt}.`)
      return false
    }
    return true
  }

  const handleBuildLineup = () => {
    if (!validatePositions()) return

    const selectedItems = getSelectedItems()

    if (mode === MODES.BOOK) {
      // Build lineup from books - show their player comps
      const lineupData = selectedItems.map(book => ({
        book,
        character: book.characters?.[0],
        player: book.characters?.[0]?.player,
      }))
      setLineup(lineupData)
    } else {
      // Build lineup from players - show their book/character matches
      const lineupData = selectedItems.map(playerItem => ({
        book: playerItem.book,
        character: playerItem.character,
        player: playerItem,
      }))
      setLineup(lineupData)
    }
  }

  const handleStartOver = () => {
    setSelections([])
    setLineup(null)
    setValidationError(null)
    setTeamName('')
    setTeamStats(null)
    setLineupWithStats(null)
    setSimResult(null)
    setHofLineup(null)
    setRevealComplete(false)
  }

  // Fetch stats when lineup is built
  useEffect(() => {
    if (!lineup || lineup.length === 0) return

    async function fetchLineupStats() {
      setStatsLoading(true)
      try {
        // Fetch stats for each player in lineup
        const lineupWithPlayerStats = await Promise.all(
          lineup.map(async (item) => {
            const playerName = item.player?.name
            if (playerName) {
              const stats = await getPlayerStats(playerName)
              return { ...item, playerStats: stats }
            }
            return { ...item, playerStats: { ppg: 15, rpg: 5, apg: 3 } }
          })
        )

        setLineupWithStats(lineupWithPlayerStats)

        // Calculate aggregate team stats
        const players = lineupWithPlayerStats.map(item => ({
          stats: item.playerStats
        }))
        const aggregateStats = calculateTeamStats(players)
        setTeamStats(formatTeamStats(aggregateStats))

        // Generate team name
        const generatedName = generateTeamName(lineup)
        setTeamName(generatedName)
      } catch (err) {
        console.error('Error fetching lineup stats:', err)
      } finally {
        setStatsLoading(false)
      }
    }

    fetchLineupStats()
  }, [lineup])

  // Handle challenge button click
  const handleChallengeHOF = async () => {
    setShowSimModal(true)
    setSimLoading(true)
    setSimResult(null)

    try {
      // Get Hall of Fame books (top 5 rated)
      const hofBooks = (data?.books || [])
        .filter(book => book.rating > 0 && book.characters?.some(char => char.player))
        .sort((a, b) => {
          if (b.rating !== a.rating) return b.rating - a.rating
          return new Date(b.dateFinished) - new Date(a.dateFinished)
        })
        .slice(0, 5)

      // Build HOF lineup with stats
      const hofLineupData = await Promise.all(
        hofBooks.map(async (book) => {
          const character = book.characters?.[0]
          const player = character?.player
          const playerName = player?.name
          const stats = playerName
            ? await getPlayerStats(playerName)
            : { ppg: 15, rpg: 5, apg: 3 }
          return {
            book,
            character,
            player,
            playerStats: stats
          }
        })
      )

      setHofLineup(hofLineupData)

      // Run simulation
      const result = simulateGame({
        userLineup: lineupWithStats || lineup,
        hofLineup: hofLineupData,
        userTeamName: teamName
      })

      setSimResult(result)
    } catch (err) {
      console.error('Error running simulation:', err)
    } finally {
      setSimLoading(false)
    }
  }

  const handlePlayAgain = async () => {
    setSimLoading(true)
    setSimResult(null)

    try {
      // Re-run simulation with same lineups
      const result = simulateGame({
        userLineup: lineupWithStats || lineup,
        hofLineup: hofLineup,
        userTeamName: teamName
      })
      setSimResult(result)
    } catch (err) {
      console.error('Error re-running simulation:', err)
    } finally {
      setSimLoading(false)
    }
  }

  const handleBuildNewLineup = () => {
    setShowSimModal(false)
    handleStartOver()
  }

  const handleModeSwitch = (newMode) => {
    setMode(newMode)
    setSelections([])
    setLineup(null)
    setValidationError(null)
  }

  if (loading) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="max-w-6xl mx-auto px-4 py-8">
          {/* Page Title skeleton */}
          <div className="text-center mb-8 animate-pulse">
            <div className="h-10 bg-emerald-200 rounded w-80 mx-auto mb-3" />
            <div className="h-4 bg-emerald-200 rounded w-64 mx-auto" />
          </div>

          {/* Mode Toggle skeleton */}
          <div className="flex justify-center mb-6">
            <div className="h-12 bg-emerald-200 rounded-lg w-64 animate-pulse" />
          </div>

          {/* Position Toggle skeleton */}
          <div className="flex justify-center mb-6">
            <div className="h-8 bg-emerald-200 rounded w-80 animate-pulse" />
          </div>

          {/* Selection Count skeleton */}
          <div className="flex items-center justify-between mb-6 animate-pulse">
            <div className="h-8 bg-emerald-200 rounded w-32" />
            <div className="h-10 bg-emerald-200 rounded w-32" />
          </div>

          {/* Grid skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white border-2 border-emerald-200 rounded-xl p-4 animate-pulse">
                <div className="flex gap-3">
                  <div className="w-16 h-24 bg-emerald-100 rounded" />
                  <div className="flex-1 space-y-2">
                    <div className="h-5 bg-emerald-100 rounded w-3/4" />
                    <div className="h-4 bg-emerald-100 rounded w-1/2" />
                    <div className="h-3 bg-emerald-100 rounded w-16 mt-2" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <div
            className="text-4xl font-bold text-emerald-800"
            style={{ fontFamily: 'var(--font-family-display)' }}
          >
            TECHNICAL FOUL
          </div>
          <p className="text-red-600 mt-4">{error}</p>
          <Link to="/" className="inline-block mt-6 text-emerald-700 hover:text-amber-600 transition-colors">
            ← Back to Home
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <Header />

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Page Title */}
        <div className="text-center mb-8">
          <h2
            className="text-3xl md:text-4xl font-bold text-emerald-800"
            style={{ fontFamily: 'var(--font-family-display)' }}
          >
            BUILD YOUR STARTING 5
          </h2>
          <p className="text-stone-600 mt-2">
            {mode === MODES.BOOK
              ? 'Pick 5 books to reveal your fantasy basketball lineup'
              : 'Pick 5 players to see which books match them'}
          </p>
        </div>

        {!lineup ? (
          <>
            {/* Mode Toggle */}
            <div className="flex justify-center mb-6">
              <div className="inline-flex rounded-lg border-2 border-emerald-600 p-1 bg-white">
                <button
                  onClick={() => handleModeSwitch(MODES.BOOK)}
                  className={`px-6 py-2 rounded-md font-medium transition-all ${
                    mode === MODES.BOOK
                      ? 'bg-emerald-700 text-white'
                      : 'text-emerald-700 hover:bg-emerald-50'
                  }`}
                >
                  Pick by Book
                </button>
                <button
                  onClick={() => handleModeSwitch(MODES.PLAYER)}
                  className={`px-6 py-2 rounded-md font-medium transition-all ${
                    mode === MODES.PLAYER
                      ? 'bg-emerald-700 text-white'
                      : 'text-emerald-700 hover:bg-emerald-50'
                  }`}
                >
                  Pick by Player
                </button>
              </div>
            </div>

            {/* Position Rules Toggle */}
            <div className="flex justify-center mb-6">
              <label className="flex items-center gap-3 cursor-pointer">
                <span className="text-stone-600">Enforce Position Rules</span>
                <div
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    enforcePositions ? 'bg-emerald-600' : 'bg-stone-300'
                  }`}
                  onClick={() => setEnforcePositions(!enforcePositions)}
                >
                  <div
                    className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform shadow ${
                      enforcePositions ? 'translate-x-7' : 'translate-x-1'
                    }`}
                  />
                </div>
                <span className="text-xs text-stone-500">(2+ guards, 2+ forwards/centers)</span>
              </label>
            </div>

            {/* Selection Count & Actions */}
            <div className="flex items-center justify-between mb-6">
              <div
                className="text-2xl font-bold"
                style={{ fontFamily: 'var(--font-family-display)' }}
              >
                <span className={selections.length === 5 ? 'text-amber-600' : 'text-emerald-800'}>
                  {selections.length}
                </span>
                <span className="text-stone-400">/5</span>
                <span className="text-stone-500 text-lg ml-2">Selected</span>
              </div>
              <div className="flex gap-3">
                {selections.length > 0 && (
                  <button
                    onClick={handleStartOver}
                    className="px-4 py-2 text-stone-600 hover:text-stone-800 border border-stone-300 hover:border-stone-400 rounded-lg transition-colors"
                  >
                    Start Over
                  </button>
                )}
                <button
                  onClick={handleBuildLineup}
                  disabled={selections.length !== 5}
                  className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                    selections.length === 5
                      ? 'bg-amber-500 text-white hover:bg-amber-600'
                      : 'bg-stone-200 text-stone-400 cursor-not-allowed'
                  }`}
                >
                  Build Lineup
                </button>
              </div>
            </div>

            {/* Validation Error */}
            {validationError && (
              <div className="mb-6 p-4 bg-red-50 border-2 border-red-400 rounded-lg text-red-600 text-center">
                {validationError}
              </div>
            )}

            {/* Selection Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {items.map(item => {
                const id = item.id
                const isSelected = selections.includes(id)
                const isDisabled = !isSelected && selections.length >= 5

                if (mode === MODES.BOOK) {
                  const book = item
                  const player = book.characters?.[0]?.player
                  return (
                    <button
                      key={id}
                      onClick={() => handleSelect(id)}
                      disabled={isDisabled}
                      className={`p-4 rounded-xl border-2 text-left transition-all ${
                        isSelected
                          ? 'border-amber-500 bg-amber-50'
                          : isDisabled
                          ? 'border-stone-200 bg-stone-100 opacity-50 cursor-not-allowed'
                          : 'border-emerald-200 bg-white hover:border-emerald-400 hover:bg-emerald-50'
                      }`}
                    >
                      <div className="flex gap-3">
                        {book.coverUrl ? (
                          <img
                            src={book.coverUrl}
                            alt={book.title}
                            className="w-16 h-24 object-cover rounded shadow-sm flex-shrink-0"
                          />
                        ) : (
                          <div className="w-16 h-24 bg-emerald-100 rounded flex-shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <div
                            className={`font-semibold truncate ${isSelected ? 'text-amber-700' : 'text-emerald-800'}`}
                            style={{ fontFamily: 'var(--font-family-display)' }}
                          >
                            {book.title}
                          </div>
                          <div className="text-sm text-stone-500 truncate">{book.author}</div>
                          {player && (
                            <div className="mt-2 text-xs text-emerald-700">
                              {player.position && <span className="mr-2">{player.position}</span>}
                              {isGuard(player.position) && (
                                <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded">G</span>
                              )}
                              {isFrontcourt(player.position) && (
                                <span className="px-1.5 py-0.5 bg-orange-100 text-orange-700 rounded">F/C</span>
                              )}
                            </div>
                          )}
                        </div>
                        {isSelected && (
                          <div className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-500 flex items-center justify-center">
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        )}
                      </div>
                    </button>
                  )
                } else {
                  const playerItem = item
                  return (
                    <button
                      key={id}
                      onClick={() => handleSelect(id)}
                      disabled={isDisabled}
                      className={`p-4 rounded-xl border-2 text-left transition-all ${
                        isSelected
                          ? 'border-amber-500 bg-amber-50'
                          : isDisabled
                          ? 'border-stone-200 bg-stone-100 opacity-50 cursor-not-allowed'
                          : 'border-emerald-200 bg-white hover:border-emerald-400 hover:bg-emerald-50'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div
                            className={`text-2xl font-bold ${isSelected ? 'text-amber-600' : 'text-amber-500'}`}
                            style={{ fontFamily: 'var(--font-family-display)' }}
                          >
                            #{playerItem.number || '00'}
                          </div>
                          <div
                            className={`font-semibold mt-1 ${isSelected ? 'text-amber-700' : 'text-emerald-800'}`}
                            style={{ fontFamily: 'var(--font-family-display)' }}
                          >
                            {playerItem.name}
                          </div>
                          <div className="text-sm text-stone-500">{playerItem.currentTeam}</div>
                          <div className="mt-2 text-xs">
                            {playerItem.position && (
                              <span className="text-stone-500 mr-2">{playerItem.position}</span>
                            )}
                            {isGuard(playerItem.position) && (
                              <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded">G</span>
                            )}
                            {isFrontcourt(playerItem.position) && (
                              <span className="px-1.5 py-0.5 bg-orange-100 text-orange-700 rounded">F/C</span>
                            )}
                          </div>
                        </div>
                        {isSelected && (
                          <div className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-500 flex items-center justify-center">
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        )}
                      </div>
                    </button>
                  )
                }
              })}
            </div>
          </>
        ) : (
          /* Enhanced Lineup Results with Reveal */
          <div>
            {/* Team Name */}
            <div className="text-center mb-6">
              <div className="text-sm text-emerald-600 uppercase tracking-widest mb-2">
                Introducing
              </div>
              <h3
                className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-amber-500 to-amber-600 bg-clip-text text-transparent"
                style={{ fontFamily: 'var(--font-family-display)' }}
              >
                {teamName || 'YOUR STARTING 5'}
              </h3>
            </div>

            {/* Lineup Reveal Animation */}
            {!revealComplete ? (
              <div className="bg-white rounded-2xl border-4 border-emerald-600 p-6 shadow-xl mb-8">
                <LineupReveal
                  lineup={lineup}
                  lineupWithStats={lineupWithStats}
                  onRevealComplete={() => setRevealComplete(true)}
                />
              </div>
            ) : (
              <>
                {/* Aggregate Team Stats */}
                {teamStats && !statsLoading && (
                  <div className="bg-emerald-800 rounded-xl p-4 mb-8">
                    <div
                      className="text-center text-white font-bold"
                      style={{ fontFamily: 'var(--font-family-display)' }}
                    >
                      <span className="text-emerald-300 text-sm uppercase tracking-wider">Team Totals:</span>
                      <div className="flex justify-center gap-6 md:gap-10 mt-2 text-lg md:text-xl">
                        <span>
                          <span className="text-amber-400">{teamStats.ppg}</span>
                          <span className="text-emerald-300 text-sm ml-1">PPG</span>
                        </span>
                        <span className="text-emerald-500">|</span>
                        <span>
                          <span className="text-amber-400">{teamStats.rpg}</span>
                          <span className="text-emerald-300 text-sm ml-1">RPG</span>
                        </span>
                        <span className="text-emerald-500">|</span>
                        <span>
                          <span className="text-amber-400">{teamStats.apg}</span>
                          <span className="text-emerald-300 text-sm ml-1">APG</span>
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {statsLoading && (
                  <div className="bg-emerald-800/50 rounded-xl p-4 mb-8 animate-pulse">
                    <div className="h-12 bg-emerald-700/50 rounded" />
                  </div>
                )}

                {/* Lineup Cards */}
                <div className="space-y-4 mb-8">
                  {lineup.map((item, index) => (
                    <div
                      key={index}
                      className="bg-white border-4 border-emerald-600 rounded-xl p-6 shadow-lg"
                    >
                      <div className="flex flex-col md:flex-row gap-6 items-center">
                        {/* Jersey Number */}
                        <div
                          className="text-5xl font-bold text-amber-400 w-20 text-center flex-shrink-0"
                          style={{ fontFamily: 'var(--font-family-display)' }}
                        >
                          #{item.player?.number || '00'}
                        </div>

                        {/* Book Cover */}
                        {item.book?.coverUrl ? (
                          <img
                            src={item.book.coverUrl}
                            alt={item.book.title}
                            className="w-20 h-28 object-cover rounded shadow-lg flex-shrink-0 border border-emerald-200"
                          />
                        ) : (
                          <div className="w-20 h-28 bg-emerald-100 rounded flex-shrink-0" />
                        )}

                        {/* Comp Info */}
                        <div className="flex-1 text-center md:text-left">
                          <div
                            className="text-xl md:text-2xl font-bold text-amber-600"
                            style={{ fontFamily: 'var(--font-family-display)' }}
                          >
                            {item.character?.name || 'Unknown'}
                            <span className="text-emerald-700 mx-2">is</span>
                            {item.player?.name || 'Unknown'}
                          </div>
                          {item.character?.tagline && (
                            <p className="text-stone-500 mt-1 italic">"{item.character.tagline}"</p>
                          )}
                          <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-3">
                            <div className="text-sm text-stone-500">
                              <span className="text-stone-700">{item.book?.title}</span>
                              <span className="mx-1">•</span>
                              {item.book?.author}
                            </div>
                            {item.player?.position && (
                              <span className="text-xs px-2 py-1 bg-emerald-100 text-emerald-700 rounded font-semibold">
                                {item.player.position}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Rating */}
                        <div className="flex-shrink-0">
                          <RatingBackboards rating={item.book?.rating} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  {/* Challenge Button */}
                  <button
                    onClick={handleChallengeHOF}
                    disabled={statsLoading}
                    className="px-8 py-4 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-bold text-lg rounded-xl hover:from-amber-600 hover:to-amber-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    style={{ fontFamily: 'var(--font-family-display)' }}
                  >
                    CHALLENGE THE HALL OF FAME
                  </button>

                  {/* Build Another Button */}
                  <button
                    onClick={handleStartOver}
                    className="px-8 py-4 border-2 border-emerald-600 text-emerald-700 font-semibold rounded-xl hover:bg-emerald-50 transition-colors"
                  >
                    Build Another Lineup
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* Game Simulation Modal */}
        <GameSimulationModal
          isOpen={showSimModal}
          onClose={() => setShowSimModal(false)}
          onPlayAgain={handlePlayAgain}
          onBuildNewLineup={handleBuildNewLineup}
          simulationResult={simResult}
          userTeamName={teamName}
          isLoading={simLoading}
        />
      </main>

      <footer className="border-t border-emerald-200 py-8 text-center text-stone-500 text-sm mt-12">
        <p>Where fantasy meets the hardwood</p>
      </footer>
    </div>
  )
}
