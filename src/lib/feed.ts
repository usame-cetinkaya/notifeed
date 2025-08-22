import { Feed, FeedDTO } from "@/lib/models";

export const toFeedDTO = (feed: Feed): FeedDTO => ({
  id: feed.id,
  name: feed.name,
  url: feed.url,
});

export const updateFeedWithDTO = (feed: Feed, dto: FeedDTO): Feed => ({
  ...feed,
  name: dto.name || feed.name,
  url: dto.url || feed.url,
});

export const getFeedsByUserId = async (db: D1Database, userId: number) => {
  const sql = `SELECT * FROM feeds WHERE user_id = ? ORDER BY name`;
  const result = await db.prepare(sql).bind(userId).all();

  return result.results as Feed[];
};

export const createFeed = async (db: D1Database, feed: Feed) => {
  const { user_id, name, url } = feed;
  const sql = `INSERT INTO feeds (user_id, name, url) VALUES (?, ?, ?)`;

  const result = await db.prepare(sql).bind(user_id, name, url).run();

  return result.meta.last_row_id;
};

export const deleteFeedOfUser = async (
  db: D1Database,
  id: number,
  userId: number,
) => {
  const sql = `DELETE FROM feeds WHERE id = ? AND user_id = ?`;

  await db.prepare(sql).bind(id, userId).run();
};
