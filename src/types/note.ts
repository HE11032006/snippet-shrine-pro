export interface Note {
  id: string;
  category: string;
  subcategory?: string;
  title: string;
  description: string;
  code: string;
  language: string;
  tags: string[];
  isStarred?: boolean;
  viewCount?: number;
  lastViewedAt?: string;
  createdAt: string;
  updatedAt: string;
  history?: { timestamp: string; code: string }[];
}

export type NoteFormData = Omit<Note, 'id' | 'createdAt' | 'updatedAt'>;
