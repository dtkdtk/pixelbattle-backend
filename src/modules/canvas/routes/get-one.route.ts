import type { RouteOptions } from "fastify";
import type { IncomingMessage, Server, ServerResponse } from "http";
import { EntityNotFoundError } from "@core/errors/api";
import { normalize } from "@utils";

export const getOne: RouteOptions<
    Server,
    IncomingMessage,
    ServerResponse,
    { Querystring: { x: number; y: number } }
> = {
    method: "GET",
    url: "/",
    schema: {
        querystring: {
            type: "object",
            properties: {
                x: { type: "integer" },
                y: { type: "integer" }
            },
            required: ["x", "y"],
            additionalProperties: false
        }
    },
    config: {
        rateLimit: {
            max: 5,
            timeWindow: "1s"
        }
    },
    async handler(request, response) {
        const x = request.query.x;
        const y = request.query.y;
        const point = request.server.canvas.startPoint({ x, y });
        const pixel = request.server.canvas.getPixel(point);

        if (!pixel) throw new EntityNotFoundError("pixel");

        const author =
            pixel.author &&
            (await request.server.cache.usersService.get({
                _id: pixel.author
            }));
        const tag =
            pixel.tag &&
            (await request.server.cache.tagsService.get({
                _id: pixel.tag
            }));

        return response.code(200).send({
            x,
            y,
            author:
                author &&
                normalize(
                    {
                        _id: author._id,
                        username: author.username,
                        role: author.role
                    },
                    ["_id"]
                ),
            tag: tag && normalize(tag, ["_id"]),
            color: request.server.canvas.getColor(point)
        });
    }
};
