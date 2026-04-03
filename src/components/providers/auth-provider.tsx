'use client'

import { useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const initialize = useAuthStore((state) => state.initialize)
    const isLoading = useAuthStore((state) => state.isLoading)

    useEffect(() => {
        initialize()
    }, [initialize])

    // Show loading skeleton while initializing
    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-pulse text-muted-foreground">
                    Loading...
                </div>
            </div>
        )
    }

    return <>{children}</>
}
