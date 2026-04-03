import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import Cookies from "js-cookie";
import type { User, Tokens } from "@/lib/auth";
import { refreshToken as refreshTokenAPI, getMe } from "@/lib/auth";

/**
 * PASETO tokens cannot be decoded client-side like JWT
 * They are cryptographically signed and must be verified server-side
 * We store sessionId separately instead of extracting from token
 */

interface AuthState {
    // User state
    user: User | null;
    isAuthenticated: boolean;
    isInitialized: boolean;
    isLoading: boolean;

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
    setSessionId: (sessionId: string) => void;
    setTokens: (tokens: Tokens) => void;
    setAuth: (accessToken: string, refreshToken: string, user: User) => void;
    setPendingEmail: (email: string, expiresInSeconds: number) => void;
    clearPendingEmail: () => void;
    clearAuth: () => void;
    setInitialized: (initialized: boolean) => void;
    setLoading: (loading: boolean) => void;
    refreshAccessToken: () => Promise<boolean>;
    initialize: () => Promise<void>;
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
            isLoading: true,
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

            setSessionId: (sessionId) =>
                set({
                    sessionId,
                }),

            setTokens: (tokens) => {
                const expiresAt = Date.now() + tokens.expiresIn * 1000;

                // Write tokens to cookies (using names expected by middleware)
                Cookies.set('accessToken', tokens.accessToken, {
                    expires: 7,
                    sameSite: 'strict',
                    secure: process.env.NODE_ENV === 'production',
                });
                Cookies.set('refreshToken', tokens.refreshToken, {
                    expires: 30,
                    sameSite: 'strict',
                    secure: process.env.NODE_ENV === 'production',
                });

                set({
                    accessToken: tokens.accessToken,
                    refreshToken: tokens.refreshToken,
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

            setAuth: (accessToken, refreshToken, user) => {
                const tokens: Tokens = {
                    accessToken,
                    refreshToken,
                    expiresIn: 900, // 15 minutes (matches PASETO config)
                };
                get().setTokens(tokens);
                get().setUser(user);
                set({ isLoading: false });
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

                // Clear cookies (both old and new names for compatibility)
                Cookies.remove('accessToken');
                Cookies.remove('refreshToken');
                Cookies.remove('lawtus_token');
                Cookies.remove('lawtus_refresh');
                Cookies.remove('lawtus_session');

                set({
                    user: null,
                    isAuthenticated: false,
                    accessToken: null,
                    refreshToken: null,
                    sessionId: null,
                    tokenExpiresAt: null,
                    pendingEmail: null,
                    otpExpiresAt: null,
                    isLoading: false,
                });
            },

            setInitialized: (initialized) => set({ isInitialized: initialized }),

            setLoading: (loading) => set({ isLoading: loading }),

            refreshAccessToken: async () => {
                const { refreshToken: currentRefreshToken, sessionId: currentSessionId } = get();

                if (!currentRefreshToken) {
                    get().clearAuth();
                    return false;
                }

                // If no sessionId, we can't refresh - clear auth
                if (!currentSessionId) {
                    console.warn('No sessionId available for token refresh');
                    get().clearAuth();
                    return false;
                }

                try {
                    const response = await refreshTokenAPI(currentRefreshToken, currentSessionId);
                    const expiresAt = Date.now() + response.expiresIn * 1000;

                    // Update cookies (using names expected by middleware)
                    Cookies.set('accessToken', response.accessToken, {
                        expires: 7,
                        sameSite: 'strict',
                        secure: process.env.NODE_ENV === 'production',
                    });
                    Cookies.set('refreshToken', response.refreshToken, {
                        expires: 30,
                        sameSite: 'strict',
                        secure: process.env.NODE_ENV === 'production',
                    });

                    set({
                        accessToken: response.accessToken,
                        refreshToken: response.refreshToken,
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
                } catch (error) {
                    console.error('Token refresh failed:', error);
                    // If refresh fails, clear auth state
                    get().clearAuth();
                    return false;
                }
            },

            initialize: async () => {
                if (get().isInitialized) return;

                set({ isLoading: true });

                // Try to restore from cookies (check both old and new names)
                const tokenFromCookie = Cookies.get('accessToken') || Cookies.get('lawtus_token');
                const refreshFromCookie = Cookies.get('refreshToken') || Cookies.get('lawtus_refresh');

                if (!tokenFromCookie && !refreshFromCookie) {
                    set({
                        isInitialized: true,
                        isLoading: false,
                        isAuthenticated: false,
                    });
                    return;
                }

                // If we have a refresh token but no access token, try to refresh
                if (refreshFromCookie && !tokenFromCookie) {
                    // Check if we have sessionId in localStorage
                    const storedState = get();
                    if (!storedState.sessionId) {
                        console.warn('Refresh token found but no sessionId - clearing auth');
                        get().clearAuth();
                        set({ isInitialized: true, isLoading: false });
                        return;
                    }
                    
                    set({ refreshToken: refreshFromCookie });
                    const refreshed = await get().refreshAccessToken();
                    if (refreshed) {
                        // Validate the new token
                        try {
                            const { user, session } = await getMe(get().accessToken!);
                            set({
                                user,
                                sessionId: session.id,
                                isAuthenticated: true,
                                isInitialized: true,
                                isLoading: false,
                            });
                        } catch {
                            get().clearAuth();
                            set({ isInitialized: true, isLoading: false });
                        }
                    } else {
                        set({ isInitialized: true, isLoading: false });
                    }
                    return;
                }

                // If we have an access token, validate it
                if (tokenFromCookie) {
                    set({ accessToken: tokenFromCookie });
                    try {
                        const { user, session } = await getMe(tokenFromCookie);
                        set({
                            user,
                            sessionId: session.id,
                            isAuthenticated: true,
                            isInitialized: true,
                            isLoading: false,
                        });
                    } catch {
                        // Token invalid, try refresh
                        if (refreshFromCookie) {
                            set({ refreshToken: refreshFromCookie });
                            const refreshed = await get().refreshAccessToken();
                            if (refreshed) {
                                try {
                                    const { user, session } = await getMe(get().accessToken!);
                                    set({
                                        user,
                                        sessionId: session.id,
                                        isAuthenticated: true,
                                        isInitialized: true,
                                        isLoading: false,
                                    });
                                } catch {
                                    get().clearAuth();
                                    set({ isInitialized: true, isLoading: false });
                                }
                            } else {
                                get().clearAuth();
                                set({ isInitialized: true, isLoading: false });
                            }
                        } else {
                            get().clearAuth();
                            set({ isInitialized: true, isLoading: false });
                        }
                    }
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

// Plain getter for use outside React components (e.g., API interceptors)
export const getAuthToken = (): string | null => {
    return useAuthStore.getState().accessToken || Cookies.get('accessToken') || Cookies.get('lawtus_token') || null;
};

// Selector hooks for better performance
export const useUser = () => useAuthStore((state) => state.user);
export const useIsAuthenticated = () =>
    useAuthStore((state) => state.isAuthenticated);
export const useIsInitialized = () =>
    useAuthStore((state) => state.isInitialized);
export const useAuthLoading = () => useAuthStore((state) => state.isLoading);
export const useAccessToken = () => useAuthStore((state) => state.accessToken);
export const useSessionId = () => useAuthStore((state) => state.sessionId);
export const usePendingEmail = () => useAuthStore((state) => state.pendingEmail);

// Export AuthActions for backward compatibility
export const AuthActions = {
    setTokens: (accessToken: string, refreshToken: string, user: User) => {
        useAuthStore.getState().setAuth(accessToken, refreshToken, user);
    },
    logout: () => {
        useAuthStore.getState().clearAuth();
    },
    initialize: async () => {
        await useAuthStore.getState().initialize();
    },
};

export default useAuthStore;
