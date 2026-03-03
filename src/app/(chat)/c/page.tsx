"use client";

import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export default function ChatPage() {
    const { user, logout, isLoading } = useAuth();

    return (
        <div className="flex min-h-screen flex-col bg-zinc-50 dark:bg-black">
            {/* Header */}
            <header className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 px-6 py-4">
                <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
                    Lawtus AI
                </h1>
                <div className="flex items-center gap-4">
                    {user && (
                        <span className="text-sm text-zinc-600 dark:text-zinc-400">
                            {user.email}
                        </span>
                    )}
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => logout()}
                        disabled={isLoading}
                    >
                        <LogOut className="h-4 w-4 mr-2" />
                        Logout
                    </Button>
                </div>
            </header>

            {/* Main Chat Area */}
            <main className="flex-1 flex flex-col items-center justify-center p-6">
                <div className="max-w-2xl w-full text-center space-y-6">
                    <h2 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
                        Welcome to Lawtus AI
                    </h2>
                    <p className="text-zinc-600 dark:text-zinc-400">
                        Your AI-powered legal assistant. Start a new conversation or continue from where you left off.
                    </p>

                    {/* Placeholder for chat input */}
                    <div className="mt-8 p-4 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                        <p className="text-sm text-zinc-500 dark:text-zinc-500">
                            Chat functionality coming soon...
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
}
