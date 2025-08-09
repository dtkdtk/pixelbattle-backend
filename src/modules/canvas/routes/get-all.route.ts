import sharp from "sharp";
import type { RouteOptions } from "fastify";

export const getAll: RouteOptions = {
    method: "GET",
    url: ".png",
    config: {
        rateLimit: {
            max: 3,
            timeWindow: 3000
        }
    },
    handler: async function handler(request, response) {
        const canvas = await sharp(request.server.canvas.colors, {
            raw: {
                width: request.server.canvas.width,
                height: request.server.canvas.height,
                channels: 3
            }
        })
            .withExif({
                IFD0: {
                    Copyright: "Pixelate It!",
                    Software: "Bun + Sharp"
                }
            })
            .toFormat("png", { compressionLevel: 9, adaptiveFiltering: false })
            .toBuffer();

        return response
            .header("Content-Type", "image/png")
            .code(200)
            .send(canvas);
    }
};
