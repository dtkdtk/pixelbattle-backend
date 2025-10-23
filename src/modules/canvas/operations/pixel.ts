import type { Long } from "mongodb";
import type { OperationOptions } from "@core/app";
import { EntityNotFoundError } from "@core/errors/api";
import { UserNotFoundError, UserCooldownError } from "@core/errors/websocket";
import { UserRole } from "@models";
import { Envelope } from "@proto";
import { Cooldown } from "@utils";
import { PixelOutOfBoundsError } from "@core/errors/websocket/pixel";

const cooldown = new Cooldown<Long>(60000);

export const pixel: OperationOptions = {
    payload: "pixel",
    async handler(data, socket, request) {
        if (!request.user) throw new UserNotFoundError();
        if (cooldown.has(request.user._id))
            throw new UserCooldownError(cooldown.get(request.user._id)!);

        const { id, color } = data.pixel!;

        if (typeof id !== "number" || typeof color !== "number")
            return console.error("Invalid pixel data");
        if (
            id < 0 ||
            id >= request.server.canvas.width * request.server.canvas.height
        )
            throw new PixelOutOfBoundsError(
                request.server.canvas.width * request.server.canvas.height - 1
            );

        const pixel = request.server.canvas.getPixel(id);

        cooldown.set(request.user._id, request.server.game.cooldown);

        if (!pixel) throw new EntityNotFoundError("pixel");

        const tag =
            request.user.role !== UserRole.User ? null : request.user.tag;

        request.server.canvas.setPixel({
            _id: id,
            color,
            tag,
            author: request.user._id
        });

        for (const client of request.server.websocketServer.clients) {
            if (client.readyState !== client.OPEN) continue;

            const message = Envelope.encode({
                timestamp: Date.now(),
                pixel: {
                    id,
                    color
                }
            }).finish();

            client.send(message);
        }
    }
};
