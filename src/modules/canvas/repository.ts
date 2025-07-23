import { BaseRepository } from "@core/database";
import type { MongoPixel } from "@models";

export class CanvasRepository extends BaseRepository<MongoPixel> {
    async fetch() {
        return this.collection.find({}).sort({ _id: 1 }).toArray();
    }

    async bulkUpdate(updates: MongoPixel[]) {
        if (!updates.length) return;

        await this.collection.bulkWrite(
            updates.map((update) => {
                const { _id, ...$set } = update;

                return {
                    updateOne: {
                        filter: { _id },
                        update: { $set }
                    }
                };
            }),
            { retryWrites: true, writeConcern: { w: "majority" } }
        );
    }

    async clear(width: number, height: number, color: number) {
        await this.collection.drop();

        const pixels = Array.from({ length: width * height }, (_, _id) => ({
            _id,
            author: null,
            tag: null,
            color
        }));

        await this.collection.insertMany(pixels);
        return pixels;
    }
}
