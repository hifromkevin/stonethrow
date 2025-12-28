export type Topic = {
  id: string;
  label: string;
  confidence: number;
};

export type Pebble = {
  id: string;
  user_id: string;
  title: string;
  url: string;
  notes?: string;
  group_name: string;
  group_color: string;
  is_starred: boolean;
  is_archived: boolean;
  created_at: string;

  // sourceType: 'video' | 'article';
  // focusState: 'focused' | 'unfocused';
  // topics: Topic[];
};
