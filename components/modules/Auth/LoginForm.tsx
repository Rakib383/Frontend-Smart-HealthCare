"use client"

import { loginAction } from "@/app/(commonLayout)/(authRouteGroup)/login/_action"
import { AppField } from "@/components/shared/form/appField"
import AppSubmitButton from "@/components/shared/form/appSubmitButton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { ILoginPayload, loginZodSchema } from "@/zod/auth.validation"
import { useForm } from "@tanstack/react-form"
import { useMutation } from "@tanstack/react-query"
import { Eye, EyeOff, KeyRound, ShieldCheck, Stethoscope } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

interface LoginFormParams {
    redirectPath?: string;
}


const LoginForm = ({ redirectPath }: LoginFormParams) => {
    const [serverError, setServerError] = useState<string | null>(null)
    const [showPassword, setShowPassword] = useState(false)
    const [credentialsOpen, setCredentialsOpen] = useState(false)

    const testCredentials = [
        {
            role: "Admin",
            email: "superadmin@mail.com",
            password: "12345678",
            icon: ShieldCheck,
        },
        {
            role: "Doctor",
            email: "farzana.ahmed@example.com",
            password: "Doctor@321",
            icon: Stethoscope,
        },
    ]

    const { mutateAsync, isPending } = useMutation({
        mutationFn: (payload: ILoginPayload) => loginAction(payload, redirectPath),
    })


    const form = useForm({
        defaultValues: {
            email: "",
            password: ""
        },

        onSubmit: async ({ value }) => {
            try {

                const result = await mutateAsync(value)

                if ("success" in result && !result.success) {
                    setServerError(result.message)
                    return
                }

            } catch {
                setServerError("We couldn't complete sign in right now. Please try again.")

            }
        }
    })


    return (
        <main className="flex min-h-dvh items-center justify-center bg-[#e8f7f1] px-4 py-10 sm:px-6">
            <Card className="mx-auto mt-0 w-full max-w-md border border-emerald-900/10 bg-white shadow-xl shadow-emerald-950/10">
                <CardHeader className="gap-2">
                    <span className="flex size-11 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800">
                        <Stethoscope className="size-5" aria-hidden="true" />
                    </span>
                    <CardTitle className="font-heading text-2xl font-extrabold text-slate-950">
                        Welcome back
                    </CardTitle>
                    <CardDescription className="text-slate-600">
                        Sign in to continue your healthcare journey.
                    </CardDescription>
                </CardHeader>

            <CardContent className="space-y-5">
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => setCredentialsOpen(true)}
                    className="w-full border-emerald-700 text-emerald-900 hover:bg-emerald-50 hover:text-emerald-950"
                >
                    <KeyRound className="size-4" aria-hidden="true" />
                    View test credentials
                </Button>

                <form
                    method="POST"
                    action="#"
                    noValidate
                    onSubmit={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        form.handleSubmit();
                    }}
                    className="space-y-4"
                >
                    <form.Field
                        name="email"
                        validators={{ onChange: loginZodSchema.shape.email }}
                    >
                        {
                            (field) => (
                                <AppField
                                    field={field}
                                    label="Email"
                                    type="email"
                                    placeholder="Enter your email"

                                />
                            )
                        }

                    </form.Field>
                    <form.Field
                        name="password"
                        validators={{ onChange: loginZodSchema.shape.password }}
                    >
                        {
                            (field) => (
                                <AppField
                                    field={field}
                                    label="Password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Enter your password"
                                    aria-label={
                                        showPassword ? "Hide password" : "show Password"
                                    }
                                    append={
                                        <Button
                                            onClick={() => setShowPassword((value) => !value)}
                                            onMouseDown={(event) => event.preventDefault()}
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            aria-label={showPassword ? "Hide password" : "Show password"}
                                            style={{ translate: "none" }}
                                            className="pointer-events-auto text-emerald-800 hover:bg-emerald-50 hover:text-emerald-950"
                                        >
                                            {
                                                showPassword ? <EyeOff className="size-4" aria-hidden="true" /> : <Eye className="size-4" aria-hidden="true" />
                                            }
                                        </Button>
                                    }
                                />
                            )
                        }

                    </form.Field>

                    <div className="text-right mt-2">
                        <Link href="/forgot-password"
                            className="text-sm font-medium text-emerald-800 hover:text-emerald-950 hover:underline underline-offset-4"
                        >

                            Forgot Password?

                        </Link>

                    </div>

                    {
                        serverError && (
                            <Alert variant={"destructive"}>
                                <AlertDescription>
                                    {
                                        serverError
                                    }
                                </AlertDescription>
                            </Alert>
                        )
                    }

                    <form.Subscribe selector={(s) => [s.canSubmit, s.isSubmitting]}>

                        {
                            ([canSubmit, isSubmitting]) => (
                                <AppSubmitButton
                                    isPending={isSubmitting || isPending} pendingLabel="Logging In..."
                                    disabled={!canSubmit}
                                    className="h-11 bg-emerald-800 text-white hover:bg-emerald-900"
                                >
                                    Log In
                                </AppSubmitButton>
                            )
                        }

                    </form.Subscribe>

                </form>

                <div className="relative my-6" >

                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300"></div>

                    </div>

                    <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-white text-gray-500">
                            or continue with
                        </span>

                    </div>

                </div>

                <Button
                    variant="outline"
                    className="w-full border-slate-300 text-slate-800 hover:border-emerald-700 hover:bg-emerald-50"
                    onClick={() => {

                        const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

                        window.location.href = `${baseUrl}/auth/login/google`

                    }}
                >

                    Sign In With Google
                </Button>



            </CardContent>

            <CardFooter className="justify-center border-t pt-4">
                <p className="text-sm text-muted-foreground">
                    don&apos;t have an account?

                    <Link href={"/register"} className="ml-1 font-medium text-emerald-800 hover:text-emerald-950 hover:underline underline-offset-4">
                        Sign up for an account
                    </Link>
                </p>

            </CardFooter>

            </Card>

            <Dialog open={credentialsOpen} onOpenChange={setCredentialsOpen}>
                <DialogContent className="max-w-md border-emerald-900/10">
                    <DialogHeader className="border-emerald-100">
                        <DialogTitle className="font-heading text-xl font-bold text-slate-950">
                            Test login credentials
                        </DialogTitle>
                        <DialogDescription className="text-slate-600">
                            Select an account to fill the login form.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-3 overflow-y-auto p-5">
                        {testCredentials.map((credential) => {
                            const Icon = credential.icon

                            return (
                                <div
                                    key={credential.role}
                                    className="rounded-xl border border-emerald-100 bg-[#f6fbf8] p-4"
                                >
                                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-950">
                                        <Icon className="size-4 text-emerald-800" aria-hidden="true" />
                                        {credential.role}
                                    </div>
                                    <dl className="mt-3 space-y-2 text-sm">
                                        <div>
                                            <dt className="text-xs font-medium text-slate-500">Email</dt>
                                            <dd className="break-all font-medium text-slate-800">{credential.email}</dd>
                                        </div>
                                        <div>
                                            <dt className="text-xs font-medium text-slate-500">Password</dt>
                                            <dd className="font-mono font-medium text-slate-800">{credential.password}</dd>
                                        </div>
                                    </dl>
                                    <Button
                                        type="button"
                                        onClick={() => {
                                            form.setFieldValue("email", credential.email)
                                            form.setFieldValue("password", credential.password)
                                            setServerError(null)
                                            setCredentialsOpen(false)
                                        }}
                                        className="mt-4 w-full bg-emerald-800 text-white hover:bg-emerald-900"
                                    >
                                        Use {credential.role} credentials
                                    </Button>
                                </div>
                            )
                        })}
                    </div>
                </DialogContent>
            </Dialog>
        </main>
    )
}

export default LoginForm
