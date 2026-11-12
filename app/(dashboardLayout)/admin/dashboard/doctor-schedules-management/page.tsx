
import DoctorSchedulesTable from "@/components/modules/Admin/DoctorSchedulesManagement/DoctorSchedulesTable"
import { serializeManagementSearchParams } from "@/lib/management/serializeManagementSearchParams"
import { getAllDoctorSchedules } from "@/services/schedule.services"
import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query"

const DoctorSchedulesManagementPage = async ({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) => {
  const queryParams = await searchParams
  const queryString = serializeManagementSearchParams({
    ...queryParams,
    include: "doctor,schedule",
  })
  const queryClient = new QueryClient()

  await queryClient.prefetchQuery({
    queryKey: ["doctor-schedules", queryParams],
    queryFn: () => getAllDoctorSchedules(queryString),
    staleTime: 60 * 60 * 1000,
  })

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <DoctorSchedulesTable queryString={queryString} queryParams={queryParams} />
    </HydrationBoundary>
  )
}

export default DoctorSchedulesManagementPage