import { WordToken } from '../wordAnalyze/DFA_Analyze';

export class TokenList {
    private list: WordToken[] = [];
    private currPos: number = 0;

    public isEnd() {
        return this.currPos == this.list.length;
    }

    public push(token: WordToken) {
        this.list.push(token);
    }

    public next() {
        if (this.isEnd()) {
            return 0;
        }
        this.currPos++;
        return this.list[this.currPos - 1];
    }

    public nextIs() {
        if (this.currPos == this.list.length - 1) {
            return { type: 0, id: 0 };
        }
        return this.list[this.currPos];
    }

    public currIS() {
        return this.list[this.currPos];
    }
}
