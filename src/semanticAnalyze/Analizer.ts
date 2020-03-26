import { BoolExp } from './BoolExpression';
import { TokenList } from './TokenList';
import { FourStatement } from './FourStatement';
import FourthList from './FourthList';
import { Variable, VariableList } from './Variable';
import DFA from '../wordAnalyze/DFA_Analyze';

export default class Analizer {
    //传入的词法分析器,初始化在外面程序
    public dfa: DFA;

    public tokenList: TokenList = new TokenList();
    private fourthList: FourthList = new FourthList();
    private variableList: VariableList = new VariableList();

    private variable: string = '';
    private a: string = '';

    constructor(dfa: DFA) {
        this.dfa = dfa;
        this.dfa.keywords['bsf'] = 36;
        this.dfa.keywords['zs'] = 37;
        this.dfa.keywords['zfcs'] = 38;
    }

    public checkNext(vari: string) {
        return this.move() == this.dfa.keywords[vari];
    }

    public move(): number {
        const next = this.tokenList.next();
        if (typeof next !== 'number') {
            if (next.type == 36 || next.type == 37 || next.type == 38) {
                this.variable = this.dfa.getNextTokenValue();
            }
            return next.type;
        }
        return 0;
    }

    public satrtAnalyze() {
        try {
            this.programExp();
        } catch (e) {
            console.log(e);
        }
        this.fourthList.print();
    }

    public programExp() {
        if (this.checkNext('program') && this.checkNext('bsf') && this.checkNext(';')) {
            this.fourthList.push(new FourStatement('program', this.variable, '-', '-'));
            this.variableIntroduceExp();
            this.composeStatementExp();
            if (this.checkNext('.') && this.tokenList.isEnd()) {
                this.fourthList.push(new FourStatement('sys', '-', '-', '-'));
                return;
            } else throw new Error('Not the End!');
        } else throw new Error('Invalid program head');
    }

    public variableIntroduceExp() {
        if (this.tokenList.nextIs().type == 3) return;
        else if (this.checkNext('var')) this.variableDefineExp();
        else throw new Error('Invalid VI syntax');
    }

    public variableDefineExp() {
        this.identifierTableExp();
        if (this.checkNext(':')) {
            this.identifierExp();
            this.variableList.defineType(this.a);
            if (this.checkNext(';')) {
                if (this.tokenList.nextIs().type == 3) return;
                else this.variableDefineExp();
            } else throw new Error('Invalid sentence end');
        } else throw new Error('variable define error');
    }

    public identifierTableExp() {
        if (this.checkNext('bsf')) {
            if (!this.variableList.defineVariable(this.variable)) throw 'redefined!';
            if (this.tokenList.currIS().type == 50) return;
            else if (this.checkNext(',')) this.identifierTableExp();
            else throw 'invalid identifier table syntax';
        } else throw 'invalid identifier table syntax';
    }

    public identifierExp() {
        let token = this.tokenList.nextIs();
        if (token.type == 17 || token.type == 4 || token.type == 7) {
            this.a = this.dfa.KEYWORDS[token.type];
            this.move();
            return;
        } else throw 'Type Error';
    }

    public composeStatementExp(): number {
        let ring = 0;
        if (this.checkNext('begin')) {
            ring = this.sentenceTableExp();
            if (this.checkNext('end')) return ring;
            else throw 'Invalid statement end';
        } else throw 'Invalid statement end!';
        return ring;
    }

    public sentenceTableExp(): number {
        let ring: number = this.sentenceExp();
        if (this.tokenList.nextIs().type == 12) {
            this.fourthList.patch(ring, this.fourthList.nextIndex());
            return ring;
        } else if (this.checkNext(';')) {
            this.fourthList.patch(ring, this.fourthList.nextIndex());
            ring = this.sentenceTableExp();
            return ring;
        } else throw 'sentence table error!';
    }

    public sentenceExp(): number {
        switch (this.tokenList.nextIs().type) {
            case 36:
                return this.assignmentExp();
            case 15:
                return this.ifStatement();
            case 34:
                return this.whileStatement();
            case 26:
                return this.repeatStatement();
            default:
                throw 'Invalid sentence!';
        }
    }

