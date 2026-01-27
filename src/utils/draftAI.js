// Draft AI - Different AI personalities for fantasy draft opponents

// Position helpers
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

function getPositionCategory(position) {
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

// AI Personalities
export const AI_PERSONALITIES = {
  ANALYTICS_NERD: {
    id: 'analytics',
    name: 'The Analytics Nerd',
    emoji: '🤓',
    description: 'Picks high-efficiency characters with great stats',
    color: 'blue',
  },
  STORYTELLER: {
    id: 'storyteller',
    name: 'The Storyteller',
    emoji: '📚',
    description: 'Prioritizes characters from highly-rated books and series',
    color: 'purple',
  },
  BALANCED_BUILDER: {
    id: 'balanced',
    name: 'The Balanced Builder',
    emoji: '⚖️',
    description: 'Focuses on positional needs and team balance',
    color: 'green',
  },
  WILDCARD: {
    id: 'wildcard',
    name: 'The Wildcard',
    emoji: '🎲',
    description: 'Unpredictable picks with occasional steals',
    color: 'orange',
  },
}

// Roster position requirements
export const ROSTER_POSITIONS = {
  PG: { label: 'Point Guard', required: 1, max: 2 },
  SG: { label: 'Shooting Guard', required: 1, max: 2 },
  SF: { label: 'Small Forward', required: 1, max: 2 },
  PF: { label: 'Power Forward', required: 1, max: 2 },
  C: { label: 'Center', required: 1, max: 2 },
  FLEX: { label: 'Flex', required: 0, max: 4 },
}

/**
 * Check if a team needs a specific position
 */
function needsPosition(roster, position) {
  const category = getPositionCategory(position)
  const positionPlayers = roster.filter(p => getPositionCategory(p.player?.position) === category)
  const config = ROSTER_POSITIONS[category] || ROSTER_POSITIONS.FLEX
  return positionPlayers.length < config.max
}

/**
 * Get positional needs for a roster
 */
function getPositionalNeeds(roster) {
  const needs = []

  for (const [pos, config] of Object.entries(ROSTER_POSITIONS)) {
    if (pos === 'FLEX') continue
    const count = roster.filter(p => getPositionCategory(p.player?.position) === pos).length
    if (count < config.required) {
      needs.push({ position: pos, priority: config.required - count })
    }
  }

  return needs.sort((a, b) => b.priority - a.priority)
}

/**
 * Score a character for the Analytics Nerd AI
 * Prioritizes: high player stats (PER, PPG), high book ratings
 */
function scoreForAnalytics(character, roster) {
  let score = 0

  // Player stats are king
  const stats = character.player?.stats
  if (stats) {
    score += (stats.per || 15) * 3 // PER is weighted heavily
    score += (stats.ppg || 15) * 2
    score += (stats.rpg || 5) * 1
    score += (stats.apg || 3) * 1.5
  }

  // Book rating matters too
  score += (character.bookRating || 3) * 5

  // Slight penalty if we already have this position covered
  if (!needsPosition(roster, character.player?.position)) {
    score *= 0.7
  }

  return score
}

/**
 * Score a character for the Storyteller AI
 * Prioritizes: highly-rated books, series characters, great taglines
 */
function scoreForStoryteller(character, roster) {
  let score = 0

  // Book rating is primary
  score += (character.bookRating || 3) * 20

  // Series characters get a bonus
  if (character.seriesName) {
    score += 15
    // Bonus if we already have someone from this series (team building!)
    const seriesmates = roster.filter(p => p.seriesName === character.seriesName)
    score += seriesmates.length * 10
  }

  // Great taglines are valued
  if (character.tagline && character.tagline.length > 20) {
    score += 8
  }

  // Some consideration for position
  if (!needsPosition(roster, character.player?.position)) {
    score *= 0.8
  }

  return score
}

/**
 * Score a character for the Balanced Builder AI
 * Prioritizes: filling positional needs, then best available
 */
function scoreForBalanced(character, roster) {
  let score = 0
  const needs = getPositionalNeeds(roster)
  const charPosition = getPositionCategory(character.player?.position)

  // Big bonus for filling a need
  const need = needs.find(n => n.position === charPosition)
  if (need) {
    score += 50 * need.priority
  }

  // Penalty for positions we have too many of
  if (!needsPosition(roster, character.player?.position)) {
    score -= 30
  }

  // Then consider quality
  score += (character.bookRating || 3) * 5
  const stats = character.player?.stats
  if (stats) {
    score += (stats.per || 15) * 1
  }

  return score
}

/**
 * Score a character for the Wildcard AI
 * Semi-random with occasional good picks
 */
function scoreForWildcard(character, roster) {
  let score = Math.random() * 50 // Big random factor

  // Sometimes makes great picks
  if (Math.random() > 0.7) {
    score += (character.bookRating || 3) * 10
    const stats = character.player?.stats
    if (stats) {
      score += (stats.per || 15) * 2
    }
  }

  // Basic position awareness
  if (!needsPosition(roster, character.player?.position)) {
    score *= 0.6
  }

  return score
}

/**
 * Get AI's pick based on personality
 */
export function getAIPick(personality, availableCharacters, roster) {
  if (availableCharacters.length === 0) return null

  let scoreFn
  switch (personality.id) {
    case 'analytics':
      scoreFn = scoreForAnalytics
      break
    case 'storyteller':
      scoreFn = scoreForStoryteller
      break
    case 'balanced':
      scoreFn = scoreForBalanced
      break
    case 'wildcard':
      scoreFn = scoreForWildcard
      break
    default:
      scoreFn = scoreForBalanced
  }

  // Score all available characters
  const scored = availableCharacters.map(char => ({
    character: char,
    score: scoreFn(char, roster)
  }))

  // Sort by score and pick the best
  scored.sort((a, b) => b.score - a.score)

  // Add slight randomness to top picks (don't always take #1)
  const topPicks = scored.slice(0, Math.min(3, scored.length))
  const weights = [0.6, 0.3, 0.1]
  const rand = Math.random()
  let cumulative = 0

  for (let i = 0; i < topPicks.length; i++) {
    cumulative += weights[i] || 0.1
    if (rand < cumulative) {
      return topPicks[i].character
    }
  }

  return topPicks[0].character
}

/**
 * Generate snake draft order
 * Pattern: 1-2-3-4-4-3-2-1-1-2-3-4...
 */
export function generateSnakeDraftOrder(numTeams, numRounds) {
  const order = []

  for (let round = 0; round < numRounds; round++) {
    const isEvenRound = round % 2 === 0

    for (let pick = 0; pick < numTeams; pick++) {
      const teamIndex = isEvenRound ? pick : (numTeams - 1 - pick)
      order.push({
        round: round + 1,
        pick: order.length + 1,
        teamIndex,
      })
    }
  }

  return order
}

/**
 * Get recommended pick for user (auto-pick)
 */
export function getRecommendedPick(availableCharacters, roster) {
  // Use balanced strategy for recommendations
  return getAIPick(AI_PERSONALITIES.BALANCED_BUILDER, availableCharacters, roster)
}

/**
 * Validate if a pick is legal (position limits)
 */
export function isValidPick(character, roster, maxRosterSize = 10) {
  if (roster.length >= maxRosterSize) return false

  const position = character.player?.position
  if (!position) return true // No position = flex pick is always valid

  return needsPosition(roster, position)
}
