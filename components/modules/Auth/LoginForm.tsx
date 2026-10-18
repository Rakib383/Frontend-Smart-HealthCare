"use client"

import { loginAction } from "@/app/(commonLayout)/(authRouteGroup)/login/_action"
import { AppField } from "@/components/shared/form/appField"
import AppSubmitButton from "@/components/shared/form/appSubmitButton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ILoginPayload, loginZodSchema } from "@/zod/auth.validation"
import { useForm } from "@tanstack/react-form"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Eye, EyeOff } from "lucide-react"
import { SearchParams } from "next/dist/server/request/search-params"
import Link from "next/link"
import { useState } from "react"

interface LoginFormParams {
    redirectPath?: string;
}


const LoginForm = ({ redirectPath }: LoginFormParams) => {
    // const queryClient = useQueryClient()

    const [serverError, setServerError] = useState<string | null>(null)
    const [showPassword, setShowPassword] = useState(false)

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

                const result = await mutateAsync(value) as any

                if (!result.success) {
                    return
                }

            } catch (error: any) {

                console.log(`login failed: ${error.message}`);

                setServerError(`login failed: ${error.message}`)

            }
        }
    })


    return (
        <Card className="w-full max-w-md mx-auto shadow-md mt-12">
            <CardHeader>
                <CardTitle>
                    Welcome Back!
                </CardTitle>
                <CardDescription>
                    Please enter your credientials to log in.
                </CardDescription>
            </CardHeader>

            <CardContent>
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
                                    label="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Enter your password"
                                    aria-label={
                                        showPassword ? "Hide password" : "show Password"
                                    }
                                    append={
                                        <Button
                                            onClick={() => setShowPassword((value) => !value)}
                                            variant="ghost"
                                            size="icon"
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
                            className="text-sm text-primary hover:underline underline-offset-4"
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
                    className="w-full"
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
                    don't have an account?

                    <Link href={"/register"} className="text-primary font-medium hover:underline underline-offset-4">
                        Sign up for an account
                    </Link>
                </p>

            </CardFooter>

        </Card>
    )
}

export default LoginForm
