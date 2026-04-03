/**
 * useInterrogator Hook
 * 
 * High-level hook encapsulating all interrogation state and API calls.
 * Provides a simple interface for the interrogation wizard UI.
 */

import { useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  useInterrogationSummary,
  useStartInterrogation,
  useAnswerQuestion,
} from './use-interrogator-queries';
import type { Question } from '@/types/cldi';

// ============================================================================
// Types
// ============================================================================

export interface UseInterrogatorOptions {
  caseId: string;
  autoStart?: boolean; // Auto-start interrogation on mount
}

export interface InterrogatorState {
  // Data
  questions: Question[];
  currentQuestionIndex: number;
  currentQuestion: Question | null;
  
  // Status
  isLoading: boolean;
  isStarting: boolean;
  isAnswering: boolean;
  isComplete: boolean;
  completionPercentage: number;
  
  // Actions
  startInterrogation: (context?: string) => Promise<void>;
  answerQuestion: (questionId: string, answer: string) => Promise<void>;
  skipQuestion: (questionId: string) => void;
  goToQuestion: (index: number) => void;
  nextQuestion: () => void;
  previousQuestion: () => void;
  
  // Computed
  canGoNext: boolean;
  canGoPrevious: boolean;
  answeredCount: number;
  totalCount: number;
}

// ============================================================================
// Hook
// ============================================================================

export function useInterrogator(options: UseInterrogatorOptions): InterrogatorState {
  const { caseId, autoStart = false } = options;
  const router = useRouter();
  
  // Local state for current question navigation
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [skippedQuestions, setSkippedQuestions] = useState<Set<string>>(new Set());
  
  // Queries
  const summaryQuery = useInterrogationSummary(caseId);
  const startMutation = useStartInterrogation();
  const answerMutation = useAnswerQuestion(caseId);
  
  // Extract questions from summary
  const questions = useMemo<Question[]>(() => {
    if (!summaryQuery.data) return [];
    
    return summaryQuery.data.questions.map(q => ({
      id: q.id,
      question: q.question,
      answer: q.answer,
      isAnswered: q.isAnswered,
      order: q.order,
      legalSignificance: '', // Not provided in summary API
      questionType: 'text' as const, // Default, should be in API
    }));
  }, [summaryQuery.data]);
  
  // Current question
  const currentQuestion = questions[currentQuestionIndex] || null;
  
  // Completion stats
  const answeredCount = questions.filter(q => q.isAnswered).length;
  const totalCount = questions.length;
  const completionPercentage = summaryQuery.data?.completionPercentage || 0;
  const isComplete = summaryQuery.data?.isComplete || false;
  
  // Navigation state
  const canGoNext = currentQuestionIndex < questions.length - 1;
  const canGoPrevious = currentQuestionIndex > 0;
  
  // Loading states
  const isLoading = summaryQuery.isLoading;
  const isStarting = startMutation.isPending;
  const isAnswering = answerMutation.isPending;
  
  // ============================================================================
  // Actions
  // ============================================================================
  
  /**
   * Start interrogation session
   */
  const startInterrogation = useCallback(async (context?: string) => {
    try {
      await startMutation.mutateAsync({
        caseId,
        context,
      });
      
      toast.success('Interrogation started');
      
      // Refetch summary to get questions
      await summaryQuery.refetch();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to start interrogation';
      toast.error(message);
      throw error;
    }
  }, [caseId, startMutation, summaryQuery]);
  
  /**
   * Answer current question
   */
  const answerQuestion = useCallback(async (questionId: string, answer: string) => {
    if (!answer.trim()) {
      toast.error('Please provide an answer');
      return;
    }
    
    try {
      // Find the interrogation ID (first question's ID is used as interrogation ID)
      const interrogationId = questions[0]?.id || questionId;
      
      const result = await answerMutation.mutateAsync({
        interrogationId,
        questionId,
        answer: answer.trim(),
      });
      
      // Show success message
      if (result.complete) {
        toast.success('Interrogation complete!');
        
        // Redirect to chronology step
        setTimeout(() => {
          router.push(`/drafts/${caseId}/chronology`);
        }, 1000);
      } else if (result.nextQuestions && result.nextQuestions.length > 0) {
        toast.success(`Answer saved. ${result.nextQuestions.length} follow-up question(s) added.`);
      } else {
        toast.success('Answer saved');
      }
      
      // Move to next question if available
      if (!result.complete && canGoNext) {
        setCurrentQuestionIndex(prev => prev + 1);
      }
      
      // Refetch summary to get updated data
      await summaryQuery.refetch();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to save answer';
      toast.error(message);
      throw error;
    }
  }, [caseId, questions, answerMutation, summaryQuery, canGoNext, router]);
  
  /**
   * Skip current question
   */
  const skipQuestion = useCallback((questionId: string) => {
    setSkippedQuestions(prev => new Set(prev).add(questionId));
    
    // Move to next question
    if (canGoNext) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
    
    toast.info('Question skipped');
  }, [canGoNext]);
  
  /**
   * Navigate to specific question
   */
  const goToQuestion = useCallback((index: number) => {
    if (index >= 0 && index < questions.length) {
      setCurrentQuestionIndex(index);
    }
  }, [questions.length]);
  
  /**
   * Navigate to next question
   */
  const nextQuestion = useCallback(() => {
    if (canGoNext) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  }, [canGoNext]);
  
  /**
   * Navigate to previous question
   */
  const previousQuestion = useCallback(() => {
    if (canGoPrevious) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  }, [canGoPrevious]);
  
  // ============================================================================
  // Auto-start on mount
  // ============================================================================
  
  // Auto-start interrogation if enabled and no questions exist
  // This is handled by the component, not the hook
  
  // ============================================================================
  // Return State
  // ============================================================================
  
  return {
    // Data
    questions,
    currentQuestionIndex,
    currentQuestion,
    
    // Status
    isLoading,
    isStarting,
    isAnswering,
    isComplete,
    completionPercentage,
    
    // Actions
    startInterrogation,
    answerQuestion,
    skipQuestion,
    goToQuestion,
    nextQuestion,
    previousQuestion,
    
    // Computed
    canGoNext,
    canGoPrevious,
    answeredCount,
    totalCount,
  };
}
