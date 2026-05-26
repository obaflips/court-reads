import RatingBackboards from './RatingBackboards'

// GoldRatingBackboards uses the same new SVG component — just re-exports with larger default size
export default function GoldRatingBackboards({ rating = 0, size = 'lg' }) {
  return <RatingBackboards rating={rating} size={size} gap={3} />
}
