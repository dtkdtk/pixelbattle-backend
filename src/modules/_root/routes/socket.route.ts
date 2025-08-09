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

        socket.on("message", (data, isBinary) => {
            try {
                if (!isBinary) return socket.close(1003);
                if (!(data instanceof Uint8Array)) return socket.close(1003);
                if (data.byteLength > 1024) return socket.close(1003);
                if (data.byteLength < 10) return socket.close(1003);

                const message = Envelope.decode(data);
                const operation = request.server.operations.find(
                    (op) => op.payload === message.payload
                );

                if (!message.payload) return socket.close(1003);
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
                return socket.close(1003);
            }

            /*const json = JSON.parse(data.toString("utf-8"));
            const operation = request.server.operations.find(
                (op) => op.payload === json.payload
            );

            if (!operation) return;

            operation
                .handler(json, socket, request)
                .catch((err) => console.error(err));*/
        });

        // const f = setInterval(() => {
        //     const meta = clientMeta.get(socket);
        //     console.log(meta);
        //     if (!meta || meta.pingSamples.length < 2)
        //         return console.log(`jitter: 0`);

        //     const samples = meta.pingSamples;
        //     const avg = samples.reduce((a, b) => a + b, 0) / samples.length;
        //     const variance =
        //         samples.reduce((acc, v) => acc + Math.pow(v - avg, 2), 0) /
        //         (samples.length - 1);

        //     console.log(`jitter: ${Math.sqrt(variance)}`);
        // }, 10000);
        // //socket.binaryType = "arraybuffer";
        // //socket.id = request.query.z;

        // clientMeta.set(socket, {
        //     lastPing: 0,
        //     rtt: 0,
        //     pingSamples: [],
        //     offset: 0,
        //     offsetSamples: []
        // });

        // socket.on("message", (data, isBinary) => {
        //     //if (!isBinary) throw Error("non binary");

        //     /*const message = SocketMessage.decode(
        //         new Uint8Array(data as ArrayBuffer)
        //     );*/
        //     const message = JSON.parse(data.toString());

        //     /*if (
        //         Object.keys(message).filter(
        //             (k) => message[k as keyof typeof message] !== null
        //         ).length !== 1
        //     ) {;
        //         return socket.close(1003, "Invalid message structure");
        //     }*/

        //     //if (Object.keys(message).length !== 1) throw Error("validation");

        //     switch (message.payload) {
        //         case "init": {
        //             const { id } = message.init || {};
        //             if (!id || id.length !== 8) throw new Error("validation");
        //             break;
        //         }

        //         case "place": {
        //             if (!request.user) throw new NotAuthorizedError();

        //             const {
        //                 x,
        //                 y,
        //                 color
        //             }: {
        //                 x: number;
        //                 y: number;
        //                 color: [number, number, number];
        //             } = message;

        //             const pixel = request.server.canvas.getPixel({
        //                 x,
        //                 y
        //             });

        //             if (!pixel) throw new EntityNotFoundError("pixel");

        //             const tag =
        //                 request.user.role !== UserRole.User
        //                     ? null
        //                     : request.user.tag;

        //             request.server.canvas.setPixel({
        //                 x,
        //                 y,
        //                 color: translate.RGB(color),
        //                 tag,
        //                 author: request.user._id
        //             });

        //             break;
        //         }

        //         case "ping": {
        //             const meta = clientMeta.get(socket);
        //             const clientTime = message.timestamp; //message.ping!.timestamp!;
        //             if (
        //                 !meta ||
        //                 !message.timestamp /*!message.ping?.timestamp*/
        //             )
        //                 throw new Error("invalid ping payload");

        //             const serverReceive = Date.now();
        //             const rtt = serverReceive - clientTime;
        //             const serverSend = Date.now();
        //             const offset =
        //                 (serverReceive + serverSend) / 2 - clientTime;

        //             meta.lastPing = serverReceive;
        //             meta.rtt = rtt;
        //             meta.pingSamples.push(rtt);
        //             meta.offsetSamples.push(offset);

        //             if (meta.pingSamples.length > 10) meta.pingSamples.shift();
        //             if (meta.offsetSamples.length > 10)
        //                 meta.offsetSamples.shift();

        //             const sortedOffsets = [...meta.offsetSamples].sort(
        //                 (a, b) => a - b
        //             );
        //             const midOffset = Math.floor(sortedOffsets.length / 2);
        //             meta.offset =
        //                 sortedOffsets.length % 2 === 0
        //                     ? (sortedOffsets[midOffset - 1] +
        //                           sortedOffsets[midOffset]) /
        //                       2
        //                     : sortedOffsets[midOffset];

        //             socket.send(
        //                 SocketMessage.encode({
        //                     pong: { clientTime, serverReceive, serverSend }
        //                 }).finish()
        //             );

        //             break;
        //         }

        //         case "pong":
        //             if (!message.pong) throw Error("validation");
        //             break;

        //         default:
        //             throw new Error("unexcepted");
        //     }
        // });

        // socket.on("close", () => {
        //     clientMeta.delete(socket);
        //     clearInterval(f);
        // });

        // socket.on("ping", () => socket.pong());
    }
};
