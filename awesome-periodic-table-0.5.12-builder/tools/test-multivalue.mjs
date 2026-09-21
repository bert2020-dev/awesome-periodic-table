import fs from 'node:fs';
import path from 'node:path';
import { createSearchContext } from './search-harness.mjs';
const {ctx,manifest,root}=createSearchContext();
const tests=JSON.parse(fs.readFileSync(path.join(root,'tests','regression-multivalue.json'),'utf8'));
let fail=0;
for(const [i,t] of tests.entries()){
  const actual=ctx.applyFilter(t.query,25).length;
  if(actual!==t.expected){fail++;console.log(`FAIL ${i+1}: ${t.query} -> ${actual}, expected ${t.expected}`);}
}
const abundanceSample=manifest.elements.find(e=>e.z===1);
const ionizationSample=manifest.elements.find(e=>e.z===26);
const isotopeSample=manifest.elements.find(e=>e.z===26);
const checks=[
  ['abundanceDistributionTable',ctx.abundanceDistributionTable(abundanceSample),['abundance:crust','abundance:ocean','abundance:universe','abundance:humans']],
  ['ionizationTable',ctx.ionizationTable(ionizationSample),['ionization:1','ionization:2']],
  ['isotopeTable',ctx.isotopeTable(isotopeSample),['stableIsotope']]
];
for(const [name,html,needles] of checks){
  for(const needle of needles){if(!String(html).includes(`data-prop="${needle}"`)){fail++;console.log(`FAIL UI ${name}: missing ${needle}`);}}
  if(!String(html).includes('quick-table-trigger')){fail++;console.log(`FAIL UI ${name}: missing quick-table trigger`);}
  if(!String(html).includes('<table>')){fail++;console.log(`FAIL UI ${name}: missing table markup`);}
}
const ionHtml=ctx.ionizationTable(ionizationSample);
const ionRows=(ionHtml.match(/data-prop="ionization:/g)||[]).length;
const ionStageCount=ctx.getIonizations(ionizationSample.z).length;
if(ionRows!==ionStageCount+1){
  fail++;console.log(`FAIL UI ionizationTable: expected ${ionStageCount} table stages + 1 inline clickable value, found ${ionRows} targets`);
}
if(!/, \.\.\./.test(ionHtml)){fail++;console.log('FAIL UI ionizationTable: compact summary should use ", ..."');}
const compactAbundance=ctx.abundanceDistributionTable(abundanceSample);
if((compactAbundance.match(/data-prop="abundance:/g)||[]).length<5){
  fail++;console.log('FAIL UI abundanceDistributionTable: expected clickable first inline value plus four table values');
}
if(!/, \.\.\./.test(compactAbundance)){fail++;console.log('FAIL UI abundanceDistributionTable: compact summary should use ", ..."');}
const compactIsotopes=ctx.isotopeTable(isotopeSample);
if(!/, \.\.\./.test(compactIsotopes)){fail++;console.log('FAIL UI isotopeTable: compact summary should use ", ..." when multiple isotopes exist');}
const css=fs.readFileSync(path.join(root,'src','css','app.css'),'utf8');
if(!/\.quick-table-portal\s*\{[^}]*position:fixed/s.test(css)){fail++;console.log('FAIL UI quick-table: expected viewport-positioned popup portal');}
console.log(`${tests.length-fail}/${tests.length} multivalue search tests passed; popup rendering + click-target checks included.`);
if(fail)process.exit(1);
