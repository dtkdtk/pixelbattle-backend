import { Long } from "mongodb";
import type { RouteOptions } from "fastify";
import type { IncomingMessage, Server, ServerResponse } from "http";
import type { AuthInfo } from "@models";
import type { PossibleConnectionData } from "../types";
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
        const _id = BigInt(request.params.id);
        const user = await request.server.repository.users.findById(_id);

        if (!user) {
            throw new EntityNotFoundError("user");
        }

        return response.code(200).send({
            ...normalize(user, ["_id", "tag"]),
            token: undefined,
            email: undefined,
            connections: Object.fromEntries(
                Object.entries<PossibleConnectionData>(
                    user.connections as unknown as Record<
                        keyof AuthInfo,
                        PossibleConnectionData
                    >
                ).filter(
                    ([_, value]) =>
                        value &&
                        (request.user?._id === user._id || value.visible)
                )
            )
        });
    }
};
