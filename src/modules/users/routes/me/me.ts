import type { RouteOptions } from "fastify";
import type { AuthInfo } from "@models";
import type { PossibleConnectionData } from "../types";
import { normalize } from "@utils";

export const getMe: RouteOptions = {
    method: "GET",
    url: "/",
    schema: {},
    config: {
        rateLimit: {
            max: 5,
            timeWindow: "1s"
        }
    },
    async handler(request, response) {
        const user = request.user!;

        return response.code(200).send(
            normalize(
                {
                    ...user,
                    token: undefined,
                    connections: Object.fromEntries(
                        Object.entries<PossibleConnectionData>(
                            user.connections as unknown as Record<
                                keyof AuthInfo,
                                PossibleConnectionData
                            >
                        ).filter(([_, value]) => value)
                    )
                },
                ["_id", "tag"]
            )
        );
    }
};
