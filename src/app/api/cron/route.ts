// import { getCloudflareContext } from "@opennextjs/cloudflare";
import { NextResponse } from "next/server";
import { parseFeed } from "@/app/lib/feed-parser";
// import { Reminder } from "@/lib/models";
// import { notify } from "@/lib/notification";
// import {
//   deleteReminder,
//   getDueReminders,
//   updateReminder,
// } from "@/lib/reminder";
// import { getUserById } from "@/lib/user";

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

  // const db = getCloudflareContext().env.DB;

  const rss = await parseFeed(
    "https://github.com/usame-cetinkaya/notifeed/commits/main.atom",
  );

  return NextResponse.json(rss, { status: 200 });
}
