import DashboardNavbar from "@/components/modules/dashboard/DashboardNavbar"
import DashboardSidebar from "@/components/modules/dashboard/DashboardSidebar"

const RootDashboardLayoutPage = async ({ children }: { children: React.ReactNode }) => {

    return (
        <div className="flex h-screen overflow-hidden">

            {/* dashboard sidebar */}

            <DashboardSidebar/>

            <div className="flex flex-col flex-1 overflow-hidden">

                {/* dashboard navbar*/}

                <DashboardNavbar/>

                {/* dashboard Content*/}

                <main className="flex-1 overflow-y-auto bg-muted/10 p-4 md:p-6">
                    <div>
                        {children}
                    </div>
                </main>
            </div>
        </div>
    )
}

export default RootDashboardLayoutPage