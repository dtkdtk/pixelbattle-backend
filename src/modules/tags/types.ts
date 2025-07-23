import type { MongoTag } from "@models";

export type TagFilter = Partial<Pick<MongoTag, "_id" | "name">>;
