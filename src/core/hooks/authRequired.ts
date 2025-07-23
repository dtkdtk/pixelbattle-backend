import fp from "fastify-plugin";
import { NotAuthorizedError } from "@core/errors/api";

export const authRequired = fp(async function authRequired(app) {
    app.addHook("preHandler", async (request) => {
        if (!request.user) throw new NotAuthorizedError();
    });
});
