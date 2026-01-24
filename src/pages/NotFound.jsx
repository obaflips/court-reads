import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        {/* Basketball going off-court illustration */}
        <div className="relative mb-8">
          <svg className="w-32 h-32 mx-auto text-sonics-green/50" viewBox="0 0 100 100">
            {/* Out of bounds line */}
            <line x1="10" y1="85" x2="90" y2="85" stroke="currentColor" strokeWidth="3" strokeDasharray="8,4" />
            {/* Basketball bouncing out */}
            <g className="animate-bounce">
              <circle cx="70" cy="45" r="18" fill="#ff6b35" />
              <path d="M70 27 Q70 45 70 63" stroke="#333" strokeWidth="1.5" fill="none" />
              <path d="M52 45 Q70 45 88 45" stroke="#333" strokeWidth="1.5" fill="none" />
              <path d="M56 33 Q70 40 84 33" stroke="#333" strokeWidth="1.5" fill="none" />
              <path d="M56 57 Q70 50 84 57" stroke="#333" strokeWidth="1.5" fill="none" />
            </g>
            {/* Motion lines */}
            <path d="M35 60 L45 50" stroke="currentColor" strokeWidth="2" opacity="0.5" />
            <path d="M30 55 L40 45" stroke="currentColor" strokeWidth="2" opacity="0.3" />
            <path d="M25 50 L35 40" stroke="currentColor" strokeWidth="2" opacity="0.2" />
          </svg>
        </div>

        {/* 404 Text */}
        <h1
          className="text-7xl md:text-8xl font-bold text-sonics-gold mb-4"
          style={{ fontFamily: 'var(--font-family-display)' }}
        >
          404
        </h1>

        <h2
          className="text-2xl md:text-3xl font-bold text-white mb-4"
          style={{ fontFamily: 'var(--font-family-display)' }}
        >
          OUT OF BOUNDS!
        </h2>

        <p className="text-gray-400 mb-8">
          Looks like this play went off the court. The page you're looking for doesn't exist.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/"
            className="px-6 py-3 bg-sonics-gold text-sonics-dark font-semibold rounded-lg hover:bg-sonics-gold/90 transition-colors focus:outline-none focus:ring-2 focus:ring-sonics-gold focus:ring-offset-2 focus:ring-offset-sonics-dark"
          >
            Back to Home Court
          </Link>
          <button
            onClick={() => window.history.back()}
            className="px-6 py-3 border border-sonics-green text-sonics-green font-semibold rounded-lg hover:bg-sonics-green/10 transition-colors focus:outline-none focus:ring-2 focus:ring-sonics-green focus:ring-offset-2 focus:ring-offset-sonics-dark"
          >
            Go Back
          </button>
        </div>
      </div>
    </div>
  )
}
