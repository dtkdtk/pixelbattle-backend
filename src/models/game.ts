import { Schema, model } from "mongoose";
import { Int32, type Long } from "mongodb";

export interface MongoGame {
    _id: Long;
    name: string;
    cooldown: number;
    ended: boolean;
    height: number;
    width: number;
}

const gameSchema = new Schema<MongoGame>(
    {
        _id: {
            type: Schema.Types.BigInt,
            required: true
        },
        name: {
            type: Schema.Types.String,
            required: true,
            trim: true,
            minLength: 4,
            maxLength: 24
        },
        cooldown: {
            type: Schema.Types.Number,
            required: true,
            default: 1000,
            set: (v: number) => new Int32(v),
            get: (v: Int32 | number) => (v instanceof Int32 ? v.valueOf() : v)
        },
        ended: {
            type: Schema.Types.Boolean,
            required: true,
            default: true
        },
        height: {
            type: Schema.Types.Number,
            required: true,
            set: (v: number) => new Int32(v),
            get: (v: Int32 | number) => (v instanceof Int32 ? v.valueOf() : v)
        },
        width: {
            type: Schema.Types.Number,
            required: true,
            set: (v: number) => new Int32(v),
            get: (v: Int32 | number) => (v instanceof Int32 ? v.valueOf() : v)
        }
    },
    {
        versionKey: false
    }
);

export const Game = model<MongoGame>("Game", gameSchema);
