import { Schema, model } from "mongoose";
import { snowflake } from "@utils";

export interface MongoTag {
    _id: bigint;
    name: string;
    creator: bigint;
}

const tagSchema = new Schema<MongoTag>(
    {
        _id: {
            type: Schema.Types.BigInt,
            required: true,
            default: () => snowflake.generate()
        },
        name: {
            type: Schema.Types.String,
            required: true,
            unique: true,
            index: true,
            trim: true,
            min: 2,
            max: 12,
            match: /^[a-zA-Z0-9._-]+$/
        },
        creator: {
            type: Schema.Types.BigInt,
            required: true,
            ref: "User"
        }
    },
    {
        versionKey: false
    }
);

export const Tag = model<MongoTag>("Tag", tagSchema);
