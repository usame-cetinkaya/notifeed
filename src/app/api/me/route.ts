import { auth } from "@/auth";
import { NextAuthRequest } from "next-auth";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { NextResponse } from "next/server";
import { getUserByEmail, updateUserPbToken } from "@/lib/user";

const getDbAndUser = async (req: NextAuthRequest) => {
  const db = getCloudflareContext().env.DB;

  if (!req.auth) throw new Error("Unauthorized");

  const email = req?.auth?.user?.email as string;
  const user = await getUserByEmail(db, email);

  return { db, user };
};

export const GET = auth(async function (req) {
  const { user } = await getDbAndUser(req);
  const { pb_token } = user;

  return NextResponse.json({ pb_token }, { status: 200 });
});

export const PUT = auth(async function (req) {
  const { db, user } = await getDbAndUser(req);
  const { pb_token } = (await req.json()) as { pb_token: string };

  await updateUserPbToken(db, user.id, pb_token);

  return NextResponse.json(null, { status: 200 });
});
