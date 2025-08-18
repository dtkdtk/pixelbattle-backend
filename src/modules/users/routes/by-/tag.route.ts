import type { RouteOptions } from "fastify";
import type { IncomingMessage, Server, ServerResponse } from "http";
import type { Long } from "mongodb";

export const getByTag: RouteOptions<
    Server,
    IncomingMessage,
    ServerResponse,
    { Params: { tag: string }; Querystring: { limit: number; page: number } }
> = {
    method: "GET",
    url: "tag/:tag",
    schema: {
        querystring: {
            type: "object",
            properties: {
                limit: {
                    type: "integer",
                    minimum: 5,
                    maximum: 50,
                    default: 10
                },
                page: {
                    type: "integer",
                    minimum: 1,
                    default: 1
                }
            },
            required: [],
            additionalProperties: false
        },
        params: {
            type: "object",
            required: ["tag"],
            properties: {
                tag: {
                    type: "string",
                    minLength: 2,
                    maxLength: 12,
                    pattern: "^[a-zA-Z0-9_-]+$"
                }
            }
        }
    },
    config: {
        rateLimit: {
            max: 5,
            timeWindow: "3s"
        }
    },
    async handler(request, response) {
        const { tag } = request.params;
        const { limit, page } = request.query;

        const data = await request.server.repository.tags.findByName(tag);

        let available = 0;
        let list: { _id: Long }[] = [];

        if (data) {
            available = await request.server.repository.users.countDocuments({
                tag: data._id
            });

            list = await request.server.repository.users
                .findAll(
                    {
                        tag: data._id
                    },
                    { _id: 1 }
                )
                .skip((page - 1) * limit)
                .limit(limit)
                .lean();
        }

        return response.code(200).send({
            users: list.map((u) => u._id.toString()),
            pagination: {
                current: page,
                available: Math.ceil(available / limit)
            }
        });
    }
};
