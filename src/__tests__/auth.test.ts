import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
    requestOTP,
    verifyOTP,
    register,
    verifyRegistration,
    refreshToken,
    getMe,
    getSessions,
    logout,
    logoutAll,
    revokeSession,
    AuthError,
    getErrorMessage,
    requiresReauth,
} from "@/lib/auth";

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe("Auth API Client", () => {
    beforeEach(() => {
        mockFetch.mockClear();
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    // Helper to create mock response
    const createMockResponse = (data: unknown, status = 200) => ({
        ok: status >= 200 && status < 300,
        status,
        json: () => Promise.resolve(data),
    });

    // ============================================
    // REGISTRATION FLOW TESTS
    // ============================================
    describe("Registration Flow", () => {
        describe("register()", () => {
            it("should successfully request registration OTP", async () => {
                mockFetch.mockResolvedValueOnce(
                    createMockResponse({
                        message: "OTP sent successfully",
                        expiresInSeconds: 300,
                    })
                );

                const result = await register("newuser@example.com", "New User");

                expect(result).toEqual({
                    message: "OTP sent successfully",
                    expiresInSeconds: 300,
                });
                expect(mockFetch).toHaveBeenCalledWith(
                    "http://localhost:4000/auth/register",
                    expect.objectContaining({
                        method: "POST",
                        body: JSON.stringify({ email: "newuser@example.com", name: "New User" }),
                    })
                );
            });

            it("should throw INVALID_EMAIL for invalid email format", async () => {
                mockFetch.mockResolvedValueOnce(
                    createMockResponse(
                        { code: "INVALID_EMAIL", message: "Invalid email format" },
                        400
                    )
                );

                try {
                    await register("invalid-email", "Test");
                    expect.fail("Should have thrown");
                } catch (error) {
                    expect(error).toBeInstanceOf(AuthError);
                    expect((error as AuthError).code).toBe("INVALID_EMAIL");
                }
            });
        });

        describe("verifyRegistration()", () => {
            it("should successfully verify registration with valid OTP", async () => {
                const mockResponse = {
                    user: {
                        id: "user-123",
                        email: "newuser@example.com",
                        name: "New User",
                        isNewUser: true,
                    },
                    tokens: {
                        accessToken: "mock-access-token",
                        refreshToken: "mock-refresh-token",
                        expiresIn: 900,
                    },
                    isNewUser: true,
                };
                mockFetch.mockResolvedValueOnce(createMockResponse(mockResponse));

                const result = await verifyRegistration("newuser@example.com", "123456");

                expect(result.user.email).toBe("newuser@example.com");
                expect(result.tokens.accessToken).toBe("mock-access-token");
                expect(result.isNewUser).toBe(true);
            });

            it("should throw INVALID_OTP for wrong OTP", async () => {
                mockFetch.mockResolvedValueOnce(
                    createMockResponse(
                        { code: "INVALID_OTP", message: "Invalid OTP" },
                        400
                    )
                );

                try {
                    await verifyRegistration("newuser@example.com", "000000");
                    expect.fail("Should have thrown");
                } catch (error) {
                    expect(error).toBeInstanceOf(AuthError);
                    expect((error as AuthError).code).toBe("INVALID_OTP");
                }
            });

            it("should throw OTP_EXPIRED for expired OTP", async () => {
                mockFetch.mockResolvedValueOnce(
                    createMockResponse(
                        { code: "OTP_EXPIRED", message: "OTP has expired" },
                        400
                    )
                );

                try {
                    await verifyRegistration("newuser@example.com", "expired");
                    expect.fail("Should have thrown");
                } catch (error) {
                    expect(error).toBeInstanceOf(AuthError);
                    expect((error as AuthError).code).toBe("OTP_EXPIRED");
                }
            });
        });
    });

    // ============================================
    // LOGIN FLOW TESTS
    // ============================================
    describe("Login Flow", () => {
        describe("requestOTP()", () => {
            it("should successfully request OTP for valid email", async () => {
                mockFetch.mockResolvedValueOnce(
                    createMockResponse({
                        message: "OTP sent successfully",
                        expiresInSeconds: 300,
                    })
                );

                const result = await requestOTP("test@example.com");

                expect(result.message).toBe("OTP sent successfully");
                expect(result.expiresInSeconds).toBe(300);
            });

            it("should throw INVALID_EMAIL for invalid email format", async () => {
                mockFetch.mockResolvedValueOnce(
                    createMockResponse(
                        { code: "INVALID_EMAIL", message: "Invalid email format" },
                        400
                    )
                );

                try {
                    await requestOTP("invalid-email");
                    expect.fail("Should have thrown");
                } catch (error) {
                    expect(error).toBeInstanceOf(AuthError);
                    expect((error as AuthError).code).toBe("INVALID_EMAIL");
                }
            });

            it("should throw RATE_LIMITED when rate limit exceeded", async () => {
                mockFetch.mockResolvedValueOnce(
                    createMockResponse(
                        { code: "RATE_LIMITED", message: "Too many attempts", retryAfter: 300 },
                        429
                    )
                );

                try {
                    await requestOTP("ratelimited@example.com");
                    expect.fail("Should have thrown");
                } catch (error) {
                    expect(error).toBeInstanceOf(AuthError);
                    expect((error as AuthError).code).toBe("RATE_LIMITED");
                    expect((error as AuthError).retryAfter).toBe(300);
                }
            });
        });

        describe("verifyOTP()", () => {
            it("should successfully verify OTP and return user with tokens", async () => {
                const mockResponse = {
                    user: {
                        id: "user-123",
                        email: "test@example.com",
                        name: "Test User",
                    },
                    tokens: {
                        accessToken: "mock-access-token",
                        refreshToken: "mock-refresh-token",
                        expiresIn: 900,
                    },
                    isNewUser: false,
                };
                mockFetch.mockResolvedValueOnce(createMockResponse(mockResponse));

                const result = await verifyOTP("test@example.com", "123456");

                expect(result.user.id).toBe("user-123");
                expect(result.tokens.accessToken).toBe("mock-access-token");
                expect(result.isNewUser).toBe(false);
            });

            it("should throw INVALID_OTP for wrong OTP", async () => {
                mockFetch.mockResolvedValueOnce(
                    createMockResponse(
                        { code: "INVALID_OTP", message: "Invalid OTP" },
                        400
                    )
                );

                try {
                    await verifyOTP("test@example.com", "000000");
                    expect.fail("Should have thrown");
                } catch (error) {
                    expect(error).toBeInstanceOf(AuthError);
                    expect((error as AuthError).code).toBe("INVALID_OTP");
                }
            });

            it("should throw OTP_MAX_ATTEMPTS after too many wrong attempts", async () => {
                mockFetch.mockResolvedValueOnce(
                    createMockResponse(
                        { code: "OTP_MAX_ATTEMPTS", message: "Maximum attempts exceeded" },
                        400
                    )
                );

                try {
                    await verifyOTP("test@example.com", "999999");
                    expect.fail("Should have thrown");
                } catch (error) {
                    expect(error).toBeInstanceOf(AuthError);
                    expect((error as AuthError).code).toBe("OTP_MAX_ATTEMPTS");
                }
            });

            it("should throw OTP_EXPIRED for expired OTP", async () => {
                mockFetch.mockResolvedValueOnce(
                    createMockResponse(
                        { code: "OTP_EXPIRED", message: "OTP has expired" },
                        400
                    )
                );

                try {
                    await verifyOTP("test@example.com", "expired");
                    expect.fail("Should have thrown");
                } catch (error) {
                    expect(error).toBeInstanceOf(AuthError);
                    expect((error as AuthError).code).toBe("OTP_EXPIRED");
                }
            });
        });
    });

    // ============================================
    // TOKEN MANAGEMENT TESTS
    // ============================================
    describe("Token Management", () => {
        describe("refreshToken()", () => {
            it("should successfully refresh tokens", async () => {
                mockFetch.mockResolvedValueOnce(
                    createMockResponse({
                        accessToken: "new-access-token",
                        refreshToken: "new-refresh-token",
                        expiresIn: 900,
                    })
                );

                const result = await refreshToken("valid-refresh-token", "session-123");

                expect(result.accessToken).toBe("new-access-token");
                expect(result.refreshToken).toBe("new-refresh-token");
                expect(result.expiresIn).toBe(900);
            });

            it("should throw INVALID_TOKEN for invalid refresh token", async () => {
                mockFetch.mockResolvedValueOnce(
                    createMockResponse(
                        { code: "INVALID_TOKEN", message: "Invalid refresh token" },
                        401
                    )
                );

                try {
                    await refreshToken("invalid-token", "session-123");
                    expect.fail("Should have thrown");
                } catch (error) {
                    expect(error).toBeInstanceOf(AuthError);
                    expect((error as AuthError).code).toBe("INVALID_TOKEN");
                }
            });

            it("should throw TOKEN_REUSE_DETECTED for reused token (theft detection)", async () => {
                mockFetch.mockResolvedValueOnce(
                    createMockResponse(
                        { code: "TOKEN_REUSE_DETECTED", message: "Token has been reused" },
                        401
                    )
                );

                try {
                    await refreshToken("reused-token", "session-123");
                    expect.fail("Should have thrown");
                } catch (error) {
                    expect(error).toBeInstanceOf(AuthError);
                    expect((error as AuthError).code).toBe("TOKEN_REUSE_DETECTED");
                }
            });
        });
    });

    // ============================================
    // AUTHENTICATED ENDPOINTS TESTS
    // ============================================
    describe("Authenticated Endpoints", () => {
        describe("getMe()", () => {
            it("should return current user and session info", async () => {
                const mockResponse = {
                    user: {
                        id: "user-123",
                        email: "test@example.com",
                        name: "Test User",
                    },
                    session: {
                        id: "session-123",
                        deviceName: "Chrome on Windows",
                    },
                };
                mockFetch.mockResolvedValueOnce(createMockResponse(mockResponse));

                const result = await getMe("valid-access-token");

                expect(result.user.id).toBe("user-123");
                expect(result.session.id).toBe("session-123");
            });

            it("should throw MISSING_AUTH when no token provided", async () => {
                mockFetch.mockResolvedValueOnce(
                    createMockResponse(
                        { code: "MISSING_AUTH", message: "Missing authorization header" },
                        401
                    )
                );

                try {
                    await getMe("");
                    expect.fail("Should have thrown");
                } catch (error) {
                    expect(error).toBeInstanceOf(AuthError);
                    expect((error as AuthError).code).toBe("MISSING_AUTH");
                }
            });

            it("should throw INVALID_TOKEN for invalid token", async () => {
                mockFetch.mockResolvedValueOnce(
                    createMockResponse(
                        { code: "INVALID_TOKEN", message: "Invalid or expired token" },
                        401
                    )
                );

                try {
                    await getMe("invalid-token");
                    expect.fail("Should have thrown");
                } catch (error) {
                    expect(error).toBeInstanceOf(AuthError);
                    expect((error as AuthError).code).toBe("INVALID_TOKEN");
                }
            });

            it("should throw SESSION_REVOKED for revoked session", async () => {
                mockFetch.mockResolvedValueOnce(
                    createMockResponse(
                        { code: "SESSION_REVOKED", message: "Session is no longer valid" },
                        401
                    )
                );

                try {
                    await getMe("revoked-token");
                    expect.fail("Should have thrown");
                } catch (error) {
                    expect(error).toBeInstanceOf(AuthError);
                    expect((error as AuthError).code).toBe("SESSION_REVOKED");
                }
            });

            it("should throw SESSION_VERSION_MISMATCH after mass logout", async () => {
                mockFetch.mockResolvedValueOnce(
                    createMockResponse(
                        { code: "SESSION_VERSION_MISMATCH", message: "Session version mismatch" },
                        401
                    )
                );

                try {
                    await getMe("version-mismatch");
                    expect.fail("Should have thrown");
                } catch (error) {
                    expect(error).toBeInstanceOf(AuthError);
                    expect((error as AuthError).code).toBe("SESSION_VERSION_MISMATCH");
                }
            });
        });

        describe("getSessions()", () => {
            it("should return list of active sessions", async () => {
                const mockResponse = {
                    sessions: [
                        { id: "session-123", deviceName: "Chrome" },
                        { id: "session-456", deviceName: "Safari" },
                    ],
                };
                mockFetch.mockResolvedValueOnce(createMockResponse(mockResponse));

                const result = await getSessions("valid-access-token");

                expect(result.sessions).toHaveLength(2);
                expect(result.sessions[0].id).toBe("session-123");
            });
        });
    });

    // ============================================
    // LOGOUT TESTS
    // ============================================
    describe("Logout", () => {
        describe("logout()", () => {
            it("should successfully logout current session", async () => {
                mockFetch.mockResolvedValueOnce(
                    createMockResponse({ success: true })
                );

                const result = await logout("valid-access-token");

                expect(result.success).toBe(true);
            });

            it("should throw MISSING_AUTH when no token provided", async () => {
                mockFetch.mockResolvedValueOnce(
                    createMockResponse(
                        { code: "MISSING_AUTH", message: "Missing authorization header" },
                        401
                    )
                );

                try {
                    await logout("");
                    expect.fail("Should have thrown");
                } catch (error) {
                    expect(error).toBeInstanceOf(AuthError);
                    expect((error as AuthError).code).toBe("MISSING_AUTH");
                }
            });
        });

        describe("logoutAll()", () => {
            it("should successfully logout all sessions", async () => {
                mockFetch.mockResolvedValueOnce(
                    createMockResponse({ success: true, sessionsRevoked: 5 })
                );

                const result = await logoutAll("valid-access-token");

                expect(result.success).toBe(true);
                expect(result.sessionsRevoked).toBe(5);
            });
        });

        describe("revokeSession()", () => {
            it("should successfully revoke specific session", async () => {
                mockFetch.mockResolvedValueOnce(
                    createMockResponse({ success: true })
                );

                const result = await revokeSession("valid-access-token", "session-123");

                expect(result.success).toBe(true);
            });

            it("should handle session not found", async () => {
                mockFetch.mockResolvedValueOnce(
                    createMockResponse(
                        { code: "NOT_FOUND", message: "Session not found" },
                        404
                    )
                );

                try {
                    await revokeSession("valid-access-token", "not-found");
                    expect.fail("Should have thrown");
                } catch (error) {
                    expect(error).toBeInstanceOf(AuthError);
                }
            });
        });
    });

    // ============================================
    // ERROR HANDLING TESTS
    // ============================================
    describe("Error Handling", () => {
        describe("getErrorMessage()", () => {
            it("should return correct message for RATE_LIMITED with retryAfter", () => {
                const error = new AuthError("Rate limited", "RATE_LIMITED", 300);
                expect(getErrorMessage(error)).toBe("Too many attempts. Try again in 5 minutes.");
            });

            it("should return correct message for RATE_LIMITED without retryAfter", () => {
                const error = new AuthError("Rate limited", "RATE_LIMITED");
                expect(getErrorMessage(error)).toBe("Too many attempts. Please try again later.");
            });

            it("should return correct message for INVALID_OTP", () => {
                const error = new AuthError("Invalid OTP", "INVALID_OTP");
                expect(getErrorMessage(error)).toBe("Invalid code. Please try again.");
            });

            it("should return correct message for OTP_EXPIRED", () => {
                const error = new AuthError("Expired", "OTP_EXPIRED");
                expect(getErrorMessage(error)).toBe("Code expired. Request a new one.");
            });

            it("should return correct message for OTP_MAX_ATTEMPTS", () => {
                const error = new AuthError("Max attempts", "OTP_MAX_ATTEMPTS");
                expect(getErrorMessage(error)).toBe("Maximum verification attempts exceeded. Request a new code.");
            });

            it("should return correct message for TOKEN_REUSE_DETECTED", () => {
                const error = new AuthError("Reuse detected", "TOKEN_REUSE_DETECTED");
                expect(getErrorMessage(error)).toBe("Security alert: Possible token theft detected. Please login again.");
            });

            it("should return correct message for SESSION_VERSION_MISMATCH", () => {
                const error = new AuthError("Version mismatch", "SESSION_VERSION_MISMATCH");
                expect(getErrorMessage(error)).toBe("Session expired due to security update. Please login again.");
            });

            it("should return correct message for NETWORK_ERROR", () => {
                const error = new AuthError("Network", "NETWORK_ERROR");
                expect(getErrorMessage(error)).toBe("Network error. Please check your connection.");
            });
        });

        describe("requiresReauth()", () => {
            it("should return true for SESSION_REVOKED", () => {
                const error = new AuthError("Revoked", "SESSION_REVOKED");
                expect(requiresReauth(error)).toBe(true);
            });

            it("should return true for TOKEN_REUSE_DETECTED", () => {
                const error = new AuthError("Reuse", "TOKEN_REUSE_DETECTED");
                expect(requiresReauth(error)).toBe(true);
            });

            it("should return true for SESSION_VERSION_MISMATCH", () => {
                const error = new AuthError("Version", "SESSION_VERSION_MISMATCH");
                expect(requiresReauth(error)).toBe(true);
            });

            it("should return true for INVALID_TOKEN", () => {
                const error = new AuthError("Invalid", "INVALID_TOKEN");
                expect(requiresReauth(error)).toBe(true);
            });

            it("should return true for MISSING_AUTH", () => {
                const error = new AuthError("Missing", "MISSING_AUTH");
                expect(requiresReauth(error)).toBe(true);
            });

            it("should return false for INVALID_OTP", () => {
                const error = new AuthError("Invalid OTP", "INVALID_OTP");
                expect(requiresReauth(error)).toBe(false);
            });

            it("should return false for RATE_LIMITED", () => {
                const error = new AuthError("Rate limited", "RATE_LIMITED");
                expect(requiresReauth(error)).toBe(false);
            });
        });

        describe("Network Error Handling", () => {
            it("should throw NETWORK_ERROR when fetch fails", async () => {
                mockFetch.mockRejectedValueOnce(new Error("Network error"));

                try {
                    await requestOTP("test@example.com");
                    expect.fail("Should have thrown");
                } catch (error) {
                    expect(error).toBeInstanceOf(AuthError);
                    expect((error as AuthError).code).toBe("NETWORK_ERROR");
                }
            });
        });
    });

    // ============================================
    // SECURITY TEST CASES
    // ============================================
    describe("Security", () => {
        it("should detect token reuse attack", async () => {
            mockFetch.mockResolvedValueOnce(
                createMockResponse(
                    { code: "TOKEN_REUSE_DETECTED", message: "Token has been reused - possible theft detected" },
                    401
                )
            );

            try {
                await refreshToken("reused-token", "session-123");
                expect.fail("Should have thrown");
            } catch (error) {
                expect(error).toBeInstanceOf(AuthError);
                expect((error as AuthError).code).toBe("TOKEN_REUSE_DETECTED");
                expect(requiresReauth(error as AuthError)).toBe(true);
            }
        });

        it("should reject access after mass logout (session version mismatch)", async () => {
            mockFetch.mockResolvedValueOnce(
                createMockResponse(
                    { code: "SESSION_VERSION_MISMATCH", message: "Session version mismatch" },
                    401
                )
            );

            try {
                await getMe("version-mismatch");
                expect.fail("Should have thrown");
            } catch (error) {
                expect(error).toBeInstanceOf(AuthError);
                expect((error as AuthError).code).toBe("SESSION_VERSION_MISMATCH");
            }
        });

        it("should reject access with revoked session token", async () => {
            mockFetch.mockResolvedValueOnce(
                createMockResponse(
                    { code: "SESSION_REVOKED", message: "Session is no longer valid" },
                    401
                )
            );

            try {
                await getMe("revoked-token");
                expect.fail("Should have thrown");
            } catch (error) {
                expect(error).toBeInstanceOf(AuthError);
                expect((error as AuthError).code).toBe("SESSION_REVOKED");
            }
        });
    });

    // ============================================
    // API REQUEST TESTS
    // ============================================
    describe("API Request Headers", () => {
        it("should include Content-Type header", async () => {
            mockFetch.mockResolvedValueOnce(
                createMockResponse({ message: "OK", expiresInSeconds: 300 })
            );

            await requestOTP("test@example.com");

            expect(mockFetch).toHaveBeenCalledWith(
                expect.any(String),
                expect.objectContaining({
                    headers: expect.objectContaining({
                        "Content-Type": "application/json",
                    }),
                })
            );
        });

        it("should include Authorization header for authenticated requests", async () => {
            mockFetch.mockResolvedValueOnce(
                createMockResponse({ user: {}, session: {} })
            );

            await getMe("test-token");

            expect(mockFetch).toHaveBeenCalledWith(
                expect.any(String),
                expect.objectContaining({
                    headers: expect.objectContaining({
                        Authorization: "Bearer test-token",
                    }),
                })
            );
        });
    });
});
