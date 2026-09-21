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
const ctx={console,Number,String,Map,Set,Promise,Uint8Array,document:{querySelectorAll(sel){return sel==='script[type="text/csv"]'?csvEls:[];}},arcager:{ready:Promise.resolve(),csv:{},resources:{waitFor:async(name,opts)=>({csv:'ready',name,keys:opts?.keys||[]})}}};
ctx.window=ctx;
vm.createContext(ctx);
vm.runInContext(bridge,ctx,{filename:'data-bootstrap.js'});
const manifest=await ctx.__APT_DATA_READY__;
if(manifest.elements.length!==118)throw new Error(`Bridge element count ${manifest.elements.length} != 118`);
const h=manifest.elements[0];
if(h.z!==1||h.sym!=='H'||h.name!=='Hydrogen')throw new Error(`Bridge first element invalid: ${JSON.stringify(h)}`);
if(!manifest.EXTRA_ABUNDANCE[8]?.humans)throw new Error('Human abundance missing after bridge parse.');
console.log('Arcager CSV bridge regression passed: 3 CSV blocks parsed, 118 elements restored, abundance fields intact.');
