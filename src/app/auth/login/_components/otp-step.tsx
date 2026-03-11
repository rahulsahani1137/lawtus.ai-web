'use client'

import { useState, useCallback, useRef } from 'react'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSlot,
    InputOTPSeparator,
} from '@/components/ui/input-otp'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { ResendTimer } from '@/app/auth/login/_components/resend-timer'

interface OtpStepProps {
    email: string
    isNewUser: boolean
    isLoading: boolean
    error: string | null
    onVerify: (otp: string) => Promise<boolean>
    onResend: () => Promise<boolean>
    onBack: () => void
}

export function OtpStep({
    email,
    isNewUser,
    isLoading,
    error,
    onVerify,
    onResend,
    onBack,
}: OtpStepProps) {
    const [otp, setOtp] = useState('')
    const [shake, setShake] = useState(false)
    const inputRef = useRef<HTMLInputElement>(null)

    const handleChange = useCallback(
        async (value: string) => {
            setOtp(value)

            if (value.length === 6) {
                const success = await onVerify(value)
                if (!success) {
                    setShake(true)
                    setTimeout(() => {
                        setShake(false)
                        setOtp('')
                        inputRef.current?.focus()
                    }, 500)
                }
            }
        },
        [onVerify],
    )

    return (
        <Card className="border-0 shadow-none">
            <CardHeader className="space-y-1 text-center pb-4">
                <CardTitle className="text-xl">Enter verification code</CardTitle>
                <CardDescription className="text-base">
                    We sent a 6-digit code to{' '}
                    <span className="font-medium text-foreground">{email}</span>
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div
                    className={cn(
                        'flex justify-center transition-transform',
                        shake && 'animate-shake',
                    )}
                >
                    <InputOTP
                        maxLength={6}
                        value={otp}
                        onChange={handleChange}
                        disabled={isLoading}
                        autoFocus
                        ref={inputRef}
                    >
                        <InputOTPGroup>
                            <InputOTPSlot index={0} className="h-12 w-12 text-lg" />
                            <InputOTPSlot index={1} className="h-12 w-12 text-lg" />
                            <InputOTPSlot index={2} className="h-12 w-12 text-lg" />
                        </InputOTPGroup>
                        <InputOTPSeparator />
                        <InputOTPGroup>
                            <InputOTPSlot index={3} className="h-12 w-12 text-lg" />
                            <InputOTPSlot index={4} className="h-12 w-12 text-lg" />
                            <InputOTPSlot index={5} className="h-12 w-12 text-lg" />
                        </InputOTPGroup>
                    </InputOTP>
                </div>

                {error && (
                    <p className="text-sm text-destructive text-center">{error}</p>
                )}

                {isLoading && (
                    <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Verifying...
                    </div>
                )}

                <ResendTimer onResend={onResend} isLoading={isLoading} />

                <Button
                    variant="ghost"
                    className="w-full"
                    onClick={onBack}
                    disabled={isLoading}
                >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Use a different email
                </Button>
            </CardContent>

            <style jsx global>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
          20%, 40%, 60%, 80% { transform: translateX(4px); }
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
        </Card>
    )
}
