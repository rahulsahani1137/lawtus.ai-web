/**
 * useContradictions Hook
 * 
 * React hook for managing contradiction detection and resolution.
 * Provides methods to detect, resolve, and dismiss contradictions.
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { chronologyAPI } from '@/lib/api';
import { toast } from 'sonner';
import { queryKeys } from '@/lib/query-keys';

export interface Contradiction {
  id: string;
  caseId: string;
  eventId1: string;
  eventId2: string;
  field: string;
  value1: string;
  value2: string;
  severity: 'critical' | 'warning';
  description: string;
  resolved: boolean;
  resolution?: string;
  createdAt: string;
}

export interface DetectContradictionsParams {
  caseId: string;
}

export interface ResolveContradictionParams {
  caseId: string;
  contradictionId: string;
  resolution: string;
}

/**
 * Hook for managing contradictions
 */
export function useContradictions(caseId: string) {
  const queryClient = useQueryClient();

  // Fetch contradictions for a case
  const {
    data: contradictions = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: queryKeys.contradictions(caseId),
    queryFn: async () => {
      // This would call the API to get contradictions
      // For now, return empty array as placeholder
      return [] as Contradiction[];
    },
    enabled: !!caseId,
  });

  // Detect contradictions mutation
  const detectMutation = useMutation({
    mutationFn: async (params: DetectContradictionsParams) => {
      return await chronologyAPI.checkContradictions(params.caseId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.contradictions(caseId) });
      toast.success('Contradiction detection complete');
    },
    onError: (error: Error) => {
      toast.error(`Failed to detect contradictions: ${error.message}`);
    },
  });

  // Resolve contradiction mutation
  const resolveMutation = useMutation({
    mutationFn: async (params: ResolveContradictionParams) => {
      return await chronologyAPI.resolveContradiction(
        params.caseId,
        params.contradictionId,
        params.resolution
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.contradictions(caseId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.chronology(caseId) });
      toast.success('Contradiction resolved');
    },
    onError: (error: Error) => {
      toast.error(`Failed to resolve contradiction: ${error.message}`);
    },
  });

  // Dismiss contradiction (mark as not an issue)
  const dismissMutation = useMutation({
    mutationFn: async (contradictionId: string) => {
      // This would call the API to dismiss the contradiction
      // For now, just resolve with empty string
      return await chronologyAPI.resolveContradiction(
        caseId,
        contradictionId,
        'dismissed'
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.contradictions(caseId) });
      toast.success('Contradiction dismissed');
    },
    onError: (error: Error) => {
      toast.error(`Failed to dismiss contradiction: ${error.message}`);
    },
  });

  // Computed values
  const unresolvedContradictions = contradictions.filter(c => !c.resolved);
  const criticalContradictions = unresolvedContradictions.filter(c => c.severity === 'critical');
  const warningContradictions = unresolvedContradictions.filter(c => c.severity === 'warning');

  return {
    // Data
    contradictions,
    unresolvedContradictions,
    criticalContradictions,
    warningContradictions,
    
    // Counts
    totalCount: contradictions.length,
    unresolvedCount: unresolvedContradictions.length,
    criticalCount: criticalContradictions.length,
    warningCount: warningContradictions.length,
    
    // State
    isLoading,
    error,
    isDetecting: detectMutation.isPending,
    isResolving: resolveMutation.isPending,
    isDismissing: dismissMutation.isPending,
    
    // Actions
    detectContradictions: () => detectMutation.mutate({ caseId }),
    resolveContradiction: (contradictionId: string, resolution: string) =>
      resolveMutation.mutate({ caseId, contradictionId, resolution }),
    dismissContradiction: (contradictionId: string) =>
      dismissMutation.mutate(contradictionId),
  };
}
