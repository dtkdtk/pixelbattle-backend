import fp from "fastify-plugin";
import { constantTimeCompare } from "@utils";
import type { MongoUser } from "@models";
import type { RequestCookie } from "./types";

declare module "fastify" {
    interface FastifyRequest {
        user: MongoUser | null;
    }
}

export const bindUser = fp(async function bindUser(app) {
    app.decorateRequest("user", null);

    app.addHook("preHandler", async (request) => {
        const { next_token, next_id }: RequestCookie = request.cookies;

        if (!next_token || !next_id) return;

        try {
            const id = BigInt(next_id);
            const user = await request.server.repository.users.findById(id);

            if (!user || !user.token) return;

            if (!constantTimeCompare(user.token, next_token)) {
                return;
            }

            request.user = user;
        } catch (e) {
            return;
        }
    });
});
