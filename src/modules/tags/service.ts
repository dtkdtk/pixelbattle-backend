import type { MongoTag } from "@models";
import type { TagRepository } from "./repository";
import type { TagFilter } from "./types";
import { TagCache } from "./cache";

export class TagService {
    private cached: TagCache[] = [];
    private cleanupInterval?: Timer;

    constructor(
        private repository: TagRepository,
        private TTL = 5 * 60 * 1000
    ) {}

    async get(filter: TagFilter) {
        const cached = this.peak(filter);
        if (cached) {
            cached.refresh();
            return cached.data;
        }

        const user = await this.repository.findOne(filter);
        if (!user) return null;

        const cache = new TagCache(user, this.TTL);
        this.cached.push(cache);

        return user;
    }

    startAutoCleanup(interval = 5000) {
        this.cleanupInterval = setInterval(
            () => this.cleanupExpired(),
            interval
        );
    }

    private peak(filter: TagFilter) {
        return this.cached.find((cache) =>
            Object.entries(filter).every(
                ([k, v]) => cache.data[k as keyof MongoTag] === v
            )
        );
    }

    private cleanupExpired() {
        this.cached = this.cached.filter((u) => Date.now() > u.expiresOn);
    }

    stopAutoCleanup() {
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval);
            this.cleanupInterval = undefined;
        }
    }
}
