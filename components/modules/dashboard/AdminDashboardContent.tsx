"use client"

import AppointmentBarChart from "@/components/shared/AppointmentBarChart"
import AppointmentPieChart from "@/components/shared/AppointmentPieChart"
import StatsCard from "@/components/shared/StatsCard"
import { ingestDoctorsAction } from "@/app/_actions/rag.action"
import { Button } from "@/components/ui/button"
import { getDashboardData } from "@/services/dashboard.services"
import { ApiResponse } from "@/types/api.types"
import { IAdminDashboardData } from "@/types/dashboard.types"
import { DatabaseZap, LoaderCircle } from "lucide-react"
import { useState } from "react"
import { useQuery } from "@tanstack/react-query"

type IngestionResult = {
    type: "success" | "error"
    message: string
}

const AdminDashboardContent = () => {
    const [isIngesting, setIsIngesting] = useState(false)
    const [ingestionResult, setIngestionResult] = useState<IngestionResult | null>(null)

    const {data:adminDashboardData} = useQuery({
        queryKey: ["admin-dashboard-data"],
        queryFn:getDashboardData,
        refetchOnWindowFocus:true

    })

    const {data} = adminDashboardData as ApiResponse<IAdminDashboardData>;

    const handleIngestDoctors = async () => {
        if (isIngesting) return

        setIsIngesting(true)
        setIngestionResult(null)
        try {
            const result = await ingestDoctorsAction()
            if (result.success) {
                setIngestionResult({
                    type: "success",
                    message: `${result.message} ${result.indexedCount} doctors indexed.`,
                })
            } else {
                setIngestionResult({ type: "error", message: result.error })
            }
        } catch (error) {
            console.error("Doctor data ingestion failed:", error)
            setIngestionResult({
                type: "error",
                message: "Doctor data ingestion failed. Please try again.",
            })
        } finally {
            setIsIngesting(false)
        }
    }

  return (
    <div>
        <section className="mb-6 flex flex-col gap-4 rounded-xl border bg-card p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
                <h2 className="text-lg font-semibold">Doctor data ingestion</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                    Update the AI assistant&apos;s doctor knowledge base with the latest data.
                </p>
                {ingestionResult && (
                    <p
                        className={`mt-2 text-sm ${ingestionResult.type === "error" ? "text-destructive" : "text-emerald-700"}`}
                        role="status"
                    >
                        {ingestionResult.message}
                    </p>
                )}
            </div>
            <Button
                type="button"
                disabled={isIngesting}
                onClick={() => void handleIngestDoctors()}
                className="gap-2 sm:shrink-0"
            >
                {isIngesting ? (
                    <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
                ) : (
                    <DatabaseZap className="size-4" aria-hidden="true" />
                )}
                {isIngesting ? "Ingesting doctor data..." : "Ingest doctor data"}
            </Button>
        </section>

        <StatsCard title="Total Appointments" value={data?.appointmentCount || 0} iconName="CalendarDays" description="Number of appointments scheduled"/>

        <StatsCard title="Total Patients" value={data?.patientCount || 0} iconName="Users" description="Number of patients registered"/>

        <AppointmentBarChart data={data?.barChartData || []}/>
        <AppointmentPieChart data={data?.pieChartData || []}/>
      
    </div>
  )
}

export default AdminDashboardContent
