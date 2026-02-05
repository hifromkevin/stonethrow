import { Pebble } from '@/types';

const mockPebble = (overrides: Partial<Pebble> & { id: string; title: string; canonical_url: string }): Pebble => ({
  user_id: 'demo-user',
  original_url: overrides.canonical_url,
  domain: new URL(overrides.canonical_url).hostname,
  group_name: 'Learning',
  group_color: '#f90',
  is_starred: false,
  is_archived: false,
  is_upvoted: false,
  status: 'active',
  ai_tags: [],
  created_at: new Date().toISOString(),
  ...overrides,
});

export const prioritizedPebbles: Pebble[] = [
  mockPebble({
    id: 'p1',
    title: 'Pebble with Short Title',
    canonical_url: 'https://short-title.com',
    notes: 'Boosted with a focus star',
    group_name: 'Focus',
    is_starred: true,
  }),
  mockPebble({
    id: 'p2',
    title: 'How to Build Focus Statement',
    canonical_url: 'https://youtube.com/watch?v=123',
    notes: 'This is foundational in learning how to [whatever focus statement says]',
    is_starred: true,
  }),
  mockPebble({
    id: 'p3',
    title: 'Similar Subject that Helps Focus Statement',
    canonical_url: 'https://youtube.com/watch?v=456',
    notes: 'This is a good follow up to (link #1)',
  }),
  mockPebble({
    id: 'p4',
    title: 'This is what a Hovered Link Looks Like',
    canonical_url: 'https://youtube.com/watch?v=789',
    notes: 'After learning [this] and [that], this is a great next step',
  }),
  mockPebble({
    id: 'p5',
    title: 'How to Build Focus Statement',
    canonical_url: 'https://youtube.com/watch?v=101',
    notes: 'This is foundational in learning how to [whatever focus statement says]',
  }),
];
