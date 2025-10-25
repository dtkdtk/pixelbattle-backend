import fp from "fastify-plugin";
import { CanvasRepository } from "@modules/canvas";
import { UserRepository } from "@modules/users";
import { TagRepository } from "@modules/tags";
import { BanRepository } from "@modules/bans";

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
            canvas: new CanvasRepository(app.models.Pixel),
            users: new UserRepository(app.models.User),
            tags: new TagRepository(app.models.Tag),
            bans: new BanRepository(app.models.Ban)
        });
    },
    { name: "repository", dependencies: ["database"] }
);
