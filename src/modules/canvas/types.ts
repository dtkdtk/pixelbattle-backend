import type { MongoPixel } from "@models";

export interface Point {
    x: number;
    y: number;
}

export type PixelUpdate = Omit<MongoPixel, "_id">;

export type CanvasAlign = "center" | "left-top" | "left-bottom"
    | "right-top" | "right-bottom";
