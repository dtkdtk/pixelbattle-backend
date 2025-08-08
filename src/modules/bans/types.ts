import type { MongoBan } from "@models";

export type BanFilter = Partial<Pick<MongoBan, "_id" | "moderator" | "player">>;
