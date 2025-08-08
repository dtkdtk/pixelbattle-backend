export class TemporaryId {
    private sequence = 0;

    constructor() {}

    get nextId() {
        this.sequence = (this.sequence + 1) & 0xffff;
        return this.sequence;
    }
}
