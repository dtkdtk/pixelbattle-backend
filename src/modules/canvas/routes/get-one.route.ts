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

        return response.code(200).send(
            normalize(
                {
                    x,
                    y,
                    author: pixel.author,
                    tag: pixel.tag,
                    color: request.server.canvas.getColor(point)
                },
                ["author", "tag"]
            )
        );
    }
};
