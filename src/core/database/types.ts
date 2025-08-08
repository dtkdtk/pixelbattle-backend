import type { Collection } from "mongodb";
import type {
    MongoBan,
    MongoGame,
    MongoPixel,
    MongoUser,
    MongoTag,
    MongoIp
} from "@models";

export interface PixelDatabase {
    bans: MongoBan;
    games: MongoGame;
    pixels: MongoPixel;
    users: MongoUser;
    tags: MongoTag;
    banned_ips: MongoIp;
}

export type PixelDatabaseCollections = {
    [K in keyof PixelDatabase]: Collection<PixelDatabase[K]>;
};
