"use client";

import { cn } from "@/lib/utils";

interface AuthLayoutProps {
    children: React.ReactNode;
    className?: string;
}

export function AuthLayout({ children, className }: AuthLayoutProps) {
    return (
        <div
            className={cn(
                "min-h-screen flex flex-col items-center justify-center px-4 py-12 bg-background",
                className
            )}
        >
            <div className="w-full max-w-[400px] space-y-8">
                {/* Logo */}
                <div className="flex flex-col items-center space-y-2">
                    <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary text-primary-foreground font-bold text-xl">
                        L
                    </div>
                    <h1 className="text-2xl font-semibold tracking-tight">Lawtus AI</h1>
                </div>

                {/* Content */}
                {children}
            </div>

            {/* Footer */}
            <p className="mt-8 text-center text-sm text-muted-foreground">
                By continuing, you agree to our{" "}
                <a
                    href="/terms"
                    className="underline underline-offset-4 hover:text-foreground transition-colors"
                >
                    Terms of Service
                </a>{" "}
                and{" "}
                <a
                    href="/privacy"
                    className="underline underline-offset-4 hover:text-foreground transition-colors"
                >
                    Privacy Policy
                </a>
            </p>
        </div>
    );
}
