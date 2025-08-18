import type { PixelInfo, LoginInfo } from "./types";

export const pixelPlace = ({
    _id,
    nickname,
    color,
    x,
    y,
    tag,
    ip
}: PixelInfo) =>
    console.log(
        `* [PIXEL] ${_id} - ${nickname}; ` +
            `Coordinates: X${x} Y${y}; ` +
            `Color: ${color}; ` +
            `Tag: ${tag}; ` +
            `IP: ${ip}; `
    );

export const loginComplete = ({ _id, nickname, method, ip }: LoginInfo) =>
    console.log(
        `* [LOGIN] ${_id} - ${nickname}; ` +
            `Method: ${method}; ` +
            `IP: ${ip};`
    );
