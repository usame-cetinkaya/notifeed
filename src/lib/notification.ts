import { User } from "@/lib/models";
import { Feed } from "@/lib/feed-parser";

export const getNotificationTitle = ({ title }: Feed) =>
  `Notifeed: ${title} ${new Date().getTime()}`;

export const getNotificationBody = ({ items }: Feed) =>
  items.map(({ title, link }) => `${title?.trim()}\n${link}`).join("\n\n");

export const notify = async (
  user: Pick<User, "email" | "pb_token">,
  title: string,
  body: string,
) => {
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

const notifyViaResend = async (to: string, subject: string, text: string) => {
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
      text,
    }),
  });

  if (!response.ok) {
    throw new Error(`Resend API error: ${response.statusText}`);
  }
};
