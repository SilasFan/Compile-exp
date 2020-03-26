import { CharSet, GenCharSet } from './CharSet';

export interface WordToken {
    type: number;
    id: number | '-';
}

interface KeyWordList {
    [keyword: string]: number;
}

interface DFAState {
    [char: string]: number;
}

class DFA {
    public keywords: KeyWordList = {};
    public variableList: KeyWordList = {};
    public vari_num: number = 1;

    //从数组中取出下一个token值的索引
    public variables: string[] = [];
    public KEYWORDS: string[] = [];
    public getIndex: number = 0;

    public Endable: boolean[] = [];
    public States: DFAState[] = [];
    public charset: CharSet = {};

    constructor(PATH: string) {
        this.charset = GenCharSet(PATH);
        this.States[0] = {};
        this.Endable[0] = false;
    }

    // Generate DFA (temporarily Generate artificially)
    public DFAGen() {
        // input letter
        this.States[1] = {};
        this.States[2] = {};
        for (let i in this.charset['letter']) {
            this.States[0][i] = 1;
            this.States[1][i] = 2;
            this.States[2][i] = 2;
        }
        for (let i in this.charset['number']) {
            this.States[1][i] = 2;
            this.States[2][i] = 2;
        }
        this.Endable[0] = false;
        this.Endable[1] = true;
        this.Endable[2] = true;

        // input number
        this.States[3] = {};
        for (let i in this.charset['number']) {
            this.States[0][i] = 3;
            this.States[3][i] = 3;
        }
        this.Endable[3] = true;

        // input delimiter
        this.States[17] = {};
        for (let i in this.charset['delimiter']) {
            this.States[0][i] = 17;
        }

        // input '>'
        this.States[4] = { '=': 5 };
        this.States[5] = {};
        this.States[0]['>'] = 4;

        // input '*'
        this.States[6] = this.States[7] = {};
        this.States[0]['*'] = 6;
        this.States[6] = { '/': 7 };

        // input '/'
        this.States[8] = this.States[9] = {};
        this.States[0]['/'] = 8;
        this.States[8]['*'] = 9;

        // input '<'
        this.States[10] = this.States[11] = this.States[12] = {};
        this.States[0]['<'] = 10;
        this.States[10]['>'] = 11;
        this.States[10]['='] = 12;

        // input '.'
        this.States[13] = this.States[14] = {};
        this.States[13]['.'] = 14;
        this.States[0]['.'] = 13;

        //input ':'
        this.States[15] = this.States[16] = {};
        this.States[0][':'] = 15;
        this.States[15]['='] = 16;

        for (let i = 4; i < this.States.length; i++) {
            this.Endable[i] = true;
        }
    }

    public DFA_Match_Word(word: string, index: number): number {
        let marker: number = 0;

        for (; index < word.length; index++) {
            if (this.States[marker][word[index]] == undefined) {
                if (this.Endable[marker]) {
                    const lookahead = word[index];
                    if (this.charset['delimiter'][lookahead] === undefined && lookahead !== ' ' && marker < 4) {
                        throw new Error(`Unexpected word `);
                    } else {
                        return index;
                    }
                } else {
                    throw new Error(`Unexpected symbol "${word[index]}" `);
                }
            } else {
                marker = this.States[marker][word[index]];
            }
        }

        return index;
    }

    public DFA_Match_Line(line: string, No = 1): WordToken[] {
        let marker: number = 0;
        let words: WordToken[] = [];

        while (marker < line.length) {
            let char = line[marker];

            // blank char
            if (char === ' ') {
                marker++;
                continue;
            }

            // string
            if (char === "'") {
                try {
                    let after = this.Match_Str(line, marker);
                    let vari = line.slice(marker, after);
                    words.push(this.Match_Identifier(vari));
                    marker = after;
                } catch (error) {
                    throw new Error(error.message + `in line ${No}`);
                }
                continue;
            }

            // notation
            if (char === '/' && line[marker + 1] === '*') {
                try {
                    let after = this.Match_Notation(line, marker + 2);
                    marker = after;
                } catch (error) {
                    throw new Error(error.message + `in line ${No}`);
                }
                continue;
            }

            // other
            try {
                let after = this.DFA_Match_Word(line, marker);
                let vari = line.slice(marker, after);
                words.push(this.Match_Identifier(vari));
                marker = after;
            } catch (error) {
                throw new Error(error.message + `in line ${No}`);
            }
        }

        return words;
    }

    public Match_Str(line: string, index: number): number {
        index++;
        while (index < line.length && line[index] !== "'") {
            index++;
        }
        if (index == line.length) {
            throw new Error('Missing right "\'" ');
        } else {
            return index + 1;
        }
    }

    public Match_Notation(line: string, index: number): number {
        while (index < line.length - 1 && line[index] !== '*' && line[index + 1] !== '/') {
            index++;
        }
        if (index == line.length - 1) {
            throw new Error('Missing right "*/" ');
        } else {
            return index + 2;
        }
    }

    public Match_Identifier(word: string): WordToken {
        if (this.keywords[word] != undefined) {
            return { type: this.keywords[word], id: '-' };
        }

        // match type
        if (this.variableList[word] != undefined) {
            if (word[0] === "'") {
                this.variables.push(word);
                return { type: 38, id: this.variableList[word] };
            } else if (this.charset['number'][word[0]] !== undefined) {
                this.variables.push(word);
                return { type: 37, id: this.variableList[word] };
            } else {
                this.variables.push(word);
                return { type: 36, id: this.variableList[word] };
            }
        } else {
            this.variableList[word] = this.vari_num;
            this.vari_num++;
            if (word[0] === "'") {
                this.variables.push(word);
                return { type: 38, id: this.variableList[word] };
            } else if (this.charset['number'][word[0]] !== undefined) {
                this.variables.push(word);
                return { type: 37, id: this.variableList[word] };
            } else {
                this.variables.push(word);
                return { type: 36, id: this.variableList[word] };
            }
        }
    }

    public keywordGen(keywords: string[], firstIndex: number) {
        keywords.map((val, index) => {
            this.KEYWORDS[index + firstIndex] = val;
            this.keywords[val] = index + firstIndex;
        });
        this.KEYWORDS[36] = 'bsf';
        this.KEYWORDS[37] = 'zs';
        this.KEYWORDS[38] = 'zfcs';
    }

    //取出下一个token的值
    public getNextTokenValue() {
        const value = this.variables[this.getIndex];
        this.getIndex++;
        return value;
    }

    public getKeyWord(i: number) {
        return this.KEYWORDS[i];
    }
}

export default DFA;
