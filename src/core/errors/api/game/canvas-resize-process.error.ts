import { ApiError } from "../base.error";

export class CanvasResizingProcessError extends ApiError {
    public statusCode = 500;
    public message = "Canvas is resizing. Please wait.";
}
