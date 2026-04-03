/**
 * Interrogator API Client
 * 
 * Wraps /interrogator/* endpoints for AI-powered fact collection.
 */

import { apiClient } from './client';
import type { Question } from '@/types/cldi';

// ============================================================================
// Request/Response Types
// ============================================================================

export interface StartInterrogationRequest {
  caseId: string;
  context?: string;
  documentIds?: string[];
}

export interface StartInterrogationResponse {
  interrogationId: string;
  caseId: string;
  status: 'started' | 'in_progress' | 'completed';
  message: string;
}

export interface AnswerQuestionRequest {
  interrogationId: string;
  questionId: string;
  answer: string;
  confidence?: number;
}

export interface AnswerQuestionResponse {
  success: boolean;
  nextQuestions?: Question[];
  complete: boolean;
  message: string;
}

export interface GetSummaryResponse {
  caseId: string;
  totalQuestions: number;
  answeredQuestions: number;
  questions: Array<{
    id: string;
    question: string;
    answer: string | null;
    isAnswered: boolean;
    order: number;
  }>;
  completionPercentage: number;
  isComplete: boolean;
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
 * Start a new interrogation session
 * 
 * POST /interrogator/start
 */
export async function startInterrogation(
  request: StartInterrogationRequest
): Promise<StartInterrogationResponse> {
  return apiClient.post<StartInterrogationResponse, StartInterrogationRequest>(
    '/interrogator/start',
    request
  );
}

/**
 * Submit an answer to an interrogation question
 * 
 * POST /interrogator/answer
 */
export async function answerQuestion(
  request: AnswerQuestionRequest
): Promise<AnswerQuestionResponse> {
  return apiClient.post<AnswerQuestionResponse, AnswerQuestionRequest>(
    '/interrogator/answer',
    request
  );
}

/**
 * Get interrogation summary for a case
 * 
 * GET /interrogator/:caseId/summary
 */
export async function getInterrogationSummary(
  caseId: string
): Promise<GetSummaryResponse> {
  return apiClient.get<GetSummaryResponse>(
    `/interrogator/${caseId}/summary`
  );
}

/**
 * Health check endpoint
 * 
 * GET /interrogator/health
 */
export async function checkInterrogatorHealth(): Promise<HealthCheckResponse> {
  return apiClient.get<HealthCheckResponse>('/interrogator/health');
}

// ============================================================================
// Convenience Functions
// ============================================================================

/**
 * Start interrogation and return first questions
 */
export async function startInterrogationFlow(
  caseId: string,
  context?: string
): Promise<{
  interrogationId: string;
  questions: Question[];
}> {
  const startResponse = await startInterrogation({ caseId, context });
  const summary = await getInterrogationSummary(caseId);

  return {
    interrogationId: startResponse.interrogationId,
    questions: summary.questions.map(q => ({
      id: q.id,
      question: q.question,
      legalSignificance: '', // Not provided in summary
      questionType: 'text' as const,
      order: q.order,
      answer: q.answer,
      isAnswered: q.isAnswered,
    })),
  };
}

/**
 * Answer question and get next questions if any
 */
export async function answerAndContinue(
  interrogationId: string,
  questionId: string,
  answer: string
): Promise<{
  complete: boolean;
  nextQuestions: Question[];
}> {
  const response = await answerQuestion({
    interrogationId,
    questionId,
    answer,
  });

  return {
    complete: response.complete,
    nextQuestions: response.nextQuestions || [],
  };
}
