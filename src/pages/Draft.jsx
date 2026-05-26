import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { getAllData } from '../api/airtable'
import { getPlayerStats } from '../api/nbaStats'
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

const C = {
  green:   '#00653A',
  greenDk: '#003e22',
  gold:    '#FFC200',
  goldDk:  '#C99700',
  cyan:    '#00b8b8',
  dark:    '#0a1612',
  stone:   '#5a5953',
  hot:     '#ff5a1f',
}

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

// ── Visual Components ────────────────────────────────────────────────────

const COVER_PALETTES = [
  ['#1a472a', '#40916c'],
  ['#023047', '#126782'],
  ['#3d0c11', '#9b2335'],
  ['#4a1942', '#7b2d8b'],
  ['#1b2838', '#2b4c7e'],
  ['#2d3436', '#636e72'],
  ['#4a3728', '#8b6355'],
  ['#1a3a1a', '#2d6a2d'],
]
function getBookColors(title = '') {
  const sum = [...title].reduce((a, c) => a + c.charCodeAt(0), 0)
  return COVER_PALETTES[sum % COVER_PALETTES.length]
}

function BookCover({ title = '', author = '', coverUrl = '', w = 80 }) {
  const h = Math.round(w * 1.45)
  if (coverUrl) {
    return (
      <img
        src={coverUrl}
        alt={title}
        style={{ width: w, height: h, objectFit: 'cover', flexShrink: 0, display: 'block' }}
      />
    )
  }
  const [c1, c2] = getBookColors(title)
  const fs = w * 0.13
  return (
    <div style={{
      width: w, height: h, flexShrink: 0, overflow: 'hidden', position: 'relative',
      background: `linear-gradient(135deg, ${c1} 0%, ${c1} 55%, ${c2} 55%, ${c2} 100%)`,
      boxShadow: 'inset 0 0 0 1px rgba(0,0,0,.25)',
      color: '#f6e8c4',
    }}>
      <div style={{ position: 'absolute', inset: 0, padding: w * 0.08, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div style={{ fontFamily: "'Anton','Impact',sans-serif", fontSize: Math.max(fs * 1.15, 7), lineHeight: 1.0, textShadow: '0 1px 2px rgba(0,0,0,.45)', textTransform: 'uppercase', overflow: 'hidden' }}>
          {title}
        </div>
        <div style={{ fontFamily: "'Oswald',sans-serif", fontSize: Math.max(fs * 0.65, 5), opacity: 0.92, textTransform: 'uppercase', letterSpacing: '0.04em', textAlign: 'right' }}>
          {author}
        </div>
      </div>
      <div style={{ position: 'absolute', top: 0, bottom: 0, left: 0, width: '6%', background: 'rgba(0,0,0,.2)' }} />
    </div>
  )
}

function Stamp({ children, color = C.hot, rotate = -6, size = 80 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: color, color: '#fff',
      border: `3px solid ${C.dark}`,
      boxShadow: `3px 3px 0 ${C.dark}`,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      transform: `rotate(${rotate}deg)`, textAlign: 'center',
      fontFamily: "'Anton','Impact',sans-serif",
      fontSize: size * 0.13, lineHeight: 1, letterSpacing: '0.02em',
    }}>
      {children}
    </div>
  )
}

function TeamBug({ abbr, name, picks, live }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10, padding: '0 18px',
      borderRight: `2px solid rgba(255,194,0,.22)`,
      background: live ? `linear-gradient(180deg, rgba(255,194,0,.18), transparent)` : 'transparent',
    }}>
      <div style={{
        width: 34, height: 34,
        background: live ? C.gold : C.green,
        color: live ? C.dark : C.gold,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: abbr.length > 2 ? 12 : 16,
        border: `2px solid ${C.dark}`,
        fontFamily: "'Anton','Impact',sans-serif",
        textTransform: 'uppercase', flexShrink: 0,
      }}>{abbr}</div>
      <div>
        <div style={{
          fontFamily: "'Oswald',sans-serif", fontWeight: 700,
          fontSize: 10, color: C.cyan, opacity: 0.8, textTransform: 'uppercase', letterSpacing: '0.04em',
        }}>{name}</div>
        <div style={{
          fontFamily: "'Anton','Impact',sans-serif",
          fontSize: 20, color: live ? C.gold : '#fff', lineHeight: 1,
          textShadow: live ? `2px 2px 0 ${C.dark}` : 'none',
        }}>
          {picks}<span style={{ opacity: 0.4, fontSize: 12 }}>/5</span>
        </div>
      </div>
    </div>
  )
}

