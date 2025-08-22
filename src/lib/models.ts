export type User = {
  id: number;
  email: string;
  pb_token: string | null;
  created_at: string;
};

export type Period = "once" | "daily" | "weekly" | "monthly" | "yearly";

export type Feed = {
  id: number;
  user_id: number;
  name: string;
  url: Period;
  created_at: string;
};

export type FeedDTO = Omit<Feed, "user_id" | "created_at">;
