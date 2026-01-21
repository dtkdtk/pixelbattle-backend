import { config } from "@core/config";
import type { CookieSerializeOptions } from "@fastify/cookie";

const isProd = process.env.NODE_ENV === "production";
const COOKIE_DOMAIN = isProd ? ".pixelbattle.fun" : undefined;

export const tokenCookieParameters: CookieSerializeOptions = {
    domain: COOKIE_DOMAIN,
    path: "/",
    expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14),
    httpOnly: false, // MUST BE TRUE
    sameSite: isProd ? "lax" : "lax",
    secure: isProd
};

export const idCookieParameters: CookieSerializeOptions = {
    ...tokenCookieParameters,
    httpOnly: false
};
