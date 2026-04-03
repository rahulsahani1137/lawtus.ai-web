/**
 * CLDI Documents API Client
 * 
 * Wraps /cldi-documents/* endpoints for legal document upload and processing.
 */

import { apiClient } from './client';
import type { SourceDocType } from '@/types/cldi';

// ============================================================================
// Request/Response Types
// ============================================================================

export interface UploadDocumentRequest {
  filename: string;
  contentType: string;
  data: string; // Base64 encoded file data
  caseId: string;
  documentType?: SourceDocType;
  metadata?: {
    title?: string;
    description?: string;
    category?: string;
    [key: string]: any;
  };
}

export interface UploadDocumentResponse {
  documentId: string;
  filename: string;
  caseId: string;
  storageKey: string;
  size: number;
  extractedText: string;
  extractedDetails: {
    dates: string[];
    sections: string[];
    parties: string[];
    documentType: string;
    summary: string;
  };
  ocrConfidence?: number;
  uploadedAt: string;
  message: string;
}

export interface GetDocumentResponse {
  documentId: string;
  filename: string;
  contentType: string;
  caseId: string;
  size: number;
  storageKey: string;
  extractedText: string;
  extractedDetails: {
    dates: string[];
    sections: string[];
    parties: string[];
    documentType: string;
    summary: string;
  };
  ocrConfidence?: number;
  uploadedAt: string;
}

export interface GetCaseDocumentsResponse {
  caseId: string;
  documents: Array<{
    documentId: string;
    filename: string;
    contentType: string;
    size: number;
    extractedDetails: {
      dates: string[];
      sections: string[];
      parties: string[];
      documentType: string;
      summary: string;
    };
    ocrConfidence?: number;
    uploadedAt: string;
  }>;
}

export interface DeleteDocumentResponse {
  success: boolean;
  message: string;
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
 * Upload a legal document for CLDI processing
 * 
 * POST /cldi-documents/upload
 */
export async function uploadDocument(
  request: UploadDocumentRequest
): Promise<UploadDocumentResponse> {
  return apiClient.post<UploadDocumentResponse, UploadDocumentRequest>(
    '/cldi-documents/upload',
    request
  );
}

/**
 * Get document by ID
 * 
 * GET /cldi-documents/:documentId
 */
export async function getDocument(
  documentId: string
): Promise<GetDocumentResponse> {
  return apiClient.get<GetDocumentResponse>(
    `/cldi-documents/${documentId}`
  );
}

/**
 * Get all documents for a case
 * 
 * GET /cldi-documents/case/:caseId
 */
export async function getCaseDocuments(
  caseId: string
): Promise<GetCaseDocumentsResponse> {
  return apiClient.get<GetCaseDocumentsResponse>(
    `/cldi-documents/case/${caseId}`
  );
}

/**
 * Delete document
 * 
 * DELETE /cldi-documents/:documentId
 */
export async function deleteDocument(
  documentId: string
): Promise<DeleteDocumentResponse> {
  return apiClient.delete<DeleteDocumentResponse>(
    `/cldi-documents/${documentId}`
  );
}

/**
 * Health check endpoint
 * 
 * GET /cldi-documents/health
 */
export async function checkDocumentsHealth(): Promise<HealthCheckResponse> {
  return apiClient.get<HealthCheckResponse>('/cldi-documents/health');
}

// ============================================================================
// Convenience Functions
// ============================================================================

/**
 * Upload a file from File object
 */
export async function uploadFile(
  file: File,
  caseId: string,
  documentType?: SourceDocType,
  metadata?: UploadDocumentRequest['metadata']
): Promise<UploadDocumentResponse> {
  // Convert file to base64
  const base64Data = await fileToBase64(file);

  return uploadDocument({
    filename: file.name,
    contentType: file.type,
    data: base64Data,
    caseId,
    documentType,
    metadata,
  });
}

/**
 * Upload multiple files
 */
export async function uploadMultipleFiles(
  files: File[],
  caseId: string,
  documentType?: SourceDocType
): Promise<UploadDocumentResponse[]> {
  const uploadPromises = files.map(file =>
    uploadFile(file, caseId, documentType)
  );

  return Promise.all(uploadPromises);
}

/**
 * Get documents with extracted dates
 */
export async function getDocumentsWithDates(
  caseId: string
): Promise<Array<{
  documentId: string;
  filename: string;
  dates: string[];
}>> {
  const response = await getCaseDocuments(caseId);

  return response.documents
    .filter(doc => doc.extractedDetails.dates.length > 0)
    .map(doc => ({
      documentId: doc.documentId,
      filename: doc.filename,
      dates: doc.extractedDetails.dates,
    }));
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Convert File to base64 string
 */
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const result = reader.result as string;
      // Remove data URL prefix (e.g., "data:image/png;base64,")
      const base64 = result.split(',')[1];
      resolve(base64);
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsDataURL(file);
  });
}
