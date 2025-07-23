import { Long } from "mongodb";
import type { RouteOptions } from "fastify";
import type { IncomingMessage, Server, ServerResponse } from "http";
import { EntityNotFoundError } from "@core/errors/api";
import { normalize } from "@utils";

export const getById: RouteOptions<
    Server,
    IncomingMessage,
    ServerResponse,
    { Params: { id: string } }
> = {
    method: "GET",
    url: "id/:id",
    schema: {
        params: {
            type: "object",
            required: ["id"],
            properties: {
                id: {
                    type: "string",
                    minLength: 16,
                    maxLength: 20,
                    pattern: "^[1-9][0-9]*$"
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
        const _id = Long.fromString(request.params.id);
        const tag = await request.server.cache.tagsService.get({ _id });

        if (!tag) {
            throw new EntityNotFoundError("tag");
        }

        return response.code(200).send(normalize(tag));
    }
};
