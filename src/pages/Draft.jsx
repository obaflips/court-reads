import { useState, useEffect, useCallback, useRef } from 'react'
import { Link } from 'react-router-dom'
import { getAllData } from '../api/airtable'
import { getPlayerStats } from '../api/nbaStats'
import Header from '../components/Header'
import RatingBackboards from '../components/RatingBackboards'
import GameSimulationModal from '../components/GameSimulationModal'
import {
  AI_PERSONALITIES,
  generateSnakeDraftOrder,
  getAIPick,
  getRecommendedPick,
  isValidPick,
} from '../utils/draftAI'
import { simulateGame } from '../utils/gameSimulator'
import { generateTeamName } from '../utils/teamNameGenerator'

// Draft phases
const PHASES = {
  SETUP: 'setup',
  DRAFTING: 'drafting',
  COMPLETE: 'complete',
}

// Position display helpers
function getPositionLabel(position) {
  if (!position) return 'FLEX'
  const pos = position.toUpperCase()
  if (pos.includes('PG')) return 'PG'
  if (pos.includes('SG')) return 'SG'
  if (pos.includes('SF')) return 'SF'
  if (pos.includes('PF')) return 'PF'
  if (pos.includes('C') || pos === 'CENTER') return 'C'
  if (pos.includes('G')) return 'G'
  if (pos.includes('F')) return 'F'
  return 'FLEX'
}

function getPositionColor(position) {
  const pos = getPositionLabel(position)
  if (pos === 'PG' || pos === 'SG' || pos === 'G') return 'bg-blue-100 text-blue-700'
  if (pos === 'SF' || pos === 'PF' || pos === 'F') return 'bg-orange-100 text-orange-700'
  if (pos === 'C') return 'bg-purple-100 text-purple-700'
  return 'bg-stone-100 text-stone-700'
}

