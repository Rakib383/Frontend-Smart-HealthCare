"use client"

import DataTable from "@/components/shared/table/DataTable"
import useManagementTable from "@/components/shared/table/useManagementTable"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getAllReviews } from "@/services/review.services"
import type { IManagedReview } from "@/services/review.services"
import { useQuery } from "@tanstack/react-query"
import axios from "axios"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useState } from "react"
import ReviewDetailsDialog from "./ReviewDetailsDialog"
import { reviewColumns } from "./reviewColumns"

type SearchParams = Record<string, string | string[] | undefined>

interface ReviewsTableProps {
  queryString: string
  queryParams: SearchParams
}

const getErrorMessage = (error: unknown) => {
  if (axios.isAxiosError<{ message?: string }>(error)) {
    return error.response?.data?.message ?? "Could not load reviews. Please try again."
  }
  return error instanceof Error ? error.message : "Could not load reviews. Please try again."
}

export default function ReviewsTable({ queryString, queryParams }: ReviewsTableProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [viewingReview, setViewingReview] = useState<IManagedReview | null>(null)
  const reviewsQuery = useQuery({
    queryKey: ["reviews", queryParams],
    queryFn: () => getAllReviews(queryString),
  })

  const reviews = reviewsQuery.data?.data ?? []
  const paginationMeta = reviewsQuery.data?.meta
  const { page, pageSize, searchTerm, handlePageChange, handlePageSizeChange, handleSearch } = useManagementTable({
    queryParams,
    pageInfo: {
      page: paginationMeta?.page,
      pageSize: paginationMeta?.limit,
    },
  })
  const rawRating = Array.isArray(queryParams.rating) ? queryParams.rating[0] : queryParams.rating
  const selectedRating = rawRating && ["1", "2", "3", "4", "5"].includes(rawRating) ? rawRating : "ALL"

  const handleRatingFilterChange = (value: string | null) => {
    const params = new URLSearchParams(searchParams.toString())
    if (!value || value === "ALL") {
      params.delete("rating")
    } else {
      params.set("rating", value)
    }
    params.set("page", "1")
    router.push(`${pathname}?${params.toString()}`, { scroll: false })
  }

  return (
    <div className="space-y-4">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Reviews</h1>
        <p className="text-sm text-muted-foreground">
          Review patient feedback and ratings for completed appointments.
        </p>
      </header>

      {reviewsQuery.isError ? (
        <div className="space-y-3 rounded-lg border border-destructive/40 p-4" role="alert">
          <p className="text-sm text-destructive">{getErrorMessage(reviewsQuery.error)}</p>
          <Button type="button" variant="outline" size="sm" onClick={() => void reviewsQuery.refetch()}>
            Retry
          </Button>
        </div>
      ) : (
        <DataTable
          columns={reviewColumns}
          data={reviews}
          actions={{ onView: setViewingReview }}
          isLoading={reviewsQuery.isLoading || reviewsQuery.isFetching}
          emptyMessage="No reviews match your search."
          search={{
            value: searchTerm,
            onChange: handleSearch,
            placeholder: "Search patients, doctors, or comments...",
            debounceMs: 400,
          }}
          toolbar={(
            <Select value={selectedRating} onValueChange={handleRatingFilterChange}>
              <SelectTrigger aria-label="Filter reviews by rating" className="w-full sm:w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All ratings</SelectItem>
                {[5, 4, 3, 2, 1].map((rating) => (
                  <SelectItem key={rating} value={String(rating)}>{rating} stars</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          pagination={{
            page,
            pageSize,
            total: paginationMeta?.total ?? reviews.length,
            totalPages: Math.max(1, paginationMeta?.totalPages ?? 1),
            onPageChange: handlePageChange,
            onPageSizeChange: handlePageSizeChange,
          }}
        />
      )}

      <ReviewDetailsDialog
        review={viewingReview}
        open={viewingReview !== null}
        onOpenChange={(open) => {
          if (!open) setViewingReview(null)
        }}
      />
    </div>
  )
}
