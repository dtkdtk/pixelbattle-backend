import type { RouteOptions, FastifyRequest } from "fastify";
import type { Server, IncomingMessage, ServerResponse } from "http";
import type { AuthInfo, MongoUser } from "@models";
import type { PossibleConnectionData } from "../types";
import { normalize } from "@utils";

const editableFields = ["username", "tag"] as const;
type EditableField = (typeof editableFields)[number];

type EditableFieldsBody = Partial<Pick<MongoUser, EditableField>>;

async function resolveTag(
    request: FastifyRequest,
    tag: string
): Promise<bigint> {
    if (/^[1-9][0-9]*$/.test(tag) && tag.length >= 16 && tag.length <= 20) {
        const id = BigInt(tag);
        const existing = await request.server.repository.tags.findById(id);
        if (!existing) throw new Error("Tag not found");

        return existing._id;
    }

    let existing = await request.server.repository.tags.findByName(tag);

    if (!existing) {
        existing = await request.server.repository.tags.insertOne({
            name: tag,
            creator: request.user!._id
        });
    }

    return existing._id;
}

export const change: RouteOptions<
    Server,
    IncomingMessage,
    ServerResponse,
    { Body: EditableFieldsBody }
> = {
    method: "PATCH",
    url: "/change",
    schema: {
        body: {
            type: "object",
            properties: {
                username: { type: "string", minLength: 3, maxLength: 20 },
                tag: {
                    oneOf: [
                        {
                            type: "string",
                            minLength: 16,
                            maxLength: 20,
                            pattern: "^[1-9][0-9]*$"
                        },
                        {
                            type: "string",
                            minLength: 2,
                            maxLength: 12,
                            pattern: "^[a-zA-Z0-9._-]+$"
                        }
                    ]
                }
            },
            additionalProperties: false,
            minProperties: 1
        }
    },
    async handler(request, reply) {
        const userId = request.user!._id;
        const updates = request.body;

        if (!Object.keys(updates).length) {
            return reply.code(400).send({ error: "Empty update body" });
        }

        const validUpdates: Record<string, unknown> = {};

        for (const key of editableFields) {
            if (key in updates) {
                validUpdates[key] = updates[key];
            }
        }

        if (!Object.keys(validUpdates).length) {
            return reply.code(400).send({ error: "No valid fields" });
        }

        if (validUpdates.tag && typeof validUpdates.tag === "string") {
            try {
                validUpdates.tag = await resolveTag(request, validUpdates.tag);
            } catch (err) {
                return reply.code(400).send({ error: (err as Error).message });
            }
        }

        const updated = await request.server.repository.users.updateOne(
            { _id: userId },
            { $set: validUpdates }
        );

        return reply.code(200).send(
            normalize(
                {
                    ...updated,
                    token: undefined,
                    connections: Object.fromEntries(
                        Object.entries<PossibleConnectionData>(
                            updated!.connections as unknown as Record<
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
