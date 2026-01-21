import fp from "fastify-plugin";
import { fastifyOauth2, type OAuth2Namespace } from "@fastify/oauth2";
import { config } from "@core/config";

import {
    discordCallback,
    googleCallback,
    twitchCallback,
    githubCallback
} from "@modules/login";

declare module "fastify" {
    interface FastifyInstance {
        discordOauth2: OAuth2Namespace;
        googleOauth2: OAuth2Namespace;
        twitchOauth2: OAuth2Namespace;
        githubOauth2: OAuth2Namespace;
    }
}

export const oauth2 = fp(
    async function OAuth2(app) {
        if (config.discord.bot.id)
            app.register(fastifyOauth2, {
                name: "discordOauth2",
                scope: ["identify", "guilds.join", "email"],
                credentials: {
                    auth: fastifyOauth2.DISCORD_CONFIGURATION,
                    client: {
                        id: config.discord.bot.id,
                        secret: config.discord.bot.secret
                    }
                },
                /*cookie: {
                    secure: true,
                    sameSite: "lax"
                },*/
                startRedirectPath: "/login/discord",
                callbackUri: new URL(
                    "/login" + discordCallback.url,
                    config.backend
                ).href
            });

        if (config.google.id)
            app.register(fastifyOauth2, {
                name: "googleOauth2",
                scope: ["profile", "email"],
                credentials: {
                    client: {
                        id: config.google.id,
                        secret: config.google.secret
                    },
                    auth: fastifyOauth2.GOOGLE_CONFIGURATION
                },
                /*cookie: {
                    secure: true
                },*/
                startRedirectPath: "/login/google",
                callbackUri: new URL(
                    "/login" + googleCallback.url,
                    config.backend
                ).href
            });

        if (config.twitch.id)
            app.register(fastifyOauth2, {
                name: "twitchOauth2",
                scope: ["user:read:email"],
                credentials: {
                    client: {
                        id: config.twitch.id,
                        secret: config.twitch.secret
                    },
                    auth: fastifyOauth2.TWITCH_CONFIGURATION
                },
                /*cookie: {
                    secure: true
                },*/
                startRedirectPath: "/login/twitch",
                callbackUri: new URL(
                    "/login" + twitchCallback.url,
                    config.backend
                ).href,
                tokenRequestParams: {
                    client_id: config.twitch.id,
                    client_secret: config.twitch.secret
                }
            });

        if (config.github.id)
            app.register(fastifyOauth2, {
                name: "githubOauth2",
                scope: ["user:email"],
                credentials: {
                    client: {
                        id: config.github.id,
                        secret: config.github.secret
                    },
                    auth: fastifyOauth2.GITHUB_CONFIGURATION
                },
                /*cookie: {
                    secure: true
                },*/
                startRedirectPath: "/login/github",
                callbackUri: new URL(
                    "/login" + githubCallback.url,
                    config.backend
                ).href
            });
    },
    { name: "oauth2" }
);
