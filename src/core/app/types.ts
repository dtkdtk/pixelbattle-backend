import type { FastifyRequest } from "fastify";
import type { IncomingMessage, Server, ServerResponse } from "http";
import type * as WebSocket from "ws";

export type OperationOptions = {
    payload: string;
    handler: (
        data: any,
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
