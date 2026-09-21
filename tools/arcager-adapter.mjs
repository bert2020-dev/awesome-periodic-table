import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

function pythonCandidates(){
  if(process.env.PYTHON)return [[process.env.PYTHON,[]]];
  if(process.platform==='win32')return [['py',['-3']],['python',[]],['python3',[]]];
  return [['python3',[]],['python',[]]];
}
function detectArcagerVersion(script){
  const r=runPython(script,['--version']);
  const m=String(r.stdout||'').match(/arcager\s+(\d+\.\d+\.\d+)/i);
  if(!m)throw new Error('Unable to determine Arcager version.');
  return m[1];
}
function runPython(script,args){
  for(const [exe,prefix] of pythonCandidates()){
    const r=spawnSync(exe,[...prefix,script,...args],{encoding:'utf8',stdio:['ignore','pipe','pipe']});
    if(!r.error&&r.status===0)return r;
    if(r.error?.code==='ENOENT')continue;
    throw new Error(`Arcager failed using ${exe}.\n${r.stderr?.trim()||`exit status ${r.status}`}`);
  }
  throw new Error('Python 3 was not found. Arcager is a Python 3.8+ build-time tool. Set PYTHON or install Python 3.');
}
function compressionMode(requestedInput=null){
  const requested=String(requestedInput||process.env.BUILD_COMPRESSION||'gzip').toLowerCase();
  if(!['gzip','brotli'].includes(requested))throw new Error(`Unknown compression ${requested}; use gzip or brotli.`);
  return requested;
}
export async function pack({context}){
  const root=context.root,inputDir=context.inputDir,outputHtml=context.outputHtml;
  if(!inputDir||!fs.existsSync(path.join(inputDir,'index.html')))throw new Error(`Arcager merge directory is missing index.html: ${inputDir}`);
  const arcager=path.join(root,'vendor','Arcager','arcager.py');
  if(!fs.existsSync(arcager))throw new Error(`Arcager runtime not found at ${arcager}. Run npm run setup:arcager.`);
  fs.mkdirSync(path.dirname(outputHtml),{recursive:true});
  const compression=compressionMode(context.compression);
  const args=['--force','--merge',inputDir,'--output',outputHtml];
  if(compression==='brotli')args.push('--brotli');
  const version=detectArcagerVersion(arcager);
  const r=runPython(arcager,args);
  const outputBytes=fs.statSync(outputHtml).size;
  const inputBytes=walkBytes(inputDir);
  return {runtime:'',bootstrap:'',stats:{arcagerVersion:version,requiredArcagerApi:'3.2.3-readiness',compression,inputBytes,outputBytes,ratio:outputBytes/Math.max(1,inputBytes),standalone:true,runtimeDependencies:0,csvBundled:true,merge:true,command:args,stdout:r.stdout?.trim()||''}};
}
function walkBytes(dir){let total=0;for(const ent of fs.readdirSync(dir,{withFileTypes:true})){const p=path.join(dir,ent.name);if(ent.isDirectory())total+=walkBytes(p);else total+=fs.statSync(p).size;}return total;}
