import type { RouteOptions } from "fastify";
import { version } from "../../../../package.json";

export const root: RouteOptions = {
    method: "GET",
    url: "/",
    handler: (_request, response) => {
        return response.code(200).send({
            error: false,
            reason: `PixelBattle Backend v${version} works! Good time for chill :D`
        });
    }
};
