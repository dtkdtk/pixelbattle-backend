import fp from "fastify-plugin";
import { CanvasService } from "@modules/canvas";
import { config } from "@core/config";

declare module "fastify" {
    interface FastifyInstance {
        canvas: CanvasService;
    }
}

export const canvas = fp(
    async function canvas(app) {
        const canvasService = new CanvasService(
            app.repository.canvas,
            app.game.width,
            app.game.height
        );

        function updateDatabase() {
            canvasService.sync();
        }

        await canvasService.init();
        if (!app.game.ended)
            canvasService.syncInterval = setInterval(
                updateDatabase,
                config.syncTime
            );

        app.decorate("canvas", canvasService);
    },
    {
        name: "canvas",
        dependencies: ["database", "repository", "game"]
    }
);
