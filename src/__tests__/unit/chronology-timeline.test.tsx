/**
 * @vitest-environment jsdom
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ChronologyTimeline } from '@/components/chronology/timeline'
import type { ChronologyEvent } from '@/types/cldi'

describe('ChronologyTimeline Component', () => {
  const mockEvents: ChronologyEvent[] = [
    {
      id: '1',
      caseId: 'case-1',
      eventDate: '2025-01-15',
      eventDateRaw: 'January 15, 2025',
      description: 'FIR registered at police station',
      sourceDoc: 'FIR #2025-001',
      legalRelevance: 'Marks the beginning of criminal proceedings',
      eventType: 'procedural',
      isVerified: false,
      createdAt: '2025-01-15T10:00:00Z',
    },
    {
      id: '2',
      caseId: 'case-1',
      eventDate: '2025-01-20',
      eventDateRaw: 'January 20, 2025',
      description: 'Arrest of accused',
      sourceDoc: 'Arrest Memo',
      legalRelevance: 'Establishes custody timeline',
      eventType: 'evidence',
      isVerified: true,
      createdAt: '2025-01-20T10:00:00Z',
    },
  ]

  const mockHandlers = {
    onAddEvent: vi.fn(),
    onEditEvent: vi.fn(),
    onDeleteEvent: vi.fn(),
    onVerify: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders timeline with events', () => {
    render(
      <ChronologyTimeline
        caseId="case-1"
        events={mockEvents}
        {...mockHandlers}
      />
    )

    expect(screen.getByText('Chronological Timeline')).toBeInTheDocument()
    expect(screen.getByText('FIR registered at police station')).toBeInTheDocument()
    expect(screen.getByText('Arrest of accused')).toBeInTheDocument()
  })

  it('displays event count', () => {
    render(
      <ChronologyTimeline
        caseId="case-1"
        events={mockEvents}
        {...mockHandlers}
      />
    )

    expect(screen.getByText(/2 events/)).toBeInTheDocument()
  })

  it('shows empty state when no events', () => {
    render(
      <ChronologyTimeline
        caseId="case-1"
        events={[]}
        {...mockHandlers}
      />
    )

    expect(screen.getByText('No events yet. Add your first event to get started.')).toBeInTheDocument()
  })

  it('displays color legend for event types', () => {
    render(
      <ChronologyTimeline
        caseId="case-1"
        events={mockEvents}
        {...mockHandlers}
      />
    )

    expect(screen.getAllByText('Evidence').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Procedural').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Adverse').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Neutral').length).toBeGreaterThan(0)
  })

  it('opens add event dialog when Add Event button clicked', async () => {
    render(
      <ChronologyTimeline
        caseId="case-1"
        events={mockEvents}
        {...mockHandlers}
      />
    )

    const addButton = screen.getByRole('button', { name: /Add Event/i })
    fireEvent.click(addButton)

    await waitFor(() => {
      expect(screen.getByText('Add Event to Timeline')).toBeInTheDocument()
    })
  })

  it('calls onVerify when Verify button clicked', async () => {
    render(
      <ChronologyTimeline
        caseId="case-1"
        events={mockEvents}
        {...mockHandlers}
      />
    )

    const verifyButton = screen.getByRole('button', { name: /Verify/i })
    fireEvent.click(verifyButton)

    await waitFor(() => {
      expect(mockHandlers.onVerify).toHaveBeenCalled()
    })
  })

  it('disables Verify button when no events', () => {
    render(
      <ChronologyTimeline
        caseId="case-1"
        events={[]}
        {...mockHandlers}
      />
    )

    const verifyButton = screen.getByRole('button', { name: /Verify/i })
    expect(verifyButton).toBeDisabled()
  })

  it('sorts events chronologically', () => {
    const unsortedEvents: ChronologyEvent[] = [
      { ...mockEvents[1], eventDate: '2025-01-20' },
      { ...mockEvents[0], eventDate: '2025-01-15' },
    ]

    render(
      <ChronologyTimeline
        caseId="case-1"
        events={unsortedEvents}
        {...mockHandlers}
      />
    )

    const descriptions = screen.getAllByText(/FIR registered|Arrest of accused/)
    expect(descriptions[0]).toHaveTextContent('FIR registered')
    expect(descriptions[1]).toHaveTextContent('Arrest of accused')
  })

  it('displays verified status for verified events', () => {
    render(
      <ChronologyTimeline
        caseId="case-1"
        events={mockEvents}
        {...mockHandlers}
      />
    )

    expect(screen.getByText('✓ Verified')).toBeInTheDocument()
  })

  it('disables buttons when loading', () => {
    render(
      <ChronologyTimeline
        caseId="case-1"
        events={mockEvents}
        {...mockHandlers}
        isLoading={true}
      />
    )

    const addButton = screen.getByRole('button', { name: /Add Event/i })
    const verifyButton = screen.getByRole('button', { name: /Verify/i })

    expect(addButton).toBeDisabled()
    expect(verifyButton).toBeDisabled()
  })

  it('handles events with null dates', () => {
    const eventsWithNullDate: ChronologyEvent[] = [
      {
        ...mockEvents[0],
        eventDate: undefined,
        eventDateRaw: 'Sometime in January',
      },
    ]

    render(
      <ChronologyTimeline
        caseId="case-1"
        events={eventsWithNullDate}
        {...mockHandlers}
      />
    )

    expect(screen.getByText('Sometime in January')).toBeInTheDocument()
  })
})
