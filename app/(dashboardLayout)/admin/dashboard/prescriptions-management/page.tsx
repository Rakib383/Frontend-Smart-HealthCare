import PrescriptionsTable from "@/components/modules/Admin/PrescriptionsManagement/PrescriptionsTable"
import { serializeManagementSearchParams } from "@/lib/management/serializeManagementSearchParams"
import { getAllPrescriptions } from "@/services/prescription.services"
import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query"

const PrescriptionsManagementPage = async ({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) => {
  const queryParams = await searchParams
  const queryString = serializeManagementSearchParams(queryParams)
  const queryClient = new QueryClient()

  await queryClient.prefetchQuery({
    queryKey: ["prescriptions", queryParams],
    queryFn: () => getAllPrescriptions(queryString),
    staleTime: 60 * 1000,
  })

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <PrescriptionsTable queryString={queryString} queryParams={queryParams} />
    </HydrationBoundary>
  )
}

export default PrescriptionsManagementPage