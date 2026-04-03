/**
 * PageIndex API Client
 * 
 * Wraps /pageindex/* endpoints for legacy draft search.
 */

import { apiClient } from './client';
import type { DraftType } from '@/types/cldi';

// ============================================================================
// Request/Response Types
// ============================================================================

export interface IngestBatchRequest {
  draftType: DraftType;
  directoryPath: string;
}

export interface IngestBatchResponse {
  totalFiles: number;
  successCount: number;
  failedCount: number;
  totalPages: number;
  totalWords: number;
  errors: Array<{ file: string; error: string }>;
  duration: number;
}

export interface SearchPagesRequest {
  query: string;
  draftType?: DraftType;
  limit?: number;
}

export interface SearchPagesResponse {
  pages: Array<{
    id: string;
    draftId: string;
    pageNum: number;
    content: string;
    draftType: string;
    rank: number;
  }>;
}

export interface PageIndexStatsResponse {
  totalDrafts: number;
  totalPages: number;
  byType: {
    bail: number;
    injunction: number;
    writ: number;
    other: number;
  };
}

// ============================================================================
// API Functions
// ============================================================================

/**
 * Ingest batch of legacy drafts from directory
 * 
 * POST /pageindex/ingest-batch
 * 
 * Admin only - processes all .docx files in specified directory
 */
export async function ingestBatch(
  request: IngestBatchRequest
): Promise<IngestBatchResponse> {
  return apiClient.post<IngestBatchResponse, IngestBatchRequest>(
    '/pageindex/ingest-batch',
    request
  );
}

/**
 * Search legacy draft pages
 * 
 * GET /pageindex/search
 * 
 * Full-text search using BM25 ranking
 */
export async function searchPages(
  request: SearchPagesRequest
): Promise<SearchPagesResponse> {
  const params = new URLSearchParams();
  params.append('query', request.query);
  
  if (request.draftType) {
    params.append('draftType', request.draftType);
  }
  
  if (request.limit !== undefined) {
    params.append('limit', request.limit.toString());
  }

  return apiClient.get<SearchPagesResponse>(
    `/pageindex/search?${params.toString()}`
  );
}

/**
 * Get PageIndex statistics
 * 
 * GET /pageindex/stats
 * 
 * Returns counts of indexed drafts and pages
 */
export async function getStats(): Promise<PageIndexStatsResponse> {
  return apiClient.get<PageIndexStatsResponse>('/pageindex/stats');
}

// ============================================================================
// Convenience Functions
// ============================================================================

/**
 * Search for structural patterns by draft type
 */
export async function searchStructuralPatterns(
  query: string,
  draftType: DraftType,
  limit: number = 5
): Promise<string[]> {
  const response = await searchPages({ query, draftType, limit });
  return response.pages.map(page => page.content);
}

/**
 * Get top pages for a query
 */
export async function getTopPages(
  query: string,
  draftType?: DraftType
): Promise<SearchPagesResponse['pages']> {
  const response = await searchPages({ query, draftType, limit: 5 });
  return response.pages;
}

/**
 * Check if PageIndex is populated
 */
export async function isPageIndexPopulated(): Promise<boolean> {
  const stats = await getStats();
  return stats.totalPages > 0;
}

/**
 * Get stats by draft type
 */
export async function getStatsByType(
  draftType: DraftType
): Promise<number> {
  const stats = await getStats();
  return stats.byType[draftType];
}
