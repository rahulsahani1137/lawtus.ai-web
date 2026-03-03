"use client";

import React from 'react';
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { AuthLayout, EmailForm, OTPInput } from "@/components/auth";

export default function LoginPage() {
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