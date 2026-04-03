"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuthStore } from "@/store/authStore";
import {
    requestOTP,
    verifyOTP,
    register,
    verifyRegistration,
    logout as logoutAPI,
    logoutAll as logoutAllAPI,
    AuthError,
    getErrorMessage,
} from "@/lib/auth";

/**
 * Hook for requesting OTP (login flow)
 */
export function useRequestOTP() {
    const setPendingEmail = useAuthStore((state) => state.setPendingEmail);

    return useMutation({
        mutationFn: async (email: string) => {
            const response = await requestOTP(email);
            return { email, response };
        },
        onSuccess: ({ email, response }) => {
            setPendingEmail(email, response.expiresInSeconds);
            toast.success("Verification code sent to your email");
        },
        onError: (error) => {
            const message =
                error instanceof AuthError
                    ? getErrorMessage(error)
                    : "Failed to send verification code";
            toast.error(message);
        },
    });
}

/**
 * Hook for registration (new users)
 */
export function useRegister() {
    const setPendingEmail = useAuthStore((state) => state.setPendingEmail);

    return useMutation({
        mutationFn: async ({ email, name }: { email: string; name: string }) => {
            const response = await register(email, name);
            return { email, response };
        },
        onSuccess: ({ email, response }) => {
            setPendingEmail(email, response.expiresInSeconds);
            toast.success("Verification code sent to your email");
        },
        onError: (error) => {
            const message =
                error instanceof AuthError
                    ? getErrorMessage(error)
                    : "Failed to register";
            toast.error(message);
        },
    });
}

/**
 * Hook for verifying OTP (login flow)
 */
export function useVerifyOTP() {
    const router = useRouter();
    const setUser = useAuthStore((state) => state.setUser);
    const setTokens = useAuthStore((state) => state.setTokens);
    const setSessionId = useAuthStore((state) => state.setSessionId);
    const clearPendingEmail = useAuthStore((state) => state.clearPendingEmail);
    const pendingEmail = useAuthStore((state) => state.pendingEmail);

    return useMutation({
        mutationFn: async (otp: string) => {
            if (!pendingEmail) {
                throw new Error("No email pending verification");
            }
            return verifyOTP(pendingEmail, otp);
        }, onSuccess: async (response) => {
            setUser(response.user);
            setTokens(response.tokens);
            
            // Fetch sessionId from /auth/me
            try {
                const { getMe } = await import("@/lib/auth");
                const meResponse = await getMe(response.tokens.accessToken);
                setSessionId(meResponse.session.id);
            } catch (error) {
                console.error("Failed to fetch session info:", error);
            }
            
            clearPendingEmail();
            toast.success("Successfully signed in!");

            // Redirect based on user status
            if (response.isNewUser) {
                router.push("/onboarding");
            } else {
                router.push("/dashboard");
            }
        },
        onError: (error) => {
            const message =
                error instanceof AuthError
                    ? getErrorMessage(error)
                    : "Verification failed";
            toast.error(message);
        },
    });
}

/**
 * Hook for verifying registration OTP (new users)
 */
export function useVerifyRegistration() {
    const router = useRouter();
    const setUser = useAuthStore((state) => state.setUser);
    const setTokens = useAuthStore((state) => state.setTokens);
    const setSessionId = useAuthStore((state) => state.setSessionId);
    const clearPendingEmail = useAuthStore((state) => state.clearPendingEmail);
    const pendingEmail = useAuthStore((state) => state.pendingEmail);

    return useMutation({
        mutationFn: async (otp: string) => {
            if (!pendingEmail) {
                throw new Error("No email pending verification");
            }
            return verifyRegistration(pendingEmail, otp);
        },
        onSuccess: async (response) => {
            setUser(response.user);
            setTokens(response.tokens);
            
            // Fetch sessionId from /auth/me
            try {
                const { getMe } = await import("@/lib/auth");
                const meResponse = await getMe(response.tokens.accessToken);
                setSessionId(meResponse.session.id);
            } catch (error) {
                console.error("Failed to fetch session info:", error);
            }
            
            clearPendingEmail();
            toast.success("Account created successfully!");

            // New user - redirect to onboarding
            router.push("/onboarding");
        },
        onError: (error) => {
            const message =
                error instanceof AuthError
                    ? getErrorMessage(error)
                    : "Verification failed";
            toast.error(message);
        },
    });
}

/**
 * Hook for logging out current session
 */
export function useLogout() {
    const router = useRouter();
    const accessToken = useAuthStore((state) => state.accessToken);
    const clearAuth = useAuthStore((state) => state.clearAuth);

    return useMutation({
        mutationFn: async () => {
            if (accessToken) {
                return logoutAPI(accessToken);
            }
            return null;
        },
        onSuccess: () => {
            clearAuth();
            toast.success("Successfully logged out");
            router.push("/login");
        },
        onError: () => {
            // Even if logout fails on server, clear local state
            clearAuth();
            toast.info("Logged out locally");
            router.push("/login");
        },
    });
}

/**
 * Hook for logging out all sessions
 */
export function useLogoutAll() {
    const router = useRouter();
    const accessToken = useAuthStore((state) => state.accessToken);
    const clearAuth = useAuthStore((state) => state.clearAuth);

    return useMutation({
        mutationFn: async () => {
            if (!accessToken) {
                throw new Error("Not authenticated");
            }
            return logoutAllAPI(accessToken);
        },
        onSuccess: (response) => {
            clearAuth();
            if (response) {
                toast.success(`${response.sessionsRevoked} sessions terminated`);
            }
            router.push("/login");
        },
        onError: () => {
            clearAuth();
            toast.info("Logged out locally");
            router.push("/login");
        },
    });
}
