
import DoctorSpecialtiesTable from "@/components/modules/Admin/DoctorSpecialtiesManagement/DoctorSpecialtiesTable"
import { serializeManagementSearchParams } from "@/lib/management/serializeManagementSearchParams"
import { getDoctors } from "@/services/doctor.services"
import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query"

const DoctorSpecialtiesManagementPage = async ({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) => {
  const queryParams = await searchParams
  const queryString = serializeManagementSearchParams(queryParams)
  const queryClient = new QueryClient()

  await queryClient.prefetchQuery({
    queryKey: ["doctors", queryParams],
    queryFn: () => getDoctors(queryString),
    staleTime: 60 * 60 * 1000,
  })

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <DoctorSpecialtiesTable queryString={queryString} queryParams={queryParams} />
    </HydrationBoundary>
  )
}

export default DoctorSpecialtiesManagementPage