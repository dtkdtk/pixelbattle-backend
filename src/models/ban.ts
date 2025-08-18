import { Schema, model } from "mongoose";
import type { Long } from "mongodb";

export interface MongoBan {
    _id: Long;
    moderator: Long;
    player: Long;
    reason: string | null;
    until: Date | null;
}

const banSchema = new Schema<MongoBan>(
    {
        _id: {
            type: Schema.Types.BigInt,
            required: true
        },
        moderator: {
            type: Schema.Types.BigInt,
            required: true,
            ref: "User"
        },
        player: {
            type: Schema.Types.BigInt,
            required: true,
            ref: "User"
        },
        reason: {
            type: Schema.Types.String,
            required: false
        },
        until: {
            type: Schema.Types.Date,
            required: false,
            default: null
        }
    },
    {
        versionKey: false
    }
);

export const Ban = model<MongoBan>("Ban", banSchema);
