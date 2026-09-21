import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { loadManifest, manifestToPipe } from './data-pipeline.mjs';
import { PIPE_RUNTIME } from './pipe-runtime.mjs';

const HERE=path.dirname(fileURLToPath(import.meta.url));
const ROOT=path.resolve(HERE,'..');
const SRC=path.join(ROOT,'src');
const DIST=path.join(ROOT,'dist');
const VERSION=fs.readFileSync(path.join(ROOT,'VERSION'),'utf8').trim();
function arg(name,fallback=null){const flag=`--${name}`;const exact=process.argv.find(a=>a.startsWith(flag+'='));if(exact)return exact.slice(flag.length+1)||fallback;const i=process.argv.indexOf(flag);return i>=0?(process.argv[i+1]??fallback):fallback;}
const mode=arg('mode',process.env.BUILD_MODE||'plain');
const adapterMode=arg('adapter','real');
const compression=arg('compression',process.env.BUILD_COMPRESSION||'gzip');
const manifest=loadManifest(ROOT,VERSION);
const pipePayload=manifestToPipe(manifest);
const js=v=>JSON.stringify(v).replace(/\u2028/g,'\\u2028').replace(/\u2029/g,'\\u2029');
const CSS=fs.readFileSync(path.join(SRC,'css','app.css'),'utf8');
const AUTOCOMPLETE=fs.readFileSync(path.join(SRC,'js','autocomplete-engine.js'),'utf8');
const APP=fs.readFileSync(path.join(SRC,'js','app.js'),'utf8');
const SOURCE_HTML=fs.readFileSync(path.join(SRC,'index.html'),'utf8');

function plainBootstrap(){
  return `${PIPE_RUNTIME}\nwindow.__APT_DATA_READY__=Promise.resolve(__APT_decodePipe(${js(pipePayload)}));\n`;
}
function sourceTemplate(){return SOURCE_HTML.replaceAll('__APP_VERSION__',VERSION);}
function plainHtml(){
  let html=sourceTemplate();
  html=html.replace('<link rel="stylesheet" href="css/app.css">',`<style>
${CSS}
</style>`);
  html=html.replace(/<link rel="csv" href="[^"]+">\n?/g,'');
  html=html.replace('<script src="js/data-bootstrap.js"></script>',`<script>
${plainBootstrap()}
</script>`);
  html=html.replace('<script src="js/autocomplete-engine.js"></script>',`<script>
${AUTOCOMPLETE}
</script>`);
  html=html.replace('<script src="js/app.js"></script>',`<script>
${APP}
</script>`);
  return html;
}
async function buildPlain(){
  const html=plainHtml();
  const outDir=path.join(DIST,'plain');fs.mkdirSync(outDir,{recursive:true});
  const out=path.join(outDir,'awesome-periodic-table.html');fs.writeFileSync(out,html,'utf8');
  return {out,mode:'plain',bytes:Buffer.byteLength(html)};
}
function copyDir(srcDir,dstDir){fs.rmSync(dstDir,{recursive:true,force:true});fs.cpSync(srcDir,dstDir,{recursive:true});}
async function buildArcager(){
  const adapterName=adapterMode==='mock'?'arcager-adapter.mock.mjs':'arcager-adapter.mjs';
  const adapterPath=path.join(ROOT,'tools',adapterName);
  const adapter=await import(pathToFileURL(adapterPath).href);
  const stagingDir=path.join(ROOT,'dist','.staging','site');
  copyDir(SRC,stagingDir);
  copyDir(path.join(ROOT,'data'),path.join(stagingDir,'data'));
  // Version is the only generated source token. CSV and source JS remain
  // separate so Arcager --merge can inline them as first-class resources.
  const idx=path.join(stagingDir,'index.html');
  fs.writeFileSync(idx,fs.readFileSync(idx,'utf8').replaceAll('__APP_VERSION__',VERSION),'utf8');
  const bootstrapPath=path.join(stagingDir,'js','data-bootstrap.js');
  fs.writeFileSync(bootstrapPath,fs.readFileSync(bootstrapPath,'utf8').replaceAll('__APP_VERSION__',VERSION),'utf8');
  const compressionDir=adapterMode==='mock'?'mock':(compression==='brotli'?'arcager-brotli':'arcager');
  const outDir=path.join(DIST,compressionDir);fs.mkdirSync(outDir,{recursive:true});
  const out=path.join(outDir,'awesome-periodic-table.html');
  const packed=await adapter.pack({manifest,pipePayload,context:{root:ROOT,version:VERSION,mode:'arcager',adapterMode,inputDir:stagingDir,outputHtml:out,compression}});
  if(!packed||typeof packed.stats!=='object')throw new Error('Arcager adapter did not return build statistics.');
  if(adapterMode==='mock'){
    // Mock remains a contract-test-only artifact; release builds use real Arcager.
    if(typeof packed.runtime!=='string'||typeof packed.bootstrap!=='string')throw new Error('Mock adapter must return runtime/bootstrap.');
    let mockHtml=sourceTemplate();
    mockHtml=mockHtml.replace('<link rel="stylesheet" href="css/app.css">',`<style>\n${CSS}\n</style>`);
    mockHtml=mockHtml.replace(/<link rel="csv" href="[^"]+">\n?/g,'');
    mockHtml=mockHtml.replace('<script src="js/data-bootstrap.js"></script>',`<script>\n${packed.runtime}\n${packed.bootstrap}\n</script>`);
    mockHtml=mockHtml.replace('<script src="js/app.js"></script>',`<script>\n${APP}\n</script>`);
    fs.writeFileSync(out,mockHtml,'utf8');
  }
  try{fs.rmSync(path.join(ROOT,'dist','.staging'),{recursive:true,force:true});}catch{}
  return {out,mode:'arcager',adapterMode,bytes:fs.statSync(out).size,stats:packed.stats,pipeBytes:Buffer.byteLength(pipePayload)};
}

const result=mode==='plain'?await buildPlain():mode==='arcager'?await buildArcager():(()=>{throw new Error(`Unknown build mode: ${mode}`)})();
console.log(`Built ${result.out}`);console.log(`Version ${VERSION}; mode: ${result.mode}; bytes: ${result.bytes}`);if(result.stats)console.log(JSON.stringify(result.stats,null,2));
