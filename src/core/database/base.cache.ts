export class CacheManager<T> {
    private readonly store = new Map<string, { value: T; expires: number }>();

    set(key: string, value: T, ttl: number) {
        this.store.set(key, { value, expires: Date.now() + ttl });
    }

    get(key: string) {
        const data = this.store.get(key);
        if (!data) return null;

        if (Date.now() > data.expires) {
            this.store.delete(key);
            return null;
        }

        return data.value as T;
    }

    del(key: string) {
        this.store.delete(key);
    }

    clear() {
        this.store.clear();
    }
}
