import DFA from './DFA_Analyze';
let fs = require('fs');

export default function(fileName: string) {
    const PATH = './test_samples/charset';
    const KEYWORD = './test_samples/keywordlist';
    const TARGET_DIRECTORY = './test_samples/';

    // Generate DFA
    let dfa = new DFA(PATH);
    dfa.DFAGen();
    const keywords: string = fs.readFileSync(KEYWORD).toString('UTF-8');
    const keywordline: string[] = keywords.split(/\r\n/);
    keywordline.map((val, index) => {
        const wordsInLine = val.split(' ');
        dfa.keywordGen(wordsInLine, index > 0 ? 39 : 1);
    });

    // Process target file
    const data: string = fs.readFileSync(TARGET_DIRECTORY + fileName).toString('UTF-8');
    const lines: string[] = data.split(/\r\n/).filter(val => val != '');

    console.log('实验一:\n');
    lines.map((val, index) => {
        try {
            console.log(
                dfa
                    .DFA_Match_Line(val, index + 1)
                    .map(obj => `(${obj.type},${obj.id})`)
                    .join(' '),
            );
        } catch (e) {
            console.log(e.message);
        }
    });
    console.log('\n\n');
}
