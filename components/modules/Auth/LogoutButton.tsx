"use client"

import { Button } from "@/components/ui/button"
import { useLogout } from "./useLogout"
import { LoaderCircle, LogOut } from "lucide-react"

interface LogoutButtonProps {
    className?: string
    variant?: "default" | "outline" | "ghost"
}

export default function LogoutButton({ className, variant = "outline" }: LogoutButtonProps) {
    const { logout, isPending } = useLogout()

    return (
        <Button
            type="button"
            variant={variant}
            className={className}
            onClick={() => void logout()}
            disabled={isPending}
        >
            {isPending
                ? <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
                : <LogOut className="size-4" aria-hidden="true" />}
            Log out
        </Button>
    )
}
