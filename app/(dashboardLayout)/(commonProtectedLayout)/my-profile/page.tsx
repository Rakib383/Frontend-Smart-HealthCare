
import { getUserInfo } from "@/services/auth.services"
import { UserRole } from "@/lib/authUtils"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CalendarDays, Mail, MapPin, Phone, ShieldCheck, UserRound } from "lucide-react"
import type { LucideIcon } from "lucide-react"

interface ProfileRecord {
  id?: string
  name?: string
  email?: string
  role?: UserRole
  status?: string
  emailVerified?: boolean
  createdAt?: string
  contactNumber?: string | null
  address?: string | null
  patient?: ProfileRecord | null
  doctor?: ProfileRecord | null
  admin?: ProfileRecord | null
}

const ProfileDetail = ({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon
  label: string
  value: string
}) => (
  <div className="flex min-w-0 items-start gap-3 rounded-xl border bg-background p-4">
    <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
      <Icon className="size-4" aria-hidden="true" />
    </span>
    <div className="min-w-0 space-y-1">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="break-words text-sm font-medium">{value}</p>
    </div>
  </div>
)

const MyProfilePage = async () => {
  const user = await getUserInfo() as ProfileRecord | null

  if (!user) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          We couldn&apos;t load your profile. Please refresh the page or sign in again.
        </AlertDescription>
      </Alert>
    )
  }

  const roleProfile = user.patient ?? user.doctor ?? user.admin
  const roleLabel = user.role?.toLowerCase().replaceAll("_", " ") ?? "user"
  const createdAt = user.createdAt
    ? new Intl.DateTimeFormat("en", { dateStyle: "long" }).format(new Date(user.createdAt))
    : "Not available"

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">My profile</h1>
        <p className="text-sm text-muted-foreground">View your account and contact details.</p>
      </header>

      <Card>
        <CardHeader className="border-b">
          <div className="flex items-center gap-4">
            <span className="flex size-14 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
              <UserRound className="size-7" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <CardTitle className="truncate text-xl">{user.name ?? "Healora user"}</CardTitle>
              <CardDescription className="mt-1 break-all">{user.email ?? "Email not available"}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="grid gap-3 pt-5 sm:grid-cols-2">
          <ProfileDetail icon={UserRound} label="Full name" value={user.name ?? "Not available"} />
          <ProfileDetail icon={Mail} label="Email address" value={user.email ?? "Not available"} />
          <ProfileDetail
            icon={ShieldCheck}
            label="Account role"
            value={roleLabel.replace(/\b\w/g, (letter) => letter.toUpperCase())}
          />
          <ProfileDetail
            icon={ShieldCheck}
            label="Email verification"
            value={user.emailVerified ? "Verified" : "Not verified"}
          />
          <ProfileDetail
            icon={ShieldCheck}
            label="Account status"
            value={user.status?.toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase()) ?? "Not available"}
          />
          <ProfileDetail icon={CalendarDays} label="Member since" value={createdAt} />
          <ProfileDetail
            icon={Phone}
            label="Phone number"
            value={roleProfile?.contactNumber || "Not provided"}
          />
          <ProfileDetail
            icon={MapPin}
            label="Address"
            value={roleProfile?.address || "Not provided"}
          />
        </CardContent>
      </Card>
    </div>
  )
}

export default MyProfilePage
