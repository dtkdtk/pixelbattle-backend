import { BaseCache } from "@core/database";
import type { MongoUser } from "@models";

export class UserCache extends BaseCache<MongoUser> {}
