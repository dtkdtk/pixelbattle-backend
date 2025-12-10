import type { FastifyRequest } from "fastify";
import type { IncomingMessage, Server, ServerResponse } from "http";
import type * as WebSocket from "ws";
import type { Envelope } from "@proto";

export type OperationRequestType = FastifyRequest<
       {
           Querystring: {
               z: string;
           };
       },
       Server<typeof IncomingMessage, typeof ServerResponse>,
       IncomingMessage
   >;

export type OperationOptions = {
    payload: string;
    handler: (
        data: Envelope,
        socket: WebSocket.WebSocket,
        request: OperationRequestType,
    ) => Promise<any>;
};

export type OperationsMap = Map<string, Omit<OperationOptions, "payload">>;