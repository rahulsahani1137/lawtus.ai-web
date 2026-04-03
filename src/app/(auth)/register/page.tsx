"use client";

import React, { useEffect } from 'react';
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useAuthStore } from "@/store/authStore";
import { AuthLayout, EmailForm, OTPInput } from "@/components/auth";

export default function RegisterPage() {
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

  // Don't render register form if already authenticated
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
            title="Create an account"
            description="Enter your email to get started"
            submitLabel="Get started"
          />
          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-medium text-foreground underline underline-offset-4 hover:text-primary transition-colors"
            >
              Sign in
            </Link>
          </p>
        </>
      )}
    </AuthLayout>
  );
}