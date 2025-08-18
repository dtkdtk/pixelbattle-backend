import fp from "fastify-plugin";
import type { FastifyInstance } from "fastify";
import mongoose from "mongoose";
import { Ban, Game, Tag, Pixel, User } from "@models";
import { config } from "../config";

declare module "fastify" {
    interface FastifyInstance {
        mongo: mongoose.Connection;
        models: {
            Ban: typeof Ban;
            Game: typeof Game;
            Tag: typeof Tag;
            Pixel: typeof Pixel;
            User: typeof User;
        };
    }
}

export const database = fp(
    async function database(app: FastifyInstance) {
        await mongoose.connect(config.database, {
            retryWrites: true,
            readPreference: "primaryPreferred",
            compressors: ["zlib"],
            zlibCompressionLevel: 4,
            minPoolSize: 5,
            maxPoolSize: 10,
            writeConcern: { w: "majority" }
        });

        if (!mongoose.connection.db) {
            throw new Error("Can't connect to the database");
        }

        app.decorate("mongo", mongoose.connection);
        app.decorate("models", {
            Ban,
            Game,
            Tag,
            Pixel,
            User
        });
    },
    { name: "database", dependencies: [] }
);
