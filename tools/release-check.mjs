import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const HERE=path.dirname(fileURLToPath(import.meta.url)),ROOT=path.resolve(HERE,'..');
for(const name of ['check-source.mjs','test-pipe.mjs','test-search.mjs','test-build.mjs','test-arcager.mjs']){
  execFileSync(process.execPath,[path.join(HERE,name)],{cwd:ROOT,stdio:'inherit'});
}
const outputs=[path.join(ROOT,'dist','plain','awesome-periodic-table.html'),path.join(ROOT,'dist','arcager','awesome-periodic-table.html')];
for(const out of outputs){
  if(!fs.existsSync(out)) throw new Error(`Release artifact missing: ${out}`);
  if(fs.statSync(out).size<10000) throw new Error(`Release artifact suspiciously small: ${out}`);
}
console.log(`Release check passed: ${outputs.join(' and ')}`);
