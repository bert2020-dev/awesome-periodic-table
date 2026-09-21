import fs from 'node:fs';
import path from 'node:path';

function csv(text) {
  const rows=[]; let row=[], field='', quoted=false;
  for(let i=0;i<text.length;i++){
    const ch=text[i], next=text[i+1];
    if(quoted){
      if(ch==='"' && next==='"'){field+='"';i++;}
      else if(ch==='"') quoted=false;
      else field+=ch;
    } else if(ch==='"') quoted=true;
    else if(ch===','){row.push(field);field='';}
    else if(ch==='\n'){row.push(field);rows.push(row);row=[];field='';}
    else if(ch!=='\r') field+=ch;
  }
  if(field!=='' || row.length){row.push(field);rows.push(row);}
  const [header,...body]=rows;
  return body.filter(r=>r.length && r.some(Boolean)).map(r=>Object.fromEntries(header.map((h,i)=>[h,r[i]??''])));
}

const num=v=>v===''?null:Number(v);
const list=v=>v===''?[]:v.split(';').filter(Boolean).map(Number);

export function loadManifest(root, version){
  const DATA=path.join(root,'data');
  const elements=csv(fs.readFileSync(path.join(DATA,'elements.csv'),'utf8')).map(r=>({
    z:Number(r.z), sym:r.sym, name:r.name, latin:r.latin || null, mass:num(r.mass), cat:r.cat,
    melt:num(r.melt), boil:num(r.boil), config:r.config, density:num(r.density), en:num(r.en), ie:num(r.ie),
    sources:r.sources, e0:num(r.e0), tox:r.tox || '—', year:num(r.year), oxidation:num(r.oxidation),
    halflife:num(r.halflife), discoverySource:r.discoverySource || null, discoveryCountry:r.discoveryCountry || null
  }));
  const extras=csv(fs.readFileSync(path.join(DATA,'element-extra.csv'),'utf8'));
  const lookups=csv(fs.readFileSync(path.join(DATA,'lookups.csv'),'utf8'));
  const byZ=new Map(extras.map(r=>[Number(r.z),r]));
  const EXTRA_CONDUCTIVITY=[null,...elements.map(e=>num(byZ.get(e.z)?.electricalConductivity ?? ''))];
  const EXTRA_HEAT=[null,...elements.map(e=>num(byZ.get(e.z)?.specificHeat ?? ''))];
  const THERMAL_CONDUCTIVITY=[null,...elements.map(e=>num(byZ.get(e.z)?.thermalConductivity ?? ''))];
  const ELECTRICAL_TYPE=[null,...elements.map(e=>byZ.get(e.z)?.electricalType || 'N/A')];
  const EXTRA_ABUNDANCE=[null,...elements.map(e=>({crust:num(byZ.get(e.z)?.crustAbundance ?? ''),ocean:num(byZ.get(e.z)?.oceanAbundance ?? ''),universe:num(byZ.get(e.z)?.universeAbundance ?? ''),humans:num(byZ.get(e.z)?.humanAbundance ?? '')}))];
  const IONIZATION_ENERGIES=[null,...elements.map(e=>list(byZ.get(e.z)?.ionizationEnergies ?? ''))];
  const EXTRA_ISOTOPES=[null,...elements.map(e=>list(byZ.get(e.z)?.isotopes ?? ''))];
  const EXTRA_ISOTOPE_ABUNDANCE=[null,...elements.map(e=>list(byZ.get(e.z)?.isotopeAbundance ?? ''))];
  const CAT=[...new Set(elements.map(e=>e.cat))];
  const TOX=[...new Set(elements.map(e=>e.tox).filter(Boolean).filter(x=>x!=='—'))];
  const E_SOURCES=[...new Set(elements.flatMap(e=>String(e.sources||'').split(',').map(x=>x.trim()).filter(Boolean)))];
  const DISCOVERY_COUNTRY=[null,...elements.map(e=>e.discoveryCountry)];
  const DISCOVERY_SOURCE=[null,...elements.map(e=>e.discoverySource)];
  return {schema:1,version,elements,CAT,TOX,E_SOURCES,DISCOVERY_COUNTRY,DISCOVERY_SOURCE,EXTRA_CONDUCTIVITY,EXTRA_HEAT,THERMAL_CONDUCTIVITY,ELECTRICAL_TYPE,EXTRA_ISOTOPES,EXTRA_ISOTOPE_ABUNDANCE,IONIZATION_ENERGIES,EXTRA_ABUNDANCE,extras,lookups};
}

function esc(v){
  if(v===null || v===undefined) return '';
  return String(v).replace(/\\/g,'\\\\').replace(/\|/g,'\\|').replace(/\r/g,'\\r').replace(/\n/g,'\\n');
}

export function manifestToPipe(manifest){
  const out=[
    `@|APT_PIPE_V1|${esc(manifest.version)}|${manifest.schema}`,
    '#|E|z|sym|name|latin|mass|cat|melt|boil|config|density|en|ie|sources|e0|tox|year|oxidation|halflife|discoverySource|discoveryCountry',
    '#|X|z|electricalConductivity|specificHeat|thermalConductivity|electricalType|crustAbundance|oceanAbundance|universeAbundance|humanAbundance|ionizationEnergies|isotopes|isotopeAbundance',
    '#|L|kind|key|value'
  ];
  for(const e of manifest.elements){
    out.push(['E',e.z,e.sym,e.name,e.latin,e.mass,e.cat,e.melt,e.boil,e.config,e.density,e.en,e.ie,e.sources,e.e0,e.tox,e.year,e.oxidation,e.halflife,e.discoverySource,e.discoveryCountry].map(esc).join('|'));
  }
  for(const r of manifest.extras){
    out.push(['X',r.z,r.electricalConductivity,r.specificHeat,r.thermalConductivity,r.electricalType,r.crustAbundance,r.oceanAbundance,r.universeAbundance,r.humanAbundance,r.ionizationEnergies,r.isotopes,r.isotopeAbundance].map(esc).join('|'));
  }
  for(const r of manifest.lookups){ out.push(['L',r.kind,r.key,r.value].map(esc).join('|')); }
  return out.join('\n');
}

export function jsonManifest(manifest){
  return {schema:manifest.schema,version:manifest.version,elements:manifest.elements,CAT:manifest.CAT,TOX:manifest.TOX,E_SOURCES:manifest.E_SOURCES,DISCOVERY_COUNTRY:manifest.DISCOVERY_COUNTRY,DISCOVERY_SOURCE:manifest.DISCOVERY_SOURCE,EXTRA_CONDUCTIVITY:manifest.EXTRA_CONDUCTIVITY,EXTRA_HEAT:manifest.EXTRA_HEAT,THERMAL_CONDUCTIVITY:manifest.THERMAL_CONDUCTIVITY,ELECTRICAL_TYPE:manifest.ELECTRICAL_TYPE,EXTRA_ISOTOPES:manifest.EXTRA_ISOTOPES,EXTRA_ISOTOPE_ABUNDANCE:manifest.EXTRA_ISOTOPE_ABUNDANCE,IONIZATION_ENERGIES:manifest.IONIZATION_ENERGIES,EXTRA_ABUNDANCE:manifest.EXTRA_ABUNDANCE};
}
