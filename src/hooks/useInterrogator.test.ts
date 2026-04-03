/**
 * @vitest-environment jsdom
 */

/**
 * useInterrogator Hook Tests - FTASK-007
 * 
 * Tests for the comprehensive interrogator hook covering:
 * - Server state management via React Query
 * - Local state management for UI
 * - Optimistic updates
 * - Navigation between questions
 * - Completion percentage calculation
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useInterrogator } from './useInterrogator';
import * as interrogatorAPI from '@/lib/api/interrogator';

// Mock the interrogator API
vi.mock('@/lib/api/interrogator', () => ({
  getInterrogationSummary: vi.fn(),
  startInterrogation: vi.fn(),
  answerQuestion: vi.fn(),
}));

// Helper to create a wrapper with QueryClient
function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
      mutations: {
        retry: false,
      },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

describe('useInterrogator', () => {
  const mockCaseId = 'case-123';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Initialization', () => {
    it('should initialize with default state', () => {
      const { result } = renderHook(
        () => useInterrogator({ caseId: mockCaseId, autoFetch: false }),
        { wrapper: createWrapper() }
      );

      expect(result.current.questions).toEqual([]);
      expect(result.current.completionPercentage).toBe(0);
      expect(result.current.isComplete).toBe(false);
      expect(result.current.currentQuestionIndex).toBe(0);
      expect(result.current.currentQuestion).toBeNull();
    });

    it('should auto-fetch summary when autoFetch is true', async () => {
      const mockSummary = {
        caseId: mockCaseId,
        totalQuestions: 3,
        answeredQuestions: 1,
        questions: [
          {
            id: 'q1',
            question: 'What is the arrest date?',
            answer: '2024-01-01',
            isAnswered: true,
            order: 1,
          },
          {
            id: 'q2',
            question: 'What sections were invoked?',
            answer: null,
            isAnswered: false,
            order: 2,
          },
          {
            id: 'q3',
            question: 'Was recovery made?',
            answer: null,
            isAnswered: false,
            order: 3,
          },
        ],
        completionPercentage: 33,
        isComplete: false,
      };

      vi.mocked(interrogatorAPI.getInterrogationSummary).mockResolvedValue(
        mockSummary
      );

      const { result } = renderHook(
        () => useInterrogator({ caseId: mockCaseId }),
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(result.current.questions).toHaveLength(3);
      });

      expect(result.current.completionPercentage).toBe(33);
      expect(result.current.isComplete).toBe(false);
    });
  });

  describe('Start Interrogation', () => {
    it('should start interrogation successfully', async () => {
      const mockStartResponse = {
        interrogationId: 'int-123',
        caseId: mockCaseId,
        status: 'started' as const,
        message: 'Interrogation started',
      };

      const mockSummary = {
        caseId: mockCaseId,
        totalQuestions: 2,
        answeredQuestions: 0,
        questions: [
          {
            id: 'q1',
            question: 'Initial question 1?',
            answer: null,
            isAnswered: false,
            order: 1,
          },
          {
            id: 'q2',
            question: 'Initial question 2?',
            answer: null,
            isAnswered: false,
            order: 2,
          },
        ],
        completionPercentage: 0,
        isComplete: false,
      };

      vi.mocked(interrogatorAPI.startInterrogation).mockResolvedValue(
        mockStartResponse
      );
      vi.mocked(interrogatorAPI.getInterrogationSummary).mockResolvedValue(
        mockSummary
      );

      const { result } = renderHook(
        () => useInterrogator({ caseId: mockCaseId, autoFetch: false }),
        { wrapper: createWrapper() }
      );

      await act(async () => {
        await result.current.startInterrogation('Initial facts');
      });

      await waitFor(() => {
        expect(result.current.questions).toHaveLength(2);
      });

      expect(interrogatorAPI.startInterrogation).toHaveBeenCalledWith({
        caseId: mockCaseId,
        context: 'Initial facts',
        documentIds: undefined,
      });
    });

    it('should reset local state when starting interrogation', async () => {
      const mockStartResponse = {
        interrogationId: 'int-123',
        caseId: mockCaseId,
        status: 'started' as const,
        message: 'Interrogation started',
      };

      vi.mocked(interrogatorAPI.startInterrogation).mockResolvedValue(
        mockStartResponse
      );
      vi.mocked(interrogatorAPI.getInterrogationSummary).mockResolvedValue({
        caseId: mockCaseId,
        totalQuestions: 1,
        answeredQuestions: 0,
        questions: [],
        completionPercentage: 0,
        isComplete: false,
      });

      const { result } = renderHook(
        () => useInterrogator({ caseId: mockCaseId, autoFetch: false }),
        { wrapper: createWrapper() }
      );

      // Set some local state first
      act(() => {
        result.current.goToQuestion(5);
      });

      expect(result.current.currentQuestionIndex).toBe(0); // Clamped to 0 since no questions

      await act(async () => {
        await result.current.startInterrogation();
      });

      expect(result.current.currentQuestionIndex).toBe(0);
    });
  });

  describe('Answer Question', () => {
    it('should answer question with optimistic update', async () => {
      const mockSummary = {
        caseId: mockCaseId,
        totalQuestions: 2,
        answeredQuestions: 0,
        questions: [
          {
            id: 'q1',
            question: 'Question 1?',
            answer: null,
            isAnswered: false,
            order: 1,
          },
          {
            id: 'q2',
            question: 'Question 2?',
            answer: null,
            isAnswered: false,
            order: 2,
          },
        ],
        completionPercentage: 0,
        isComplete: false,
      };

      const mockAnswerResponse = {
        success: true,
        nextQuestions: [],
        complete: false,
        message: 'Answer recorded',
      };

      vi.mocked(interrogatorAPI.getInterrogationSummary).mockResolvedValue(
        mockSummary
      );
      vi.mocked(interrogatorAPI.answerQuestion).mockResolvedValue(
        mockAnswerResponse
      );

      const { result } = renderHook(
        () => useInterrogator({ caseId: mockCaseId }),
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(result.current.questions).toHaveLength(2);
      });

      // Answer the first question
      await act(async () => {
        await result.current.answerQuestion('q1', 'My answer');
      });

      expect(interrogatorAPI.answerQuestion).toHaveBeenCalledWith({
        interrogationId: mockCaseId,
        questionId: 'q1',
        answer: 'My answer',
      });
    });

    it('should auto-advance to next question after answering', async () => {
      const mockSummary = {
        caseId: mockCaseId,
        totalQuestions: 2,
        answeredQuestions: 0,
        questions: [
          {
            id: 'q1',
            question: 'Question 1?',
            answer: null,
            isAnswered: false,
            order: 1,
          },
          {
            id: 'q2',
            question: 'Question 2?',
            answer: null,
            isAnswered: false,
            order: 2,
          },
        ],
        completionPercentage: 0,
        isComplete: false,
      };

      const mockAnswerResponse = {
        success: true,
        nextQuestions: [],
        complete: false,
        message: 'Answer recorded',
      };

      vi.mocked(interrogatorAPI.getInterrogationSummary).mockResolvedValue(
        mockSummary
      );
      vi.mocked(interrogatorAPI.answerQuestion).mockResolvedValue(
        mockAnswerResponse
      );

      const { result } = renderHook(
        () => useInterrogator({ caseId: mockCaseId }),
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(result.current.questions).toHaveLength(2);
      });

      expect(result.current.currentQuestionIndex).toBe(0);

      await act(async () => {
        await result.current.answerQuestion('q1', 'Answer 1');
      });

      await waitFor(() => {
        expect(result.current.currentQuestionIndex).toBe(1);
      });
    });

    it('should not auto-advance when interrogation is complete', async () => {
      const mockSummary = {
        caseId: mockCaseId,
        totalQuestions: 1,
        answeredQuestions: 0,
        questions: [
          {
            id: 'q1',
            question: 'Final question?',
            answer: null,
            isAnswered: false,
            order: 1,
          },
        ],
        completionPercentage: 0,
        isComplete: false,
      };

      const mockAnswerResponse = {
        success: true,
        nextQuestions: [],
        complete: true,
        message: 'Interrogation complete',
      };

      vi.mocked(interrogatorAPI.getInterrogationSummary).mockResolvedValue(
        mockSummary
      );
      vi.mocked(interrogatorAPI.answerQuestion).mockResolvedValue(
        mockAnswerResponse
      );

      const { result } = renderHook(
        () => useInterrogator({ caseId: mockCaseId }),
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(result.current.questions).toHaveLength(1);
      });

      await act(async () => {
        await result.current.answerQuestion('q1', 'Final answer');
      });

      // Should stay on same question when complete
      expect(result.current.currentQuestionIndex).toBe(0);
    });
  });

  describe('Navigation', () => {
    const mockSummary = {
      caseId: mockCaseId,
      totalQuestions: 5,
      answeredQuestions: 2,
      questions: [
        { id: 'q1', question: 'Q1?', answer: 'A1', isAnswered: true, order: 1 },
        { id: 'q2', question: 'Q2?', answer: 'A2', isAnswered: true, order: 2 },
        { id: 'q3', question: 'Q3?', answer: null, isAnswered: false, order: 3 },
        { id: 'q4', question: 'Q4?', answer: null, isAnswered: false, order: 4 },
        { id: 'q5', question: 'Q5?', answer: null, isAnswered: false, order: 5 },
      ],
      completionPercentage: 40,
      isComplete: false,
    };

    beforeEach(() => {
      vi.mocked(interrogatorAPI.getInterrogationSummary).mockResolvedValue(
        mockSummary
      );
    });

    it('should navigate to next question', async () => {
      const { result } = renderHook(
        () => useInterrogator({ caseId: mockCaseId }),
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(result.current.questions).toHaveLength(5);
      });

      expect(result.current.currentQuestionIndex).toBe(0);

      act(() => {
        result.current.goToNextQuestion();
      });

      expect(result.current.currentQuestionIndex).toBe(1);
    });

    it('should navigate to previous question', async () => {
      const { result } = renderHook(
        () => useInterrogator({ caseId: mockCaseId }),
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(result.current.questions).toHaveLength(5);
      });

      act(() => {
        result.current.goToQuestion(3);
      });

      expect(result.current.currentQuestionIndex).toBe(3);

      act(() => {
        result.current.goToPreviousQuestion();
      });

      expect(result.current.currentQuestionIndex).toBe(2);
    });

    it('should not go below index 0', async () => {
      const { result } = renderHook(
        () => useInterrogator({ caseId: mockCaseId }),
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(result.current.questions).toHaveLength(5);
      });

      act(() => {
        result.current.goToPreviousQuestion();
      });

      expect(result.current.currentQuestionIndex).toBe(0);
    });

    it('should not go beyond last question', async () => {
      const { result } = renderHook(
        () => useInterrogator({ caseId: mockCaseId }),
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(result.current.questions).toHaveLength(5);
      });

      act(() => {
        result.current.goToQuestion(4);
      });

      expect(result.current.currentQuestionIndex).toBe(4);

      act(() => {
        result.current.goToNextQuestion();
      });

      expect(result.current.currentQuestionIndex).toBe(4);
    });

    it('should jump to specific question', async () => {
      const { result } = renderHook(
        () => useInterrogator({ caseId: mockCaseId }),
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(result.current.questions).toHaveLength(5);
      });

      act(() => {
        result.current.goToQuestion(3);
      });

      expect(result.current.currentQuestionIndex).toBe(3);
      expect(result.current.currentQuestion?.id).toBe('q4');
    });
  });

  describe('Skip Question', () => {
    it('should skip question and advance', async () => {
      const mockSummary = {
        caseId: mockCaseId,
        totalQuestions: 3,
        answeredQuestions: 0,
        questions: [
          { id: 'q1', question: 'Q1?', answer: null, isAnswered: false, order: 1 },
          { id: 'q2', question: 'Q2?', answer: null, isAnswered: false, order: 2 },
          { id: 'q3', question: 'Q3?', answer: null, isAnswered: false, order: 3 },
        ],
        completionPercentage: 0,
        isComplete: false,
      };

      vi.mocked(interrogatorAPI.getInterrogationSummary).mockResolvedValue(
        mockSummary
      );

      const { result } = renderHook(
        () => useInterrogator({ caseId: mockCaseId }),
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(result.current.questions).toHaveLength(3);
      });

      expect(result.current.currentQuestionIndex).toBe(0);

      act(() => {
        result.current.skipQuestion('q1');
      });

      expect(result.current.currentQuestionIndex).toBe(1);
    });
  });

  describe('Completion Percentage', () => {
    it('should calculate completion percentage correctly', async () => {
      const mockSummary = {
        caseId: mockCaseId,
        totalQuestions: 4,
        answeredQuestions: 2,
        questions: [
          { id: 'q1', question: 'Q1?', answer: 'A1', isAnswered: true, order: 1 },
          { id: 'q2', question: 'Q2?', answer: 'A2', isAnswered: true, order: 2 },
          { id: 'q3', question: 'Q3?', answer: null, isAnswered: false, order: 3 },
          { id: 'q4', question: 'Q4?', answer: null, isAnswered: false, order: 4 },
        ],
        completionPercentage: 50,
        isComplete: false,
      };

      vi.mocked(interrogatorAPI.getInterrogationSummary).mockResolvedValue(
        mockSummary
      );

      const { result } = renderHook(
        () => useInterrogator({ caseId: mockCaseId }),
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(result.current.completionPercentage).toBe(50);
      });

      expect(result.current.getCompleteness()).toBe(50);
    });
  });

  describe('Get Summary', () => {
    it('should return summary with local answers merged', async () => {
      const mockSummary = {
        caseId: mockCaseId,
        totalQuestions: 2,
        answeredQuestions: 1,
        questions: [
          { id: 'q1', question: 'Q1?', answer: 'A1', isAnswered: true, order: 1 },
          { id: 'q2', question: 'Q2?', answer: null, isAnswered: false, order: 2 },
        ],
        completionPercentage: 50,
        isComplete: false,
      };

      vi.mocked(interrogatorAPI.getInterrogationSummary).mockResolvedValue(
        mockSummary
      );

      const { result } = renderHook(
        () => useInterrogator({ caseId: mockCaseId }),
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(result.current.questions).toHaveLength(2);
      });

      const summary = result.current.getSummary();

      expect(summary).toHaveLength(2);
      expect(summary[0]).toEqual({
        id: 'q1',
        question: 'Q1?',
        answer: 'A1',
        isAnswered: true,
        order: 1,
      });
    });
  });

  describe('Current Question State', () => {
    it('should track current question correctly', async () => {
      const mockSummary = {
        caseId: mockCaseId,
        totalQuestions: 2,
        answeredQuestions: 0,
        questions: [
          { id: 'q1', question: 'Q1?', answer: null, isAnswered: false, order: 1 },
          { id: 'q2', question: 'Q2?', answer: null, isAnswered: false, order: 2 },
        ],
        completionPercentage: 0,
        isComplete: false,
      };

      vi.mocked(interrogatorAPI.getInterrogationSummary).mockResolvedValue(
        mockSummary
      );

      const { result } = renderHook(
        () => useInterrogator({ caseId: mockCaseId }),
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(result.current.currentQuestion).not.toBeNull();
      });

      expect(result.current.currentQuestion?.id).toBe('q1');
      expect(result.current.isCurrentQuestionAnswered).toBe(false);
    });
  });
});
