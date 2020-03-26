export class Variable {
    public name: string = '';
    public type: string = '';
    public value: string = '';
    public numberVal: number = 0;
    public boolVal: boolean = false;

    constructor(name: string, type: string, value?: string) {
        this.name = name;
        this.type = type;
        this.value = value ? value : '';
        if (value !== undefined) {
            this.parseValue();
        }
    }

    public parseValue() {
        if (this.type == 'integer') {
            this.numberVal = Number(this.value);
        } else if (this.type === 'bool') {
            if (this.value === 'true') {
                this.boolVal = true;
            } else if (this.value === 'false') {
                this.boolVal = false;
            }
        }
    }

    public setValue(val: string) {
        this.value = val;
        this.parseValue();
    }

    public print() {
        return `(${this.name}:${this.type}, ${this.value})`;
    }

    public isTrue() {
        if (this.value === '' || this.numberVal == 0 || this.boolVal == false) {
            return false;
        } else {
            return true;
        }
    }
}

export class VariableList {
    private list: Map<string, Variable> = new Map<string, Variable>();
    private untypedList: string[] = [];
    private definedList: string[] = [];

    public defineVariable(name: string): boolean {
        if (this.untypedList.includes(name) || this.definedList.includes(name)) {
            return false;
        }
        this.untypedList.push(name);
        return true;
    }

    public defineType(type: string) {
        this.untypedList.forEach(name => {
            this.list.set(name, new Variable(name, type));
            this.definedList.push(name);
        });
        this.untypedList = [];
    }

    public push(name: string, type: string, value: string) {
        if (!this.list.has(name)) {
            this.list.set(name, new Variable(name, type, value));
            this.definedList.push(name);
        }
    }

    public setValue(name: string, val: string) {
        const element = this.list.get(name);
        if (element) {
            element.setValue(val);
            this.list.set(name, element);
        }
    }

    public includes(name: string) {
        return this.list.has(name);
    }

    public checkType(name: string, type: string) {
        const element = this.list.get(name);
        if (element) {
            return element.type === type;
        }
        return false;
    }

    public getVariable(name: string) {
        const element = this.list.get(name);
        if (element) {
            return element;
        }
    }

    public print() {
        this.list.forEach(element => {
            console.log(element.print());
        });
    }
}
