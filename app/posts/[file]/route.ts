import { serveMedia } from "@/lib/media-file";

export async function GET(_req: Request, ctx: RouteContext<"/posts/[file]">) {
  return serveMedia("posts", (await ctx.params).file);
}
