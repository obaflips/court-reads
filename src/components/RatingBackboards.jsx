import { useMemo } from 'react'

const GOLD = '#FFC200'
const DARK = '#0a1612'
const GREEN = '#00653A'

function Backboard({ fill = 0, size = 16, uid }) {
  const isFilled = fill > 0
  const isPartial = fill > 0 && fill < 1
  const w = size * 1.4
  const h = size * 1.4
  return (
    <svg viewBox="0 0 28 26" width={w} height={h} style={{ display: 'inline-block', overflow: 'visible' }}>
      <defs>
        {isPartial && (
          <linearGradient id={`bb-grad-${uid}`} x1="0" y1="0" x2="1" y2="0">
            <stop offset={`${fill * 100}%`} stopColor={GOLD} />
            <stop offset={`${fill * 100}%`} stopColor="#fff" />
          </linearGradient>
        )}
      </defs>
      {/* backboard with painted shooter's square */}
      <rect x="2" y="2" width="24" height="12" rx="1.5"
        fill={isPartial ? `url(#bb-grad-${uid})` : isFilled ? GOLD : '#fff'}
        stroke={DARK} strokeWidth="1.6" />
      <rect x="10" y="5.5" width="8" height="6" rx="0.4"
        fill="none" stroke={isFilled ? GREEN : '#bbb'} strokeWidth="1.1" />
      {/* rim attachment bar */}
      <rect x="12.5" y="14" width="3" height="1.4" fill={DARK} />
      {/* hoop ring */}
      <ellipse cx="14" cy="17" rx="5.5" ry="1.4" fill="none"
        stroke={isFilled ? '#ff6b35' : '#bbb'} strokeWidth="2.1" />
      {/* net strands */}
      <g stroke={isFilled ? DARK : '#bbb'} strokeWidth="0.75" fill="none" opacity={isFilled ? 0.95 : 0.7} strokeLinecap="round">
        <path d="M9 17.5 L10.5 24" />
        <path d="M11.5 18 L12 24.5" />
        <path d="M14 18.2 L14 24.7" />
        <path d="M16.5 18 L16 24.5" />
        <path d="M19 17.5 L17.5 24" />
        <path d="M10 20 Q14 21.2 18 20" />
        <path d="M10.8 22.5 Q14 23.4 17.2 22.5" />
      </g>
    </svg>
  )
}

// size can be a string ('sm', 'md', 'lg') or a pixel number
const SIZE_MAP = { sm: 11, md: 14, lg: 18 }

export default function RatingBackboards({ rating = 0, size = 'md', gap = 2 }) {
  const px = typeof size === 'number' ? size : (SIZE_MAP[size] ?? SIZE_MAP.md)
  const baseId = useMemo(() => Math.random().toString(36).slice(2, 8), [])
  return (
    <span style={{ display: 'inline-flex', gap, alignItems: 'center' }}>
      {[...Array(5)].map((_, i) => {
        const fill = Math.max(0, Math.min(1, rating - i))
        return <Backboard key={i} fill={fill} size={px} uid={`${baseId}-${i}`} />
      })}
    </span>
  )
}
