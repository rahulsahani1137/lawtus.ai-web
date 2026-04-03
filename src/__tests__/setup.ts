import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, beforeAll } from "vitest";

// Setup DOM environment
beforeAll(() => {
    // Ensure document is available
    if (typeof document === 'undefined') {
        throw new Error('jsdom environment not properly initialized');
    }
    
    // Mock window.matchMedia
    Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: (query: string) => ({
            matches: false,
            media: query,
            onchange: null,
            addListener: () => {},
            removeListener: () => {},
            addEventListener: () => {},
            removeEventListener: () => {},
            dispatchEvent: () => true,
        }),
    });

    // Mock IntersectionObserver
    global.IntersectionObserver = class IntersectionObserver {
        constructor() {}
        disconnect() {}
        observe() {}
        takeRecords() { return []; }
        unobserve() {}
    } as any;

    // Mock ResizeObserver
    global.ResizeObserver = class ResizeObserver {
        constructor() {}
        disconnect() {}
        observe() {}
        unobserve() {}
    } as any;
});

// Cleanup after each test
afterEach(() => {
    cleanup();
});
