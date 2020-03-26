export class FourStatement {
    public symbol: string | null;
    public var1: string | null;
    public var2: string | null;
    public mark: number | string;

    constructor(s: string, v1: string, v2: string, mark: number | string) {
        this.symbol = s;
        this.var1 = v1;
        this.var2 = v2;
        this.mark = mark;
    }

    public print() {
        return `(${this.symbol}, ${this.var1}, ${this.var2}, ${this.mark})`;
    }

    public setMark(mark: number | string) {
        this.mark = mark;
    }
}
