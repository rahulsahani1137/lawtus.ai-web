'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Scale, FileText, Gavel, Loader2 } from 'lucide-react'

import { CLDIBreadcrumb } from '@/components/layout/cldi-breadcrumb'
import { DraftTypeCard } from '@/components/drafts/draft-type-card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { casesAPI } from '@/lib/api'

type DraftType = 'bail' | 'injunction' | 'writ'

interface DraftTypeOption {
  type: DraftType
  icon: typeof Scale
  title: string
  description: string
}

const draftTypes: DraftTypeOption[] = [
  {
    type: 'bail',
    icon: Scale,
    title: 'Bail Application',
    description: 'Application for bail in criminal proceedings',
  },
  {
    type: 'injunction',
    icon: FileText,
    title: 'Civil Injunction',
    description: 'Application for temporary or permanent injunction',
  },
  {
    type: 'writ',
    icon: Gavel,
    title: 'Writ Petition',
    description: 'Constitutional remedy under Article 226/32',
  },
]

export default function NewDraftPage() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [selectedType, setSelectedType] = useState<DraftType | null>(null)

  const createCaseMutation = useMutation({
    mutationFn: async (data: { title: string; draftType: DraftType }) => {
      return casesAPI.createCase(data)
    },
    onSuccess: (data) => {
      toast.success('Case created successfully')
      router.push(`/drafts/${data.id}/interrogate`)
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : 'Failed to create case'
      toast.error(message)
    },
  })

  const handleTypeSelect = (type: DraftType) => {
    setSelectedType(type)
  }

  const handleContinue = () => {
    // Validate title
    if (!title.trim()) {
      toast.error('Please enter a case title')
      return
    }

    // Validate draft type selection
    if (!selectedType) {
      toast.error('Please select a draft type')
      return
    }

    // Create case
    createCaseMutation.mutate({
      title: title.trim(),
      draftType: selectedType,
    })
  }

  const isLoading = createCaseMutation.isPending

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <CLDIBreadcrumb />

      <div>
        <h1 className="text-3xl font-bold tracking-tight">New Draft</h1>
        <p className="text-muted-foreground mt-1">
          Select the type of legal document you want to create
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="case-title">Case Title</Label>
          <Input
            id="case-title"
            placeholder="Enter a title for your case"
            className="mt-1.5"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={isLoading}
          />
        </div>

        <div>
          <Label className="mb-3 block">Draft Type</Label>
          <div className="grid gap-4 md:grid-cols-3">
            {draftTypes.map((draftType) => (
              <DraftTypeCard
                key={draftType.type}
                icon={draftType.icon}
                title={draftType.title}
                description={draftType.description}
                selected={selectedType === draftType.type}
                onClick={() => handleTypeSelect(draftType.type)}
                disabled={isLoading}
              />
            ))}
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <Button
            size="lg"
            onClick={handleContinue}
            disabled={isLoading || !title.trim() || !selectedType}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Case...
              </>
            ) : (
              'Continue to Fact Collection'
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}

