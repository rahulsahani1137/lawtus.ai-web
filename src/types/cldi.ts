/**
 * CLDI Types - Derived from Drizzle Schema
 * 
 * These types mirror the backend database schema for type safety across
 * the frontend-backend boundary.
 */

// ============================================================================
// Enums
// ============================================================================

/**
 * Draft type enum for legal document categorization.
 */
export const DraftType = {
  BAIL: 'bail',
  INJUNCTION: 'injunction',
  WRIT: 'writ',
  OTHER: 'other',
} as const;

export type DraftType = typeof DraftType[keyof typeof DraftType];

/**
 * Case status enum for workflow tracking.
 */
export const CaseStatus = {
  INTERROGATING: 'interrogating',
  CHRONOLOGY: 'chronology',
  CONTRADICTION_FOUND: 'contradiction_found',
  DRAFTING: 'drafting',
  COMPLETE: 'complete',
} as const;

export type CaseStatus = typeof CaseStatus[keyof typeof CaseStatus];

/**
 * Event type enum for chronology categorization.
 */
export const EventType = {
  EVIDENCE: 'evidence',
  PROCEDURAL: 'procedural',
  ADVERSE: 'adverse',
  NEUTRAL: 'neutral',
} as const;

export type EventType = typeof EventType[keyof typeof EventType];

/**
 * Question type enum for interrogation.
 */
export const QuestionType = {
  DATE: 'date',
  YES_NO: 'yes_no',
  TEXT: 'text',
  DOCUMENT_REFERENCE: 'document_reference',
} as const;

export type QuestionType = typeof QuestionType[keyof typeof QuestionType];

/**
 * Source document type enum for evidence tagging.
 */
export const SourceDocType = {
  FIR: 'fir',
  ARREST_MEMO: 'arrest_memo',
  COURT_ORDER: 'court_order',
  AGREEMENT: 'agreement',
  USER_STATEMENT: 'user_statement',
} as const;

export type SourceDocType = typeof SourceDocType[keyof typeof SourceDocType];

/**
 * ARTA research status enum (Phase II).
 */
export const ArtaStatus = {
  PENDING: 'pending',
  REVIEWED: 'reviewed',
  ARCHIVED: 'archived',
} as const;

export type ArtaStatus = typeof ArtaStatus[keyof typeof ArtaStatus];

// ============================================================================
// Database Table Types
// ============================================================================

/**
 * Legacy draft page - 600-word chunk from legacy drafts.
 */
export interface LegacyDraftPage {
  id: string;
  draftId: string;
  pageNum: number;
  content: string;
  draftType: DraftType;
  searchVec: string | null;
  createdAt: Date;
}

/**
 * CLDI case - Master table for legal cases.
 */
export interface CldiCase {
  id: string;
  userId: string;
  title: string;
  draftType: DraftType;
  status: CaseStatus;
  rawFacts: string | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * CLDI interrogation - Q&A pair for fact collection.
 */
export interface CldiInterrogation {
  id: string;
  caseId: string;
  question: string;
  answer: string | null;
  questionOrder: number;
  isAnswered: boolean;
  createdAt: Date;
}

/**
 * CLDI chronology event - Timeline event for a case.
 */
export interface CldiChronologyEvent {
  id: string;
  caseId: string;
  eventDate: string | null;
  eventDateRaw: string | null;
  description: string;
  sourceDoc: string | null;
  legalRelevance: string | null;
  eventType: EventType;
  isVerified: boolean;
  createdAt: Date;
}

/**
 * CLDI evidence tag - Links facts to source documents.
 */
export interface CldiEvidenceTag {
  id: string;
  caseId: string;
  draftSentenceId: number | null;
  sourceDocName: string;
  sourceDocType: SourceDocType;
  verbatimExtract: string;
}

/**
 * CLDI contradiction - Tracks factual inconsistencies.
 */
export interface CldiContradiction {
  id: string;
  caseId: string;
  description: string;
  sourceA: string;
  sourceB: string;
  field: string;
  isResolved: boolean;
  resolution: string | null;
}

/**
 * CLDI draft - Generated legal document.
 */
export interface CldiDraft {
  id: string;
  caseId: string;
  content: string;
  wordDocPath: string | null;
  riskWarnings: Record<string, unknown> | null;
  generatedAt: Date;
  approvedAt: Date | null;
}

/**
 * ARTA finding - Research finding from ARTA agent (Phase II).
 */
export interface ArtaFinding {
  id: string;
  sourceUrl: string;
  sourceName: string;
  summary: string;
  legalPrinciples: Record<string, unknown> | null;
  status: ArtaStatus;
  reviewedBy: string | null;
  createdAt: Date;
}

// ============================================================================
// Insert Types (for creating new records)
// ============================================================================

export type NewCldiCase = Omit<CldiCase, 'id' | 'createdAt' | 'updatedAt'>;
export type NewCldiInterrogation = Omit<CldiInterrogation, 'id' | 'createdAt'>;
export type NewCldiChronologyEvent = Omit<CldiChronologyEvent, 'id' | 'createdAt'>;
export type NewCldiContradiction = Omit<CldiContradiction, 'id'>;
export type NewCldiDraft = Omit<CldiDraft, 'id' | 'generatedAt'>;

// ============================================================================
// Helper Types
// ============================================================================

/**
 * Question with metadata for interrogation UI.
 */
export interface Question {
  id: string;
  question: string;
  legalSignificance: string;
  questionType: QuestionType;
  order: number;
  answer?: string | null;
  isAnswered?: boolean;
}

/**
 * Chronology event with UI-friendly fields.
 */
export interface ChronologyEvent {
  id: string;
  date: string | null;
  dateRaw: string | null;
  description: string;
  source: string | null;
  legalRelevance: string | null;
  eventType: EventType;
  isVerified: boolean;
  createdAt: Date;
}

/**
 * Contradiction with UI-friendly fields.
 */
export interface Contradiction {
  id: string;
  description: string;
  sourceA: string;
  sourceB: string;
  field: string;
  isResolved: boolean;
  resolution?: string | null;
}

/**
 * Document metadata for upload tracking.
 */
export interface DocumentMetadata {
  id: string;
  caseId: string;
  filename: string;
  documentType: SourceDocType;
  uploadedAt: Date;
  extractedText?: string;
  ocrConfidence?: number;
}
