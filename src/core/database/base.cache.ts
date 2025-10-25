export class CacheManager<T> {
    private readonly store = new Map<
        string,
        { value: T | string; expires: number }
    >();

    set<K extends string>(key: K, value: T | string, ttl: number) {
        this.store.set(key, { value, expires: Date.now() + ttl });
    }

    get<K extends string>(key: K): T | string | null {
        const data = this.store.get(key);
        if (!data) return null;

        if (Date.now() > data.expires) {
            this.store.delete(key);
            return null;
        }

        return data.value as T;
    }

    del<K extends string>(key: K) {
        this.store.delete(key);
    }

    clear() {
        this.store.clear();
    }
}
