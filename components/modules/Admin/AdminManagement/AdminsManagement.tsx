"use client"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { toast } from "@/components/ui/toast"
import { changeAdminRole, changeUserStatus, deleteAdmin, getAdmins, IManagedAdmin, updateAdmin } from "@/services/admin.services"
import type { UserRole } from "@/lib/authUtils"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import axios from "axios"
import { LoaderCircle, Pencil, Search, ShieldCheck, Trash2, Users } from "lucide-react"
import { useMemo, useState, type FormEvent } from "react"
import { z } from "zod"

interface AdminsManagementProps {
  currentUserId: string
  currentUserRole: UserRole
}

const editAdminSchema = z.object({
  name: z.string().trim().min(1, "Enter the admin's name."),
  contactNumber: z.string().trim().refine(
    (value) => value.length === 0 || (value.length >= 11 && value.length <= 14),
    "Contact number must be 11–14 characters, or left blank.",
  ),
  profilePhoto: z.string().trim().refine(
    (value) => value.length === 0 || z.url().safeParse(value).success,
    "Enter a valid profile photo URL, or leave it blank.",
  ),
})

type AdminEditValues = z.infer<typeof editAdminSchema>
const EMPTY_ADMINS: IManagedAdmin[] = []

const getErrorMessage = (error: unknown) => {
  if (axios.isAxiosError<{ message?: string }>(error)) {
    return error.response?.data?.message ?? "The request could not be completed. Please try again."
  }
  return error instanceof Error ? error.message : "The request could not be completed. Please try again."
}

const statusLabel = (status: string) => status.toLowerCase().replaceAll("_", " ")

