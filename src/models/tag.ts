import { Schema, model } from "mongoose";
import type { Long } from "mongodb";

export interface MongoTag {
    _id: Long;
    name: string;
    creator: Long;
}

const tagSchema = new Schema<MongoTag>(
    {
        _id: {
            type: Schema.Types.BigInt,
            required: true
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
