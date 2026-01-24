// NBA Stats API integration using balldontlie.io
// Note: API may require key for v2. We'll cache results and use fallbacks.

const CACHE_KEY = 'court-reads-nba-stats'
const CACHE_DURATION = 24 * 60 * 60 * 1000 // 24 hours

// Get cached stats
function getCachedStats() {
  try {
    const cached = localStorage.getItem(CACHE_KEY)
    if (cached) {
      const { data, timestamp } = JSON.parse(cached)
      if (Date.now() - timestamp < CACHE_DURATION) {
        return data
      }
    }
  } catch (e) {
    console.warn('Error reading cached stats:', e)
  }
  return null
}

// Save stats to cache
function setCachedStats(data) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({
      data,
      timestamp: Date.now()
    }))
  } catch (e) {
    console.warn('Error caching stats:', e)
  }
}

// Search for a player by name using balldontlie API
async function searchPlayer(playerName) {
  try {
    const response = await fetch(
      `https://api.balldontlie.io/v1/players?search=${encodeURIComponent(playerName)}`,
      {
        headers: {
          'Accept': 'application/json'
        }
      }
    )

    if (!response.ok) return null

    const data = await response.json()
    return data.data?.[0] || null
  } catch (e) {
    console.warn(`Error searching player ${playerName}:`, e)
    return null
  }
}

// Get season averages for a player
async function getSeasonAverages(playerId, season = 2023) {
  try {
    const response = await fetch(
      `https://api.balldontlie.io/v1/season_averages?season=${season}&player_ids[]=${playerId}`,
      {
        headers: {
          'Accept': 'application/json'
        }
      }
    )

    if (!response.ok) return null

    const data = await response.json()
    return data.data?.[0] || null
  } catch (e) {
    console.warn(`Error fetching stats for player ${playerId}:`, e)
    return null
  }
}

