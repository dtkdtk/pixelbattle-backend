import type { OperationOptions, OperationRequestType } from "@core/app";
import { EntityNotFoundError } from "@core/errors/api";
import { UserNotFoundError, UserCooldownError } from "@core/errors/websocket";
import { UserRole } from "@models";
import { Envelope } from "@proto";
import { PixelOutOfBoundsError } from "@core/errors/websocket";
import { TimeWindowCounter } from "@utils";

const REQUESTS_PER_TIME_WINDOW = 2;
let cooldownWindow: TimeWindowCounter<bigint> | undefined;

export const pixel: OperationOptions = {
    payload: "pixel",
    async handler(data, socket, request) {
        if (!request.user) throw new UserNotFoundError();

        setupCooldown(request);
        checkCooldown(request);

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

        cooldownWindow?.add(request.user._id);
        

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

function setupCooldown(request: OperationRequestType) {
    const timeWindowInterval =
        request.server.game.cooldown * REQUESTS_PER_TIME_WINDOW;
    if (cooldownWindow && cooldownWindow.intervalMs !== timeWindowInterval) {
        //Cooldown was updated by admin
        cooldownWindow.dispose();
        cooldownWindow = undefined;
    }
    if (!cooldownWindow)
        cooldownWindow = new TimeWindowCounter(timeWindowInterval)
    if (timeWindowInterval <= REQUESTS_PER_TIME_WINDOW) //Cooldown is disabled
        cooldownWindow.dispose();
}
function checkCooldown(request: OperationRequestType) {
    if (cooldownWindow && cooldownWindow?.get(request.user!._id) >= REQUESTS_PER_TIME_WINDOW)
        throw new UserCooldownError(
            cooldownWindow.lastCleanupTimestamp + cooldownWindow.intervalMs
        );
}