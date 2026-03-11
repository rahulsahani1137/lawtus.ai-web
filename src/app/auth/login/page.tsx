'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { useMutation } from '@tanstack/react-query'
import { EmailStep } from '@/app/auth/login/_components/email-step'
import { OtpStep } from '@/app/auth/login/_components/otp-step'
import {
    requestOtp,
    verifyOtp,
    registerUser,
    verifyRegistration,
} from '@/lib/requests/auth'
import { AuthActions } from '@/stores/auth'
import { setRefreshTokenAction } from '@/actions/auth'
import { cn } from '@/lib/utils'

export default function LoginPage() {
    const router = useRouter()
    const [step, setStep] = useState<'email' | 'otp'>('email')
    const [email, setEmail] = useState('')
    const [isNewUser, setIsNewUser] = useState(false)

    const sendOtpMutation = useMutation({
        mutationFn: async (emailVal: string) => {
            await requestOtp(emailVal)
            return emailVal
        },
        onSuccess: () => {
            toast.success('Verification code sent to your email')
        },
        onError: (error) => {
            toast.error(error.message || 'Failed to send verification code')
        },
    })

    const registerMutation = useMutation({
        mutationFn: async ({
            email: e,
            name,
        }: {
            email: string
            name: string
        }) => {
            await registerUser(e, name)
            return e
        },
        onSuccess: () => {
            toast.success('Verification code sent to your email')
        },
        onError: (error) => {
            toast.error(error.message || 'Failed to register')
        },
    })

    const verifyMutation = useMutation({
        mutationFn: async (otp: string) => {
            if (isNewUser) {
                return verifyRegistration(email, otp)
            }
            return verifyOtp(email, otp)
        },
        onSuccess: async (data) => {
            await setRefreshTokenAction(data.tokens.refreshToken)
            AuthActions.setTokens(
                data.tokens.accessToken,
                data.tokens.refreshToken,
                data.user,
            )
            toast.success('Successfully signed in!')
            router.push('/dashboard')
        },
        onError: (error) => {
            toast.error(error.message || 'Verification failed')
        },
    })

    const handleSendOtp = useCallback(
        async (emailVal: string): Promise<boolean> => {
            try {
                await sendOtpMutation.mutateAsync(emailVal)
                return true
            } catch {
                return false
            }
        },
        [sendOtpMutation],
    )

    const handleRegister = useCallback(
        async (emailVal: string, name: string): Promise<boolean> => {
            try {
                await registerMutation.mutateAsync({ email: emailVal, name })
                return true
            } catch {
                return false
            }
        },
        [registerMutation],
    )

    const handleEmailSuccess = useCallback(
        (emailVal: string, newUser: boolean) => {
            setEmail(emailVal)
            setIsNewUser(newUser)
            setStep('otp')
        },
        [],
    )

    const handleVerify = useCallback(
        async (otp: string): Promise<boolean> => {
            try {
                await verifyMutation.mutateAsync(otp)
                return true
            } catch {
                return false
            }
        },
        [verifyMutation],
    )

    const handleResend = useCallback(async (): Promise<boolean> => {
        return handleSendOtp(email)
    }, [email, handleSendOtp])

    const handleBack = useCallback(() => {
        setStep('email')
        setEmail('')
        setIsNewUser(false)
    }, [])

    const isLoading =
        sendOtpMutation.isPending ||
        registerMutation.isPending ||
        verifyMutation.isPending

    const error =
        verifyMutation.error?.message ||
        sendOtpMutation.error?.message ||
        registerMutation.error?.message ||
        null

    return (
        <div
            className={cn(
                'min-h-screen flex flex-col items-center justify-center px-4 py-12 bg-background',
            )}
        >
            <div className="w-full max-w-[400px] space-y-8">
                {/* Logo */}
                <div className="flex flex-col items-center space-y-2">
                    <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary text-primary-foreground font-bold text-xl">
                        L
                    </div>
                    <h1 className="text-2xl font-semibold tracking-tight">
                        Lawtus AI
                    </h1>
                </div>

                {/* Auth Steps */}
                {step === 'email' ? (
                    <EmailStep
                        onSuccess={handleEmailSuccess}
                        isLoading={isLoading}
                        error={error}
                        onSendOtp={handleSendOtp}
                        onRegister={handleRegister}
                    />
                ) : (
                    <OtpStep
                        email={email}
                        isNewUser={isNewUser}
                        isLoading={isLoading}
                        error={error}
                        onVerify={handleVerify}
                        onResend={handleResend}
                        onBack={handleBack}
                    />
                )}
            </div>

            {/* Footer */}
            <p className="mt-8 text-center text-sm text-muted-foreground">
                By continuing, you agree to our{' '}
                <a
                    href="/terms"
                    className="underline underline-offset-4 hover:text-foreground transition-colors"
                >
                    Terms of Service
                </a>{' '}
                and{' '}
                <a
                    href="/privacy"
                    className="underline underline-offset-4 hover:text-foreground transition-colors"
                >
                    Privacy Policy
                </a>
            </p>
        </div>
    )
}
