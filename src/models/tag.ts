import type { Long } from "mongodb";

export interface MongoTag {
    _id: Long;
    name: string;
    creator: Long;
}
