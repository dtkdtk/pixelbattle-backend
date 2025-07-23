import type { OperationOptions } from "@core/app";
import { EntityNotFoundError, NotAuthorizedError } from "@core/errors/api";
import { UserRole } from "@models";
import { translate } from "@utils";

export const place: OperationOptions = {
    payload: "place",
    async handler(data, socket, request) {
        if (!request.user) throw new NotAuthorizedError();
        const {
            x,
            y,
            color
        }: {
            x: number;
            y: number;
            color: number;
        } = data;
        const point = request.server.canvas.startPoint({ x, y });
        const pixel = request.server.canvas.getPixel(point);

        if (!pixel) throw new EntityNotFoundError("pixel");

        const tag =
            request.user.role !== UserRole.User ? null : request.user.tag;

        request.server.canvas.setPixel({
            _id: point,
            color: color,
            tag,
            author: request.user._id
        });
    }
};
