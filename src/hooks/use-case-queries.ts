/**
 * Case Queries Hook
 * 
 * React Query hooks for case management operations.
 * Case data uses 5 minute stale time as per FTASK-003 requirements.
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { casesAPI } from "@/lib/api";

/**
 * Fetch case details
 * Stale time: 5 minutes (case data)
 */
export function useCaseDetail(caseId: string) {
  return useQuery({
    queryKey: queryKeys.cases.detail(caseId),
    queryFn: async () => {
      return await casesAPI.getCase(caseId);
    },
    staleTime: 5 * 60 * 1000, // 5 minutes for case data
    enabled: !!caseId,
  });
}

/**
 * Fetch all cases
 * Stale time: 5 minutes (case data)
 */
export function useCases() {
  return useQuery({
    queryKey: queryKeys.cases.list(),
    queryFn: async () => {
      return await casesAPI.listCases();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes for case data
  });
}

/**
 * Create new case mutation
 */
export function useCreateCase() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      title: string;
      draftType: 'bail' | 'injunction' | 'writ' | 'other';
      rawFacts?: string;
    }) => {
      return await casesAPI.createCase(data);
    },
    onSuccess: () => {
      // Invalidate cases list to refetch
      queryClient.invalidateQueries({ queryKey: queryKeys.cases.list() });
    },
  });
}

/**
 * Update case mutation
 */
export function useUpdateCase(caseId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      title?: string;
      status?: 'interrogating' | 'chronology' | 'contradiction_found' | 'drafting' | 'complete';
      rawFacts?: string;
    }) => {
      return await casesAPI.updateCase(caseId, data);
    },
    onSuccess: () => {
      // Invalidate specific case and list
      queryClient.invalidateQueries({ queryKey: queryKeys.cases.detail(caseId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.cases.list() });
    },
  });
}

/**
 * Delete case mutation
 */
export function useDeleteCase() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (caseId: string) => {
      return await casesAPI.deleteCase(caseId);
    },
    onSuccess: () => {
      // Invalidate cases list
      queryClient.invalidateQueries({ queryKey: queryKeys.cases.list() });
    },
  });
}
