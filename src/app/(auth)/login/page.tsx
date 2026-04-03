"use client";

import React, { useEffect } from 'react';
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useAuthStore } from "@/store/authStore";
import { AuthLayout, EmailForm, OTPInput } from "@/components/auth";

export default function LoginPage() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isInitialized = useAuthStore((state) => state.isInitialized);
  
  const {
    pendingEmail,
    otpExpiresAt,
    isLoading,
    error,
    sendOTP,
    verifyCode,
    resendOTP,
    cancelOTP,
  } = useAuth();

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (isInitialized && isAuthenticated) {
      router.replace("/dashboard");
    }
  }, [isInitialized, isAuthenticated, router]);

  // Show loading while checking auth status
  if (!isInitialized) {
    return (
      <AuthLayout>
        <div className="flex items-center justify-center py-12">
          <div className="animate-pulse text-muted-foreground">
            Loading...
          </div>
        </div>
      </AuthLayout>
    );
  }

  // Don't render login form if already authenticated
  if (isAuthenticated) {
    return null;
  }

  return (
    <AuthLayout>
      {pendingEmail ? (
        <OTPInput
          email={pendingEmail}
          expiresAt={otpExpiresAt}
          onVerify={verifyCode}
          onResend={resendOTP}
          onBack={cancelOTP}
          isLoading={isLoading}
          error={error}
        />
      ) : (
        <>
          <EmailForm
            onSubmit={sendOTP}
            isLoading={isLoading}
            title="Welcome back"
            description="Enter your email to sign in to your account"
            submitLabel="Sign in"
          />
          <p className="text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link
              href="/register"
              className="font-medium text-foreground underline underline-offset-4 hover:text-primary transition-colors"
            >
              Sign up
            </Link>
          </p>
        </>
      )}
    </AuthLayout>
  );
}