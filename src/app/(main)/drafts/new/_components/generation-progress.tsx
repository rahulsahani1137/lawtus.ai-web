'use client'

import { useState, useEffect } from 'react'
import { Check, Loader2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

const STEPS = [
    'Building chronology...',
    'Analyzing documents...',
    'Generating draft...',
    'Finalizing...',
]

export function GenerationProgress() {
    const [activeStep, setActiveStep] = useState(0)

    useEffect(() => {
        const timers: NodeJS.Timeout[] = []

        STEPS.forEach((_, i) => {
            if (i > 0) {
                timers.push(
                    setTimeout(() => {
                        setActiveStep(i)
                    }, i * 2000),
                )
            }
        })

        return () => timers.forEach(clearTimeout)
    }, [])

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-base">Generating your draft...</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {STEPS.map((step, i) => (
                        <div key={step} className="flex items-center gap-3">
                            <div
                                className={cn(
                                    'flex h-6 w-6 items-center justify-center rounded-full transition-all',
                                    i < activeStep
                                        ? 'bg-green-100 text-green-600'
                                        : i === activeStep
                                            ? 'bg-primary text-primary-foreground'
                                            : 'bg-muted text-muted-foreground',
                                )}
                            >
                                {i < activeStep ? (
                                    <Check className="h-3.5 w-3.5" />
                                ) : i === activeStep ? (
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                    <span className="text-xs">{i + 1}</span>
                                )}
                            </div>
                            <span
                                className={cn(
                                    'text-sm transition-colors',
                                    i <= activeStep
                                        ? 'text-foreground font-medium'
                                        : 'text-muted-foreground',
                                )}
                            >
                                {step}
                            </span>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}
