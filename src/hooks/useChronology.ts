/**
 * useChronology Hook
 * 
 * High-level hook encapsulating all chronology state and API calls.
 * Provides a simple interface for the chronology timeline UI.
 */

import { useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  useChronologyEvents,
  useBuildChronology,
  useAddEvent,
  useUpdateEvent,
  useDeleteEvent,
  useVerifyChronology,
} from './use-chronology-queries';
import type { ChronologyEvent } from '@/types/cldi';

// ============================================================================
// Types
// ============================================================================

export interface UseChronologyOptions {
  caseId: string;
  autoBuild?: boolean; // Auto-build chronology on mount
}

export interface ChronologyState {
  // Data
  events: ChronologyEvent[];
  filteredEvents: ChronologyEvent[];
  
  // Filters
  filterType: string | null;
  filterSource: string | null;
  
  // Status
  isLoading: boolean;
  isBuilding: boolean;
  isVerifying: boolean;
  isMutating: boolean;
  
  // Actions
  buildChronology: () => Promise<void>;
  addEvent: (event: Omit<ChronologyEvent, 'id' | 'createdAt'>) => Promise<void>;
  updateEvent: (eventId: string, updates: Partial<ChronologyEvent>) => Promise<void>;
  deleteEvent: (eventId: string) => Promise<void>;
  verifyChronology: () => Promise<void>;
  
  // Filters
  setFilterType: (type: string | null) => void;
  setFilterSource: (source: string | null) => void;
  clearFilters: () => void;
  
  // Computed
  totalEvents: number;
  verifiedEvents: number;
  eventTypes: string[];
  sources: string[];
}

// ============================================================================
// Hook
// ============================================================================

export function useChronology(options: UseChronologyOptions): ChronologyState {
  const { caseId, autoBuild = false } = options;
  const router = useRouter();
  
  // Local state for filters
  const [filterType, setFilterType] = useState<string | null>(null);
  const [filterSource, setFilterSource] = useState<string | null>(null);
  
  // Queries
  const eventsQuery = useChronologyEvents(caseId);
  const buildMutation = useBuildChronology();
  const addMutation = useAddEvent(caseId);
  const updateMutation = useUpdateEvent(caseId);
  const deleteMutation = useDeleteEvent(caseId);
  const verifyMutation = useVerifyChronology(caseId);
  
  // Extract events from query
  const events = useMemo<ChronologyEvent[]>(() => {
    if (!eventsQuery.data) return [];
    
    return eventsQuery.data.events.map(e => ({
      id: e.eventId,
      date: e.date || null,
      dateRaw: e.date || null,
      description: e.description,
      source: e.source || null,
      legalRelevance: e.metadata?.legalRelevance || null,
      eventType: (e.category as any) || 'neutral',
      isVerified: e.metadata?.isVerified || false,
      createdAt: new Date(e.createdAt),
    }));
  }, [eventsQuery.data]);
  
  // Apply filters
  const filteredEvents = useMemo(() => {
    let filtered = events;
    
    if (filterType) {
      filtered = filtered.filter(e => e.eventType === filterType);
    }
    
    if (filterSource) {
      filtered = filtered.filter(e => e.source === filterSource);
    }
    
    return filtered;
  }, [events, filterType, filterSource]);
  
  // Computed values
  const totalEvents = events.length;
  const verifiedEvents = events.filter(e => e.isVerified).length;
  
  const eventTypes = useMemo(() => {
    const types = new Set(events.map(e => e.eventType));
    return Array.from(types);
  }, [events]);
  
  const sources = useMemo(() => {
    const sourcesSet = new Set(events.map(e => e.source).filter(Boolean) as string[]);
    return Array.from(sourcesSet);
  }, [events]);
  
  // Loading states
  const isLoading = eventsQuery.isLoading;
  const isBuilding = buildMutation.isPending;
  const isVerifying = verifyMutation.isPending;
  const isMutating = addMutation.isPending || updateMutation.isPending || deleteMutation.isPending;
  
  // ============================================================================
  // Actions
  // ============================================================================
  
  /**
   * Build chronology from case data
   */
  const buildChronology = useCallback(async () => {
    try {
      const result = await buildMutation.mutateAsync({
        caseId,
        autoExtract: true,
      });
      
      toast.success(`Extracted ${result.eventsExtracted} events`);
      
      // Refetch events
      await eventsQuery.refetch();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to build chronology';
      toast.error(message);
      throw error;
    }
  }, [caseId, buildMutation, eventsQuery]);
  
  /**
   * Add new event
   */
  const addEvent = useCallback(async (event: Omit<ChronologyEvent, 'id' | 'createdAt'>) => {
    try {
      await addMutation.mutateAsync({
        caseId,
        date: event.date || '',
        description: event.description,
        source: event.source || undefined,
        category: event.eventType,
        metadata: {
          legalRelevance: event.legalRelevance,
        },
      });
      
      toast.success('Event added');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to add event';
      toast.error(message);
      throw error;
    }
  }, [caseId, addMutation]);
  
  /**
   * Update existing event
   */
  const updateEvent = useCallback(async (
    eventId: string,
    updates: Partial<ChronologyEvent>
  ) => {
    try {
      await updateMutation.mutateAsync({
        caseId,
        eventId,
        date: updates.date || undefined,
        description: updates.description,
        source: updates.source || undefined,
        category: updates.eventType,
        metadata: {
          legalRelevance: updates.legalRelevance,
        },
      });
      
      toast.success('Event updated');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update event';
      toast.error(message);
      throw error;
    }
  }, [caseId, updateMutation]);
  
  /**
   * Delete event
   */
  const deleteEvent = useCallback(async (eventId: string) => {
    try {
      await deleteMutation.mutateAsync({
        caseId,
        eventId,
      });
      
      toast.success('Event deleted');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete event';
      toast.error(message);
      throw error;
    }
  }, [caseId, deleteMutation]);
  
  /**
   * Verify chronology and proceed to next step
   */
  const verifyChronology = useCallback(async () => {
    try {
      const result = await verifyMutation.mutateAsync({
        caseId,
        checkConsistency: true,
        checkDates: true,
      });
      
      if (result.isValid) {
        toast.success('Chronology verified');
        
        // Redirect to documents step
        setTimeout(() => {
          router.push(`/drafts/${caseId}/documents`);
        }, 1000);
      } else {
        toast.warning(`Found ${result.issues.length} issue(s) in chronology`);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to verify chronology';
      toast.error(message);
      throw error;
    }
  }, [caseId, verifyMutation, router]);
  
  /**
   * Clear all filters
   */
  const clearFilters = useCallback(() => {
    setFilterType(null);
    setFilterSource(null);
  }, []);
  
  // ============================================================================
  // Return State
  // ============================================================================
  
  return {
    // Data
    events,
    filteredEvents,
    
    // Filters
    filterType,
    filterSource,
    
    // Status
    isLoading,
    isBuilding,
    isVerifying,
    isMutating,
    
    // Actions
    buildChronology,
    addEvent,
    updateEvent,
    deleteEvent,
    verifyChronology,
    
    // Filters
    setFilterType,
    setFilterSource,
    clearFilters,
    
    // Computed
    totalEvents,
    verifiedEvents,
    eventTypes,
    sources,
  };
}
