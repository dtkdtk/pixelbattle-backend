export class TimeWindowCounter<K> {
    public lastCleanupTimestamp = Date.now();

    private counters = new Map<K, number>();
    private interval;

    constructor(public readonly intervalMs: number) {
        this.interval = setInterval(() => this.cleanup(), intervalMs);
    }

    add(key: K) {
        const value = this.counters.get(key) ?? 0;
        this.counters.set(key, value + 1);
    }

    get(key: K) {
        return this.counters.get(key) ?? 0;
    }

    dispose() {
        clearInterval(this.interval);
    }

    private cleanup() {
        this.lastCleanupTimestamp = Date.now();
        this.counters.clear();
    }
}