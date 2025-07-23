import fp from "fastify-plugin";
import { UserService } from "@modules/users";
import { TagService } from "@modules/tags";

declare module "fastify" {
    interface FastifyInstance {
        cache: {
            usersService: UserService;
            tagsService: TagService;
        };
    }
}

export const cache = fp(
    async function cache(app) {
        const usersService = new UserService(app.repository.users);
        const tagsService = new TagService(app.repository.tags);

        usersService.startAutoCleanup();
        tagsService.startAutoCleanup();

        app.decorate("cache", {
            usersService,
            tagsService
        });
    },
    {
        name: "cache",
        dependencies: ["database", "repository"]
    }
);
