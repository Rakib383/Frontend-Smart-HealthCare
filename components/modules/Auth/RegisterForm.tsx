"use client"

import { registerPatientAction } from "@/app/(commonLayout)/(authRouteGroup)/register/_action"
import { AppField } from "@/components/shared/form/appField"
import AppSubmitButton from "@/components/shared/form/appSubmitButton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { registerPatientZodSchema } from "@/zod/auth.validation"
import { useForm } from "@tanstack/react-form"
import { useMutation } from "@tanstack/react-query"
import { Eye, EyeOff, Stethoscope } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function RegisterForm() {
    const router = useRouter()
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [submitError, setSubmitError] = useState<string | null>(null)
    const { mutateAsync, isPending } = useMutation({ mutationFn: registerPatientAction })

    const form = useForm({
        defaultValues: {
            name: "",
            email: "",
            password: "",
            confirmPassword: "",
        },
        onSubmit: async ({ value }) => {
            setSubmitError(null)
            const result = await mutateAsync(value)
            if (!result.success) {
                setSubmitError(result.message)
                return
            }

            router.push(`/verify-email?email=${encodeURIComponent(value.email.trim())}`)
        },
    })

    return (
        <main className="flex min-h-dvh items-center justify-center bg-[#e8f7f1] px-4 py-10 sm:px-6">
            <Card className="mx-auto w-full max-w-md border border-emerald-900/10 bg-white shadow-xl shadow-emerald-950/10">
                <CardHeader className="gap-2">
                    <span className="flex size-11 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800">
                        <Stethoscope className="size-5" aria-hidden="true" />
                    </span>
                    <CardTitle className="font-heading text-2xl font-extrabold text-slate-950">
                        Create your account
                    </CardTitle>
                    <CardDescription className="text-slate-600">
                        Join Healora to connect with trusted healthcare professionals.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form
                        noValidate
                        onSubmit={(event) => {
                            event.preventDefault()
                            event.stopPropagation()
                            void form.handleSubmit()
                        }}
                        className="space-y-4"
                    >
                        <form.Field name="name" validators={{ onChange: registerPatientZodSchema.shape.name }}>
                            {(field) => (
                                <AppField field={field} label="Full name" placeholder="Enter your full name" />
                            )}
                        </form.Field>
                        <form.Field name="email" validators={{ onChange: registerPatientZodSchema.shape.email }}>
                            {(field) => (
                                <AppField field={field} label="Email" type="email" placeholder="Enter your email" />
                            )}
                        </form.Field>
                        <form.Field name="password" validators={{ onChange: registerPatientZodSchema.shape.password }}>
                            {(field) => (
                                <AppField
                                    field={field}
                                    label="Password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Create a password"
                                    append={
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            aria-label={showPassword ? "Hide password" : "Show password"}
                                            onClick={() => setShowPassword((visible) => !visible)}
                                            onMouseDown={(event) => event.preventDefault()}
                                            style={{ translate: "none" }}
                                            className="pointer-events-auto text-emerald-800 hover:bg-emerald-50 hover:text-emerald-950"
                                        >
                                            {showPassword
                                                ? <EyeOff className="size-4" aria-hidden="true" />
                                                : <Eye className="size-4" aria-hidden="true" />}
                                        </Button>
                                    }
                                />
                            )}
                        </form.Field>
                        <form.Field
                            name="confirmPassword"
                            validators={{
                                onChange: ({ value }) => {
                                    if (!value) return "Confirm your password"
                                    return value === form.getFieldValue("password") ? undefined : "Passwords do not match"
                                },
                            }}
                        >
                            {(field) => (
                                <AppField
                                    field={field}
                                    label="Confirm password"
                                    type={showConfirmPassword ? "text" : "password"}
                                    placeholder="Re-enter your password"
                                    append={
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                                            onClick={() => setShowConfirmPassword((visible) => !visible)}
                                            onMouseDown={(event) => event.preventDefault()}
                                            style={{ translate: "none" }}
                                            className="pointer-events-auto text-emerald-800 hover:bg-emerald-50 hover:text-emerald-950"
                                        >
                                            {showConfirmPassword
                                                ? <EyeOff className="size-4" aria-hidden="true" />
                                                : <Eye className="size-4" aria-hidden="true" />}
                                        </Button>
                                    }
                                />
                            )}
                        </form.Field>
                        {submitError && (
                            <Alert variant="destructive">
                                <AlertDescription>{submitError}</AlertDescription>
                            </Alert>
                        )}
                        <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
                            {([canSubmit, isSubmitting]) => (
                                <AppSubmitButton
                                    isPending={isSubmitting || isPending}
                                    pendingLabel="Creating account..."
                                    disabled={!canSubmit}
                                    className="h-11 bg-emerald-800 text-white hover:bg-emerald-900"
                                >
                                    Create account
                                </AppSubmitButton>
                            )}
                        </form.Subscribe>
                    </form>
                </CardContent>
                <CardFooter className="justify-center border-t pt-4">
                    <p className="text-sm text-muted-foreground">
                        Already have an account?
                        <Link href="/login" className="ml-1 font-medium text-emerald-800 hover:text-emerald-950 hover:underline underline-offset-4">
                            Sign in
                        </Link>
                    </p>
                </CardFooter>
            </Card>
        </main>
    )
}