    public assignmentExp(): number {
        if (this.checkNext('bsf') && this.checkNext(':=')) {
            const temp = this.variable;
            if (this.variableList.includes(temp)) {
                let ariExp: Variable = this.arithmeticExp();
                if (this.variableList.checkType(temp, ariExp.type)) {
                    this.variableList.setValue(temp, ariExp.value);
                    this.fourthList.push(new FourStatement(':=', ariExp.name, '-', temp));
                    return 0;
                } else throw 'type conflict';
            } else throw 'undefied variable!';
        } else throw 'Invalid syntax';
    }

    public ifStatement(): number {
        let ring: number = 0;
        if (this.checkNext('if')) {
            let be: BoolExp = this.boolExp();
            if (this.checkNext('then')) {
                this.fourthList.patch(be.TRUE, this.fourthList.nextIndex());
                const s1 = this.sentenceExp();
                ring = this.fourthList.mergeList(be.FALSE, s1);

                if (this.tokenList.nextIs().type == 11) {
                    this.move();
                    const q = this.fourthList.nextIndex();
                    this.fourthList.push(new FourStatement('j', '-', '-', '$'));
                    this.fourthList.patch(be.FALSE, this.fourthList.nextIndex());
                    const tp = this.fourthList.mergeList(q, s1);
                    const s2 = this.sentenceExp();
                    ring = this.fourthList.mergeList(tp, s2);
                }

                return ring;
            } else throw 'missing then';
        } else throw 'Invalid ifStatement syntax';
    }

    public whileStatement(): number {
        let ring: number = 0;
        if (this.checkNext('while')) {
            const begin = this.fourthList.nextIndex();
            let be: BoolExp = this.boolExp();
            if (this.checkNext('do')) {
                this.fourthList.patch(be.TRUE, this.fourthList.nextIndex());
                ring = be.FALSE;
                let s: number = this.sentenceExp();
                this.fourthList.patch(s, begin);
                this.fourthList.push(new FourStatement('j', '-', '-', begin));
                return ring;
            } else throw 'missing do';
        } else throw 'Invalid whileStatement syntax';
    }

    public repeatStatement(): number {
        let ring: number = 0;
        if (this.checkNext('repeat')) {
            const begin = this.fourthList.nextIndex();
            this.sentenceExp();
            if (this.checkNext('until')) {
                const be: BoolExp = this.boolExp();
                this.fourthList.patch(be.FALSE, begin);
                ring = be.TRUE;
                return ring;
            } else throw 'missing until';
        } else throw 'Invalid repeatStatement syntax';
    }

    public arithmeticExp(): Variable {
        let v1: Variable = this.term();
        let type = this.tokenList.nextIs().type;

        if (type == 43 || type == 45) {
            this.move();
            let v2: Variable = this.arithmeticExp();
            if (v1.type == v2.type) {
                let tn = this.fourthList.Tn();
                const val = type == 43 ? v1.numberVal + v2.numberVal : v1.numberVal - v2.numberVal;
                this.variableList.push(tn, v1.type, val.toString());
                this.fourthList.push(new FourStatement(this.dfa.KEYWORDS[type], v1.name, v2.name, tn));
                return this.variableList.getVariable(tn) as Variable;
            } else {
                console.error('type not match!');
                return v2;
            }
        } else return v1;
    }

    public term(): Variable {
        let v1: Variable = this.factor();
        let sy: number = this.tokenList.nextIs().type;
        if (sy == 41 || sy == 48) {
            this.move();
            let v2: Variable = this.term();

            if (v1.type == v2.type) {
                let tn = this.fourthList.Tn();
                this.variableList.push(tn, v1.type, '0');
                this.fourthList.push(new FourStatement(this.dfa.KEYWORDS[sy], v1.name, v2.name, tn));
                return this.variableList.getVariable(tn) as Variable;
            } else throw 'type not match';
        } else return v1;
    }

    public factor(): Variable {
        if (this.tokenList.nextIs().type == 45) {
            this.move();
            let s: Variable = this.factor();
            if (s.type == 'integer') {
                let tn = this.fourthList.Tn();
                this.variableList.push(tn, s.type, '0');
                this.fourthList.push(new FourStatement('@', s.name, '-', tn));
                return this.variableList.getVariable(tn) as Variable;
            } else throw 'not integer';
        } else if (this.tokenList.nextIs().type == 39) {
            this.move();
            let a: Variable = this.arithmeticExp();
            if (this.tokenList.nextIs().type == 40) {
                this.move();
                return a;
            } else throw 'missing right )';
        } else return this.iden();
    }

