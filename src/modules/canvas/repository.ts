import { BaseRepository } from "@core/database";
import type { Model } from "mongoose";
import type { MongoPixel } from "@models";

export class CanvasRepository extends BaseRepository<MongoPixel> {
    constructor(model: Model<MongoPixel>) {
        super(model, ["_id"]);
    }

    async fetch() {
        return this.findAll().sort({ _id: 1 }).lean();
    }

    async bulkUpdate(updates: MongoPixel[], options?: { upsert?: boolean }) {
        await this.model.bulkWrite(
            updates.map((update) => {
                const { _id, ...$set } = update;

                return {
                    updateOne: {
                        filter: { _id },
                        update: { $set },
                        upsert: options?.upsert ?? false,
                    }
                };
            }),
            { retryWrites: true }
        );
    }

    async clear(width: number, height: number, color: number) {
        await this.model.deleteMany({});

        const pixels = Array.from({ length: width * height }, (_, _id) => ({
            _id,
            author: null,
            tag: null,
            color
        }));

        await this.model.insertMany(pixels);

        return pixels;
    }
}
