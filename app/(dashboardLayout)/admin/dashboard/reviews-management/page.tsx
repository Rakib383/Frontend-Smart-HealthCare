import ReviewsTable from "@/components/modules/Admin/ReviewsManagement/ReviewsTable"
import { serializeManagementSearchParams } from "@/lib/management/serializeManagementSearchParams"
import { getAllReviews } from "@/services/review.services"
import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query"

const ReviewsManagementPage = async ({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) => {
  const queryParams = await searchParams
  const queryString = serializeManagementSearchParams(queryParams)
  const queryClient = new QueryClient()

  await queryClient.prefetchQuery({
    queryKey: ["reviews", queryParams],
    queryFn: () => getAllReviews(queryString),
    staleTime: 60 * 1000,
  })

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ReviewsTable queryString={queryString} queryParams={queryParams} />
    </HydrationBoundary>
  )
}

export default ReviewsManagementPage