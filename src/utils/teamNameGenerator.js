// Team Name Generator - Creates epic fantasy basketball team names from book titles

// Power words commonly found in fantasy book titles
const POWER_WORDS = [
  'Kingdom', 'Shadow', 'Dragon', 'Storm', 'Fire', 'Ice', 'Blood', 'Night',
  'Crown', 'Throne', 'Sword', 'Magic', 'Dark', 'Light', 'Star', 'Moon',
  'Sun', 'Phoenix', 'Wolf', 'Raven', 'Eagle', 'Lion', 'Bear', 'Serpent',
  'Frost', 'Flame', 'Thunder', 'Wind', 'Stone', 'Iron', 'Steel', 'Gold',
  'Silver', 'Crystal', 'Ember', 'Ash', 'Bone', 'Spirit', 'Soul', 'Titan',
  'Giant', 'Warrior', 'Knight', 'King', 'Queen', 'Prince', 'Lord', 'Lady',
  'Wizard', 'Witch', 'Mage', 'Sorcerer', 'Hunter', 'Assassin', 'Thief',
  'Champion', 'Legend', 'Myth', 'Oracle', 'Prophet', 'Guardian', 'Sentinel'
]

// Words to skip when extracting from titles
const SKIP_WORDS = [
  'the', 'a', 'an', 'of', 'and', 'or', 'in', 'on', 'at', 'to', 'for',
  'with', 'by', 'from', 'as', 'is', 'it', 'that', 'this', 'be', 'are',
  'was', 'were', 'been', 'being', 'have', 'has', 'had', 'do', 'does',
  'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must',
  'book', 'part', 'volume', 'series', 'chapter', 'novel'
]

// City/Realm prefixes for team names
const REALMS = [
  'Midnight', 'Shadow', 'Crystal', 'Ember', 'Frost', 'Thunder', 'Storm',
  'Golden', 'Silver', 'Iron', 'Dark', 'Light', 'Ancient', 'Eternal',
  'Savage', 'Silent', 'Crimson', 'Azure', 'Obsidian', 'Jade'
]

// Fallback team name suffixes if no good words found
const FALLBACK_SUFFIXES = [
  'Dragons', 'Warriors', 'Knights', 'Titans', 'Legends', 'Champions',
  'Guardians', 'Ravens', 'Wolves', 'Phoenix', 'Storm', 'Thunder'
]

/**
 * Extract epic/power words from a book title
 * @param {string} title - Book title
 * @returns {string[]} Array of extracted power words
 */
function extractPowerWords(title) {
  if (!title) return []

  const words = title
    .replace(/[^a-zA-Z\s]/g, '') // Remove punctuation
    .split(/\s+/)
    .filter(word => word.length > 2)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())

  const extracted = []

  for (const word of words) {
    const lowerWord = word.toLowerCase()

    // Skip common words
    if (SKIP_WORDS.includes(lowerWord)) continue

    // Check if it's a power word or sounds epic (5+ letters, not common)
    const isPowerWord = POWER_WORDS.some(pw => pw.toLowerCase() === lowerWord)
    const isEpicSounding = word.length >= 5 && !SKIP_WORDS.includes(lowerWord)

    if (isPowerWord || isEpicSounding) {
      extracted.push(word)
    }
  }

  return extracted
}

/**
 * Make a word plural for team name
 * @param {string} word - Word to pluralize
 * @returns {string} Pluralized word
 */
function pluralize(word) {
  if (!word) return word

  // Words that don't need pluralization or have special forms
  const irregular = {
    'phoenix': 'Phoenix',
    'thunder': 'Thunder',
    'storm': 'Storm',
    'fire': 'Fire',
    'ice': 'Ice',
    'magic': 'Magic',
    'light': 'Light',
    'dark': 'Dark',
    'frost': 'Frost',
    'flame': 'Flame',
    'blood': 'Blood',
    'wind': 'Wind'
  }

  const lowerWord = word.toLowerCase()
  if (irregular[lowerWord]) {
    return irregular[lowerWord]
  }

  // Standard pluralization rules
  if (word.endsWith('s') || word.endsWith('x') || word.endsWith('ch') || word.endsWith('sh')) {
    return word + 'es'
  }
  if (word.endsWith('y') && !['a', 'e', 'i', 'o', 'u'].includes(word[word.length - 2]?.toLowerCase())) {
    return word.slice(0, -1) + 'ies'
  }
  if (word.endsWith('f')) {
    return word.slice(0, -1) + 'ves'
  }
  if (word.endsWith('fe')) {
    return word.slice(0, -2) + 'ves'
  }

  return word + 's'
}

/**
 * Generate a team name from a lineup of books
 * @param {Array} lineup - Array of lineup items with book data
 * @returns {string} Generated team name
 */
export function generateTeamName(lineup) {
  if (!lineup || lineup.length === 0) {
    return 'The Court Readers'
  }

  // Extract power words from all book titles
  const allPowerWords = []

  for (const item of lineup) {
    const title = item.book?.title || ''
    const extracted = extractPowerWords(title)
    allPowerWords.push(...extracted)
  }

  // Remove duplicates and shuffle
  const uniqueWords = [...new Set(allPowerWords)]
  const shuffled = uniqueWords.sort(() => Math.random() - 0.5)

  // Pick a realm prefix (random)
  const realm = REALMS[Math.floor(Math.random() * REALMS.length)]

  // Pick the team suffix from extracted words or fallback
  let suffix
  if (shuffled.length > 0) {
    // Prefer words that sound good as team names (nouns typically)
    const goodSuffix = shuffled.find(word => {
      const lower = word.toLowerCase()
      return POWER_WORDS.some(pw => pw.toLowerCase() === lower)
    }) || shuffled[0]

    suffix = pluralize(goodSuffix)
  } else {
    suffix = FALLBACK_SUFFIXES[Math.floor(Math.random() * FALLBACK_SUFFIXES.length)]
  }

  return `The ${realm} ${suffix}`
}

/**
 * Generate multiple team name options
 * @param {Array} lineup - Array of lineup items with book data
 * @param {number} count - Number of options to generate
 * @returns {string[]} Array of team name options
 */
export function generateTeamNameOptions(lineup, count = 3) {
  const options = new Set()

  // Generate enough unique names
  let attempts = 0
  while (options.size < count && attempts < count * 3) {
    options.add(generateTeamName(lineup))
    attempts++
  }

  return [...options]
}
