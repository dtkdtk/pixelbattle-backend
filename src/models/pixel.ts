import type { Long } from "mongodb";

export interface MongoPixel {
    _id: number;
    author: Long | null;
    tag: Long | null;
    color: number;
}
