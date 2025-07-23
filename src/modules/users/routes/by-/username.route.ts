import type { RouteOptions } from "fastify";
import type { IncomingMessage, Server, ServerResponse } from "http";
import type { AuthInfo } from "@models";
import type { PossibleConnectionData } from "../types";
import { EntityNotFoundError } from "@core/errors/api";
import { normalize } from "@utils";

export const getByUsername: RouteOptions<
    Server,
    IncomingMessage,
    ServerResponse,
    { Params: { username: string } }
> = {
    method: "GET",
    url: "username/:username",
    schema: {
        params: {
            type: "object",
            required: ["username"],
            properties: {
                id: {
                    type: "string",
                    minLength: 3,
                    maxLength: 20,
                    pattern: "^[a-zA-Z0-9_-]+$"
                }
            }
        }
    },
    config: {
        rateLimit: {
            max: 3,
            timeWindow: "5s"
        }
    },
    async handler(request, response) {
        const user = await request.server.cache.usersService.get({
            username: request.params.username
        });

        if (!user) {
            throw new EntityNotFoundError("user");
        }

        return response.code(200).send(
            normalize(
                {
                    ...user,
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
                                (request.user?.userID === user.userID ||
                                    value.visible)
                        )
                    )
                },
                ["_id", "tag"]
            )
        );
    }
};
