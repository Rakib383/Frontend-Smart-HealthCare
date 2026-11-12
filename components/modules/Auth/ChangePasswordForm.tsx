"use client"

import { changePassword } from "@/services/auth.services"
import {
  type IChangePasswordFormValues,
  type IChangePasswordPayload,
  changePasswordFormSchema,
} from "@/zod/auth.validation"
import AppSubmitButton from "@/components/shared/form/appSubmitButton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useMutation } from "@tanstack/react-query"
import { Eye, EyeOff, KeyRound, ShieldCheck } from "lucide-react"
import { useState, type FormEvent } from "react"

type PasswordFieldName = keyof IChangePasswordFormValues

const PasswordField = ({
  name,
  label,
  autoComplete,
  value,
  error,
  onChange,
}: {
  name: PasswordFieldName
  label: string
  autoComplete: string
  value: string
  error?: string
  onChange: (name: PasswordFieldName, value: string) => void
}) => {
  const [visible, setVisible] = useState(false)

  return (
    <div className="space-y-1.5">
      <Label htmlFor={name} className={error ? "text-destructive" : undefined}>
        {label}
      </Label>
      <div className="relative">
        <Input
          id={name}
          name={name}
          type={visible ? "text" : "password"}
          autoComplete={autoComplete}
          value={value}
          onChange={(event) => onChange(name, event.target.value)}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${name}-error` : undefined}
          className={error ? "border-destructive pr-11" : "pr-11"}
          required
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={visible ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`}
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => setVisible((current) => !current)}
          style={{ translate: "0 -50%" }}
          className="absolute right-1 top-1/2 text-muted-foreground"
        >
          {visible
            ? <EyeOff className="size-4" aria-hidden="true" />
            : <Eye className="size-4" aria-hidden="true" />}
        </Button>
      </div>
      {error && (
        <p id={`${name}-error`} className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}

const ChangePasswordForm = () => {
  const [values, setValues] = useState<IChangePasswordFormValues>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<PasswordFieldName, string>>>({})
  const [serverError, setServerError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const mutation = useMutation({
    mutationFn: (payload: IChangePasswordPayload) => changePassword(payload),
  })

  const updateField = (name: PasswordFieldName, value: string) => {
    setValues((current) => ({ ...current, [name]: value }))
    setFieldErrors((current) => ({ ...current, [name]: undefined }))
    setServerError(null)
    setSuccessMessage(null)
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setServerError(null)
    setSuccessMessage(null)

    const parsed = changePasswordFormSchema.safeParse(values)
    if (!parsed.success) {
      const nextErrors: Partial<Record<PasswordFieldName, string>> = {}
      for (const issue of parsed.error.issues) {
        const field = issue.path[0]
        if (
          (field === "currentPassword" || field === "newPassword" || field === "confirmPassword")
          && !nextErrors[field]
        ) {
          nextErrors[field] = issue.message
        }
      }
      setFieldErrors(nextErrors)
      return
    }

    setFieldErrors({})
    try {
      const result = await mutation.mutateAsync({
        currentPassword: parsed.data.currentPassword,
        newPassword: parsed.data.newPassword,
      })
      if (!result.success) {
        setServerError(result.message)
        return
      }
      setValues({ currentPassword: "", newPassword: "", confirmPassword: "" })
      setSuccessMessage(`${result.message} Other active sessions have been signed out.`)
    } catch (error) {
      setServerError(error instanceof Error ? error.message : "Unable to change your password.")
    }
  }

  return (
    <Card>
      <CardHeader className="border-b">
        <div className="flex items-start gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <ShieldCheck className="size-5" aria-hidden="true" />
          </span>
          <div className="space-y-1">
            <CardTitle>Update your password</CardTitle>
            <CardDescription>
              Enter your current password, then choose a new one you haven&apos;t used before.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-5 pt-5">
        {serverError && (
          <Alert variant="destructive">
            <AlertDescription>{serverError}</AlertDescription>
          </Alert>
        )}
        {successMessage && (
          <Alert>
            <KeyRound aria-hidden="true" />
            <AlertTitle>Password updated</AlertTitle>
            <AlertDescription>{successMessage}</AlertDescription>
          </Alert>
        )}
        <form onSubmit={handleSubmit} className="space-y-5">
          <PasswordField
            name="currentPassword"
            label="Current password"
            autoComplete="current-password"
            value={values.currentPassword}
            error={fieldErrors.currentPassword}
            onChange={updateField}
          />
          <PasswordField
            name="newPassword"
            label="New password"
            autoComplete="new-password"
            value={values.newPassword}
            error={fieldErrors.newPassword}
            onChange={updateField}
          />
          <p className="-mt-3 text-xs text-muted-foreground">
            Use 8 to 128 characters. Your new password must differ from your current password.
          </p>
          <PasswordField
            name="confirmPassword"
            label="Confirm new password"
            autoComplete="new-password"
            value={values.confirmPassword}
            error={fieldErrors.confirmPassword}
            onChange={updateField}
          />
          <AppSubmitButton
            isPending={mutation.isPending}
            pendingLabel="Updating password..."
            className="sm:w-auto"
          >
            Change password
          </AppSubmitButton>
        </form>
      </CardContent>
    </Card>
  )
}

export default ChangePasswordForm
