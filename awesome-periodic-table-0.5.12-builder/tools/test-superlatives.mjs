import fs from 'node:fs';
import path from 'node:path';
import { createSearchContext } from './search-harness.mjs';

const {ctx,root}=createSearchContext();
const tests=[
  ['most abundant in human body',1,'Oxygen'],
  ['most abundant in the human body',1,'Oxygen'],
  ['least abundant in human body',1,'Technetium'],
  ['most common in humans',1,'Oxygen'],
  ['least common in humans',1,'Technetium'],
  ['most abundant in universe',1,'Hydrogen'],
  ['least abundant in universe',1,'Tantalum'],
  ['most abundant in ocean',1,'Oxygen'],
  ['least abundant in ocean',1,'Silicon'],
  ['most abundant in crust',1,'Oxygen'],
  ['least abundant in crust',1,'Xenon'],
  ['least dense in universe',1,'Hydrogen'],
  ['most dense in universe',1,'Osmium']
];
let fail=0;
for(const [query,expectedCount,expectedName] of tests){
  const r=ctx.applyFilter(query,25);
  if(r.length!==expectedCount||r[0]?.name!==expectedName){
    fail++;
    console.log(`FAIL ${query} -> ${r.length} / ${r[0]?.name||'none'}, expected ${expectedCount} / ${expectedName}`);
  }
}
console.log(`${tests.length-fail}/${tests.length} environment-qualified superlative tests passed.`);
if(fail)process.exit(1);
