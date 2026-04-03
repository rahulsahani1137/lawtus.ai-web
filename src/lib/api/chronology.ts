/**
 * Chronology API Client
 * 
 * Wraps /chronology/* endpoints for timeline building and event management.
 */

import { apiClient } from './client';
import type { ChronologyEvent, EventType, Contradiction } from '@/types/cldi';

// ============================================================================
// Request/Response Types
// ============================================================================

export interface BuildChronologyRequest {
  caseId: string;
  documentIds?: string[];
  autoExtract?: boolean;
}

export interface BuildChronologyResponse {
  chronologyId: string;
  caseId: string;
  status: 'building' | 'completed' | 'failed';
  eventsExtracted: number;
  message: string;
}

export interface AddEventRequest {
  caseId: string;
  date: string;
  description: string;
  source?: string;
  category?: EventType;
  metadata?: {
    legalRelevance?: string;
    [key: string]: any;
  };
}

export interface AddEventResponse {
  eventId: string;
  caseId: string;
  message: string;
}

export interface UpdateEventRequest {
  caseId: string;
  eventId: string;
  date?: string;
  description?: string;
  source?: string;
  category?: EventType;
  metadata?: {
    legalRelevance?: string;
    [key: string]: any;
  };
}

export interface UpdateEventResponse {
  success: boolean;
  message: string;
}

export interface DeleteEventRequest {
  caseId: string;
  eventId: string;
}

export interface DeleteEventResponse {
  success: boolean;
  message: string;
}

export interface VerifyChronologyRequest {
  caseId: string;
  checkConsistency?: boolean;
  checkDates?: boolean;
}

export interface VerifyChronologyResponse {
  isValid: boolean;
  totalEvents: number;
  issues: Array<{
    eventId: string;
    type: 'date_conflict' | 'missing_source' | 'inconsistency';
    description: string;
  }>;
  message: string;
}

export interface GetChronologyRequest {
  caseId: string;
  sortOrder?: 'asc' | 'desc';
  category?: EventType;
}

export interface GetChronologyResponse {
  caseId: string;
  events: Array<{
    eventId: string;
    date: string;
    description: string;
    source?: string;
    category?: EventType;
    metadata?: {
      legalRelevance?: string;
      isVerified?: boolean;
      [key: string]: any;
    };
    createdAt: string;
    updatedAt: string;
  }>;
  totalEvents: number;
}

export interface CheckContradictionsRequest {
  caseId: string;
}

export interface CheckContradictionsResponse {
  contradictions: Contradiction[];
  clear: boolean;
  caseStatus: 'contradiction_found' | 'drafting';
}

export interface ResolveContradictionRequest {
  caseId: string;
  contradictionId: string;
  resolution: string;
}

export interface ResolveContradictionResponse {
  success: boolean;
  message: string;
  contradiction: {
    id: string;
    description: string;
    isResolved: boolean;
    resolution: string;
  };
}

export interface HealthCheckResponse {
  status: 'healthy' | 'unhealthy';
  message: string;
  timestamp: string;
}

// ============================================================================
// API Functions
// ============================================================================

/**
 * Build chronology from documents
 * 
 * POST /chronology/build
 */
export async function buildChronology(
  request: BuildChronologyRequest
): Promise<BuildChronologyResponse> {
  return apiClient.post<BuildChronologyResponse, BuildChronologyRequest>(
    '/chronology/build',
    request
  );
}

/**
 * Add a new event to chronology
 * 
 * POST /chronology/:caseId/event
 */
export async function addEvent(
  request: AddEventRequest
): Promise<AddEventResponse> {
  const { caseId, ...body } = request;
  return apiClient.post<AddEventResponse, Omit<AddEventRequest, 'caseId'>>(
    `/chronology/${caseId}/event`,
    body
  );
}

/**
 * Update an existing event
 * 
 * PATCH /chronology/:caseId/event/:eventId
 */
