/**
 * Base API Client
 * 
 * Provides a typed fetch wrapper with:
 * - Automatic auth header injection
 * - Error handling with typed errors
 * - Retry logic on network failures
 * - Request/response logging
 */

// ============================================================================
// Error Classes
// ============================================================================

/**
 * Base API error class
 */
export class APIError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public code?: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'APIError';
  }
}

/**
 * Network error (connection failed, timeout, etc.)
 */
export class NetworkError extends Error {
  constructor(message: string, public originalError?: unknown) {
    super(message);
    this.name = 'NetworkError';
  }
}

/**
 * Validation error (400 Bad Request)
 */
export class ValidationError extends APIError {
  constructor(message: string, public fields?: Record<string, string[]>) {
    super(message, 400, 'VALIDATION_ERROR', fields);
    this.name = 'ValidationError';
  }
}

// ============================================================================
// Types
// ============================================================================

interface RequestConfig extends RequestInit {
  retry?: boolean;
  retries?: number;
  retryDelay?: number;
  timeout?: number;
}

interface APIClientConfig {
  baseURL: string;
  getAuthToken?: () => string | null | Promise<string | null>;
  onError?: (error: APIError | NetworkError) => void;
  defaultTimeout?: number;
}

// ============================================================================
// API Client
// ============================================================================

export class APIClient {
  private baseURL: string;
  private getAuthToken?: () => string | null | Promise<string | null>;
  private onError?: (error: APIError | NetworkError) => void;
  private defaultTimeout: number;

  constructor(config: APIClientConfig) {
    this.baseURL = config.baseURL;
    this.getAuthToken = config.getAuthToken;
    this.onError = config.onError;
    this.defaultTimeout = config.defaultTimeout || 30000; // 30s default
  }

  /**
   * Make a typed API request
   */
  async request<TResponse = unknown, TBody = unknown>(
    endpoint: string,
    config: RequestConfig = {}
  ): Promise<TResponse> {
    const {
      retry = true,
      retries = 3,
      retryDelay = 1000,
      timeout = this.defaultTimeout,
      ...fetchConfig
    } = config;

    const url = `${this.baseURL}${endpoint}`;
    let lastError: Error | null = null;

    // Retry loop
    for (let attempt = 0; attempt < (retry ? retries : 1); attempt++) {
      try {
        // Add auth header
        const headers = new Headers(fetchConfig.headers);
        
        if (this.getAuthToken) {
          const token = await this.getAuthToken();
          if (token) {
            headers.set('Authorization', `Bearer ${token}`);
          }
        }

        // Set content type for JSON requests
        if (fetchConfig.body && !headers.has('Content-Type')) {
          headers.set('Content-Type', 'application/json');
        }

        // Create abort controller for timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        try {
          const response = await fetch(url, {
            ...fetchConfig,
            headers,
            signal: controller.signal,
          });

          clearTimeout(timeoutId);

          // Handle non-OK responses
          if (!response.ok) {
            await this.handleErrorResponse(response);
          }

          // Parse response
          const contentType = response.headers.get('Content-Type');
          if (contentType?.includes('application/json')) {
            return await response.json();
          }

          // Return empty object for 204 No Content
          if (response.status === 204) {
            return {} as TResponse;
          }

          // Return text for non-JSON responses
          return (await response.text()) as unknown as TResponse;
        } finally {
          clearTimeout(timeoutId);
        }
      } catch (error) {
        lastError = error as Error;

        // Don't retry on API errors (4xx, 5xx) - only retry on network failures
        if (error instanceof APIError || error instanceof ValidationError) {
          throw error;
        }

        // Don't retry if this was the last attempt
        if (attempt === retries - 1) {
          break;
        }

        // Wait before retrying (exponential backoff)
        await this.sleep(retryDelay * Math.pow(2, attempt));
      }
    }

    // All retries failed
    const networkError = new NetworkError(
      `Request failed after ${retries} attempts: ${lastError?.message}`,
      lastError
    );

    if (this.onError) {
      this.onError(networkError);
    }

    throw networkError;
  }

  /**
   * Handle error responses
   */
  private async handleErrorResponse(response: Response): Promise<never> {
    let errorData: any;

    try {
      const contentType = response.headers.get('Content-Type');
      if (contentType?.includes('application/json')) {
        errorData = await response.json();
      } else {
        errorData = { message: await response.text() };
      }
    } catch {
      errorData = { message: response.statusText };
    }

    const message = errorData.message || errorData.error || `HTTP ${response.status}`;
    const code = errorData.code;
    const details = errorData.details;

    // Create appropriate error type
    let error: APIError;

    if (response.status === 400 && errorData.fields) {
      error = new ValidationError(message, errorData.fields);
    } else {
      error = new APIError(message, response.status, code, details);
    }

    if (this.onError) {
      this.onError(error);
    }

    throw error;
  }

  /**
   * GET request
   */
  async get<TResponse = unknown>(
    endpoint: string,
    config?: Omit<RequestConfig, 'method' | 'body'>
  ): Promise<TResponse> {
    return this.request<TResponse>(endpoint, {
      ...config,
      method: 'GET',
    });
  }

  /**
   * POST request
   */
  async post<TResponse = unknown, TBody = unknown>(
    endpoint: string,
    body?: TBody,
    config?: Omit<RequestConfig, 'method' | 'body'>
  ): Promise<TResponse> {
    return this.request<TResponse, TBody>(endpoint, {
      ...config,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  /**
   * PATCH request
   */
  async patch<TResponse = unknown, TBody = unknown>(
    endpoint: string,
    body?: TBody,
    config?: Omit<RequestConfig, 'method' | 'body'>
  ): Promise<TResponse> {
    return this.request<TResponse, TBody>(endpoint, {
      ...config,
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  /**
   * PUT request
   */
  async put<TResponse = unknown, TBody = unknown>(
    endpoint: string,
    body?: TBody,
    config?: Omit<RequestConfig, 'method' | 'body'>
  ): Promise<TResponse> {
    return this.request<TResponse, TBody>(endpoint, {
      ...config,
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  /**
   * DELETE request
   */
  async delete<TResponse = unknown>(
    endpoint: string,
    config?: Omit<RequestConfig, 'method' | 'body'>
  ): Promise<TResponse> {
    return this.request<TResponse>(endpoint, {
      ...config,
      method: 'DELETE',
    });
  }

  /**
   * Sleep utility for retry delays
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// ============================================================================
// Default Client Instance
// ============================================================================

/**
 * Get auth token from localStorage
 */
function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('auth_token');
}

/**
 * Default API client instance
 */
export const apiClient = new APIClient({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:4000',
  getAuthToken,
  onError: (error) => {
    // Log errors in development
    if (process.env.NODE_ENV === 'development') {
      console.error('[API Error]', error);
    }
  },
});
