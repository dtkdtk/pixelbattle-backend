import { BaseRepository } from "@core/database";
import type { Model } from "mongoose";
import type { MongoUser } from "@models";

export class UserRepository extends BaseRepository<MongoUser> {
    constructor(model: Model<MongoUser>) {
        super(model, ["_id", "username"]);
    }

    async findByUsername(username: string) {
        return this.findByField("username", username);
    }
}
