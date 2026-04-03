/**
 * Cases API Client
 * 
 * Wraps /cases/* endpoints for case management.
 */

import { apiClient } from './client';

// ============================================================================
// Request/Response Types
// ============================================================================

export interface CreateCaseRequest {
  title: string;
  draftType: 'bail' | 'injunction' | 'writ' | 'other';
  rawFacts?: string;
}

export interface CreateCaseResponse {
  id: string;
  title: string;
  draftType: string;
  status: string;
  createdAt: string;
}

export interface GetCaseResponse {
  id: string;
  userId: string;
  title: string;
  draftType: string;
  status: string;
  rawFacts: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateCaseRequest {
  title?: string;
  status?: 'interrogating' | 'chronology' | 'contradiction_found' | 'drafting' | 'complete';
  rawFacts?: string;
}

export interface UpdateCaseResponse {
  id: string;
  title: string;
  draftType: string;
  status: string;
  updatedAt: string;
}

export interface DeleteCaseResponse {
  success: boolean;
  message: string;
}

export interface ListCasesResponse {
  cases: Array<{
    id: string;
    title: string;
    draftType: string;
    status: string;
    createdAt: string;
    updatedAt: string;
  }>;
}

// ============================================================================
// API Functions
// ============================================================================

/**
 * Create a new case
 * 
 * POST /cases
 */
export async function createCase(
  request: CreateCaseRequest
): Promise<CreateCaseResponse> {
  return apiClient.post<CreateCaseResponse, CreateCaseRequest>(
    '/cases',
    request
  );
}

/**
 * Get a case by ID
 * 
 * GET /cases/:caseId
 */
export async function getCase(caseId: string): Promise<GetCaseResponse> {
  return apiClient.get<GetCaseResponse>(`/cases/${caseId}`);
}

/**
 * Update a case
 * 
 * PATCH /cases/:caseId
 */
export async function updateCase(
  caseId: string,
  request: UpdateCaseRequest
): Promise<UpdateCaseResponse> {
  return apiClient.patch<UpdateCaseResponse, UpdateCaseRequest>(
    `/cases/${caseId}`,
    request
  );
}

/**
 * Delete a case
 * 
 * DELETE /cases/:caseId
 */
export async function deleteCase(caseId: string): Promise<DeleteCaseResponse> {
  return apiClient.delete<DeleteCaseResponse>(`/cases/${caseId}`);
}

/**
 * List all cases
 * 
 * GET /cases
 */
export async function listCases(): Promise<ListCasesResponse> {
  return apiClient.get<ListCasesResponse>('/cases');
}
