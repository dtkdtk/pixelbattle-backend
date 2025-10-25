import type { Document, Long, UpdateOptions } from "mongodb";
import type {
    FilterQuery,
    RootFilterQuery,
    Model,
    UpdateQuery,
    ProjectionType,
    QueryOptions
} from "mongoose";
import { CacheManager } from "./base.cache";

export class BaseRepository<T extends Document, K extends keyof T = "_id"> {
    protected cache = new CacheManager<T>();
    private readonly primaryKey: K;
    private readonly secondaryKeys: Exclude<keyof T, K>[];

    constructor(
        protected readonly model: Model<T>,
        cacheKeys: (keyof T)[] = ["_id"],
        protected readonly cacheTTL = 60000
    ) {
        this.primaryKey = cacheKeys[0] as K;
        this.secondaryKeys = cacheKeys.slice(1) as Exclude<keyof T, K>[];
    }

    // === Base cache methods ===

    protected async cacheMiss(query: any): Promise<T | null> {
        let document: T | null;

        if (typeof query.lean === "function") {
            document = (await query.lean({ getters: true })) as T | null;
        } else {
            document = query ? (query.toObject() as T) : null;
        }

        if (!document) return null;

        const masterKey = `${String(this.primaryKey)}:${document[this.primaryKey]}`;

        this.cache.set(masterKey, document, this.cacheTTL);

        for (const key of this.secondaryKeys) {
            const val = document[key];
            if (val != null)
                this.cache.set(
                    `${String(key)}:${val}`,
                    masterKey,
                    this.cacheTTL
                );
        }

        return document;
    }

    private resolveCached(value: T | string | null): T | null {
        if (
            typeof value === "string" &&
            value.startsWith(`${String(this.primaryKey)}:`)
        ) {
            const master = this.cache.get(value);
            return typeof master === "object" ? (master as T) : null;
        }
        return value as T | null;
    }

    // === Create methods ===

    async insertOne(data: Partial<T>) {
        const doc = await this.model.create(data);

        return this.cacheMiss(doc) as Promise<T>;
    }

    // === Sample cache methods ===

    async findByField<F extends keyof T>(field: F, value: T[F]) {
        const key = `${String(field)}:${String(value)}`;
        const cached = this.cache.get(key);
        if (cached) return this.resolveCached(cached);

        return this.cacheMiss(
            this.model.findOne({ [field]: value } as RootFilterQuery<T>)
        );
    }

    async findById(id: T[K]) {
        return this.findByField(this.primaryKey, id);
    }

    async findOne(
        filter: RootFilterQuery<T>,
        projection?: ProjectionType<T> | null
    ): Promise<T | null> {
        const field = Object.keys(filter)[0] as keyof T;
        const value = (filter as any)[field];
        const key = `${String(field)}:${String(value)}`;
        const cached = this.cache.get(key);
        if (cached) return this.resolveCached(cached);

        return this.cacheMiss(this.model.findOne(filter, projection));
    }

    findAll(
        filter: RootFilterQuery<T> = {},
        projection?: ProjectionType<T> | null
    ) {
        return this.model.find(filter, projection).lean();
    }

    async countDocuments(filter: FilterQuery<T> = {}): Promise<number> {
        return this.model.countDocuments(filter).lean();
    }

    // == Update methods ===

    async updateOne(
        filter: RootFilterQuery<T>,
        update: UpdateQuery<T>,
        options: QueryOptions & { returnDocument?: "after" | "before" } = {
            returnDocument: "after"
        }
    ): Promise<T | null> {
        const updated = await this.model
            .findOneAndUpdate(filter, update, { ...options, new: true })
            .lean<T>()
            .exec();

        if (!updated) return null;

        const masterKey = `${String(this.primaryKey)}:${updated[this.primaryKey]}`;
        this.cache.set(masterKey, updated, this.cacheTTL);

        for (const key of this.secondaryKeys) {
            const val = updated[key];
            if (val != null)
                this.cache.set(
                    `${String(key)}:${val}`,
                    masterKey,
                    this.cacheTTL
                );
        }

        return updated;
    }

    // === Delete methods ===

    async deleteOne(filter: RootFilterQuery<T>) {
        const doc = await this.model.findOne(filter).lean<T>().exec();
        if (!doc) return null;

        const masterKey = `${String(this.primaryKey)}:${doc[this.primaryKey]}`;
        this.cache.del(masterKey);

        for (const key of this.secondaryKeys) {
            const val = doc[key];
            if (val != null) this.cache.del(`${String(key)}:${val}`);
        }

        await this.model.deleteOne(filter);
        return doc;
    }
}
