/**
 * @vitest-environment jsdom
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { EmailStep } from '@/app/auth/login/_components/email-step'
import { ReactNode } from 'react'

// Mock icons
vi.mock('lucide-react', () => ({
    Mail: () => <div>MailIcon</div>,
    User: () => <div>UserIcon</div>,
    ArrowRight: () => <div>ArrowRight</div>,
    Loader2: () => <div>Loader2</div>,
}))

describe('EmailStep', () => {
    it('shows error for invalid email format', async () => {
        const mockOnSuccess = vi.fn()
        const mockOnSendOtp = vi.fn()
        const mockOnRegister = vi.fn()

        render(
            <EmailStep
                onSuccess={mockOnSuccess}
                isLoading={false}
                error={null}
                onSendOtp={mockOnSendOtp}
                onRegister={mockOnRegister}
            />
        )

        const emailInput = screen.getByLabelText(/Email/i)
        fireEvent.change(emailInput, { target: { value: 'invalid-email' } })

        const form = emailInput.closest('form')!
        fireEvent.submit(form)

        await waitFor(() => {
            expect(screen.getByText(/Please enter a valid email address/i)).toBeInTheDocument()
            expect(emailInput.className).toContain('border-destructive')
        })

        expect(mockOnSendOtp).not.toHaveBeenCalled()
    })

    it('shows error for missing name when signing up', async () => {
        const mockOnSuccess = vi.fn()
        const mockOnSendOtp = vi.fn()
        const mockOnRegister = vi.fn()

        const { container } = render(
            <EmailStep
                onSuccess={mockOnSuccess}
                isLoading={false}
                error={null}
                onSendOtp={mockOnSendOtp}
                onRegister={mockOnRegister}
            />
        )

        // Switch to Sign Up mode
        const signUpButton = screen.getByText(/Sign up/i)
        fireEvent.click(signUpButton)

        const emailInput = screen.getByLabelText(/Email/i)
        fireEvent.change(emailInput, { target: { value: 'test@example.com' } })

        const form = emailInput.closest('form')!
        fireEvent.submit(form)

        await waitFor(() => {
            expect(screen.queryByText(/Name is required/i)).toBeInTheDocument()
            const nameInput = screen.getByLabelText(/Full Name/i)
            expect(nameInput.className).toContain('border-destructive')
        })

        expect(mockOnRegister).not.toHaveBeenCalled()
    })

    it('successfully calls onSendOtp for valid existing user', async () => {
        const mockOnSuccess = vi.fn()
        const mockOnSendOtp = vi.fn().mockResolvedValue(true)
        const mockOnRegister = vi.fn()

        render(
            <EmailStep
                onSuccess={mockOnSuccess}
                isLoading={false}
                error={null}
                onSendOtp={mockOnSendOtp}
                onRegister={mockOnRegister}
            />
        )

        const emailInput = screen.getByLabelText(/Email/i)
        fireEvent.change(emailInput, { target: { value: 'test@example.com' } })

        const form = emailInput.closest('form')!
        fireEvent.submit(form)

        await waitFor(() => {
            expect(mockOnSendOtp).toHaveBeenCalledWith('test@example.com')
            expect(mockOnSuccess).toHaveBeenCalledWith('test@example.com', false)
        })
    })
})
