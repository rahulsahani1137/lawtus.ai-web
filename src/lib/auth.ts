// Auth API client for OTP-based authentication

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

// Error codes from the backend
export type AuthErrorCode =
    | "RATE_LIMITED"
    | "INVALID_OTP"
    | "OTP_EXPIRED"
    | "OTP_MAX_ATTEMPTS"
    | "SESSION_REVOKED"
    | "TOKEN_REUSE_DETECTED"
    | "INVALID_EMAIL"
    | "INVALID_TOKEN"
    | "MISSING_AUTH"
    | "SESSION_VERSION_MISMATCH"
    | "NETWORK_ERROR"
    | "UNKNOWN_ERROR";

export class AuthError extends Error {
    code: AuthErrorCode;
    retryAfter?: number;
    status?: number;

    constructor(message: string, code: AuthErrorCode, retryAfter?: number, status?: number) {
        super(message);
        this.name = "AuthError";
        this.code = code;
        this.retryAfter = retryAfter;
        this.status = status;
    }
}

// API Response Types
export interface User {
    id: string;
    email: string;
    name: string | null;
    role?: string;
    isNewUser?: boolean;
}

export interface Tokens {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
}

export interface Session {
    id: string;
    deviceName?: string;
    ipAddress?: string;
    userAgent?: string;
    country?: string;
    city?: string;
    lastUsedAt: string;
    createdAt: string;
}

// Request/Response types
export interface RegisterRequest {
    email: string;
    name: string;
}

export interface SendOTPRequest {
    email: string;
}

export interface VerifyOTPRequest {
    email: string;
    otp: string;
}

export interface RequestOTPResponse {
    message: string;
    expiresInSeconds: number;
}

export interface VerifyOTPResponse {
    user: User;
    tokens: Tokens;
    isNewUser: boolean;
}

export interface RefreshTokenResponse {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
}

export interface LogoutResponse {
    success: boolean;
    message?: string;
}

export interface LogoutAllResponse {
    success: boolean;
    sessionsRevoked: number;
}

export interface MeResponse {
    user: User;
    session: Session;
}

export interface SessionsResponse {
    sessions: Session[];
}

// Helper to parse error responses
async function parseErrorResponse(response: Response): Promise<AuthError> {
    try {
        const data = await response.json();
        const code = data.code || "UNKNOWN_ERROR";
        const message = data.message || "An error occurred";
        const retryAfter = data.retryAfter;

        return new AuthError(message, code as AuthErrorCode, retryAfter, response.status);
    } catch {
        if (response.status === 429) {
            return new AuthError(
                "Too many attempts. Please try again later.",
                "RATE_LIMITED",
                undefined,
                429
            );
        }
        if (response.status === 401) {
            return new AuthError(
                "Authentication required",
                "MISSING_AUTH",
                undefined,
                401
            );
        }
        return new AuthError(
            `Request failed with status ${response.status}`,
            "UNKNOWN_ERROR",
            undefined,
            response.status
        );
    }
}

// Helper for API requests
async function apiRequest<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> {
    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            credentials: "include", // Important for CORS with credentials
            headers: {
                "Content-Type": "application/json",
                ...options.headers,
            },
        });

        if (!response.ok) {
            throw await parseErrorResponse(response);
        }

        return await response.json();
    } catch (error) {
        if (error instanceof AuthError) {
            throw error;
        }
        throw new AuthError(
            "Network error. Please check your connection.",
            "NETWORK_ERROR"
        );
    }
}

// ============================================
// REGISTRATION FLOW
// ============================================

/**
 * Register a new user - sends verification OTP to email
 */
export async function register(email: string, name: string): Promise<RequestOTPResponse> {
    return apiRequest<RequestOTPResponse>("/auth/register", {
        method: "POST",
        body: JSON.stringify({ email, name }),
    });
}

/**
 * Verify registration with OTP
 */
export async function verifyRegistration(
    email: string,
    otp: string
): Promise<VerifyOTPResponse> {
    return apiRequest<VerifyOTPResponse>("/auth/verify-registration", {
        method: "POST",
        body: JSON.stringify({ email, otp }),
    });
}

// ============================================
// LOGIN FLOW
// ============================================

