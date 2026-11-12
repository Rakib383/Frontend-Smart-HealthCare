import { Star } from "lucide-react"

interface ReviewRatingProps {
  rating: number
  className?: string
}

export default function ReviewRating({ rating, className }: ReviewRatingProps) {
  return (
    <span className={`inline-flex items-center gap-0.5 ${className ?? ""}`} role="img" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, index) => (
        <Star
          key={index}
          className={`size-4 ${index < rating ? "fill-amber-400 text-amber-500" : "text-muted-foreground/30"}`}
          aria-hidden="true"
        />
      ))}
      <span className="ml-1 text-sm font-medium tabular-nums">{rating.toFixed(1)}</span>
    </span>
  )
}
