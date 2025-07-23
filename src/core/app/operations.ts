import fp from "fastify-plugin";
import type { FastifyInstance } from "fastify";
import type { OperationOptions } from "./types";
import { place } from "@modules/canvas";

declare module "fastify" {
    interface FastifyInstance {
        operations: OperationOptions[];
    }
}

export const operations = fp(
    async function routes(app: FastifyInstance) {
        app.decorate("operations", [place]);
    },
    {
        name: "operations",
        dependencies: ["websocket"]
    }
);