/**
 * Request OTP for login (existing users)
 */
export async function requestOTP(email: string): Promise<RequestOTPResponse> {
    return apiRequest<RequestOTPResponse>("/auth/send-otp", {
        method: "POST",
        body: JSON.stringify({ email }),
    });
}

/**
 * Verify OTP and get tokens
 */
export async function verifyOTP(
    email: string,
    otp: string
): Promise<VerifyOTPResponse> {
    return apiRequest<VerifyOTPResponse>("/auth/verify-otp", {
        method: "POST",
        body: JSON.stringify({ email, otp }),
    });
}

// ============================================
// TOKEN MANAGEMENT
// ============================================

/**
 * Refresh access token using refresh token
 * Note: Implements token rotation - always save the new refresh token!
 * CRITICAL: The OLD refreshToken becomes INVALID after this call
 */
export async function refreshToken(
    refreshTokenValue: string,
    sessionId: string
): Promise<RefreshTokenResponse> {
    return apiRequest<RefreshTokenResponse>("/auth/refresh", {
        method: "POST",
        body: JSON.stringify({ refreshToken: refreshTokenValue, sessionId }),
    });
}

// ============================================
// AUTHENTICATED ENDPOINTS
// ============================================

/**
 * Get current user info and session
 */
export async function getMe(accessToken: string): Promise<MeResponse> {
    return apiRequest<MeResponse>("/auth/me", {
        method: "GET",
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    });
}

/**
 * Get all active sessions for the current user
 */
export async function getSessions(accessToken: string): Promise<SessionsResponse> {
    return apiRequest<SessionsResponse>("/auth/sessions", {
        method: "GET",
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    });
}

// ============================================
// LOGOUT
// ============================================

/**
 * Logout current session
 */
export async function logout(accessToken: string): Promise<LogoutResponse> {
    return apiRequest<LogoutResponse>("/auth/logout", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({}),
    });
}

/**
 * Logout all sessions (mass logout - O(1) via session versioning)
 */
export async function logoutAll(accessToken: string): Promise<LogoutAllResponse> {
    return apiRequest<LogoutAllResponse>("/auth/logout-all", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({}),
    });
}

/**
 * Revoke a specific session by ID
 */
export async function revokeSession(
    accessToken: string,
    sessionId: string
): Promise<LogoutResponse> {
    return apiRequest<LogoutResponse>(`/auth/sessions/${sessionId}`, {
        method: "DELETE",
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    });
}

// ============================================
// ERROR HANDLING
// ============================================

/**
 * Get user-friendly error message for display
 */
export function getErrorMessage(error: AuthError): string {
    switch (error.code) {
        case "RATE_LIMITED":
            return error.retryAfter
                ? `Too many attempts. Try again in ${Math.ceil(error.retryAfter / 60)} minutes.`
                : "Too many attempts. Please try again later.";
        case "INVALID_OTP":
            return "Invalid code. Please try again.";
        case "OTP_EXPIRED":
            return "Code expired. Request a new one.";
        case "OTP_MAX_ATTEMPTS":
            return "Maximum verification attempts exceeded. Request a new code.";
        case "SESSION_REVOKED":
            return "Session ended. Please login again.";
        case "TOKEN_REUSE_DETECTED":
            return "Security alert: Possible token theft detected. Please login again.";
        case "SESSION_VERSION_MISMATCH":
            return "Session expired due to security update. Please login again.";
        case "INVALID_EMAIL":
            return "Please enter a valid email address.";
        case "INVALID_TOKEN":
            return "Invalid or expired token. Please login again.";
        case "MISSING_AUTH":
            return "Authentication required. Please login.";
        case "NETWORK_ERROR":
            return "Network error. Please check your connection.";
        default:
            return error.message || "An error occurred. Please try again.";
    }
}

/**
 * Check if error requires re-authentication
 */
export function requiresReauth(error: AuthError): boolean {
    return [
        "SESSION_REVOKED",
        "TOKEN_REUSE_DETECTED",
        "SESSION_VERSION_MISMATCH",
        "INVALID_TOKEN",
        "MISSING_AUTH",
    ].includes(error.code);
}
