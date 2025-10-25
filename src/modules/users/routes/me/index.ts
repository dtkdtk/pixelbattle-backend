import type { FastifyInstance } from "fastify";
import { bindUser, authRequired } from "@core/hooks";
import { getMe } from "./me";
import { change } from "./change";

export function meRoutes(app: FastifyInstance, _: unknown, done: () => void) {
    app.register(async (app) => {
        await app.register(bindUser);
        await app.register(authRequired);

        app.route(getMe);
        app.route(change);
    });

    done();
}
