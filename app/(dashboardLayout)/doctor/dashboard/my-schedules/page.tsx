import MySchedules from "@/components/modules/Doctor/MySchedules/MySchedules"
import { serializeManagementSearchParams } from "@/lib/management/serializeManagementSearchParams"
import { getMyDoctorSchedules } from "@/services/schedule.services"
import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query"

const MySchedulesPage = async ({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) => {
  const queryParams = await searchParams
  const queryString = serializeManagementSearchParams(queryParams)
  const queryClient = new QueryClient()

  await queryClient.prefetchQuery({
    queryKey: ["my-doctor-schedules", queryParams],
    queryFn: () => getMyDoctorSchedules(queryString),
    staleTime: 30 * 1000,
  })

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <MySchedules queryString={queryString} queryParams={queryParams} />
    </HydrationBoundary>
  )
}

export default MySchedulesPage