    public iden(): Variable {
        let type = this.tokenList.nextIs().type;
        if (type == 36 || type == 37) {
            this.move();
            if (this.variableList.includes(this.variable)) return this.variableList.getVariable(this.variable) as Variable;
            else if (type == 37) return new Variable(this.variable, 'integer', '0');
        } else throw 'Invalid identifier syntax';
        return new Variable('0', 'integer', '0');
    }

    public boolExp(): BoolExp {
        let boolexp: BoolExp = new BoolExp();
        let boolexp1 = this.boolTerm();
        if (this.tokenList.nextIs().type == 20) {
            this.move();
            let boolexp2 = this.boolExp();
            boolexp.codeBegin = boolexp1.codeBegin;
            this.fourthList.patch(boolexp1.FALSE, boolexp2.codeBegin);
            boolexp.TRUE = this.fourthList.mergeList(boolexp1.TRUE, boolexp2.TRUE);
            boolexp.FALSE = boolexp2.FALSE;
            return boolexp;
        } else return boolexp1;
    }

    public boolTerm(): BoolExp {
        let boolexp: BoolExp = new BoolExp();
        let boolexp1 = this.boolFactor();
        if (this.tokenList.nextIs().type == 1) {
            this.move();
            let boolexp2 = this.boolTerm();
            boolexp.codeBegin = boolexp1.codeBegin;
            this.fourthList.patch(boolexp1.TRUE, boolexp2.codeBegin);
            boolexp.TRUE = boolexp2.TRUE;
            boolexp.FALSE = this.fourthList.mergeList(boolexp1.FALSE, boolexp2.FALSE);
            return boolexp;
        } else return boolexp1;
    }

    public boolFactor(): BoolExp {
        let boolexp: BoolExp = new BoolExp();
        if (this.tokenList.nextIs().type == 18) {
            this.move();
            let boolexpt = this.boolL();
            boolexp.codeBegin = boolexpt.codeBegin;
            boolexp.TRUE = boolexpt.FALSE;
            boolexp.FALSE = boolexpt.TRUE;
            return boolexp;
        } else if (this.tokenList.nextIs().type == 39) {
            this.move();
            boolexp = this.boolExp();
            if (this.tokenList.nextIs().type == 40) this.move();
            else throw 'missing right )';
            return boolexp;
        } else return this.boolL();
    }

    public boolL(): BoolExp {
        let boolexp: BoolExp = new BoolExp();
        let next = this.tokenList.nextIs().type;

        if (next == 13 || next == 31) {
            this.move();
            boolexp.codeBegin = this.fourthList.nextIndex();
            if (next == 13) {
                boolexp.TRUE = this.fourthList.nextIndex();
                boolexp.FALSE = 0;
            } else {
                boolexp.FALSE = this.fourthList.nextIndex();
                boolexp.TRUE = 0;
            }
            this.fourthList.push(new FourStatement('j', '-', '-', '$'));
        } else {
            let variable: Variable = this.arithmeticExp();
            boolexp.codeBegin = this.fourthList.nextIndex();
            if (variable.isTrue()) {
                boolexp.TRUE = this.fourthList.nextIndex();
                boolexp.FALSE = 0;
            } else {
                boolexp.FALSE = this.fourthList.nextIndex();
                boolexp.TRUE = 0;
            }
            next = this.tokenList.nextIs().type;
            if (next >= 53 && next <= 58) {
                this.move();
                let variable2: Variable = this.arithmeticExp();
                boolexp.codeBegin = boolexp.TRUE = this.fourthList.nextIndex();
                boolexp.FALSE = this.fourthList.nextIndex() + 1;
                this.fourthList.push(new FourStatement('j' + this.dfa.KEYWORDS[next], variable.name, variable2.name, '$'));
                this.fourthList.push(new FourStatement('j', '-', '-', '$'));
            } else {
                this.fourthList.push(new FourStatement('j', '-', '-', '$'));
            }
        }
        return boolexp;
    }
}
