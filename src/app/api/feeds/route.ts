import { auth } from "@/auth";
import { NextAuthRequest } from "next-auth";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { NextResponse } from "next/server";
import { Feed, FeedDTO } from "@/lib/models";
import {
  createFeed,
  deleteFeedOfUser,
  getFeedsByUserId,
  toFeedDTO,
  updateFeedWithDTO,
} from "@/lib/feed";
import { getUserByEmail } from "@/lib/user";
import { parseFeed } from "@/lib/feed-parser";

const getDbAndUser = async (req: NextAuthRequest) => {
  if (!req.auth) throw new Error("Unauthorized");

  const db = getCloudflareContext().env.DB;
  const email = req?.auth?.user?.email as string;
  const user = await getUserByEmail(db, email);

  return { db, user };
};

export const GET = auth(async function (req) {
  const { db, user } = await getDbAndUser(req);
  const feeds = await getFeedsByUserId(db, user.id);
  const result = feeds.map(toFeedDTO);

  return NextResponse.json(result, { status: 200 });
});

export const POST = auth(async function (req) {
  const { db, user } = await getDbAndUser(req);
  const feedDTO = (await req.json()) as FeedDTO;

  if (!feedDTO.url) {
    return NextResponse.json("Bad Request", { status: 400 });
  }

  const url = new URL(feedDTO.url);

  // if it's a youtube playlist url, convert it to the rss feed url
  if (url.hostname.endsWith("youtube.com") && url.pathname === "/playlist") {
    const listId = url.searchParams.get("list");
    if (listId) {
      feedDTO.url = `https://www.youtube.com/feeds/videos.xml?playlist_id=${listId}`;
    }
  }

  const rss = await parseFeed(feedDTO.url);
  feedDTO.name = rss.title;

  const feed: Feed = updateFeedWithDTO({ user_id: user.id } as Feed, feedDTO);

  const id = await createFeed(db, feed);

  return NextResponse.json({ id }, { status: 201 });
});

export const DELETE = auth(async function (req) {
  const { db, user } = await getDbAndUser(req);
  const { id } = (await req.json()) as { id: number };

  await deleteFeedOfUser(db, id, user.id);

  return NextResponse.json(null, { status: 200 });
});
