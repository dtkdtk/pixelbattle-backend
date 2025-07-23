export class BaseCache<T extends {}> {
    private _expiresOn: number = 0;

    constructor(
        public data: T,
        private ttl: number
    ) {
        this.refresh();
    }

    public get expiresOn() {
        return this._expiresOn;
    }

    public set<P extends keyof T>(prop: P, val: T[P]): T[P] {
        this.data[prop] = val;
        this.refresh();

        return val;
    }

    public refresh() {
        this._expiresOn = Date.now() + this.ttl;
    }
}
