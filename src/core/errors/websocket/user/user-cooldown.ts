import { ErrorCode } from "@proto";
import { WebSocketError } from "../base.error";

export class UserCooldownError extends WebSocketError {
    public statusCode = ErrorCode.USER_COOLDOWN;
    public critical = false;

    constructor(until: number) {
        super();
        this.data = { until };
    }
}
