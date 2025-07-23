import { BaseCache } from "@core/database";
import type { MongoTag } from "@models";

export class TagCache extends BaseCache<MongoTag> {}
