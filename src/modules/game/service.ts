import { config } from "@core/config";
import type { MongoGame } from "@models";
import { Long } from "mongodb";
import type { Model } from "mongoose";

export class GameService {
    public data!: MongoGame;
    public canvasUpdatingProcess?: Promise<void>;
    private readonly _id = Long.fromString("433866403552854016");

    constructor(
        private model: Model<MongoGame>,
    ) {}

    public async init() {
        await this.refreshGameData();
    }

    public async refreshGameData() {        
        this.data = (await this.model.findById(this._id).lean())!;
        if (this.data === null)
            this.data = await this.model.insertOne({ _id: this._id, ...config.game });
    }

    public async setCooldown(ms: number) {
        await this.model.updateOne(
            { _id: this._id },
            { cooldown: ms }
        );
    }

    public async setCanvasSize(width: number, height: number) {
        await this.model.updateOne(
            { _id: this._id },
            { width, height }
        );
    }
}
