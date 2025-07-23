import { BaseRepository } from "@core/database";
import type { UpdateOptions } from "mongodb";
import type { MongoTag } from "@models";
import type { TagFilter } from "./types";

export class TagRepository extends BaseRepository<MongoTag> {
    async findOne(filter: TagFilter) {
        const keys = Object.keys(filter);

        return this.collection.findOne(filter, {
            hint: this.getIndexHint(keys)
        });
    }

    async updateOne(
        filter: TagFilter,
        update: Partial<MongoTag>,
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
        const order = ["_id", "name"];
        const default_index = { _id: 1 };

        const found = order.find((field) => keys.includes(field));
        return found ? { [found]: 1 } : default_index;
    }
}
