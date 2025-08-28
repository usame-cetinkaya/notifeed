export type User = {
  id: number;
  email: string;
  pb_token: string | null;
  created_at: string;
};

export type Feed = {
  id: number;
  user_id: number;
  name: string;
  url: string;
  checked_at: string | null;
  created_at: string;
};

export type FeedDTO = Omit<Feed, "user_id" | "checked_at" | "created_at">;
