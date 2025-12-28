import { useQuery } from '@tanstack/react-query';
import { fetchPebbles, PebblesParams } from '@/src/lib/api/pebbles';
import { Pebble } from '@/types';

// export const mockPebbles: Pebble[] = [
//   {
//     id: 'p1',
//     title: 'Become a Guitar Hero: Barre Chords Explained',
//     url: 'https://youtube.com/watch?v=barrechords',
//     sourceType: 'video',
//     focusState: 'focused',
//     topics: [
//       { id: 'music', label: 'Playing Music', confidence: 0.95 },
//       { id: 'guitar', label: 'Playing Guitar', confidence: 0.88 },
//     ],
//     createdAt: '2025-01-02',
//   },
//   {
//     id: 'p2',
//     title: 'Fingerstyle Guitar for Beginners',
//     url: 'https://youtube.com/watch?v=fingerstyle',
//     sourceType: 'video',
//     focusState: 'focused',
//     topics: [
//       { id: 'music', label: 'Playing Music', confidence: 0.93 },
//       { id: 'guitar', label: 'Playing Guitar', confidence: 0.91 },
//     ],
//     createdAt: '2025-01-03',
//   },
//   {
//     id: 'p3',
//     title: 'Piano Chords You Should Know',
//     url: 'https://youtube.com/watch?v=pianochords',
//     sourceType: 'video',
//     focusState: 'unfocused',
//     topics: [
//       { id: 'music', label: 'Playing Music', confidence: 0.9 },
//       { id: 'piano', label: 'Playing Piano', confidence: 0.85 },
//     ],
//     createdAt: '2025-01-01',
//   },
//   {
//     id: 'p4',
//     title: 'How Airbnb Achieved Early Growth',
//     url: 'https://example.com/airbnb-growth',
//     sourceType: 'article',
//     focusState: 'focused',
//     topics: [
//       { id: 'startups', label: 'Startups', confidence: 0.96 },
//       { id: 'growth', label: 'Growth Strategy', confidence: 0.82 },
//     ],
//     createdAt: '2024-12-28',
//   },
//   {
//     id: 'p5',
//     title: 'YC Advice: Do Things That Don’t Scale',
//     url: 'https://example.com/yc-donts-scale',
//     sourceType: 'article',
//     focusState: 'unfocused',
//     topics: [{ id: 'startups', label: 'Startups', confidence: 0.94 }],
//     createdAt: '2024-12-20',
//   },
//   {
//     id: 'p6',
//     title: 'Write Better Technical Documentation',
//     url: 'https://example.com/tech-writing',
//     sourceType: 'article',
//     focusState: 'focused',
//     topics: [
//       { id: 'writing', label: 'Writing', confidence: 0.89 },
//       { id: 'career', label: 'Career Growth', confidence: 0.77 },
//     ],
//     createdAt: '2025-01-04',
//   },
//   {
//     id: 'p7',
//     title: 'Drum Rudiments You Should Practice Daily',
//     url: 'https://youtube.com/watch?v=drumrudiments',
//     sourceType: 'video',
//     focusState: 'unfocused',
//     topics: [
//       { id: 'music', label: 'Playing Music', confidence: 0.91 },
//       { id: 'drums', label: 'Playing Drums', confidence: 0.83 },
//     ],
//     createdAt: '2024-12-18',
//   },
// ];

export function usePebbles(params: PebblesParams = {}) {
  return useQuery<Pebble[]>({
    queryKey: ['pebbles', params],
    queryFn: () => fetchPebbles(params),
    staleTime: 1000 * 30,
  });
}
