import type { FastifyInstance } from "fastify";
import { byRoutes } from "./by-";
import { getMe } from "./me";
import { authRequired, bindUser } from "@core/hooks";

export function userRoutes(app: FastifyInstance, _: unknown, done: () => void) {
    app.register(byRoutes, { prefix: "/by-" });

    app.register(async (app) => {
        await app.register(bindUser);
        await app.register(authRequired);

        app.route(getMe);
    });

    done();
}
