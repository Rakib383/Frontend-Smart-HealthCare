"use client"

import { toast } from "@/components/ui/toast"
import { useState } from "react"

export function useLogout() {
    const [isPending, setIsPending] = useState(false)

    const logout = async () => {
        if (isPending) return

        setIsPending(true)
        try {
            const response = await fetch("/api/auth/logout", {
                method: "POST",
                cache: "no-store",
            })

            if (!response.ok) {
                throw new Error("Your session could not be cleared. Please try again.")
            }

            window.location.replace("/")
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : "Please try again."
            toast.add({
                title: "Logout could not be completed",
                description: message,
                type: "error",
            })
        } finally {
            setIsPending(false)
        }
    }

    return { logout, isPending }
}
