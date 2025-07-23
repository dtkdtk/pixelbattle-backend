import { BaseRepository } from "@core/database";
import type { UpdateOptions } from "mongodb";
import type { MongoUser } from "@models";
import type { UserFilter } from "./types";

export class UserRepository extends BaseRepository<MongoUser> {
    async findOne(filter: UserFilter) {
        const keys = Object.keys(filter);

        return this.collection.findOne(filter, {
            hint: this.getIndexHint(keys)
        });
    }

    async updateOne(
        filter: UserFilter,
        update: Partial<MongoUser>,
        options?: Omit<UpdateOptions, "hint">
    ) {
        const keys = Object.keys(filter);

        return this.collection.updateOne(
            filter,
            { $set: update },
            { ...options, hint: this.getIndexHint(keys) }
        );
    }

    private getIndexHint(keys: string[]) {
        const order = ["_id", "token"];
        const default_index = { _id: 1 };

        const found = order.find((field) => keys.includes(field));
        return found ? { [found]: 1 } : default_index;
    }
}
