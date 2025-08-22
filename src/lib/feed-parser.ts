export type Feed = {
  title: string;
  items: FeedItem[];
};

export type FeedItem = {
  title: string;
  link: string;
  pubDate: string;
};

export async function parseFeed(url: string): Promise<Feed> {
  const result = await fetch(`${process.env.RSS_PROXY_URL}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.RSS_PROXY_TOKEN}`,
    },
    body: JSON.stringify({ url }),
  });

  if (!result.ok) {
    throw new Error(`Failed to fetch feed: ${result.statusText}`);
  }

  const rss = (await result.json()) as Feed;

  return {
    title: `${rss.title}`,
    items: rss.items.map((item) => ({
      title: `${item.title}`,
      link: `${item.link}`,
      pubDate: `${item.pubDate}`,
    })),
  };
}
