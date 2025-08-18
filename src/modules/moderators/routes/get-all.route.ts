import type { RouteOptions } from "fastify";
import { type MongoUser, UserRole } from "@models";
import { normalize } from "@utils";

export const getAll: RouteOptions = {
    method: "GET",
    url: "/",
    config: {
        rateLimit: {
            max: 2,
            timeWindow: 3000
        }
    },
    async handler(request, response) {
        const moderators: Pick<MongoUser, "_id" | "username" | "role">[] =
            await request.server.repository.users
                .findAll(
                    {
                        role: {
                            $gte: UserRole.Academy
                        }
                    },
                    {
                        _id: 1,
                        username: 1,
                        role: 1
                    }
                )
                .lean();

        return response
            .code(200)
            .send({ moderators: moderators.map((m) => normalize(m)) });
    }
};
