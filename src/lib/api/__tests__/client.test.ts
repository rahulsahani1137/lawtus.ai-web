/**
 * API Client Tests
 * 
 * Basic tests for the API client functionality.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { APIClient, APIError, NetworkError, ValidationError } from '../client';

describe('APIClient', () => {
  let client: APIClient;

  beforeEach(() => {
    client = new APIClient({
      baseURL: 'http://localhost:4000',
      getAuthToken: () => 'test-token',
    });

    // Clear all mocks
    vi.clearAllMocks();
  });

  describe('Error Classes', () => {
    it('should create APIError with correct properties', () => {
      const error = new APIError('Test error', 500, 'TEST_CODE', { detail: 'test' });
      
      expect(error).toBeInstanceOf(Error);
      expect(error.name).toBe('APIError');
      expect(error.message).toBe('Test error');
      expect(error.statusCode).toBe(500);
      expect(error.code).toBe('TEST_CODE');
      expect(error.details).toEqual({ detail: 'test' });
    });

    it('should create NetworkError with correct properties', () => {
      const originalError = new Error('Connection failed');
      const error = new NetworkError('Network error', originalError);
      
      expect(error).toBeInstanceOf(Error);
      expect(error.name).toBe('NetworkError');
      expect(error.message).toBe('Network error');
      expect(error.originalError).toBe(originalError);
    });

    it('should create ValidationError with correct properties', () => {
      const fields = { email: ['Invalid email'], password: ['Too short'] };
      const error = new ValidationError('Validation failed', fields);
      
      expect(error).toBeInstanceOf(APIError);
      expect(error.name).toBe('ValidationError');
      expect(error.message).toBe('Validation failed');
      expect(error.statusCode).toBe(400);
      expect(error.fields).toEqual(fields);
    });
  });

  describe('HTTP Methods', () => {
    it('should make GET request', async () => {
      const mockResponse = { data: 'test' };
      
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Headers({ 'Content-Type': 'application/json' }),
        json: async () => mockResponse,
      });

      const result = await client.get('/test');
      
      expect(result).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:4000/test',
        expect.objectContaining({
          method: 'GET',
        })
      );
    });

    it('should make POST request with body', async () => {
      const mockResponse = { success: true };
      const requestBody = { name: 'test' };
      
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Headers({ 'Content-Type': 'application/json' }),
        json: async () => mockResponse,
      });

      const result = await client.post('/test', requestBody);
      
      expect(result).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:4000/test',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(requestBody),
        })
      );
    });

    it('should make PATCH request', async () => {
      const mockResponse = { updated: true };
      const requestBody = { field: 'value' };
      
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Headers({ 'Content-Type': 'application/json' }),
        json: async () => mockResponse,
      });

      const result = await client.patch('/test', requestBody);
      
      expect(result).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:4000/test',
        expect.objectContaining({
          method: 'PATCH',
        })
      );
    });

    it('should make DELETE request', async () => {
      const mockResponse = { deleted: true };
      
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Headers({ 'Content-Type': 'application/json' }),
        json: async () => mockResponse,
      });

      const result = await client.delete('/test');
      
      expect(result).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:4000/test',
        expect.objectContaining({
          method: 'DELETE',
        })
      );
    });
  });

  describe('Authentication', () => {
    it('should add Authorization header when token is provided', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Headers({ 'Content-Type': 'application/json' }),
        json: async () => ({}),
      });

      await client.get('/test');
      
      const fetchCall = (global.fetch as any).mock.calls[0];
      const headers = fetchCall[1].headers;
      
      expect(headers.get('Authorization')).toBe('Bearer test-token');
    });

    it('should not add Authorization header when token is null', async () => {
      const clientWithoutAuth = new APIClient({
        baseURL: 'http://localhost:4000',
        getAuthToken: () => null,
      });

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Headers({ 'Content-Type': 'application/json' }),
        json: async () => ({}),
      });

      await clientWithoutAuth.get('/test');
      
      const fetchCall = (global.fetch as any).mock.calls[0];
      const headers = fetchCall[1].headers;
      
      expect(headers.has('Authorization')).toBe(false);
    });
  });

  describe('Error Handling', () => {
    it('should throw APIError on 500 response', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        headers: new Headers({ 'Content-Type': 'application/json' }),
        json: async () => ({ message: 'Server error' }),
      });

      await expect(client.get('/test', { retry: false })).rejects.toThrow(APIError);
    });

    it('should throw ValidationError on 400 response with fields', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 400,
        headers: new Headers({ 'Content-Type': 'application/json' }),
        json: async () => ({
          message: 'Validation failed',
          fields: { email: ['Invalid'] },
        }),
      });

      await expect(client.get('/test')).rejects.toThrow(ValidationError);
    });

    it('should handle 204 No Content response', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 204,
        headers: new Headers(),
      });

      const result = await client.delete('/test');
      
      expect(result).toEqual({});
    });
  });

  describe('Retry Logic', () => {
    it('should retry on network failure', async () => {
      let attempts = 0;
      
      global.fetch = vi.fn().mockImplementation(() => {
        attempts++;
        if (attempts < 3) {
          return Promise.reject(new Error('Network error'));
        }
        return Promise.resolve({
          ok: true,
          status: 200,
          headers: new Headers({ 'Content-Type': 'application/json' }),
          json: async () => ({ success: true }),
        });
      });

      const result = await client.get('/test', { retries: 3, retryDelay: 10 });
      
      expect(result).toEqual({ success: true });
      expect(attempts).toBe(3);
    });

    it('should not retry on 4xx errors', async () => {
      let attempts = 0;
      
      global.fetch = vi.fn().mockImplementation(() => {
        attempts++;
        return Promise.resolve({
          ok: false,
          status: 400,
          headers: new Headers({ 'Content-Type': 'application/json' }),
          json: async () => ({ message: 'Bad request' }),
        });
      });

      await expect(client.get('/test', { retries: 3 })).rejects.toThrow(APIError);
      expect(attempts).toBe(1);
    });
  });
});
