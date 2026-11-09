import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query"
import DoctorsList from "@/components/modules/Consultation/DoctorsList"
import { getDoctors } from "@/services/doctor.services"

const doctorsQueryString = "page=1&limit=10"

const consultationPage = async () => {
  const queryClient = new QueryClient()

  await queryClient.prefetchQuery({
    queryKey: ["doctors", doctorsQueryString],
    queryFn: () => getDoctors(doctorsQueryString),
  })

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <DoctorsList />
    </HydrationBoundary>
  )
}

export default consultationPage
