const API_KEY = import.meta.env.VITE_AIRTABLE_API_KEY
const BASE_ID = import.meta.env.VITE_AIRTABLE_BASE_ID
const BASE_URL = `https://api.airtable.com/v0/${BASE_ID}`

async function fetchTable(tableName, options = {}) {
  const params = new URLSearchParams()

  if (options.sort) {
    options.sort.forEach((s, i) => {
      params.append(`sort[${i}][field]`, s.field)
      params.append(`sort[${i}][direction]`, s.direction || 'asc')
    })
  }

  if (options.maxRecords) {
    params.append('maxRecords', options.maxRecords)
  }

  const url = `${BASE_URL}/${encodeURIComponent(tableName)}?${params.toString()}`

  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    throw new Error(`Airtable API error: ${response.status}`)
  }

  const data = await response.json()
  return data.records
}

export async function getBooks() {
  const records = await fetchTable('Books', {
    sort: [{ field: 'Date Finished', direction: 'desc' }]
  })

  return records.map(record => ({
    id: record.id,
    title: record.fields['Title'],
    author: record.fields['Author'],
    rating: record.fields['Rating'],
    dateFinished: record.fields['Date Finished'],
    seriesPosition: record.fields['Series Position'],
    coverUrl: record.fields['Cover URL'],
    purchaseUrl: record.fields['Purchase URL'],
    characterIds: record.fields['Characters'] || [],
    seriesId: record.fields['Series']?.[0],
  }))
}

export async function getCharacters() {
  const records = await fetchTable('Characters')

  return records.map(record => ({
    id: record.id,
    name: record.fields['Name'],
    description: record.fields['Description'],
    bookId: record.fields['Book']?.[0],
    playerId: record.fields['Player']?.[0],
    tagline: record.fields['Tagline'],
  }))
}

export async function getPlayers() {
  const records = await fetchTable('Players')

  return records.map(record => ({
    id: record.id,
    name: record.fields['Name'],
    number: record.fields['Number'],
    currentTeam: record.fields['Current Team'],
    position: record.fields['Position'],
    videoUrl: record.fields['Video URL'],
  }))
}

export async function getSeries() {
  const records = await fetchTable('Series')

  return records.map(record => ({
    id: record.id,
    name: record.fields['Name'],
    teamName: record.fields['Team Name'],
    totalBooks: record.fields['Total Books'],
  }))
}

export async function getAllData() {
  const [books, characters, players, series] = await Promise.all([
    getBooks(),
    getCharacters(),
    getPlayers(),
    getSeries(),
  ])

  // Link characters with their players and books
  const enrichedBooks = books.map(book => {
    const bookCharacters = characters
      .filter(c => c.bookId === book.id)
      .map(char => ({
        ...char,
        player: players.find(p => p.id === char.playerId),
      }))

    const bookSeries = series.find(s => s.id === book.seriesId)

    return {
      ...book,
      characters: bookCharacters,
      series: bookSeries,
    }
  })

  return {
    books: enrichedBooks,
    characters,
    players,
    series,
  }
}
