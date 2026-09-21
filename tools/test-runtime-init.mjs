import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import { loadManifest } from './data-pipeline.mjs';

const HERE=path.dirname(fileURLToPath(import.meta.url)),ROOT=path.resolve(HERE,'..');
const VERSION=fs.readFileSync(path.join(ROOT,'VERSION'),'utf8').trim();
const manifest=loadManifest(ROOT,VERSION);

class ClassList { constructor(){this.s=new Set();} add(...xs){xs.forEach(x=>this.s.add(x));} remove(...xs){xs.forEach(x=>this.s.delete(x));} contains(x){return this.s.has(x);} toggle(x,force){if(force===undefined)force=!this.s.has(x);force?this.s.add(x):this.s.delete(x);return force;} }
class Element {
  constructor(tag='div'){this.tagName=String(tag).toUpperCase();this.style={};this.dataset={};this.children=[];this.childNodes=this.children;this.classList=new ClassList();this.value='';this.textContent='';this.innerHTML='';this.listeners=new Map();this.selectionStart=0;this.selectionEnd=0;this.open=false;this.hidden=false;}
  addEventListener(type,fn){(this.listeners.get(type)||this.listeners.set(type,[]).get(type)).push(fn)}
  dispatchEvent(ev){for(const fn of this.listeners.get(ev.type)||[])fn(ev)}
  appendChild(x){this.children.push(x);return x}
  insertAdjacentHTML(){this.children.push(new Element('span'))}
  getAttribute(){return 'Search: symbol…'} setAttribute(){}
  focus(){} blur(){} select(){} click(){for(const fn of this.listeners.get('click')||[])fn({target:this,stopPropagation(){}})}
  scrollIntoView(){} contains(){return false} closest(){return null}
  querySelector(){return new Element('div')} querySelectorAll(){return[]}
  getBoundingClientRect(){return{width:100,height:30,left:0,top:0}}
  setSelectionRange(a,b){this.selectionStart=a;this.selectionEnd=b}
  classListContains(x){return this.classList.contains(x)}
}
const ids={};
for(const id of ['table','details','temp','tempValue','tempEdit','tempConfirm','tempCancel','search','resetTemp','noResults','helpLink','helpModal','closeHelp','tempMinus','tempPlus','filterCount','histBtn','histIco','histCount','isearchBar','isearchMatch','isearchPos','helpSearch'])ids[id]=new Element('div');
ids.helpModal.classList=new ClassList();
const document={getElementById:id=>ids[id]||new Element('div'),querySelector:()=>new Element('div'),querySelectorAll:()=>[],createElement:tag=>new Element(tag),addEventListener(){}};
const ctx={document,console,Date,Math,JSON,Map,Set,URL,Number,String,parseFloat,parseInt,isFinite,isNaN,setTimeout,clearTimeout,requestAnimationFrame:fn=>fn(),Event:class Event{constructor(type,init={}){this.type=type;Object.assign(this,init)}},localStorage:{getItem(){return null},setItem(){},removeItem(){}},navigator:{userAgent:'test'},location:{}};
ctx.window=ctx;ctx.globalThis=ctx;ctx.__APT_DATA_READY__=Promise.resolve(manifest);
vm.createContext(ctx);
const ac=fs.readFileSync(path.join(ROOT,'src/js','autocomplete-engine.js'),'utf8');
const app=fs.readFileSync(path.join(ROOT,'src/js','app.js'),'utf8');
vm.runInContext(ac,ctx,{filename:'autocomplete-engine.js'});
vm.runInContext(app,ctx,{filename:'app.js'});
await new Promise(r=>setTimeout(r,0));
if(ids.table.children.length!==162)throw new Error(`Initial grid wrong: ${ids.table.children.length}`);
if(ids.filterCount.textContent!=='118 / 118')throw new Error(`Initial filter count wrong: ${ids.filterCount.textContent}`);
ids.search.value='Fe';ids.search.selectionStart=2;ids.search.selectionEnd=2;ids.search.dispatchEvent({type:'input',inputType:'insertText',data:'Fe'});
if(ids.filterCount.textContent!=='1 / 118')throw new Error(`Search did not filter: ${ids.filterCount.textContent}`);
if(!ids.helpLink.listeners.has('click'))throw new Error('Help link handler missing');
console.log('Runtime initialization + live search + help binding smoke test passed.');
