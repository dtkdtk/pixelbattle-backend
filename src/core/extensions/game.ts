import fp from "fastify-plugin";
import type { FastifyInstance } from "fastify";
import { Long } from "mongodb";
import type { MongoGame } from "@models";
import { config } from "@core/config";

declare module "fastify" {
    interface FastifyInstance {
        game: MongoGame;
    }
}

export const game = fp(
    async function game(app: FastifyInstance) {
        const _id = Long.fromString("433866403552854016");

        let game = await app.models.Game.findById(_id);

        if (!game) {
            game = new app.models.Game({ _id, ...config.game });
            await game.save();
        }

        app.decorate("game", game);
    },
    { name: "game", dependencies: ["database"] }
);
