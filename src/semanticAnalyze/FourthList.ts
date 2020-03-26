import { FourStatement } from './FourStatement';

export default class FourthList {
    private list: FourStatement[] = [];
    private currPos: number = 0;

    public push(statment: FourStatement) {
        this.list.push(statment);
    }

    public Tn() {
        this.currPos++;
        return `T${this.currPos}`;
    }

    public print() {
        this.list.forEach((item, index) => {
            console.log(`(${index})\t\t` + item.print());
        });
    }

    public nextIndex() {
        return this.list.length;
    }

    public mergeList(a: number, b: number) {
        if (b == 0) {
            return a;
        }
        let next: number | string = b;
        while (typeof next == 'number' && typeof this.list[next].mark == 'number') {
            next = this.list[next].mark;
        }
        this.list[next as number].setMark(a);
        return b;
    }

    public patch(start: number, target: number) {
        if (start == 0) return;
        let current: number | string = start;
        let next: number | string;
        while (typeof current == 'number') {
            next = this.list[current].mark;
            this.list[current].setMark(target);
            current = next;
        }
    }
}
