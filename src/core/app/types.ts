import type { FastifyRequest } from "fastify";
import type { IncomingMessage, Server, ServerResponse } from "http";
import type * as WebSocket from "ws";
import type { Envelope } from "@proto";

export type OperationOptions = {
    payload: string;
    handler: (
        data: Envelope,
        socket: WebSocket.WebSocket,
        request: FastifyRequest<
            {
                Querystring: {
                    z: string;
                };
            },
            Server<typeof IncomingMessage, typeof ServerResponse>,
            IncomingMessage
        >
    ) => Promise<any>;
};

export type OperationsMap = Map<string, Omit<OperationOptions, "payload">>;