// Fallback stats for known players (used when API is unavailable)
const FALLBACK_STATS = {
  'LeBron James': { ppg: 25.7, rpg: 7.3, apg: 8.3, spg: 1.3, bpg: 0.5, fg_pct: 0.540, per: 26.1 },
  'Stephen Curry': { ppg: 26.4, rpg: 4.5, apg: 5.1, spg: 0.9, bpg: 0.4, fg_pct: 0.453, per: 23.8 },
  'Kevin Durant': { ppg: 29.1, rpg: 6.7, apg: 5.0, spg: 0.7, bpg: 1.4, fg_pct: 0.529, per: 27.3 },
  'Giannis Antetokounmpo': { ppg: 30.4, rpg: 11.5, apg: 5.7, spg: 1.1, bpg: 1.0, fg_pct: 0.553, per: 29.9 },
  'Luka Doncic': { ppg: 32.4, rpg: 8.6, apg: 8.0, spg: 1.4, bpg: 0.5, fg_pct: 0.487, per: 28.7 },
  'Nikola Jokic': { ppg: 26.4, rpg: 12.4, apg: 9.0, spg: 1.3, bpg: 0.7, fg_pct: 0.583, per: 31.3 },
  'Joel Embiid': { ppg: 33.1, rpg: 10.2, apg: 4.2, spg: 1.0, bpg: 1.7, fg_pct: 0.529, per: 31.5 },
  'Jayson Tatum': { ppg: 26.9, rpg: 8.1, apg: 4.4, spg: 1.1, bpg: 0.7, fg_pct: 0.466, per: 23.1 },
  'Anthony Davis': { ppg: 24.7, rpg: 12.6, apg: 2.6, spg: 1.2, bpg: 2.0, fg_pct: 0.563, per: 26.7 },
  'Kawhi Leonard': { ppg: 23.7, rpg: 6.5, apg: 3.9, spg: 1.6, bpg: 0.4, fg_pct: 0.519, per: 24.2 },
  'Damian Lillard': { ppg: 26.3, rpg: 4.4, apg: 7.3, spg: 0.9, bpg: 0.3, fg_pct: 0.463, per: 22.1 },
  'Jimmy Butler': { ppg: 20.8, rpg: 5.3, apg: 5.0, spg: 1.8, bpg: 0.3, fg_pct: 0.538, per: 22.8 },
  'Devin Booker': { ppg: 27.1, rpg: 4.5, apg: 5.5, spg: 0.8, bpg: 0.4, fg_pct: 0.493, per: 20.9 },
  'Trae Young': { ppg: 26.2, rpg: 3.0, apg: 10.8, spg: 1.1, bpg: 0.1, fg_pct: 0.430, per: 21.4 },
  'Ja Morant': { ppg: 26.2, rpg: 5.9, apg: 8.1, spg: 1.1, bpg: 0.3, fg_pct: 0.466, per: 22.0 },
  'Donovan Mitchell': { ppg: 28.3, rpg: 4.2, apg: 4.4, spg: 1.5, bpg: 0.3, fg_pct: 0.449, per: 21.3 },
  'Zion Williamson': { ppg: 26.0, rpg: 7.0, apg: 4.6, spg: 1.1, bpg: 0.6, fg_pct: 0.589, per: 26.0 },
  'Paul George': { ppg: 22.6, rpg: 5.2, apg: 3.5, spg: 1.4, bpg: 0.4, fg_pct: 0.454, per: 18.7 },
  'Kyrie Irving': { ppg: 25.6, rpg: 5.0, apg: 5.2, spg: 1.1, bpg: 0.5, fg_pct: 0.497, per: 22.9 },
  'James Harden': { ppg: 21.0, rpg: 5.1, apg: 10.7, spg: 1.2, bpg: 0.5, fg_pct: 0.441, per: 20.5 },
  'Russell Westbrook': { ppg: 15.9, rpg: 5.7, apg: 4.5, spg: 0.7, bpg: 0.3, fg_pct: 0.421, per: 14.2 },
  'Chris Paul': { ppg: 13.9, rpg: 4.3, apg: 8.9, spg: 1.5, bpg: 0.1, fg_pct: 0.442, per: 18.9 },
  'Draymond Green': { ppg: 8.6, rpg: 7.2, apg: 6.0, spg: 1.0, bpg: 0.8, fg_pct: 0.527, per: 14.2 },
  'Bam Adebayo': { ppg: 19.3, rpg: 10.4, apg: 3.2, spg: 1.2, bpg: 0.8, fg_pct: 0.541, per: 19.8 },
  'Rudy Gobert': { ppg: 14.0, rpg: 12.9, apg: 1.4, spg: 0.6, bpg: 1.9, fg_pct: 0.662, per: 19.1 },
  'Marcus Smart': { ppg: 11.5, rpg: 3.1, apg: 6.3, spg: 1.5, bpg: 0.3, fg_pct: 0.417, per: 13.1 },
  'Klay Thompson': { ppg: 17.9, rpg: 3.3, apg: 2.3, spg: 0.6, bpg: 0.4, fg_pct: 0.438, per: 14.7 },
  'DeMar DeRozan': { ppg: 24.5, rpg: 4.3, apg: 5.1, spg: 1.0, bpg: 0.3, fg_pct: 0.502, per: 21.2 },
  'Pascal Siakam': { ppg: 21.5, rpg: 7.5, apg: 5.8, spg: 0.6, bpg: 0.7, fg_pct: 0.473, per: 18.4 },
  'Jalen Brunson': { ppg: 28.7, rpg: 3.6, apg: 6.7, spg: 0.9, bpg: 0.2, fg_pct: 0.479, per: 22.5 },
  'Tyrese Haliburton': { ppg: 20.1, rpg: 3.9, apg: 10.9, spg: 1.2, bpg: 0.5, fg_pct: 0.476, per: 21.0 },
  'Shai Gilgeous-Alexander': { ppg: 31.4, rpg: 5.5, apg: 6.2, spg: 2.0, bpg: 0.9, fg_pct: 0.535, per: 29.2 },
  'De\'Aaron Fox': { ppg: 26.6, rpg: 4.5, apg: 5.6, spg: 2.0, bpg: 0.4, fg_pct: 0.510, per: 21.7 },
  'Jaren Jackson Jr.': { ppg: 22.3, rpg: 5.8, apg: 2.0, spg: 1.0, bpg: 3.0, fg_pct: 0.494, per: 20.8 },
  'Mikal Bridges': { ppg: 19.9, rpg: 4.5, apg: 3.3, spg: 1.1, bpg: 0.4, fg_pct: 0.447, per: 15.0 },
  'Victor Wembanyama': { ppg: 21.4, rpg: 10.6, apg: 3.9, spg: 1.2, bpg: 3.6, fg_pct: 0.465, per: 23.0 },
}

