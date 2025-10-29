export interface Prompt {
  id?: number;
  user_id: number;
  category_id: number | null;
  sub_category_id: number | null;
  prompt: string;
  response: string;
  created_at?: Date;
}
