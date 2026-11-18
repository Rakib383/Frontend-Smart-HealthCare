
import PatientDashboardContent from "@/components/modules/dashboard/PatientDashboardContent"
import { getPatientDashboardData } from "@/services/dashboard.services"
import { getMyAppointments } from "@/services/appointment.services"
import { getMyPrescriptions } from "@/services/prescription.services"
import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query"

const PatientDashboardPage = async () => {
  const queryClient = new QueryClient()

  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: ["patient-dashboard-data"],
      queryFn: getPatientDashboardData,
    }),
    queryClient.prefetchQuery({
      queryKey: ["patient-appointments"],
      queryFn: getMyAppointments,
    }),
    queryClient.prefetchQuery({
      queryKey: ["patient-prescriptions"],
      queryFn: getMyPrescriptions,
    }),
  ])

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <PatientDashboardContent />
    </HydrationBoundary>
  )
}

export default PatientDashboardPage
