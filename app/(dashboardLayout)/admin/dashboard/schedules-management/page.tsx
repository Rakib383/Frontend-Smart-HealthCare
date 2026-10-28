import SchedulesTable from "@/components/modules/Admin/SchedulesManagement/SchedulesTable"
import { serializeManagementSearchParams } from "@/lib/management/serializeManagementSearchParams"
import { getSchedules } from "@/services/schedule.services"
import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query"

const SchedulesManagementPage = async ({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) => {
  const queryParams = await searchParams
  const queryString = serializeManagementSearchParams(queryParams)
  const queryClient = new QueryClient()

  await queryClient.prefetchQuery({
    queryKey: ["schedules", queryParams],
    queryFn: () => getSchedules(queryString),
    staleTime: 60 * 60 * 1000,
  })

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <SchedulesTable queryString={queryString} queryParams={queryParams} />
    </HydrationBoundary>
  )
}

export default SchedulesManagementPage