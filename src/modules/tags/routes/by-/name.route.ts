import type { RouteOptions } from "fastify";
import type { IncomingMessage, Server, ServerResponse } from "http";
import { EntityNotFoundError } from "@core/errors/api";
import { normalize } from "@utils";

export const getByName: RouteOptions<
    Server,
    IncomingMessage,
    ServerResponse,
    { Params: { name: string } }
> = {
    method: "GET",
    url: "name/:name",
    schema: {
        params: {
            type: "object",
            required: ["name"],
            properties: {
                name: {
                    type: "string",
                    minLength: 1,
                    maxLength: 12
                }
            }
        }
    },
    config: {
        rateLimit: {
            max: 5,
            timeWindow: "1s"
        }
    },
    async handler(request, response) {
        const tag = await request.server.cache.tagsService.get({
            name: request.params.name
        });

        if (!tag) {
            throw new EntityNotFoundError("tag");
        }

        return response.code(200).send(normalize(tag));
    }
};
