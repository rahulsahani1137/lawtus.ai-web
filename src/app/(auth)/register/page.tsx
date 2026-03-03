"use client";

import React from 'react';
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { AuthLayout, EmailForm, OTPInput } from "@/components/auth";

export default function RegisterPage() {
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