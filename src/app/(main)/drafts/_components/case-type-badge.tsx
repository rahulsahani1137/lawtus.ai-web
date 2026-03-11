'use client'

import { CASE_TYPE_LABELS, CASE_TYPE_COLORS } from '@/types/draft'
import type { CaseType } from '@/types/draft'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

export function CaseTypeBadge({ caseType }: { caseType: CaseType }) {
    return (
        <Badge className={cn('text-xs font-medium', CASE_TYPE_COLORS[caseType])}>
            {CASE_TYPE_LABELS[caseType]}
        </Badge>
    )
}
