import { BaseRepository } from "@core/database";
import type { Model } from "mongoose";
import type { MongoBan } from "@models";

export class BanRepository extends BaseRepository<MongoBan> {
    constructor(model: Model<MongoBan>) {
        super(model, ["_id", "player"]);
    }
}
