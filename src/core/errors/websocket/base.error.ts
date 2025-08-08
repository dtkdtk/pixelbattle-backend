import type { ErrorCode } from "@proto";

export class WebSocketError extends Error {
    public statusCode!: ErrorCode;
    public critical: boolean = false;
    public data?: Record<string, unknown>;
}
