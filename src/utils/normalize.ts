type NormalizeKeys<T, K extends keyof T> = Omit<T, K> & {
    [P in K]: string;
};

export function normalize<
    T extends Record<string, any>,
    K extends keyof T = "_id"
>(response: T | null, keys: K[] = ["_id"] as K[]): NormalizeKeys<T, K> | null {
    if (!response) return null;

    const result: any = { ...response };

    for (const key of keys) {
        const value = result[key];
        if (
            typeof value === "object" &&
            value !== null &&
            "toString" in value &&
            typeof value.toString === "function" &&
            value.toString !== Object.prototype.toString
        ) {
            result[key] = value.toString();
        } else if (typeof value === "number" || typeof value === "bigint") {
            result[key] = value.toString();
        } else if (typeof value === "object" && value !== null) {
            result[key] = value;
        }
    }

    return result;
}
