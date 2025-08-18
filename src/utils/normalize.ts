import { Long } from "mongodb";

type NormalizeKeys<T, K extends keyof T> = Omit<T, K> & {
    [P in K as P extends "_id" ? "id" : P]: string;
};

export function normalize<
    T extends Record<string, any>,
    K extends keyof T = "_id"
>(response: T | null, keys: K[] = ["_id"] as K[]): NormalizeKeys<T, K> | null {
    if (!response) return null;

    let result: any = { ...response };

    for (const key of keys) {
        if (key in result) {
            const value = result[key];

            if (value instanceof Long || value?.constructor?.name === "Long") {
                result[key] = value.toString();
            } else if (typeof value === "bigint") {
                result[key] = value.toString();
            } else if (
                typeof value === "object" &&
                value !== null &&
                "toString" in value
            ) {
                result[key] = value.toString();
            } else if (typeof value === "number" || typeof value === "bigint") {
                result[key] = value.toString();
            }

            if (key === "_id") {
                const { _id, ...rest } = result;
                result = { id: _id, ...rest };
            }
        }
    }

    return result as NormalizeKeys<T, K>;
}
