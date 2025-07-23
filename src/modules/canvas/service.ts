import type { PixelUpdate, Point } from "./types";
import type { CanvasRepository } from "./repository";
import type { MongoPixel } from "@models";
import { translate } from "@utils";

export class CanvasService {
    private changes: number[] = [];
    public pixels: Omit<MongoPixel, "color">[];
    public colors: Uint8ClampedArray;
    public syncInterval?: Timer;

    constructor(
        private repository: CanvasRepository,
        public readonly width: number,
        public readonly height: number,
        public readonly bitPP = 3
    ) {
        this.colors = new Uint8ClampedArray(width * height * bitPP);
        this.pixels = [];
    }

    public async init() {
        const pixels = await this.repository.fetch();

        if (pixels.length !== this.width * this.height) {
            throw new Error(
                `Canvas size mismatch. Expected ${this.width * this.height} pixels, got ${this.pixels.length}`
            );
        }

        pixels.forEach(({ color, ...pixel }, index) => {
            const [R, G, B] = translate.number(color);
            const from = index * this.bitPP;

            this.colors[from] = R;
            this.colors[from + 1] = G;
            this.colors[from + 2] = B;
            this.pixels[index] = pixel;
        });

        return this.pixels;
    }

    public async sync() {
        const updates = this.changes.map((pixel) => ({
            _id: pixel,
            ...this.getPixelUpdate(pixel)
        }));

        await this.repository.bulkUpdate(updates);
        this.changes = [];
    }

    private getPixelUpdate(point: number): PixelUpdate {
        const pixel = this.pixels.find((data) => data._id === point)!;

        return {
            author: pixel.author,
            tag: pixel.tag,
            color: this.getColor(point)
        };
    }

    public setPixel(pixel: MongoPixel) {
        const data = this.getPixel(pixel._id);

        if (!data) return;

        this.setColor(pixel._id, pixel.color);
        data.author = pixel.author;
        data.tag = pixel.tag;

        this.changes.push(pixel._id);

        return pixel;
    }

    public getPixel(point: number) {
        return this.pixels.find((pixel) => pixel._id === point);
    }

    public setColor(point: number, color: number) {
        const index = this.startIndex(point);
        const [R, G, B] = translate.number(color);

        this.colors[index] = R;
        this.colors[index + 1] = G;
        this.colors[index + 2] = B;
    }

    public getColor(point: number) {
        const index = this.startIndex(point);
        return translate.RGB(this.colors.slice(index, index + this.bitPP));
    }

    public startPoint({ x, y }: Point) {
        return x + y * this.width;
    }

    private startIndex(point: number) {
        return point * this.bitPP;
    }
}
