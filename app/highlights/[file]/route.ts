import { serveMedia } from "@/lib/media-file";

export async function GET(_req: Request, ctx: RouteContext<"/highlights/[file]">) {
  return serveMedia("highlights", (await ctx.params).file);
}
