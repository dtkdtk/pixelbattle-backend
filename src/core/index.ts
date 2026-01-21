import fastify from "fastify";
import { konsole } from "@utils";
import { operations, plugins, routes } from "@core/app";
import {
    database,
    repository,
    game,
    canvas,
    errorHandler,
    oauth2,
    websocket
} from "@core/extensions";

import "./hello";

const app = fastify({
    logger: process.env.NODE_ENV === "development",
    pluginTimeout: 120000
});

(async () => {
    for (const decorator of [
        plugins,
        database,
        repository,
        game,
        canvas,
        errorHandler,
        oauth2,
        websocket,
        operations,
        routes
    ]) {
        konsole.write(`Loading "${decorator.name}" plugin...`);
        await app.register(decorator);
        konsole.clearLine();
        konsole.returnCursor();
    }

    console.log("All plugins successfully loaded!");

    app.listen({
        host: "0.0.0.0",
        port: process.env.LISTEN_PORT ? parseInt(process.env.LISTEN_PORT) : 8080
    }).then(console.log);
})();
