'use client'

import { useEffect } from 'react'
import { AuthActions } from '@/stores/auth'

export function AuthProvider({ children }: { children: React.ReactNode }) {
    useEffect(() => {
        AuthActions.initialize()
    }, [])

    return <>{children}</>
}
