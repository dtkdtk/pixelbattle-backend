import fp from "fastify-plugin";
import fastifyWebsocket from "@fastify/websocket";

export const websocket = fp(
    async (app) => {
        await app.register(fastifyWebsocket, {
            options: {
                clientTracking: true,
                maxPayload: 1024
            }
        });
    },
    { name: "websocket", dependencies: [] }
);
