import fp from "fastify-plugin";
import type { FastifyInstance } from "fastify";
import type { OperationOptions } from "./types";
import { pixel } from "@modules/canvas";
import { ping } from "@modules/_root";

declare module "fastify" {
    interface FastifyInstance {
        operations: OperationOptions[];
    }
}

export const operations = fp(
    async function routes(app: FastifyInstance) {
        app.decorate("operations", [pixel, ping]);
    },
    {
        name: "operations",
        dependencies: ["websocket"]
    }
);
