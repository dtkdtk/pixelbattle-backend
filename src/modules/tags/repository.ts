import { BaseRepository } from "@core/database";
import type { Model } from "mongoose";
import type { MongoTag } from "@models";

export class TagRepository extends BaseRepository<MongoTag> {
    constructor(model: Model<MongoTag>) {
        super(model, ["_id", "name"]);
    }

    async findByName(name: string) {
        return this.findByField("name", name);
    }
}
