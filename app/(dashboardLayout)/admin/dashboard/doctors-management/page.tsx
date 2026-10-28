import DoctorsTable from "@/components/modules/Admin/DoctorManagement/DoctorsTable"
import { serializeManagementSearchParams } from "@/lib/management/serializeManagementSearchParams"
import { getDoctors } from "@/services/doctor.services"
import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query"

const DoctorsManagementPage = async ({searchParams}:{
  searchParams:Promise<{[key:string]:string | string[] | undefined}>
}) => {

  const queryParamsObjects = { ...(await searchParams) };
  if (queryParamsObjects.gender !== "MALE" && queryParamsObjects.gender !== "FEMALE") {
    delete queryParamsObjects.gender;
  }

  const queryString = serializeManagementSearchParams(queryParamsObjects)

  const queryClient = new QueryClient()

  await queryClient.prefetchQuery({
    queryKey: ['doctors',queryParamsObjects],
    queryFn: () => getDoctors(queryString),
    staleTime: 1000*60*60
  }) 

  return (
    <HydrationBoundary state = {dehydrate(queryClient)}>
      <DoctorsTable queryString={queryString} queryParamsObject={queryParamsObjects}/>

    </HydrationBoundary>
  )
}

export default DoctorsManagementPage