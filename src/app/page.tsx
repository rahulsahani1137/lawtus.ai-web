"use client";

import Link from "next/link";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";

export default function Home() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 dark:bg-black">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800">
        <div className="text-xl font-bold text-zinc-900 dark:text-white">
          Lawtus.ai
        </div>
        <nav className="flex items-center gap-4">
          {isAuthenticated ? (
            <Button asChild>
              <Link href="/c">Go to Chat</Link>
            </Button>
          ) : (
            <>
              <Button variant="ghost" asChild>
                <Link href="/login">Sign In</Link>
              </Button>
              <Button asChild>
                <Link href="/register">Get Started</Link>
              </Button>
            </>
          )}
        </nav>
      </header>

      {/* Hero Section */}
      <main className="flex flex-1 flex-col items-center justify-center px-6 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-white sm:text-6xl">
          Legal AI Assistant
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-600 dark:text-zinc-400">
          Streamline your legal workflow with AI-powered document analysis,
          research assistance, and intelligent drafting tools.
        </p>
        <div className="mt-10 flex items-center gap-4">
          {isAuthenticated ? (
            <Button size="lg" asChild>
              <Link href="/c">Open Chat</Link>
            </Button>
          ) : (
            <>
              <Button size="lg" asChild>
                <Link href="/register">Start Free Trial</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/login">Sign In</Link>
              </Button>
            </>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-200 dark:border-zinc-800 px-6 py-4 text-center text-sm text-zinc-500 dark:text-zinc-400">
        © {new Date().getFullYear()} Lawtus.ai. All rights reserved.
      </footer>
    </div>
  );
}
