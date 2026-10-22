import AdminDashboardContent from "@/components/modules/dashboard/AdminDashboardContent"
import { getDashboardData } from "@/services/dashboard.services"
import { ApiResponse } from "@/types/api.types"
import { IAdminDashboardData } from "@/types/dashboard.types"
import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query"



const AdminDashboardPage = async () => {

  const queryClient = new QueryClient()

  await queryClient.prefetchQuery({
    queryKey: ['admin-dashboard-data'],
    queryFn: getDashboardData,
    gcTime:5*60*1000
  })

  const dashboardData = queryClient.getQueryData(["admin-dashboard-data"]) as ApiResponse<IAdminDashboardData>

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>

      <AdminDashboardContent />

    </HydrationBoundary>
  )
}

export default AdminDashboardPage

