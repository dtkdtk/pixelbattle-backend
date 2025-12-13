import { GameService } from "@modules/game/service";
import type { FastifyInstance } from "fastify";
import fp from "fastify-plugin";

declare module "fastify" {
    interface FastifyInstance {
        game: GameService;
    }
}

export const game = fp(
    async function game(app: FastifyInstance) {
        const gameService = new GameService(app.models.Game);
        await gameService.init();

        app.decorate("game", gameService);
    },
    { name: "game", dependencies: ["database"] }
);
