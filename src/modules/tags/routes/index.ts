import type { FastifyInstance } from "fastify";
import { byRoutes } from "./by-";

export function tagRoutes(app: FastifyInstance, _: unknown, done: () => void) {
    app.register(byRoutes, { prefix: "/by-" });

    done();
}
