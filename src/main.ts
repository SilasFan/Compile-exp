import analyzer_exp1 from './wordAnalyze/word_main';
import analyzer_exp2 from './semanticAnalyze/Analizer_main';

console.log('----------\n姓名: 范滔\n班级: 计科一班\n学号: 201730613038\n----------\n');

const FILE_1 = 'b.sample';
const FILE_2 = 'c.sample';

analyzer_exp1(FILE_1);

analyzer_exp2(FILE_2);
