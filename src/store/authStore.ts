import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { User, Tokens } from "@/lib/auth";
import { refreshToken as refreshTokenAPI } from "@/lib/auth";

// Helper to decode JWT and extract sessionId
function decodeJwt(token: string): { sessionId: string; exp: number } | null {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split('')
                .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        );
        return JSON.parse(jsonPayload);
    } catch {
        return null;
    }
}

interface AuthState {
    // User state
    user: User | null;
    isAuthenticated: boolean;
    isInitialized: boolean;

    // Token state (accessToken in memory, refreshToken persisted)
    accessToken: string | null;
    refreshToken: string | null;
    sessionId: string | null;
    tokenExpiresAt: number | null;

    // Auth flow state
    pendingEmail: string | null;
    otpExpiresAt: number | null;

    // Actions
    setUser: (user: User | null) => void;
    setTokens: (tokens: Tokens) => void;
    setPendingEmail: (email: string, expiresInSeconds: number) => void;
    clearPendingEmail: () => void;
    clearAuth: () => void;
    setInitialized: (initialized: boolean) => void;
    refreshAccessToken: () => Promise<boolean>;
}

// Token refresh interval (refresh 1 minute before expiry)
const TOKEN_REFRESH_BUFFER = 60 * 1000;

// Store timeout reference outside of store to prevent memory leaks
let refreshTimeoutId: ReturnType<typeof setTimeout> | null = null;

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            // Initial state
            user: null,
            isAuthenticated: false,
            isInitialized: false,
            accessToken: null,
            refreshToken: null,
            sessionId: null,
            tokenExpiresAt: null,
            pendingEmail: null,
            otpExpiresAt: null,

            // Actions
            setUser: (user) =>
                set({
                    user,
                    isAuthenticated: !!user,
                }),

            setTokens: (tokens) => {
                const expiresAt = Date.now() + tokens.expiresIn * 1000;

                // Extract sessionId from the access token JWT
                const decoded = decodeJwt(tokens.accessToken);
                const sessionId = decoded?.sessionId || null;

                set({
                    accessToken: tokens.accessToken,
                    refreshToken: tokens.refreshToken,
                    sessionId,
                    tokenExpiresAt: expiresAt,
                });

                // Clear any existing timeout
                if (refreshTimeoutId) {
                    clearTimeout(refreshTimeoutId);
                }

                // Schedule token refresh
                const refreshTime = tokens.expiresIn * 1000 - TOKEN_REFRESH_BUFFER;
                if (refreshTime > 0) {
                    refreshTimeoutId = setTimeout(() => {
                        get().refreshAccessToken();
                    }, refreshTime);
                }
            },

            setPendingEmail: (email, expiresInSeconds) =>
                set({
                    pendingEmail: email,
                    otpExpiresAt: Date.now() + expiresInSeconds * 1000,
                }),

            clearPendingEmail: () =>
                set({
                    pendingEmail: null,
                    otpExpiresAt: null,
                }),

            clearAuth: () => {
                // Clear refresh timeout
                if (refreshTimeoutId) {
                    clearTimeout(refreshTimeoutId);
                    refreshTimeoutId = null;
                }

                set({
                    user: null,
                    isAuthenticated: false,
                    accessToken: null,
                    refreshToken: null,
                    sessionId: null,
                    tokenExpiresAt: null,
                    pendingEmail: null,
                    otpExpiresAt: null,
                });
            },

            setInitialized: (initialized) => set({ isInitialized: initialized }),

            refreshAccessToken: async () => {
                const { refreshToken: currentRefreshToken, sessionId: currentSessionId } = get();

                if (!currentRefreshToken || !currentSessionId) {
                    get().clearAuth();
                    return false;
                }

                try {
                    const response = await refreshTokenAPI(currentRefreshToken, currentSessionId);
                    const expiresAt = Date.now() + response.expiresIn * 1000;

                    // Extract new sessionId from the new access token
                    const decoded = decodeJwt(response.accessToken);
                    const newSessionId = decoded?.sessionId || currentSessionId;

                    set({
                        accessToken: response.accessToken,
                        refreshToken: response.refreshToken,
                        sessionId: newSessionId,
                        tokenExpiresAt: expiresAt,
                    });

                    // Clear any existing timeout
                    if (refreshTimeoutId) {
                        clearTimeout(refreshTimeoutId);
                    }

                    // Schedule next refresh
                    const refreshTime = response.expiresIn * 1000 - TOKEN_REFRESH_BUFFER;
                    if (refreshTime > 0) {
                        refreshTimeoutId = setTimeout(() => {
                            get().refreshAccessToken();
                        }, refreshTime);
                    }

                    return true;
                } catch {
                    // If refresh fails, clear auth state
                    get().clearAuth();
                    return false;
                }
            },
        }),
        {
            name: "lawtus-auth-storage",
            storage: createJSONStorage(() => {
                // Check if window is defined (client-side only)
                if (typeof window !== "undefined") {
                    return localStorage;
                }
                // Return a no-op storage for SSR
                return {
                    getItem: () => null,
                    setItem: () => { },
                    removeItem: () => { },
                };
            }),
            // Persist refresh token, sessionId, and user data
            partialize: (state) => ({
                user: state.user,
                refreshToken: state.refreshToken,
                sessionId: state.sessionId,
                isAuthenticated: state.isAuthenticated,
            }),
        }
    )
);

// Selector hooks for better performance
export const useUser = () => useAuthStore((state) => state.user);
export const useIsAuthenticated = () =>
    useAuthStore((state) => state.isAuthenticated);
export const useIsInitialized = () =>
    useAuthStore((state) => state.isInitialized);
export const useAccessToken = () => useAuthStore((state) => state.accessToken);
export const useSessionId = () => useAuthStore((state) => state.sessionId);
export const usePendingEmail = () => useAuthStore((state) => state.pendingEmail);
