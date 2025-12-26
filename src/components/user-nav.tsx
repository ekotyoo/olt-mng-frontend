'use client'

import { logout } from "@/app/actions/auth"
import { Button } from "@/components/ui/button"

export default function UserNav() {
    return (
        <form action={logout}>
            <Button variant="outline" type="submit">
                Sign out
            </Button>
        </form>
    )
}