// Calculate a simplified PER (Player Efficiency Rating) approximation
function calculatePER(stats) {
  if (!stats) return 0
  // Simplified PER formula based on available stats
  const { ppg = 0, rpg = 0, apg = 0, spg = 0, bpg = 0, fg_pct = 0 } = stats
  return (ppg * 1.0) + (rpg * 0.7) + (apg * 1.0) + (spg * 1.5) + (bpg * 1.5) + (fg_pct * 10)
}

// Get stats for a player (from cache, API, or fallback)
export async function getPlayerStats(playerName) {
  // Check cache first
  const cached = getCachedStats()
  if (cached?.[playerName]) {
    return cached[playerName]
  }

  // Check fallback data
  const fallbackKey = Object.keys(FALLBACK_STATS).find(
    key => key.toLowerCase() === playerName.toLowerCase()
  )

  if (fallbackKey) {
    const stats = FALLBACK_STATS[fallbackKey]
    return {
      ...stats,
      per: stats.per || calculatePER(stats)
    }
  }

  // Try API (may not work without key)
  try {
    const player = await searchPlayer(playerName)
    if (player?.id) {
      const seasonStats = await getSeasonAverages(player.id)
      if (seasonStats) {
        const stats = {
          ppg: seasonStats.pts || 0,
          rpg: seasonStats.reb || 0,
          apg: seasonStats.ast || 0,
          spg: seasonStats.stl || 0,
          bpg: seasonStats.blk || 0,
          fg_pct: seasonStats.fg_pct || 0,
          per: calculatePER({
            ppg: seasonStats.pts,
            rpg: seasonStats.reb,
            apg: seasonStats.ast,
            spg: seasonStats.stl,
            bpg: seasonStats.blk,
            fg_pct: seasonStats.fg_pct
          })
        }

        // Cache the result
        const allCached = getCachedStats() || {}
        allCached[playerName] = stats
        setCachedStats(allCached)

        return stats
      }
    }
  } catch (e) {
    console.warn(`Could not fetch stats for ${playerName}:`, e)
  }

  // Return generic stats if nothing else works
  return {
    ppg: 15.0,
    rpg: 5.0,
    apg: 3.0,
    spg: 1.0,
    bpg: 0.5,
    fg_pct: 0.450,
    per: 15.0
  }
}

// Get stats for multiple players
export async function getPlayersStats(players) {
  const statsPromises = players.map(async (player) => {
    const stats = await getPlayerStats(player.name)
    return { ...player, stats }
  })

  return Promise.all(statsPromises)
}

// Generate lineups based on stats
export function generateLineups(booksWithStats) {
  // Filter books that have player comps with stats
  const validBooks = booksWithStats.filter(book => {
    const player = book.characters?.[0]?.player
    return player && player.stats
  })

  if (validBooks.length === 0) return { allNba: [], allOffense: [], allDefense: [] }

  // Sort for All-NBA (by PER)
  const sortedByPER = [...validBooks].sort((a, b) => {
    const perA = a.characters[0].player.stats?.per || 0
    const perB = b.characters[0].player.stats?.per || 0
    return perB - perA
  })

  // Sort for All-Offense (by PPG)
  const sortedByPPG = [...validBooks].sort((a, b) => {
    const ppgA = a.characters[0].player.stats?.ppg || 0
    const ppgB = b.characters[0].player.stats?.ppg || 0
    return ppgB - ppgA
  })

  // Sort for All-Defense (by combined SPG + BPG)
  const sortedByDefense = [...validBooks].sort((a, b) => {
    const defA = (a.characters[0].player.stats?.spg || 0) + (a.characters[0].player.stats?.bpg || 0)
    const defB = (b.characters[0].player.stats?.spg || 0) + (b.characters[0].player.stats?.bpg || 0)
    return defB - defA
  })

  return {
    allNba: sortedByPER.slice(0, 5),
    allOffense: sortedByPPG.slice(0, 5),
    allDefense: sortedByDefense.slice(0, 5)
  }
}
