"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getMyDoctorReviews, type IManagedReview } from "@/services/review.services"
import { useQuery } from "@tanstack/react-query"
import axios from "axios"
import { format } from "date-fns"
import { MessageSquareText, RefreshCw, Search, Star, TrendingUp } from "lucide-react"
import { useMemo, useState } from "react"

const EMPTY_REVIEWS: IManagedReview[] = []

const formatDate = (value: string | Date) => {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? "Date unavailable" : format(date, "MMM d, yyyy")
}

const getErrorMessage = (error: unknown) => {
  if (axios.isAxiosError<{ message?: string }>(error)) {
    return error.response?.data?.message ?? "Reviews could not be loaded. Please try again."
  }
  return error instanceof Error ? error.message : "Reviews could not be loaded. Please try again."
}

const isRatingFilter = (value: string | null): value is "1" | "2" | "3" | "4" | "5" =>
  value === "1" || value === "2" || value === "3" || value === "4" || value === "5"

const MyReviews = () => {
  const [search, setSearch] = useState("")
  const [ratingFilter, setRatingFilter] = useState<"ALL" | "1" | "2" | "3" | "4" | "5">("ALL")
  const reviewsQuery = useQuery({
    queryKey: ["doctor-reviews"],
    queryFn: getMyDoctorReviews,
  })

  const reviews = reviewsQuery.data?.data ?? EMPTY_REVIEWS
  const averageRating = reviews.length
    ? reviews.reduce((total, review) => total + review.rating, 0) / reviews.length
    : null
  const filteredReviews = useMemo(() => {
    const term = search.trim().toLowerCase()
    return [...reviews]
      .filter((review) => ratingFilter === "ALL" || String(review.rating) === ratingFilter)
      .filter((review) =>
        !term
        || review.patient.name.toLowerCase().includes(term)
        || (review.comment ?? "").toLowerCase().includes(term),
      )
      .sort((left, right) =>
        new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime(),
      )
  }, [reviews, search, ratingFilter])

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">My reviews</h1>
        <p className="text-sm text-muted-foreground">
          Read feedback patients have left after their appointments with you.
        </p>
      </header>

      <section className="grid gap-3 sm:grid-cols-2" aria-label="Review summary">
        <Card size="sm">
          <CardContent className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm text-muted-foreground">Total reviews</p>
              <p className="mt-1 text-2xl font-semibold tabular-nums">
                {reviewsQuery.isPending ? "—" : reviews.length}
              </p>
            </div>
            <MessageSquareText className="size-5 text-primary" aria-hidden="true" />
          </CardContent>
        </Card>
        <Card size="sm">
          <CardContent className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm text-muted-foreground">Average rating</p>
              <p className="mt-1 text-2xl font-semibold tabular-nums">
                {reviewsQuery.isPending ? "—" : averageRating?.toFixed(1) ?? "—"}
                {averageRating !== null && <span className="ml-1 text-sm font-medium text-muted-foreground">/ 5</span>}
              </p>
            </div>
            <TrendingUp className="size-5 text-primary" aria-hidden="true" />
          </CardContent>
        </Card>
      </section>

      <section className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <Input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.currentTarget.value)}
              placeholder="Search patient names or comments..."
              aria-label="Search reviews"
              className="pl-9"
            />
          </div>
          <Select
            value={ratingFilter}
            onValueChange={(value) => {
              if (value === "ALL" || isRatingFilter(value)) setRatingFilter(value)
            }}
          >
            <SelectTrigger aria-label="Filter reviews by rating" className="w-full sm:w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All ratings</SelectItem>
              {[5, 4, 3, 2, 1].map((rating) => (
                <SelectItem key={rating} value={String(rating)}>{rating} stars</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {reviewsQuery.isError ? (
          <div className="flex flex-col gap-3 rounded-xl border border-destructive/40 p-5 sm:flex-row sm:items-center sm:justify-between" role="alert">
            <p className="text-sm text-destructive">{getErrorMessage(reviewsQuery.error)}</p>
            <Button type="button" variant="outline" size="sm" onClick={() => void reviewsQuery.refetch()}>
              <RefreshCw aria-hidden="true" />
              Try again
            </Button>
          </div>
        ) : reviewsQuery.isPending ? (
          <div className="space-y-3" aria-label="Loading reviews">
            {[0, 1, 2].map((item) => (
              <Card key={item}>
                <CardContent className="space-y-3">
                  <div className="h-5 w-48 animate-pulse rounded bg-muted" />
                  <div className="h-4 w-full max-w-lg animate-pulse rounded bg-muted" />
                  <div className="h-4 w-32 animate-pulse rounded bg-muted" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredReviews.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
              <span className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <MessageSquareText className="size-6" aria-hidden="true" />
              </span>
              <div>
                <h2 className="font-semibold">
                  {reviews.length === 0 ? "No reviews yet" : "No matching reviews"}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {reviews.length === 0
                    ? "Patient feedback will appear here after they review an appointment."
                    : "Try a different patient name, comment, or rating."}
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredReviews.map((review) => (
              <Card key={review.id}>
                <CardContent className="space-y-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 font-semibold text-primary">
                        {review.patient.name.slice(0, 1).toUpperCase()}
                      </span>
                      <div className="min-w-0">
                        <h2 className="truncate font-semibold">{review.patient.name}</h2>
                        <p className="text-xs text-muted-foreground">
                          Reviewed {formatDate(review.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center" aria-label={`${review.rating} out of 5 stars`}>
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`size-4 ${
                              star <= Math.round(review.rating)
                                ? "fill-amber-400 text-amber-500"
                                : "text-muted-foreground/30"
                            }`}
                            aria-hidden="true"
                          />
                        ))}
                      </div>
                      <Badge variant="outline">{review.rating.toFixed(1)} / 5</Badge>
                    </div>
                  </div>

                  <div className="border-t pt-3">
                    <p className="text-xs font-medium text-muted-foreground">Appointment</p>
                    <p className="mt-1 text-sm">
                      {review.appointment?.schedule
                        ? formatDate(review.appointment.schedule.startDateTime)
                        : "Appointment date unavailable"}
                    </p>
                  </div>

                  <p className="whitespace-pre-wrap break-words border-t pt-3 text-sm leading-relaxed">
                    {review.comment || "No written comment was provided."}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

export default MyReviews
