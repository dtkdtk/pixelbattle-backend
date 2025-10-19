import fp from "fastify-plugin";
import type { FastifyInstance } from "fastify";
import type { OperationOptions, OperationsMap } from "./types";
import { pixel } from "@modules/canvas";
import { ping } from "@modules/_root";

declare module "fastify" {
    interface FastifyInstance {
        operations: OperationsMap;
    }
}

export const operations = fp(
    async function routes(app: FastifyInstance) {
        const operations = new Map() as OperationsMap;

        [pixel, ping].map(({ payload, ...operation }: OperationOptions) =>
            operations.set(payload, operation)
        );

        app.decorate("operations", operations);
    },
    {
        name: "operations",
        dependencies: ["websocket"]
    }
);
