import fp from "fastify-plugin";
import { CanvasRepository } from "@modules/canvas";
import { UserRepository } from "@modules/users";
import { TagRepository } from "@modules/tags";
import { BanRepository } from "@modules/bans/repository";

declare module "fastify" {
    interface FastifyInstance {
        repository: {
            canvas: CanvasRepository;
            users: UserRepository;
            tags: TagRepository;
            bans: BanRepository;
        };
    }
}

export const repository = fp(
    async (app) => {
        app.decorate("repository", {
            canvas: new CanvasRepository(app.database.pixels),
            users: new UserRepository(app.database.users),
            tags: new TagRepository(app.database.tags),
            bans: new BanRepository(app.database.bans)
        });
    },
    { name: "repository", dependencies: ["database"] }
);