export default function AdminsManagement({ currentUserId, currentUserRole }: AdminsManagementProps) {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState("")
  const [editingAdmin, setEditingAdmin] = useState<IManagedAdmin | null>(null)
  const [deletingAdmin, setDeletingAdmin] = useState<IManagedAdmin | null>(null)
  const [editValues, setEditValues] = useState<AdminEditValues>({ name: "", contactNumber: "", profilePhoto: "" })
  const [editError, setEditError] = useState("")
  const [editFieldErrors, setEditFieldErrors] = useState<Partial<Record<keyof AdminEditValues, string>>>({})
  const canManageAdmins = currentUserRole === "SUPER_ADMIN"

  const adminsQuery = useQuery({
    queryKey: ["admins"],
    queryFn: getAdmins,
  })

  const refreshAdmins = () => queryClient.invalidateQueries({ queryKey: ["admins"] })

  const updateMutation = useMutation({
    mutationFn: ({ id, values }: { id: string; values: AdminEditValues }) => updateAdmin(id, {
      admin: {
        name: values.name.trim(),
        ...(values.contactNumber.trim() ? { contactNumber: values.contactNumber.trim() } : {}),
        ...(values.profilePhoto.trim() ? { profilePhoto: values.profilePhoto.trim() } : {}),
      },
    }),
    onSuccess: async () => {
      await refreshAdmins()
      setEditingAdmin(null)
      toast.add({ title: "Admin profile updated", type: "success" })
    },
    onError: (error) => setEditError(getErrorMessage(error)),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteAdmin(id),
    onSuccess: async () => {
      await refreshAdmins()
      setDeletingAdmin(null)
      toast.add({ title: "Admin account deleted", description: "The account was deactivated.", type: "success" })
    },
    onError: (error) => toast.add({ title: "Could not delete admin", description: getErrorMessage(error), type: "error" }),
  })

  const statusMutation = useMutation({
    mutationFn: changeUserStatus,
    onSuccess: async () => {
      await refreshAdmins()
      toast.add({ title: "Account status updated", type: "success" })
    },
    onError: (error) => toast.add({ title: "Could not update status", description: getErrorMessage(error), type: "error" }),
  })

  const roleMutation = useMutation({
    mutationFn: changeAdminRole,
    onSuccess: async () => {
      await refreshAdmins()
      toast.add({ title: "Account role updated", type: "success" })
    },
    onError: (error) => toast.add({ title: "Could not update role", description: getErrorMessage(error), type: "error" }),
  })

  const admins = adminsQuery.data?.data ?? EMPTY_ADMINS
  const filteredAdmins = useMemo(() => {
    const term = search.trim().toLowerCase()
    if (!term) return admins
    return admins.filter((admin) =>
      [admin.name, admin.email, admin.user.role, admin.user.status]
        .some((value) => value.toLowerCase().includes(term)),
    )
  }, [admins, search])

  const openEdit = (admin: IManagedAdmin) => {
    setEditingAdmin(admin)
    setEditValues({
      name: admin.name,
      contactNumber: admin.contactNumber ?? "",
      profilePhoto: admin.profilePhoto ?? "",
    })
    setEditError("")
    setEditFieldErrors({})
  }

  const handleUpdate = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!editingAdmin) return

    const parsed = editAdminSchema.safeParse(editValues)
    if (!parsed.success) {
      const nextErrors: Partial<Record<keyof AdminEditValues, string>> = {}
      for (const issue of parsed.error.issues) {
        const field = issue.path[0]
        if (typeof field === "string" && field in editValues) {
          nextErrors[field as keyof AdminEditValues] ??= issue.message
        }
      }
      setEditFieldErrors(nextErrors)
      return
    }

    setEditError("")
    setEditFieldErrors({})
    updateMutation.mutate({ id: editingAdmin.id, values: parsed.data })
  }

  if (adminsQuery.isLoading) {
    return (
      <div className="flex min-h-48 items-center justify-center gap-2 text-sm text-muted-foreground" role="status">
        <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
        Loading admin accounts...
      </div>
    )
  }

  if (adminsQuery.isError) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          {getErrorMessage(adminsQuery.error)}
          <Button type="button" variant="outline" size="sm" className="ml-3" onClick={() => void adminsQuery.refetch()}>
            Retry
          </Button>
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Admin management</h1>
          <p className="text-sm text-muted-foreground">
            Review admin accounts and manage their profile, access, and role.
          </p>
        </div>
        <Badge variant="secondary" className="w-fit gap-1.5">
          <Users className="size-3.5" aria-hidden="true" />
          {admins.length} account{admins.length === 1 ? "" : "s"}
        </Badge>
      </header>

      {!canManageAdmins && (
        <Alert>
          <ShieldCheck className="size-4" aria-hidden="true" />
          <AlertDescription>
            You can view admin accounts. Only a super admin can edit, change roles, or delete admin accounts.
          </AlertDescription>
        </Alert>
      )}

      <section className="overflow-hidden rounded-xl border bg-card">
        <div className="flex flex-col gap-3 border-b p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-semibold">Admin accounts</h2>
          </div>
          <div className="relative w-full sm:max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <Input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search admins"
              aria-label="Search admin accounts"
              className="pl-9"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Admin</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAdmins.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-28 text-center text-muted-foreground">
                    {admins.length === 0 ? "No admin accounts found." : "No admins match your search."}
                  </TableCell>
                </TableRow>
              ) : filteredAdmins.map((admin) => {
                const isSelf = admin.userId === currentUserId || admin.user.id === currentUserId
                const isDeleted = admin.isDeleted || admin.user.isDeleted || admin.user.status === "DELETED"
                const canChangeStatus = canManageAdmins && !isSelf && !isDeleted
                const canChangeRole = canManageAdmins && !isSelf && !isDeleted

                return (
                  <TableRow key={admin.id}>
                    <TableCell>
                      <div className="flex min-w-52 items-center gap-3">
                        <Avatar className="size-9">
                          {admin.profilePhoto && <AvatarImage src={admin.profilePhoto} alt="" />}
                          <AvatarFallback>{admin.name.trim().charAt(0).toUpperCase() || "?"}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="truncate font-medium">{admin.name}{isSelf ? " (You)" : ""}</p>
                          <p className="truncate text-xs text-muted-foreground">{admin.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="min-w-40">
                      {canChangeRole ? (
                        <Select
                          value={admin.user.role}
                          onValueChange={(value) => {
                            if (value === "ADMIN" || value === "SUPER_ADMIN") {
                              roleMutation.mutate({ userId: admin.userId, role: value })
                            }
                          }}
                          disabled={roleMutation.isPending}
                        >
                          <SelectTrigger aria-label={`Role for ${admin.name}`} className="w-36">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ADMIN">Admin</SelectItem>
                            <SelectItem value="SUPER_ADMIN">Super admin</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <Badge variant="outline">{admin.user.role === "SUPER_ADMIN" ? "Super admin" : "Admin"}</Badge>
                      )}
                    </TableCell>
                    <TableCell className="min-w-36">
                      {canChangeStatus ? (
                        <Select
                          value={admin.user.status}
                          onValueChange={(value) => {
                            if (value === "ACTIVE" || value === "BLOCKED") {
                              statusMutation.mutate({ userId: admin.userId, userStatus: value })
                            }
                          }}
                          disabled={statusMutation.isPending}
                        >
                          <SelectTrigger aria-label={`Status for ${admin.name}`} className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ACTIVE">Active</SelectItem>
                            <SelectItem value="BLOCKED">Blocked</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <Badge variant={isDeleted || admin.user.status === "BLOCKED" ? "destructive" : "secondary"}>
                          {isDeleted ? "Deleted" : statusLabel(admin.user.status)}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">{admin.contactNumber || "Not provided"}</TableCell>
                    <TableCell className="whitespace-nowrap">
                      {admin.createdAt ? new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(new Date(admin.createdAt)) : "—"}
                    </TableCell>
                    <TableCell>
                      {canManageAdmins && !isDeleted ? (
                        <div className="flex justify-end gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => openEdit(admin)}
                            aria-label={`Edit ${admin.name}`}
                          >
                            <Pencil className="size-4" aria-hidden="true" />
                            <span className="sr-only sm:not-sr-only sm:ml-1">Edit</span>
                          </Button>
                          {!isSelf && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                              onClick={() => setDeletingAdmin(admin)}
                              aria-label={`Delete ${admin.name}`}
                            >
                              <Trash2 className="size-4" aria-hidden="true" />
                              <span className="sr-only sm:not-sr-only sm:ml-1">Delete</span>
                            </Button>
                          )}
                        </div>
                      ) : (
                        <span className="block text-right text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      </section>

      <Dialog
        open={Boolean(editingAdmin)}
        onOpenChange={(open) => {
          if (!updateMutation.isPending && !open) setEditingAdmin(null)
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit admin profile</DialogTitle>
            <DialogDescription>
              Update profile details for {editingAdmin?.name}. Email and account identity are managed by the backend.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdate} className="space-y-4 p-5">
            <div className="space-y-1.5">
              <Label htmlFor="admin-name">Name</Label>
              <Input
                id="admin-name"
                value={editValues.name}
                onChange={(event) => {
                  setEditValues((values) => ({ ...values, name: event.target.value }))
                  setEditFieldErrors((errors) => ({ ...errors, name: undefined }))
                }}
                aria-invalid={Boolean(editFieldErrors.name)}
                aria-describedby={editFieldErrors.name ? "admin-name-error" : undefined}
              />
              {editFieldErrors.name && <p id="admin-name-error" className="text-sm text-destructive">{editFieldErrors.name}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="admin-contact">Contact number</Label>
              <Input
                id="admin-contact"
                value={editValues.contactNumber}
                onChange={(event) => {
                  setEditValues((values) => ({ ...values, contactNumber: event.target.value }))
                  setEditFieldErrors((errors) => ({ ...errors, contactNumber: undefined }))
                }}
                aria-invalid={Boolean(editFieldErrors.contactNumber)}
                aria-describedby={editFieldErrors.contactNumber ? "admin-contact-error" : undefined}
              />
              {editFieldErrors.contactNumber && <p id="admin-contact-error" className="text-sm text-destructive">{editFieldErrors.contactNumber}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="admin-photo">Profile photo URL</Label>
              <Input
                id="admin-photo"
                type="url"
                value={editValues.profilePhoto}
                onChange={(event) => {
                  setEditValues((values) => ({ ...values, profilePhoto: event.target.value }))
                  setEditFieldErrors((errors) => ({ ...errors, profilePhoto: undefined }))
                }}
                aria-invalid={Boolean(editFieldErrors.profilePhoto)}
                aria-describedby={editFieldErrors.profilePhoto ? "admin-photo-error" : undefined}
              />
              {editFieldErrors.profilePhoto && <p id="admin-photo-error" className="text-sm text-destructive">{editFieldErrors.profilePhoto}</p>}
            </div>
            {editError && <Alert variant="destructive"><AlertDescription>{editError}</AlertDescription></Alert>}
            <DialogFooter className="border-t pt-4">
              <Button type="button" variant="outline" onClick={() => setEditingAdmin(null)} disabled={updateMutation.isPending}>
                Cancel
              </Button>
              <Button type="submit" disabled={updateMutation.isPending} className="bg-emerald-800 text-white hover:bg-emerald-900">
                {updateMutation.isPending && <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />}
                Save changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={Boolean(deletingAdmin)}
        onOpenChange={(open) => {
          if (!deleteMutation.isPending && !open) setDeletingAdmin(null)
        }}
      >
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete admin account?</AlertDialogTitle>
            <AlertDialogDescription>
              {deletingAdmin?.name}&apos;s account will be deactivated and their active sessions removed. This cannot be undone from this screen.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>Cancel</AlertDialogCancel>
            <Button
              type="button"
              variant="destructive"
              onClick={() => {
                if (deletingAdmin) deleteMutation.mutate(deletingAdmin.id)
              }}
              disabled={!deletingAdmin || deleteMutation.isPending}
            >
              {deleteMutation.isPending && <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />}
              Delete admin
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
