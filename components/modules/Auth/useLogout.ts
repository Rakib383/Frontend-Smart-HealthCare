"use client"

import { logoutAction } from "@/app/_actions/logout.action"
import { toast } from "@/components/ui/toast"
import { useState } from "react"

export function useLogout() {
    const [isPending, setIsPending] = useState(false)

    const logout = async () => {
        if (isPending) return

        setIsPending(true)
        try {
            await logoutAction()
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
