import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getAllData } from '../api/airtable'
import RatingBackboards from './RatingBackboards'

export default function SurpriseModal({ isOpen, onClose }) {
  const [books, setBooks] = useState([])
  const [isAnimating, setIsAnimating] = useState(true)
  const [selectedBook, setSelectedBook] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  // Fetch books when modal opens
  useEffect(() => {
    if (isOpen && books.length === 0) {
      setIsLoading(true)
      getAllData()
        .then(data => {
          setBooks(data.books || [])
          setIsLoading(false)
        })
        .catch(err => {
          console.error('Error fetching books:', err)
          setIsLoading(false)
        })
    }
  }, [isOpen])

  const selectRandomBook = () => {
    if (!books || books.length === 0) return
    const randomIndex = Math.floor(Math.random() * books.length)
    setSelectedBook(books[randomIndex])
  }

  const handleSurprise = () => {
    setIsAnimating(true)
    setSelectedBook(null)
    setTimeout(() => {
      selectRandomBook()
      setIsAnimating(false)
    }, 1500)
  }

  // Trigger animation when modal opens and data is loaded
  useEffect(() => {
    if (isOpen && !isLoading && books.length > 0) {
      handleSurprise()
    }
  }, [isOpen, isLoading, books.length])

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setIsAnimating(true)
      setSelectedBook(null)
    }
  }, [isOpen])

  if (!isOpen) return null

  const mainCharacter = selectedBook?.characters?.[0]
  const player = mainCharacter?.player

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="surprise-modal-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto bg-gradient-to-br from-sonics-dark via-sonics-green/20 to-sonics-dark border-2 border-sonics-green rounded-2xl shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-black/30 text-gray-400 hover:text-white hover:bg-black/50 transition-colors focus:outline-none focus:ring-2 focus:ring-sonics-gold"
          aria-label="Close modal"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {isLoading || isAnimating ? (
          /* Animation State */
          <div className="p-8 py-16 flex flex-col items-center justify-center min-h-[400px]">
            {/* Basketball Animation */}
            <div className="relative w-48 h-48 mb-6">
              {/* Hoop/Backboard */}
              <svg className="absolute bottom-0 left-1/2 -translate-x-1/2 w-32 h-24" viewBox="0 0 100 75">
                {/* Backboard */}
                <rect x="20" y="0" width="60" height="8" fill="#FFC200" rx="1" />
                {/* Rim */}
                <ellipse cx="50" cy="20" rx="18" ry="6" fill="none" stroke="#ff6b35" strokeWidth="3" />
                {/* Net */}
                <path d="M32 22 L38 45 M42 24 L44 50 M50 26 L50 55 M58 24 L56 50 M68 22 L62 45"
                      stroke="#ccc" strokeWidth="1.5" opacity="0.7" />
              </svg>

              {/* Basketball - Animated */}
              <div className="absolute animate-bounce-dunk">
                <svg className="w-16 h-16" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="45" fill="#ff6b35" />
                  <path d="M50 5 Q50 50 50 95" stroke="#333" strokeWidth="2" fill="none" />
                  <path d="M5 50 Q50 50 95 50" stroke="#333" strokeWidth="2" fill="none" />
                  <path d="M15 20 Q50 35 85 20" stroke="#333" strokeWidth="2" fill="none" />
                  <path d="M15 80 Q50 65 85 80" stroke="#333" strokeWidth="2" fill="none" />
                </svg>
              </div>

              {/* Player Silhouette - Animated */}
              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-jump">
                <svg className="w-20 h-32" viewBox="0 0 60 100">
                  {/* Head */}
                  <circle cx="30" cy="12" r="10" fill="#00653A" />
                  {/* Body */}
                  <rect x="22" y="22" width="16" height="25" rx="3" fill="#00653A" />
                  {/* Arms raised */}
                  <path d="M22 25 L8 10" stroke="#00653A" strokeWidth="6" strokeLinecap="round" />
                  <path d="M38 25 L52 10" stroke="#00653A" strokeWidth="6" strokeLinecap="round" />
                  {/* Legs */}
                  <path d="M26 47 L20 75" stroke="#00653A" strokeWidth="6" strokeLinecap="round" />
                  <path d="M34 47 L40 75" stroke="#00653A" strokeWidth="6" strokeLinecap="round" />
                </svg>
              </div>
            </div>

            <div
              className="text-2xl font-bold text-sonics-gold animate-pulse"
              style={{ fontFamily: 'var(--font-family-display)' }}
            >
              FINDING YOUR NEXT READ...
            </div>
          </div>
        ) : selectedBook ? (
          /* Result State */
          <div className="p-6 md:p-8">
            <div className="text-center mb-6">
              <div
                className="text-sm text-sonics-green uppercase tracking-widest mb-2"
              >
                Your Random Pick
              </div>
              <div
                id="surprise-modal-title"
                className="text-2xl font-bold text-sonics-gold"
                style={{ fontFamily: 'var(--font-family-display)' }}
              >
                SURPRISE!
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-6">
              {/* Book Cover */}
              <div className="flex-shrink-0 mx-auto sm:mx-0">
                {selectedBook.coverUrl ? (
                  <img
                    src={selectedBook.coverUrl}
                    alt={selectedBook.title}
                    className="w-32 h-48 object-cover rounded-lg shadow-xl border border-sonics-green/30"
                  />
                ) : (
                  <div className="w-32 h-48 bg-sonics-green/20 rounded-lg flex items-center justify-center">
                    <span className="text-sonics-green/50 text-sm">No Cover</span>
                  </div>
                )}
              </div>

              {/* Book Info */}
              <div className="flex-1 text-center sm:text-left">
                <h3
                  className="text-xl md:text-2xl font-bold text-white"
                  style={{ fontFamily: 'var(--font-family-display)' }}
                >
                  {selectedBook.title}
                </h3>
                <p className="text-gray-400 mt-1">by {selectedBook.author}</p>

                <div className="mt-3">
                  <RatingBackboards rating={selectedBook.rating} />
                </div>

                {/* Player Comp */}
                {mainCharacter && player && (
                  <div className="mt-4 pt-4 border-t border-sonics-green/20">
                    <div
                      className="text-lg text-sonics-gold font-semibold"
                      style={{ fontFamily: 'var(--font-family-display)' }}
                    >
                      {mainCharacter.name} <span className="text-gray-500">is</span> {player.name}
                    </div>
                    {mainCharacter.tagline && (
                      <p className="text-gray-400 mt-1 italic text-sm">"{mainCharacter.tagline}"</p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 mt-8">
              <Link
                to={`/book/${selectedBook.id}`}
                onClick={onClose}
                className="flex-1 text-center px-6 py-3 bg-sonics-gold text-sonics-dark font-semibold rounded-lg hover:bg-sonics-gold/90 transition-colors focus:outline-none focus:ring-2 focus:ring-sonics-gold focus:ring-offset-2 focus:ring-offset-sonics-dark"
              >
                Read More
              </Link>
              <button
                onClick={handleSurprise}
                className="flex-1 px-6 py-3 border border-sonics-green text-sonics-green font-semibold rounded-lg hover:bg-sonics-green/10 transition-colors focus:outline-none focus:ring-2 focus:ring-sonics-green focus:ring-offset-2 focus:ring-offset-sonics-dark"
              >
                Show Me Another
              </button>
            </div>
          </div>
        ) : (
          /* No books state */
          <div className="p-8 text-center min-h-[300px] flex items-center justify-center">
            <p className="text-gray-400">No books available</p>
          </div>
        )}
      </div>
    </div>
  )
}
