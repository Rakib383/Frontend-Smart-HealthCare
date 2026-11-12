import PaymentsTable from "@/components/modules/Admin/PaymentsManagement/PaymentsTable"
import { serializeManagementSearchParams } from "@/lib/management/serializeManagementSearchParams"
import { getAllPayments } from "@/services/payment.services"
import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query"

const PaymentsManagementPage = async ({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) => {
  const queryParams = await searchParams
  const queryString = serializeManagementSearchParams(queryParams)
  const queryClient = new QueryClient()

  await queryClient.prefetchQuery({
    queryKey: ["payments", queryParams],
    queryFn: () => getAllPayments(queryString),
    staleTime: 60 * 1000,
  })

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <PaymentsTable queryString={queryString} queryParams={queryParams} />
    </HydrationBoundary>
  )
}

export default PaymentsManagementPage