/**
 * Chronology Queries Hook
 * 
 * Demonstrates React Query usage for chronology operations.
 * Case data uses 5 minute stale time as per FTASK-003 requirements.
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import * as chronologyAPI from "@/lib/api/chronology";

/**
 * Fetch chronology events for a case
 * Stale time: 5 minutes (case data)
 */
export function useChronologyEvents(caseId: string) {
  return useQuery({
    queryKey: queryKeys.chronology.events(caseId),
    queryFn: async () => {
      return await chronologyAPI.getChronology({ caseId });
    },
    staleTime: 5 * 60 * 1000, // 5 minutes for case data
    enabled: !!caseId,
  });
}

/**
 * Build chronology from case data
 */
export function useBuildChronology() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: chronologyAPI.BuildChronologyRequest) => {
      return await chronologyAPI.buildChronology(request);
    },
    onSuccess: (_, variables) => {
      // Invalidate chronology events for this case
      queryClient.invalidateQueries({
        queryKey: queryKeys.chronology.events(variables.caseId),
      });
    },
  });
}

/**
 * Add event to chronology
 */
export function useAddEvent(caseId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: chronologyAPI.AddEventRequest) => {
      return await chronologyAPI.addEvent(request);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.chronology.events(caseId),
      });
    },
  });
}

/**
 * Update chronology event
 */
export function useUpdateEvent(caseId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: chronologyAPI.UpdateEventRequest) => {
      return await chronologyAPI.updateEvent(request);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.chronology.events(caseId),
      });
    },
  });
}

/**
 * Delete chronology event
 */
export function useDeleteEvent(caseId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: chronologyAPI.DeleteEventRequest) => {
      return await chronologyAPI.deleteEvent(request);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.chronology.events(caseId),
      });
    },
  });
}

/**
 * Verify chronology
 */
export function useVerifyChronology(caseId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: chronologyAPI.VerifyChronologyRequest) => {
      return await chronologyAPI.verifyChronology(request);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.chronology.events(caseId),
      });
    },
  });
}

/**
 * Check for contradictions
 * Stale time: 5 minutes (case data)
 */
export function useContradictions(caseId: string) {
  return useQuery({
    queryKey: queryKeys.chronology.contradictions(caseId),
    queryFn: async () => {
      return await chronologyAPI.checkContradictions({ caseId });
    },
    staleTime: 5 * 60 * 1000, // 5 minutes for case data
    enabled: !!caseId,
  });
}

/**
 * Resolve contradiction
 */
export function useResolveContradiction(caseId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: chronologyAPI.ResolveContradictionRequest) => {
      return await chronologyAPI.resolveContradiction(request);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.chronology.contradictions(caseId),
      });
    },
  });
}
