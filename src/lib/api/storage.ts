/**
 * Storage API Client
 * 
 * Wraps /storage/* endpoints for document storage operations using MinIO.
 */

import { apiClient } from './client';

// ============================================================================
// Request/Response Types
// ============================================================================

export interface UploadRequest {
  filename: string;
  contentType: string;
  data: string; // Base64 encoded file data
  bucket?: string;
  metadata?: Record<string, string>;
}

export interface UploadResponse {
  key: string;
  bucket: string;
  url: string;
  size: number;
}

export interface DownloadRequest {
  key: string;
  bucket?: string;
}

export interface DownloadResponse {
  data: string; // Base64 encoded file data
  contentType: string;
  metadata?: Record<string, string>;
}

export interface DeleteRequest {
  key: string;
  bucket?: string;
}

export interface DeleteResponse {
  success: boolean;
  message: string;
}

export interface PresignedUrlRequest {
  key: string;
  bucket?: string;
  expiresIn?: number;
}

export interface PresignedUrlResponse {
  url: string;
  expiresIn: number;
}

export interface ListBucketsResponse {
  buckets: Array<{
    name: string;
    exists: boolean;
  }>;
}

export interface EnsureBucketsResponse {
  success: boolean;
  message: string;
}

// ============================================================================
// API Functions
// ============================================================================

/**
 * Upload a document to MinIO
 * 
 * POST /storage/upload
 */
export async function upload(
  request: UploadRequest
): Promise<UploadResponse> {
  return apiClient.post<UploadResponse, UploadRequest>(
    '/storage/upload',
    request
  );
}

/**
 * Download a document from MinIO
 * 
 * GET /storage/download/:key
 */
export async function download(
  request: DownloadRequest
): Promise<DownloadResponse> {
  const params = new URLSearchParams();
  if (request.bucket) {
    params.append('bucket', request.bucket);
  }

  const queryString = params.toString();
  const endpoint = queryString
    ? `/storage/download/${request.key}?${queryString}`
    : `/storage/download/${request.key}`;

  return apiClient.get<DownloadResponse>(endpoint);
}

/**
 * Delete a document from MinIO
 * 
 * DELETE /storage/:key
 */
export async function deleteDocument(
  request: DeleteRequest
): Promise<DeleteResponse> {
  const params = new URLSearchParams();
  if (request.bucket) {
    params.append('bucket', request.bucket);
  }

  const queryString = params.toString();
  const endpoint = queryString
    ? `/storage/${request.key}?${queryString}`
    : `/storage/${request.key}`;

  return apiClient.delete<DeleteResponse>(endpoint);
}

/**
 * Generate a presigned URL for temporary access
 * 
 * GET /storage/presigned-url/:key
 */
export async function getPresignedUrl(
  request: PresignedUrlRequest
): Promise<PresignedUrlResponse> {
  const params = new URLSearchParams();
  if (request.bucket) {
    params.append('bucket', request.bucket);
  }
  if (request.expiresIn !== undefined) {
    params.append('expiresIn', request.expiresIn.toString());
  }

  const queryString = params.toString();
  const endpoint = queryString
    ? `/storage/presigned-url/${request.key}?${queryString}`
    : `/storage/presigned-url/${request.key}`;

  return apiClient.get<PresignedUrlResponse>(endpoint);
}

/**
 * List all buckets
 * 
 * GET /storage/buckets
 */
export async function listBuckets(): Promise<ListBucketsResponse> {
  return apiClient.get<ListBucketsResponse>('/storage/buckets');
}

/**
 * Ensure required buckets exist
 * 
 * POST /storage/ensure-buckets
 */
export async function ensureBuckets(): Promise<EnsureBucketsResponse> {
  return apiClient.post<EnsureBucketsResponse, {}>(
    '/storage/ensure-buckets',
    {}
  );
}

// ============================================================================
// Convenience Functions
// ============================================================================

/**
 * Upload a file from File object
 */
export async function uploadFile(
  file: File,
  bucket?: string,
  metadata?: Record<string, string>
): Promise<UploadResponse> {
  // Convert file to base64
  const base64Data = await fileToBase64(file);

  return upload({
    filename: file.name,
    contentType: file.type,
    data: base64Data,
    bucket,
    metadata,
  });
}

/**
 * Download and convert to File object
 */
export async function downloadAsFile(
  key: string,
  bucket?: string
): Promise<File> {
  const response = await download({ key, bucket });

  // Convert base64 to blob
  const byteCharacters = atob(response.data);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  const blob = new Blob([byteArray], { type: response.contentType });

  // Extract filename from key (last part after /)
  const filename = key.split('/').pop() || 'download';

  return new File([blob], filename, { type: response.contentType });
}

/**
 * Get temporary download URL
 */
export async function getDownloadUrl(
  key: string,
  expiresIn: number = 3600,
  bucket?: string
): Promise<string> {
  const response = await getPresignedUrl({ key, bucket, expiresIn });
  return response.url;
}

/**
 * Upload multiple files
 */
export async function uploadMultipleFiles(
  files: File[],
  bucket?: string
): Promise<UploadResponse[]> {
  const uploadPromises = files.map(file => uploadFile(file, bucket));
  return Promise.all(uploadPromises);
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
