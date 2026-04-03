/**
 * Query Keys Factory
 * 
 * Centralized query key management for TanStack Query.
 * Provides type-safe cache key generation for all API endpoints.
 * 
 * Pattern: [domain, ...identifiers, ...filters]
 * Example: ['cases', caseId, 'events'] or ['pageindex', 'search', query]
 */

export const queryKeys = {
  // PageIndex queries
  pageIndex: {
    all: ['pageIndex'] as const,
    search: (query: string, draftType?: string, limit?: number) =>
      ['pageIndex', 'search', { query, draftType, limit }] as const,
    stats: () => ['pageIndex', 'stats'] as const,
  },

  // Interrogator queries
  interrogator: {
    all: ['interrogator'] as const,
    summary: (caseId: string) => ['interrogator', caseId, 'summary'] as const,
  },

  // Chronology queries
  chronology: {
    all: ['chronology'] as const,
    events: (caseId: string) => ['chronology', caseId, 'events'] as const,
    contradictions: (caseId: string) =>
      ['chronology', caseId, 'contradictions'] as const,
  },

  // Contradictions queries (alias for chronology.contradictions)
  contradictions: (caseId: string) => ['chronology', caseId, 'contradictions'] as const,

  // CLDI Documents queries
  cldiDocuments: {
    all: ['cldiDocuments'] as const,
    list: (caseId: string) => ['cldiDocuments', caseId] as const,
    detail: (documentId: string) =>
      ['cldiDocuments', 'detail', documentId] as const,
  },

  // Storage queries
  storage: {
    all: ['storage'] as const,
    buckets: () => ['storage', 'buckets'] as const,
    presignedUrl: (key: string, bucket: string) =>
      ['storage', 'presignedUrl', { key, bucket }] as const,
  },

  // Cases queries
  cases: {
    all: ['cases'] as const,
    list: () => ['cases', 'list'] as const,
    detail: (caseId: string) => ['cases', caseId] as const,
  },
} as const;

/**
 * Type helper for query key functions
 */
type QueryKeyFunctions = {
  [K in keyof typeof queryKeys]: (typeof queryKeys)[K];
};

/**
 * Extract all possible query key return types
 */
export type QueryKey =
  | ReturnType<QueryKeyFunctions['pageIndex']['search']>
  | ReturnType<QueryKeyFunctions['pageIndex']['stats']>
  | ReturnType<QueryKeyFunctions['interrogator']['summary']>
  | ReturnType<QueryKeyFunctions['chronology']['events']>
  | ReturnType<QueryKeyFunctions['chronology']['contradictions']>
  | ReturnType<QueryKeyFunctions['cldiDocuments']['list']>
  | ReturnType<QueryKeyFunctions['cldiDocuments']['detail']>
  | ReturnType<QueryKeyFunctions['storage']['buckets']>
  | ReturnType<QueryKeyFunctions['storage']['presignedUrl']>
  | ReturnType<QueryKeyFunctions['cases']['list']>
  | ReturnType<QueryKeyFunctions['cases']['detail']>
  | (typeof queryKeys)['pageIndex']['all']
  | (typeof queryKeys)['interrogator']['all']
  | (typeof queryKeys)['chronology']['all']
  | (typeof queryKeys)['cldiDocuments']['all']
  | (typeof queryKeys)['storage']['all']
  | (typeof queryKeys)['cases']['all'];
