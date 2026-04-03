/**
 * @vitest-environment jsdom
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useChronology } from '@/hooks/useChronology'
import type { ChronologyEvent } from '@/types/cldi'
import React from 'react'

// Mock fetch
global.fetch = vi.fn()

describe('useChronology Hook', () => {
  let queryClient: QueryClient

  const mockEvents: ChronologyEvent[] = [
    {
      id: '1',
      caseId: 'case-1',
      eventDate: '2025-01-15',
      eventDateRaw: 'January 15, 2025',
      description: 'FIR registered',
      sourceDoc: 'FIR #2025-001',
      legalRelevance: 'Marks beginning',
      eventType: 'procedural',
      isVerified: false,
      createdAt: '2025-01-15T10:00:00Z',
    },
  ]

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    })
    vi.clearAllMocks()
  })

  const wrapper = ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children)

  it('fetches chronology events', async () => {
    ;(global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ events: mockEvents }),
    })

    const { result } = renderHook(() => useChronology({ caseId: 'case-1' }), { wrapper })

    await waitFor(() => {
      expect(result.current.events).toEqual(mockEvents)
    })
  })

  it('handles fetch error', async () => {
    ;(global.fetch as any).mockResolvedValueOnce({
      ok: false,
    })

    const { result } = renderHook(() => useChronology({ caseId: 'case-1' }), { wrapper })

    await waitFor(() => {
      expect(result.current.isError).toBe(true)
    })
  })

  it('adds event', async () => {
    ;(global.fetch as any)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ events: mockEvents }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: '2', ...mockEvents[0] }),
      })

    const { result } = renderHook(() => useChronology({ caseId: 'case-1' }), { wrapper })

    await waitFor(() => {
      expect(result.current.events).toEqual(mockEvents)
    })

    const newEvent = {
      eventDate: '2025-01-20',
      eventDateRaw: 'January 20, 2025',
      description: 'Arrest',
      sourceDoc: 'Arrest Memo',
      legalRelevance: 'Custody timeline',
      eventType: 'evidence' as const,
      isVerified: false,
    }

    await result.current.addEvent(newEvent)

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/chronology/case-1/event'),
      expect.objectContaining({
        method: 'POST',
      })
    )
  })

  it('updates event', async () => {
    ;(global.fetch as any)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ events: mockEvents }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ ...mockEvents[0], description: 'Updated' }),
      })

    const { result } = renderHook(() => useChronology({ caseId: 'case-1' }), { wrapper })

    await waitFor(() => {
      expect(result.current.events).toEqual(mockEvents)
    })

    await result.current.updateEvent('1', { description: 'Updated' })

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/chronology/case-1/event/1'),
      expect.objectContaining({
        method: 'PATCH',
      })
    )
  })

  it('deletes event', async () => {
    ;(global.fetch as any)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ events: mockEvents }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      })

    const { result } = renderHook(() => useChronology({ caseId: 'case-1' }), { wrapper })

    await waitFor(() => {
      expect(result.current.events).toEqual(mockEvents)
    })

    await result.current.deleteEvent('1')

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/chronology/case-1/event/1'),
      expect.objectContaining({
        method: 'DELETE',
      })
    )
  })

  it('verifies chronology', async () => {
    ;(global.fetch as any)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ events: mockEvents }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ verified: true }),
      })

    const { result } = renderHook(() => useChronology({ caseId: 'case-1' }), { wrapper })

    await waitFor(() => {
      expect(result.current.events).toEqual(mockEvents)
    })

    await result.current.verify()

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/chronology/case-1/verify'),
      expect.objectContaining({
        method: 'POST',
      })
    )
  })

  it('returns loading state', async () => {
    ;(global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ events: mockEvents }),
    })

    const { result } = renderHook(() => useChronology({ caseId: 'case-1' }), { wrapper })

    expect(result.current.isLoading).toBe(true)

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })
  })

  it('respects enabled option', () => {
    const { result } = renderHook(() => useChronology({ caseId: 'case-1', enabled: false }), {
      wrapper,
    })

    expect(global.fetch).not.toHaveBeenCalled()
    expect(result.current.events).toEqual([])
  })

  it('handles error state', async () => {
    ;(global.fetch as any).mockRejectedValueOnce(new Error('Network error'))

    const { result } = renderHook(() => useChronology({ caseId: 'case-1' }), { wrapper })

    await waitFor(() => {
      expect(result.current.error).toBeTruthy()
    })
  })

  it('clears error on successful operation', async () => {
    ;(global.fetch as any)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ events: mockEvents }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: '2' }),
      })

    const { result } = renderHook(() => useChronology({ caseId: 'case-1' }), { wrapper })

    await waitFor(() => {
      expect(result.current.events).toEqual(mockEvents)
    })

    await result.current.addEvent({
      eventDate: '2025-01-20',
      eventDateRaw: 'January 20, 2025',
      description: 'Arrest',
      sourceDoc: 'Arrest Memo',
      legalRelevance: 'Custody timeline',
      eventType: 'evidence',
      isVerified: false,
    })

    expect(result.current.error).toBeNull()
  })
})
