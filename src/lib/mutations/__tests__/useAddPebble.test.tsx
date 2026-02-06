import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import useAddPebble from '../useAddPebble';

// Mock global fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };
}

describe('useAddPebble', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('mutation function', () => {
    it('calls fetch with correct URL and method', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ ok: true, data: [] }),
      });

      const { result } = renderHook(() => useAddPebble(), {
        wrapper: createWrapper(),
      });

      result.current.mutate('https://example.com/article');

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          '/api/pebbles',
          expect.objectContaining({
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: 'https://example.com/article' }),
          })
        );
      });
    });

    it('includes credentials in request', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ ok: true, data: [] }),
      });

      const { result } = renderHook(() => useAddPebble(), {
        wrapper: createWrapper(),
      });

      result.current.mutate('https://example.com/article');

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          '/api/pebbles',
          expect.objectContaining({
            credentials: 'include',
          })
        );
      });
    });
  });

  describe('success handling', () => {
    it('returns success response data', async () => {
      const mockData = {
        ok: true,
        data: [{ id: 'pebble-1', title: 'Test Article' }],
      };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockData),
      });

      const { result } = renderHook(() => useAddPebble(), {
        wrapper: createWrapper(),
      });

      result.current.mutate('https://example.com/article');

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });
      expect(result.current.data).toEqual(mockData);
    });

    it('returns failure response data', async () => {
      const mockData = { ok: false, error: 'DUPLICATE' };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockData),
      });

      const { result } = renderHook(() => useAddPebble(), {
        wrapper: createWrapper(),
      });

      result.current.mutate('https://example.com/article');

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });
      expect(result.current.data).toEqual(mockData);
    });
  });

  describe('error handling', () => {
    it('throws error on network failure', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      const { result } = renderHook(() => useAddPebble(), {
        wrapper: createWrapper(),
      });

      result.current.mutate('https://example.com/article');

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });
      expect(result.current.error).toBeInstanceOf(Error);
      expect(result.current.error?.message).toBe('Network error');
    });
  });

  describe('pending state', () => {
    it('sets isPending to true while request is in flight', async () => {
      let resolvePromise: (value: unknown) => void;
      const pendingPromise = new Promise((resolve) => {
        resolvePromise = resolve;
      });

      mockFetch.mockReturnValueOnce(pendingPromise);

      const { result } = renderHook(() => useAddPebble(), {
        wrapper: createWrapper(),
      });

      result.current.mutate('https://example.com/article');

      await waitFor(() => {
        expect(result.current.isPending).toBe(true);
      });

      // Resolve the promise
      resolvePromise!({
        ok: true,
        json: () => Promise.resolve({ ok: true, data: [] }),
      });

      await waitFor(() => {
        expect(result.current.isPending).toBe(false);
      });
    });
  });

  describe('query invalidation', () => {
    it('invalidates pebbles query on success', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ ok: true, data: [] }),
      });

      const queryClient = new QueryClient({
        defaultOptions: {
          queries: { retry: false },
          mutations: { retry: false },
        },
      });

      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      );

      const { result } = renderHook(() => useAddPebble(), { wrapper });

      result.current.mutate('https://example.com/article');

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['pebbles'] });
    });
  });
});
