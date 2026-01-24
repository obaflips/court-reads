// Reusable skeleton loading components

export function SkeletonText({ className = '', width = 'w-full' }) {
  return (
    <div
      className={`h-4 bg-sonics-green/20 rounded animate-pulse ${width} ${className}`}
    />
  )
}

export function SkeletonCard({ className = '' }) {
  return (
    <div className={`border border-sonics-green/20 rounded-xl p-4 animate-pulse ${className}`}>
      <div className="flex gap-4">
        <div className="w-16 h-24 bg-sonics-green/20 rounded flex-shrink-0" />
        <div className="flex-1 space-y-3">
          <div className="h-5 bg-sonics-green/20 rounded w-3/4" />
          <div className="h-4 bg-sonics-green/20 rounded w-1/2" />
          <div className="h-4 bg-sonics-green/20 rounded w-2/3" />
        </div>
      </div>
    </div>
  )
}

export function SkeletonTable({ rows = 5 }) {
  return (
    <div className="border border-sonics-green/20 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="bg-sonics-green/10 px-4 py-3 flex gap-4">
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="h-4 bg-sonics-green/20 rounded w-20 animate-pulse" />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="px-4 py-4 border-t border-sonics-green/10 flex gap-4 items-center">
          <div className="w-8 h-8 bg-sonics-green/20 rounded animate-pulse" />
          <div className="w-12 h-16 bg-sonics-green/20 rounded animate-pulse" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-sonics-green/20 rounded w-1/3 animate-pulse" />
            <div className="h-3 bg-sonics-green/20 rounded w-1/4 animate-pulse" />
          </div>
          <div className="h-4 bg-sonics-green/20 rounded w-32 animate-pulse hidden md:block" />
        </div>
      ))}
    </div>
  )
}

export function SkeletonStats() {
  return (
    <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto my-8 px-4">
      {[1, 2, 3].map(i => (
        <div key={i} className="text-center p-4 border border-sonics-green/20 rounded-lg animate-pulse">
          <div className="h-10 bg-sonics-green/20 rounded w-16 mx-auto mb-2" />
          <div className="h-3 bg-sonics-green/20 rounded w-20 mx-auto" />
        </div>
      ))}
    </div>
  )
}

export function SkeletonLatestRead() {
  return (
    <div className="max-w-4xl mx-auto my-12 px-4">
      <div className="h-6 bg-sonics-green/20 rounded w-32 mb-6 animate-pulse" />
      <div className="border border-sonics-green/20 rounded-xl p-6 animate-pulse">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="w-32 md:w-40 h-48 md:h-56 bg-sonics-green/20 rounded-lg mx-auto md:mx-0" />
          <div className="flex-1 space-y-4">
            <div className="h-8 bg-sonics-green/20 rounded w-3/4" />
            <div className="h-4 bg-sonics-green/20 rounded w-1/3" />
            <div className="h-4 bg-sonics-green/20 rounded w-1/4" />
            <div className="mt-6 pt-6 border-t border-sonics-green/10 space-y-3">
              <div className="h-4 bg-sonics-green/20 rounded w-24" />
              <div className="h-6 bg-sonics-green/20 rounded w-2/3" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function SkeletonLineups() {
  return (
    <div className="max-w-6xl mx-auto px-4 my-12">
      <div className="text-center mb-8 space-y-2">
        <div className="h-8 bg-sonics-green/20 rounded w-64 mx-auto animate-pulse" />
        <div className="h-4 bg-sonics-green/20 rounded w-48 mx-auto animate-pulse" />
      </div>
      <div className="grid md:grid-cols-3 gap-8">
        {[1, 2, 3].map(col => (
          <div key={col} className="space-y-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-sonics-green/20 rounded animate-pulse" />
              <div className="space-y-2">
                <div className="h-5 bg-sonics-green/20 rounded w-32 animate-pulse" />
                <div className="h-3 bg-sonics-green/20 rounded w-24 animate-pulse" />
              </div>
            </div>
            {[1, 2, 3, 4, 5].map(row => (
              <div key={row} className="border border-sonics-green/20 rounded-xl p-4 animate-pulse">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 bg-sonics-green/20 rounded" />
                  <div className="w-12 h-16 bg-sonics-green/20 rounded" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-sonics-green/20 rounded w-3/4" />
                    <div className="h-3 bg-sonics-green/20 rounded w-1/2" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

export default function Skeleton({ type = 'text', ...props }) {
  switch (type) {
    case 'card':
      return <SkeletonCard {...props} />
    case 'table':
      return <SkeletonTable {...props} />
    case 'stats':
      return <SkeletonStats {...props} />
    case 'latestRead':
      return <SkeletonLatestRead {...props} />
    case 'lineups':
      return <SkeletonLineups {...props} />
    default:
      return <SkeletonText {...props} />
  }
}
