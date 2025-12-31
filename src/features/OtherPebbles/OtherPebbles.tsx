import { Focus } from 'lucide-react';
import OtherPebblesGroup from '@/features/OtherPebbles/OtherPebblesGroup';

const otherPebbles = [
  {
    id: '1',
    subject: 'Baking',
    reason:
      'Leisure activity so not high priority right now, but food is higher priority than playing',
    items: [
      {
        id: '1',
        user_id: 'user1',
        title: 'Making Sugar Cookies with 3 Ingredients',
        url: 'youtube.com/watch?v=sugarcookies',
        notes: 'This is the simplest of the baking Pebbles',
        group_name: 'Baking',
        group_color: '#17a2b8',
        is_starred: false,
        is_archived: false,
        created_at: '2024-01-10T10:00:00Z',
      },
      {
        id: '1',
        user_id: 'user1',
        title: 'Making Your First Sourdough Bread',
        url: 'youtube.com/watch?v=sourdough',
        notes: 'Sligthly more advanced but still beginner friendly',
        group_name: 'Baking',
        group_color: '#17a2b8',
        is_starred: false,
        is_archived: false,
        created_at: '2024-01-10T10:00:00Z',
      },
    ],
  },
  {
    id: '2',
    subject: 'Guitar',
    reason: 'Leisure activity so not high priority right now',
    items: [
      {
        id: '1',
        user_id: 'user1',
        title: 'Learn Guitar Basics',
        url: 'youtube.com/watch?v=guitarbasics',
        notes: 'Good for absolute beginners',
        group_name: 'Guitar',
        group_color: '#34a853',
        is_starred: false,
        is_archived: false,
        created_at: '2024-01-10T10:00:00Z',
      },
    ],
  },
];

const OtherPebbles = () => {
  return (
    <div className="m-8 w-full max-w-5xl">
      <h2>Other Pebbles</h2>
      <div className="mt-3 divide-y divide-slate-100">
        {otherPebbles.map((group) => (
          <OtherPebblesGroup pebbleGroup={group} />
        ))}
      </div>
    </div>
  );
};

export default OtherPebbles;
