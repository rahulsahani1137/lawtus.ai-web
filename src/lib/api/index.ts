/**
 * API Client Index
 * 
 * Central export point for all API clients.
 */

// Export base client and error classes
export {
  apiClient,
  APIClient,
  APIError,
  NetworkError,
  ValidationError,
} from './client';

// Export cases API
export * as casesAPI from './cases';
export type {
  CreateCaseRequest,
  CreateCaseResponse,
  GetCaseResponse,
  UpdateCaseRequest,
  UpdateCaseResponse,
  DeleteCaseResponse,
  ListCasesResponse,
} from './cases';

// Export interrogator API
export * as interrogatorAPI from './interrogator';
export type {
  StartInterrogationRequest,
  StartInterrogationResponse,
  AnswerQuestionRequest,
  AnswerQuestionResponse,
  GetSummaryResponse as InterrogationSummaryResponse,
} from './interrogator';

// Export chronology API
export * as chronologyAPI from './chronology';
export type {
  BuildChronologyRequest,
  BuildChronologyResponse,
  AddEventRequest,
  AddEventResponse,
  UpdateEventRequest,
  UpdateEventResponse,
  DeleteEventRequest,
  DeleteEventResponse,
  VerifyChronologyRequest,
  VerifyChronologyResponse,
  GetChronologyRequest,
  GetChronologyResponse,
  CheckContradictionsRequest,
  CheckContradictionsResponse,
  ResolveContradictionRequest,
  ResolveContradictionResponse,
} from './chronology';

// Export CLDI documents API
export * as cldiDocumentsAPI from './cldi-documents';
export type {
  UploadDocumentRequest as CLDIUploadDocumentRequest,
  UploadDocumentResponse as CLDIUploadDocumentResponse,
  GetDocumentResponse as CLDIGetDocumentResponse,
  GetCaseDocumentsResponse,
  DeleteDocumentResponse as CLDIDeleteDocumentResponse,
} from './cldi-documents';

// Export PageIndex API
export * as pageIndexAPI from './pageindex';
export type {
  IngestBatchRequest,
  IngestBatchResponse,
  SearchPagesRequest,
  SearchPagesResponse,
  PageIndexStatsResponse,
} from './pageindex';

// Export storage API
export * as storageAPI from './storage';
export type {
  UploadRequest as StorageUploadRequest,
  UploadResponse as StorageUploadResponse,
  DownloadRequest as StorageDownloadRequest,
  DownloadResponse as StorageDownloadResponse,
  DeleteRequest as StorageDeleteRequest,
  DeleteResponse as StorageDeleteResponse,
  PresignedUrlRequest,
  PresignedUrlResponse,
  ListBucketsResponse,
  EnsureBucketsResponse,
} from './storage';
