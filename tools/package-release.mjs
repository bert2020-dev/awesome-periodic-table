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

let listing;
if(process.platform==='win32'){
  // Use Windows PowerShell/.NET so Windows users do not need Unix zip/unzip utilities.
  const script=`
    $ErrorActionPreference = 'Stop'
    Compress-Archive -LiteralPath $env:APT_PACKAGE_ROOT -DestinationPath $env:APT_ZIP_PATH -Force
    Add-Type -AssemblyName System.IO.Compression.FileSystem
    $archive = [System.IO.Compression.ZipFile]::OpenRead($env:APT_ZIP_PATH)
    try {
      foreach ($entry in $archive.Entries) {
        $stream = $entry.Open()
        try { $stream.CopyTo([System.IO.Stream]::Null) } finally { $stream.Dispose() }
      }
      @($archive.Entries | ForEach-Object { $_.FullName }) | ConvertTo-Json -Compress
    } finally { $archive.Dispose() }
  `;
  const output=execFileSync('powershell.exe',['-NoProfile','-NonInteractive','-Command',script],{
    cwd:parent,
    encoding:'utf8',
    env:{...process.env,APT_PACKAGE_ROOT:base,APT_ZIP_PATH:zipPath}
  }).trim();
  const parsed=JSON.parse(output);
  listing=Array.isArray(parsed)?parsed:[parsed];
}else{
  execFileSync('zip',['-r','-q',zipPath,base],{cwd:parent,stdio:'inherit'});
  execFileSync('unzip',['-t',zipPath],{stdio:'ignore'});
  listing=execFileSync('unzip',['-Z1',zipPath],{encoding:'utf8'}).split(/\\r?\\n/).filter(Boolean);
}
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
