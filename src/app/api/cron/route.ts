import { getCloudflareContext } from "@opennextjs/cloudflare";
import { NextResponse } from "next/server";
import { CronFeed, getFeedsForCron } from "@/lib/feed";
import { parseFeed } from "@/lib/feed-parser";
import {
  getNotificationBody,
  getNotificationTitle,
  notify,
} from "@/lib/notification";

export async function GET(req: Request) {
  // const cronSecret = process.env.CRON_SECRET;
  // const authHeader = req.headers.get("Authorization");
  //
  // if (!cronSecret || !authHeader || authHeader !== `Bearer ${cronSecret}`) {
  //   return new Response(JSON.stringify({ error: "Unauthorized" }), {
  //     status: 401,
  //   });
  // }

  const now = new Date();

  console.log(`Cron job started at ${now.toISOString()}`);

  const db = getCloudflareContext().env.DB;
  const kv = getCloudflareContext().env.KV;
  const lastRunAt = await getLastRunAt(kv);
  const feeds = await getFeedsForCron(db);

  const notifications = await Promise.allSettled(
    feeds.map(async (feed) => {
      try {
        const rss = await parseFeed(feed.url);

        rss.items = rss.items.filter(
          (item) => new Date(item.pubDate) > lastRunAt,
        );

        return {
          user: { email: feed.email, pb_token: feed.pb_token },
          feed: rss,
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
      continue;
    }

    await notify(
      notification.user,
      getNotificationTitle(notification.feed),
      getNotificationBody(notification.feed),
    );
  }

  await setLastRunAt(kv, now);

  return NextResponse.json(notifications, { status: 200 });
}

async function getLastRunAt(kv: KVNamespace) {
  const lastRunAtValue = await kv.get("lastRunAt");

  return lastRunAtValue ? new Date(lastRunAtValue) : new Date();
}

async function setLastRunAt(kv: KVNamespace, date: Date) {
  await kv.put("lastRunAt", date.toISOString());
}
