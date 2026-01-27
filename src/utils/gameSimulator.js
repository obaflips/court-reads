// Game Simulator - Stats-based basketball game simulation

/**
 * Calculate aggregate team stats from player stats
 * @param {Array} players - Array of player objects with stats
 * @returns {Object} Aggregate stats { ppg, rpg, apg }
 */
export function calculateTeamStats(players) {
  if (!players || players.length === 0) {
    return { ppg: 0, rpg: 0, apg: 0 }
  }

  return players.reduce((acc, player) => {
    const stats = player.stats || {}
    return {
      ppg: acc.ppg + (stats.ppg || 0),
      rpg: acc.rpg + (stats.rpg || 0),
      apg: acc.apg + (stats.apg || 0),
    }
  }, { ppg: 0, rpg: 0, apg: 0 })
}

/**
 * Generate a random number within a range
 */
function randomInRange(min, max) {
  return Math.random() * (max - min) + min
}

/**
 * Calculate team score based on stats with variance
 * Base formula: score = (PPG * 0.8) + (RPG * 0.3) + (APG * 0.2) + random(-10, +10)
 * Scores should land in realistic range (95-130)
 */
function calculateScore(teamStats) {
  const base = (teamStats.ppg * 0.8) + (teamStats.rpg * 0.3) + (teamStats.apg * 0.2)

  // Add randomness (±15% for excitement)
  const variance = base * 0.15
  const randomFactor = randomInRange(-variance, variance)

  let score = base + randomFactor

  // Clamp to realistic range
  score = Math.max(95, Math.min(135, score))

  return Math.round(score)
}

/**
 * Generate individual box score stats for each player
 * Distributes team points among players based on individual PPG weights
 */
function generateBoxScore(players, teamScore) {
  if (!players || players.length === 0) return []

  // Calculate total PPG for weighting
  const totalPPG = players.reduce((sum, p) => sum + (p.stats?.ppg || 15), 0)

  return players.map(player => {
    const stats = player.stats || { ppg: 15, rpg: 5, apg: 3 }

    // Weight points by player's share of team PPG
    const ppgWeight = stats.ppg / totalPPG
    const basePoints = teamScore * ppgWeight

    // Add some variance to individual performance
    const pointsVariance = randomInRange(-3, 5)
    const points = Math.max(2, Math.round(basePoints + pointsVariance))

    // Rebounds based on RPG ratio with variance
    const rebounds = Math.max(0, Math.round(stats.rpg * randomInRange(0.7, 1.3)))

    // Assists based on APG ratio with variance
    const assists = Math.max(0, Math.round(stats.apg * randomInRange(0.6, 1.2)))

    return {
      characterName: player.characterName || player.character?.name || 'Unknown',
      playerName: player.playerName || player.player?.name || player.name || 'Unknown',
      number: player.number || player.player?.number || '00',
      points,
      rebounds,
      assists,
      // For MVP calculation
      impact: (points * 1.0) + (rebounds * 0.5) + (assists * 0.8)
    }
  })
}

/**
 * Select MVP based on highest game impact
 * Impact formula: (PTS * 1.0) + (REB * 0.5) + (AST * 0.8)
 */
function selectMVP(boxScore) {
  if (!boxScore || boxScore.length === 0) return null

  return boxScore.reduce((mvp, player) =>
    player.impact > (mvp?.impact || 0) ? player : mvp
  , null)
}

// Highlight templates with placeholders
const HIGHLIGHT_TEMPLATES = {
  scoring: [
    "{character} channeled the ancient power of the realm to drain a contested three from beyond the arc!",
    "The legendary {character} rose through the paint like a dragon ascending, throwing down a thunderous dunk!",
    "{character} wove through defenders with mystical agility, finishing with a silky floater!",
    "Like a shadow in the night, {character} emerged for a clutch mid-range jumper!",
    "{character} summoned their inner champion with an and-one finish at the rim!",
    "The warrior {character} powered through the defense for a statement layup!",
    "{character} pulled up from the logo like a sorcerer casting a spell - SPLASH!",
  ],
  playmaking: [
    "{character} orchestrated the offense like a grand strategist, threading a no-look dime!",
    "With the vision of an ancient oracle, {character} found the open warrior for an easy bucket!",
    "{character} commanded the court like royalty, delivering a cross-court laser pass!",
    "The mastermind {character} drew the defense and kicked it out for a wide-open three!",
  ],
  defense: [
    "{character} rose like a guardian titan to swat away the shot attempt!",
    "The sentinel {character} picked the pocket with thief-like precision!",
    "{character} locked down their opponent like a shadow binding spell!",
  ],
  momentum: [
    "The {teamName} went on a devastating 12-0 run!",
    "Momentum shifted as {teamName} found their rhythm!",
    "The crowd erupted as {teamName} pulled away in the final quarter!",
  ]
}

/**
 * Generate narrative highlights for the game
 */
