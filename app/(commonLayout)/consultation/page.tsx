import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query"
import { getDoctors } from "./_actions"
import DoctorsList from "@/components/modules/Consultation/DoctorsList"


const consultationPage = async () => {

  const queryClient = new QueryClient()

  // await queryClient.query({
  //   queryKey: ['doctors'],
  //   queryFn: getDoctors
  // })

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <DoctorsList />
    </HydrationBoundary>
  )
}

export default consultationPage
