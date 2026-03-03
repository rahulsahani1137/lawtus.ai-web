import { http, HttpResponse } from "msw";

const API_BASE_URL = "http://localhost:4000";

// Mock data
export const mockUser = {
    id: "user-123",
    email: "test@example.com",
    name: "Test User",
    role: "user",
};

export const mockTokens = {
    accessToken: "mock-access-token",
    refreshToken: "mock-refresh-token",
    expiresIn: 900,
};

export const mockSession = {
    id: "session-123",
    deviceName: "Chrome on Windows",
    ipAddress: "127.0.0.1",
    userAgent: "Mozilla/5.0",
    country: "US",
    city: "New York",
    lastUsedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
};

export const handlers = [
    // ============================================
    // REGISTRATION FLOW
    // ============================================

    // Register new user
    http.post(`${API_BASE_URL}/auth/register`, async ({ request }) => {
        const body = await request.json() as { email: string; name: string };

        if (!body.email || !body.email.includes("@")) {
            return HttpResponse.json(
                { code: "INVALID_EMAIL", message: "Invalid email format" },
                { status: 400 }
            );
        }

        return HttpResponse.json({
            message: "OTP sent successfully",
            expiresInSeconds: 300,
        });
    }),

    // Verify registration
    http.post(`${API_BASE_URL}/auth/verify-registration`, async ({ request }) => {
        const body = await request.json() as { email: string; otp: string };

        if (body.otp === "000000") {
            return HttpResponse.json(
                { code: "INVALID_OTP", message: "Invalid OTP" },
                { status: 400 }
            );
        }

        if (body.otp === "expired") {
            return HttpResponse.json(
                { code: "OTP_EXPIRED", message: "OTP has expired" },
                { status: 400 }
            );
        }

        return HttpResponse.json({
            user: { ...mockUser, email: body.email, isNewUser: true },
            tokens: mockTokens,
            isNewUser: true,
        });
    }),

    // ============================================
    // LOGIN FLOW
    // ============================================

    // Send OTP
    http.post(`${API_BASE_URL}/auth/send-otp`, async ({ request }) => {
        const body = await request.json() as { email: string };

        if (!body.email || !body.email.includes("@")) {
            return HttpResponse.json(
                { code: "INVALID_EMAIL", message: "Invalid email format" },
                { status: 400 }
            );
        }

        if (body.email === "ratelimited@example.com") {
            return HttpResponse.json(
                { code: "RATE_LIMITED", message: "Too many attempts", retryAfter: 300 },
                { status: 429 }
            );
        }

        return HttpResponse.json({
            message: "OTP sent successfully",
            expiresInSeconds: 300,
        });
    }),

    // Verify OTP
    http.post(`${API_BASE_URL}/auth/verify-otp`, async ({ request }) => {
        const body = await request.json() as { email: string; otp: string };

        if (!body.otp || body.otp.length !== 6) {
            return HttpResponse.json(
                { code: "INVALID_OTP", message: "OTP must be 6 digits" },
                { status: 400 }
            );
        }

        if (body.otp === "000000") {
            return HttpResponse.json(
                { code: "INVALID_OTP", message: "Invalid OTP" },
                { status: 400 }
            );
        }

        if (body.otp === "999999") {
            return HttpResponse.json(
                { code: "OTP_MAX_ATTEMPTS", message: "Maximum OTP verification attempts exceeded" },
                { status: 400 }
            );
        }

        if (body.otp === "expired") {
            return HttpResponse.json(
                { code: "OTP_EXPIRED", message: "OTP has expired" },
                { status: 400 }
            );
        }

        return HttpResponse.json({
            user: { ...mockUser, email: body.email },
            tokens: mockTokens,
            isNewUser: false,
        });
    }),

    // ============================================
    // TOKEN MANAGEMENT
    // ============================================

    // Refresh token
    http.post(`${API_BASE_URL}/auth/refresh`, async ({ request }) => {
        const body = await request.json() as { refreshToken: string };

        if (!body.refreshToken || body.refreshToken === "invalid-token") {
            return HttpResponse.json(
                { code: "INVALID_TOKEN", message: "Invalid refresh token" },
                { status: 401 }
            );
        }

        if (body.refreshToken === "reused-token") {
            return HttpResponse.json(
                { code: "TOKEN_REUSE_DETECTED", message: "Token has been reused - possible theft detected" },
                { status: 401 }
            );
        }

        return HttpResponse.json({
            accessToken: "new-access-token",
            refreshToken: "new-refresh-token",
            expiresIn: 900,
        });
    }),

    // ============================================
    // AUTHENTICATED ENDPOINTS
    // ============================================

    // Get current user
    http.get(`${API_BASE_URL}/auth/me`, async ({ request }) => {
        const authHeader = request.headers.get("Authorization");

        if (!authHeader) {
            return HttpResponse.json(
                { code: "MISSING_AUTH", message: "Missing authorization header" },
                { status: 401 }
            );
        }

        if (!authHeader.startsWith("Bearer ")) {
            return HttpResponse.json(
                { code: "INVALID_TOKEN", message: "Invalid authorization header format" },
                { status: 401 }
            );
        }

        const token = authHeader.replace("Bearer ", "");
        if (token === "invalid-token") {
            return HttpResponse.json(
                { code: "INVALID_TOKEN", message: "Invalid or expired token" },
                { status: 401 }
            );
        }

        if (token === "revoked-token") {
            return HttpResponse.json(
                { code: "SESSION_REVOKED", message: "Session is no longer valid" },
                { status: 401 }
            );
        }

        if (token === "version-mismatch") {
            return HttpResponse.json(
                { code: "SESSION_VERSION_MISMATCH", message: "Session version mismatch" },
                { status: 401 }
            );
        }

        return HttpResponse.json({
            user: mockUser,
            session: mockSession,
        });
    }),

    // Get sessions
    http.get(`${API_BASE_URL}/auth/sessions`, async ({ request }) => {
        const authHeader = request.headers.get("Authorization");

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return HttpResponse.json(
                { code: "MISSING_AUTH", message: "Missing authorization header" },
                { status: 401 }
            );
        }

        return HttpResponse.json({
            sessions: [mockSession, { ...mockSession, id: "session-456", deviceName: "Safari on Mac" }],
        });
    }),

    // ============================================
    // LOGOUT
    // ============================================

    // Logout current session
    http.post(`${API_BASE_URL}/auth/logout`, async ({ request }) => {
        const authHeader = request.headers.get("Authorization");

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return HttpResponse.json(
                { code: "MISSING_AUTH", message: "Missing authorization header" },
                { status: 401 }
            );
        }

        return HttpResponse.json({
            success: true,
            message: "Logged out successfully",
        });
    }),

    // Logout all sessions
    http.post(`${API_BASE_URL}/auth/logout-all`, async ({ request }) => {
        const authHeader = request.headers.get("Authorization");

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return HttpResponse.json(
                { code: "MISSING_AUTH", message: "Missing authorization header" },
                { status: 401 }
            );
        }

        return HttpResponse.json({
            success: true,
            sessionsRevoked: 5,
        });
    }),

    // Revoke specific session
    http.delete(`${API_BASE_URL}/auth/sessions/:sessionId`, async ({ request, params }) => {
        const authHeader = request.headers.get("Authorization");

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return HttpResponse.json(
                { code: "MISSING_AUTH", message: "Missing authorization header" },
                { status: 401 }
            );
        }

        const { sessionId } = params;
        if (sessionId === "not-found") {
            return HttpResponse.json(
                { code: "NOT_FOUND", message: "Session not found" },
                { status: 404 }
            );
        }

        return HttpResponse.json({
            success: true,
            message: "Session revoked",
        });
    }),
];
