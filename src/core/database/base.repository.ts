import type { Document, Long, UpdateOptions } from "mongodb";
import type {
    FilterQuery,
    RootFilterQuery,
    Model,
    UpdateWithAggregationPipeline,
    UpdateQuery,
    ProjectionType,
    MongooseUpdateQueryOptions
} from "mongoose";
import { CacheManager } from "./base.cache";

export class BaseRepository<T extends Document> {
    protected cache = new CacheManager<T>();

    constructor(
        protected readonly model: Model<T>,
        private readonly cacheKeys: (keyof T)[] = ["_id"],
        protected readonly cacheTTL = 60000
    ) {}

    protected async cacheMiss(query: any): Promise<T | null> {
        const document = (await query.lean()) as T | null;
        if (!document) return null;

        this.cacheKeys.forEach((key) => {
            this.cache.set(
                `${key as string}:${document[key]}`,
                document,
                this.cacheTTL
            );
        });

        return document;
    }

    async findById(id: Long | BigInt) {
        const key = `_id:${id}`;

        const cached = this.cache.get(key);
        if (cached) return cached;

        return this.cacheMiss(this.model.findById(id));
    }

    updateOne(
        filter: RootFilterQuery<T>,
        update: UpdateWithAggregationPipeline | UpdateQuery<T>,
        options?: UpdateOptions & MongooseUpdateQueryOptions<T>
    ) {
        const updated = this.model.updateOne(filter, update, options);

        return this.cacheMiss(updated);
    }

    findOne(filter: RootFilterQuery<T>, projection?: ProjectionType<T> | null) {
        return this.model.findOne(filter, projection).lean();
    }

    findAll(
        filter: RootFilterQuery<T> = {},
        projection?: ProjectionType<T> | null
    ) {
        return this.model.find(filter, projection);
    }

    async countDocuments(filter: FilterQuery<T> = {}) {
        return this.model.countDocuments(filter).lean();
    }
}
