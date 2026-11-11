
import { getDefaultDashboardRoute } from "@/lib/authUtils"
import { getUserInfo } from "@/services/auth.services"
import AdminsManagement from "@/components/modules/Admin/AdminManagement/AdminsManagement"
import type { UserInfo } from "@/types/user.types"
import { redirect } from "next/navigation"

const AdminsManagementPage = async () => {
  const user = await getUserInfo() as UserInfo | null
  if (!user) redirect("/login")
  if (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN") {
    redirect(getDefaultDashboardRoute(user.role))
  }

  return <AdminsManagement currentUserId={user.id} currentUserRole={user.role} />
}

export default AdminsManagementPage