import { useState, useRef, useEffect } from 'react'

const SORT_OPTIONS = [
  { value: 'recent', label: 'Most Recent' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'highest', label: 'Highest Rated' },
  { value: 'lowest', label: 'Lowest Rated' },
  { value: 'az', label: 'Title A-Z' },
  { value: 'za', label: 'Title Z-A' },
]

const RATING_OPTIONS = [
  { value: '', label: 'All Ratings' },
  { value: '5', label: '5 Stars' },
  { value: '4', label: '4 Stars' },
  { value: '3', label: '3 Stars' },
  { value: '2', label: '2 Stars' },
  { value: '1', label: '1 Star' },
]

const POSITION_OPTIONS = [
  { value: '', label: 'All Positions' },
  { value: 'PG', label: 'Point Guard (PG)' },
  { value: 'SG', label: 'Shooting Guard (SG)' },
  { value: 'SF', label: 'Small Forward (SF)' },
  { value: 'PF', label: 'Power Forward (PF)' },
  { value: 'C', label: 'Center (C)' },
]

const STATUS_OPTIONS = [
  { value: '', label: 'All Books' },
  { value: 'with-comps', label: 'With Player Comps' },
  { value: 'without-comps', label: 'Without Comps' },
]

function Dropdown({ label, value, options, onChange }) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)
  const buttonRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    function handleEscape(event) {
      if (event.key === 'Escape') {
        setIsOpen(false)
        buttonRef.current?.focus()
      }
    }

    if (isOpen) {
      // Use setTimeout to avoid immediate trigger on the same click
      const timer = setTimeout(() => {
        document.addEventListener('click', handleClickOutside)
        document.addEventListener('keydown', handleEscape)
      }, 0)
      return () => {
        clearTimeout(timer)
        document.removeEventListener('click', handleClickOutside)
        document.removeEventListener('keydown', handleEscape)
      }
    }
  }, [isOpen])

  const selectedOption = options.find(opt => opt.value === value)
  const displayLabel = value ? selectedOption?.label : label

  const handleOptionClick = (optionValue) => {
    onChange(optionValue)
    setIsOpen(false)
  }

  const handleKeyDown = (event, optionValue) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      handleOptionClick(optionValue)
    }
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        className={`px-3 sm:px-4 py-2 rounded-lg border transition-all flex items-center gap-1 sm:gap-2 text-xs sm:text-sm whitespace-nowrap ${
          value
            ? 'border-sonics-gold bg-sonics-gold/10 text-sonics-gold'
            : 'border-sonics-green/30 bg-sonics-green/5 text-gray-300 hover:border-sonics-green/50'
        } focus:outline-none focus:ring-2 focus:ring-sonics-gold focus:ring-offset-1 focus:ring-offset-sonics-dark`}
      >
        <span className="truncate max-w-[100px] sm:max-w-none">{displayLabel}</span>
        <svg
          className={`w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div
          role="listbox"
          className="absolute top-full left-0 mt-2 w-48 bg-sonics-dark border border-sonics-green/30 rounded-lg shadow-xl z-50 overflow-hidden max-h-64 overflow-y-auto"
        >
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              role="option"
              aria-selected={value === option.value}
              onClick={() => handleOptionClick(option.value)}
              onKeyDown={(e) => handleKeyDown(e, option.value)}
              className={`w-full px-4 py-2.5 text-left text-sm transition-colors ${
                value === option.value
                  ? 'bg-sonics-green/20 text-sonics-gold'
                  : 'text-gray-300 hover:bg-sonics-green/10'
              } focus:outline-none focus:bg-sonics-green/20`}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default function SearchFilterBar({
  searchQuery,
  setSearchQuery,
  sortBy,
  setSortBy,
  ratingFilter,
  setRatingFilter,
  positionFilter,
  setPositionFilter,
  statusFilter,
  setStatusFilter,
  totalBooks,
  filteredCount,
}) {
  const activeFilterCount = [ratingFilter, positionFilter, statusFilter].filter(Boolean).length

  const clearAllFilters = () => {
    setSearchQuery('')
    setRatingFilter('')
    setPositionFilter('')
    setStatusFilter('')
    setSortBy('recent')
  }

  const hasActiveFilters = searchQuery || activeFilterCount > 0 || sortBy !== 'recent'

  return (
    <div className="max-w-6xl mx-auto px-4 my-8">
      {/* Search Bar */}
      <div className="relative mb-4">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search books, authors, characters, players..."
          className="w-full pl-12 pr-12 py-3 bg-sonics-dark border border-sonics-green/30 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-sonics-green focus:ring-1 focus:ring-sonics-green transition-colors"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Filters Row */}
      <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-4">
        {/* Sort Dropdown */}
        <Dropdown
          label="Sort"
          value={sortBy}
          options={SORT_OPTIONS}
          onChange={setSortBy}
        />

        {/* Rating Filter */}
        <Dropdown
          label="Rating"
          value={ratingFilter}
          options={RATING_OPTIONS}
          onChange={setRatingFilter}
        />

        {/* Position Filter - hide label on mobile */}
        <Dropdown
          label="Position"
          value={positionFilter}
          options={POSITION_OPTIONS}
          onChange={setPositionFilter}
        />

        {/* Status Filter */}
        <Dropdown
          label="Status"
          value={statusFilter}
          options={STATUS_OPTIONS}
          onChange={setStatusFilter}
        />

        {/* Active Filters Indicator & Clear */}
        {hasActiveFilters && (
          <div className="flex items-center gap-2 w-full sm:w-auto sm:ml-auto mt-2 sm:mt-0">
            {activeFilterCount > 0 && (
              <span className="text-sm text-sonics-gold">
                {activeFilterCount} filter{activeFilterCount !== 1 ? 's' : ''} active
              </span>
            )}
            <button
              type="button"
              onClick={clearAllFilters}
              className="text-sm text-gray-400 hover:text-white transition-colors underline focus:outline-none focus:ring-2 focus:ring-sonics-gold rounded"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* Results Count */}
      <div className="text-sm text-gray-500">
        Showing <span className="text-white font-medium">{filteredCount}</span> of{' '}
        <span className="text-white font-medium">{totalBooks}</span> books
      </div>
    </div>
  )
}
