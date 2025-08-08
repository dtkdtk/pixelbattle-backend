import type { Long } from "mongodb";

export enum UserRole {
    User = 0,
    Academy = 1,
    Moderator = 2,
    Admin = 3
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
