"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState, type ReactNode } from "react";

/**
 * Query Provider
 * 
 * Configures TanStack Query for server state management.
 * 
 * Configuration:
 * - Case data: 5 minute stale time
 * - Search results: 1 minute stale time (default)
 * - Retry logic: 3 retries with exponential backoff
 * - Devtools: Available in development only
 */
export function QueryProvider({ children }: { children: ReactNode }) {
    const [queryClient] = useState(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: {
                        // Default stale time: 1 minute (search results)
                        staleTime: 60 * 1000,
                        // Disable automatic refetch on window focus
                        refetchOnWindowFocus: false,
                        // Retry failed requests 3 times with exponential backoff
                        retry: 3,
                        retryDelay: (attemptIndex) =>
                            Math.min(1000 * 2 ** attemptIndex, 30000),
                    },
                    mutations: {
                        // Retry mutations once on failure
                        retry: 1,
                        retryDelay: 1000,
                    },
                },
            })
    );

    return (
        <QueryClientProvider client={queryClient}>
            {children}
            {process.env.NODE_ENV === "development" && (
                <ReactQueryDevtools
                    initialIsOpen={false}
                    buttonPosition="bottom-right"
                />
            )}
        </QueryClientProvider>
    );
}
