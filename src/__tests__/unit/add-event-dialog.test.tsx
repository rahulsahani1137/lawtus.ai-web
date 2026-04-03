import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AddEventDialog } from '@/components/chronology/add-event-dialog'

describe('AddEventDialog Component', () => {
  const mockHandlers = {
    onAdd: vi.fn().mockResolvedValue(undefined),
    onOpenChange: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders dialog when open is true', () => {
    render(
      <AddEventDialog
        open={true}
        {...mockHandlers}
      />
    )

    expect(screen.getByText('Add Event to Timeline')).toBeInTheDocument()
    expect(screen.getByText('Add a new chronological event to your case timeline.')).toBeInTheDocument()
  })

  it('does not render dialog when open is false', () => {
    render(
      <AddEventDialog
        open={false}
        {...mockHandlers}
      />
    )

    expect(screen.queryByText('Add Event to Timeline')).not.toBeInTheDocument()
  })

  it('displays all form fields', () => {
    render(
      <AddEventDialog
        open={true}
        {...mockHandlers}
      />
    )

    expect(screen.getByLabelText(/Date \(Optional\)/)).toBeInTheDocument()
    expect(screen.getByLabelText(/Date Reference/)).toBeInTheDocument()
    expect(screen.getByLabelText(/Description/)).toBeInTheDocument()
    expect(screen.getByLabelText(/Event Type/)).toBeInTheDocument()
    expect(screen.getByLabelText(/Source Document/)).toBeInTheDocument()
    expect(screen.getByLabelText(/Legal Relevance/)).toBeInTheDocument()
  })

  it('validates required fields', async () => {
    const user = userEvent.setup()
    render(
      <AddEventDialog
        open={true}
        {...mockHandlers}
      />
    )

    const addButton = screen.getByRole('button', { name: /Add Event/i })
    await user.click(addButton)

    await waitFor(() => {
      expect(screen.getByText('Date reference is required')).toBeInTheDocument()
      expect(screen.getByText('Description is required')).toBeInTheDocument()
    })
  })

  it('submits form with valid data', async () => {
    const user = userEvent.setup()
    render(
      <AddEventDialog
        open={true}
        {...mockHandlers}
      />
    )

    const dateRefInput = screen.getByPlaceholderText(/Date reference/)
    const descriptionInput = screen.getByPlaceholderText(/What happened/)

    await user.type(dateRefInput, 'January 15, 2025')
    await user.type(descriptionInput, 'FIR registered')

    const addButton = screen.getByRole('button', { name: /Add Event/i })
    await user.click(addButton)

    await waitFor(() => {
      expect(mockHandlers.onAdd).toHaveBeenCalled()
    })
  })

  it('closes dialog after successful submission', async () => {
    const user = userEvent.setup()
    render(
      <AddEventDialog
        open={true}
        {...mockHandlers}
      />
    )

    const dateRefInput = screen.getByPlaceholderText(/Date reference/)
    const descriptionInput = screen.getByPlaceholderText(/What happened/)

    await user.type(dateRefInput, 'January 15, 2025')
    await user.type(descriptionInput, 'FIR registered')

    const addButton = screen.getByRole('button', { name: /Add Event/i })
    await user.click(addButton)

    await waitFor(() => {
      expect(mockHandlers.onOpenChange).toHaveBeenCalledWith(false)
    })
  })

  it('calls onOpenChange when cancel button clicked', async () => {
    const user = userEvent.setup()
    render(
      <AddEventDialog
        open={true}
        {...mockHandlers}
      />
    )

    const cancelButton = screen.getByRole('button', { name: /Cancel/i })
    await user.click(cancelButton)

    expect(mockHandlers.onOpenChange).toHaveBeenCalledWith(false)
  })

  it('allows selecting event type', async () => {
    const user = userEvent.setup()
    render(
      <AddEventDialog
        open={true}
        {...mockHandlers}
      />
    )

    const eventTypeSelect = screen.getByRole('combobox')
    await user.click(eventTypeSelect)

    const adverseOption = screen.getByText(/Supports opposing party/)
    await user.click(adverseOption)

    expect(eventTypeSelect).toHaveTextContent('Adverse')
  })

  it('allows entering optional date field', async () => {
    const user = userEvent.setup()
    render(
      <AddEventDialog
        open={true}
        {...mockHandlers}
      />
    )

    const dateInput = screen.getByLabelText(/Date \(Optional\)/)
    await user.type(dateInput, '2025-01-15')

    expect(dateInput).toHaveValue('2025-01-15')
  })

  it('allows entering optional source document', async () => {
    const user = userEvent.setup()
    render(
      <AddEventDialog
        open={true}
        {...mockHandlers}
      />
    )

    const sourceInput = screen.getByPlaceholderText(/FIR #2025-001/)
    await user.type(sourceInput, 'FIR #2025-001')

    expect(sourceInput).toHaveValue('FIR #2025-001')
  })

  it('allows entering optional legal relevance', async () => {
    const user = userEvent.setup()
    render(
      <AddEventDialog
        open={true}
        {...mockHandlers}
      />
    )

    const relevanceInput = screen.getByPlaceholderText(/Why is this event legally significant/)
    await user.type(relevanceInput, 'Establishes timeline')

    expect(relevanceInput).toHaveValue('Establishes timeline')
  })

  it('disables form when loading', () => {
    render(
      <AddEventDialog
        open={true}
        {...mockHandlers}
        isLoading={true}
      />
    )

    const inputs = screen.getAllByRole('textbox')
    inputs.forEach((input) => {
      expect(input).toBeDisabled()
    })

    const buttons = screen.getAllByRole('button')
    buttons.forEach((button) => {
      expect(button).toBeDisabled()
    })
  })

  it('resets form after successful submission', async () => {
    const user = userEvent.setup()
    const { rerender } = render(
      <AddEventDialog
        open={true}
        {...mockHandlers}
      />
    )

    const dateRefInput = screen.getByPlaceholderText(/Date reference/) as HTMLInputElement
    const descriptionInput = screen.getByPlaceholderText(/What happened/) as HTMLInputElement

    await user.type(dateRefInput, 'January 15, 2025')
    await user.type(descriptionInput, 'FIR registered')

    const addButton = screen.getByRole('button', { name: /Add Event/i })
    await user.click(addButton)

    await waitFor(() => {
      expect(mockHandlers.onAdd).toHaveBeenCalled()
    })

    // Reopen dialog
    rerender(
      <AddEventDialog
        open={true}
        {...mockHandlers}
      />
    )

    // Check that form is reset
    expect(dateRefInput.value).toBe('')
    expect(descriptionInput.value).toBe('')
  })

  it('displays help text for optional date field', () => {
    render(
      <AddEventDialog
        open={true}
        {...mockHandlers}
      />
    )

    expect(screen.getByText('Leave blank if exact date is uncertain')).toBeInTheDocument()
  })

  it('displays help text for event type options', async () => {
    const user = userEvent.setup()
    render(
      <AddEventDialog
        open={true}
        {...mockHandlers}
      />
    )

    const eventTypeSelect = screen.getByRole('combobox')
    await user.click(eventTypeSelect)

    expect(screen.getByText(/Supports your case/)).toBeInTheDocument()
    expect(screen.getByText(/Court\/legal process/)).toBeInTheDocument()
    expect(screen.getByText(/Supports opposing party/)).toBeInTheDocument()
    expect(screen.getByText(/Factual but not directly relevant/)).toBeInTheDocument()
  })
})
