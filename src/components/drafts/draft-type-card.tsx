import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'

interface DraftTypeCardProps {
  icon: LucideIcon
  title: string
  description: string
  selected?: boolean
  onClick?: () => void
  disabled?: boolean
}

export function DraftTypeCard({
  icon: Icon,
  title,
  description,
  selected = false,
  onClick,
  disabled = false,
}: DraftTypeCardProps) {
  return (
    <Card
      className={cn(
        'cursor-pointer transition-all duration-200',
        'hover:border-primary hover:shadow-md',
        selected && 'border-primary ring-2 ring-primary ring-offset-2',
        disabled && 'opacity-50 cursor-not-allowed hover:border-border hover:shadow-none'
      )}
      onClick={disabled ? undefined : onClick}
    >
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Icon className="h-5 w-5" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <CardDescription>{description}</CardDescription>
      </CardContent>
    </Card>
  )
}
