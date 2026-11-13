"use client"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  getMyHealthRecords,
  updateMyHealthRecords,
  type IPatientHealthData,
  type IPatientHealthProfile,
  type IPatientMedicalReport,
} from "@/services/patient.services"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import axios from "axios"
import { format } from "date-fns"
import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  ClipboardPlus,
  ExternalLink,
  FileImage,
  FileText,
  HeartPulse,
  LoaderCircle,
  MapPin,
  Pencil,
  Ruler,
  Scale,
  Save,
  Trash2,
  Upload,
  type LucideIcon,
} from "lucide-react"
import { useRef, useState, type FormEvent } from "react"

const MAX_FILE_COUNT = 5
const MAX_TOTAL_BYTES = 10 * 1024 * 1024
const EMPTY_REPORTS: IPatientMedicalReport[] = []

const formatDate = (value: string | Date) => {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? "Not recorded" : format(date, "MMM d, yyyy")
}

const formatFileSize = (bytes: number) => {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

const getSafeReportUrl = (value: string) => {
  try {
    const url = new URL(value)
    return url.protocol === "https:" && url.hostname === "res.cloudinary.com"
      ? url.toString()
      : null
  } catch {
    return null
  }
}

const getErrorMessage = (error: unknown) => {
  if (axios.isAxiosError<{ message?: string }>(error)) {
    if (error.response?.status === 413) {
      return "The selected files exceed the upload limit. Choose files with a combined size under 10 MB."
    }
    return error.response?.data?.message ?? "We couldn't update your health records. Please try again."
  }
  return error instanceof Error ? error.message : "We couldn't update your health records. Please try again."
}

const HealthValue = ({
  label,
  value,
  icon: Icon,
}: {
  label: string
  value: string
  icon: LucideIcon
}) => (
  <div className="flex items-start gap-3 rounded-lg border p-3">
    <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
      <Icon className="size-4" aria-hidden="true" />
    </span>
    <div className="min-w-0">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="mt-1 break-words text-sm font-semibold">{value}</p>
    </div>
  </div>
)

const HealthFlag = ({ label, value }: { label: string; value: boolean }) => (
  <div className="flex items-center justify-between gap-3 rounded-lg border px-3 py-2.5">
    <span className="text-sm">{label}</span>
    <span className={`text-xs font-semibold ${value ? "text-amber-700" : "text-emerald-700"}`}>
      {value ? "Reported" : "Not reported"}
    </span>
  </div>
)

type HealthFormValues = Omit<IPatientHealthData, "dateOfBirth" | "gender" | "bloodGroup"> & {
  gender: IPatientHealthData["gender"] | ""
  dateOfBirth: string
  bloodGroup: IPatientHealthData["bloodGroup"] | ""
}

const bloodGroups: IPatientHealthData["bloodGroup"][] = [
  "A_POSITIVE",
  "A_NEGATIVE",
  "B_POSITIVE",
  "B_NEGATIVE",
  "AB_POSITIVE",
  "AB_NEGATIVE",
  "O_POSITIVE",
  "O_NEGATIVE",
]

const dateInputValue = (value: string | Date | undefined) => {
  if (!value) return ""
  if (typeof value === "string") return value.slice(0, 10)
  return Number.isNaN(value.getTime()) ? "" : format(value, "yyyy-MM-dd")
}

const createHealthFormValues = (data: IPatientHealthData | null): HealthFormValues => ({
  gender: data?.gender ?? "",
  dateOfBirth: dateInputValue(data?.dateOfBirth),
  bloodGroup: data?.bloodGroup ?? "",
  hasAllergies: data?.hasAllergies ?? false,
  hasDiabetes: data?.hasDiabetes ?? false,
  height: data?.height ?? "",
  weight: data?.weight ?? "",
  smokingStatus: data?.smokingStatus ?? false,
  dietaryPreferences: data?.dietaryPreferences ?? "",
  pregnancyStatus: data?.pregnancyStatus ?? false,
  mentalHealthHistory: data?.mentalHealthHistory ?? "",
  immunizationStatus: data?.immunizationStatus ?? "",
  hasPastSurgeries: data?.hasPastSurgeries ?? false,
  recentAnxiety: data?.recentAnxiety ?? false,
  recentDepression: data?.recentDepression ?? false,
  maritalStatus: data?.maritalStatus ?? "",
})

const HealthInformationForm = ({
  initialData,
  isSaving,
  onCancel,
  onSave,
}: {
  initialData: IPatientHealthData | null
  isSaving: boolean
  onCancel: () => void
  onSave: (values: IPatientHealthData) => void
}) => {
  const [values, setValues] = useState(() => createHealthFormValues(initialData))
  const [formError, setFormError] = useState("")

  const setField = <K extends keyof HealthFormValues>(key: K, value: HealthFormValues[K]) => {
    setValues((current) => ({ ...current, [key]: value }))
  }

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const gender = values.gender
    const bloodGroup = values.bloodGroup
    if (!gender || !bloodGroup || !values.dateOfBirth || !values.height.trim() || !values.weight.trim()) {
      setFormError("Complete the required fields before saving.")
      return
    }

    setFormError("")
    onSave({ ...values, gender, bloodGroup })
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="health-gender">Gender *</Label>
          <select
            id="health-gender"
            required
            value={values.gender}
            onChange={(event) => {
              const value = event.currentTarget.value
              if (value === "MALE" || value === "FEMALE" || value === "") setField("gender", value)
            }}
            className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <option value="">Select gender</option>
            <option value="FEMALE">Female</option>
            <option value="MALE">Male</option>
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="health-date-of-birth">Date of birth *</Label>
          <Input
            id="health-date-of-birth"
            type="date"
            required
            value={values.dateOfBirth}
            onChange={(event) => setField("dateOfBirth", event.currentTarget.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="health-blood-group">Blood group *</Label>
          <select
            id="health-blood-group"
            required
            value={values.bloodGroup}
            onChange={(event) => {
              const value = bloodGroups.find((group) => group === event.currentTarget.value)
              setField("bloodGroup", value ?? "")
            }}
            className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <option value="">Select blood group</option>
            {bloodGroups.map((group) => (
              <option key={group} value={group}>{group.replace("_", " ")}</option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="health-height">Height *</Label>
          <Input
            id="health-height"
            required
            maxLength={20}
            placeholder="e.g. 170 cm"
            value={values.height}
            onChange={(event) => setField("height", event.currentTarget.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="health-weight">Weight *</Label>
          <Input
            id="health-weight"
            required
            maxLength={20}
            placeholder="e.g. 65 kg"
            value={values.weight}
            onChange={(event) => setField("weight", event.currentTarget.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="health-marital-status">Marital status</Label>
          <Input
            id="health-marital-status"
            maxLength={80}
            value={values.maritalStatus ?? ""}
            onChange={(event) => setField("maritalStatus", event.currentTarget.value)}
          />
        </div>
      </div>

      <fieldset className="space-y-3">
        <legend className="text-sm font-semibold">Health history</legend>
        <p className="text-xs text-muted-foreground">
          Select all that apply. Unchecked items are saved as not reported.
        </p>
        <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
          {([
            ["hasAllergies", "Allergies"],
            ["hasDiabetes", "Diabetes"],
            ["hasPastSurgeries", "Past surgeries"],
            ["smokingStatus", "Smoking"],
            ["pregnancyStatus", "Pregnancy"],
            ["recentAnxiety", "Recent anxiety"],
            ["recentDepression", "Recent depression"],
          ] as const).map(([field, label]) => (
            <label key={field} className="flex min-h-10 items-center gap-2 rounded-lg border px-3 text-sm">
              <input
                type="checkbox"
                checked={values[field]}
                onChange={(event) => setField(field, event.currentTarget.checked)}
                className="size-4 accent-primary"
              />
              {label}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="health-diet">Dietary preferences</Label>
          <textarea
            id="health-diet"
            maxLength={1000}
            rows={3}
            value={values.dietaryPreferences ?? ""}
            onChange={(event) => setField("dietaryPreferences", event.currentTarget.value)}
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="health-mental-history">Mental health history</Label>
          <textarea
            id="health-mental-history"
            maxLength={1000}
            rows={3}
            value={values.mentalHealthHistory ?? ""}
            onChange={(event) => setField("mentalHealthHistory", event.currentTarget.value)}
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="health-immunization">Immunization status</Label>
          <textarea
            id="health-immunization"
            maxLength={1000}
            rows={2}
            value={values.immunizationStatus ?? ""}
            onChange={(event) => setField("immunizationStatus", event.currentTarget.value)}
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          />
        </div>
      </div>

      {formError && (
        <p className="text-sm text-destructive" role="alert">{formError}</p>
      )}
      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSaving}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSaving}>
          {isSaving
            ? <LoaderCircle className="animate-spin" aria-hidden="true" />
            : <Save aria-hidden="true" />}
          {isSaving ? "Saving..." : "Save health information"}
        </Button>
      </div>
    </form>
  )
}

const getReportTitle = (report: IPatientMedicalReport) =>
  report.reportName.trim() || "Medical report"

const HealthRecords = () => {
  const queryClient = useQueryClient()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [uploadError, setUploadError] = useState("")
  const [actionMessage, setActionMessage] = useState("")
  const [reportToDelete, setReportToDelete] = useState<IPatientMedicalReport | null>(null)
  const [isEditingHealthInfo, setIsEditingHealthInfo] = useState(false)

  const recordsQuery = useQuery({
    queryKey: ["patient-health-records"],
    queryFn: getMyHealthRecords,
  })

  const uploadMutation = useMutation({
    mutationFn: updateMyHealthRecords,
    onSuccess: async () => {
      setSelectedFiles([])
      setUploadError("")
      setActionMessage("Your reports were uploaded.")
      if (fileInputRef.current) fileInputRef.current.value = ""
      await queryClient.invalidateQueries({ queryKey: ["patient-health-records"] })
    },
    onError: (error) => {
      setUploadError(getErrorMessage(error))
      setActionMessage("")
    },
  })

  const healthInfoMutation = useMutation({
    mutationFn: updateMyHealthRecords,
    onSuccess: async () => {
      setIsEditingHealthInfo(false)
      setUploadError("")
      setActionMessage("Your health information was saved.")
      await queryClient.invalidateQueries({ queryKey: ["patient-health-records"] })
    },
    onError: (error) => {
      setUploadError(getErrorMessage(error))
      setActionMessage("")
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (report: IPatientMedicalReport) => {
      const formData = new FormData()
      formData.append("data", JSON.stringify({
        medicalReports: [{ shouldDelete: true, reportId: report.id }],
      }))
      return updateMyHealthRecords(formData)
    },
    onSuccess: async () => {
      setReportToDelete(null)
      setActionMessage("The report was deleted.")
      await queryClient.invalidateQueries({ queryKey: ["patient-health-records"] })
    },
    onError: (error) => {
      setUploadError(getErrorMessage(error))
      setActionMessage("")
    },
  })

  const profile: IPatientHealthProfile | undefined = recordsQuery.data
  const healthData: IPatientHealthData | null = profile?.patientHealthData ?? null
  const reports = profile?.medicalReports ?? EMPTY_REPORTS
  const isMutating = uploadMutation.isPending || healthInfoMutation.isPending || deleteMutation.isPending

  const handleFileSelection = (files: FileList | null) => {
    setUploadError("")
    setActionMessage("")
    const selected = Array.from(files ?? [])
    const totalBytes = selected.reduce((total, file) => total + file.size, 0)
    const validTypes = new Set(["application/pdf", "image/jpeg", "image/png"])

    if (selected.length > MAX_FILE_COUNT) {
      setSelectedFiles([])
      setUploadError(`Choose no more than ${MAX_FILE_COUNT} files at a time.`)
    } else if (selected.some((file) => !validTypes.has(file.type))) {
      setSelectedFiles([])
      setUploadError("Only PDF, JPG, and PNG files are supported.")
    } else if (totalBytes > MAX_TOTAL_BYTES) {
      setSelectedFiles([])
      setUploadError("The selected files must have a combined size under 10 MB.")
    } else {
      setSelectedFiles(selected)
    }
  }

  const uploadSelectedFiles = () => {
    if (selectedFiles.length === 0) return

    const formData = new FormData()
    formData.append("data", JSON.stringify({}))
    selectedFiles.forEach((file) => formData.append("medicalReports", file))
    setActionMessage("")
    uploadMutation.mutate(formData)
  }

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Health records</h1>
        <p className="text-sm text-muted-foreground">
          Keep your health information and medical reports together in one place.
        </p>
      </header>

      {actionMessage && (
        <Alert>
          <CheckCircle2 aria-hidden="true" />
          <AlertDescription>{actionMessage}</AlertDescription>
        </Alert>
      )}
      {uploadError && (
        <Alert variant="destructive">
          <AlertCircle aria-hidden="true" />
          <AlertDescription>{uploadError}</AlertDescription>
        </Alert>
      )}

      {recordsQuery.isError ? (
        <div className="flex flex-col gap-3 rounded-xl border border-destructive/40 p-5 sm:flex-row sm:items-center sm:justify-between" role="alert">
          <p className="text-sm text-destructive">
            {getErrorMessage(recordsQuery.error)}
          </p>
          <Button type="button" variant="outline" size="sm" onClick={() => void recordsQuery.refetch()}>
            Try again
          </Button>
        </div>
      ) : recordsQuery.isPending ? (
        <div className="space-y-5" aria-label="Loading health records">
          {[0, 1].map((item) => (
            <Card key={item}>
              <CardContent className="space-y-3">
                <div className="h-5 w-48 animate-pulse rounded bg-muted" />
                <div className="h-20 animate-pulse rounded bg-muted" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <>
          <Card>
            <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="space-y-1">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <span className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <HeartPulse className="size-4" aria-hidden="true" />
                  </span>
                  Health information
                </CardTitle>
                <CardDescription>
                  Personal health details saved to your patient profile.
                </CardDescription>
              </div>
              {!isEditingHealthInfo && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={isMutating}
                  onClick={() => {
                    setUploadError("")
                    setActionMessage("")
                    setIsEditingHealthInfo(true)
                  }}
                >
                  <Pencil aria-hidden="true" />
                  {healthData ? "Edit details" : "Add details"}
                </Button>
              )}
            </CardHeader>
            <CardContent className="space-y-5">
              {isEditingHealthInfo ? (
                <HealthInformationForm
                  initialData={healthData}
                  isSaving={healthInfoMutation.isPending}
                  onCancel={() => setIsEditingHealthInfo(false)}
                  onSave={(values) => {
                    const formData = new FormData()
                    formData.append("data", JSON.stringify({ patientHealthData: values }))
                    setActionMessage("")
                    healthInfoMutation.mutate(formData)
                  }}
                />
              ) : healthData ? (
                <>
                  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    <HealthValue label="Blood group" value={healthData.bloodGroup || "Not recorded"} icon={HeartPulse} />
                    <HealthValue label="Date of birth" value={formatDate(healthData.dateOfBirth)} icon={CalendarDays} />
                    <HealthValue label="Height" value={healthData.height || "Not recorded"} icon={Ruler} />
                    <HealthValue label="Weight" value={healthData.weight || "Not recorded"} icon={Scale} />
                    <HealthValue label="Gender" value={healthData.gender || "Not recorded"} icon={HeartPulse} />
                    <HealthValue label="Marital status" value={healthData.maritalStatus || "Not recorded"} icon={MapPin} />
                  </div>

                  <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                    <HealthFlag label="Allergies" value={healthData.hasAllergies} />
                    <HealthFlag label="Diabetes" value={healthData.hasDiabetes} />
                    <HealthFlag label="Past surgeries" value={healthData.hasPastSurgeries} />
                    <HealthFlag label="Smoking" value={healthData.smokingStatus} />
                    <HealthFlag label="Pregnancy" value={healthData.pregnancyStatus} />
                    <HealthFlag label="Recent anxiety" value={healthData.recentAnxiety} />
                    <HealthFlag label="Recent depression" value={healthData.recentDepression} />
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    {healthData.dietaryPreferences && (
                      <div className="rounded-lg border p-3">
                        <p className="text-xs font-medium text-muted-foreground">Dietary preferences</p>
                        <p className="mt-1 whitespace-pre-wrap text-sm">{healthData.dietaryPreferences}</p>
                      </div>
                    )}
                    {healthData.mentalHealthHistory && (
                      <div className="rounded-lg border p-3">
                        <p className="text-xs font-medium text-muted-foreground">Mental health history</p>
                        <p className="mt-1 whitespace-pre-wrap text-sm">{healthData.mentalHealthHistory}</p>
                      </div>
                    )}
                    {healthData.immunizationStatus && (
                      <div className="rounded-lg border p-3">
                        <p className="text-xs font-medium text-muted-foreground">Immunization status</p>
                        <p className="mt-1 whitespace-pre-wrap text-sm">{healthData.immunizationStatus}</p>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="rounded-xl border border-dashed p-6 text-center">
                  <HeartPulse className="mx-auto size-6 text-muted-foreground" aria-hidden="true" />
                  <p className="mt-2 font-medium">No health information saved</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Health details will appear here once they have been added to your patient profile.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <span className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <ClipboardPlus className="size-4" aria-hidden="true" />
                </span>
                Medical reports
              </CardTitle>
              <CardDescription>
                Upload lab results, scans, or other reports. PDF, JPG, and PNG files are supported, up to 10 MB total per upload.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-3 rounded-xl border border-dashed p-4">
                <Label htmlFor="medical-reports">Choose reports</Label>
                <Input
                  ref={fileInputRef}
                  id="medical-reports"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                  multiple
                  disabled={isMutating || isEditingHealthInfo}
                  onChange={(event) => handleFileSelection(event.currentTarget.files)}
                />
                {selectedFiles.length > 0 && (
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    {selectedFiles.map((file) => (
                      <li key={`${file.name}-${file.lastModified}`} className="flex items-center gap-2">
                        {file.type === "application/pdf"
                          ? <FileText className="size-4 shrink-0" aria-hidden="true" />
                          : <FileImage className="size-4 shrink-0" aria-hidden="true" />}
                        <span className="min-w-0 flex-1 truncate">{file.name}</span>
                        <span className="shrink-0">{formatFileSize(file.size)}</span>
                      </li>
                    ))}
                  </ul>
                )}
                <Button
                  type="button"
                  onClick={uploadSelectedFiles}
                  disabled={selectedFiles.length === 0 || isMutating || isEditingHealthInfo}
                >
                  {uploadMutation.isPending
                    ? <LoaderCircle className="animate-spin" aria-hidden="true" />
                    : <Upload aria-hidden="true" />}
                  {uploadMutation.isPending ? "Uploading..." : "Upload reports"}
                </Button>
              </div>

              {reports.length === 0 ? (
                <div className="rounded-xl border border-dashed p-6 text-center">
                  <FileText className="mx-auto size-6 text-muted-foreground" aria-hidden="true" />
                  <p className="mt-2 font-medium">No medical reports yet</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Uploaded files will be listed here for you to review later.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {reports.map((report) => {
                    const reportUrl = getSafeReportUrl(report.reportLink)
                    return (
                      <div
                        key={report.id}
                        className="flex flex-col gap-3 rounded-xl border p-3 sm:flex-row sm:items-center"
                      >
                        <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                          <FileText className="size-5" aria-hidden="true" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold">{getReportTitle(report)}</p>
                          <p className="text-xs text-muted-foreground">
                            Added {formatDate(report.createdAt)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {reportUrl ? (
                            <a
                              href={reportUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex h-9 items-center gap-2 rounded-md border px-3 text-sm font-medium hover:bg-muted"
                            >
                              Open
                              <ExternalLink className="size-4" aria-hidden="true" />
                            </a>
                          ) : (
                            <span className="text-xs text-muted-foreground">File unavailable</span>
                          )}
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            aria-label={`Delete ${getReportTitle(report)}`}
                            disabled={isMutating}
                            onClick={() => setReportToDelete(report)}
                          >
                            <Trash2 className="size-4" aria-hidden="true" />
                          </Button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}

      <AlertDialog
        open={reportToDelete !== null}
        onOpenChange={(open) => {
          if (!open && !deleteMutation.isPending) setReportToDelete(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this medical report?</AlertDialogTitle>
            <AlertDialogDescription>
              {reportToDelete
                ? `"${getReportTitle(reportToDelete)}" will be removed from your health records.`
                : "This report will be removed from your health records."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>Keep report</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={!reportToDelete || deleteMutation.isPending}
              onClick={() => {
                if (reportToDelete) deleteMutation.mutate(reportToDelete)
              }}
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete report"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default HealthRecords
