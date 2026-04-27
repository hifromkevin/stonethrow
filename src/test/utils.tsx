import { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { Pebble } from '@/types/pebble';

// Create a fresh QueryClient for each test
function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  });
}

// Custom render with providers
function customRender(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'> & { queryClient?: QueryClient }
) {
  const queryClient = options?.queryClient ?? createTestQueryClient();

  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  }

  return {
    ...render(ui, { wrapper: Wrapper, ...options }),
    queryClient,
  };
}

// Mock factory for Pebble
export function createMockPebble(overrides: Partial<Pebble> = {}): Pebble {
  return {
    id: 'pebble-1',
    user_id: 'user-1',
    title: 'Test Article',
    canonical_url: 'https://example.com/article',
    original_url: 'https://example.com/article?utm_source=test',
    description: 'A test article description',
    domain: 'example.com',
    notes: '',
    group_name: 'Uncategorized',
    group_color: '#6366f1',
    is_starred: false,
    is_archived: false,
    image_url: 'https://example.com/image.jpg',
    created_at: new Date().toISOString(),
    status: 'inbox',
    ai_tags: [],
    is_upvoted: false,
    is_complete: false,
    ...overrides,
  };
}

// Mock factory for FocusStatement
export function createMockFocusStatement(
  overrides: Partial<{
    id: string;
    user_id: string;
    statement: string;
    is_active: boolean;
    is_safe: boolean;
    safety_rejection_reason: string | null;
    safety_alternatives: string[] | null;
    model_version: string | null;
    created_at: string;
    updated_at: string;
  }> = {}
) {
  return {
    id: 'focus-1',
    user_id: 'user-1',
    statement: 'Learn TypeScript fundamentals',
    is_active: true,
    is_safe: true,
    safety_rejection_reason: null,
    safety_alternatives: null,
    model_version: 'claude-haiku-4-20250414',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides,
  };
}

// Re-export testing library utilities
export * from '@testing-library/react';
export { userEvent } from '@testing-library/user-event';

// Export custom render as default render
export { customRender as render, createTestQueryClient };
