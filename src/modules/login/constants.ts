import { config } from "@core/config";
import type { CookieSerializeOptions } from "@fastify/cookie";

const isProd = process.env.NODE_ENV === "production";
const hostnameParts = config.backend.hostname.split(".");
const sharedDomain =
    hostnameParts.length > 2
        ? `.${hostnameParts.slice(1).join(".")}`
        : undefined;

export const tokenCookieParameters: CookieSerializeOptions = {
    domain: sharedDomain,
    path: "/",
    expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14),
    httpOnly: false, // MUST BE TRUE
    sameSite: isProd ? "lax" : "lax",
    secure: isProd
};

export const idCookieParameters: CookieSerializeOptions = {
    ...tokenCookieParameters,
    domain: sharedDomain,
    httpOnly: false
};
