'use client'

import { useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import type { CaseType } from '@/types/draft'

interface StepFactCollectionProps {
    caseDetails: {
        caseType: CaseType
        court: string
        clientName: string
    }
    onComplete: (facts: string) => void
    onBack: () => void
}

export function StepFactCollection({
    caseDetails,
    onComplete,
    onBack,
}: StepFactCollectionProps) {
    const [facts, setFacts] = useState('')

    const handleSubmit = () => {
        if (facts.trim()) {
            onComplete(facts.trim())
        }
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Fact Collection</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                        Describe all relevant facts for your {caseDetails.caseType.replace(/_/g, ' ')} at {caseDetails.court}.
                        Include dates, events, parties involved, and any relevant details.
                    </p>

                    <Textarea
                        value={facts}
                        onChange={(e) => setFacts(e.target.value)}
                        placeholder="Enter the facts of the case here...&#10;&#10;For example:&#10;- On 15th January 2024, the accused was arrested...&#10;- The FIR was filed under sections...&#10;- The investigation is still ongoing..."
                        className="min-h-[300px] font-mono text-sm"
                    />

                    <div className="flex justify-between pt-4">
                        <Button variant="outline" onClick={onBack}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back
                        </Button>
                        <Button
                            onClick={handleSubmit}
                            disabled={!facts.trim()}
                        >
                            Continue to Generate
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
