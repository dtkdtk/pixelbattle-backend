import type { FastifyInstance } from "fastify";
import { byRoutes } from "./by-";
import { meRoutes } from "./me";

export function userRoutes(app: FastifyInstance, _: unknown, done: () => void) {
    app.register(byRoutes, { prefix: "/by-" });
    app.register(meRoutes, { prefix: "/me" });

    done();
}
