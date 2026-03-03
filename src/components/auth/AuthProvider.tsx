"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useAuthStore } from "@/store/authStore";
import type { User } from "@/lib/auth";

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isInitialized: boolean;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    isAuthenticated: false,
    isInitialized: false,
});

export function AuthProvider({ children }: { children: ReactNode }) {
    const [mounted, setMounted] = useState(false);

    // Use individual selectors for better performance
    const user = useAuthStore((state) => state.user);
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const isInitialized = useAuthStore((state) => state.isInitialized);
    const refreshToken = useAuthStore((state) => state.refreshToken);
    const accessToken = useAuthStore((state) => state.accessToken);
    const refreshAccessToken = useAuthStore((state) => state.refreshAccessToken);
    const setInitialized = useAuthStore((state) => state.setInitialized);

    // Handle hydration
    useEffect(() => {
        setMounted(true);
    }, []);

    // Initialize auth on mount (only once)
    useEffect(() => {
        if (!mounted || isInitialized) return;

        const initAuth = async () => {
            // If we have a refresh token but no access token, try to refresh
            if (refreshToken && !accessToken) {
                await refreshAccessToken();
            }
            setInitialized(true);
        };

        initAuth();
    }, [mounted, isInitialized, refreshToken, accessToken, refreshAccessToken, setInitialized]);

    // Prevent hydration mismatch by showing loading state until mounted
    if (!mounted) {
        return (
            <AuthContext.Provider
                value={{
                    user: null,
                    isAuthenticated: false,
                    isInitialized: false,
                }}
            >
                {children}
            </AuthContext.Provider>
        );
    }

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated,
                isInitialized,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuthContext() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuthContext must be used within an AuthProvider");
    }
    return context;
}
