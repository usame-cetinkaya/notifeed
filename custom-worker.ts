// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore `.open-next/worker.ts` is generated at build time
import { default as handler } from "./.open-next/worker.js";

export default {
  fetch: handler.fetch,

  /**
   * Scheduled Handler
   *
   * Can be tested with:
   * - `wrangler dev --test-scheduled`
   * - `curl "http://localhost:8787/__scheduled?cron=*+*+*+*+*"`
   */
  async scheduled(event, env, ctx) {
    const url = new URL("/api/cron", "http://internal");
    const request = new Request(url.toString(), { method: "GET" });

    request.headers.set("Authorization", `Bearer ${env.CRON_SECRET}`);

    ctx.waitUntil(handler.fetch(request, env, ctx));
  },
} satisfies ExportedHandler<CloudflareEnv>;

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore `.open-next/worker.ts` is generated at build time
export { DOQueueHandler, DOShardedTagCache } from "./.open-next/worker.js";
