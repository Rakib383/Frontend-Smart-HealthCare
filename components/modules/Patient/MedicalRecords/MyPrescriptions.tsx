"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { getMyPrescriptions, type IManagedPrescription } from "@/services/prescription.services"
import { useQuery } from "@tanstack/react-query"
import axios from "axios"
import { format } from "date-fns"
import { CalendarClock, CalendarPlus, ChevronDown, ChevronUp, ExternalLink, FileText, RefreshCw } from "lucide-react"
import Link from "next/link"
import { useMemo, useState } from "react"

const EMPTY_PRESCRIPTIONS: IManagedPrescription[] = []

const formatDate = (value: string | Date) => {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? "Date unavailable" : format(date, "MMM d, yyyy")
}

const getSafePdfUrl = (value: string | null) => {
  if (!value) return null
  try {
    const url = new URL(value)
    return url.protocol === "https:" ? url.toString() : null
  } catch {
    return null
  }
}

const getErrorMessage = (error: unknown) => {
  if (axios.isAxiosError<{ message?: string }>(error)) {
    return error.response?.data?.message ?? "Prescriptions could not be loaded. Please try again."
  }
  return error instanceof Error ? error.message : "Prescriptions could not be loaded. Please try again."
}

const MyPrescriptions = () => {
  const [search, setSearch] = useState("")
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const prescriptionsQuery = useQuery({
    queryKey: ["patient-prescriptions"],
    queryFn: getMyPrescriptions,
  })

  const prescriptions = prescriptionsQuery.data?.data ?? EMPTY_PRESCRIPTIONS
  const filteredPrescriptions = useMemo(() => {
    const term = search.trim().toLowerCase()
    return [...prescriptions]
      .filter((prescription) =>
        !term
        || prescription.doctor.name.toLowerCase().includes(term)
        || prescription.instructions.toLowerCase().includes(term),
      )
      .sort((left, right) =>
        new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime(),
      )
  }, [prescriptions, search])

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">My prescriptions</h1>
          <p className="text-sm text-muted-foreground">
            Review your doctor&apos;s instructions, follow-up dates, and prescription documents.
          </p>
        </div>
        <Button render={<Link href="/dashboard/book-appointments" />} className="w-full sm:w-auto">
          <CalendarPlus aria-hidden="true" />
          Book an appointment
        </Button>
      </header>

      <Card size="sm">
        <CardContent className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm text-muted-foreground">Prescriptions on file</p>
            <p className="text-2xl font-semibold tabular-nums">
              {prescriptionsQuery.isPending ? "—" : prescriptions.length}
            </p>
          </div>
          <FileText className="size-5 text-primary" aria-hidden="true" />
        </CardContent>
      </Card>

      <section className="space-y-4">
        <Input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search by doctor or instructions..."
          aria-label="Search prescriptions"
        />

        {prescriptionsQuery.isError ? (
          <div className="flex flex-col gap-3 rounded-xl border border-destructive/40 p-5 sm:flex-row sm:items-center sm:justify-between" role="alert">
            <p className="text-sm text-destructive">{getErrorMessage(prescriptionsQuery.error)}</p>
            <Button type="button" variant="outline" size="sm" onClick={() => void prescriptionsQuery.refetch()}>
              <RefreshCw aria-hidden="true" />
              Try again
            </Button>
          </div>
        ) : prescriptionsQuery.isPending ? (
          <div className="space-y-3" aria-label="Loading prescriptions">
            {[0, 1, 2].map((item) => (
              <Card key={item}>
                <CardContent className="space-y-3">
                  <div className="h-5 w-48 animate-pulse rounded bg-muted" />
                  <div className="h-4 w-full max-w-lg animate-pulse rounded bg-muted" />
                  <div className="h-4 w-32 animate-pulse rounded bg-muted" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredPrescriptions.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
              <span className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <FileText className="size-6" aria-hidden="true" />
              </span>
              <div>
                <h2 className="font-semibold">
                  {prescriptions.length === 0 ? "No prescriptions yet" : "No matching prescriptions"}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {prescriptions.length === 0
                    ? "Prescriptions from your doctor will appear here."
                    : "Try searching with a different doctor name or keyword."}
                </p>
              </div>
              {prescriptions.length === 0 && (
                <Button render={<Link href="/dashboard/my-appointments" />}>
                  <CalendarClock aria-hidden="true" />
                  View my appointments
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredPrescriptions.map((prescription) => {
              const isExpanded = expandedId === prescription.id
              const pdfUrl = getSafePdfUrl(prescription.pdfUrl)
              return (
                <Card key={prescription.id}>
                  <CardContent className="space-y-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="flex min-w-0 items-center gap-3">
                        <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                          <FileText className="size-5" aria-hidden="true" />
                        </span>
                        <div className="min-w-0">
                          <h2 className="truncate font-semibold">{prescription.doctor.name}</h2>
                          <p className="text-sm text-muted-foreground">
                            Issued {formatDate(prescription.createdAt)}
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline">
                        Follow-up: {formatDate(prescription.followUpDate)}
                      </Badge>
                    </div>

                    <div className="grid gap-3 border-t pt-4 sm:grid-cols-2">
                      <div>
                        <p className="text-xs font-medium text-muted-foreground">Appointment date</p>
                        <p className="mt-1 text-sm font-medium">
                          {prescription.appointment?.schedule
                            ? formatDate(prescription.appointment.schedule.startDateTime)
                            : "Date unavailable"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-muted-foreground">Prescription ID</p>
                        <p className="mt-1 break-all font-mono text-xs">{prescription.id}</p>
                      </div>
                    </div>

                    <section className="space-y-2 border-t pt-4">
                      <h3 className="text-sm font-semibold">Doctor&apos;s instructions</h3>
                      <p className={`whitespace-pre-wrap break-words text-sm leading-relaxed ${
                        isExpanded ? "" : "line-clamp-4"
                      }`}>
                        {prescription.instructions}
                      </p>
                      {prescription.instructions.length > 240 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="px-0"
                          aria-expanded={isExpanded}
                          onClick={() => setExpandedId(isExpanded ? null : prescription.id)}
                        >
                          {isExpanded ? "Show less" : "Read full instructions"}
                          {isExpanded
                            ? <ChevronUp aria-hidden="true" />
                            : <ChevronDown aria-hidden="true" />}
                        </Button>
                      )}
                    </section>

                    {pdfUrl ? (
                      <a
                        href={pdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex min-h-10 items-center gap-2 rounded-md border px-3 text-sm font-medium text-primary hover:bg-muted"
                      >
                        Open prescription PDF
                        <ExternalLink className="size-4" aria-hidden="true" />
                      </a>
                    ) : (
                      <p className="text-sm text-muted-foreground">Prescription PDF is not available.</p>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}

export default MyPrescriptions
