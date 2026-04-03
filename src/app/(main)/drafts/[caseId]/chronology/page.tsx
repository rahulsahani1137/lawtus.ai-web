'use client'

import { use, useEffect } from 'react'
import { CLDIBreadcrumb } from '@/components/layout/cldi-breadcrumb'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ChronologyTimeline } from '@/components/chronology/timeline'
import { Calendar, Loader2, AlertCircle, Sparkles } from 'lucide-react'
import { useChronology } from '@/hooks/useChronology'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export default function ChronologyPage({
    params,
}: {
    params: Promise<{ caseId: string }>
}) {
    const { caseId } = use(params)
    
    // Chronology hook
    const chronology = useChronology({ caseId })
    
    // Auto-build chronology if no events exist
    useEffect(() => {
        if (!chronology.isLoading && chronology.totalEvents === 0 && !chronology.isBuilding) {
            chronology.buildChronology()
        }
    }, [chronology.isLoading, chronology.totalEvents, chronology.isBuilding])
    
    // Loading state
    if (chronology.isLoading) {
        return (
            <div className="p-6 space-y-6 max-w-6xl mx-auto">
                <CLDIBreadcrumb caseId={caseId} />
                <Card>
                    <CardContent className="py-12">
                        <div className="flex flex-col items-center gap-4 text-center">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            <p className="text-muted-foreground">Loading chronology...</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }
    
    // Building state
    if (chronology.isBuilding) {
        return (
            <div className="p-6 space-y-6 max-w-6xl mx-auto">
                <CLDIBreadcrumb caseId={caseId} />
                <Card>
                    <CardContent className="py-12">
                        <div className="flex flex-col items-center gap-4 text-center">
                            <Sparkles className="h-8 w-8 animate-pulse text-primary" />
                            <p className="text-muted-foreground">
                                AI is extracting chronological events from your case materials...
                            </p>
                            <p className="text-xs text-muted-foreground">
                                This may take a few moments
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="p-6 space-y-6 max-w-6xl mx-auto">
            <CLDIBreadcrumb caseId={caseId} />

            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Chronology Builder</h1>
                    <p className="text-muted-foreground mt-1">
                        Review and organize case events in chronological order
                    </p>
                </div>
                {chronology.totalEvents === 0 && (
                    <Button onClick={chronology.buildChronology} disabled={chronology.isBuilding}>
                        <Sparkles className="mr-2 h-4 w-4" />
                        Build Chronology
                    </Button>
                )}
            </div>
            
            {/* Filters */}
            {chronology.totalEvents > 0 && (
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex gap-4 items-center">
                            <div className="flex-1">
                                <label className="text-sm font-medium mb-2 block">Filter by Type</label>
                                <Select
                                    value={chronology.filterType || 'all'}
                                    onValueChange={(value) => 
                                        chronology.setFilterType(value === 'all' ? null : value)
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="All types" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Types</SelectItem>
                                        {chronology.eventTypes.map(type => (
                                            <SelectItem key={type} value={type}>
                                                {type.charAt(0).toUpperCase() + type.slice(1)}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            
                            <div className="flex-1">
                                <label className="text-sm font-medium mb-2 block">Filter by Source</label>
                                <Select
                                    value={chronology.filterSource || 'all'}
                                    onValueChange={(value) => 
                                        chronology.setFilterSource(value === 'all' ? null : value)
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="All sources" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Sources</SelectItem>
                                        {chronology.sources.map(source => (
                                            <SelectItem key={source} value={source}>
                                                {source}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            
                            {(chronology.filterType || chronology.filterSource) && (
                                <Button
                                    variant="outline"
                                    onClick={chronology.clearFilters}
                                    className="mt-7"
                                >
                                    Clear Filters
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>
            )}
            
            {/* Info Alert */}
            {chronology.totalEvents > 0 && chronology.verifiedEvents < chronology.totalEvents && (
                <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                        Review all events and click "Verify" when ready to proceed. You can add, edit, or delete events as needed.
                    </AlertDescription>
                </Alert>
            )}
            
            {/* Timeline */}
            {chronology.totalEvents === 0 ? (
                <Card>
                    <CardContent className="py-12">
                        <div className="flex flex-col items-center gap-4 text-center">
                            <Calendar className="h-12 w-12 text-muted-foreground" />
                            <div>
                                <p className="text-muted-foreground">No events in chronology yet</p>
                                <p className="text-sm text-muted-foreground mt-1">
                                    Click "Build Chronology" to extract events from your case materials
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <ChronologyTimeline
                    caseId={caseId}
                    events={chronology.filteredEvents}
                    onAddEvent={chronology.addEvent}
                    onEditEvent={chronology.updateEvent}
                    onDeleteEvent={chronology.deleteEvent}
                    onVerify={chronology.verifyChronology}
                    isLoading={chronology.isMutating || chronology.isVerifying}
                />
            )}
        </div>
    )
}
