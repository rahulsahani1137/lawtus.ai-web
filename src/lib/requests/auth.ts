import { apiFetch } from '@/lib/api'
import type { User, AuthTokens, AuthSession } from '@/types/auth'

export const registerUser = (email: string, name: string) =>
    apiFetch<{ success: boolean; message: string; expiresIn: number }>(
        '/auth/register',
        { method: 'POST', body: JSON.stringify({ email, name }) },
    )

export const verifyRegistration = (email: string, otp: string) =>
    apiFetch<{ user: User; tokens: AuthTokens; isNewUser: boolean }>(
        '/auth/verify-registration',
        { method: 'POST', body: JSON.stringify({ email, otp }) },
    )

export const requestOtp = (email: string) =>
    apiFetch<{ success: boolean; message: string }>(
        '/auth/send-otp',
        { method: 'POST', body: JSON.stringify({ email }) },
    )

export const verifyOtp = (email: string, otp: string) =>
    apiFetch<{ user: User; tokens: AuthTokens; isNewUser: boolean }>(
        '/auth/verify-otp',
        { method: 'POST', body: JSON.stringify({ email, otp }) },
    )

export const getCurrentUser = () =>
    apiFetch<{
        user: User
        session: { id: string; workspaceId: string | null }
    }>('/auth/me')

export const getAuthSessions = () =>
    apiFetch<{ sessions: AuthSession[] }>('/auth/sessions')

export const logoutCurrent = () =>
    apiFetch<{ success: boolean; message: string }>(
        '/auth/logout',
        { method: 'POST', body: JSON.stringify({}) },
    )

export const logoutAll = () =>
    apiFetch<{ success: boolean; revokedCount: number; message: string }>(
        '/auth/logout-all',
        { method: 'POST', body: JSON.stringify({}) },
    )

export const revokeSession = (sessionId: string) =>
    apiFetch<{ success: boolean; message: string }>(
        '/auth/sessions/revoke',
        { method: 'POST', body: JSON.stringify({ sessionId }) },
    )
