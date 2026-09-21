import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const HERE=path.dirname(fileURLToPath(import.meta.url)),ROOT=path.resolve(HERE,'..');
function py(){
  if(process.env.PYTHON) return [process.env.PYTHON,[]];
  if(process.platform==='win32') return ['py',['-3']];
  return ['python3',[]];
}
const [python,prefix]=py();
execFileSync(process.execPath,[path.join(HERE,'build.mjs'),'--mode=plain'],{cwd:ROOT,stdio:'inherit'});
execFileSync(process.execPath,[path.join(HERE,'build.mjs'),'--mode=arcager'],{cwd:ROOT,stdio:'inherit'});
const plain=path.join(ROOT,'dist','plain','awesome-periodic-table.html');
const packed=path.join(ROOT,'dist','arcager','awesome-periodic-table.html');
const unpacked=path.join(ROOT,'dist','arcager','__test_unpacked.html');
try{fs.rmSync(unpacked,{force:true});}catch{}
const r=spawnSync(python,[...prefix,path.join(ROOT,'vendor','Arcager','arcager.py'),'-u','-f',packed],{cwd:path.dirname(packed),encoding:'utf8'});
if(r.status!==0)throw new Error(`Arcager unpack failed:\n${r.stdout}\n${r.stderr}`);
// Arcager chooses unpacked_<name>.html; rename it to a deterministic test path.
const defaultUnpacked=path.join(path.dirname(packed),'unpacked_awesome-periodic-table.html');
if(!fs.existsSync(defaultUnpacked))throw new Error('Arcager did not emit its unpacked HTML.');
fs.renameSync(defaultUnpacked,unpacked);
const h=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const unpackedText=fs.readFileSync(unpacked,'utf8');
if(!unpackedText.includes('data-key="elements"')||!unpackedText.includes('data-key="element-extra"')||!unpackedText.includes('data-key="lookups"'))throw new Error('Arcager merge did not inline all three CSV resources.');
const packedText=fs.readFileSync(packed,'utf8');
if(!packedText.includes('DecompressionStream'))throw new Error('Arcager browser decompressor missing.');
if(!packedText.includes('function waitFor(name,opts)'))throw new Error('Arcager 3.2.3 resource readiness API missing.');
if(!packedText.includes('resources:resources'))throw new Error('Arcager resource status surface missing.');
if(/<script[^>]+\bsrc=/i.test(unpackedText)||/<link[^>]+\bhref=/i.test(unpackedText)||/<style[^>]+\bsrc=/i.test(unpackedText))throw new Error('Unpacked Arcager artifact still contains external runtime assets.');
const bytes=fs.statSync(packed).size;
const sourceBytes=fs.statSync(plain).size;
console.log(`Arcager standalone test passed: ${bytes} bytes packed, ${sourceBytes} bytes source, ${(bytes/sourceBytes*100).toFixed(1)}% of source.`);
fs.rmSync(unpacked,{force:true});