function generateHighlights(userBoxScore, hofBoxScore, userTeamName, userWon) {
  const highlights = []

  // Sort by impact to find key performers
  const userStars = [...userBoxScore].sort((a, b) => b.impact - a.impact)
  const hofStars = [...hofBoxScore].sort((a, b) => b.impact - a.impact)

  // Generate 3-5 highlights
  const numHighlights = Math.floor(randomInRange(3, 6))

  // User team's star player highlight (scoring)
  if (userStars[0]) {
    const template = HIGHLIGHT_TEMPLATES.scoring[Math.floor(Math.random() * HIGHLIGHT_TEMPLATES.scoring.length)]
    highlights.push({
      text: template.replace('{character}', userStars[0].characterName),
      team: 'user',
      type: 'scoring'
    })
  }

  // HOF counter highlight
  if (hofStars[0]) {
    const template = HIGHLIGHT_TEMPLATES.scoring[Math.floor(Math.random() * HIGHLIGHT_TEMPLATES.scoring.length)]
    highlights.push({
      text: template.replace('{character}', hofStars[0].characterName),
      team: 'hof',
      type: 'scoring'
    })
  }

  // Playmaking highlight for second-best user player
  if (userStars[1] && userStars[1].assists >= 3) {
    const template = HIGHLIGHT_TEMPLATES.playmaking[Math.floor(Math.random() * HIGHLIGHT_TEMPLATES.playmaking.length)]
    highlights.push({
      text: template.replace('{character}', userStars[1].characterName),
      team: 'user',
      type: 'playmaking'
    })
  }

  // Defense highlight
  if (userStars[2] && highlights.length < numHighlights) {
    const template = HIGHLIGHT_TEMPLATES.defense[Math.floor(Math.random() * HIGHLIGHT_TEMPLATES.defense.length)]
    highlights.push({
      text: template.replace('{character}', userStars[2].characterName),
      team: 'user',
      type: 'defense'
    })
  }

  // Momentum highlight for winning team
  if (highlights.length < numHighlights) {
    const template = HIGHLIGHT_TEMPLATES.momentum[Math.floor(Math.random() * HIGHLIGHT_TEMPLATES.momentum.length)]
    highlights.push({
      text: template.replace('{teamName}', userWon ? userTeamName : 'Hall of Fame Legends'),
      team: userWon ? 'user' : 'hof',
      type: 'momentum'
    })
  }

  // Shuffle for variety (but keep first highlight from user team)
  const firstHighlight = highlights[0]
  const rest = highlights.slice(1).sort(() => Math.random() - 0.5)
  return [firstHighlight, ...rest]
}

/**
 * Main simulation function
 * @param {Object} params - Simulation parameters
 * @param {Array} params.userLineup - User's lineup with player stats
 * @param {Array} params.hofLineup - Hall of Fame lineup with player stats
 * @param {string} params.userTeamName - User's team name
 * @returns {Object} Simulation results
 */
export function simulateGame({ userLineup, hofLineup, userTeamName }) {
  // Prepare players with stats
  const userPlayers = userLineup.map(item => ({
    characterName: item.character?.name || 'Unknown',
    playerName: item.player?.name || 'Unknown',
    number: item.player?.number || '00',
    stats: item.playerStats || item.player?.stats || { ppg: 15, rpg: 5, apg: 3 }
  }))

  const hofPlayers = hofLineup.map(item => ({
    characterName: item.character?.name || 'Unknown',
    playerName: item.player?.name || 'Unknown',
    number: item.player?.number || '00',
    stats: item.playerStats || item.player?.stats || { ppg: 15, rpg: 5, apg: 3 }
  }))

  // Calculate team stats
  const userStats = calculateTeamStats(userPlayers)
  const hofStats = calculateTeamStats(hofPlayers)

  // Generate scores
  let userScore = calculateScore(userStats)
  let hofScore = calculateScore(hofStats)

  // Ensure no tie (add 1-3 to higher team)
  if (userScore === hofScore) {
    if (Math.random() > 0.5) {
      userScore += Math.floor(randomInRange(1, 4))
    } else {
      hofScore += Math.floor(randomInRange(1, 4))
    }
  }

  const userWon = userScore > hofScore

  // Generate box scores
  const userBoxScore = generateBoxScore(userPlayers, userScore)
  const hofBoxScore = generateBoxScore(hofPlayers, hofScore)

  // Select MVPs
  const userMVP = selectMVP(userBoxScore)
  const hofMVP = selectMVP(hofBoxScore)
  const gameMVP = userWon ? userMVP : (userMVP?.impact > hofMVP?.impact ? userMVP : hofMVP)

  // Generate highlights
  const highlights = generateHighlights(userBoxScore, hofBoxScore, userTeamName, userWon)

  return {
    userScore,
    hofScore,
    userWon,
    userBoxScore,
    hofBoxScore,
    userMVP,
    hofMVP,
    gameMVP,
    highlights,
    userTeamStats: userStats,
    hofTeamStats: hofStats,
  }
}

/**
 * Format stats for display
 */
export function formatTeamStats(stats) {
  return {
    ppg: stats.ppg.toFixed(1),
    rpg: stats.rpg.toFixed(1),
    apg: stats.apg.toFixed(1),
  }
}
