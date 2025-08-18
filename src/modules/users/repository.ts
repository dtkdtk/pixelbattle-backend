import { BaseRepository } from "@core/database";
import type { Model } from "mongoose";
import type { MongoUser } from "@models";

export class UserRepository extends BaseRepository<MongoUser> {
    constructor(model: Model<MongoUser>) {
        super(model, ["_id", "username"]);
    }

    async findByUsername(username: string) {
        const key = `username:${username}`;

        const cached = this.cache.get(key);
        if (cached) return cached;

        return this.cacheMiss(this.model.findOne({ username }));
    }
}
