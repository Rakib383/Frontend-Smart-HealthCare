import DoctorsTable from "@/components/modules/Admin/DoctorManagement/DoctorsTable"
import { getDoctors } from "@/services/doctor.services"
import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query"

const DoctorsManagementPage = async () => {



  const queryClient = new QueryClient()

  await queryClient.prefetchQuery({
    queryKey: ['doctors'],
    queryFn: getDoctors,
    staleTime: 1000*60*60
  }) 

  return (
    <HydrationBoundary state = {dehydrate(queryClient)}>
      <DoctorsTable/>

    </HydrationBoundary>
  )
}

export default DoctorsManagementPage