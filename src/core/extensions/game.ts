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

        const game = (await app.models.Game.findOneAndUpdate(
            { _id },
            { $setOnInsert: { ...config.game } },
            { upsert: true }
        ).lean()) as MongoGame;

        app.decorate("game", game);
    },
    { name: "game", dependencies: ["database"] }
);
