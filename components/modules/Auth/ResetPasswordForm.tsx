"use client"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { requestPasswordResetOtp, resetPassword } from "@/services/auth.services"
import {
  type IResetPasswordFormValues,
  type IResetPasswordPayload,
  requestPasswordResetSchema,
  resetPasswordFormSchema,
} from "@/zod/auth.validation"
import { useMutation } from "@tanstack/react-query"
import { ArrowLeft, CheckCircle2, Eye, EyeOff, KeyRound, MailCheck, ShieldCheck } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, type FormEvent } from "react"

type ResetPasswordFieldName = "otp" | "newPassword" | "confirmPassword"

const PasswordField = ({
  id,
  label,
  value,
  error,
  onChange,
}: {
  id: "newPassword" | "confirmPassword"
  label: string
  value: string
  error?: string
  onChange: (value: string) => void
}) => {
  const [visible, setVisible] = useState(false)

  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className={error ? "text-destructive" : undefined}>{label}</Label>
      <div className="relative">
        <Input
          id={id}
          name={id}
          type={visible ? "text" : "password"}
          autoComplete="new-password"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
          className="pr-11"
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
      {error && <p id={`${id}-error`} className="text-sm text-destructive" role="alert">{error}</p>}
    </div>
  )
}

const ResetPasswordForm = ({ initialEmail }: { initialEmail: string }) => {
  const router = useRouter()
  const [email, setEmail] = useState(initialEmail)
  const [emailError, setEmailError] = useState<string | null>(null)
  const [codeSent, setCodeSent] = useState(false)
  const [values, setValues] = useState<IResetPasswordFormValues>({
    email: initialEmail,
    otp: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<ResetPasswordFieldName, string>>>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [complete, setComplete] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const requestMutation = useMutation({ mutationFn: requestPasswordResetOtp })
  const resetMutation = useMutation({
    mutationFn: (payload: IResetPasswordPayload) => resetPassword(payload),
  })

  const handleRequestCode = async (event?: FormEvent<HTMLFormElement>) => {
    event?.preventDefault()
    setEmailError(null)
    setFormError(null)
    setSuccessMessage(null)

    const parsedEmail = requestPasswordResetSchema.safeParse({ email })
    if (!parsedEmail.success) {
      setEmailError(parsedEmail.error.issues[0]?.message ?? "Enter a valid email address.")
      return
    }

    try {
      const result = await requestMutation.mutateAsync(parsedEmail.data.email)
      if (!result.success) {
        setFormError(result.message)
        return
      }

      setEmail(parsedEmail.data.email)
      setValues((current) => ({
        ...current,
        email: parsedEmail.data.email,
        otp: "",
      }))
      setFieldErrors({})
      setCodeSent(true)
      setSuccessMessage(result.message || "A reset code has been sent to your email.")
      router.replace(`/reset-password?email=${encodeURIComponent(parsedEmail.data.email)}`)
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Unable to send a reset code.")
    }
  }

  const handleFieldChange = (name: ResetPasswordFieldName, value: string) => {
    setValues((current) => ({ ...current, [name]: value }))
    setFieldErrors((current) => ({ ...current, [name]: undefined }))
    setFormError(null)
    setSuccessMessage(null)
  }

  const handleReset = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setFormError(null)
    setSuccessMessage(null)

    const parsed = resetPasswordFormSchema.safeParse({ ...values, email })
    if (!parsed.success) {
      const nextErrors: Partial<Record<ResetPasswordFieldName, string>> = {}
      for (const issue of parsed.error.issues) {
        const field = issue.path[0]
        if (
          (field === "otp" || field === "newPassword" || field === "confirmPassword")
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
      const result = await resetMutation.mutateAsync({
        email: parsed.data.email,
        otp: parsed.data.otp,
        newPassword: parsed.data.newPassword,
      })
      if (!result.success) {
        setFormError(result.message)
        return
      }

      setComplete(true)
      setSuccessMessage(result.message)
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Unable to reset your password.")
    }
  }

  return (
    <main className="flex min-h-dvh items-center justify-center bg-[#e8f7f1] px-4 py-10 sm:px-6">
      <Card className="mx-auto w-full max-w-md border border-emerald-900/10 bg-white shadow-xl shadow-emerald-950/10">
        <CardHeader className="gap-3">
          <span className="flex size-11 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800">
            {complete
              ? <CheckCircle2 className="size-5" aria-hidden="true" />
              : codeSent
                ? <ShieldCheck className="size-5" aria-hidden="true" />
                : <KeyRound className="size-5" aria-hidden="true" />}
          </span>
          <div className="space-y-1">
            <CardTitle className="font-heading text-2xl font-extrabold text-slate-950">
              {complete ? "Password reset complete" : "Reset your password"}
            </CardTitle>
            <CardDescription className="text-slate-600">
              {complete
                ? "Your password has been updated. Sign in with your new password to continue."
                : codeSent
                  ? `Enter the code sent to ${email}, then choose a new password.`
                  : "Enter your account email and we'll send you a secure, one-time reset code."}
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-5">
          {formError && (
            <Alert variant="destructive">
              <AlertDescription>{formError}</AlertDescription>
            </Alert>
          )}

          {complete ? (
            <Alert>
              <CheckCircle2 aria-hidden="true" />
              <AlertTitle>Password updated</AlertTitle>
              <AlertDescription>
                {successMessage} For your security, please sign in again.
              </AlertDescription>
            </Alert>
          ) : !codeSent ? (
            <form noValidate onSubmit={handleRequestCode} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="reset-email" className={emailError ? "text-destructive" : undefined}>
                  Email address
                </Label>
                <Input
                  id="reset-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={email}
                  readOnly={Boolean(initialEmail)}
                  onChange={(event) => {
                    setEmail(event.target.value)
                    setEmailError(null)
                    setFormError(null)
                  }}
                  aria-invalid={Boolean(emailError)}
                  aria-describedby={emailError ? "reset-email-error" : undefined}
                  className={initialEmail ? "bg-muted/50" : undefined}
                  required
                />
                {emailError && (
                  <p id="reset-email-error" className="text-sm text-destructive" role="alert">
                    {emailError}
                  </p>
                )}
              </div>
              <Button
                type="submit"
                disabled={requestMutation.isPending}
                className="h-11 w-full bg-emerald-800 text-white hover:bg-emerald-900"
              >
                <MailCheck aria-hidden="true" />
                {requestMutation.isPending ? "Sending code..." : "Send reset code"}
              </Button>
            </form>
          ) : (
            <form noValidate onSubmit={handleReset} className="space-y-4">
              {successMessage && (
                <Alert>
                  <MailCheck aria-hidden="true" />
                  <AlertDescription>{successMessage}</AlertDescription>
                </Alert>
              )}
              <div className="space-y-1.5">
                <Label htmlFor="reset-email-locked">Email address</Label>
                <Input
                  id="reset-email-locked"
                  type="email"
                  value={email}
                  readOnly
                  aria-readonly="true"
                  className="bg-muted/50"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="reset-otp" className={fieldErrors.otp ? "text-destructive" : undefined}>
                  6-digit verification code
                </Label>
                <Input
                  id="reset-otp"
                  name="otp"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  placeholder="000000"
                  maxLength={6}
                  value={values.otp}
                  onChange={(event) => handleFieldChange("otp", event.target.value.replace(/\D/g, "").slice(0, 6))}
                  aria-invalid={Boolean(fieldErrors.otp)}
                  aria-describedby={fieldErrors.otp ? "reset-otp-error" : undefined}
                  className="h-11 text-center font-mono text-lg tracking-[0.35em]"
                  required
                />
                {fieldErrors.otp && (
                  <p id="reset-otp-error" className="text-sm text-destructive" role="alert">{fieldErrors.otp}</p>
                )}
              </div>
              <PasswordField
                id="newPassword"
                label="New password"
                value={values.newPassword}
                error={fieldErrors.newPassword}
                onChange={(value) => handleFieldChange("newPassword", value)}
              />
              <p className="-mt-2 text-xs text-muted-foreground">
                Use 8 to 128 characters.
              </p>
              <PasswordField
                id="confirmPassword"
                label="Confirm new password"
                value={values.confirmPassword}
                error={fieldErrors.confirmPassword}
                onChange={(value) => handleFieldChange("confirmPassword", value)}
              />
              <Button
                type="submit"
                disabled={resetMutation.isPending}
                className="h-11 w-full bg-emerald-800 text-white hover:bg-emerald-900"
              >
                {resetMutation.isPending ? "Resetting password..." : "Reset password"}
              </Button>
              <div className="text-center">
                <Button
                  type="button"
                  variant="link"
                  disabled={requestMutation.isPending}
                  onClick={() => void handleRequestCode()}
                  className="text-emerald-800"
                >
                  {requestMutation.isPending ? "Sending code..." : "Didn't receive a code? Resend"}
                </Button>
              </div>
            </form>
          )}
        </CardContent>

        <CardFooter className="justify-center border-t pt-4">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-sm font-medium text-emerald-800 hover:text-emerald-950 hover:underline underline-offset-4"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            Back to sign in
          </Link>
        </CardFooter>
      </Card>
    </main>
  )
}

export default ResetPasswordForm
