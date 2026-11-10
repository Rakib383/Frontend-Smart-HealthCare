"use client"

import { useLogout } from "@/components/modules/Auth/useLogout"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { UserInfo } from "@/types/user.types"
import { Key, LoaderCircle, LogOut, User } from "lucide-react"
import Link from "next/link"

interface UserDropdownProps {
    userInfo: UserInfo
}

const UserDropdown = ({ userInfo }: UserDropdownProps) => {
    const userInitial = userInfo.name.trim().charAt(0).toUpperCase() || "?";
    const { logout, isPending: isLoggingOut } = useLogout()

    return (
        <DropdownMenu>
            <DropdownMenuTrigger
                render={<Button variant="outline" size="icon" className="rounded-full" aria-label="User menu" />}
            >
                    <span className="text-sm font-semibold">
                        {userInitial}
                    </span>
            </DropdownMenuTrigger>


            <DropdownMenuContent align={"end"} className="w-56">
                <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium">
                            {userInfo.name}
                        </p>

                        <p className="text-xs text-muted-foreground">
                            {userInfo.email}
                        </p>

                        <p className="text-xs text-primary capitalize">
                            {userInfo.role.toLowerCase().replace("_", " ")}
                        </p>
                    </div>
                </DropdownMenuLabel>

                <DropdownMenuSeparator />

                <DropdownMenuItem render={<Link href="/my-profile" />}>
                    <User className="mr-2 h-4 w-4" />
                    My Profile
                </DropdownMenuItem>

                <DropdownMenuItem render={<Link href="/change-password" />}>
                    <Key className="mr-2 h-4 w-4" />
                    Change Password
                </DropdownMenuItem>

                <DropdownMenuSeparator />


                <DropdownMenuItem
                    onClick={() => {
                        void logout()
                    }}
                    disabled={isLoggingOut}
                    className="cursor-pointer text-red-600"
                >
                    {isLoggingOut
                        ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                        : <LogOut className="mr-2 h-4 w-4" />}
                    Log out
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

export default UserDropdown