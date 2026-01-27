// Court Diagram - SVG half-court with positioned players

// Helper functions to determine position
function isGuard(position) {
  if (!position) return false
  const pos = position.toUpperCase()
  return pos.includes('PG') || pos.includes('SG') || pos === 'G' || pos === 'GUARD'
}

function isPointGuard(position) {
  if (!position) return false
  const pos = position.toUpperCase()
  return pos.includes('PG') || pos === 'POINT GUARD'
}

function isShootingGuard(position) {
  if (!position) return false
  const pos = position.toUpperCase()
  return pos.includes('SG') || pos === 'SHOOTING GUARD'
}

function isSmallForward(position) {
  if (!position) return false
  const pos = position.toUpperCase()
  return pos.includes('SF') || pos === 'SMALL FORWARD'
}

function isPowerForward(position) {
  if (!position) return false
  const pos = position.toUpperCase()
  return pos.includes('PF') || pos === 'POWER FORWARD'
}

function isCenter(position) {
  if (!position) return false
  const pos = position.toUpperCase()
  return pos.includes('C') || pos === 'CENTER'
}

function isFrontcourt(position) {
  if (!position) return false
  const pos = position.toUpperCase()
  return pos.includes('SF') || pos.includes('PF') || pos.includes('C') ||
         pos === 'F' || pos === 'FORWARD' || pos === 'CENTER'
}

// Court position coordinates (SVG viewBox is 400x380)
const POSITIONS = {
  PG: { x: 200, y: 70 },    // Top of arc
  SG: { x: 310, y: 130 },   // Right wing
  SF: { x: 90, y: 130 },    // Left wing
  PF: { x: 280, y: 220 },   // Right side of paint
  C: { x: 120, y: 220 },    // Left side of paint
}

/**
 * Assign court positions to lineup players based on their actual positions
 */
function assignPositions(lineup) {
  const assigned = []
  const usedPositions = new Set()

  // Create a working copy with position info
  const playersWithPos = lineup.map(item => ({
    ...item,
    position: item.player?.position || ''
  }))

  // First pass: assign players to their exact positions
  const positionChecks = [
    { check: isPointGuard, pos: 'PG' },
    { check: isShootingGuard, pos: 'SG' },
    { check: isSmallForward, pos: 'SF' },
    { check: isPowerForward, pos: 'PF' },
    { check: isCenter, pos: 'C' },
  ]

  for (const { check, pos } of positionChecks) {
    const player = playersWithPos.find(p =>
      !assigned.some(a => a.item === p) && check(p.position)
    )
    if (player && !usedPositions.has(pos)) {
      assigned.push({ item: player, courtPos: pos })
      usedPositions.add(pos)
    }
  }

  // Second pass: assign remaining guards/forwards to available spots
  const remainingPlayers = playersWithPos.filter(p =>
    !assigned.some(a => a.item === p)
  )

  for (const player of remainingPlayers) {
    let courtPos = null

    if (isGuard(player.position)) {
      // Prefer guard spots
      if (!usedPositions.has('PG')) courtPos = 'PG'
      else if (!usedPositions.has('SG')) courtPos = 'SG'
      else if (!usedPositions.has('SF')) courtPos = 'SF'
    } else if (isFrontcourt(player.position)) {
      // Prefer frontcourt spots
      if (!usedPositions.has('C')) courtPos = 'C'
      else if (!usedPositions.has('PF')) courtPos = 'PF'
      else if (!usedPositions.has('SF')) courtPos = 'SF'
    }

    // Fallback: any available position
    if (!courtPos) {
      const available = ['PG', 'SG', 'SF', 'PF', 'C'].find(p => !usedPositions.has(p))
      courtPos = available
    }

    if (courtPos) {
      assigned.push({ item: player, courtPos })
      usedPositions.add(courtPos)
    }
  }

  return assigned
}

export default function CourtDiagram({ lineup }) {
  if (!lineup || lineup.length === 0) return null

  const positionedPlayers = assignPositions(lineup)

  return (
    <div className="w-full max-w-2xl mx-auto">
      <svg
        viewBox="0 0 400 320"
        className="w-full h-auto"
        role="img"
        aria-label="Basketball half-court diagram with player positions"
      >
        {/* Court Background */}
        <rect x="0" y="0" width="400" height="320" fill="#1a1a2e" />

        {/* Court Lines - Sonics Green */}
        <g stroke="#00653A" strokeWidth="2" fill="none">
          {/* Court outline */}
          <rect x="20" y="20" width="360" height="280" />

          {/* Three-point arc */}
          <path d="M 55 300 L 55 180 Q 55 50 200 50 Q 345 50 345 180 L 345 300" />

          {/* Free throw circle */}
          <circle cx="200" cy="230" r="55" />

          {/* Paint/Key */}
          <rect x="135" y="185" width="130" height="115" />

          {/* Free throw line */}
          <line x1="135" y1="230" x2="265" y2="230" />

          {/* Restricted area arc */}
          <path d="M 165 300 Q 200 275 235 300" />

          {/* Basket */}
          <circle cx="200" cy="290" r="7" stroke="#FFC200" strokeWidth="3" />

          {/* Backboard */}
          <line x1="180" y1="300" x2="220" y2="300" stroke="#FFC200" strokeWidth="4" />
        </g>

        {/* Center court marker (for visual interest) */}
        <circle cx="200" cy="20" r="3" fill="#FFC200" />

        {/* Players */}
        {positionedPlayers.map(({ item, courtPos }, index) => {
          const coords = POSITIONS[courtPos]
          if (!coords) return null

          const playerNumber = item.player?.number || '00'
          const characterName = item.character?.name || 'Unknown'
          // Truncate long names more aggressively
          const displayName = characterName.length > 10
            ? characterName.slice(0, 9) + '…'
            : characterName

          return (
            <g key={index} transform={`translate(${coords.x}, ${coords.y})`}>
              {/* Player circle with glow */}
              <circle
                r="24"
                fill="#00653A"
                stroke="#FFC200"
                strokeWidth="2.5"
                className="drop-shadow-lg"
              />

              {/* Jersey number */}
              <text
                y="2"
                textAnchor="middle"
                fill="#FFC200"
                fontSize="16"
                fontWeight="bold"
                fontFamily="var(--font-family-display), sans-serif"
              >
                {playerNumber}
              </text>

              {/* Character name below circle */}
              <text
                y="40"
                textAnchor="middle"
                fill="#ffffff"
                fontSize="10"
                fontWeight="600"
                fontFamily="var(--font-family-display), sans-serif"
              >
                {displayName}
              </text>

              {/* Position label */}
              <text
                y="52"
                textAnchor="middle"
                fill="#FFC200"
                fontSize="8"
                fontWeight="500"
                opacity="0.8"
              >
                {courtPos}
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}
