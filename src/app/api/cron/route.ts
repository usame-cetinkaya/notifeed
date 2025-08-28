import { getCloudflareContext } from "@opennextjs/cloudflare";
import { NextResponse } from "next/server";
import { CronFeed, getFeedsForCron, updateFeedCheckedAt } from "@/lib/feed";
import { parseFeed } from "@/lib/feed-parser";
import {
  getNotificationBody,
  getNotificationTitle,
  notify,
} from "@/lib/notification";

export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", {
      status: 401,
    });
  }

  const now = new Date();

  console.log(`Cron job started at ${now.toISOString()}`);

  const db = getCloudflareContext().env.DB;
  const feeds = await getFeedsForCron(db);

  const notifications = await Promise.allSettled(
    feeds.map(async (feed) => {
      try {
        const rss = await parseFeed(feed.url);
        const checkedAt = feed.checked_at ? new Date(feed.checked_at) : now;

        rss.items = rss.items.filter(
          (item) => new Date(item.pubDate) > checkedAt,
        );

        return {
          user: { email: feed.email, pb_token: feed.pb_token },
          feed: { ...rss, id: feed.id },
        };
      } catch (err) {
        throw {
          message: "Failed to fetch feed",
          feed: feed,
          originalError: err,
        };
      }
    }),
  );

  for (const result of notifications) {
    if (result.status === "rejected") {
      const cronFeed = result.reason.feed as CronFeed;
      await notify(
        { email: cronFeed.email, pb_token: cronFeed.pb_token },
        `Notifeed: Failed to fetch ${cronFeed.name}`,
        result.reason.feed.url,
      );
      continue;
    }

    const notification = result.value;

    if (!notification.feed.items.length) {
      await updateFeedCheckedAt(db, notification.feed.id, now);

      continue;
    }

    await notify(
      notification.user,
      getNotificationTitle(notification.feed),
      getNotificationBody(notification.feed),
    );

    await updateFeedCheckedAt(db, notification.feed.id, now);
  }

  return NextResponse.json(null, { status: 200 });
}
