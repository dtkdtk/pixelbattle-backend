import type { Long } from "mongodb";

export interface MongoBan {
    _id: Long;
    moderator: Long;
    player: Long;
    reason: string | null;
    until: Date | null;
}
