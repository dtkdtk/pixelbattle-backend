export class Cooldown<K> {
    private map = new Map<K, number>();

    constructor(private interval = 60000) {
        setInterval(() => this.cleanup(), this.interval);
    }

    set(key: K, duration: number) {
        return this.map.set(key, Date.now() + duration);
    }

    get(key: K) {
        return this.map.get(key);
    }

    has(key: K) {
        return this.map.has(key) && this.map.get(key)! > Date.now();
    }

    private cleanup() {
        const now = Date.now();
        for (const [key, until] of this.map.entries()) {
            if (until < now) {
                this.map.delete(key);
            }
        }
    }
}
