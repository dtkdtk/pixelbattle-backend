import type { RouteOptions } from "fastify";
import type { Long } from "mongodb";
import { normalize } from "@utils";

interface GameInformation {
    _id: Long;
    name: string;
    cooldown: number;
    ended: boolean;
    canvas: {
        width: number;
        height: number;
    };
    online: number;
}

export const get: RouteOptions = {
    method: "GET",
    url: "/",
    config: {
        rateLimit: {
            max: 3,
            timeWindow: 1000
        }
    },
    handler: (request, response) => {
        const {
            game: { _id, name, cooldown, ended, ...canvas },
            websocketServer
        } = request.server;

        const info: GameInformation = {
            _id,
            name,
            cooldown,
            ended,
            canvas,
            online: websocketServer.clients.size
        };

        return response.code(200).send(normalize(info));
    }
};
