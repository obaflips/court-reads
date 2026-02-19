import { useState, useEffect, useMemo } from 'react'
import { getAllData } from '../api/airtable'
import Navbar from '../components/Navbar'
import { ScoutingReportHeader } from '../components/ScoutingHeader'
import LatestScout from '../components/LatestScout'
import RosterDepthChart from '../components/RosterDepthChart'

// Loading skeleton
function LoadingSkeleton() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Header skeleton */}
        <div className="bg-white border-4 border-emerald-200 rounded-xl p-8 animate-pulse">
          <div className="h-4 bg-emerald-100 rounded w-48 mb-6" />
          <div className="h-16 bg-emerald-100 rounded w-96 mb-4" />
          <div className="h-6 bg-emerald-100 rounded w-64 mb-6" />
          <div className="grid grid-cols-4 gap-3">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-24 bg-emerald-50 rounded-lg" />
            ))}
          </div>
        </div>

        {/* Latest Scout skeleton */}
        <div className="bg-white border-4 border-amber-200 rounded-xl p-8 animate-pulse">
          <div className="h-4 bg-amber-100 rounded w-32 mb-6" />
          <div className="grid grid-cols-3 gap-6">
            <div className="space-y-4">
              <div className="h-12 bg-amber-100 rounded w-full" />
              <div className="h-8 bg-amber-100 rounded w-32" />
            </div>
            <div className="space-y-4">
              <div className="h-32 bg-stone-100 rounded" />
              <div className="h-20 bg-stone-100 rounded" />
            </div>
            <div className="h-48 bg-emerald-50 rounded-lg" />
          </div>
        </div>

        {/* Roster skeleton */}
        <div className="bg-white border-4 border-emerald-200 rounded-xl animate-pulse">
          <div className="h-12 bg-emerald-100" />
          <div className="p-4">
            <div className="h-10 bg-stone-100 rounded-lg mb-4" />
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-16 bg-stone-50 border-t border-stone-100" />
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}

// Error state
function ErrorState({ error }) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="mb-6">
          <svg className="w-24 h-24 mx-auto text-amber-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>

        <h1
          className="text-3xl md:text-4xl font-bold text-emerald-800"
          style={{ fontFamily: 'var(--font-family-impact)' }}
        >
          TECHNICAL FOUL
        </h1>

        <p className="text-stone-600 mt-4">
          Couldn't load the reading list. This might be a connection issue.
        </p>

        <p className="text-red-600 mt-2 text-sm bg-red-50 px-4 py-2 rounded-lg inline-block">
          {error}
        </p>

        <div className="mt-8">
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-emerald-700 text-white font-semibold rounded-lg hover:bg-emerald-800 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    </div>
  )
}

export default function ScoutReports() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')

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

  // Filter books based on search
  const filteredBooks = useMemo(() => {
    if (!data?.books) return []

    let result = [...data.books]

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim()
      result = result.filter(book => {
        if (book.title?.toLowerCase().includes(query)) return true
        if (book.author?.toLowerCase().includes(query)) return true
        if (book.characters?.some(char => char.name?.toLowerCase().includes(query))) return true
        if (book.characters?.some(char => char.player?.name?.toLowerCase().includes(query))) return true
        return false
      })
    }

    return result
  }, [data?.books, searchQuery])

  if (loading) return <LoadingSkeleton />
  if (error) return <ErrorState error={error} />

  const books = data?.books || []
  const latestBook = books[0]
  const totalComps = books.reduce((sum, book) => sum + (book.characters?.length || 0), 0)

  return (
    <div className="min-h-screen hardwood-bg court-lines">
      <Navbar />

      <main className="relative z-10 max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Scouting Report Header */}
        <ScoutingReportHeader books={books} totalComps={totalComps} />

        {/* Latest Scout */}
        {latestBook && <LatestScout book={latestBook} />}

        {/* Roster Depth Chart */}
        <RosterDepthChart
          books={filteredBooks}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />
      </main>
    </div>
  )
}
