import vm from 'node:vm';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadManifest, manifestToPipe } from './data-pipeline.mjs';
import { PIPE_RUNTIME } from './pipe-runtime.mjs';
const HERE=path.dirname(fileURLToPath(import.meta.url)),ROOT=path.resolve(HERE,'..');
const version=fs.readFileSync(path.join(ROOT,'VERSION'),'utf8').trim();
const source=loadManifest(ROOT,version),pipe=manifestToPipe(source);
const ctx={};vm.createContext(ctx);vm.runInContext(`${PIPE_RUNTIME};globalThis.result=__APT_decodePipe(${JSON.stringify(pipe)});`,ctx);
const r=ctx.result;
if(r.version!==version)throw new Error(`Version mismatch: ${r.version}`);
if(r.elements.length!==source.elements.length)throw new Error('Element count mismatch');
if(r.extras.length!==source.extras.length)throw new Error('Extra-data count mismatch');
if(r.lookups.length!==source.lookups.length)throw new Error('Lookup count mismatch');
for(const z of [1,26,79,118]){const a=source.elements[z-1],b=r.elements.find(e=>e.z===z);if(!b||a.name!==b.name||a.sym!==b.sym||a.melt!==b.melt||a.discoveryCountry!==b.discoveryCountry)throw new Error(`Round-trip mismatch at Z=${z}`)}
console.log(`Pipe round-trip passed: ${r.elements.length} elements, ${r.extras.length} extra rows, ${r.lookups.length} lookups`);
