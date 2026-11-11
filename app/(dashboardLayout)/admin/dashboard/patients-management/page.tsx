import PatientsTable from "@/components/modules/Admin/PatientManagement/PatientsTable"
import { serializeManagementSearchParams } from "@/lib/management/serializeManagementSearchParams"
import { getPatients } from "@/services/patient.services"
import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query"

const PatientsManagementPage = async ({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) => {
  const queryParamsObject = await searchParams
  const queryString = serializeManagementSearchParams(queryParamsObject)
  const queryClient = new QueryClient()

  await queryClient.prefetchQuery({
    queryKey: ["patients", queryParamsObject],
    queryFn: () => getPatients(queryString),
    staleTime: 60 * 60 * 1000,
  })

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="space-y-4">
        <header className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Patient management</h1>
          <p className="text-sm text-muted-foreground">
            Review patient accounts, update access status, and deactivate accounts when needed.
          </p>
        </header>
        <PatientsTable queryString={queryString} queryParamsObject={queryParamsObject} />
      </div>
    </HydrationBoundary>
  )
}

export default PatientsManagementPage