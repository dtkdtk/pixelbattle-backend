import type { UserAuthKey } from "@models";

export interface PixelInfo {
    _id: string;
    nickname: string;
    x: number;
    y: number;
    tag: string | null;
    color: string;
    ip: string;
}

export interface LoginInfo {
    _id: string;
    nickname: string;
    method: UserAuthKey;
    ip: string;
}
