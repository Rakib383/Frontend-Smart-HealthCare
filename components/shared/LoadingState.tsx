import { LoaderCircle } from "lucide-react"
import { cn } from "cn"

interface LoadingStateProps {
  className?: string
}

export default function LoadingState({ className }: LoadingStateProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn("flex items-center justify-center", className)}
    >
      <LoaderCircle className="size-9 animate-spin text-primary" aria-hidden="true" />
      <span className="sr-only">Loading</span>
    </div>
  )
}
