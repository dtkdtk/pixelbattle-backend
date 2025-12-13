import { Pixel, type MongoPixel } from "@models";
import type { GameService } from "@modules/game/service";
import { translate } from "@utils";
import type { CanvasRepository } from "./repository";
import type { CanvasAlign, PixelUpdate, Point } from "./types";

export class CanvasService {
    private changes: Set<number> = new Set();
    public pixels: Map<number, Omit<MongoPixel, "color">>;
    public colors!: Uint8ClampedArray;
    public syncInterval?: Timer;
    /** If it is a promise, you should not touch the canvas (update its pixels) */
    public canvasResizeProcess?: Promise<void>;

    public get width() {
        return this.game.data.width;
    }
    public get height() {
        return this.game.data.height;
    }

    constructor(
        private repository: CanvasRepository,
        private game: GameService,
        public readonly bitPP = 3
    ) {
        this.setupColorMap();
        this.pixels = new Map();
    }

    public async init() {
        const pixels = await this.repository.fetch();

        if (pixels.length !== this.width * this.height) {
            throw new Error(
                `Canvas size mismatch. Expected ${this.width * this.height} pixels, got ${pixels.length}`
            );
        }

        pixels.forEach(({ color, ...pixel }, index) => {
            const [R, G, B] = translate.number(color);
            const from = index * this.bitPP;

            this.colors[from] = R;
            this.colors[from + 1] = G;
            this.colors[from + 2] = B;
            this.pixels.set(index, pixel);
        });

        return this.pixels;
    }

    public async sync() {
        if (!this.changes.size) return;
        if (this.canvasResizeProcess) return;

        const updates = [];

        for (const pixelId of this.changes) {
            updates.push({
                _id: pixelId,
                ...this.getPixelUpdate(pixelId)
            });
        }

        if (updates.length > 0) {
            await this.repository.bulkUpdate(updates);
        }

        this.changes.clear();
    }

    private getPixelUpdate(point: number): PixelUpdate {
        const pixel = this.getPixel(point)!;

        return {
            author: pixel.author,
            tag: pixel.tag,
            color: this.getColor(point)
        };
    }

    public setPixel(pixel: MongoPixel) {
        const { color, ...data } = pixel;

        this.setColor(data._id, color);
        this.pixels.set(pixel._id, data);
        this.changes.add(pixel._id);
    }

    public getPixel(point: number) {
        return this.pixels.get(point);
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

    public async resizeCanvas(
        width: number,
        height: number,
        align: CanvasAlign
    ) {
        console.log("Resizing canvas...");
        console.time("ResizeCanvas");
        const promise = new Promise<void>((resolve, reject) => {
            (Promise.resolve()
                .then(() => this.sync())
                .then(() => this._resizeCanvasImpl(width, height, align))
                .then(() => this.game.setCanvasSize(width, height))
                .then(() => this.game.refreshGameData())
                .then(() => Promise.resolve(this.setupColorMap()))
                .then(() => this.init())
                .then(() => resolve())).catch(reject);
        });
        this.canvasResizeProcess = promise;
        await promise;
        this.canvasResizeProcess = undefined;
        console.log("Canvas resized!");
        console.timeEnd("ResizeCanvas");
    }

    private async _resizeCanvasImpl(
        width: number,
        height: number,
        align: CanvasAlign
    ) {
        const originalCanvas = await this.repository.fetch();
        const mask = this.createPixelExtensionMask(this, { width, height }, align);
        const newCanvas = new Array<MongoPixel>(width * height);
        mask.reduce((oldIndex, isFilled, index) => {
            if (isFilled) {
                originalCanvas[oldIndex]._id = index;
                newCanvas[index] = originalCanvas[oldIndex];
                return oldIndex + 1;
            }
            else {
                newCanvas[index] = new Pixel({ _id: index, color: 0xFFFFFF });
                return oldIndex;
            }
        }, 0);
        await this.repository.bulkUpdate(newCanvas, { upsert: true });
    }

    private createPixelExtensionMask(
        old: { width: number, height: number },
        current: { width: number, height: number },
        align: CanvasAlign
    ) {
        const newLength = current.width * current.height;
        const mask = new Array<boolean>(newLength);
        const offsetX = Math.max(0, current.width - old.width);
        const offsetY = Math.max(0, current.height - old.height);
        let startX = 0;
        let startY = 0;
        if (align == "center") {
            startX = Math.floor(offsetX / 2);
            startY = Math.floor(offsetY / 2);
        }
        else if (align.includes("bottom"))
            startY = offsetY;
        else if (align.includes("right"))
            startX = offsetX;
        for (let i = 0; i < newLength; i++) {
            const x = i % current.width;
            const y = Math.floor(i / current.width);
            if (x >= startX && x < startX + old.width
                && y >= startY && y < startY + old.height
            ) {
                mask[i] = true;
            }
            else mask[i] = false;
        }
        return mask;
    }

    private startIndex(point: number) {
        return point * this.bitPP;
    }

    private setupColorMap() {
        this.colors = new Uint8ClampedArray(this.width * this.height * this.bitPP);
    }
}
