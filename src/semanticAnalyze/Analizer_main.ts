let fs = require('fs');
import DFA from '../wordAnalyze/DFA_Analyze';
import Analizer from './Analizer';

// 关键字文件路径
const PATH = './test_samples/charset';
const KEYWORD = './test_samples/keywordlist';

let dfa = new DFA(PATH);
dfa.DFAGen();
const analyzer = new Analizer(dfa);

// Generate keywordlist
const keywords: string = fs.readFileSync(KEYWORD).toString('UTF-8');
const keywordline: string[] = keywords.split(/\r\n/);
keywordline.map((val, index) => {
    const wordsInLine = val.split(' ');
    dfa.keywordGen(wordsInLine, index > 0 ? 39 : 1);
});

export default function(fileName: string) {
    // target file path
    const TARGET_FILE = './test_samples/';

    // Process target file
    const data: string = fs.readFileSync(TARGET_FILE + fileName).toString('UTF-8');
    const lines: string[] = data.split(/\r\n/).filter(val => val != '');

    lines.map((val, index) => {
        dfa.DFA_Match_Line(val, index + 1).forEach(element => {
            analyzer.tokenList.push(element);
        });
    });

    console.log('实验二:\n\n');
    analyzer.satrtAnalyze();
    console.log('\n\n');
}
