import fp from "fastify-plugin";
import { Long } from "mongodb";
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
        const cookies: RequestCookie = request.cookies;

        if (!cookies.token || !cookies.id) return;

        const userCache = await request.server.cache.usersService.get({
            token: cookies.token,
            _id: Long.fromString(cookies.id)
        });

        if (!userCache) return;

        request.user = userCache;
    });
});
