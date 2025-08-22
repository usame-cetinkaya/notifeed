import { User } from "@/lib/models";
import { Feed } from "@/lib/feed-parser";

const getTitle = ({ feedTitle }: Feed) =>
  `Notifeed: ${feedTitle} ${new Date().getTime()}`;

const getBody = ({ items }: Feed) =>
  items.map(({ title, link }) => `${title?.trim()}\n${link}`).join("\n\n");

export const notify = async (
  user: Pick<User, "email" | "pb_token">,
  feed: Feed,
) => {
  const title = getTitle(feed);
  const body = getBody(feed);

  if (user.pb_token) {
    await notifyViaPushbullet(title, body, user.pb_token);
  }
  await notifyViaResend(user.email, title, body);
  await new Promise((resolve) => setTimeout(resolve, 1000));
};

const notifyViaPushbullet = async (
  title: string,
  body: string,
  accessToken: string,
) => {
  const response = await fetch("https://api.pushbullet.com/v2/pushes", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Access-Token": accessToken,
    },
    body: JSON.stringify({
      type: "note",
      title,
      body,
    }),
  });

  if (!response.ok) {
    throw new Error(`Pushbullet API error: ${response.statusText}`);
  }
};

const notifyViaResend = async (to: string, subject: string, html: string) => {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "notifeed@usame.link",
      to,
      subject,
      html,
    }),
  });

  if (!response.ok) {
    throw new Error(`Resend API error: ${response.statusText}`);
  }
};
