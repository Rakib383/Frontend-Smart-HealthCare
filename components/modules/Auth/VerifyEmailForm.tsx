"use client"

import { verifyEmailAction } from "@/app/(commonLayout)/(authRouteGroup)/verify-email/_action"
import { AppField } from "@/components/shared/form/appField"
import AppSubmitButton from "@/components/shared/form/appSubmitButton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { verifyEmailZodSchema } from "@/zod/auth.validation"
import { useForm } from "@tanstack/react-form"
import { useMutation } from "@tanstack/react-query"
import { MailCheck } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function VerifyEmailForm({ email }: { email: string }) {
    const router = useRouter()
    const [submitError, setSubmitError] = useState<string | null>(null)
    const { mutateAsync, isPending } = useMutation({ mutationFn: verifyEmailAction })

    const form = useForm({
        defaultValues: { email, otp: "" },
        onSubmit: async ({ value }) => {
            setSubmitError(null)
            const result = await mutateAsync(value)
            if (!result.success) {
                setSubmitError(result.message)
                return
            }

            router.replace(result.redirectPath)
        },
    })

    return (
        <main className="flex min-h-dvh items-center justify-center bg-[#e8f7f1] px-4 py-10 sm:px-6">
            <Card className="mx-auto w-full max-w-md border border-emerald-900/10 bg-white shadow-xl shadow-emerald-950/10">
                <CardHeader className="gap-2">
                    <span className="flex size-11 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800">
                        <MailCheck className="size-5" aria-hidden="true" />
                    </span>
                    <CardTitle className="font-heading text-2xl font-extrabold text-slate-950">
                        Verify your email
                    </CardTitle>
                    <CardDescription className="text-slate-600">
                        Enter the 6-digit code sent to your email address.
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
                        <form.Field name="email" validators={{ onChange: verifyEmailZodSchema.shape.email }}>
                            {(field) => (
                                <AppField
                                    field={field}
                                    label="Email"
                                    type="email"
                                    placeholder="Email used to register"
                                    readOnly
                                />
                            )}
                        </form.Field>
                        <form.Field name="otp" validators={{ onChange: verifyEmailZodSchema.shape.otp }}>
                            {(field) => (
                                <AppField
                                    field={field}
                                    label="Verification code"
                                    placeholder="Enter 6-digit code"
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
                                    pendingLabel="Verifying..."
                                    disabled={!canSubmit}
                                    className="h-11 bg-emerald-800 text-white hover:bg-emerald-900"
                                >
                                    Verify email
                                </AppSubmitButton>
                            )}
                        </form.Subscribe>
                    </form>
                </CardContent>
                <CardFooter className="justify-center border-t pt-4">
                    <p className="text-sm text-muted-foreground">
                        Wrong email?
                        <Link href="/register" className="ml-1 font-medium text-emerald-800 hover:text-emerald-950 hover:underline underline-offset-4">
                            Create an account again
                        </Link>
                    </p>
                </CardFooter>
            </Card>
        </main>
    )
}
