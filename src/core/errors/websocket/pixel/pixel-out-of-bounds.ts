import { ErrorCode } from "@proto";
import { WebSocketError } from "../base.error";

export class PixelOutOfBoundsError extends WebSocketError {
    public statusCode = ErrorCode.PIXEL_OUT_OF_BOUNDS;
    public critical = false;

    constructor(max: number) {
        super();
        this.data = { max };
    }
}
