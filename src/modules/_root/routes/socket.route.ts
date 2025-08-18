import type { RouteOptions } from "fastify";
import type * as WebSocket from "ws";
import type { IncomingMessage, Server, ServerResponse } from "http";
import { Envelope } from "@proto";
import { TemporaryId } from "@utils";
import { WebSocketError } from "@core/errors";

declare module "fastify" {
    interface FastifyRequest {
        temporaryid: TemporaryId;
    }
}

export const socket: RouteOptions<
    Server,
    IncomingMessage,
    ServerResponse,
    { Querystring: { z: string } }
> = {
    method: "GET",
    url: "/socket",
    schema: {
        querystring: {
            type: "object",
            properties: {
                z: { type: "string", minLength: 12, maxLength: 12 }
            },
            required: ["z"],
            additionalProperties: false
        }
    },
    config: {
        rateLimit: {
            max: 3,
            timeWindow: "1s"
        }
    },
    handler(request, response) {
        return response.send();
    },
    wsHandler(socket, request) {
        request.temporaryid = new TemporaryId();

        socket.binaryType = "arraybuffer";

        socket.on("message", (data: Uint8Array, isBinary) => {
            try {
                if (!isBinary) return socket.close(1003);
                if (import.meta.env.NODE_ENV === "development")
                    console.log(`Message size: ${data.byteLength}`);
                if (data.byteLength > 1024) return socket.close(1009);
                if (data.byteLength < 10) return socket.close(1007);

                const message = Envelope.decode(data);
                const operation = request.server.operations.find(
                    (op) => op.payload === message.payload
                );

                if (!message.payload) return socket.close(1003);
                if (!message.timestamp) return socket.close(1003);
                if (!operation) return socket.close(1003);

                operation.handler(message, socket, request).catch((err) => {
                    if (!(err instanceof WebSocketError))
                        return console.error(err);
                    if (socket.readyState !== socket.OPEN) return;

                    console.log(err.data);
                    const payload: any = {
                        code: err.statusCode
                    };

                    if (err.data?.until) {
                        payload.cooldown = { until: err.data.until };
                    }

                    if (err.data?.max) {
                        payload.bounds = { max: err.data.max };
                    }

                    const errorMessage = Envelope.encode({
                        id: request.temporaryid.nextId,
                        timestamp: Date.now(),
                        correlationId: message.id,
                        error: payload
                    }).finish();

                    socket.send(errorMessage);
                });
            } catch (err) {
                return socket.close(1007);
            }
        });
    }
};