export default function Draft() {
  // Data state
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Draft configuration (fixed at 5 rounds, 3 participants)
  const numRounds = 5
  const [selectedAIs, setSelectedAIs] = useState([
    AI_PERSONALITIES.ANALYTICS_NERD,
    AI_PERSONALITIES.STORYTELLER,
  ])
  const [userDraftPosition, setUserDraftPosition] = useState(0) // 0 = first pick
  const [aiCountdown, setAiCountdown] = useState(0) // Countdown timer for AI picks

  // Draft state
  const [phase, setPhase] = useState(PHASES.SETUP)
  const [draftOrder, setDraftOrder] = useState([])
  const [currentPickIndex, setCurrentPickIndex] = useState(0)
  const [availableCharacters, setAvailableCharacters] = useState([])
  const [rosters, setRosters] = useState({}) // { teamIndex: [characters] }
  const [draftHistory, setDraftHistory] = useState([])
  const [isAIPicking, setIsAIPicking] = useState(false)
  const [lastPick, setLastPick] = useState(null)

  // UI state
  const [filterPosition, setFilterPosition] = useState('ALL')
  const [filterSeries, setFilterSeries] = useState('ALL')
  const [searchQuery, setSearchQuery] = useState('')
  const [autoPick, setAutoPick] = useState(false)

  // Ref to track which pick index we're processing (prevents re-triggering)
  const processingPickIndex = useRef(-1)

  // Simulation state
  const [showSimModal, setShowSimModal] = useState(false)
  const [simLoading, setSimLoading] = useState(false)
  const [simResult, setSimResult] = useState(null)
  const [hofLineup, setHofLineup] = useState(null)
  const [teamName, setTeamName] = useState('')

  // Fetch data on mount
  useEffect(() => {
    async function fetchData() {
      try {
        const result = await getAllData()
        setData(result)

        // Build character pool with enriched data
        const characterPool = []
        for (const book of result.books) {
          for (const character of book.characters || []) {
            if (character.player) {
              // Fetch stats for the player
              const stats = await getPlayerStats(character.player.name)
              characterPool.push({
                ...character,
                bookTitle: book.title,
                bookRating: book.rating,
                seriesName: book.series?.name,
                player: {
                  ...character.player,
                  stats,
                },
              })
            }
          }
        }
        setAvailableCharacters(characterPool)
      } catch (err) {
        console.error('Error fetching data:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  // Get all unique series for filter
  const allSeries = [...new Set(availableCharacters.map(c => c.seriesName).filter(Boolean))]

  // Filter available characters
  const filteredCharacters = availableCharacters.filter(char => {
    if (filterPosition !== 'ALL' && getPositionLabel(char.player?.position) !== filterPosition) {
      return false
    }
    if (filterSeries !== 'ALL' && char.seriesName !== filterSeries) {
      return false
    }
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      return (
        char.name?.toLowerCase().includes(query) ||
        char.bookTitle?.toLowerCase().includes(query) ||
        char.player?.name?.toLowerCase().includes(query)
      )
    }
    return true
  })

  // Get teams (user + AIs)
  const teams = [
    { index: userDraftPosition, name: 'Your Team', isUser: true, emoji: '👤' },
    ...selectedAIs.map((ai, i) => {
      const index = i < userDraftPosition ? i : i + 1
      return { index, name: ai.name, isUser: false, personality: ai, emoji: ai.emoji }
    }),
  ].sort((a, b) => a.index - b.index)

  // Current pick info
  const currentPick = draftOrder[currentPickIndex]
  const currentTeam = currentPick ? teams.find(t => t.index === currentPick.teamIndex) : null
  const isUserPick = currentTeam?.isUser

  // Start the draft
  const startDraft = () => {
    const numTeams = selectedAIs.length + 1
    const order = generateSnakeDraftOrder(numTeams, numRounds)
    setDraftOrder(order)
    setCurrentPickIndex(0)
    setRosters(Object.fromEntries(teams.map(t => [t.index, []])))
    setDraftHistory([])
    setPhase(PHASES.DRAFTING)
  }

  // Make a pick
  const makePick = useCallback((character, teamIndex) => {
    // Remove from available
    setAvailableCharacters(prev => prev.filter(c => c.id !== character.id))

    // Add to roster
    setRosters(prev => ({
      ...prev,
      [teamIndex]: [...(prev[teamIndex] || []), character],
    }))

    // Record in history
    const pickInfo = {
      ...draftOrder[currentPickIndex],
      character,
      team: teams.find(t => t.index === teamIndex),
    }
    setDraftHistory(prev => [...prev, pickInfo])
    setLastPick(pickInfo)

    // Advance to next pick
    if (currentPickIndex + 1 >= draftOrder.length) {
      setPhase(PHASES.COMPLETE)
    } else {
      setCurrentPickIndex(prev => prev + 1)
    }
  }, [currentPickIndex, draftOrder, teams])

  // Handle user pick
  const handleUserPick = (character) => {
    if (!isUserPick || isAIPicking) return
    if (!isValidPick(character, rosters[userDraftPosition] || [], numRounds)) {
      return // Invalid pick
    }
    makePick(character, userDraftPosition)
  }

  // Handle AI picks with 5-second countdown
  useEffect(() => {
    // Early exits
    if (phase !== PHASES.DRAFTING) return
    if (isUserPick && !autoPick) return

    // Check if we're already processing this pick
    if (processingPickIndex.current === currentPickIndex) return
    processingPickIndex.current = currentPickIndex

    setIsAIPicking(true)

    // Capture current state for use in callbacks
    const pickIdx = currentPickIndex
    const teamIndex = draftOrder[pickIdx]?.teamIndex
    const team = teams.find(t => t.index === teamIndex)
    const isAutoPickForUser = isUserPick && autoPick

    if (isAutoPickForUser) {
      // Auto-pick for user - quick
      const timer = setTimeout(() => {
        if (processingPickIndex.current !== pickIdx) return // Stale
        const pick = getRecommendedPick(availableCharacters, rosters[userDraftPosition] || [])
        if (pick) {
          makePick(pick, userDraftPosition)
        }
        setIsAIPicking(false)
        setAiCountdown(0)
      }, 500)
      return () => clearTimeout(timer)
    }

    // AI pick with 5-second countdown
    setAiCountdown(5)
    let countdownValue = 5

    const countdownInterval = setInterval(() => {
      if (processingPickIndex.current !== pickIdx) {
        clearInterval(countdownInterval)
        return
      }
      countdownValue -= 1
      setAiCountdown(countdownValue)
      if (countdownValue <= 0) {
        clearInterval(countdownInterval)
      }
    }, 1000)

    const pickTimer = setTimeout(() => {
      if (processingPickIndex.current !== pickIdx) return // Stale
      const aiPersonality = team?.personality
      const aiRoster = rosters[teamIndex] || []
      const pick = getAIPick(aiPersonality, availableCharacters, aiRoster)

      if (pick && team) {
        makePick(pick, teamIndex)
      }
      setIsAIPicking(false)
      setAiCountdown(0)
    }, 5000)

    return () => {
      clearInterval(countdownInterval)
      clearTimeout(pickTimer)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, currentPickIndex])

  // Generate team name when draft completes
  useEffect(() => {
    if (phase === PHASES.COMPLETE && rosters[userDraftPosition]?.length > 0) {
      const userRoster = rosters[userDraftPosition]
      const lineupForName = userRoster.map(char => ({ book: { title: char.bookTitle } }))
      setTeamName(generateTeamName(lineupForName))
    }
  }, [phase, rosters, userDraftPosition])

  // Handle challenge HOF button
  const handleChallengeHOF = async () => {
    setShowSimModal(true)
    setSimLoading(true)
    setSimResult(null)

    try {
      // Get Hall of Fame books (top 5 rated with player comps)
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

      // Build user lineup from drafted roster
      const userRoster = rosters[userDraftPosition] || []
      const userLineup = userRoster.map(char => ({
        book: { title: char.bookTitle, rating: char.bookRating },
        character: { name: char.name, tagline: char.tagline },
        player: char.player,
        playerStats: char.player?.stats || { ppg: 15, rpg: 5, apg: 3 }
      }))

      // Run simulation
      const result = simulateGame({
        userLineup,
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
      const userRoster = rosters[userDraftPosition] || []
      const userLineup = userRoster.map(char => ({
        book: { title: char.bookTitle, rating: char.bookRating },
        character: { name: char.name, tagline: char.tagline },
        player: char.player,
        playerStats: char.player?.stats || { ppg: 15, rpg: 5, apg: 3 }
      }))

      const result = simulateGame({
        userLineup,
        hofLineup,
        userTeamName: teamName
      })
      setSimResult(result)
    } catch (err) {
      console.error('Error re-running simulation:', err)
    } finally {
      setSimLoading(false)
    }
  }

  // Reset draft
  const resetDraft = () => {
    setPhase(PHASES.SETUP)
    setDraftOrder([])
    setCurrentPickIndex(0)
    setRosters({})
    setDraftHistory([])
    setLastPick(null)
    setAutoPick(false)
    setShowSimModal(false)
    setSimResult(null)
    setHofLineup(null)
    setTeamName('')
    processingPickIndex.current = -1
    // Reload characters
    if (data) {
      const characterPool = []
      for (const book of data.books) {
        for (const character of book.characters || []) {
          if (character.player) {
            characterPool.push({
              ...character,
              bookTitle: book.title,
              bookRating: book.rating,
              seriesName: book.series?.name,
              player: character.player,
            })
          }
        }
      }
      setAvailableCharacters(characterPool)
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center">
            <div
              className="text-3xl font-bold text-emerald-800 mb-4"
              style={{ fontFamily: 'var(--font-family-display)' }}
            >
              FANTASY DRAFT
            </div>
            <p className="text-stone-600 mb-6">Loading characters...</p>
            <div className="animate-pulse space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-24 bg-emerald-100 rounded-xl" />
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div
            className="text-4xl font-bold text-emerald-800"
            style={{ fontFamily: 'var(--font-family-display)' }}
          >
            TECHNICAL FOUL
          </div>
          <p className="text-red-600 mt-4">{error}</p>
          <Link to="/" className="inline-block mt-6 text-emerald-700 hover:text-amber-600">
            ← Back to Home
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen hardwood-bg court-lines">
      <Header />

      <main className="relative z-10 max-w-7xl mx-auto px-4 py-8">
        {/* Page Title */}
        <div className="text-center mb-8">
          <h2
            className="text-3xl md:text-4xl font-bold text-emerald-800"
            style={{ fontFamily: 'var(--font-family-display)' }}
          >
            FANTASY DRAFT
          </h2>
          <p className="text-stone-600 mt-2">
            {phase === PHASES.SETUP && 'Draft 5 characters against AI opponents'}
            {phase === PHASES.DRAFTING && `Round ${currentPick?.round || 1} • Pick ${currentPick?.pick || 1}`}
            {phase === PHASES.COMPLETE && 'Draft complete! Review your roster'}
          </p>
        </div>

        {/* SETUP PHASE */}
        {phase === PHASES.SETUP && (
          <div className="max-w-2xl mx-auto">
            {/* Draft Settings */}
            <div className="bg-white rounded-xl border-4 border-emerald-700 p-6 mb-6">
              <h3
                className="text-xl font-bold text-emerald-800 mb-4"
                style={{ fontFamily: 'var(--font-family-display)' }}
              >
                Draft Settings
              </h3>

              {/* Draft Position */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-stone-700 mb-2">
                  Your Draft Position
                </label>
                <div className="flex gap-2 flex-wrap">
                  {[0, 1, 2].map(n => (
                    <button
                      key={n}
                      onClick={() => setUserDraftPosition(n)}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        userDraftPosition === n
                          ? 'bg-amber-500 text-white'
                          : 'bg-stone-100 text-stone-700 hover:bg-amber-50'
                      }`}
                    >
                      #{n + 1}
                    </button>
                  ))}
                </div>
              </div>

              {/* AI Opponents */}
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">
                  AI Opponents (select 2)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {Object.values(AI_PERSONALITIES).map(ai => {
                    const isSelected = selectedAIs.some(a => a.id === ai.id)
                    return (
                      <button
                        key={ai.id}
                        onClick={() => {
                          if (isSelected) {
                            if (selectedAIs.length > 1) {
                              setSelectedAIs(selectedAIs.filter(a => a.id !== ai.id))
                            }
                          } else if (selectedAIs.length < 2) {
                            setSelectedAIs([...selectedAIs, ai])
                          }
                        }}
                        disabled={!isSelected && selectedAIs.length >= 2}
                        className={`p-3 rounded-lg text-left transition-all ${
                          isSelected
                            ? 'bg-emerald-100 border-2 border-emerald-500'
                            : selectedAIs.length >= 2
                            ? 'bg-stone-50 border-2 border-stone-200 opacity-50 cursor-not-allowed'
                            : 'bg-stone-50 border-2 border-stone-200 hover:border-emerald-300'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{ai.emoji}</span>
                          <span className="font-semibold text-stone-800">{ai.name}</span>
                        </div>
                        <p className="text-xs text-stone-500 mt-1">{ai.description}</p>
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Character Pool Info */}
            <div className="bg-emerald-50 rounded-xl p-4 mb-6 text-center">
              <span className="text-emerald-700">
                <strong>{availableCharacters.length}</strong> characters available in draft pool
              </span>
            </div>

            {/* Start Button */}
            <button
              onClick={startDraft}
              disabled={availableCharacters.length < numRounds * (selectedAIs.length + 1)}
              className="w-full py-4 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-bold text-xl rounded-xl hover:from-amber-600 hover:to-amber-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ fontFamily: 'var(--font-family-display)' }}
            >
              START DRAFT
            </button>
          </div>
        )}

        {/* DRAFTING PHASE */}
        {phase === PHASES.DRAFTING && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Left Column - Draft Order & Rosters */}
            <div className="lg:col-span-1 space-y-4">
              {/* Current Pick Banner */}
              <div
                className={`rounded-xl p-4 text-center ${
                  isUserPick ? 'bg-amber-100 border-2 border-amber-500' : 'bg-stone-100 border-2 border-stone-300'
                }`}
              >
                <div className="text-xs uppercase tracking-wider text-stone-500 mb-1">
                  On the Clock
                </div>
                <div className="flex items-center justify-center gap-2">
                  <span className="text-2xl">{currentTeam?.emoji}</span>
                  <span
                    className={`text-lg font-bold ${isUserPick ? 'text-amber-700' : 'text-stone-700'}`}
                    style={{ fontFamily: 'var(--font-family-display)' }}
                  >
                    {currentTeam?.name}
                  </span>
                </div>
                {isAIPicking && !isUserPick && (
                  <div className="mt-2">
                    <div
                      className="text-3xl font-bold text-amber-500"
                      style={{ fontFamily: 'var(--font-family-display)' }}
                    >
                      {aiCountdown}
                    </div>
                    <div className="text-xs text-stone-500">seconds</div>
                  </div>
                )}
                {isUserPick && !autoPick && (
                  <div className="mt-2 text-sm text-amber-600 font-medium">
                    Make your pick!
                  </div>
                )}
              </div>

              {/* Last Pick */}
              {lastPick && (
                <div className="bg-white rounded-xl border border-emerald-200 p-3">
                  <div className="text-xs uppercase tracking-wider text-stone-400 mb-1">
                    Last Pick
                  </div>
                  <div className="flex items-center gap-2">
                    <span>{lastPick.team?.emoji}</span>
                    <div>
                      <div className="font-semibold text-emerald-800 text-sm">
                        {lastPick.character?.name}
                      </div>
                      <div className="text-xs text-stone-500">
                        {lastPick.character?.player?.name}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Auto-Pick Toggle */}
              <div className="bg-white rounded-xl border border-stone-200 p-3">
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-sm text-stone-700">Auto-pick for me</span>
                  <div
                    className={`relative w-10 h-5 rounded-full transition-colors ${
                      autoPick ? 'bg-emerald-600' : 'bg-stone-300'
                    }`}
                    onClick={() => setAutoPick(!autoPick)}
                  >
                    <div
                      className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform shadow ${
                        autoPick ? 'translate-x-5' : 'translate-x-0.5'
                      }`}
                    />
                  </div>
                </label>
              </div>

              {/* Your Roster */}
              <div className="bg-white rounded-xl border-2 border-amber-300 p-4">
                <div
                  className="text-sm font-bold text-amber-700 mb-3"
                  style={{ fontFamily: 'var(--font-family-display)' }}
                >
                  YOUR ROSTER ({(rosters[userDraftPosition] || []).length}/{numRounds})
                </div>
                <div className="space-y-2">
                  {(rosters[userDraftPosition] || []).map((char, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      <span className={`px-1.5 py-0.5 rounded text-xs font-medium flex-shrink-0 ${getPositionColor(char.player?.position)}`}>
                        {getPositionLabel(char.player?.position)}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-stone-800 truncate">{char.name}</div>
                        <div className="text-xs text-stone-500 truncate">
                          {char.player?.name}
                          {char.player?.stats?.per && (
                            <span className="text-amber-600 ml-1 font-mono">{char.player.stats.per.toFixed(1)} PER</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  {(rosters[userDraftPosition] || []).length === 0 && (
                    <div className="text-stone-400 text-sm italic">No picks yet</div>
                  )}
                </div>
              </div>

              {/* Other Teams */}
              {teams.filter(t => !t.isUser).map(team => (
                <div key={team.index} className="bg-white rounded-xl border border-stone-200 p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <span>{team.emoji}</span>
                    <span className="text-sm font-semibold text-stone-700">{team.name}</span>
                    <span className="text-xs text-stone-400 ml-auto">
                      {(rosters[team.index] || []).length}/{numRounds}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {(rosters[team.index] || []).map((char, i) => (
                      <span
                        key={i}
                        className={`px-1.5 py-0.5 rounded text-xs font-medium ${getPositionColor(char.player?.position)}`}
                        title={char.name}
                      >
                        {getPositionLabel(char.player?.position)}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Right Column - Available Characters */}
            <div className="lg:col-span-3">
              {/* Filters */}
              <div className="bg-white rounded-xl border border-stone-200 p-4 mb-4">
                <div className="flex flex-wrap gap-4 items-center">
                  {/* Search */}
                  <div className="flex-1 min-w-[200px]">
                    <input
                      type="text"
                      placeholder="Search characters, books, players..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  {/* Position Filter */}
                  <select
                    value={filterPosition}
                    onChange={(e) => setFilterPosition(e.target.value)}
                    className="px-3 py-2 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="ALL">All Positions</option>
                    <option value="PG">Point Guard</option>
                    <option value="SG">Shooting Guard</option>
                    <option value="SF">Small Forward</option>
                    <option value="PF">Power Forward</option>
                    <option value="C">Center</option>
                  </select>

                  {/* Series Filter */}
                  <select
                    value={filterSeries}
                    onChange={(e) => setFilterSeries(e.target.value)}
                    className="px-3 py-2 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="ALL">All Series</option>
                    {allSeries.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Character Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                {filteredCharacters.map(char => {
                  const canPick = isUserPick && !isAIPicking && isValidPick(char, rosters[userDraftPosition] || [], numRounds)
                  return (
                    <button
                      key={char.id}
                      onClick={() => canPick && handleUserPick(char)}
                      disabled={!canPick}
                      className={`p-4 rounded-xl border-2 text-left transition-all ${
                        canPick
                          ? 'border-emerald-300 bg-white hover:border-amber-400 hover:bg-amber-50 cursor-pointer'
                          : 'border-stone-200 bg-stone-50 opacity-60 cursor-not-allowed'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {/* Jersey Number */}
                        <div
                          className="text-2xl font-bold text-amber-500 w-10 flex-shrink-0"
                          style={{ fontFamily: 'var(--font-family-display)' }}
                        >
                          #{char.player?.number || '00'}
                        </div>

                        <div className="flex-1 min-w-0">
                          {/* Character Name */}
                          <div
                            className="font-bold text-emerald-800 truncate"
                            style={{ fontFamily: 'var(--font-family-display)' }}
                          >
                            {char.name}
                          </div>

                          {/* Book & Series */}
                          <div className="text-xs text-stone-500 truncate mt-1">
                            {char.bookTitle}
                            {char.seriesName && ` • ${char.seriesName}`}
                          </div>

                          {/* Position & Rating */}
                          <div className="flex items-center gap-2 mt-2">
                            <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${getPositionColor(char.player?.position)}`}>
                              {getPositionLabel(char.player?.position)}
                            </span>
                            <div className="ml-auto">
                              <RatingBackboards rating={char.bookRating} size="sm" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>

              {filteredCharacters.length === 0 && (
                <div className="text-center py-12 text-stone-500">
                  No characters match your filters
                </div>
              )}
            </div>
          </div>
        )}

        {/* COMPLETE PHASE */}
        {phase === PHASES.COMPLETE && (
          <div className="max-w-4xl mx-auto">
            {/* Victory Banner */}
            <div className="bg-gradient-to-r from-emerald-700 to-emerald-800 rounded-2xl p-8 mb-8 text-center text-white">
              <div className="text-emerald-300 text-sm uppercase tracking-widest mb-2">
                Introducing
              </div>
              <div
                className="text-3xl md:text-4xl font-bold mb-2 text-amber-400"
                style={{ fontFamily: 'var(--font-family-display)' }}
              >
                {teamName || 'YOUR TEAM'}
              </div>
              <p className="text-emerald-200 mb-6">
                {numRounds} characters drafted and ready to compete
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={handleChallengeHOF}
                  className="px-10 py-5 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-bold text-xl rounded-xl hover:from-amber-600 hover:to-amber-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 animate-pulse-subtle"
                  style={{ fontFamily: 'var(--font-family-display)' }}
                >
                  CHALLENGE THE HALL OF FAME
                </button>
                <button
                  onClick={resetDraft}
                  className="px-8 py-4 border-2 border-emerald-400/50 text-emerald-200 font-semibold rounded-xl hover:bg-emerald-700/50 transition-colors"
                >
                  Start New Draft
                </button>
              </div>
            </div>

            {/* Your Roster */}
            <div className="bg-white rounded-xl border-4 border-amber-400 p-6 mb-8">
              <h3
                className="text-2xl font-bold text-amber-600 mb-4 text-center"
                style={{ fontFamily: 'var(--font-family-display)' }}
              >
                YOUR ROSTER
              </h3>

              <div className="space-y-3">
                {(rosters[userDraftPosition] || []).map((char, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-4 p-3 bg-amber-50 rounded-lg"
                  >
                    <div
                      className="text-3xl font-bold text-amber-400 w-16 text-center"
                      style={{ fontFamily: 'var(--font-family-display)' }}
                    >
                      #{char.player?.number || '00'}
                    </div>
                    <div className="flex-1">
                      <div
                        className="font-bold text-emerald-800"
                        style={{ fontFamily: 'var(--font-family-display)' }}
                      >
                        {char.name}
                        <span className="text-stone-400 font-normal mx-2">is</span>
                        {char.player?.name}
                      </div>
                      <div className="text-sm text-stone-500">
                        {char.bookTitle}
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded text-sm font-medium ${getPositionColor(char.player?.position)}`}>
                      {getPositionLabel(char.player?.position)}
                    </span>
                    <RatingBackboards rating={char.bookRating} size="sm" />
                  </div>
                ))}
              </div>

              {/* Team Stats */}
              <div className="mt-6 pt-6 border-t border-amber-200">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-amber-600">
                      {((rosters[userDraftPosition] || []).reduce((sum, c) => sum + (c.player?.stats?.ppg || 0), 0)).toFixed(1)}
                    </div>
                    <div className="text-xs text-stone-500 uppercase">Total PPG</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-amber-600">
                      {((rosters[userDraftPosition] || []).reduce((sum, c) => sum + (c.bookRating || 0), 0) / (rosters[userDraftPosition] || []).length || 0).toFixed(1)}
                    </div>
                    <div className="text-xs text-stone-500 uppercase">Avg Book Rating</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-amber-600">
                      {new Set((rosters[userDraftPosition] || []).map(c => c.seriesName).filter(Boolean)).size}
                    </div>
                    <div className="text-xs text-stone-500 uppercase">Series Rep'd</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Other Rosters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              {teams.filter(t => !t.isUser).map(team => (
                <div key={team.index} className="bg-white rounded-xl border border-stone-200 p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xl">{team.emoji}</span>
                    <span
                      className="font-bold text-stone-700"
                      style={{ fontFamily: 'var(--font-family-display)' }}
                    >
                      {team.name}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {(rosters[team.index] || []).map((char, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm">
                        <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${getPositionColor(char.player?.position)}`}>
                          {getPositionLabel(char.player?.position)}
                        </span>
                        <span className="text-stone-700 truncate">{char.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}

        {/* Game Simulation Modal */}
        <GameSimulationModal
          isOpen={showSimModal}
          onClose={() => setShowSimModal(false)}
          onPlayAgain={handlePlayAgain}
          onBuildNewLineup={resetDraft}
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
