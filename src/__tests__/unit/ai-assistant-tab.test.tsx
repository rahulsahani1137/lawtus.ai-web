/**
 * @vitest-environment jsdom
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { AiAssistantTab } from '@/app/(main)/drafts/[draftId]/_components/ai-assistant-tab'
import { Toaster } from 'sonner'

vi.mock('@/store/authStore', () => ({
    useUser: () => ({ name: 'Test User', email: 'test@example.com' })
}))

// Mock lucide icons
vi.mock('lucide-react', () => ({
    Loader2: () => <div>Loader2</div>,
    Wand2: () => <div>Wand2</div>,
}))

describe('AiAssistantTab RAG Component', () => {
    beforeEach(() => {
        vi.restoreAllMocks()
    })

    it('should disable generate button when prompt is empty', () => {
        const mockOnApply = vi.fn()
        render(<AiAssistantTab draftId="123" content="Original Content" onApply={mockOnApply} />)

        const generateBtn = screen.getByRole('button', { name: /Generate Edits/i })
        expect(generateBtn).toBeDisabled()
    })

    it('should show RAG proposed edits after successful generation', async () => {
        const mockOnApply = vi.fn()

        // Mock fetch response for testing the RAG endpoint
        global.fetch = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => ({
                editedContent: "Original Content\n\n[AI SUGGESTION]: Make it formal"
            })
        })

        render(
            <>
                <Toaster />
                <AiAssistantTab draftId="123" content="Original Content" onApply={mockOnApply} />
            </>
        )

        const textArea = screen.getByPlaceholderText(/e.g., Rewrite the third paragraph/i)
        fireEvent.change(textArea, { target: { value: 'Make it formal' } })

        const generateBtn = screen.getByRole('button', { name: /Generate Edits/i })
        expect(generateBtn).not.toBeDisabled()

        fireEvent.click(generateBtn)

        expect(global.fetch).toHaveBeenCalledWith('/api/ai/edit-draft', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ draftId: '123', prompt: 'Make it formal', content: 'Original Content' })
        })

        // Wait for generation to complete and proposed edit to show up
        await waitFor(() => {
            expect(screen.getByText('Proposed Edits')).toBeInTheDocument()
            expect(screen.getByText(/AI SUGGESTION/)).toBeInTheDocument()
        })
    })

    it('should apply changes when "Apply Changes" is clicked', async () => {
        const mockOnApply = vi.fn()

        global.fetch = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => ({
                editedContent: "This is a new edited text."
            })
        })

        render(<AiAssistantTab draftId="123" content="Original Content" onApply={mockOnApply} />)

        // Generate
        const textArea = screen.getByPlaceholderText(/e.g., Rewrite the third paragraph/i)
        fireEvent.change(textArea, { target: { value: 'Fix typos' } })

        const generateBtn = screen.getByRole('button', { name: /Generate Edits/i })
        fireEvent.click(generateBtn)

        // Wait for the result
        await waitFor(() => {
            expect(screen.getByText('This is a new edited text.')).toBeInTheDocument()
        })

        // Apply edits
        const applyBtn = screen.getByRole('button', { name: /Apply Changes/i })
        fireEvent.click(applyBtn)

        expect(mockOnApply).toHaveBeenCalledWith('This is a new edited text.')

        // Check it resets state
        await waitFor(() => {
            expect(screen.queryByText('Proposed Edits')).not.toBeInTheDocument()
            expect(textArea).toHaveValue('')
        })
    })

    it('handles failure from RAG endpoint gracefully', async () => {
        const mockOnApply = vi.fn()

        // Mock fetch failure
        global.fetch = vi.fn().mockRejectedValue(new Error('Network error'))

        render(
            <>
                <Toaster />
                <AiAssistantTab draftId="123" content="Original Content" onApply={mockOnApply} />
            </>
        )

        const textArea = screen.getByPlaceholderText(/e.g., Rewrite the third paragraph/i)
        fireEvent.change(textArea, { target: { value: 'Fail test' } })

        const generateBtn = screen.getByRole('button', { name: /Generate Edits/i })
        fireEvent.click(generateBtn)

        // Expect state to recover and propose edit to not show
        await waitFor(() => {
            expect(screen.queryByText('Proposed Edits')).not.toBeInTheDocument()
            expect(generateBtn).not.toBeDisabled() // reset to active
        })
    })
})
