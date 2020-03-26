export class BoolExp {
    public codeBegin: number = 0;
    public TRUE: number = 0;
    public FALSE: number = 0;

    constructor(begin?: number, tv?: number, fv?: number) {
        this.codeBegin = begin ? begin : 0;
        this.TRUE = tv ? tv : 0;
        this.FALSE = fv ? fv : 0;
    }
}
