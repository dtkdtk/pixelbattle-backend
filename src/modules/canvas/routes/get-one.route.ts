import type { RouteOptions } from "fastify";
import type { IncomingMessage, Server, ServerResponse } from "http";
import { EntityNotFoundError } from "@core/errors/api";
import { normalize } from "@utils";

export const getOne: RouteOptions<
    Server,
    IncomingMessage,
    ServerResponse,
    { Querystring: { x?: number; y?: number; id?: number } }
> = {
    method: "GET",
    url: "/",
    schema: {
        querystring: {
            oneOf: [
                {
                    type: "object",
                    properties: {
                        x: { type: "integer" },
                        y: { type: "integer" }
                    },
                    required: ["x", "y"],
                    additionalProperties: false
                },
                {
                    type: "object",
                    properties: {
                        id: { type: "integer" }
                    },
                    required: ["id"],
                    additionalProperties: false
                }
            ]
        }
    },
    config: {
        rateLimit: {
            max: 5,
            timeWindow: "1s"
        }
    },
    async handler(request, response) {
        let point;
        if (request.query.id === undefined)
            point = request.server.canvas.startPoint({
                x: request.query.x!,
                y: request.query.y!
            });
        else point = request.query.id;

        const pixel = request.server.canvas.getPixel(point);
        if (!pixel) throw new EntityNotFoundError("pixel");

        const author =
            pixel.author &&
            (await request.server.repository.users.findById(pixel.author));
        const tag =
            pixel.tag &&
            (await request.server.repository.tags.findById(pixel.tag));

        return response.code(200).send({
            ...(request.query.id === undefined
                ? { x: request.query.x, y: request.query.y }
                : { id: request.query.id }),
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
