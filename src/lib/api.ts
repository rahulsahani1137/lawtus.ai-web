import Cookies from 'js-cookie'

const BASE_URL = process.env.NEXT_PUBLIC_API_URL

let _accessToken: string | null = null

export const setAccessToken = (t: string | null) => {
    _accessToken = t
}
export const getAccessToken = () => _accessToken

export const setRefreshTokenCookie = (token: string) =>
    Cookies.set('lawtus_refresh', token, {
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        expires: 30,
    })

export const getRefreshTokenCookie = () => Cookies.get('lawtus_refresh')
export const clearAuthCookies = () => Cookies.remove('lawtus_refresh')

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
    if (!rt) return null
    try {
        const res = await fetch(`${BASE_URL}/auth/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken: rt }),
        })
        if (!res.ok) return null
        const data = await res.json()
        setAccessToken(data.accessToken)
        setRefreshTokenCookie(data.refreshToken)
        return data.accessToken
    } catch {
        return null
    }
}

function authHeaders(extra?: Record<string, string>): Record<string, string> {
    return {
        'Content-Type': 'application/json',
        ...(_accessToken ? { Authorization: `Bearer ${_accessToken}` } : {}),
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

    if (res.status === 401 && _accessToken) {
        const newToken = await attemptRefresh()
        if (newToken) {
            res = await makeReq()
        } else {
            clearAuthCookies()
            setAccessToken(null)
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
    const headers: Record<string, string> = _accessToken
        ? { Authorization: `Bearer ${_accessToken}` }
        : {}

    let res = await fetch(`${BASE_URL}${path}`, {
        method: 'POST',
        headers,
        body: form,
    })

    if (res.status === 401 && _accessToken) {
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
