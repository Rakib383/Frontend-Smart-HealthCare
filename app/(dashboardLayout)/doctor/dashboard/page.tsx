import DoctorDashboardContent from "@/components/modules/dashboard/DoctorDashboardContent"
import { getDoctorDashboardData } from "@/services/dashboard.services"
import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query"

const DoctorDashboardPage = async () => {
  const queryClient = new QueryClient()

  await queryClient.prefetchQuery({
    queryKey: ["doctor-dashboard-data"],
    queryFn: getDoctorDashboardData,
    staleTime: 5 * 60 * 1000,
  })

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <DoctorDashboardContent />
    </HydrationBoundary>
  )
}

export default DoctorDashboardPage
