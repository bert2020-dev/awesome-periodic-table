import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { loadManifest } from './data-pipeline.mjs';

const HERE=path.dirname(fileURLToPath(import.meta.url));
const ROOT=path.resolve(HERE,'..');

export function createSearchContext(){
  const VERSION=fs.readFileSync(path.join(ROOT,'VERSION'),'utf8').trim();
  execFileSync(process.execPath,[path.join(HERE,'build.mjs'),'--mode=plain'],{stdio:'inherit'});
  const built=fs.readFileSync(path.join(ROOT,'dist','plain','awesome-periodic-table.html'),'utf8');
  const scripts=[...built.matchAll(/<script>([\s\S]*?)<\/script>/gi)].map(m=>m[1]);
  const appScript=scripts.find(s=>s.includes(';(async()=>{')&&s.includes('class PropertyCatalog'));
  if(!appScript)throw new Error('Could not locate inlined application script.');
  let parserCode=appScript.slice(appScript.indexOf(';(async()=>{')+';(async()=>{'.length);
  const domMarker=parserCode.indexOf('const table=document.getElementById');
  parserCode=parserCode.slice(0,domMarker);
  const helperStart=appScript.indexOf('function escapeHtml');
  const helperEnd=appScript.indexOf('function showDetails');
  const pureDetailHelpers=appScript.slice(helperStart,helperEnd);
  const manifest=loadManifest(ROOT,VERSION);
  const inject=`const __APT_manifest=${JSON.stringify(manifest)};\nconst APP_VERSION=__APT_manifest.version;\nconst {elements,CAT,TOX,E_SOURCES,DISCOVERY_COUNTRY,DISCOVERY_SOURCE,EXTRA_CONDUCTIVITY,EXTRA_HEAT,THERMAL_CONDUCTIVITY,ELECTRICAL_TYPE,EXTRA_ISOTOPES,EXTRA_ISOTOPE_ABUNDANCE,IONIZATION_ENERGIES,EXTRA_ABUNDANCE}=__APT_manifest;\n`;
  parserCode=parserCode.replace(/const __APT_manifest=await window\.__APT_DATA_READY__;\s*const APP_VERSION=__APT_manifest\.version;\s*const \{[^}]+\}=__APT_manifest;\s*/,'');
  parserCode=inject+parserCode;
  const ctx={console,requestAnimationFrame:fn=>fn(),setTimeout,clearTimeout,window:{},document:{}};
  vm.createContext(ctx);
  vm.runInContext(parserCode,ctx);
  vm.runInContext(pureDetailHelpers,ctx);
  return {ctx,manifest,root:ROOT,version:VERSION};
}
