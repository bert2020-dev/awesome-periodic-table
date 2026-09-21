import fs from 'node:fs';
import path from 'node:path';
import { createSearchContext } from './search-harness.mjs';
const {ctx,root}=createSearchContext();
const tests=JSON.parse(fs.readFileSync(path.join(root,'tests','regression-120.json'),'utf8'));
let fail=0;
for(const [i,t] of tests.entries()){
  const actual=ctx.applyFilter(t.query,25).length;
  const ok=actual===t.expected;
  if(!ok){fail++;console.log(`FAIL ${i+1}: ${t.query} -> ${actual}, expected ${t.expected}`);}
}
console.log(`${tests.length-fail}/${tests.length} tests passed`);
if(fail)process.exit(1);
