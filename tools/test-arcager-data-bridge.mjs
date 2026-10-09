import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const HERE=path.dirname(fileURLToPath(import.meta.url));
const ROOT=path.resolve(HERE,'..');
const packed=path.join(ROOT,'dist','arcager','awesome-periodic-table.html');
execFileSync('python3',[path.join(ROOT,'vendor','Arcager','arcager.py'),'-u','-f',packed],{cwd:path.dirname(packed),stdio:'ignore'});
const defaultUnpacked=path.join(path.dirname(packed),'unpacked_awesome-periodic-table.html');
if(!fs.existsSync(defaultUnpacked))throw new Error('Arcager did not create unpacked HTML.');
const html=fs.readFileSync(defaultUnpacked,'utf8');
fs.rmSync(defaultUnpacked,{force:true});

function parseCsvForTest(text,delim=','){
  text=String(text??'').replace(/^\uFEFF/,'');
  const rows=[];let row=[],field='',inQ=false;
  const flush=()=>{if(row.length||field.length){row.push(field);rows.push(row);}row=[];field='';};
  for(let i=0;i<text.length;i++){
    const c=text[i];
    if(inQ){if(c==='"'){if(text[i+1]==='"'){field+='"';i++;}else inQ=false;}else field+=c;}
    else if(c==='"')inQ=true;
    else if(c===delim){row.push(field);field='';}
    else if(c==='\n')flush();
    else if(c==='\r'){if(text[i+1]==='\n')i++;flush();}
    else field+=c;
  }
  flush();
  return rows;
}
const blocks=[...html.matchAll(/<script[^>]+type=["']text\/csv["'][^>]*data-key=["']([^"']+)["'][^>]*>([\s\S]*?)<\/script>/gi)]
  .map(m=>({key:m[1],text:m[2]}));
if(blocks.length!==3)throw new Error(`Expected 3 CSV blocks, got ${blocks.length}`);
const data={};
for(const b of blocks){const rows=parseCsvForTest(b.text);data[b.key]={rows};}
for(const k of ['elements','element-extra','lookups']){
  if(!data[k]||data[k].rows.length<2)throw new Error(`Missing/empty CSV ${k}`);
}
if(data.elements.rows[0][0]!=='z'||data.elements.rows[0][1]!=='sym')throw new Error('Elements header did not parse correctly.');
if(data.elements.rows[1][0]!=='1'||data.elements.rows[1][1]!=='H')throw new Error('Hydrogen row did not parse correctly.');

const bridge=fs.readFileSync(path.join(ROOT,'src/js','data-bootstrap.js'),'utf8');
class El{constructor(text='',attrs={}){this.textContent=text;this.attrs=attrs;}getAttribute(k){return this.attrs[k]??null;}}
const csvEls=blocks.map(b=>new El(b.text,{'data-key':b.key,'data-delim':','}));

/* Runs data-bootstrap.js against a fake `window` modelling one Arcager runtime behaviour. */
async function runScenario(name,{arcager,domBlocks}){
  const ctx={console:{...console,warn(){},error(){}},Number,String,Map,Set,Promise,Uint8Array,
    document:{querySelectorAll(sel){return sel==='script[type="text/csv"]'?(domBlocks?csvEls:[]):[];}},arcager};
  ctx.window=ctx;
  vm.createContext(ctx);
  vm.runInContext(bridge,ctx,{filename:'data-bootstrap.js'});
  const manifest=await ctx.__APT_DATA_READY__;
  if(manifest.elements.length!==118)throw new Error(`[${name}] element count ${manifest.elements.length} != 118`);
  const h=manifest.elements[0];
  if(h.z!==1||h.sym!=='H'||h.name!=='Hydrogen')throw new Error(`[${name}] first element invalid: ${JSON.stringify(h)}`);
  if(!manifest.EXTRA_ABUNDANCE[8]?.humans)throw new Error(`[${name}] human abundance missing after bridge parse.`);
  if(!('solar' in manifest.EXTRA_ABUNDANCE[1])||!('meteorite' in manifest.EXTRA_ABUNDANCE[1]))throw new Error(`[${name}] solar/meteorite abundance dimensions missing.`);
  return ctx;
}

// A. Genuine Arcager 4.0.0: `ready` resolves after the CSV is parsed and arcager.csv is
//    fully populated. The DOM is deliberately empty, so this only passes if the app
//    actually consumes Arcager's own public API (the primary path).
const populated={};
for(const b of blocks){
  const rows=parseCsvForTest(b.text);
  populated[b.key]={rows,data:rows.slice(1).map(r=>Object.fromEntries(rows[0].map((h,i)=>[h,r[i]??''])))};
}
await runScenario('arcager 4.0.0 primary path',{arcager:{ready:Promise.resolve({csv:populated}),state:'ready',loaded:true,error:null,csv:populated},domBlocks:false});

// B. Legacy Arcager 3.2.0 behaviour: `ready` resolves but arcager.csv is empty. The app must
//    fall back to parsing the committed <script type="text/csv"> blocks and publish them back.
const legacy=await runScenario('legacy 3.2.0 empty csv map',{arcager:{ready:Promise.resolve(),csv:{}},domBlocks:true});
if(!legacy.arcager.csv.elements)throw new Error('[legacy] fallback did not publish parsed CSV back to window.arcager.csv.');

// C. Arcager >= 3.x failure mode: `ready` rejects (e.g. no DecompressionStream). The app must
//    record the error and still fall back to the DOM blocks rather than hanging or throwing.
const failed=await runScenario('ready rejects (state=error)',{arcager:{ready:Promise.reject(new Error('DecompressionStream unsupported')),state:'error',loaded:false,error:new Error('DecompressionStream unsupported'),csv:{}},domBlocks:true});
if(!failed.__APT_ARCAGER_ERROR__)throw new Error('[rejected ready] error was not recorded on window.__APT_ARCAGER_ERROR__.');

console.log('Arcager CSV bridge regression passed: primary (4.0.0+ ready), legacy empty-map fallback, and rejected-ready fallback all restored 118 elements with abundance fields intact.');
