/**
 * Interrogator Queries Hook
 * 
 * React Query implementation for interrogator operations.
 * Case data uses 5 minute stale time as per FTASK-003 requirements.
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import * as interrogatorAPI from "@/lib/api/interrogator";

/**
 * Fetch interrogation summary
 * Stale time: 5 minutes (case data)
 */
export function useInterrogationSummary(caseId: string) {
  return useQuery({
    queryKey: queryKeys.interrogator.summary(caseId),
    queryFn: async () => {
      return await interrogatorAPI.getSummary(caseId);
    },
    staleTime: 5 * 60 * 1000, // 5 minutes for case data
    enabled: !!caseId,
  });
}

/**
 * Start interrogation
 */
export function useStartInterrogation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: interrogatorAPI.StartInterrogationRequest) => {
      return await interrogatorAPI.startInterrogation(request);
    },
    onSuccess: (_, variables) => {
      // Invalidate interrogation summary for this case
      queryClient.invalidateQueries({
        queryKey: queryKeys.interrogator.summary(variables.caseId),
      });
    },
  });
}

/**
 * Answer question
 */
export function useAnswerQuestion(caseId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: interrogatorAPI.AnswerQuestionRequest) => {
      return await interrogatorAPI.answerQuestion(request);
    },
    onSuccess: () => {
      // Invalidate interrogation summary to refetch updated Q&A
      queryClient.invalidateQueries({
        queryKey: queryKeys.interrogator.summary(caseId),
      });
    },
  });
}
