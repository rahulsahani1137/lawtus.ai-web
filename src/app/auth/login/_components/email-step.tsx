'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { Loader2, Mail, ArrowRight, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface EmailStepProps {
    onSuccess: (email: string, isNewUser: boolean) => void
    isLoading: boolean
    error: string | null
    onSendOtp: (email: string) => Promise<boolean>
    onRegister: (email: string, name: string) => Promise<boolean>
}

export function EmailStep({
    onSuccess,
    isLoading,
    error,
    onSendOtp,
    onRegister,
}: EmailStepProps) {
    const [isNewUser, setIsNewUser] = useState(false)
    const [email, setEmail] = useState('')
    const [name, setName] = useState('')
    const [fieldError, setFieldError] = useState<string | null>(null)
    const nameInputRef = useRef<HTMLInputElement>(null)

    const handleSubmit = useCallback(
        async (e: React.FormEvent) => {
            e.preventDefault()
            setFieldError(null)

            if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
                setFieldError('Please enter a valid email address')
                return
            }

            if (isNewUser) {
                if (!name.trim()) {
                    setFieldError('Name is required')
                    return
                }
                const success = await onRegister(email, name)
                if (success) onSuccess(email, true)
            } else {
                const success = await onSendOtp(email)
                if (success) onSuccess(email, false)
            }
        },
        [email, name, isNewUser, onSendOtp, onRegister, onSuccess],
    )

    useEffect(() => {
        if (isNewUser) {
            nameInputRef.current?.focus()
        }
    }, [isNewUser])

    const displayError = fieldError || error

    return (
        <div className="space-y-6">
            <div className="space-y-2 text-center">
                <h2 className="text-xl font-semibold tracking-tight">
                    {isNewUser ? 'Create your account' : 'Welcome back'}
                </h2>
                <p className="text-sm text-muted-foreground">
                    {isNewUser
                        ? 'Enter your details to get started'
                        : 'Enter your email to sign in'}
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="email" className="sr-only">Email</Label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="name@example.com"
                            autoComplete="email"
                            autoFocus
                            disabled={isLoading}
                            className="pl-10 h-11"
                        />
                    </div>
                </div>

                {isNewUser && (
                    <div className="space-y-2">
                        <Label htmlFor="name" className="sr-only">Full Name</Label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                id="name"
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Your full name"
                                autoComplete="name"
                                disabled={isLoading}
                                className="pl-10 h-11"
                                ref={nameInputRef}
                            />
                        </div>
                    </div>
                )}

                {displayError && (
                    <p className="text-sm text-destructive text-center">{displayError}</p>
                )}

                <Button
                    type="submit"
                    className="w-full h-11"
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <>
                            {isNewUser ? 'Create Account' : 'Continue'}
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </>
                    )}
                </Button>
            </form>

            <p className="text-center text-sm text-muted-foreground">
                {isNewUser ? (
                    <>
                        Already have an account?{' '}
                        <button
                            type="button"
                            onClick={() => setIsNewUser(false)}
                            className="font-medium text-foreground underline underline-offset-4 hover:text-primary transition-colors"
                        >
                            Sign in
                        </button>
                    </>
                ) : (
                    <>
                        Don&apos;t have an account?{' '}
                        <button
                            type="button"
                            onClick={() => setIsNewUser(true)}
                            className="font-medium text-foreground underline underline-offset-4 hover:text-primary transition-colors"
                        >
                            Sign up
                        </button>
                    </>
                )}
            </p>
        </div>
    )
}