function PoolRow({ char, rank, canPick, onPick }) {
  const [hover, setHover] = useState(false)
  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: 'grid', gridTemplateColumns: '36px 1fr 160px 110px 90px',
        padding: '10px 18px', gap: 10, alignItems: 'center',
        borderBottom: `1px solid rgba(10,22,18,.08)`,
        background: hover ? 'rgba(0,101,58,.06)' : 'transparent',
        transition: 'background .12s',
      }}
    >
      <div style={{
        fontFamily: "'Anton','Impact',sans-serif",
        fontSize: 22, color: rank <= 3 ? C.goldDk : C.dark,
        opacity: rank <= 3 ? 1 : 0.45, lineHeight: 1,
        textShadow: 'none',
      }}>{rank}</div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
        <BookCover title={char.bookTitle} author={char.bookAuthor} coverUrl={char.bookCoverUrl} w={34} />
        <div style={{ minWidth: 0 }}>
          <div style={{
            fontFamily: "'Anton','Impact',sans-serif",
            fontSize: 15, color: C.dark, lineHeight: 1.1,
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {char.bookTitle}
          </div>
          <div style={{
            fontFamily: "'JetBrains Mono','IBM Plex Mono',monospace",
            fontSize: 10, color: C.stone, marginTop: 2,
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            by {char.bookAuthor}
          </div>
        </div>
      </div>

      <div style={{
        fontFamily: "'JetBrains Mono','IBM Plex Mono',monospace",
        fontSize: 10, color: C.green, fontWeight: 700,
        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
      }}>
        {char.seriesName ? char.seriesName.toUpperCase() : <span style={{ opacity: 0.4 }}>STANDALONE</span>}
      </div>

      <div>
        <RatingBackboards rating={char.bookRating} size={11} gap={1} />
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button
          onClick={onPick}
          disabled={!canPick}
          style={{
            background: canPick ? C.gold : '#444',
            color: canPick ? C.dark : '#888',
            border: `2px solid ${C.dark}`,
            height: 32, padding: '0 14px',
            fontFamily: "'Anton','Impact',sans-serif",
            fontSize: 14, cursor: canPick ? 'pointer' : 'not-allowed',
            boxShadow: canPick ? `2px 2px 0 ${C.dark}` : 'none',
            letterSpacing: '0.04em', textTransform: 'uppercase',
          }}
        >
          DRAFT
        </button>
      </div>
    </div>
  )
}

function LastPickCard({ lastPick }) {
  const [revealed, setRevealed] = useState(false)
  useEffect(() => {
    if (!lastPick) return
    setRevealed(false)
    const t = setTimeout(() => setRevealed(true), 800)
    return () => clearTimeout(t)
  }, [lastPick])

  if (!lastPick) return null
  const char = lastPick.character

  return (
    <div style={{ height: 160, position: 'relative' }}>
      <div className="card-flip-container" style={{ height: '100%' }}>
        <div className={`card-flip-inner${revealed ? ' flipped' : ''}`}>
          {/* Front: book cover */}
          <div className="card-face" style={{ background: C.dark, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {char?.bookCoverUrl ? (
              <img src={char.bookCoverUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            ) : (
              <BookCover title={char?.bookTitle || ''} author={char?.bookAuthor || ''} w={100} />
            )}
          </div>
          {/* Back: character reveal — "FRESH PICK" card */}
          <div
            className="card-face card-face-back"
            style={{
              background: '#fff', border: `3px solid ${C.dark}`,
              boxShadow: `4px 4px 0 ${C.cyan}`, position: 'relative',
              display: 'flex', flexDirection: 'column', padding: 12,
            }}
          >
            <div style={{ position: 'absolute', top: -10, right: -10 }}>
              <Stamp color={C.gold} rotate={12} size={48}>
                <div style={{ color: C.dark, fontSize: 11, lineHeight: 1 }}>FRESH<br />PICK</div>
              </Stamp>
            </div>
            <div style={{ display: 'flex', gap: 10, flex: 1 }}>
              <BookCover title={char?.bookTitle || ''} author={char?.bookAuthor || ''} coverUrl={char?.bookCoverUrl} w={64} />
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{
                  fontFamily: "'Anton','Impact',sans-serif",
                  fontSize: 18, color: C.green, lineHeight: 1,
                  textShadow: `1px 1px 0 ${C.gold}`, textTransform: 'uppercase',
                }}>{char?.name}</div>
                <div style={{
                  fontFamily: "'JetBrains Mono','IBM Plex Mono',monospace",
                  fontSize: 10, color: C.stone, marginTop: 4,
                }}>plays like</div>
                <div style={{
                  fontFamily: "'Anton','Impact',sans-serif",
                  fontSize: 14, color: C.hot, marginTop: 2, lineHeight: 1, textTransform: 'uppercase',
                }}>{char?.player?.name}</div>
              </div>
            </div>
            {char?.player?.stats && (
              <div style={{
                marginTop: 8, padding: '6px 8px', background: C.dark, color: C.gold,
                fontFamily: "'JetBrains Mono','IBM Plex Mono',monospace", fontSize: 10,
              }}>
                {char.player.stats.ppg?.toFixed(1)} <span style={{ opacity: 0.55 }}>PPG ·</span>{' '}
                {char.player.stats.rpg?.toFixed(1)} <span style={{ opacity: 0.55 }}>RPG ·</span>{' '}
                {char.player.stats.apg?.toFixed(1)} <span style={{ opacity: 0.55 }}>APG</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Main Draft Component ─────────────────────────────────────────────────

export default function Draft() {
  // Data state
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Draft configuration
  const numRounds = 5
  const [selectedAIs, setSelectedAIs] = useState([
    AI_PERSONALITIES.ANALYTICS_NERD,
    AI_PERSONALITIES.STORYTELLER,
  ])
  const [userDraftPosition, setUserDraftPosition] = useState(0)
  const [aiCountdown, setAiCountdown] = useState(0)

  // Draft state
  const [phase, setPhase] = useState(PHASES.SETUP)
  const [draftOrder, setDraftOrder] = useState([])
  const [currentPickIndex, setCurrentPickIndex] = useState(0)
  const [availableCharacters, setAvailableCharacters] = useState([])
  const [rosters, setRosters] = useState({})
  const [draftHistory, setDraftHistory] = useState([])
  const [isAIPicking, setIsAIPicking] = useState(false)
  const [lastPick, setLastPick] = useState(null)

  // UI state
  const [filterSeries, setFilterSeries] = useState('ALL')
  const [searchQuery, setSearchQuery] = useState('')
  const [autoPick, setAutoPick] = useState(false)

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
        const characterPool = []
        const seenBookIds = new Set()
        for (const book of result.books) {
          for (const character of book.characters || []) {
            if (character.player && !seenBookIds.has(book.id)) {
              seenBookIds.add(book.id)
              const stats = await getPlayerStats(character.player.name)
              characterPool.push({
                ...character,
                bookTitle: book.title,
                bookAuthor: book.author,
                bookCoverUrl: book.coverUrl,
                bookRating: book.rating,
                seriesName: book.series?.name,
                player: { ...character.player, stats },
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

  const allSeries = [...new Set(availableCharacters.map(c => c.seriesName).filter(Boolean))]

  const filteredCharacters = availableCharacters.filter(char => {
    if (filterSeries !== 'ALL' && char.seriesName !== filterSeries) return false
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      return (
        char.bookTitle?.toLowerCase().includes(q) ||
        char.bookAuthor?.toLowerCase().includes(q) ||
        char.seriesName?.toLowerCase().includes(q)
      )
    }
    return true
  })

  const teams = [
    { index: userDraftPosition, name: 'Your Team', isUser: true, emoji: '👤' },
    ...selectedAIs.map((ai, i) => {
      const index = i < userDraftPosition ? i : i + 1
      return { index, name: ai.name, isUser: false, personality: ai, emoji: ai.emoji }
    }),
  ].sort((a, b) => a.index - b.index)

  const currentPick = draftOrder[currentPickIndex]
  const currentTeam = currentPick ? teams.find(t => t.index === currentPick.teamIndex) : null
  const isUserPick = currentTeam?.isUser

  const startDraft = () => {
    const numTeams = selectedAIs.length + 1
    const order = generateSnakeDraftOrder(numTeams, numRounds)
    setDraftOrder(order)
    setCurrentPickIndex(0)
    setRosters(Object.fromEntries(teams.map(t => [t.index, []])))
    setDraftHistory([])
    setPhase(PHASES.DRAFTING)
  }

  const makePick = useCallback((character, teamIndex) => {
    setAvailableCharacters(prev => prev.filter(c => c.id !== character.id))
    setRosters(prev => ({
      ...prev,
      [teamIndex]: [...(prev[teamIndex] || []), character],
    }))
    const pickInfo = {
      ...draftOrder[currentPickIndex],
      character,
      team: teams.find(t => t.index === teamIndex),
    }
    setDraftHistory(prev => [...prev, pickInfo])
    setLastPick(pickInfo)
    if (currentPickIndex + 1 >= draftOrder.length) {
      setPhase(PHASES.COMPLETE)
    } else {
      setCurrentPickIndex(prev => prev + 1)
    }
  }, [currentPickIndex, draftOrder, teams])

  const handleUserPick = (character) => {
    if (!isUserPick || isAIPicking) return
    if (!isValidPick(character, rosters[userDraftPosition] || [], numRounds)) return
    makePick(character, userDraftPosition)
  }

  // AI picks with 5-second countdown
  useEffect(() => {
    if (phase !== PHASES.DRAFTING) return
    if (isUserPick && !autoPick) return
    if (processingPickIndex.current === currentPickIndex) return
    processingPickIndex.current = currentPickIndex
    setIsAIPicking(true)

    const pickIdx = currentPickIndex
    const teamIndex = draftOrder[pickIdx]?.teamIndex
    const team = teams.find(t => t.index === teamIndex)
    const isAutoPickForUser = isUserPick && autoPick

    if (isAutoPickForUser) {
      const timer = setTimeout(() => {
        if (processingPickIndex.current !== pickIdx) return
        const pick = getRecommendedPick(availableCharacters, rosters[userDraftPosition] || [])
        if (pick) makePick(pick, userDraftPosition)
        setIsAIPicking(false)
        setAiCountdown(0)
      }, 500)
      return () => clearTimeout(timer)
    }

    setAiCountdown(5)
    let countdownValue = 5
    const countdownInterval = setInterval(() => {
      if (processingPickIndex.current !== pickIdx) { clearInterval(countdownInterval); return }
      countdownValue -= 1
      setAiCountdown(countdownValue)
      if (countdownValue <= 0) clearInterval(countdownInterval)
    }, 1000)

    const pickTimer = setTimeout(() => {
      if (processingPickIndex.current !== pickIdx) return
      const aiPersonality = team?.personality
      const aiRoster = rosters[teamIndex] || []
      const pick = getAIPick(aiPersonality, availableCharacters, aiRoster)
      if (pick && team) makePick(pick, teamIndex)
      setIsAIPicking(false)
      setAiCountdown(0)
    }, 5000)

    return () => {
      clearInterval(countdownInterval)
      clearTimeout(pickTimer)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, currentPickIndex])

  useEffect(() => {
    if (phase === PHASES.COMPLETE && rosters[userDraftPosition]?.length > 0) {
      const userRoster = rosters[userDraftPosition]
      const lineupForName = userRoster.map(char => ({ book: { title: char.bookTitle } }))
      setTeamName(generateTeamName(lineupForName))
    }
  }, [phase, rosters, userDraftPosition])

  const handleChallengeHOF = async () => {
    setShowSimModal(true)
    setSimLoading(true)
    setSimResult(null)
    try {
      const hofBooks = (data?.books || [])
        .filter(book => book.rating > 0 && book.characters?.some(char => char.player))
        .sort((a, b) => {
          if (b.rating !== a.rating) return b.rating - a.rating
          return new Date(b.dateFinished) - new Date(a.dateFinished)
        })
        .slice(0, 5)

      const hofLineupData = await Promise.all(
        hofBooks.map(async (book) => {
          const character = book.characters?.[0]
          const player = character?.player
          const stats = player?.name ? await getPlayerStats(player.name) : { ppg: 15, rpg: 5, apg: 3 }
          return { book, character, player, playerStats: stats }
        })
      )
      setHofLineup(hofLineupData)

      const userRoster = rosters[userDraftPosition] || []
      const userLineup = userRoster.map(char => ({
        book: { title: char.bookTitle, rating: char.bookRating },
        character: { name: char.name, tagline: char.tagline },
        player: char.player,
        playerStats: char.player?.stats || { ppg: 15, rpg: 5, apg: 3 }
      }))

      const result = simulateGame({ userLineup, hofLineup: hofLineupData, userTeamName: teamName })
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
      const result = simulateGame({ userLineup, hofLineup, userTeamName: teamName })
      setSimResult(result)
    } catch (err) {
      console.error('Error re-running simulation:', err)
    } finally {
      setSimLoading(false)
    }
  }

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
    if (data) {
      const characterPool = []
      const seenBookIds = new Set()
      for (const book of data.books) {
        for (const character of book.characters || []) {
          if (character.player && !seenBookIds.has(book.id)) {
            seenBookIds.add(book.id)
            characterPool.push({
              ...character,
              bookTitle: book.title,
              bookAuthor: book.author,
              bookCoverUrl: book.coverUrl,
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

  // ── Render ────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: C.dark, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20 }}>
        <div style={{ fontFamily: "'Anton','Impact',sans-serif", fontSize: 40, color: C.gold, letterSpacing: '0.04em', textTransform: 'uppercase' }} className="cr-shadow">
          LOADING DRAFT
        </div>
        <div style={{ fontFamily: "'JetBrains Mono','IBM Plex Mono',monospace", fontSize: 12, color: C.cyan, letterSpacing: '0.1em' }}>
          FETCHING PLAYER STATS...
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {[0, 1, 2].map(i => (
            <div key={i} className="cr-pulse" style={{
              width: 10, height: 10, borderRadius: '50%', background: C.gold,
              animationDelay: `${i * 0.2}s`,
            }} />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ minHeight: '100vh', background: C.dark, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
        <div style={{ fontFamily: "'Anton','Impact',sans-serif", fontSize: 40, color: C.hot, textTransform: 'uppercase' }} className="cr-shadow">
          TECHNICAL FOUL
        </div>
        <div style={{ color: '#aaa', fontFamily: "'JetBrains Mono','IBM Plex Mono',monospace", fontSize: 12 }}>{error}</div>
        <Link to="/" style={{ color: C.gold, fontFamily: "'Oswald',sans-serif", fontWeight: 700, textDecoration: 'none', fontSize: 14, letterSpacing: '0.1em' }}>
          ← BACK TO HOME
        </Link>
      </div>
    )
  }

  // ── SETUP PHASE ──────────────────────────────────────────────────────
  if (phase === PHASES.SETUP) {
    return (
      <div style={{ minHeight: '100vh', background: C.dark, color: '#fff', fontFamily: "'DM Sans',system-ui,sans-serif" }}>
        {/* nav bar */}
        <div style={{ height: 60, background: C.dark, borderBottom: `4px solid ${C.gold}`, display: 'flex', alignItems: 'center', padding: '0 24px', position: 'sticky', top: 0, zIndex: 40 }}>
          <Link to="/" style={{ textDecoration: 'none' }}>
            <div style={{ fontFamily: "'Anton','Impact',sans-serif", fontSize: 26, color: C.gold, textShadow: `2px 2px 0 ${C.hot}`, letterSpacing: '0.02em', textTransform: 'uppercase' }}>
              COURT<span style={{ color: C.cyan }}>'</span>READS
            </div>
          </Link>
          <div style={{ flex: 1 }} />
          <div style={{ fontFamily: "'Oswald',sans-serif", fontWeight: 700, fontSize: 11, color: C.cyan, letterSpacing: '0.18em', textTransform: 'uppercase' }}>
            ★ DRAFT SETUP
          </div>
        </div>

        <div style={{ maxWidth: 640, margin: '0 auto', padding: '48px 24px' }}>
          <div className="cr-shadow" style={{ fontFamily: "'Anton','Impact',sans-serif", fontSize: 52, color: C.gold, letterSpacing: '0.02em', textTransform: 'uppercase', lineHeight: 0.9, marginBottom: 8 }}>
            FANTASY<br />DRAFT
          </div>
          <div style={{ fontFamily: "'JetBrains Mono','IBM Plex Mono',monospace", fontSize: 12, color: C.cyan, letterSpacing: '0.1em', marginBottom: 40 }}>
            SNAKE DRAFT · 5 ROUNDS · 3 TEAMS
          </div>

          {/* Draft Position */}
          <div style={{ marginBottom: 32 }}>
            <div style={{ fontFamily: "'Oswald',sans-serif", fontWeight: 700, fontSize: 11, color: C.gold, letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: 12 }}>
              YOUR DRAFT POSITION
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              {[0, 1, 2].map(n => (
                <button
                  key={n}
                  onClick={() => setUserDraftPosition(n)}
                  style={{
                    height: 44, padding: '0 20px',
                    background: userDraftPosition === n ? C.gold : 'transparent',
                    color: userDraftPosition === n ? C.dark : C.gold,
                    border: `2px solid ${userDraftPosition === n ? C.gold : 'rgba(255,194,0,.4)'}`,
                    boxShadow: userDraftPosition === n ? `3px 3px 0 ${C.dark}` : 'none',
                    fontFamily: "'Anton','Impact',sans-serif",
                    fontSize: 18, cursor: 'pointer', textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                  }}
                >
                  #{n + 1}
                </button>
              ))}
            </div>
          </div>

          {/* AI Opponents */}
          <div style={{ marginBottom: 32 }}>
            <div style={{ fontFamily: "'Oswald',sans-serif", fontWeight: 700, fontSize: 11, color: C.gold, letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: 12 }}>
              AI OPPONENTS (SELECT 2)
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {Object.values(AI_PERSONALITIES).map(ai => {
                const isSelected = selectedAIs.some(a => a.id === ai.id)
                const disabled = !isSelected && selectedAIs.length >= 2
                return (
                  <button
                    key={ai.id}
                    onClick={() => {
                      if (isSelected) {
                        if (selectedAIs.length > 1) setSelectedAIs(selectedAIs.filter(a => a.id !== ai.id))
                      } else if (!disabled) {
                        setSelectedAIs([...selectedAIs, ai])
                      }
                    }}
                    disabled={disabled}
                    style={{
                      padding: '14px 16px', textAlign: 'left',
                      background: isSelected ? 'rgba(0,101,58,.3)' : 'rgba(255,255,255,.04)',
                      border: `2px solid ${isSelected ? C.green : 'rgba(255,194,0,.2)'}`,
                      boxShadow: isSelected ? `3px 3px 0 ${C.green}` : 'none',
                      cursor: disabled ? 'not-allowed' : 'pointer',
                      opacity: disabled ? 0.4 : 1,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 20 }}>{ai.emoji}</span>
                      <span style={{ fontFamily: "'Oswald',sans-serif", fontWeight: 700, fontSize: 14, color: '#fff', textTransform: 'uppercase' }}>{ai.name}</span>
                    </div>
                    <div style={{ fontFamily: "'JetBrains Mono','IBM Plex Mono',monospace", fontSize: 10, color: '#888', marginTop: 6 }}>{ai.description}</div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Pool info */}
          <div style={{ padding: '10px 16px', background: 'rgba(0,184,184,.1)', border: `1px solid rgba(0,184,184,.3)`, marginBottom: 24, fontFamily: "'JetBrains Mono','IBM Plex Mono',monospace", fontSize: 12, color: C.cyan }}>
            {availableCharacters.length} BOOKS IN DRAFT POOL · COMPS HIDDEN UNTIL YOU PICK
          </div>

          {/* Start button */}
          <button
            onClick={startDraft}
            disabled={availableCharacters.length < numRounds * (selectedAIs.length + 1)}
            style={{
              width: '100%', height: 64,
              background: C.gold, color: C.dark,
              border: `3px solid ${C.dark}`,
              boxShadow: `5px 5px 0 ${C.dark}`,
              fontFamily: "'Anton','Impact',sans-serif",
              fontSize: 28, letterSpacing: '0.04em', textTransform: 'uppercase',
              cursor: 'pointer',
            }}
          >
            ▶ START DRAFT
          </button>
        </div>
      </div>
    )
  }

  // ── DRAFTING PHASE ───────────────────────────────────────────────────
  if (phase === PHASES.DRAFTING) {
    const userRoster = rosters[userDraftPosition] || []
    const squadPPG = userRoster.reduce((s, c) => s + (c.player?.stats?.ppg || 0), 0)

    return (
      <div style={{
        height: '100vh', background: '#fdf6e3', color: C.dark,
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
        fontFamily: "'DM Sans',system-ui,sans-serif",
      }}>
        {/* SCORE BUG */}
        <div style={{
          background: C.dark, height: 66,
          borderBottom: `3px solid ${C.gold}`,
          display: 'flex', alignItems: 'stretch',
          position: 'relative', zIndex: 6, flexShrink: 0,
        }}>
          <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', padding: '0 22px', borderRight: `2px solid rgba(255,194,0,.4)` }}>
            <div style={{ fontFamily: "'Anton','Impact',sans-serif", fontSize: 22, color: C.gold, textShadow: `2px 2px 0 ${C.hot}`, letterSpacing: '0.02em', textTransform: 'uppercase' }}>
              COURT<span style={{ color: C.cyan }}>'</span>READS
            </div>
          </Link>

          {teams.map(team => (
            <TeamBug
              key={team.index}
              abbr={team.isUser ? 'YOU' : team.emoji}
              name={team.isUser ? 'YOUR SQUAD' : team.name.toUpperCase()}
              picks={rosters[team.index]?.length || 0}
              live={currentPick?.teamIndex === team.index}
            />
          ))}

          {/* ON THE CLOCK */}
          <div className={isUserPick ? 'cr-halftone-gold' : ''} style={{
            flex: 1,
            background: isUserPick ? C.gold : 'transparent',
            color: isUserPick ? C.dark : C.gold,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            gap: 14, padding: '0 18px',
          }}>
            {isUserPick ? (
              <>
                <span className="cr-pulse" style={{ width: 12, height: 12, borderRadius: '50%', background: C.hot, border: `2px solid ${C.dark}`, flexShrink: 0 }} />
                <div style={{ fontFamily: "'Anton','Impact',sans-serif", fontSize: 26, color: C.dark, textShadow: '2px 2px 0 #fff', textTransform: 'uppercase' }}>
                  ON THE CLOCK
                </div>
              </>
            ) : isAIPicking ? (
              <>
                <div style={{ fontFamily: "'Anton','Impact',sans-serif", fontSize: 22, color: C.gold, textTransform: 'uppercase' }}>
                  {currentTeam?.name?.toUpperCase()} IS PICKING
                </div>
                <div style={{ fontFamily: "'JetBrains Mono','IBM Plex Mono',monospace", fontSize: 22, fontWeight: 700, padding: '4px 14px', background: C.dark, color: C.gold }}>
                  00:{String(aiCountdown).padStart(2, '0')}
                </div>
              </>
            ) : (
              <div style={{ fontFamily: "'Anton','Impact',sans-serif", fontSize: 22, textTransform: 'uppercase' }}>
                SNAKE DRAFT
              </div>
            )}
          </div>

          {/* Round counter */}
          <div style={{ display: 'flex', alignItems: 'center', padding: '0 22px', borderLeft: `2px solid rgba(255,194,0,.4)`, gap: 10, flexShrink: 0 }}>
            <span style={{ fontFamily: "'Oswald',sans-serif", fontWeight: 700, fontSize: 11, color: C.cyan, textTransform: 'uppercase' }}>ROUND</span>
            <span className="cr-shadow-hot" style={{ fontFamily: "'Anton','Impact',sans-serif", fontSize: 38, color: C.gold, lineHeight: 1 }}>
              {Math.min((currentPick?.round || 1), 5)}
            </span>
            <span style={{ fontFamily: "'Oswald',sans-serif", fontWeight: 700, fontSize: 11, color: '#fff', opacity: 0.55 }}>/ 5</span>
          </div>
        </div>

        {/* DIAGONAL SLASH BAR */}
        <div style={{ display: 'flex', height: 28, position: 'relative', zIndex: 5, flexShrink: 0 }}>
          <div className="cr-slash-r" style={{
            background: C.hot, color: '#fff', padding: '0 30px 0 18px',
            fontFamily: "'Oswald',sans-serif", fontWeight: 700, textTransform: 'uppercase',
            fontSize: 11, display: 'flex', alignItems: 'center', letterSpacing: '0.14em', flexShrink: 0,
          }}>★ DRAFT ROOM</div>
          <div className="cr-slash-r" style={{
            background: C.cyan, color: C.dark, marginLeft: -22, padding: '0 30px 0 32px',
            fontFamily: "'JetBrains Mono','IBM Plex Mono',monospace", fontWeight: 700,
            fontSize: 11, display: 'flex', alignItems: 'center', flexShrink: 0,
          }}>SNAKE DRAFT · 5 ROUNDS · 3 TEAMS</div>
          <div style={{ flex: 1 }} />
          {/* auto-pick toggle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0 16px' }}>
            <span style={{ fontFamily: "'JetBrains Mono','IBM Plex Mono',monospace", fontSize: 10, color: '#888' }}>AUTO-PICK</span>
            <div
              onClick={() => setAutoPick(!autoPick)}
              style={{
                width: 36, height: 18, borderRadius: 9, background: autoPick ? C.green : '#333',
                position: 'relative', cursor: 'pointer', transition: 'background .2s',
                border: `1px solid rgba(255,194,0,.3)`,
              }}
            >
              <div style={{
                position: 'absolute', top: 2, width: 14, height: 14,
                borderRadius: '50%', background: '#fff',
                left: autoPick ? 20 : 2, transition: 'left .2s',
              }} />
            </div>
          </div>
        </div>

        {/* MAIN 3-COLUMN */}
        <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr 300px', flex: 1, overflow: 'hidden' }}>

          {/* LEFT — Last pick + squad power */}
          <div style={{ padding: 18, borderRight: `2px solid rgba(10,22,18,.12)`, display: 'flex', flexDirection: 'column', gap: 14, overflow: 'hidden' }}>
            <div style={{ fontFamily: "'Oswald',sans-serif", fontWeight: 700, fontSize: 11, color: C.green, letterSpacing: '0.18em', textTransform: 'uppercase' }}>
              ★ LAST PICK
            </div>

            {lastPick ? (
              <LastPickCard lastPick={lastPick} />
            ) : (
              <div style={{ border: `2px dashed rgba(10,22,18,.2)`, padding: 24, textAlign: 'center', color: C.dark, opacity: 0.4, fontFamily: "'Oswald',sans-serif", fontWeight: 700, textTransform: 'uppercase', fontSize: 12 }}>
                FIRST PICK COMING UP
              </div>
            )}

            {/* Squad Power */}
            <div style={{ marginTop: 'auto', padding: '12px 14px', background: `linear-gradient(180deg, ${C.green} 0%, ${C.greenDk} 100%)`, color: C.gold, border: `2px solid ${C.dark}` }}>
              <div style={{ fontFamily: "'Oswald',sans-serif", fontWeight: 700, fontSize: 10, opacity: 0.85, letterSpacing: '0.18em', textTransform: 'uppercase' }}>SQUAD POWER</div>
              <div className="cr-shadow" style={{ fontFamily: "'Anton','Impact',sans-serif", fontSize: 40, lineHeight: 1, marginTop: 4 }}>
                {squadPPG.toFixed(0)}
                <span style={{ fontFamily: "'JetBrains Mono','IBM Plex Mono',monospace", fontSize: 12, opacity: 0.7, fontWeight: 400, marginLeft: 6 }}>PPG</span>
              </div>
            </div>
          </div>

          {/* CENTER — pool */}
          <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            {/* header */}
            <div style={{ padding: '14px 18px 0', display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
              <div style={{ fontFamily: "'Anton','Impact',sans-serif", fontSize: 26, color: C.dark, textTransform: 'uppercase' }}>
                ★ BEST AVAILABLE
              </div>
              <span style={{ fontFamily: "'JetBrains Mono','IBM Plex Mono',monospace", fontSize: 10, color: C.stone }}>comps hidden until you draft</span>
              <div style={{ flex: 1 }} />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="SEARCH..."
                style={{
                  width: 200, padding: '6px 10px', fontSize: 11, fontWeight: 600,
                  border: `2px solid ${C.gold}`, background: C.dark, color: '#fff',
                  outline: 'none', letterSpacing: '0.04em',
                  fontFamily: "'JetBrains Mono','IBM Plex Mono',monospace",
                }}
              />
            </div>

            {/* column headers */}
            <div style={{
              display: 'grid', gridTemplateColumns: '36px 1fr 160px 110px 90px',
              padding: '10px 18px', borderBottom: `2px solid rgba(10,22,18,.15)`,
              gap: 10, marginTop: 8, flexShrink: 0,
              fontFamily: "'Oswald',sans-serif", fontWeight: 700,
              fontSize: 10, color: C.dark, letterSpacing: '0.14em', textTransform: 'uppercase',
            }}>
              <div>RK</div>
              <div>BOOK</div>
              <div>SERIES</div>
              <div>RATING</div>
              <div />
            </div>

            {/* rows */}
            <div style={{ flex: 1, overflowY: 'auto' }}>
              {filteredCharacters.map((char, i) => {
                const canPick = !!isUserPick && !isAIPicking && isValidPick(char, rosters[userDraftPosition] || [], numRounds)
                return (
                  <PoolRow
                    key={char.id}
                    char={char}
                    rank={i + 1}
                    canPick={canPick}
                    onPick={() => handleUserPick(char)}
                  />
                )
              })}
              {filteredCharacters.length === 0 && (
                <div style={{ padding: 40, textAlign: 'center', color: C.stone, fontFamily: "'Oswald',sans-serif", fontWeight: 700, textTransform: 'uppercase' }}>
                  {availableCharacters.length === 0 ? 'ALL BOOKS DRAFTED' : 'NO MATCHES'}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT — your lineup */}
          <div style={{ padding: 16, borderLeft: `2px solid rgba(10,22,18,.12)`, display: 'flex', flexDirection: 'column', gap: 8, overflow: 'hidden' }}>
            <div style={{ fontFamily: "'Oswald',sans-serif", fontWeight: 700, fontSize: 11, color: C.green, letterSpacing: '0.18em', textTransform: 'uppercase', flexShrink: 0 }}>
              ★ YOUR LINEUP <span style={{ color: C.goldDk, marginLeft: 6 }}>{userRoster.length}/5</span>
            </div>

            {[0, 1, 2, 3, 4].map(slot => {
              const char = userRoster[slot]
              return (
                <div key={slot} style={{
                  display: 'flex', gap: 10, alignItems: 'center', padding: '8px 10px',
                  background: char ? 'rgba(255,255,255,.04)' : 'transparent',
                  border: `2px solid ${char ? C.gold : 'rgba(255,194,0,.15)'}`,
                  borderLeft: `4px solid ${char ? C.gold : 'rgba(255,194,0,.15)'}`,
                  flexShrink: 0,
                }}>
                  <div style={{
                    fontFamily: "'Anton','Impact',sans-serif",
                    fontSize: 18, color: char ? C.goldDk : C.dark,
                    opacity: char ? 1 : 0.3, width: 16, flexShrink: 0,
                    textShadow: 'none',
                  }}>{slot + 1}</div>
                  {char ? (
                    <>
                      <BookCover title={char.bookTitle} author={char.bookAuthor} coverUrl={char.bookCoverUrl} w={26} />
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{ fontFamily: "'Anton','Impact',sans-serif", fontSize: 12, color: C.dark, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textTransform: 'uppercase' }}>
                          {char.name}
                        </div>
                        <div style={{ fontFamily: "'JetBrains Mono','IBM Plex Mono',monospace", fontSize: 9, color: C.green, opacity: 0.85, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {char.player?.name}
                        </div>
                      </div>
                    </>
                  ) : (
                    <span style={{ fontFamily: "'Oswald',sans-serif", fontWeight: 700, fontSize: 10, color: C.dark, opacity: 0.35, textTransform: 'uppercase' }}>OPEN SLOT</span>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* BOTTOM TICKER */}
        <div style={{
          background: C.dark, height: 34, display: 'flex', alignItems: 'center',
          borderTop: `2px solid ${C.cyan}`, padding: '0 18px', gap: 24, flexShrink: 0,
        }}>
          <span style={{ fontFamily: "'Anton','Impact',sans-serif", fontSize: 13, color: C.gold, textTransform: 'uppercase' }}>★ OTHER ROOMS</span>
          <span style={{ fontFamily: "'JetBrains Mono','IBM Plex Mono',monospace", fontSize: 10, color: C.cyan, letterSpacing: '0.04em' }}>
            @molly.k → Fourth Wing · @devon-9 → Way of Kings · @henryx → Babel · @jjbooks → Mistborn · @samtravis → Iron Flame
          </span>
        </div>

        <GameSimulationModal
          isOpen={showSimModal}
          onClose={() => setShowSimModal(false)}
          onPlayAgain={handlePlayAgain}
          onBuildNewLineup={resetDraft}
          simulationResult={simResult}
          userTeamName={teamName}
          isLoading={simLoading}
        />
      </div>
    )
  }

  // ── COMPLETE PHASE ───────────────────────────────────────────────────
  const userRoster = rosters[userDraftPosition] || []
  return (
    <div style={{ minHeight: '100vh', background: C.dark, color: '#fff', fontFamily: "'DM Sans',system-ui,sans-serif" }}>
      {/* nav */}
      <div style={{ height: 60, background: C.dark, borderBottom: `4px solid ${C.gold}`, display: 'flex', alignItems: 'center', padding: '0 24px', position: 'sticky', top: 0, zIndex: 40 }}>
        <Link to="/" style={{ textDecoration: 'none' }}>
          <div style={{ fontFamily: "'Anton','Impact',sans-serif", fontSize: 26, color: C.gold, textShadow: `2px 2px 0 ${C.hot}`, letterSpacing: '0.02em', textTransform: 'uppercase' }}>
            COURT<span style={{ color: C.cyan }}>'</span>READS
          </div>
        </Link>
        <div style={{ flex: 1 }} />
        <div style={{ fontFamily: "'Oswald',sans-serif", fontWeight: 700, fontSize: 11, color: C.cyan, letterSpacing: '0.18em', textTransform: 'uppercase' }}>
          ★ DRAFT COMPLETE
        </div>
      </div>

      {/* slash bar */}
      <div style={{ display: 'flex', height: 28, flexShrink: 0 }}>
        <div className="cr-slash-r" style={{ background: C.hot, color: '#fff', padding: '0 30px 0 18px', fontFamily: "'Oswald',sans-serif", fontWeight: 700, textTransform: 'uppercase', fontSize: 11, display: 'flex', alignItems: 'center', letterSpacing: '0.14em', flexShrink: 0 }}>
          ★ YOUR SQUAD
        </div>
        <div className="cr-slash-r" style={{ background: C.cyan, color: C.dark, marginLeft: -22, padding: '0 30px 0 32px', fontFamily: "'JetBrains Mono','IBM Plex Mono',monospace", fontWeight: 700, fontSize: 11, display: 'flex', alignItems: 'center', flexShrink: 0 }}>
          5 BOOKS DRAFTED · COMPS REVEALED
        </div>
      </div>

      <div style={{ maxWidth: 800, margin: '0 auto', padding: '40px 24px' }}>
        {/* Team name banner */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ fontFamily: "'Oswald',sans-serif", fontWeight: 700, fontSize: 11, color: C.cyan, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 8 }}>
            INTRODUCING
          </div>
          <div className="cr-shadow" style={{ fontFamily: "'Anton','Impact',sans-serif", fontSize: 48, color: C.gold, textTransform: 'uppercase', lineHeight: 0.9 }}>
            {teamName || 'YOUR TEAM'}
          </div>
        </div>

        {/* CTAs */}
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginBottom: 40, flexWrap: 'wrap' }}>
          <button
            onClick={handleChallengeHOF}
            style={{
              height: 60, padding: '0 32px',
              background: C.gold, color: C.dark,
              border: `3px solid ${C.dark}`,
              boxShadow: `5px 5px 0 ${C.dark}`,
              fontFamily: "'Anton','Impact',sans-serif",
              fontSize: 22, cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.04em',
            }}
          >
            CHALLENGE THE HALL OF FAME
          </button>
          <button
            onClick={resetDraft}
            style={{
              height: 60, padding: '0 24px',
              background: 'transparent', color: C.cyan,
              border: `2px solid rgba(0,184,184,.5)`,
              fontFamily: "'Oswald',sans-serif", fontWeight: 700,
              fontSize: 14, cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.08em',
            }}
          >
            START NEW DRAFT
          </button>
        </div>

        {/* Roster */}
        <div style={{ border: `3px solid ${C.gold}`, boxShadow: `5px 5px 0 ${C.gold}` }}>
          <div style={{ background: C.gold, padding: '8px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontFamily: "'Oswald',sans-serif", fontWeight: 700, fontSize: 13, color: C.dark, letterSpacing: '0.14em', textTransform: 'uppercase' }}>YOUR ROSTER</span>
            <span style={{ fontFamily: "'JetBrains Mono','IBM Plex Mono',monospace", fontSize: 11, color: C.dark }}>
              {userRoster.reduce((s, c) => s + (c.player?.stats?.ppg || 0), 0).toFixed(1)} TEAM PPG
            </span>
          </div>
          <div>
            {userRoster.map((char, i) => (
              <div
                key={i}
                className="animate-fade-in"
                style={{
                  display: 'flex', alignItems: 'center', gap: 16, padding: '14px 18px',
                  borderBottom: i < userRoster.length - 1 ? '1px solid rgba(255,194,0,.15)' : 'none',
                  animationDelay: `${i * 0.08}s`,
                }}
              >
                <div style={{ fontFamily: "'Anton','Impact',sans-serif", fontSize: 28, color: 'rgba(255,194,0,.4)', width: 24, flexShrink: 0 }}>{i + 1}</div>
                <BookCover title={char.bookTitle} author={char.bookAuthor} coverUrl={char.bookCoverUrl} w={52} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: "'Anton','Impact',sans-serif", fontSize: 20, color: C.green, textTransform: 'uppercase', lineHeight: 1 }}>{char.name}</div>
                  <div style={{ fontFamily: "'JetBrains Mono','IBM Plex Mono',monospace", fontSize: 10, color: C.hot, marginTop: 3 }}>plays like {char.player?.name}</div>
                  <div style={{ fontFamily: "'JetBrains Mono','IBM Plex Mono',monospace", fontSize: 10, color: '#888', marginTop: 2 }}>{char.bookTitle}</div>
                </div>
                <div>
                  <RatingBackboards rating={char.bookRating} size="sm" />
                </div>
                {char.player?.stats && (
                  <div style={{ display: 'flex', gap: 12, textAlign: 'center', flexShrink: 0 }}>
                    {[['PPG', char.player.stats.ppg], ['RPG', char.player.stats.rpg], ['APG', char.player.stats.apg]].map(([label, val]) => (
                      <div key={label}>
                        <div style={{ fontFamily: "'Anton','Impact',sans-serif", fontSize: 18, color: C.gold }}>{typeof val === 'number' ? val.toFixed(1) : '—'}</div>
                        <div style={{ fontFamily: "'JetBrains Mono','IBM Plex Mono',monospace", fontSize: 9, color: '#888' }}>{label}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Other teams */}
        <div style={{ marginTop: 32, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {teams.filter(t => !t.isUser).map(team => (
            <div key={team.index} style={{ border: `2px solid rgba(255,194,0,.2)`, padding: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <span style={{ fontSize: 20 }}>{team.emoji}</span>
                <span style={{ fontFamily: "'Oswald',sans-serif", fontWeight: 700, fontSize: 14, color: C.gold, textTransform: 'uppercase' }}>{team.name}</span>
                <span style={{ fontFamily: "'JetBrains Mono','IBM Plex Mono',monospace", fontSize: 10, color: '#666', marginLeft: 'auto' }}>{(rosters[team.index] || []).length}/5</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {(rosters[team.index] || []).map((char, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${getPositionColor(char.player?.position)}`}>
                      {getPositionLabel(char.player?.position)}
                    </span>
                    <span style={{ fontFamily: "'Oswald',sans-serif", fontWeight: 600, fontSize: 12, color: '#ccc', textTransform: 'uppercase' }}>{char.name}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <GameSimulationModal
        isOpen={showSimModal}
        onClose={() => setShowSimModal(false)}
        onPlayAgain={handlePlayAgain}
        onBuildNewLineup={resetDraft}
        simulationResult={simResult}
        userTeamName={teamName}
        isLoading={simLoading}
      />
    </div>
  )
}
