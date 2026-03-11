'use client'

import { useState, useEffect, useCallback } from 'react'
import { RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ResendTimerProps {
    onResend: () => Promise<boolean>
    isLoading: boolean
    initialSeconds?: number
}

export function ResendTimer({
    onResend,
    isLoading,
    initialSeconds = 60,
}: ResendTimerProps) {
    const [countdown, setCountdown] = useState(initialSeconds)

    useEffect(() => {
        if (countdown <= 0) return

        const timer = setInterval(() => {
            setCountdown((prev) => Math.max(0, prev - 1))
        }, 1000)

        return () => clearInterval(timer)
    }, [countdown])

    const handleResend = useCallback(async () => {
        if (countdown > 0 || isLoading) return
        const success = await onResend()
        if (success) {
            setCountdown(initialSeconds)
        }
    }, [countdown, isLoading, onResend, initialSeconds])

    return (
        <div className="flex flex-col items-center gap-1">
            <Button
                variant="ghost"
                size="sm"
                onClick={handleResend}
                disabled={countdown > 0 || isLoading}
                className="text-muted-foreground hover:text-foreground"
            >
                <RefreshCw className="mr-2 h-4 w-4" />
                {countdown > 0
                    ? `Resend OTP in ${countdown}s`
                    : 'Resend OTP'}
            </Button>
        </div>
    )
}
