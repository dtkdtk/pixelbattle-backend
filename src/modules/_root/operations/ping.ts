import { Envelope } from "@proto";
import type { OperationOptions } from "@core/app";

export const ping: OperationOptions = {
    payload: "ping",
    async handler(data, socket, request) {
        const ping = data.ping;
        if (!ping) return;

        const recieverReceiveTime = Date.now();

        const message = Envelope.encode({
            id: request.temporaryid.nextId,
            timestamp: Date.now(),
            correlationId: data.id,
            pong: {
                senderSendTime: ping.senderSendTime,
                recieverReceiveTime,
                recieverSendTime: Date.now()
            }
        }).finish();

        socket.send(message);
    }
};
