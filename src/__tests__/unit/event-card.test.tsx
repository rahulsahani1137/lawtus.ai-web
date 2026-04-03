/**
 * @vitest-environment jsdom
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { EventCard } from '@/components/chronology/event-card'
import type { ChronologyEvent } from '@/types/cldi'

describe('EventCard Component', () => {
  const mockEvent: ChronologyEvent = {
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
  }

  const mockColors = {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    dot: 'bg-blue-500',
  }

  const mockHandlers = {
    onEdit: vi.fn(),
    onSave: vi.fn(),
    onCancel: vi.fn(),
    onDelete: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders event in view mode', () => {
    render(
      <EventCard
        event={mockEvent}
        colors={mockColors}
        isEditing={false}
        {...mockHandlers}
      />
    )

    expect(screen.getByText('FIR registered at police station')).toBeInTheDocument()
    expect(screen.getByText('Marks the beginning of criminal proceedings')).toBeInTheDocument()
    expect(screen.getByText('FIR #2025-001')).toBeInTheDocument()
  })

  it('displays formatted date', () => {
    render(
      <EventCard
        event={mockEvent}
        colors={mockColors}
        isEditing={false}
        {...mockHandlers}
      />
    )

    expect(screen.getByText(/Jan 15, 2025/)).toBeInTheDocument()
  })

  it('displays event type badge', () => {
    render(
      <EventCard
        event={mockEvent}
        colors={mockColors}
        isEditing={false}
        {...mockHandlers}
      />
    )

    expect(screen.getByText('Procedural')).toBeInTheDocument()
  })

  it('shows verified status when event is verified', () => {
    const verifiedEvent = { ...mockEvent, isVerified: true }

    render(
      <EventCard
        event={verifiedEvent}
        colors={mockColors}
        isEditing={false}
        {...mockHandlers}
      />
    )

    expect(screen.getByText('✓ Verified')).toBeInTheDocument()
  })

  it('calls onEdit when card clicked', async () => {
    const user = userEvent.setup()
    render(
      <EventCard
        event={mockEvent}
        colors={mockColors}
        isEditing={false}
        {...mockHandlers}
      />
    )

    const card = screen.getByText('FIR registered at police station').closest('div')
    if (card) {
      await user.click(card)
    }

    expect(mockHandlers.onEdit).toHaveBeenCalled()
  })

  it('renders edit form when isEditing is true', () => {
    render(
      <EventCard
        event={mockEvent}
        colors={mockColors}
        isEditing={true}
        {...mockHandlers}
      />
    )

    expect(screen.getByDisplayValue('FIR registered at police station')).toBeInTheDocument()
    expect(screen.getByDisplayValue('January 15, 2025')).toBeInTheDocument()
  })

  it('allows editing description in edit mode', async () => {
    const user = userEvent.setup()
    render(
      <EventCard
        event={mockEvent}
        colors={mockColors}
        isEditing={true}
        {...mockHandlers}
      />
    )

    const descriptionInput = screen.getByDisplayValue('FIR registered at police station')
    await user.clear(descriptionInput)
    await user.type(descriptionInput, 'Updated description')

    expect(descriptionInput).toHaveValue('Updated description')
  })

  it('calls onSave with updated data', async () => {
    const user = userEvent.setup()
    const mockSave = vi.fn().mockResolvedValue(undefined)

    render(
      <EventCard
        event={mockEvent}
        colors={mockColors}
        isEditing={true}
        onEdit={vi.fn()}
        onSave={mockSave}
        onCancel={vi.fn()}
        onDelete={vi.fn()}
      />
    )

    const saveButton = screen.getByRole('button', { name: /Save/i })
    await user.click(saveButton)

    await waitFor(() => {
      expect(mockSave).toHaveBeenCalled()
    })
  })

  it('calls onCancel when cancel button clicked', async () => {
    const user = userEvent.setup()
    render(
      <EventCard
        event={mockEvent}
        colors={mockColors}
        isEditing={true}
        {...mockHandlers}
      />
    )

    const cancelButton = screen.getByRole('button', { name: /Cancel/i })
    await user.click(cancelButton)

    expect(mockHandlers.onCancel).toHaveBeenCalled()
  })

  it('shows delete confirmation dialog', async () => {
    const user = userEvent.setup()
    render(
      <EventCard
        event={mockEvent}
        colors={mockColors}
        isEditing={false}
        {...mockHandlers}
      />
    )

    // Hover to show action buttons
    const card = screen.getByText('FIR registered at police station').closest('div')
    if (card) {
      await user.hover(card)
    }

    // Find and click delete button
    const deleteButtons = screen.getAllByRole('button')
    const deleteButton = deleteButtons.find((btn) => btn.querySelector('svg'))
    if (deleteButton) {
      await user.click(deleteButton)
    }

    // Check if confirmation dialog appears
    await waitFor(() => {
      expect(screen.queryByText(/Delete Event/i)).toBeInTheDocument()
    })
  })

  it('handles events without source document', () => {
    const eventWithoutSource = { ...mockEvent, sourceDoc: undefined }

    render(
      <EventCard
        event={eventWithoutSource}
        colors={mockColors}
        isEditing={false}
        {...mockHandlers}
      />
    )

    expect(screen.queryByText(/Source:/)).not.toBeInTheDocument()
  })

  it('handles events without legal relevance', () => {
    const eventWithoutRelevance = { ...mockEvent, legalRelevance: undefined }

    render(
      <EventCard
        event={eventWithoutRelevance}
        colors={mockColors}
        isEditing={false}
        {...mockHandlers}
      />
    )

    expect(screen.queryByText('Marks the beginning of criminal proceedings')).not.toBeInTheDocument()
  })

  it('disables form inputs when loading', () => {
    render(
      <EventCard
        event={mockEvent}
        colors={mockColors}
        isEditing={true}
        {...mockHandlers}
        isLoading={true}
      />
    )

    const inputs = screen.getAllByRole('textbox')
    inputs.forEach((input) => {
      expect(input).toBeDisabled()
    })
  })

  it('displays all event types correctly', () => {
    const eventTypes: Array<'evidence' | 'procedural' | 'adverse' | 'neutral'> = [
      'evidence',
      'procedural',
      'adverse',
      'neutral',
    ]
    const labels = ['Evidence', 'Procedural', 'Adverse', 'Neutral']

    eventTypes.forEach((type, index) => {
      const event = { ...mockEvent, eventType: type }
      const { unmount } = render(
        <EventCard
          event={event}
          colors={mockColors}
          isEditing={false}
          {...mockHandlers}
        />
      )

      expect(screen.getByText(labels[index])).toBeInTheDocument()
      unmount()
    })
  })
})
