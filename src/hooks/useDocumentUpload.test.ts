/**
 * @vitest-environment jsdom
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useDocumentUpload } from './useDocumentUpload'

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

// Mock fetch
global.fetch = vi.fn()

// Mock FileReader
class MockFileReader {
  onload: ((event: ProgressEvent<FileReader>) => void) | null = null
  onerror: ((event: ProgressEvent<FileReader>) => void) | null = null
  result: string | ArrayBuffer | null = null

  readAsDataURL(file: Blob) {
    setTimeout(() => {
      this.result = 'data:application/pdf;base64,mockBase64Data'
      if (this.onload) {
        this.onload({ target: this } as ProgressEvent<FileReader>)
      }
    }, 0)
  }
}

global.FileReader = MockFileReader as any

describe('useDocumentUpload', () => {
  const mockFile = new File(['test content'], 'test.pdf', { type: 'application/pdf' })
  const mockCaseId = 'case-123'

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should initialize with empty uploads', () => {
    const { result } = renderHook(() =>
      useDocumentUpload({ caseId: mockCaseId })
    )

    expect(result.current.uploads.size).toBe(0)
  })

  it('should upload document successfully', async () => {
    const mockResponse = {
      documentId: 'doc-123',
      filename: 'test.pdf',
      extractedText: 'Extracted text content',
      extractedDetails: {
        dates: ['2024-01-01'],
        sections: ['Section 302 IPC'],
        parties: ['Party A', 'Party B'],
        documentType: 'fir',
        summary: 'Test summary',
      },
      ocrConfidence: 0.95,
    }

    ;(global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    })

    const onSuccess = vi.fn()
    const { result } = renderHook(() =>
      useDocumentUpload({ caseId: mockCaseId, onSuccess })
    )

    await act(async () => {
      await result.current.uploadDocument(mockFile)
    })

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledWith(mockResponse)
    })
  })

  it('should handle upload errors', async () => {
    const errorMessage = 'Upload failed'
    ;(global.fetch as any).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: errorMessage }),
    })

    const onError = vi.fn()
    const { result } = renderHook(() =>
      useDocumentUpload({ caseId: mockCaseId, onError })
    )

    await act(async () => {
      try {
        await result.current.uploadDocument(mockFile)
      } catch (error) {
        // Expected error
      }
    })

    await waitFor(() => {
      expect(onError).toHaveBeenCalled()
    })
  })

  it('should track upload progress', async () => {
    ;(global.fetch as any).mockImplementation(
      () =>
        new Promise((resolve) => {
          setTimeout(() => {
            resolve({
              ok: true,
              json: async () => ({
                documentId: 'doc-123',
                filename: 'test.pdf',
                extractedText: 'Text',
                extractedDetails: {
                  dates: [],
                  sections: [],
                  parties: [],
                  documentType: 'other',
                  summary: '',
                },
              }),
            })
          }, 100)
        })
    )

    const { result } = renderHook(() =>
      useDocumentUpload({ caseId: mockCaseId })
    )

    act(() => {
      result.current.uploadDocument(mockFile)
    })

    // Check that upload is tracked
    await waitFor(() => {
      expect(result.current.uploads.size).toBeGreaterThan(0)
    })

    // Wait for completion
    await waitFor(
      () => {
        expect(result.current.uploads.size).toBe(0)
      },
      { timeout: 3000 }
    )
  })

  it('should upload multiple files', async () => {
    const mockFiles = [
      new File(['content1'], 'file1.pdf', { type: 'application/pdf' }),
      new File(['content2'], 'file2.pdf', { type: 'application/pdf' }),
    ]

    ;(global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => ({
        documentId: 'doc-123',
        filename: 'test.pdf',
        extractedText: 'Text',
        extractedDetails: {
          dates: [],
          sections: [],
          parties: [],
          documentType: 'other',
          summary: '',
        },
      }),
    })

    const { result } = renderHook(() =>
      useDocumentUpload({ caseId: mockCaseId })
    )

    await act(async () => {
      await result.current.uploadMultiple(mockFiles)
    })

    expect(global.fetch).toHaveBeenCalledTimes(2)
  })

  it('should include document type in request', async () => {
    ;(global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        documentId: 'doc-123',
        filename: 'test.pdf',
        extractedText: 'Text',
        extractedDetails: {
          dates: [],
          sections: [],
          parties: [],
          documentType: 'fir',
          summary: '',
        },
      }),
    })

    const { result } = renderHook(() =>
      useDocumentUpload({ caseId: mockCaseId, documentType: 'fir' })
    )

    await act(async () => {
      await result.current.uploadDocument(mockFile)
    })

    expect(global.fetch).toHaveBeenCalledWith(
      '/api/cldi-documents/upload',
      expect.objectContaining({
        method: 'POST',
        body: expect.stringContaining('"documentType":"fir"'),
      })
    )
  })
})
