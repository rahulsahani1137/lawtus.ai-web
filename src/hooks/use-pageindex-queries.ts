/**
 * PageIndex Queries Hook
 * 
 * Search queries use 1 minute stale time (default) as per FTASK-003 requirements.
 */

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import * as pageIndexAPI from "@/lib/api/pageindex";

/**
 * Search legacy draft pages
 * Stale time: 1 minute (search results - uses default)
 */
export function usePageIndexSearch(
  query: string,
  draftType?: "bail" | "injunction" | "writ" | "other",
  limit?: number
) {
  return useQuery({
    queryKey: queryKeys.pageIndex.search(query, draftType, limit),
    queryFn: async () => {
      return await pageIndexAPI.searchPages({
        query,
        draftType,
        limit,
      });
    },
    // Uses default staleTime (1 minute) from QueryProvider
    enabled: query.length > 0,
  });
}

/**
 * Get PageIndex statistics
 * Stale time: 5 minutes (relatively static data)
 */
export function usePageIndexStats() {
  return useQuery({
    queryKey: queryKeys.pageIndex.stats(),
    queryFn: async () => {
      return await pageIndexAPI.getStats();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
