import { XMLParser } from "fast-xml-parser";

export type Feed = {
  title: string;
  items: FeedItem[];
};

export type FeedItem = {
  title: string;
  link: string;
  pubDate: string;
};

type AtomItem = {
  title: string;
  link:
    | { "@_href": string; "@_rel"?: string }
    | Array<{ "@_href": string; "@_rel"?: string }>;
  published?: string;
};

type RssItem = {
  title: string;
  link: string;
  pubDate: string;
};

export async function parseFeed(url: string): Promise<Feed> {
  const res = await fetch(url, { redirect: "follow" });
  const xml = await res.text();

  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "@_",
  });
  const data = parser.parse(xml);

  let title = "";
  let items: FeedItem[] = [];

  // RSS 2.0
  if (data.rss && data.rss.channel) {
    const channel = data.rss.channel;
    title = (channel.title || "No Title").trim();

    const rssItems = Array.isArray(channel.item)
      ? channel.item
      : [channel.item];
    items = rssItems.map((i: RssItem) => ({
      title: (i.title || "").trim(),
      link: (i.link || "").trim(),
      pubDate: (i.pubDate || "").trim(),
    }));
  }
  // Atom
  else if (data.feed && data.feed.entry) {
    title = (data.feed.title || "No Title").trim();
    const atomEntries = Array.isArray(data.feed.entry)
      ? data.feed.entry
      : [data.feed.entry];

    items = atomEntries.map((e: AtomItem) => ({
      title: (e.title || "").trim(),
      link: extractAtomLink(e.link),
      pubDate: (e.published || "").trim(),
    }));
  } else {
    throw new Error(`Unknown feed format ${xml}`);
  }

  return { title, items };
}

/**
 * Extract Atom <link> href
 */
function extractAtomLink(linkNode: unknown): string {
  if (!linkNode) return "";
  if (Array.isArray(linkNode)) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const alt = linkNode.find((l: unknown) => l["@_rel"] === "alternate");
    return (alt && alt["@_href"]) || linkNode[0]["@_href"] || "";
  }
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  return linkNode["@_href"] || "";
}
