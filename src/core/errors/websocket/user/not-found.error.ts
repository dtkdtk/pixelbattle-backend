import { ErrorCode } from "@proto";
import { WebSocketError } from "../base.error";

export class UserNotFoundError extends WebSocketError {
    public statusCode = ErrorCode.USER_NOT_FOUND;
    public critical = false;
}
