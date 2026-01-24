import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getAllData } from '../api/airtable'
import Header from '../components/Header'
import RatingBackboards from '../components/RatingBackboards'

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
            <div className="h-10 bg-sonics-green/20 rounded w-80 mx-auto mb-3" />
            <div className="h-4 bg-sonics-green/20 rounded w-64 mx-auto" />
          </div>

          {/* Mode Toggle skeleton */}
          <div className="flex justify-center mb-6">
            <div className="h-12 bg-sonics-green/20 rounded-lg w-64 animate-pulse" />
          </div>

          {/* Position Toggle skeleton */}
          <div className="flex justify-center mb-6">
            <div className="h-8 bg-sonics-green/20 rounded w-80 animate-pulse" />
          </div>

          {/* Selection Count skeleton */}
          <div className="flex items-center justify-between mb-6 animate-pulse">
            <div className="h-8 bg-sonics-green/20 rounded w-32" />
            <div className="h-10 bg-sonics-green/20 rounded w-32" />
          </div>

          {/* Grid skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="border border-sonics-green/20 rounded-xl p-4 animate-pulse">
                <div className="flex gap-3">
                  <div className="w-16 h-24 bg-sonics-green/20 rounded" />
                  <div className="flex-1 space-y-2">
                    <div className="h-5 bg-sonics-green/20 rounded w-3/4" />
                    <div className="h-4 bg-sonics-green/20 rounded w-1/2" />
                    <div className="h-3 bg-sonics-green/20 rounded w-16 mt-2" />
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
            className="text-4xl font-bold text-sonics-gold"
            style={{ fontFamily: 'var(--font-family-display)' }}
          >
            TECHNICAL FOUL
          </div>
          <p className="text-red-400 mt-4">{error}</p>
          <Link to="/" className="inline-block mt-6 text-sonics-green hover:text-sonics-gold transition-colors">
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
            className="text-3xl md:text-4xl font-bold text-white"
            style={{ fontFamily: 'var(--font-family-display)' }}
          >
            BUILD YOUR STARTING 5
          </h2>
          <p className="text-gray-400 mt-2">
            {mode === MODES.BOOK
              ? 'Pick 5 books to reveal your fantasy basketball lineup'
              : 'Pick 5 players to see which books match them'}
          </p>
        </div>

        {!lineup ? (
          <>
            {/* Mode Toggle */}
            <div className="flex justify-center mb-6">
              <div className="inline-flex rounded-lg border border-sonics-green/30 p-1 bg-sonics-dark">
                <button
                  onClick={() => handleModeSwitch(MODES.BOOK)}
                  className={`px-6 py-2 rounded-md font-medium transition-all ${
                    mode === MODES.BOOK
                      ? 'bg-sonics-green text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Pick by Book
                </button>
                <button
                  onClick={() => handleModeSwitch(MODES.PLAYER)}
                  className={`px-6 py-2 rounded-md font-medium transition-all ${
                    mode === MODES.PLAYER
                      ? 'bg-sonics-green text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Pick by Player
                </button>
              </div>
            </div>

            {/* Position Rules Toggle */}
            <div className="flex justify-center mb-6">
              <label className="flex items-center gap-3 cursor-pointer">
                <span className="text-gray-400">Enforce Position Rules</span>
                <div
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    enforcePositions ? 'bg-sonics-green' : 'bg-gray-600'
                  }`}
                  onClick={() => setEnforcePositions(!enforcePositions)}
                >
                  <div
                    className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                      enforcePositions ? 'translate-x-7' : 'translate-x-1'
                    }`}
                  />
                </div>
                <span className="text-xs text-gray-500">(2+ guards, 2+ forwards/centers)</span>
              </label>
            </div>

            {/* Selection Count & Actions */}
            <div className="flex items-center justify-between mb-6">
              <div
                className="text-2xl font-bold"
                style={{ fontFamily: 'var(--font-family-display)' }}
              >
                <span className={selections.length === 5 ? 'text-sonics-gold' : 'text-white'}>
                  {selections.length}
                </span>
                <span className="text-gray-500">/5</span>
                <span className="text-gray-400 text-lg ml-2">Selected</span>
              </div>
              <div className="flex gap-3">
                {selections.length > 0 && (
                  <button
                    onClick={handleStartOver}
                    className="px-4 py-2 text-gray-400 hover:text-white border border-gray-600 hover:border-gray-400 rounded-lg transition-colors"
                  >
                    Start Over
                  </button>
                )}
                <button
                  onClick={handleBuildLineup}
                  disabled={selections.length !== 5}
                  className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                    selections.length === 5
                      ? 'bg-sonics-gold text-sonics-dark hover:bg-sonics-gold/90'
                      : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  Build Lineup
                </button>
              </div>
            </div>

            {/* Validation Error */}
            {validationError && (
              <div className="mb-6 p-4 bg-red-900/30 border border-red-500/50 rounded-lg text-red-400 text-center">
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
                      className={`p-4 rounded-xl border text-left transition-all ${
                        isSelected
                          ? 'border-sonics-gold bg-sonics-gold/10'
                          : isDisabled
                          ? 'border-gray-700 bg-gray-800/50 opacity-50 cursor-not-allowed'
                          : 'border-sonics-green/30 bg-sonics-green/5 hover:border-sonics-green/60 hover:bg-sonics-green/10'
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
                          <div className="w-16 h-24 bg-sonics-green/20 rounded flex-shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <div
                            className={`font-semibold truncate ${isSelected ? 'text-sonics-gold' : 'text-white'}`}
                            style={{ fontFamily: 'var(--font-family-display)' }}
                          >
                            {book.title}
                          </div>
                          <div className="text-sm text-gray-400 truncate">{book.author}</div>
                          {player && (
                            <div className="mt-2 text-xs text-sonics-green">
                              {player.position && <span className="mr-2">{player.position}</span>}
                              {isGuard(player.position) && (
                                <span className="px-1.5 py-0.5 bg-blue-900/50 text-blue-400 rounded">G</span>
                              )}
                              {isFrontcourt(player.position) && (
                                <span className="px-1.5 py-0.5 bg-orange-900/50 text-orange-400 rounded">F/C</span>
                              )}
                            </div>
                          )}
                        </div>
                        {isSelected && (
                          <div className="flex-shrink-0 w-6 h-6 rounded-full bg-sonics-gold flex items-center justify-center">
                            <svg className="w-4 h-4 text-sonics-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                      className={`p-4 rounded-xl border text-left transition-all ${
                        isSelected
                          ? 'border-sonics-gold bg-sonics-gold/10'
                          : isDisabled
                          ? 'border-gray-700 bg-gray-800/50 opacity-50 cursor-not-allowed'
                          : 'border-sonics-green/30 bg-sonics-green/5 hover:border-sonics-green/60 hover:bg-sonics-green/10'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div
                            className={`text-2xl font-bold ${isSelected ? 'text-sonics-gold' : 'text-sonics-gold/70'}`}
                            style={{ fontFamily: 'var(--font-family-display)' }}
                          >
                            #{playerItem.number || '00'}
                          </div>
                          <div
                            className={`font-semibold mt-1 ${isSelected ? 'text-sonics-gold' : 'text-white'}`}
                            style={{ fontFamily: 'var(--font-family-display)' }}
                          >
                            {playerItem.name}
                          </div>
                          <div className="text-sm text-gray-400">{playerItem.currentTeam}</div>
                          <div className="mt-2 text-xs">
                            {playerItem.position && (
                              <span className="text-gray-500 mr-2">{playerItem.position}</span>
                            )}
                            {isGuard(playerItem.position) && (
                              <span className="px-1.5 py-0.5 bg-blue-900/50 text-blue-400 rounded">G</span>
                            )}
                            {isFrontcourt(playerItem.position) && (
                              <span className="px-1.5 py-0.5 bg-orange-900/50 text-orange-400 rounded">F/C</span>
                            )}
                          </div>
                        </div>
                        {isSelected && (
                          <div className="flex-shrink-0 w-6 h-6 rounded-full bg-sonics-gold flex items-center justify-center">
                            <svg className="w-4 h-4 text-sonics-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
          /* Lineup Results */
          <div>
            <div className="text-center mb-8">
              <h3
                className="text-2xl font-bold text-sonics-gold"
                style={{ fontFamily: 'var(--font-family-display)' }}
              >
                YOUR STARTING 5
              </h3>
            </div>

            <div className="space-y-4">
              {lineup.map((item, index) => (
                <div
                  key={index}
                  className="border border-sonics-green/30 rounded-xl bg-gradient-to-r from-sonics-green/10 to-transparent p-6"
                >
                  <div className="flex flex-col md:flex-row gap-6 items-center">
                    {/* Jersey Number */}
                    <div
                      className="text-5xl font-bold text-sonics-gold/30 w-20 text-center flex-shrink-0"
                      style={{ fontFamily: 'var(--font-family-display)' }}
                    >
                      #{item.player?.number || '00'}
                    </div>

                    {/* Book Cover */}
                    {item.book?.coverUrl ? (
                      <img
                        src={item.book.coverUrl}
                        alt={item.book.title}
                        className="w-20 h-28 object-cover rounded shadow-lg flex-shrink-0"
                      />
                    ) : (
                      <div className="w-20 h-28 bg-sonics-green/20 rounded flex-shrink-0" />
                    )}

                    {/* Comp Info */}
                    <div className="flex-1 text-center md:text-left">
                      <div
                        className="text-xl md:text-2xl font-bold text-sonics-gold"
                        style={{ fontFamily: 'var(--font-family-display)' }}
                      >
                        {item.character?.name || 'Unknown'}
                        <span className="text-white mx-2">is</span>
                        {item.player?.name || 'Unknown'}
                      </div>
                      {item.character?.tagline && (
                        <p className="text-gray-400 mt-1 italic">"{item.character.tagline}"</p>
                      )}
                      <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-3">
                        <div className="text-sm text-gray-500">
                          <span className="text-gray-400">{item.book?.title}</span>
                          <span className="mx-1">•</span>
                          {item.book?.author}
                        </div>
                        {item.player?.position && (
                          <span className="text-xs px-2 py-1 bg-sonics-green/20 text-sonics-green rounded">
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

            {/* Build Another Button */}
            <div className="text-center mt-8">
              <button
                onClick={handleStartOver}
                className="px-8 py-3 bg-sonics-gold text-sonics-dark font-semibold rounded-lg hover:bg-sonics-gold/90 transition-colors"
              >
                Build Another Lineup
              </button>
            </div>
          </div>
        )}
      </main>

      <footer className="border-t border-sonics-green/20 py-8 text-center text-gray-500 text-sm mt-12">
        <p>Where fantasy meets the hardwood</p>
      </footer>
    </div>
  )
}
