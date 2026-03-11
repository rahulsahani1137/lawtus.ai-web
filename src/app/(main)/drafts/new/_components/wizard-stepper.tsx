'use client'

import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

const steps = [
    { number: 1, label: 'Case Details' },
    { number: 2, label: 'Fact Collection' },
    { number: 3, label: 'Generate' },
]

export function WizardStepper({ currentStep }: { currentStep: number }) {
    return (
        <div className="flex items-center justify-center gap-2">
            {steps.map((step, i) => (
                <div key={step.number} className="flex items-center">
                    <div className="flex items-center gap-2">
                        <div
                            className={cn(
                                'flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-all',
                                currentStep > step.number
                                    ? 'bg-primary text-primary-foreground'
                                    : currentStep === step.number
                                        ? 'bg-primary text-primary-foreground ring-4 ring-primary/20'
                                        : 'bg-muted text-muted-foreground',
                            )}
                        >
                            {currentStep > step.number ? (
                                <Check className="h-4 w-4" />
                            ) : (
                                step.number
                            )}
                        </div>
                        <span
                            className={cn(
                                'text-sm font-medium hidden sm:inline',
                                currentStep >= step.number
                                    ? 'text-foreground'
                                    : 'text-muted-foreground',
                            )}
                        >
                            {step.label}
                        </span>
                    </div>
                    {i < steps.length - 1 && (
                        <div
                            className={cn(
                                'w-12 h-0.5 mx-3',
                                currentStep > step.number ? 'bg-primary' : 'bg-muted',
                            )}
                        />
                    )}
                </div>
            ))}
        </div>
    )
}
