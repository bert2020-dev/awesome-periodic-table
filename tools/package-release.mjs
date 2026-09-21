import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const HERE=path.dirname(fileURLToPath(import.meta.url));
const ROOT=path.resolve(HERE,'..');
const VERSION=fs.readFileSync(path.join(ROOT,'VERSION'),'utf8').trim();
const zipPath=path.resolve(ROOT,'..',`awesome-periodic-table-${VERSION}-builder.zip`);
const dist=path.join(ROOT,'dist');
const required=[path.join(dist,'plain','awesome-periodic-table.html'),path.join(dist,'arcager','awesome-periodic-table.html')];
for(const p of required){
  if(!fs.existsSync(p)) throw new Error(`Required release artifact missing: ${p}`);
  if(fs.statSync(p).size<10000) throw new Error(`Release artifact suspiciously small: ${p}`);
}
fs.rmSync(path.join(dist,'mock'),{recursive:true,force:true});
fs.rmSync(path.join(dist,'.staging'),{recursive:true,force:true});
const parent=path.dirname(ROOT);
const base=`awesome-periodic-table-${VERSION}-builder`;
const stagingRoot=path.join(parent,`.${base}.package-stage`);
fs.rmSync(stagingRoot,{recursive:true,force:true});
fs.cpSync(ROOT,stagingRoot,{recursive:true});
fs.rmSync(path.join(stagingRoot,'dist','mock'),{recursive:true,force:true});
fs.rmSync(path.join(stagingRoot,'dist','.staging'),{recursive:true,force:true});
const packageRoot=path.join(parent,base);
fs.rmSync(packageRoot,{recursive:true,force:true});
fs.renameSync(stagingRoot,packageRoot);
fs.rmSync(zipPath,{force:true});
execFileSync('zip',['-r','-q',zipPath,base],{cwd:parent,stdio:'inherit'});
fs.rmSync(packageRoot,{recursive:true,force:true});
execFileSync('unzip',['-t',zipPath],{stdio:'ignore'});
const listing=execFileSync('unzip',['-Z1',zipPath],{encoding:'utf8'}).split(/\r?\n/).filter(Boolean);
const prefix=base+'/';
for(const suffix of ['dist/plain/awesome-periodic-table.html','dist/arcager/awesome-periodic-table.html']){
  if(!listing.includes(prefix+suffix)) throw new Error(`Missing packaged dist artifact: ${suffix}`);
}
if(listing.some(n=>n.startsWith(prefix+'dist/mock/')||n.startsWith(prefix+'dist/.staging/'))){
  throw new Error('Test-only dist artifacts were packaged');
}
console.log(`Packaged ${zipPath}`);
console.log(`Entries: ${listing.length}`);
console.log('ZIP integrity check passed');

console.log(`Release package ready: ${zipPath}`);
