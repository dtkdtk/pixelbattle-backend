import { BaseRepository } from "@core/database";
import type { Model } from "mongoose";
import type { MongoTag } from "@models";

export class TagRepository extends BaseRepository<MongoTag> {
    constructor(model: Model<MongoTag>) {
        super(model, ["_id", "name"]);
    }

    async findByName(name: string) {
        const key = `name:${name}`;

        const cached = this.cache.get(key);
        if (cached) return cached;

        return this.cacheMiss(this.model.findOne({ name }));
    }
}
