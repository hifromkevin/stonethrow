export interface Link {
  id: string;
  user_id: string;
  url: string;
  title: string | null;
  description: string | null;
  summary: string | null;
  category: string | null;
  status: 'new' | 'done';
  created_at: string;
  updated_at: string;
}

export interface Category {
  name: string;
  count: number;
}
