import { useState, useEffect, useMemo } from 'react'
import { getAllData } from '../api/airtable'
import Header from '../components/Header'
import Stats from '../components/Stats'
import LatestRead from '../components/LatestRead'
import RosterTable from '../components/RosterTable'
import SearchFilterBar from '../components/SearchFilterBar'
import AutoLineups from '../components/AutoLineups'
import { SkeletonStats, SkeletonLatestRead, SkeletonTable } from '../components/Skeleton'

export default function Home() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Search and filter state
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('recent')
  const [ratingFilter, setRatingFilter] = useState('')
  const [positionFilter, setPositionFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

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

  // Filter and sort books
  const filteredBooks = useMemo(() => {
    if (!data?.books) return []

    let result = [...data.books]

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim()
      result = result.filter(book => {
        // Search in title
        if (book.title?.toLowerCase().includes(query)) return true
        // Search in author
        if (book.author?.toLowerCase().includes(query)) return true
        // Search in character names
        if (book.characters?.some(char => char.name?.toLowerCase().includes(query))) return true
        // Search in player names
        if (book.characters?.some(char => char.player?.name?.toLowerCase().includes(query))) return true
        return false
      })
    }

    // Rating filter
    if (ratingFilter) {
      const targetRating = parseInt(ratingFilter, 10)
      result = result.filter(book => book.rating === targetRating)
    }

    // Position filter
    if (positionFilter) {
      result = result.filter(book => {
        const mainPlayer = book.characters?.[0]?.player
        if (!mainPlayer?.position) return false
        return mainPlayer.position.toUpperCase().includes(positionFilter)
      })
    }

    // Status filter
    if (statusFilter === 'with-comps') {
      result = result.filter(book => book.characters?.some(char => char.player))
    } else if (statusFilter === 'without-comps') {
      result = result.filter(book => !book.characters?.some(char => char.player))
    }

    // Sort
    switch (sortBy) {
      case 'recent':
        result.sort((a, b) => new Date(b.dateFinished || 0) - new Date(a.dateFinished || 0))
        break
      case 'oldest':
        result.sort((a, b) => new Date(a.dateFinished || 0) - new Date(b.dateFinished || 0))
        break
      case 'highest':
        result.sort((a, b) => (b.rating || 0) - (a.rating || 0))
        break
      case 'lowest':
        result.sort((a, b) => (a.rating || 0) - (b.rating || 0))
        break
      case 'az':
        result.sort((a, b) => (a.title || '').localeCompare(b.title || ''))
        break
      case 'za':
        result.sort((a, b) => (b.title || '').localeCompare(a.title || ''))
        break
      default:
        break
    }

    return result
  }, [data?.books, searchQuery, sortBy, ratingFilter, positionFilter, statusFilter])

  if (loading) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="pb-16">
          <SkeletonStats />
          <SkeletonLatestRead />
          <div className="max-w-6xl mx-auto px-4 my-8">
            <div className="h-12 bg-sonics-green/20 rounded-xl animate-pulse mb-6" />
          </div>
          <div className="max-w-6xl mx-auto px-4">
            <div className="h-6 bg-sonics-green/20 rounded w-32 mb-6 animate-pulse" />
            <SkeletonTable rows={6} />
          </div>
        </main>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          {/* Error Icon */}
          <div className="mb-6">
            <svg className="w-24 h-24 mx-auto text-sonics-gold/70" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>

          <h1
            className="text-3xl md:text-4xl font-bold text-sonics-gold"
            style={{ fontFamily: 'var(--font-family-display)' }}
          >
            TECHNICAL FOUL
          </h1>

          <p className="text-gray-400 mt-4">
            We couldn't load the roster. This might be a connection issue or a problem with our data source.
          </p>

          <p className="text-red-400/80 mt-2 text-sm bg-red-950/30 px-4 py-2 rounded-lg inline-block">
            {error}
          </p>

          <div className="flex flex-col gap-3 mt-8">
            <button
              onClick={() => window.location.reload()}
              className="w-full px-6 py-3 bg-sonics-gold text-sonics-dark font-semibold rounded-lg hover:bg-sonics-gold/90 transition-colors focus:outline-none focus:ring-2 focus:ring-sonics-gold focus:ring-offset-2 focus:ring-offset-sonics-dark"
            >
              Try Again
            </button>

            <details className="text-left mt-4">
              <summary className="text-gray-500 text-sm cursor-pointer hover:text-gray-400 transition-colors">
                Troubleshooting tips
              </summary>
              <ul className="mt-3 text-gray-500 text-sm space-y-2 pl-4">
                <li>• Check your internet connection</li>
                <li>• Verify the Airtable API key in .env file</li>
                <li>• Make sure the Airtable base ID is correct</li>
                <li>• Try refreshing the page</li>
              </ul>
            </details>
          </div>
        </div>
      </div>
    )
  }

  const books = data?.books || []
  const latestBook = books[0]
  const totalComps = books.reduce((sum, book) => sum + (book.characters?.length || 0), 0)

  const hasActiveFilters = searchQuery || ratingFilter || positionFilter || statusFilter || sortBy !== 'recent'

  return (
    <div className="min-h-screen">
      <Header />
      <main className="pb-16">
        <Stats books={books} totalComps={totalComps} />
        <LatestRead book={latestBook} />

        {/* Search, Filter, Sort */}
        <SearchFilterBar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          sortBy={sortBy}
          setSortBy={setSortBy}
          ratingFilter={ratingFilter}
          setRatingFilter={setRatingFilter}
          positionFilter={positionFilter}
          setPositionFilter={setPositionFilter}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          totalBooks={books.length}
          filteredCount={filteredBooks.length}
        />

        {/* Results */}
        {filteredBooks.length > 0 ? (
          <RosterTable books={filteredBooks} />
        ) : (
          <div className="max-w-6xl mx-auto px-4 my-12">
            <div className="text-center py-16 border border-sonics-green/30 rounded-xl bg-sonics-green/5">
              <svg
                className="w-16 h-16 mx-auto text-gray-600 mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <h3
                className="text-xl font-bold text-gray-400 mb-2"
                style={{ fontFamily: 'var(--font-family-display)' }}
              >
                No Books Found
              </h3>
              <p className="text-gray-500 mb-4">
                Try adjusting your search or filters
              </p>
              {hasActiveFilters && (
                <button
                  onClick={() => {
                    setSearchQuery('')
                    setRatingFilter('')
                    setPositionFilter('')
                    setStatusFilter('')
                    setSortBy('recent')
                  }}
                  className="text-sonics-green hover:text-sonics-gold transition-colors underline"
                >
                  Clear all filters
                </button>
              )}
            </div>
          </div>
        )}

        {/* Auto-Generated Lineups */}
        <AutoLineups books={books} />
      </main>
      <footer className="border-t border-sonics-green/20 py-8 text-center text-gray-500 text-sm">
        <p>Where fantasy meets the hardwood</p>
      </footer>
    </div>
  )
}
