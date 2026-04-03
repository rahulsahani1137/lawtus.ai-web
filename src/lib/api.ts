import Cookies from 'js-cookie'
import { getAuthToken } from '@/store/authStore'

const BASE_URL = process.env.NEXT_PUBLIC_API_URL

export const setSessionIdCookie = (sessionId: string) =>
    Cookies.set('lawtus_session', sessionId, {
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        expires: 30,
    })

export const getSessionIdCookie = () => Cookies.get('lawtus_session')

// Use auth store for token management
export const getAccessToken = () => getAuthToken()

export const setRefreshTokenCookie = (token: string) =>
    Cookies.set('lawtus_refresh', token, {
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        expires: 30,
    })

export const getRefreshTokenCookie = () => Cookies.get('lawtus_refresh')
export const clearAuthCookies = () => {
    Cookies.remove('lawtus_refresh')
    Cookies.remove('lawtus_session')
}

export class APIError extends Error {
    constructor(
        public code: string,
        message: string,
        public statusCode: number,
        public details?: unknown,
    ) {
        super(message)
        this.name = 'APIError'
    }
}

async function attemptRefresh(): Promise<string | null> {
    const rt = getRefreshTokenCookie()
    const sid = getSessionIdCookie()
    if (!rt || !sid) return null
    try {
        const res = await fetch(`${BASE_URL}/auth/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken: rt, sessionId: sid }),
        })
        if (!res.ok) return null
        const data = await res.json()
        // Token is now managed by auth store
        setRefreshTokenCookie(data.refreshToken)
        return data.accessToken
    } catch {
        return null
    }
}

function authHeaders(extra?: Record<string, string>): Record<string, string> {
    const token = getAccessToken()
    return {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(extra ?? {}),
    }
}

async function parseError(res: Response): Promise<APIError> {
    const body = await res.json().catch(() => ({
        error: { code: 'UNKNOWN_ERROR', message: 'Request failed' },
    }))
    return new APIError(
        body.error?.code ?? body.code ?? 'UNKNOWN_ERROR',
        body.error?.message ?? body.message ?? 'Request failed',
        res.status,
        body.error?.details ?? body.details,
    )
}

export async function apiFetch<T>(
    path: string,
    init: RequestInit = {},
): Promise<T> {
    const makeReq = () =>
        fetch(`${BASE_URL}${path}`, {
            ...init,
            headers: authHeaders(init.headers as Record<string, string>),
        })

    let res = await makeReq()

    if (res.status === 401) {
        const newToken = await attemptRefresh()
        if (newToken) {
            res = await fetch(`${BASE_URL}${path}`, {
                ...init,
                headers: authHeaders(init.headers as Record<string, string>),
            })
        } else {
            clearAuthCookies()
            if (typeof window !== 'undefined') window.location.href = '/auth/login'
            throw new APIError('SESSION_EXPIRED', 'Session expired', 401)
        }
    }

    if (!res.ok) throw await parseError(res)
    return res.json() as T
}

export async function apiUpload<T>(
    path: string,
    form: FormData,
): Promise<T> {
    const token = getAccessToken()
    const headers: Record<string, string> = token
        ? { Authorization: `Bearer ${token}` }
        : {}

    let res = await fetch(`${BASE_URL}${path}`, {
        method: 'POST',
        headers,
        body: form,
    })

    if (res.status === 401) {
        const newToken = await attemptRefresh()
        if (newToken) {
            headers.Authorization = `Bearer ${newToken}`
            res = await fetch(`${BASE_URL}${path}`, {
                method: 'POST',
                headers,
                body: form,
            })
        }
    }

    if (!res.ok) throw await parseError(res)
    return res.json() as T
}

export async function apiStream(
    path: string,
    body: object,
): Promise<Response> {
    const headers = authHeaders()
    const res = await fetch(`${BASE_URL}${path}`, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
    })
    if (!res.ok) throw await parseError(res)
    return res
}

// ============================================
// Cases API
// ============================================

export interface Case {
    id: string;
    title: string;
    draftType: 'bail' | 'injunction' | 'writ' | 'other';
    status: 'interrogating' | 'chronology' | 'contradiction_found' | 'drafting' | 'complete';
    rawFacts?: string;
    createdAt: string;
    updatedAt: string;
}

export const casesAPI = {
    async getCase(caseId: string): Promise<Case> {
        return apiFetch<Case>(`/cases/${caseId}`, {
            method: 'GET',
        });
    },

    async listCases(): Promise<Case[]> {
        return apiFetch<Case[]>('/cases', {
            method: 'GET',
        });
    },

    async createCase(data: {
        title: string;
        draftType: 'bail' | 'injunction' | 'writ' | 'other';
        rawFacts?: string;
    }): Promise<Case> {
        return apiFetch<Case>('/cases', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    async updateCase(
        caseId: string,
        data: {
            title?: string;
            status?: 'interrogating' | 'chronology' | 'contradiction_found' | 'drafting' | 'complete';
            rawFacts?: string;
        }
    ): Promise<Case> {
        return apiFetch<Case>(`/cases/${caseId}`, {
            method: 'PATCH',
            body: JSON.stringify(data),
        });
    },

    async deleteCase(caseId: string): Promise<{ success: boolean }> {
        return apiFetch<{ success: boolean }>(`/cases/${caseId}`, {
            method: 'DELETE',
        });
    },
};
