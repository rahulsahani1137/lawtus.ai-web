"use client";

import { useCallback, useEffect, useState, useRef } from "react";
import { ArrowLeft, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSlot,
    InputOTPSeparator,
} from "@/components/ui/input-otp";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface OTPInputProps {
    email: string;
    expiresAt: number | null;
    onVerify: (otp: string) => Promise<boolean>;
    onResend: () => Promise<boolean>;
    onBack: () => void;
    isLoading?: boolean;
    error?: string | null;
    className?: string;
}

export function OTPInput({
    email,
    expiresAt,
    onVerify,
    onResend,
    onBack,
    isLoading = false,
    error,
    className,
}: OTPInputProps) {
    const [otp, setOtp] = useState("");
    const [timeLeft, setTimeLeft] = useState(0);
    const [canResend, setCanResend] = useState(false);
    const [resendCooldown, setResendCooldown] = useState(0);
    const [shake, setShake] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    // Calculate time left
    useEffect(() => {
        if (!expiresAt) return;

        const updateTimer = () => {
            const remaining = Math.max(0, Math.floor((expiresAt - Date.now()) / 1000));
            setTimeLeft(remaining);

            if (remaining === 0) {
                setCanResend(true);
            }
        };

        updateTimer();
        const interval = setInterval(updateTimer, 1000);

        return () => clearInterval(interval);
    }, [expiresAt]);

    // Resend cooldown
    useEffect(() => {
        if (resendCooldown <= 0) return;

        const interval = setInterval(() => {
            setResendCooldown((prev) => Math.max(0, prev - 1));
        }, 1000);

        return () => clearInterval(interval);
    }, [resendCooldown]);

    // Format time
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    // Handle OTP change
    const handleChange = useCallback(
        async (value: string) => {
            setOtp(value);

            // Auto-submit when 6 digits entered
            if (value.length === 6) {
                const success = await onVerify(value);
                if (!success) {
                    // Trigger shake animation
                    setShake(true);
                    setTimeout(() => {
                        setShake(false);
                        setOtp("");
                        inputRef.current?.focus();
                    }, 500);
                }
            }
        },
        [onVerify]
    );

    // Handle resend
    const handleResend = async () => {
        if (resendCooldown > 0 || isLoading) return;

        const success = await onResend();
        if (success) {
            setResendCooldown(60); // 60 second cooldown
            setCanResend(false);
            setOtp("");
        }
    };

    return (
        <Card className={cn("border-0 shadow-none", className)}>
            <CardHeader className="space-y-1 text-center pb-4">
                <CardTitle className="text-xl">Enter verification code</CardTitle>
                <CardDescription className="text-base">
                    We sent a 6-digit code to{" "}
                    <span className="font-medium text-foreground">{email}</span>
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* OTP Input */}
                <div
                    className={cn(
                        "flex justify-center transition-transform",
                        shake && "animate-shake"
                    )}
                >
                    <InputOTP
                        maxLength={6}
                        value={otp}
                        onChange={handleChange}
                        disabled={isLoading}
                        autoFocus
                        ref={inputRef}
                    >
                        <InputOTPGroup>
                            <InputOTPSlot index={0} className="h-12 w-12 text-lg" />
                            <InputOTPSlot index={1} className="h-12 w-12 text-lg" />
                            <InputOTPSlot index={2} className="h-12 w-12 text-lg" />
                        </InputOTPGroup>
                        <InputOTPSeparator />
                        <InputOTPGroup>
                            <InputOTPSlot index={3} className="h-12 w-12 text-lg" />
                            <InputOTPSlot index={4} className="h-12 w-12 text-lg" />
                            <InputOTPSlot index={5} className="h-12 w-12 text-lg" />
                        </InputOTPGroup>
                    </InputOTP>
                </div>

                {/* Error message */}
                {error && (
                    <p className="text-sm text-destructive text-center">{error}</p>
                )}

                {/* Loading indicator */}
                {isLoading && (
                    <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Verifying...
                    </div>
                )}

                {/* Timer and Resend */}
                <div className="flex flex-col items-center gap-3">
                    {timeLeft > 0 && (
                        <p className="text-sm text-muted-foreground">
                            Code expires in{" "}
                            <span className="font-medium text-foreground">
                                {formatTime(timeLeft)}
                            </span>
                        </p>
                    )}

                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleResend}
                        disabled={resendCooldown > 0 || isLoading}
                        className="text-muted-foreground hover:text-foreground"
                    >
                        <RefreshCw className="mr-2 h-4 w-4" />
                        {resendCooldown > 0
                            ? `Resend in ${resendCooldown}s`
                            : "Resend code"}
                    </Button>
                </div>

                {/* Back button */}
                <Button
                    variant="ghost"
                    className="w-full"
                    onClick={onBack}
                    disabled={isLoading}
                >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Use a different email
                </Button>
            </CardContent>

            {/* Shake animation styles */}
            <style jsx global>{`
        @keyframes shake {
          0%,
          100% {
            transform: translateX(0);
          }
          10%,
          30%,
          50%,
          70%,
          90% {
            transform: translateX(-4px);
          }
          20%,
          40%,
          60%,
          80% {
            transform: translateX(4px);
          }
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
        </Card>
    );
}
