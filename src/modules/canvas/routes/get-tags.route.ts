import type { RouteOptions } from "fastify";
import { CacheManager } from "@core/database";

const cache = new CacheManager<{
    pixels: { all: number; used: number; unused: number };
    tags: { id: string; name: string | null; count: number }[];
}>();

export const getTags: RouteOptions = {
    method: "GET",
    url: "/tag",
    config: {
        rateLimit: {
            max: 5,
            timeWindow: 2500
        }
    },
    async handler(request, response) {
        const cached = cache.get("top");
        if (cached) return response.send(cached);

        const pixels = request.server.canvas.pixels;

        const data: Record<string, number> = {};
        let used = 0;
        let unused = 0;

        for (const [_id, { tag }] of pixels) {
            if (!tag) {
                unused++;
                continue;
            }
            const key = tag.toString();
            data[key] = (data[key] || 0) + 1;
            used++;
        }

        const top = Object.entries(data)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 10);

        const tagDocs = await request.server.models.Tag.find({
            _id: { $in: top.map(([id]) => id) }
        }).lean();
        const tagMap = Object.fromEntries(
            tagDocs.map((t) => [t._id.toString(), t.name])
        );

        const topWithNames = top.map(([id, count]) => ({
            id,
            name: tagMap[id] || null,
            count
        }));

        const result = {
            pixels: { all: used + unused, used, unused },
            tags: topWithNames
        };

        cache.set("top", result, 30_000);

        return response.send(result);
    }
};
