import { Schema, model } from "mongoose";
import { Int32, type Long } from "mongodb";
import { generator } from "@utils";

export enum UserRole {
    User = 0,
    RESERVED_1 = 1,
    RESERVED_2 = 2,
    RESERVED_3 = 3,
    Academy = 4,
    Moderator = 5,
    Admin = 6
}

export interface AuthInfo {
    visible: boolean;
    username: string;
    id: string;
}

export type UserAuthKey = "discord" | "google" | "twitch" | "github";

export type UserAuth = {
    [key in UserAuthKey]: AuthInfo | null;
};

export interface MongoUser {
    _id: Long;
    email: string;
    username: string;
    tag: Long | null;
    role: UserRole;
    token: string;
    badges: number;
    karma: number;
    banned: Long | null;
    connections: UserAuth;
}

const authInfoSchema = new Schema<AuthInfo>(
    {
        visible: { type: Boolean, required: true, default: true },
        username: { type: String, required: true },
        id: { type: String, required: true }
    },
    { _id: false }
);

const userAuthSchema = new Schema<UserAuth>(
    {
        discord: { type: authInfoSchema, required: true, default: null },
        google: { type: authInfoSchema, required: true, default: null },
        twitch: { type: authInfoSchema, required: true, default: null },
        github: { type: authInfoSchema, required: true, default: null }
    },
    { _id: false }
);

const userSchema = new Schema<MongoUser>(
    {
        _id: {
            type: Schema.Types.BigInt,
            required: true
        },
        email: {
            type: Schema.Types.String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true
        },
        token: {
            type: Schema.Types.String,
            required: true,
            unique: true,
            default: generator.generateToken
        },
        username: {
            type: Schema.Types.String,
            required: true,
            unique: true,
            index: true,
            trim: true,
            min: 3,
            max: 24,
            match: /^[a-zA-Z0-9._-]+$/
        },
        tag: {
            type: Schema.Types.BigInt,
            required: false,
            default: null,
            ref: "Tag"
        },
        role: {
            type: Schema.Types.Number,
            required: true,
            enum: Object.values(UserRole),
            default: UserRole.User,
            set: (v: number) => new Int32(v),
            get: (v: Int32 | number) => (v instanceof Int32 ? v.valueOf() : v)
        },
        badges: {
            type: Schema.Types.Number,
            required: true,
            default: 0,
            min: 0
        },
        karma: {
            type: Schema.Types.Number,
            required: true,
            default: 0,
            set: (v: number) => new Int32(v),
            get: (v: Int32 | number) => (v instanceof Int32 ? v.valueOf() : v)
        },
        banned: {
            type: Schema.Types.BigInt,
            required: false,
            default: null,
            ref: "Ban"
        },
        connections: {
            type: userAuthSchema,
            required: true,
            default: () => ({})
        }
    },
    {
        versionKey: false
    }
);

userSchema.virtual("isBanned").get(function () {
    return this.banned !== null;
});

export const User = model<MongoUser>("User", userSchema);