export async function updateEvent(
  request: UpdateEventRequest
): Promise<UpdateEventResponse> {
  const { caseId, eventId, ...body } = request;
  return apiClient.patch<UpdateEventResponse, Omit<UpdateEventRequest, 'caseId' | 'eventId'>>(
    `/chronology/${caseId}/event/${eventId}`,
    body
  );
}

/**
 * Delete an event from chronology
 * 
 * DELETE /chronology/:caseId/event/:eventId
 */
export async function deleteEvent(
  request: DeleteEventRequest
): Promise<DeleteEventResponse> {
  return apiClient.delete<DeleteEventResponse>(
    `/chronology/${request.caseId}/event/${request.eventId}`
  );
}

/**
 * Verify chronology consistency
 * 
 * POST /chronology/:caseId/verify
 */
export async function verifyChronology(
  request: VerifyChronologyRequest
): Promise<VerifyChronologyResponse> {
  const { caseId, ...body } = request;
  return apiClient.post<VerifyChronologyResponse, Omit<VerifyChronologyRequest, 'caseId'>>(
    `/chronology/${caseId}/verify`,
    body
  );
}

/**
 * Get chronology for a case
 * 
 * GET /chronology/:caseId
 */
export async function getChronology(
  request: GetChronologyRequest
): Promise<GetChronologyResponse> {
  const { caseId, sortOrder, category } = request;
  const params = new URLSearchParams();
  
  if (sortOrder) params.append('sortOrder', sortOrder);
  if (category) params.append('category', category);
  
  const queryString = params.toString();
  const endpoint = queryString 
    ? `/chronology/${caseId}?${queryString}`
    : `/chronology/${caseId}`;
  
  return apiClient.get<GetChronologyResponse>(endpoint);
}

/**
 * Check for contradictions in case data
 * 
 * POST /chronology/:caseId/check-contradictions
 */
export async function checkContradictions(
  request: CheckContradictionsRequest
): Promise<CheckContradictionsResponse> {
  return apiClient.post<CheckContradictionsResponse, {}>(
    `/chronology/${request.caseId}/check-contradictions`,
    {}
  );
}

/**
 * Resolve a contradiction
 * 
 * POST /chronology/:caseId/resolve-contradiction
 */
export async function resolveContradiction(
  request: ResolveContradictionRequest
): Promise<ResolveContradictionResponse> {
  const { caseId, ...body } = request;
  return apiClient.post<ResolveContradictionResponse, Omit<ResolveContradictionRequest, 'caseId'>>(
    `/chronology/${caseId}/resolve-contradiction`,
    body
  );
}

/**
 * Health check endpoint
 * 
 * GET /chronology/health
 */
export async function checkChronologyHealth(): Promise<HealthCheckResponse> {
  return apiClient.get<HealthCheckResponse>('/chronology/health');
}

// ============================================================================
// Convenience Functions
// ============================================================================

/**
 * Build chronology and get events
 */
export async function buildAndGetChronology(
  caseId: string
): Promise<ChronologyEvent[]> {
  await buildChronology({ caseId });
  const response = await getChronology({ caseId });
  
  return response.events.map(e => ({
    id: e.eventId,
    date: e.date || null,
    dateRaw: e.date || null,
    description: e.description,
    source: e.source || null,
    legalRelevance: e.metadata?.legalRelevance || null,
    eventType: e.category || 'neutral',
    isVerified: e.metadata?.isVerified || false,
    createdAt: new Date(e.createdAt),
  }));
}

/**
 * Verify chronology and check for contradictions
 */
export async function verifyAndCheckContradictions(
  caseId: string
): Promise<{
  isValid: boolean;
  issues: VerifyChronologyResponse['issues'];
  contradictions: Contradiction[];
}> {
  const [verifyResponse, contradictionsResponse] = await Promise.all([
    verifyChronology({ caseId }),
    checkContradictions({ caseId }),
  ]);

  return {
    isValid: verifyResponse.isValid && contradictionsResponse.clear,
    issues: verifyResponse.issues,
    contradictions: contradictionsResponse.contradictions,
  };
}
