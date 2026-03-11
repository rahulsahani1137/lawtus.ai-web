'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CASE_TYPE_LABELS } from '@/types/draft'
import type { CaseType } from '@/types/draft'

const caseDetailsSchema = z.object({
    caseType: z.string().min(1, 'Case type is required'),
    court: z.string().min(1, 'Court is required'),
    clientName: z.string().min(1, 'Client name is required'),
    opposingParty: z.string().optional(),
    reliefSought: z.string().min(1, 'Relief sought is required'),
    additionalContext: z.string().optional(),
})

type CaseDetailsForm = z.infer<typeof caseDetailsSchema>

interface StepCaseDetailsProps {
    onComplete: (details: {
        caseType: CaseType
        court: string
        clientName: string
        opposingParty: string
        reliefSought: string
        documentIds: string[]
        additionalContext: string
    }) => void
    defaultCaseType?: CaseType | null
    defaultDocId?: string | null
}

export function StepCaseDetails({
    onComplete,
    defaultCaseType,
    defaultDocId,
}: StepCaseDetailsProps) {
    const form = useForm<CaseDetailsForm>({
        resolver: zodResolver(caseDetailsSchema),
        defaultValues: {
            caseType: defaultCaseType || '',
            court: '',
            clientName: '',
            opposingParty: '',
            reliefSought: '',
            additionalContext: '',
        },
    })

    const handleSubmit = (values: CaseDetailsForm) => {
        onComplete({
            caseType: values.caseType as CaseType,
            court: values.court,
            clientName: values.clientName,
            opposingParty: values.opposingParty || '',
            reliefSought: values.reliefSought,
            documentIds: defaultDocId ? [defaultDocId] : [],
            additionalContext: values.additionalContext || '',
        })
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Case Details</CardTitle>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(handleSubmit)}
                        className="space-y-4"
                    >
                        <FormField
                            control={form.control}
                            name="caseType"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Case Type</FormLabel>
                                    <Select
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select case type" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {Object.entries(CASE_TYPE_LABELS).map(
                                                ([value, label]) => (
                                                    <SelectItem key={value} value={value}>
                                                        {label}
                                                    </SelectItem>
                                                ),
                                            )}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="court"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Court</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="e.g., Delhi High Court"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="clientName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Client Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Client name" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="opposingParty"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Opposing Party (optional)</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Opposing party" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="reliefSought"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Relief Sought</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Describe the relief sought..."
                                            className="min-h-[80px]"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="additionalContext"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Additional Context (optional)</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Any additional details..."
                                            className="min-h-[60px]"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="flex justify-end pt-4">
                            <Button type="submit">Continue to Fact Collection</Button>
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    )
}
