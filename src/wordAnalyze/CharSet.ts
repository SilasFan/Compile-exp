let fs = require('fs');

interface CharArr {
    [char: string]: number;
}

interface CharSet {
    [type: string]: CharArr;
}

function GenCharSet(path: string): CharSet {
    const lines: string[] = fs
        .readFileSync(path)
        .toString('UTF-8')
        .split(/\r\n/);

    let charset: CharSet = {};

    lines.map(val => {
        const letters = val.split(' ').filter(val => val != ' ');
        let type: string | undefined = letters.pop();

        // add type
        if (type) {
            charset[type] = {};
        }

        // add chars
        letters.map((val, index) => {
            if (type) {
                charset[type][val] = index + 1;
            }
        });
    });

    return charset;
}

export { CharArr, CharSet, GenCharSet };
