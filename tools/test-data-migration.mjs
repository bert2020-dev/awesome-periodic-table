import fs from 'node:fs';
import path from 'node:path';
const ROOT=path.resolve(new URL('.',import.meta.url).pathname,'..');
function csv(text){const rows=[];let row=[],f='',q=false;for(let i=0;i<text.length;i++){const c=text[i],n=text[i+1];if(q){if(c==='"'&&n==='"'){f+='"';i++;}else if(c==='"')q=false;else f+=c;}else if(c==='"')q=true;else if(c===','){row.push(f);f='';}else if(c==='\n'){row.push(f);rows.push(row);row=[];f='';}else if(c!=='\r')f+=c;}if(f||row.length){row.push(f);rows.push(row);}const h=rows[0];return rows.slice(1).filter(r=>r.length).map(r=>Object.fromEntries(h.map((k,i)=>[k,r[i]??''])));}
const core=csv(fs.readFileSync(path.join(ROOT,'data','elements.csv'),'utf8'));
const extra=csv(fs.readFileSync(path.join(ROOT,'data','element-extra.csv'),'utf8'));
if(core.length!==118||extra.length!==118)throw new Error(`Expected 118 rows, got core=${core.length}, extra=${extra.length}`);
const z1=new Set(core.map(r=>r.z));const z2=new Set(extra.map(r=>r.z));
if(z1.size!==118||z2.size!==118||[...z1].some(z=>!z2.has(z)))throw new Error('Element Z sets do not match.');
for(const field of ['tox','halflife','sources','discoverySource','discoveryCountry','year','solarAbundance','meteoriteAbundance'])if(!(field in extra[0]))throw new Error(`Missing expanded field ${field}`);
const tox=new Set(extra.map(r=>r.tox).filter(Boolean));
if(tox.has('Very hig')||!tox.has('Very high'))throw new Error('Toxicity normalization failed.');
const ocean=Number(extra.find(r=>r.z==='1').oceanAbundance);
if(!Number.isFinite(ocean)||ocean!==108000)throw new Error('Source ocean abundance was altered; pipeline conversion must be explicit.');
console.log('Data migration contract passed: 118 matching elements, UTF-8 CSV schema, normalized toxicity, and source ocean concentration preserved for build-time % conversion.');
