import { Schema, model } from "mongoose";
import { snowflake } from "@utils";

export interface MongoBan {
    _id: bigint;
    moderator: bigint;
    player: bigint;
    reason: string | null;
    until: Date | null;
}

const banSchema = new Schema<MongoBan>(
    {
        _id: {
            type: Schema.Types.BigInt,
            required: true,
            default: () => snowflake.generate()
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
