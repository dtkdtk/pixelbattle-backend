import { Schema, model } from "mongoose";
import { Int32 } from "mongodb";

export interface MongoPixel {
    _id: number;
    author: bigint | null;
    tag: bigint | null;
    color: number;
}

const pixelSchema = new Schema<MongoPixel>(
    {
        _id: {
            type: Schema.Types.Number,
            required: true,
            set: (v: number) => new Int32(v),
            get: (v: Int32 | number) => (v instanceof Int32 ? v.valueOf() : v)
        },
        author: {
            type: Schema.Types.BigInt,
            required: false,
            default: null,
            ref: "User"
        },
        tag: {
            type: Schema.Types.BigInt,
            required: false,
            default: null,
            ref: "Tag"
        },
        color: {
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

export const Pixel = model<MongoPixel>("Pixel", pixelSchema);
