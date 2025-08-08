import { BaseRepository } from "@core/database";
import type { UpdateOptions } from "mongodb";
import type { MongoBan } from "@models";
import type { BanFilter } from "./types";

export class BanRepository extends BaseRepository<MongoBan> {
    async findOne(filter: BanFilter) {
        const keys = Object.keys(filter);

        return this.collection.findOne(filter, {
            hint: this.getIndexHint(keys)
        });
    }

    async updateOne(
        filter: BanFilter,
        update: Partial<MongoBan>,
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
        const order = ["_id", "moderator", "player"];
        const default_index = { _id: 1 };

        const found = order.find((field) => keys.includes(field));
        return found ? { [found]: 1 } : default_index;
    }
}
