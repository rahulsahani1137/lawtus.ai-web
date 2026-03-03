"use client";

import { useCallback, useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import {
    useRequestOTP,
    useVerifyOTP,
    useLogout,
    useLogoutAll,
} from "./useAuthMutations";

/**
 * Main auth hook that combines Zustand state with TanStack Query mutations
 */
export function useAuth() {
    // Zustand selectors - use individual selectors for better performance
    const user = useAuthStore((state) => state.user);
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const isInitialized = useAuthStore((state) => state.isInitialized);
    const accessToken = useAuthStore((state) => state.accessToken);
    const refreshToken = useAuthStore((state) => state.refreshToken);
    const pendingEmail = useAuthStore((state) => state.pendingEmail);
    const otpExpiresAt = useAuthStore((state) => state.otpExpiresAt);

    // Zustand actions
    const clearPendingEmail = useAuthStore((state) => state.clearPendingEmail);
    const refreshAccessToken = useAuthStore((state) => state.refreshAccessToken);
    const setInitialized = useAuthStore((state) => state.setInitialized);

    // TanStack Query mutations
    const requestOTPMutation = useRequestOTP();
    const verifyOTPMutation = useVerifyOTP();
    const logoutMutation = useLogout();
    const logoutAllMutation = useLogoutAll();

    // Initialize auth state on mount
    useEffect(() => {
        if (isInitialized) return;

        const initAuth = async () => {
            // If we have a refresh token but no access token, try to refresh
            if (refreshToken && !accessToken) {
                await refreshAccessToken();
            }
            setInitialized(true);
        };

        initAuth();
    }, [isInitialized, refreshToken, accessToken, refreshAccessToken, setInitialized]);

    // Wrapped mutation functions for backward compatibility
    const sendOTP = useCallback(
        async (email: string): Promise<boolean> => {
            try {
                await requestOTPMutation.mutateAsync(email);
                return true;
            } catch {
                return false;
            }
        },
        [requestOTPMutation]
    );

    const verifyCode = useCallback(
        async (otp: string): Promise<boolean> => {
            try {
                await verifyOTPMutation.mutateAsync(otp);
                return true;
            } catch {
                return false;
            }
        },
        [verifyOTPMutation]
    );

    const resendOTP = useCallback(async (): Promise<boolean> => {
        if (!pendingEmail) return false;
        return sendOTP(pendingEmail);
    }, [pendingEmail, sendOTP]);

    const logout = useCallback(async () => {
        await logoutMutation.mutateAsync();
    }, [logoutMutation]);

    const logoutAllSessions = useCallback(async () => {
        await logoutAllMutation.mutateAsync();
    }, [logoutAllMutation]);

    const cancelOTP = useCallback(() => {
        clearPendingEmail();
        requestOTPMutation.reset();
        verifyOTPMutation.reset();
    }, [clearPendingEmail, requestOTPMutation, verifyOTPMutation]);

    // Compute loading state from mutations
    const isLoading =
        requestOTPMutation.isPending ||
        verifyOTPMutation.isPending ||
        logoutMutation.isPending ||
        logoutAllMutation.isPending;

    // Get error from the most recent failed mutation
    const error = verifyOTPMutation.error?.message || requestOTPMutation.error?.message || null;

    return {
        // State
        user,
        isAuthenticated,
        isLoading,
        isInitialized,
        pendingEmail,
        otpExpiresAt,
        error,
        accessToken,

        // Actions
        sendOTP,
        verifyCode,
        resendOTP,
        logout,
        logoutAllSessions,
        cancelOTP,
        clearError: () => {
            requestOTPMutation.reset();
            verifyOTPMutation.reset();
        },

        // Expose mutations for more control if needed
        mutations: {
            requestOTP: requestOTPMutation,
            verifyOTP: verifyOTPMutation,
            logout: logoutMutation,
            logoutAll: logoutAllMutation,
        },
    };
}
