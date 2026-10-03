import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const HERE=path.dirname(fileURLToPath(import.meta.url)),ROOT=path.resolve(HERE,'..');
const target=path.join(ROOT,'vendor','Arcager');
const url='https://github.com/bert2020-dev/Arcager.git';
// Arcager has no tagged releases (confirmed via `git ls-remote --tags`, which
// returns nothing) -- its only version marker is the VERSION string inside
// arcager.py itself. Default to the main branch, which always resolves;
// ARCAGER_REF can still pin to a specific commit SHA if reproducing an exact
// historical build matters.
const ref=process.env.ARCAGER_REF||'main';
fs.mkdirSync(path.dirname(target),{recursive:true});
if(fs.existsSync(path.join(target,'arcager.py'))){
  console.log(`Arcager is already available at ${target}`);
  process.exit(0);
}
try{
  if(fs.existsSync(path.join(ROOT,'.git'))){
    execFileSync('git',['submodule','update','--init','--recursive','vendor/Arcager'],{cwd:ROOT,stdio:'inherit'});
  }else{
    execFileSync('git',['clone','--depth','1','--branch',ref,url,target],{cwd:ROOT,stdio:'inherit'});
  }
}catch(err){
  console.error('Arcager setup failed. The release builder requires vendor/Arcager/arcager.py.');
  process.exit(typeof err?.status==='number'?err.status:1);
}
