/* Awesome Periodic Table runtime.
   The build injects a data promise before loading this application.
   Plain builds resolve it from the compact pipe payload; Arcager builds
   resolve it from Arcager's in-memory CSV resources.
*/
;(async()=>{
const __APT_manifest=await window.__APT_DATA_READY__;
const APP_VERSION=__APT_manifest.version;
const {elements,CAT,TOX,E_SOURCES,DISCOVERY_COUNTRY,DISCOVERY_SOURCE,EXTRA_CONDUCTIVITY,EXTRA_HEAT,THERMAL_CONDUCTIVITY,ELECTRICAL_TYPE,EXTRA_ISOTOPES,EXTRA_ISOTOPE_ABUNDANCE,IONIZATION_ENERGIES,EXTRA_ABUNDANCE}=__APT_manifest;
/* Grid positions: [row, col] for each Z (1-based). Row 1-9, Col 1-18. */
const POS=[null,
[1,1],[1,18],
[2,1],[2,2],[2,13],[2,14],[2,15],[2,16],[2,17],[2,18],
[3,1],[3,2],[3,13],[3,14],[3,15],[3,16],[3,17],[3,18],
[4,1],[4,2],[4,3],[4,4],[4,5],[4,6],[4,7],[4,8],[4,9],[4,10],[4,11],[4,12],[4,13],[4,14],[4,15],[4,16],[4,17],[4,18],
[5,1],[5,2],[5,3],[5,4],[5,5],[5,6],[5,7],[5,8],[5,9],[5,10],[5,11],[5,12],[5,13],[5,14],[5,15],[5,16],[5,17],[5,18],
[6,1],[6,2],
[8,3],[8,4],[8,5],[8,6],[8,7],[8,8],[8,9],[8,10],[8,11],[8,12],[8,13],[8,14],[8,15],[8,16],[8,17],
[6,4],[6,5],[6,6],[6,7],[6,8],[6,9],[6,10],[6,11],[6,12],[6,13],[6,14],[6,15],[6,16],[6,17],[6,18],
[7,1],[7,2],
[9,3],[9,4],[9,5],[9,6],[9,7],[9,8],[9,9],[9,10],[9,11],[9,12],[9,13],[9,14],[9,15],[9,16],[9,17],
[7,4],[7,5],[7,6],[7,7],[7,8],[7,9],[7,10],[7,11],[7,12],[7,13],[7,14],[7,15],[7,16],[7,17],[7,18]
];

/* ===== Dynamic magnetism ===== */
const UNKNOWN_Z=new Set([104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,43,61,84,85,86,87,88,89,93]);
const TC={26:1043,27:1388,28:631,64:293,65:220,66:88,67:20,68:32,69:25};
const TN={24:311};
const DIAMAGNETIC=new Set([1,2,4,5,6,7,9,10,14,15,16,17,18,29,30,31,32,33,34,35,36,47,48,49,50,51,52,53,54,70,79,80,81,82,83,86]);
const MAG_LABEL={D:"Diamagnetic",P:"Paramagnetic",F:"Ferromagnetic",A:"Antiferromagnetic",Unknown:"Unknown"};
function sigmoid(x,scale){scale=scale||35;return 1/(1+Math.exp(-x/scale))}
function magProbs(z,tCelsius){
  if(z<1||z>118||UNKNOWN_Z.has(z))return{D:0,P:0,F:0,A:0,Unknown:1};
  const T=tCelsius+273.15;
  const p_f=(z in TC)?sigmoid(TC[z]-T):0;
  const p_a=(z in TN)?sigmoid(TN[z]-T):0;
  const p_d=DIAMAGNETIC.has(z)?1:0;
  const p_p=Math.max(0,1-p_f-p_a-p_d);
  const s=p_d+p_p+p_f+p_a+1e-12;
  return{D:p_d/s,P:p_p/s,F:p_f/s,A:p_a/s,Unknown:0};
}
function magType(z,tCelsius){
  const probs=magProbs(z,tCelsius==null?25:tCelsius);
  if(probs.Unknown>0.5)return"Unknown";
  let maxK="D",maxV=probs.D;
  for(const k of["P","F","A"]){if(probs[k]>maxV){maxV=probs[k];maxK=k}}
  return MAG_LABEL[maxK];
}

const badgeSolid=`<svg viewBox="0 0 16 16" fill="none" stroke="#86efac" stroke-width="1.5"><rect x="2" y="2" width="4" height="4"/><rect x="10" y="2" width="4" height="4"/><rect x="2" y="10" width="4" height="4"/><rect x="10" y="10" width="4" height="4"/><path d="M6 4h4M6 12h4M4 6v4M12 6v4"/></svg>`,badgeLiquid=`<svg viewBox="0 0 16 16" fill="none" stroke="#60a5fa" stroke-width="1.5"><path d="M8 2c0 0-5 6-5 9a5 5 0 0 0 10 0c0-3-5-9-5-9z"/></svg>`,badgeGas=`<svg viewBox="0 0 16 16" fill="none" stroke="#fdba74" stroke-width="1.4"><path d="M4 10a3 3 0 0 1 0-6 3.5 3.5 0 0 1 6.5-1.5A3 3 0 0 1 14 6.5 2.5 2.5 0 0 1 12 11H5a3 3 0 0 1-1-1z"/></svg>`;
const KtoC=k=>k==null?null:+(k-273.15).toFixed(1),CtoF=c=>c==null?null:+(c*9/5+32).toFixed(1),CtoK=c=>c==null?null:+(c+273.15).toFixed(1);
function phase(el,tC){const m=KtoC(el.melt),b=KtoC(el.boil);if(m==null||b==null)return"";if(tC<m)return"solid";if(tC<b)return"liquid";return"gas"}

function formatAbundance(n){
  if(n===-1)return"synthetic";
  if(n===-2)return"trace";
  if(n===-3)return"synthetic / trace";
  if(n==null)return"—";
  if(n===0)return"0 %";
  if(Math.abs(n)<0.001)return n.toExponential(1).replace(/\.0e/,'e')+" %";
  return parseFloat(n.toPrecision(4))+" %";
}
function thermalType(k){return k==null?'—':(k<1?'Insulator':(k>=20?'Conductor':'Intermediate'));}
function formatHalfLife(s){
  if(s===0)return"stable"; if(s==null)return"—";
  const years=s/31557600;
  if(years>=1){
    if(years<1e6)return `${Math.round(years).toLocaleString('en-US')} years`;
    if(years<1e9){const v=parseFloat((years/1e6).toPrecision(3));return `${v}M years`;}
    if(years<1e12){const v=parseFloat((years/1e9).toPrecision(3));return `${v}B years`;}
    if(years<1e15){const v=parseFloat((years/1e12).toPrecision(3));return `${v}T years`;}
    const exp=Math.floor(Math.log10(years)), mant=(years/10**exp).toPrecision(3); return `${parseFloat(mant)}×10^${exp} years`;
  }
  const units=[['days',86400],['hours',3600],['minutes',60],['s',1],['ms',1e-3],['us',1e-6],['ns',1e-9]];
  for(const [name,factor] of units){const v=s/factor;if(v>=1)return `${parseFloat(v.toPrecision(3))} ${name}`;}
  return `${s} s`;
}

function arrow(a,b){if(a==null||b==null||isNaN(a)||isNaN(b))return"";if(a>b)return' <span class="cmp">↑</span>';if(a<b)return' <span class="cmp">↓</span>';return' <span class="cmp">=</span>'}
const ALIASES={va:23,al:13,pb:82,hg:80,sn:50,sb:51,bi:83,cu:29,fe:26,ag:47,au:79,pt:78,zn:30,mn:25,mg:12,ca:20,na:11,k:19,cl:17,br:35,i:53,w:74,si:14,ti:22,cr:24,co:27,ni:28,cd:48,ba:56,sr:38,zr:40,mo:42,pd:46,os:76,ir:77,rh:45,ru:44,re:75,ta:73,nb:41,hf:72,v:23,y:39,la:57,ce:58,pr:59,nd:60,pm:61,sm:62,eu:63,gd:64,tb:65,dy:66,ho:67,er:68,tm:69,yb:70,lu:71,ac:89,th:90,pa:91,u:92,np:93,pu:94,am:95,cm:96,bk:97,cf:98,es:99,fm:100,md:101,no:102,lr:103,rf:104,db:105,sg:106,bh:107,hs:108,mt:109,ds:110,rg:111,cn:112,nh:113,fl:114,mc:115,lv:116,ts:117,og:118};
const TOLERANCE=0.10;

/* Reusable data/property objects: one place owns lookup, dimension selection,
   sequence selection and cache policy for the search engine and Details panel. */
class PropertyCatalog {
  static WORD_ORDINALS={first:1,second:2,third:3,fourth:4,fifth:5,sixth:6,seventh:7,eighth:8,ninth:9,tenth:10};
  static DIMENSIONS={crust:{label:'Crust',unit:'%',kind:'percentage'},ocean:{label:'Ocean',unit:'mg/L',kind:'concentration'},universe:{label:'Universe',unit:'%',kind:'percentage'},humans:{label:'Humans',unit:'%',kind:'percentage'}};
  dimensionMeta(dimension){return PropertyCatalog.DIMENSIONS[dimension]||null;}
  static normalize(label){return String(label||"").toLowerCase().trim().replace(/\s+/g," ").replace(/^(?:more|less|higher|lower|greater|smaller|denser|heavier|lighter)\s+/i,"");}
  resolve(label){
    const p=PropertyCatalog.normalize(label).replace(/[’']s$/,'');
    if(/^(?:abundance|abundant|crustal abundance|crust abundance)$/.test(p)||/^(?:in|on) (?:the )?(?:earth(?:'s )?)?crust$/.test(p)||/^(?:abundance|abundant|common) (?:in|on) (?:the )?(?:earth(?:'s )?)?crust$/.test(p)||/^(?:abundance|abundant|common) (?:in|on) (?:the )?earth(?:'s)?$/.test(p))return{key:'abundance:crust',kind:'dimension',dimension:'crust',label:'Crust'};
    if(/^(?:ocean abundance|abundance in (?:the )?ocean|(?:abundant|common) in (?:the )?ocean|ocean|in (?:the )?ocean)$/.test(p))return{key:'abundance:ocean',kind:'dimension',dimension:'ocean',label:'Ocean'};
    if(/^(?:universe abundance|abundance in (?:the )?universe|(?:abundant|common) in (?:the )?universe|universe|in (?:the )?universe)$/.test(p))return{key:'abundance:universe',kind:'dimension',dimension:'universe',label:'Universe'};
    if(/^(?:human abundance|humans? abundance|abundance in (?:the )?(?:humans?|human body)|(?:abundant|common) in (?:the )?(?:humans?|human body)|human|humans|in (?:the )?(?:humans?|human body))$/.test(p))return{key:'abundance:humans',kind:'dimension',dimension:'humans',label:'Humans'};
    let m=p.match(/^(?:ie|ionization(?: energy)?)\s*(\d+)$/);
    if(m)return{key:`ionization:${Math.max(1,parseInt(m[1],10))}`,kind:'sequence',stage:Math.max(1,parseInt(m[1],10)),label:`${m[1]}th ionization energy`};
    m=p.match(/^(first|second|third|fourth|fifth|sixth|seventh|eighth|ninth|tenth)\s+ionization(?: energy)?$/);
    if(m)return{key:`ionization:${PropertyCatalog.WORD_ORDINALS[m[1]]}`,kind:'sequence',stage:PropertyCatalog.WORD_ORDINALS[m[1]],label:`${m[1]} ionization energy`};
    m=p.match(/^(1st|2nd|3rd|4th|5th|6th|7th|8th|9th|10th)\s+ionization(?: energy)?$/);
    if(m)return{key:`ionization:${parseInt(m[1],10)}`,kind:'sequence',stage:parseInt(m[1],10),label:`${m[1]} ionization energy`};
    if(/^(?:ionization energy|ionization)$/.test(p))return{key:'ionization:1',kind:'sequence',stage:1,label:'First ionization energy'};
    if(/^(?:stable isotopes?|isotopes?)$/.test(p))return{key:'stableIsotopes',kind:'collection',label:'Stable isotopes'};
    if(/^(?:melts?|melting|freezes?|freezing|solidif(?:y|ies|ying)|liquef(?:y|ies|ying)|liquefaction)$/.test(p))return{key:'melt',kind:'scalar',label:'Melting point'};
    if(/^(?:boils?|boiling|condenses?|condense|condensing|vaporizes?|vaporize|evaporates?|evaporate)$/.test(p))return{key:'boil',kind:'scalar',label:'Boiling point'};
    if(/^(?:mass|weight|molar mass)$/.test(p))return{key:'mass',kind:'scalar',label:'Mass'};
    if(/^(?:density|dense|denser)$/.test(p))return{key:'density',kind:'scalar',label:'Density'};
    if(/^(?:electronegativity|en)$/.test(p))return{key:'en',kind:'scalar',label:'Electronegativity'};
    if(/^(?:electrode potential|standard electrode potential|e0)$/.test(p))return{key:'e0',kind:'scalar',label:'Electrode potential'};
    if(/^(?:electrical conductivity|electrical conductive|electricalconductivity|conductive|ec)$/.test(p))return{key:'electricalconductivity',kind:'scalar',label:'Electrical conductivity'};
    if(/^(?:thermal conductivity|thermal conductive|thermalconductivity|tc)$/.test(p))return{key:'thermalconductivity',kind:'scalar',label:'Thermal conductivity'};
    if(/^(?:conductivity)$/.test(p))return{key:'conductivity',kind:'multi',label:'Conductivity'};
    if(/^(?:specific heat|specificheat|heat)$/.test(p))return{key:'specificheat',kind:'scalar',label:'Specific heat'};
    if(/^(?:year|discovery year)$/.test(p))return{key:'year',kind:'scalar',label:'Discovery year'};
    return null;
  }
}

class ElementDataRepository {
  constructor(manifest){
    this.elements=manifest.elements;
    this.byZ=new Map(this.elements.map(e=>[e.z,e]));
    this.byName=new Map();
    for(const e of this.elements){this.byName.set(e.sym.toLowerCase(),e);this.byName.set(e.name.toLowerCase(),e);if(e.latin)this.byName.set(e.latin.toLowerCase(),e);}
    this.propertyCache=new Map();
  }
  findElement(query){
    const q=String(query||'').trim().toLowerCase();
    const direct=this.byName.get(q)||(/^\d+$/.test(q)?this.byZ.get(+q):null);
    if(direct)return direct;
    const a=ALIASES[q];return a?this.byZ.get(a)||null:null;
  }
  ionizations(z){return (IONIZATION_ENERGIES[z]||[]).slice();}
  stableIsotopes(z){return (EXTRA_ISOTOPES[z]||[]).slice();}
  isotopeAbundances(z){return (EXTRA_ISOTOPE_ABUNDANCE[z]||[]).slice();}
  abundance(z,dimension){return EXTRA_ABUNDANCE[z]?.[dimension]??null;}
  values(el,spec){
    const key=typeof spec==='string'?spec:spec?.key; if(!key)return[];
    const cacheKey=`${el.z}:${key}`; if(this.propertyCache.has(cacheKey))return this.propertyCache.get(cacheKey).slice();
    let values=[];
    if(key.startsWith('abundance:'))values=[this.abundance(el.z,key.split(':')[1])].filter(v=>v!=null&&Number.isFinite(v)&&v>=0);
    else if(key.startsWith('ionization:')){const stage=Math.max(1,parseInt(key.split(':')[1],10));const v=this.ionizations(el.z)[stage-1];values=Number.isFinite(v)?[v]:[];}
    else if(key==='stableIsotopes')values=this.stableIsotopes(el.z).filter(Number.isFinite);
    else if(key==='melt')values=[KtoC(el.melt)].filter(Number.isFinite);
    else if(key==='boil')values=[KtoC(el.boil)].filter(Number.isFinite);
    else if(key==='mass')values=[el.mass];
    else if(key==='density')values=[el.density].filter(Number.isFinite);
    else if(key==='en')values=[el.en].filter(Number.isFinite);
    else if(key==='e0')values=[el.e0!==0?el.e0:null].filter(Number.isFinite);
    else if(key==='electricalconductivity')values=[EXTRA_CONDUCTIVITY[el.z]].filter(Number.isFinite);
    else if(key==='thermalconductivity')values=[THERMAL_CONDUCTIVITY[el.z]].filter(Number.isFinite);
    else if(key==='conductivity')values=[EXTRA_CONDUCTIVITY[el.z],THERMAL_CONDUCTIVITY[el.z]].filter(Number.isFinite);
    else if(key==='specificheat')values=[EXTRA_HEAT[el.z]].filter(Number.isFinite);
    else if(key==='year')values=[el.year].filter(Number.isFinite);
    this.propertyCache.set(cacheKey,values.slice()); return values;
  }
  maxStableMass(el){const a=this.stableIsotopes(el.z).filter(Number.isFinite);return a.length?Math.max(...a):null;}
  minStableMass(el){const a=this.stableIsotopes(el.z).filter(Number.isFinite);return a.length?Math.min(...a):null;}
  maxStableAbundance(el){const a=this.isotopeAbundances(el.z).filter(Number.isFinite);return a.length?Math.max(...a):null;}
  hasStableIsotope(el,mass){return this.stableIsotopes(el.z).includes(+mass);}
}

const PROPERTY_CATALOG=new PropertyCatalog();
const DATA_MODEL=new ElementDataRepository(__APT_manifest);
function findEl(q){return DATA_MODEL.findElement(q);}

/* ===== Smart query engine =====
   Natural-language filters, ranges, property selectors and superlatives.

   Grammar (3 precedence tiers, lowest to highest):
     query      := orGroup ('or' orGroup)*
     orGroup    := commaPart (',' commaPart)*        -- "smart AND": intersects all
                                                         parts; if that intersection is
                                                         empty, falls back to their union
                                                         (lets "gold, silver" list several
                                                         mutually-exclusive elements while
                                                         "transition, density above 10"
                                                         still narrows normally).
     commaPart  := andTerm ('and' andTerm)*          -- strict intersection
     andTerm    := ['not'] atom                       -- NOT may prefix any individual term
     atom       := element | category | labeled key:value | relational comparison
                   | coarse keyword | free-text substring
*/

/* ---- Category alias table: exact, collision-free lookup (fixes "post-transition"
   incorrectly also matching "transition", etc.) ---- */
const CATEGORY_ALIAS={
  alkali:'alkali',alkalimetal:'alkali',alkalimetals:'alkali',
  alkaline:'alkaline',alkalineearth:'alkaline',alkalineearthmetal:'alkaline',alkalineearthmetals:'alkaline',
  transition:'transition',transitionmetal:'transition',transitionmetals:'transition',
  posttransition:'post-transition',posttransitionmetal:'post-transition',posttransitionmetals:'post-transition',
  metalloid:'metalloid',metalloids:'metalloid',
  nonmetal:'nonmetal',nonmetals:'nonmetal',
  halogen:'halogen',halogens:'halogen',
  noble:'noble',noblegas:'noble',noblegases:'noble',
  lanthanide:'lanthanide',lanthanides:'lanthanide',
  actinide:'actinide',actinides:'actinide',
  unknown:'unknown'
};
/* "metal"/"metals" is a broad, commonly-typed superset covering everything that isn't
   a nonmetal/halogen/noble gas/metalloid. */
const METAL_CATS=new Set(['alkali','alkaline','transition','post-transition','lanthanide','actinide']);
function matchCategory(el,raw){
  const key=raw.toLowerCase().replace(/[\s-]+/g,'');
  if(!key)return null;
  if(key==='metal'||key==='metals')return METAL_CATS.has(el.cat);
  const cat=CATEGORY_ALIAS[key];
  return cat?el.cat===cat:null;
}
const COUNTRY_ALIAS={usa:'united states','united states':'usa',uk:'united kingdom','united kingdom':'uk'};
const LEADING_SOURCE_FILLER=/^(?:from|in|found in|located in|occurring in|discovered in|sourced from|mined in)\s+/i;

function normalizeQuery(q){
  q=q
    .replace(/[–—]/g,"-")
    .replace(/\bsolids\b/gi,"solid").replace(/\bliquids\b/gi,"liquid").replace(/\bgases\b/gi,"gas")
    .replace(/\bliquid\s+or\s+gas\s+(?=(?:at|above|below|over|under|between)\b)/gi,"liquidORgas ")
    .replace(/\bsolid\s+or\s+liquid\s+(?=(?:at|above|below|over|under|between)\b)/gi,"solidORliquid ")
    .replace(/\bweight\b/gi,"mass").replace(/\bmolar\s+mass\b/gi,"mass")
    .replace(/\bmelting\s+point\b/gi,"melts").replace(/\bmelting\b/gi,"melts")
    .replace(/\bboiling\s+point\b/gi,"boils").replace(/\bboiling\b/gi,"boils")
    .replace(/\belectronegativity\b/gi,"en").replace(/\belectrode\s+potential\b/gi,"e0")
    .replace(/\btoxicity\s+level\b/gi,"toxicity")
    .replace(/\bnon[-\s]?metals?\b/gi,"nonmetal")
    .replace(/\balka?line\s+earth\s+metals?\b/gi,"alkaline")
    .replace(/\balkali\s+metals?\b/gi,"alkali")
    .replace(/\btransition\s+metals?\b/gi,"transition")
    .replace(/\bpost[-\s]?transition\s+metals?\b/gi,"post-transition")
    .replace(/\bnoble\s+gas(?:es)?\b/gi,"noble")
    .replace(/\bhalogens?\b/gi,"halogen")
    .replace(/\blanthanides?\b/gi,"lanthanide")
    .replace(/\bactinides?\b/gi,"actinide")
    .replace(/\belectrical\s+(?:types?|classes?)\b/gi,"electrical type")
    .replace(/\bthermal\s+(?:behaviors?|classes?)\b/gi,"thermal behavior");

  /* Natural-language filler & connective words. Applied globally (word-boundary
     safe) so they work whether they open the query or sit after a comma) — e.g.
     "Elements with density between silver and gold" and "elements discovered
     before 1800" both reduce to their bare relational clause. Bare "elements"/
     "with"/"having" never carry filtering meaning on their own in this grammar,
     so they're dropped outright rather than only at the start of the string. */
  q=q
    .replace(/\bbut\s+not\b/gi,"and not")
    .replace(/\bexcept(?:ing)?\b/gi,"and not")
    .replace(/\bexcluding\b/gi,"and not")
    .replace(/\bbut\b/gi,"and")
    .replace(/\bwhile\b/gi,"and")
    .replace(/\b(?:that|which)\b/gi,"")
    .replace(/^\s*(?:find|show|list|give)\s+me\s+/i,"")
    .replace(/^\s*(?:find|show|list)\s+/i,"")
    .replace(/\b(?:discoveries|discovery|discovered)\s+(?=(?:after|before|between)\b)/gi,"")
    .replace(/\belements\b/gi,"__ELEMENTS_PLURAL__")
    .replace(/\bitem\b/gi,"")
    .replace(/\bitems\b/gi,"__ELEMENTS_PLURAL__")
    .replace(/\b(?:with|having)\b/gi,"")
    .replace(/\s+/g," ").trim();

  /* Implicit AND: insert "and" where a bare category/boolean keyword is glued
     directly to the start of a new clause with no connector, e.g.
     "metalloids more dense than B" -> "metalloids and more dense than B",
     "transition density above 10" -> "transition and density above 10". */
  const CATEGORY_TRIGGER='alkaline earth metals?|alkali metals?|post-transition|post transition|transition|alkali|alkaline|metalloids?|nonmetals?|halogens?|noble|lanthanides?|actinides?|metals?|solid|liquid|gas|toxic|radioactive|radiation|stable';
  const COMPARATIVE_START='more|less|higher|lower|greater|smaller|denser|heavier|lighter';
  const PROPERTY_START='density|dense|mass|melts?|melting|boils?|boiling|electronegativity|en|conductivity|conductive|thermal|ionization|heat|abundance|year';
  const IMPLICIT_AND=new RegExp(`\\b(${CATEGORY_TRIGGER})\\s+(?=(?:${COMPARATIVE_START}|${PROPERTY_START}|not|${CATEGORY_TRIGGER})\\b)`,"gi");
  q=q.replace(IMPLICIT_AND,"$1 and ");

  return q;
}
function extractNumber(s){
  if(s==null)return null;
  const m=String(s).replace(/,/g,"").match(/[-+]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[-+]?\d+)?/i);
  return m?parseFloat(m[0]):null;
}
function convertTempToC(val,unit){
  unit=(unit||"").toLowerCase().replace("°","");
  if(unit==="f")return(val-32)*5/9;
  if(unit==="k")return val-273.15;
  return val;
}
function getIonizations(z){return DATA_MODEL.ionizations(z).slice(0,8);}
function getPropValue(el,prop){
  if(prop==='stableIsotopeMax')return DATA_MODEL.maxStableMass(el);
  if(prop==='stableIsotopeMin')return DATA_MODEL.minStableMass(el);
  if(prop==='stableIsotopeAbundanceMax')return DATA_MODEL.maxStableAbundance(el);
  const key=typeof prop==='string'&&prop.includes(':')?prop:PROPERTY_CATALOG.resolve(prop)?.key;
  if(!key)return null;
  const vals=DATA_MODEL.values(el,{key});return vals[0]??null;
}
function getPropValues(el,prop){
  const key=typeof prop==='string'&&prop.includes(':')?prop:PROPERTY_CATALOG.resolve(prop)?.key;
  return key?DATA_MODEL.values(el,{key}):[];
}
function canonicalSearchProperty(label){return PROPERTY_CATALOG.resolve(label)?.key||null;}
/* "X between Y and Z"/"X above Y" endpoints may reference another element (e.g.
   "melts between iron and gold"). getPropValue()/getPropValues() already return
   melt/boil in Celsius, so no further conversion is applied here. */
function compareEndpoint(token,prop){
  const t=String(token||"").trim().replace(/[’']s$/i,"").trim();
  if(!t)return null;
  const num=/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?\s*(?:%|°?c|°?f|k)?$/i.test(t);
  if(num){
    let value=extractNumber(t); if(value==null)return null;
    if(/%\s*$/i.test(t) && !String(prop).startsWith('abundance:'))return null;
    if(prop==="melt"||prop==="boil"){
      const unit=(t.match(/(°?c|°?f|k)$/i)||[])[1]||"c";
      value=convertTempToC(value,unit);
    }
    return {kind:"number",values:[value]};
  }
  const ref=findEl(t);
  if(ref){const values=getPropValues(ref,prop);return values.length?{kind:"element",values}:null;}
  const rhsSpec=PROPERTY_CATALOG.resolve(t);
  return rhsSpec?{kind:"property",spec:rhsSpec}:null;
}
function compareValues(relation,leftValues,endpoint){
  if(!endpoint||!endpoint.values.length||!leftValues.length)return false;
  if(relation==="between"){
    const low=Math.min(...endpoint.values),high=Math.max(...endpoint.values);
    return leftValues.some(v=>v>=low&&v<=high);
  }
  const greater=/^(?:above|over|greater than|higher than|more than|more|greater|higher)$/.test(relation);
  const refValues=endpoint.values;
  return leftValues.some(a=>refValues.some(b=>greater?a>b:a<b));
}
function toxicityLabel(v){ return v==="Very high / Toxic"?"Very High":(v||"—"); }

function evaluateAtomicSelector(el,raw){
  const q=String(raw||'').trim();
  if(!q)return false;
  if(/^\d+$/.test(q))return el.z===parseInt(q,10);
  if(/^[A-Z][a-z]?$/.test(q))return el.sym===q;
  const ref=findEl(q);
  return !!ref&&ref.z===el.z;
}
function evaluateCondition(el,cond,tempC){
  const raw=cond.trim().replace(/__ELEMENTS_PLURAL__/g,'');
  if(!raw)return true;

  /* Tier 1 — exact element identity (symbol / name / latin / atomic number).
     Checked first and with priority: if the token looks like an identifier
     (short alpha token or a number) it is judged ONLY as an identifier, so it
     never falls through to the fuzzy substring search below. */
  if(evaluateAtomicSelector(el,raw))return true;

  const p=raw.toLowerCase();

  /* Tier 2 — category / broad "metal" alias. Exact dictionary lookup, so
     "post-transition" can never bleed into matching plain "transition". */
  const catMatch=matchCategory(el,raw);
  if(catMatch!==null)return catMatch;

  /* Tier 3 — labeled key:value queries. */
  let m=p.match(/^discovery\s*(?:country|source)\s*:\s*(.+)$/);
  if(m){const val=m[1].trim();return (el.discoveryCountry||'').toLowerCase().includes(val)||(el.discoverySource||'').toLowerCase().includes(val);}
  m=p.match(/^(?:occurrence|occurs?)\s*(?:country)?\s*:\s*(.+)$/);
  if(m){const val=m[1].trim();return (el.sources||'').toLowerCase().includes(val);}
  m=p.match(/^electrical\s*(?:type)?\s*:\s*(.+)$/);
  if(m)return (ELECTRICAL_TYPE[el.z]||'N/A').toLowerCase()===m[1].trim().toLowerCase();
  m=p.match(/^thermal\s*(?:type|behavior)?\s*:\s*(.+)$/);
  if(m)return thermalType(THERMAL_CONDUCTIVITY[el.z]).toLowerCase()===m[1].trim().toLowerCase();
  m=p.match(/^(magnetism|category|toxicity|radiation|oxidation)\s*:\s*(.+)$/);
  if(m){
    const key=m[1].toLowerCase(),val=m[2].trim().toLowerCase();
    if(key==='magnetism')return magType(el.z,tempC).toLowerCase()===val;
    if(key==='category'){const c=matchCategory(el,val);return c===null?(el.cat||'').toLowerCase()===val:c;}
    if(key==='toxicity')return toxicityLabel(el.tox).toLowerCase()===val||(el.tox||'').toLowerCase()===val;
    if(key==='radiation')return val==='radioactive'?(el.halflife||0)>0:(val==='stable'||val==='—')?(el.halflife||0)===0:false;
    if(key==='oxidation')return el.oxidation===parseInt(val,10);
  }

  /* Electrical / thermal type, with and without the "type"/"behavior" word. */
  m=p.match(/^electrical\s+(conductor|semiconductor|isolator|insulator|intermediate|n\/a)$/);
  if(m)return (ELECTRICAL_TYPE[el.z]||'N/A').toLowerCase()===m[1];
  m=p.match(/^thermal\s+(conductor|insulator|semiconductor|intermediate|n\/a)$/);
  if(m)return thermalType(THERMAL_CONDUCTIVITY[el.z]).toLowerCase()===m[1];
  if(/^(?:conductor|semiconductor|isolator|insulator|intermediate|n\/a)$/.test(p))
    return (ELECTRICAL_TYPE[el.z]||'N/A').toLowerCase()===p||thermalType(THERMAL_CONDUCTIVITY[el.z]).toLowerCase()===p;
  if(/^(?:electrical\s+conductivity|ec)$/.test(p))return Number.isFinite(EXTRA_CONDUCTIVITY[el.z]);
  if(/^(?:thermal\s+conductivity|tc)$/.test(p))return Number.isFinite(THERMAL_CONDUCTIVITY[el.z]);
  if(/^conductivity$/.test(p))return Number.isFinite(EXTRA_CONDUCTIVITY[el.z])||Number.isFinite(THERMAL_CONDUCTIVITY[el.z]);
  const bareSpec=PROPERTY_CATALOG.resolve(p);
  if(bareSpec?.kind==='dimension')return DATA_MODEL.abundance(el.z,bareSpec.dimension)!=null;

  /* Collection queries: stable-isotope data is a first-class collection. */
  m=p.match(/^(?:has\s+)?(?:stable\s+)?isotope\s+(\d+)$/);
  if(m)return DATA_MODEL.hasStableIsotope(el,parseInt(m[1],10));
  m=p.match(/^(?:any\s+)?stable\s+isotopes?\s+(above|below|over|under|greater than|less than)\s+(\d+(?:\.\d+)?)$/);
  if(m){const relation=m[1],n=parseFloat(m[2]),vals=DATA_MODEL.stableIsotopes(el.z);if(!vals.length)return false;const greater=/^(?:above|over|greater than)$/.test(relation);return vals.some(v=>greater?v>n:v<n);}
  m=p.match(/^all\s+stable\s+isotopes?\s+(above|below|over|under|greater than|less than)\s+(\d+(?:\.\d+)?)$/);
  if(m){const relation=m[1],n=parseFloat(m[2]),vals=DATA_MODEL.stableIsotopes(el.z);if(!vals.length)return false;const greater=/^(?:above|over|greater than)$/.test(relation);return vals.every(v=>greater?v>n:v<n);}
  /* Cross-dimension abundance comparison, e.g. "more abundant in humans than in crust". */
  m=p.match(/^(?:more|higher|greater|less|lower)\s+(?:abundant|common)\s+in\s+(?:the\s+)?(humans?|human body|universe|ocean|crust|earth(?:'s)? crust)\s+than\s+(?:in\s+)?(?:the\s+)?(humans?|human body|universe|ocean|crust|earth(?:'s)? crust)$/);
  if(m){
    const dim=a=>/human/.test(a)?'humans':/universe/.test(a)?'universe':/ocean/.test(a)?'ocean':'crust';
    const leftDim=dim(m[1]),rightDim=dim(m[2]),left=DATA_MODEL.abundance(el.z,leftDim),right=DATA_MODEL.abundance(el.z,rightDim);
    const leftMeta=PROPERTY_CATALOG.dimensionMeta(leftDim),rightMeta=PROPERTY_CATALOG.dimensionMeta(rightDim);
    if(!leftMeta||!rightMeta||leftMeta.kind!==rightMeta.kind||left==null||right==null)return false;
    const greater=/^(?:more|higher|greater)/.test(m[0]);return greater?left>right:left<right;
  }

  /* Tier 4 — relational comparisons. */
  m=p.match(/^(.+?)\s+between\s+(.+?)\s+and\s+(.+)$/);
  if(m){
    const prop=canonicalSearchProperty(m[1]);
    if(prop){
      const left=compareEndpoint(m[2],prop),right=compareEndpoint(m[3],prop);
      if(left&&right){
        const bounds=[...left.values,...right.values];
        const low=Math.min(...bounds),high=Math.max(...bounds);
        const vals=getPropValues(el,prop);
        return vals.some(v=>v>=low&&v<=high);
      }
    }
  }
  m=p.match(/^(.+?)\s+(above|below|over|under|greater than|less than|higher than|lower than|more than|than)\s+(.+)$/);
  if(m){
    const prop=canonicalSearchProperty(m[1]);
    if(prop){
      const relation=m[2],rhs=m[3].trim();
      const endpoint=compareEndpoint(rhs,prop);
      if(endpoint){
        const vals=getPropValues(el,prop);
        const endpointValues=endpoint.kind==='property'?getPropValues(el,endpoint.spec):endpoint.values;
        if(!vals.length||!endpointValues.length)return false;
        const greater=(relation==="than")?/^(?:more|higher|greater)\s+/.test(m[1].trim()):/^(?:above|over|greater than|higher than|more than)$/.test(relation);
        return vals.some(a=>endpointValues.some(b=>greater?a>b:a<b));
      }
    }
  }
  m=p.match(/(heavier|lighter)\s+than\s+(.+)/);
  if(m){const ref=findEl(m[2].trim());if(!ref)return false;return m[1]==='heavier'?el.mass>ref.mass:el.mass<ref.mass;}
  /* Discovery-year comparisons accept either a numeric year or another element
     as the endpoint.  Thus \"after Tantalum\" means after Tantalum's discovery year. */
  m=p.match(/^(?:year\s+)?(after|before)\s+(.+)$/);
  if(m){
    const endpoint=compareEndpoint(m[2].trim(),'year');
    if(!endpoint||!endpoint.values.length||el.year==null)return false;
    const target=endpoint.values[0];
    return m[1]==='after'?el.year>target:el.year<target;
  }
  m=p.match(/^(?:(?:year|years)\s+)?between\s+(?:years?\s+)?(\d{3,4})\s+and\s+(\d{3,4})$/);
  if(m){const y1=parseInt(m[1]),y2=parseInt(m[2]),low=Math.min(y1,y2),high=Math.max(y1,y2);return el.year!=null&&el.year>=low&&el.year<=high;}
  /* Phase thresholds can be numeric/temperature tokens OR element references.
     For an element reference, its melting point is used as the temperature
     threshold; this makes phrases such as "liquid below Lead" meaningful in
     exactly the same phase-at-temperature model as "liquid below 1000C". */
  m=p.match(/^(solid|liquid|gas|liquidorgas|solidorliquid)\s+(at|above|below|over|under)\s+(.+)$/);
  if(m){
    const want=m[1];
    const endpoint=compareEndpoint(m[3],'melt');
    const t=endpoint?.values?.[0];
    if(t==null)return false;
    const melt=KtoC(el.melt),boil=KtoC(el.boil);if(melt==null||boil==null)return false;
    if(want==='solid')return melt>t;if(want==='liquid')return melt<t&&boil>t;if(want==='gas')return boil<t;
    if(want==='liquidorgas')return melt<t;if(want==='solidorliquid')return boil>t;
  }
  m=p.match(/^(solid|liquid|gas|liquidorgas|solidorliquid)\s+between\s+(.+?)\s+and\s+(.+)/);
  if(m){
    const want=m[1];
    const left=compareEndpoint(m[2],'melt'),right=compareEndpoint(m[3],'melt');
    if(!left||!right)return false;
    const t1=left.values[0],t2=right.values[0];
    if(t1==null||t2==null)return false;
    const low=Math.min(t1,t2),high=Math.max(t1,t2),melt=KtoC(el.melt),boil=KtoC(el.boil);
    if(melt==null||boil==null)return false;
    if(want==='solid')return melt>low&&melt<high;if(want==='liquid')return melt<low&&boil>high;
    if(want==='gas')return boil>low&&boil<high;if(want==='liquidorgas')return melt<low;if(want==='solidorliquid')return boil>high;
  }

  /* Tier 5 — coarse boolean keywords. */
  if(p==='stable')return el.halflife===0;
  const ph=phase(el,tempC);
  if(p==='solid'||p==='liquid'||p==='gas')return ph===p;
  if(p==='toxic'){const idx=TOX.indexOf(el.tox);return idx>=2;} // Moderate, High, Very high
  if(/^(?:hazard|hazardous|harmful|danger|dangerous)$/.test(p)){
    const idx=TOX.indexOf(el.tox);
    return idx>=2||(el.halflife||0)>0;
  }
  if(/^(?:radioactive|radiation)$/.test(p))return (el.halflife||0)>0;
  if(/^(?:diamagnetic|paramagnetic|ferromagnetic|antiferromagnetic)$/.test(p))return magType(el.z,tempC).toLowerCase()===p;
  m=p.match(/^(?:toxicity\s*:?\s*)?(very low|very high|low|moderate|medium|high)(?:\s+toxicity)?$/);
  if(m){
    const level=m[1],t=(el.tox||'').toLowerCase();
    if(level==='very low')return t==='very low';
    if(level==='low')return t==='low';
    if(level==='moderate'||level==='medium')return t==='moderate';
    if(level==='high')return t==='high';
    if(level==='very high')return t.includes('very high');
  }

  /* Tier 6 — free-text substring fallback (element name/latin, occurrence
     sources, discovery source/country, region words). Gated to tokens of at
     least 3 characters so short ambiguous tokens like "au"/"in"/"at" don't
     spuriously match through unrelated fields (they're already resolved, or
     not, by Tier 1). Supports a handful of leading filler words ("from",
     "in", "discovered in", ...) and a couple of common country aliases. */
  let text=p;
  const fillerMatch=text.match(LEADING_SOURCE_FILLER);
  if(fillerMatch)text=text.slice(fillerMatch[0].length).trim();
  if(text.length>=3 || Object.prototype.hasOwnProperty.call(COUNTRY_ALIAS,text)){
    if(el.name.toLowerCase().includes(text))return true;
    if(el.latin&&el.latin.toLowerCase().includes(text))return true;
    const alias=COUNTRY_ALIAS[text];
    const src=(el.sources||'').toLowerCase();
    const discCountry=(el.discoveryCountry||'').toLowerCase();
    const discSource=(el.discoverySource||'').toLowerCase();
    if(src.includes(text)||(alias&&src.includes(alias)))return true;
    if(discCountry.includes(text)||(alias&&discCountry.includes(alias)))return true;
    if(discSource.includes(text))return true;
    if(text.includes('south america')&&/chile|peru|brazil|bolivia|argentina/.test(src))return true;
    if(text.includes('north america')&&/usa|canada|mexico/.test(src))return true;
    if(text.includes('asia')&&/china|india|kazakhstan|indonesia|japan|vietnam|uzbekistan|turkey|kyrgyzstan/.test(src))return true;
    if(text.includes('europe')&&/russia|poland|germany|belgium|spain|france|sweden|norway|finland|ukraine|belarus/.test(src))return true;
    if(text.includes('africa')&&/south africa|morocco|congo|guinea|namibia|gabon|rwanda/.test(src))return true;
    if(text.includes('oceania')&&/australia/.test(src))return true;
    if((text.includes('synthetic')||text.includes('nuclear'))&&/nuclear|accelerator/.test(src))return true;
  }
  return false;
}

function splitTop(text,re){const flags=re.flags.includes('g')?re.flags:re.flags+'g',rx=new RegExp(re.source,flags);const out=[];let last=0,m;while((m=rx.exec(text))){out.push(text.slice(last,m.index));last=m.index+m[0].length}out.push(text.slice(last));return out.map(s=>s.trim()).filter(Boolean)}
function protectRangeAnds(text){return text.replace(/\bbetween\s+([^,]+?)\s+and\s+([^,]+?)(?=\s*(?:,|$))/gi,(m,a,b)=>`between ${a} __AND__ ${b}`)}

/* Each AND-term may independently carry a leading "not", so "transition and
   not toxic and X" excludes toxic transition metals rather than (as before)
   silently failing to match "not toxic" as a literal string mid-chain. */
function evaluateAndExpression(group,tempC){
  const terms=splitTop(protectRangeAnds(group),/\band\b/gi).map(x=>x.replace(/__AND__/g,'and').trim()).filter(Boolean);
  if(!terms.length)return()=>false;
  return el=>terms.every(term=>{
    const negate=/^not\s+/.test(term);
    const body=negate?term.replace(/^not\s+/,'').trim():term;
    if(!body)return !negate;
    const result=evaluateCondition(el,body,tempC);
    return negate?!result:result;
  });
}

const SUPERLATIVE_RULES=[
  {prop:'stableIsotopeMax',dir:'desc',re:/\b(?:heaviest\s+stable\s+isotope)\b/i},
  {prop:'stableIsotopeMin',dir:'asc',re:/\b(?:lightest\s+stable\s+isotope)\b/i},
  {prop:'stableIsotopeAbundanceMax',dir:'desc',re:/\b(?:most\s+abundant\s+isotope)\b/i},
  {prop:'mass',dir:'desc',re:/\b(?:heaviest|most\s+(?:massive|heavy)|highest\s+(?:mass|atomic\s+mass))\b/i},
  {prop:'mass',dir:'asc',re:/\b(?:lightest|least\s+(?:massive|heavy)|lowest\s+(?:mass|atomic\s+mass))\b/i},
  {prop:'density',dir:'desc',re:/\b(?:densest|most\s+dense|highest\s+density)\b/i},
  {prop:'density',dir:'asc',re:/\b(?:least\s+dense|lowest\s+density)\b/i},
  {prop:'en',dir:'desc',re:/\b(?:most\s+electronegative|highest\s+electronegativity)\b/i},
  {prop:'en',dir:'asc',re:/\b(?:least\s+electronegative|lowest\s+electronegativity)\b/i},
  {prop:'melt',dir:'desc',re:/\b(?:highest\s+(?:melting(?:\s+point)?|melts)|most\s+resistant\s+to\s+melting)\b/i},
  {prop:'melt',dir:'asc',re:/\b(?:lowest\s+(?:melting(?:\s+point)?|melts)|easiest\s+to\s+melt)\b/i},
  {prop:'boil',dir:'desc',re:/\b(?:highest\s+(?:boiling(?:\s+point)?|boils))\b/i},
  {prop:'boil',dir:'asc',re:/\b(?:lowest\s+(?:boiling(?:\s+point)?|boils))\b/i},
  {prop:'thermal',dir:'desc',re:/\b(?:highest\s+thermal(?:\s+conductivity)?|most\s+thermally\s+conductive)\b/i},
  {prop:'thermal',dir:'asc',re:/\b(?:lowest\s+thermal(?:\s+conductivity)?|least\s+thermally\s+conductive)\b/i},
  {prop:'conductivity',dir:'desc',re:/\b(?:highest\s+electrical(?:\s+conductivity)?|most\s+(?:electrically\s+)?conductive)\b/i},
  {prop:'conductivity',dir:'asc',re:/\b(?:lowest\s+electrical(?:\s+conductivity)?|least\s+(?:electrically\s+)?conductive)\b/i},
  {prop:'ionization:1',dir:'desc',re:/\b(?:highest\s+first\s+ionization(?:\s+energy)?|highest\s+ionization(?:\s+energy)?|most\s+ionizable)\b/i},
  {prop:'ionization:1',dir:'asc',re:/\b(?:lowest\s+first\s+ionization(?:\s+energy)?|lowest\s+ionization(?:\s+energy)?|least\s+ionizable)\b/i},
  {prop:'ionization:2',dir:'desc',re:/\bhighest\s+second\s+ionization(?:\s+energy)?\b/i},
  {prop:'ionization:2',dir:'asc',re:/\blowest\s+second\s+ionization(?:\s+energy)?\b/i},
  {prop:'ionization:3',dir:'desc',re:/\bhighest\s+third\s+ionization(?:\s+energy)?\b/i},
  {prop:'ionization:3',dir:'asc',re:/\blowest\s+third\s+ionization(?:\s+energy)?\b/i},
  {prop:'ionization:4',dir:'desc',re:/\bhighest\s+fourth\s+ionization(?:\s+energy)?\b/i},
  {prop:'ionization:4',dir:'asc',re:/\blowest\s+fourth\s+ionization(?:\s+energy)?\b/i},
  {prop:'ionization:5',dir:'desc',re:/\bhighest\s+fifth\s+ionization(?:\s+energy)?\b/i},
  {prop:'ionization:5',dir:'asc',re:/\blowest\s+fifth\s+ionization(?:\s+energy)?\b/i},
  {prop:'ionization:6',dir:'desc',re:/\bhighest\s+sixth\s+ionization(?:\s+energy)?\b/i},
  {prop:'ionization:6',dir:'asc',re:/\blowest\s+sixth\s+ionization(?:\s+energy)?\b/i},
  {prop:'ionization:7',dir:'desc',re:/\bhighest\s+seventh\s+ionization(?:\s+energy)?\b/i},
  {prop:'ionization:7',dir:'asc',re:/\blowest\s+seventh\s+ionization(?:\s+energy)?\b/i},
  {prop:'ionization:8',dir:'desc',re:/\bhighest\s+eighth\s+ionization(?:\s+energy)?\b/i},
  {prop:'ionization:8',dir:'asc',re:/\blowest\s+eighth\s+ionization(?:\s+energy)?\b/i},
  {prop:'year',dir:'asc',re:/\b(?:earliest\s+discovered|earliest\s+discovery|oldest\s+discovery)\b/i},
  {prop:'year',dir:'desc',re:/\b(?:latest\s+discovered|latest\s+discovery|newest\s+discovery)\b/i},
  {prop:'abundance:ocean',dir:'desc',re:/\b(?:most\s+(?:abundant|common)\s+in\s+(?:the\s+)?ocean|highest\s+ocean\s+abundance)\b/i},
  {prop:'abundance:ocean',dir:'asc',re:/\b(?:least\s+(?:abundant|common)\s+in\s+(?:the\s+)?ocean|lowest\s+ocean\s+abundance)\b/i},
  {prop:'abundance:universe',dir:'desc',re:/\b(?:most\s+(?:abundant|common)\s+in\s+(?:the\s+)?universe|highest\s+universe\s+abundance)\b/i},
  {prop:'abundance:universe',dir:'asc',re:/\b(?:least\s+(?:abundant|common)\s+in\s+(?:the\s+)?universe|lowest\s+universe\s+abundance)\b/i},
  {prop:'abundance:humans',dir:'desc',re:/\b(?:most\s+(?:abundant|common)\s+in\s+(?:the\s+)?(?:human\s+body|humans?)|highest\s+human(?:s)?\s+abundance)\b/i},
  {prop:'abundance:humans',dir:'asc',re:/\b(?:least\s+(?:abundant|common)\s+in\s+(?:the\s+)?(?:human\s+body|humans?)|lowest\s+human(?:s)?\s+abundance)\b/i},
  {prop:'abundance:crust',dir:'desc',re:/\b(?:most\s+abundant|most\s+common|highest\s+(?:crust|crustal)\s+abundance)\b/i},
  {prop:'abundance:crust',dir:'asc',re:/\b(?:least\s+abundant|least\s+common|lowest\s+(?:crust|crustal)\s+abundance)\b/i},
];
function applySuperlative(query,tempC){
  let q=query.trim().replace(/^the\s+/i,'');
  const rule=SUPERLATIVE_RULES.find(r=>r.re.test(q));
  if(!rule)return null;
  const plural=/\b(?:elements|items)\b/i.test(q)||q.includes('__ELEMENTS_PLURAL__');
  const qualifier=q.replace(rule.re,' ').replace(/\b(?:the|element|elements|items)\b/gi,' ').replace(/__ELEMENTS_PLURAL__/g,' ').replace(/\s+/g,' ').trim();
  const n=plural?10:1;
  let pool=elements.slice();
  if(qualifier)pool=pool.filter(parseQuery(qualifier,tempC));
  const valueOf=e=>getPropValue(e,rule.prop);
  const ranked=pool.filter(e=>{const v=valueOf(e);return v!=null&&Number.isFinite(v)}).sort((a,b)=>{
    const av=valueOf(a),bv=valueOf(b),d=rule.dir==='asc'?av-bv:bv-av;
    return d||a.z-b.z;
  });
  return new Set(ranked.slice(0,n).map(e=>e.z));
}
function intersectAll(sets){
  if(!sets.length)return new Set();
  let acc=sets[0];
  for(let i=1;i<sets.length&&acc.size;i++)acc=new Set([...acc].filter(z=>sets[i].has(z)));
  return acc;
}
function unionAll(sets){const out=new Set();for(const s of sets)for(const z of s)out.add(z);return out;}
function isSimpleCommaSelector(part){
  const s=part.trim();
  if(!s)return false;
  /* Smart-comma fallback is deliberately limited to simple selectors.
     This preserves useful lists like "liquid, solid, gas" and
     "gold, silver, platinum" without turning an impossible chained query
     such as "Italy, Australia, melts above Fe" into a huge accidental union. */
  return !/(?:\band\b|\bor\b|\bbetween\b|\b(?:above|below|over|under|after|before|at)\b|\b(?:greater|less|higher|lower|more|fewer|heavier|lighter|denser|smaller)\s+than\b)/i.test(s);
}
function parseQuery(query,tempC){
  if(!query.trim())return()=>true;
  const q=normalizeQuery(query.trim());
  const commaParts=splitTop(protectRangeAnds(q),/,/).map(x=>x.replace(/__AND__/g,'and').trim()).filter(Boolean);
  if(!commaParts.length)return()=>false;
  /* A comma clause is a complete natural-language expression.  In particular,
     a superlative may own a relational qualifier inside one clause even when the
     overall query also contains other comma clauses. */
  if(commaParts.length===1){
    const top=applySuperlative(commaParts[0],tempC);
    if(top)return el=>top.has(el.z);
  }

  /* Precedence: comma/AND bind more tightly than OR.
     Each comma part is therefore an AND-clause that may itself carry OR alternatives.
     Example: "Italy or Australia, melts above Fe" becomes
     (Italy OR Australia) AND (melts above Fe). */
  const clauseSets=commaParts.map(part=>{
    const andTerms=splitTop(protectRangeAnds(part),/\band\b/gi)
      .map(x=>x.replace(/__AND__/g,'and').trim()).filter(Boolean);
    const termSets=andTerms.map(term=>{
      const alternatives=splitTop(term,/\bor\b/gi).map(x=>x.trim()).filter(Boolean);
      const altSets=alternatives.map(alt=>{
        const negate=/^not\s+/.test(alt);
        const body=negate?alt.replace(/^not\s+/,'').trim():alt;
        if(!body)return new Set();
        const top=applySuperlative(body,tempC);
        if(top){
          if(!negate)return new Set(top);
          const excluded=new Set(top);
          return new Set(elements.filter(e=>!excluded.has(e.z)).map(e=>e.z));
        }
        const pred=el=>{const result=evaluateCondition(el,body,tempC);return negate?!result:result;};
        return new Set(elements.filter(pred).map(e=>e.z));
      });
      return unionAll(altSets);
    });
    return intersectAll(termSets);
  });

  let finalSet=intersectAll(clauseSets);
  /* Comma means smart AND first.  The OR/union fallback is deliberately limited
     to list-like clauses: simple selectors and complete superlative expressions.
     A compound relational clause such as \"Italy or Australia, melts above Fe...\"
     must not silently broaden into a union just because its intersection is empty. */
  if(!finalSet.size && commaParts.length>1 && commaParts.every(part=>
    isSimpleCommaSelector(part) || !!applySuperlative(part,tempC)
  )) finalSet=unionAll(clauseSets);
  return el=>finalSet.has(el.z);
}
/* SearchEngine owns query execution and a bounded result cache. Parsing helpers remain pure,
   while the class prevents duplicate full-table filtering during repeated UI renders. */
class SearchEngine {
  constructor(items){this.items=items;this.cache=new Map();this.maxCache=48;}
  clear(){this.cache.clear();}
  filter(text,tempC){
    const raw=String(text||'').trim();
    if(!raw)return this.items.slice();
    const key=`${raw.toLowerCase()}\u0000${tempC}`;
    const hit=this.cache.get(key);
    if(hit)return hit.slice();
    const predicate=parseQuery(raw,tempC);
    const result=this.items.filter(predicate);
    this.cache.set(key,result);
    if(this.cache.size>this.maxCache)this.cache.delete(this.cache.keys().next().value);
    return result.slice();
  }
}
const SEARCH_ENGINE=new SearchEngine(elements);
function applyFilter(text,tempC){return SEARCH_ENGINE.filter(text,tempC)}
const table=document.getElementById("table"),details=document.getElementById("details"),tempSlider=document.getElementById("temp"),tempValue=document.getElementById("tempValue"),tempEdit=document.getElementById("tempEdit"),tempConfirm=document.getElementById("tempConfirm"),tempCancel=document.getElementById("tempCancel"),searchInput=document.getElementById("search"),resetBtn=document.getElementById("resetTemp"),noResults=document.getElementById("noResults"),helpLink=document.getElementById("helpLink"),helpModal=document.getElementById("helpModal"),closeHelp=document.getElementById("closeHelp"),tempMinus=document.getElementById("tempMinus"),tempPlus=document.getElementById("tempPlus"),filterCount=document.getElementById("filterCount"),histBtn=document.getElementById("histBtn"),histIco=document.getElementById("histIco"),histCount=document.getElementById("histCount"),isearchBar=document.getElementById("isearchBar"),isearchMatch=document.getElementById("isearchMatch"),isearchPos=document.getElementById("isearchPos"),helpSearch=document.getElementById("helpSearch");
const SEARCH_PLACEHOLDER=searchInput.getAttribute("placeholder")||"";
function escapeHTML(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
const versionHeaderEl=document.getElementById("appVersionHeader"),versionAboutEl=document.getElementById("appVersionAbout");
if(versionHeaderEl)versionHeaderEl.textContent=`v${APP_VERSION}`;
if(versionAboutEl)versionAboutEl.textContent=APP_VERSION;
let currentTempC=25,selected=null,comparisonMode=false,detailsLocked=false,elementMode="neutral",lastClickedPos={row:0,col:0},focusedElement=null,editingTemp=false,detailsTab="basic",tempEditReturnFocus=null,tabChordToggled=false;
function tempColor(tC){const frac=Math.max(0,Math.min(1,(tC+273)/6273));return`hsl(${240-frac*240},85%,50%)`}
function updateTempDisplay(){tempValue.textContent=`${currentTempC} °C  |  ${CtoF(currentTempC)} °F  |  ${CtoK(currentTempC)} K`}
function renderSelectionState(){
  elementDivs.forEach((d,z)=>d.classList.toggle("active",!!selected&&selected.z===z));
  table.classList.toggle("details-locked",detailsLocked);
  table.classList.toggle("comparison-mode",comparisonMode);
}
function clearSelectionUI(){
  selected=null;detailsLocked=false;comparisonMode=false;elementMode="neutral";
  renderSelectionState();
  details.innerHTML=`<h2>Hover or tap an element</h2><div class="details-header-bar"></div><p>Temperature changes phase badges.<br>Left-click selects and locks Details.<br>Right-click selects and starts comparison mode.</p>`;
}
function activateElementMode(el,button,div){
  table.focus({preventScroll:true});
  const pos=POS[el.z]; if(pos)lastClickedPos={row:pos[0]-1,col:pos[1]-1};
  if(div){
    div.classList.remove("spin");void div.offsetWidth;div.classList.add("spin");
    setTimeout(()=>div.classList.remove("spin"),650);
  }
  const same=!!selected&&selected.z===el.z;
  const targetMode=button==="left"?"selection":"comparison";

  if(same && elementMode===targetMode){
    clearSelectionUI();
    return;
  }

  // Clicking the opposite button on the current selection switches modes while
  // keeping that element selected. Clicking a different element always starts
  // a fresh mode with the newly selected element.
  selected=el;
  elementMode=targetMode;
  comparisonMode=targetMode==="comparison";
  detailsLocked=targetMode==="selection";
  renderSelectionState();
  showDetails(selected);
}

/* TableRenderer owns DOM creation and temperature-only updates. Temperature slider events
   update existing nodes instead of rebuilding the entire 118-element grid. */
class TableRenderer {
  constructor(tableEl,items){this.table=tableEl;this.items=items;this.elementDivs=new Map();this.prevPhase=new Map();}
  updateTemperature(tempC){
    const color=tempColor(tempC),changes=[];
    this.elementDivs.forEach((div,z)=>{
      const el=div.__element;if(!el)return;
      const next=phase(el,tempC),prev=this.prevPhase.get(z);
      const overlay=div.querySelector('.temp-overlay'),badge=div.querySelector('.badge');
      if(overlay)overlay.style.background=color;
      if(badge){badge.innerHTML=next==='solid'?badgeSolid:next==='liquid'?badgeLiquid:next==='gas'?badgeGas:'';badge.style.display=next?'block':'none';}
      if(prev&&prev!==next&&next!=='')changes.push(div);
      this.prevPhase.set(z,next);
    });
    if(changes.length){
      requestAnimationFrame(()=>requestAnimationFrame(()=>{
        for(const d of changes){d.classList.remove('pop-glow');void d.offsetWidth;d.classList.add('pop-glow');setTimeout(()=>d.classList.remove('pop-glow'),750);}
      }));
    }
  }
  render(filterText=''){
    this.table.innerHTML='';this.elementDivs.clear();this.prevPhase.clear();noResults.style.display='none';
    const filtered=applyFilter(filterText,currentTempC),hasFilter=filterText.trim().length>0,filteredZ=new Set(filtered.map(e=>e.z));
    filterCount.textContent=`${filtered.length} / ${this.items.length}`;
    if(filtered.length===0){noResults.style.display='flex';noResults.textContent=`No elements found for “${filterText}”`;}
    const grid=Array.from({length:9},()=>Array(18).fill(null));
    this.items.forEach(el=>{const pos=POS[el.z];if(pos)grid[pos[0]-1][pos[1]-1]=el;});
    const color=tempColor(currentTempC);
    for(let r=0;r<9;r++)for(let c=0;c<18;c++){
      const el=grid[r][c],div=document.createElement('div');
      if(!el){div.className='el spacer';this.table.appendChild(div);continue;}
      const currentPhase=phase(el,currentTempC);
      div.className=`el ${el.cat}`;
      if(selected&&selected.z===el.z)div.classList.add('active');
      if(hasFilter)div.classList.add(filteredZ.has(el.z)?'match':'dimmed');
      div.__element=el;
      const overlay=document.createElement('div');overlay.className='temp-overlay';overlay.style.background=color;div.appendChild(overlay);
      const badge=document.createElement('div');badge.className='badge';badge.innerHTML=currentPhase==='solid'?badgeSolid:currentPhase==='liquid'?badgeLiquid:currentPhase==='gas'?badgeGas:'';badge.style.display=currentPhase?'block':'none';div.appendChild(badge);
      div.insertAdjacentHTML('afterbegin',`<span class="z">${el.z}</span><span class="sym">${el.sym}</span><span class="name">${el.name}</span>`);
      this.elementDivs.set(el.z,div);this.prevPhase.set(el.z,currentPhase);
      div.addEventListener('click',e=>{e.stopPropagation();activateElementMode(el,'left',div);});
      div.addEventListener('contextmenu',e=>{e.preventDefault();e.stopPropagation();activateElementMode(el,'right',div);});
      div.addEventListener('mouseenter',()=>{if(!detailsLocked||comparisonMode)showDetails(el);});
      this.table.appendChild(div);
    }
    if(filtered.length===1&&(!detailsLocked||comparisonMode))showDetails(filtered[0]);
  }
}
const TABLE_RENDERER=new TableRenderer(table,elements);
const elementDivs=TABLE_RENDERER.elementDivs;
function render(filterText=''){TABLE_RENDERER.render(filterText)}
function normalizeCriterionText(q){return String(q||"").trim().replace(/\s+/g," ").toLowerCase();}
function toggleSearchCriterion(criterion){
  const q=searchInput.value.trim();
  const parts=q?splitTop(protectRangeAnds(q),/,/).map(x=>x.replace(/__AND__/g,"and").trim()).filter(Boolean):[];
  const key=normalizeCriterionText(criterion);
  const idx=parts.findIndex(p=>normalizeCriterionText(p)===key);
  if(idx>=0)parts.splice(idx,1);else parts.push(String(criterion).trim());
  searchInput.value=parts.join(", ");
  searchInput.dispatchEvent(new Event("input"));
}
function handlePropertyClick(e){
  const tab=e.target.closest(".details-tab");if(tab){setDetailsTab(tab.dataset.tab);return}
  const target=e.target.closest(".clickable-prop");if(!target)return;
  const prop=target.dataset.prop,value=target.dataset.value;if(!prop||value==null||value==="")return;
  let query="";
  if(prop==="year"){const y=parseInt(value);if(isNaN(y))return;query=`year between ${Math.max(1,y-5)} and ${y+5}`}
  else if(prop==="discoverySource"){query=String(value)}
  else if(prop==="electricalConductivity"){const num=parseFloat(value);if(isNaN(num))return;const low=num*(1-TOLERANCE),high=num*(1+TOLERANCE);query=`ec between ${low} and ${high}`}
  else if(prop==="thermal"){const num=parseFloat(value);if(isNaN(num))return;const low=num*(1-TOLERANCE),high=num*(1+TOLERANCE);query=`tc between ${low} and ${high}`}
  else if(prop==="electricalType"){query=`electrical ${String(value)}`}
  else if(prop==="thermalType"){query=`thermal ${String(value)}`}
  else if(["discoveryCountry","occurrenceCountry"].includes(prop)){query=String(value)}
  else if(prop.startsWith("abundance:")){const num=parseFloat(value);if(isNaN(num))return;const dim=prop.split(":")[1];const label=dim==="humans"?"human abundance":`${dim} abundance`;const low=num*(1-TOLERANCE),high=num*(1+TOLERANCE);query=`${label} between ${low} and ${high}`}
  else if(prop.startsWith("ionization:")){const num=parseFloat(value);if(isNaN(num))return;const stage=parseInt(prop.split(":")[1],10),ord={1:"first",2:"second",3:"third",4:"fourth"}[stage]||`${stage}th`;const low=num*(1-TOLERANCE),high=num*(1+TOLERANCE);query=`${ord} ionization energy between ${low} and ${high}`}
  else if(prop==="stableIsotope"){query=`has stable isotope ${value}`}
  else if(prop==="specificHeat"){const num=parseFloat(value);if(isNaN(num))return;const low=num*(1-TOLERANCE),high=num*(1+TOLERANCE);query=`specific heat between ${low} and ${high}`}
  else if(prop==="phase"){query=value}
  else if(prop==="oxidation"){query=`oxidation: ${value}`}
  else if(["magnetism","category","toxicity","radiation"].includes(prop)){query=`${prop}: ${value}`}
  else{const num=parseFloat(value);if(isNaN(num))return;const low=num*(1-TOLERANCE),high=num*(1+TOLERANCE);let propName=prop;if(prop==="melt")propName="melts";else if(prop==="boil")propName="boils";const fmt=n=>{const a=Math.abs(n);return a>=100?n.toFixed(2):a>=1?n.toFixed(3):n.toPrecision(4)};query=`${propName} between ${fmt(low)} and ${fmt(high)}`}
  if(e.shiftKey){toggleSearchCriterion(query)}else{searchInput.value=query;searchInput.dispatchEvent(new Event("input"));}
  searchInput.focus();
}
function setupPropertyClicks(){details.onclick=handlePropertyClick;}
function escapeHtml(v){return String(v??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");}
const COUNTRY_FLAG={
  "Brazil":"🇧🇷","USA":"🇺🇸","United States":"🇺🇸","United Kingdom":"🇬🇧","Sweden":"🇸🇪","Chile":"🇨🇱","Germany":"🇩🇪","France":"🇫🇷","Switzerland":"🇨🇭","Spain":"🇪🇸","Italy":"🇮🇹","Austria":"🇦🇹","Denmark":"🇩🇰","Finland":"🇫🇮","Russia":"🇷🇺","Japan":"🇯🇵","Mexico":"🇲🇽","Peru":"🇵🇪","Romania":"🇷🇴","China":"🇨🇳","India":"🇮🇳","Canada":"🇨🇦","Belgium":"🇧🇪","Poland":"🇵🇱","South Africa":"🇿🇦","South Korea":"🇰🇷","Australia":"🇦🇺","Ukraine":"🇺🇦","Norway":"🇳🇴","Brazil":"🇧🇷","Belarus":"🇧🇾","Bulgaria":"🇧🇬","Czech Republic":"🇨🇿","Greece":"🇬🇷","Hungary":"🇭🇺","Ireland":"🇮🇪","Israel":"🇮🇱","Kazakhstan":"🇰🇿","Kyrgyzstan":"🇰🇬","Myanmar":"🇲🇲","Philippines":"🇵🇭","Portugal":"🇵🇹","Turkey":"🇹🇷","Vietnam":"🇻🇳","DR Congo":"🇨🇩","Zimbabwe":"🇿🇼","Guinea":"🇬🇳","Gabon":"🇬🇦","Morocco":"🇲🇦","South America":"🌎","Worldwide":"🌍"
};
const COUNTRY_CODE={
  England:"GB", Scotland:"GB", Brazil:"BR", USA:"US", "United States":"US", "United Kingdom":"GB",
  Sweden:"SE", Chile:"CL", Germany:"DE", France:"FR", Switzerland:"CH", Spain:"ES", Italy:"IT",
  Austria:"AT", Denmark:"DK", Finland:"FI", Russia:"RU", Japan:"JP", Mexico:"MX", Peru:"PE",
  Romania:"RO", China:"CN", India:"IN", Canada:"CA", Belgium:"BE", Poland:"PL",
  "South Africa":"ZA", "South Korea":"KR", Australia:"AU", Ukraine:"UA", Norway:"NO",
  Belarus:"BY", Bulgaria:"BG", "Czech Republic":"CZ", Greece:"GR", Hungary:"HU", Ireland:"IE",
  Israel:"IL", Kazakhstan:"KZ", Kyrgyzstan:"KG", Myanmar:"MM", Philippines:"PH", Portugal:"PT",
  Turkey:"TR", Vietnam:"VN", "DR Congo":"CD", Zimbabwe:"ZW", Guinea:"GN", Gabon:"GA", Morocco:"MA"
};
function countryFlagEmoji(code){
  return /^[A-Z]{2}$/.test(code) ? [...code].map(ch=>String.fromCodePoint(127397+ch.charCodeAt(0))).join("") : "";
}
function flagHtml(country,prop="discoveryCountry"){
  const code=COUNTRY_CODE[country]||"";
  const rendered=countryFlagEmoji(code)||escapeHtml(code);
  return `<span class="country-code clickable-prop" data-country-name="${escapeHtml(country)}" title="${escapeHtml(country)}" data-prop="${prop}" data-value="${escapeHtml(country)}">${rendered}</span>`;
}
function sourceHtml(source){
  return COUNTRY_CODE[source] ? flagHtml(source,"occurrenceCountry") : escapeHtml(source);
}
function toxicityLabel(v){ return v==="Very high / Toxic"?"Very High":(v||"—"); }
function compactList(items,limit=3,mapper=v=>escapeHtml(v)){
  const arr=items.filter(Boolean); if(!arr.length)return"—";
  const body=arr.slice(0,limit).map(mapper).join(", ");
  if(arr.length<=limit)return body;
  return `<span class="hoverable-prop truncated-prop" title="${escapeHtml(arr.join(", "))}">${body}, ...</span>`;
}
function nuclideHtml(el){return `<span class="nuclide nuclide-header" aria-label="mass ${Math.round(el.mass)}, atomic number ${el.z}, ${el.sym}"><span class="nuclide-mass">${Math.round(el.mass)}</span><span class="nuclide-z">${el.z}</span><span class="nuclide-symbol">${el.sym}</span></span>`;}
function isotopeNuclideHtml(sym,mass){return `<span class="nuclide nuclide-isotope" aria-label="isotope mass ${mass} ${sym}"><span class="nuclide-mass">${mass}</span><span class="nuclide-symbol">${sym}</span></span>`;}
function positionFloatingTip(target,tip){
  const r=target.getBoundingClientRect();
  const w=tip.offsetWidth||220,h=tip.offsetHeight||120,g=6;
  let left=Math.min(Math.max(8,r.left),window.innerWidth-w-8);
  let top=r.bottom+g; if(top+h>window.innerHeight-8)top=Math.max(8,r.top-h-g);
  tip.style.left=`${left}px`; tip.style.top=`${top}px`;
}
function clickableValue(prop,value,label=value,extraClass=""){return `<span class="clickable-prop ${extraClass}" data-prop="${escapeHtml(prop)}" data-value="${escapeHtml(value)}">${label}</span>`;}
function hoverValue(label,body=""){return `<span class="hoverable-prop" title="Hover for more information">${label}${body}</span>`;}
function quickTable(summary,headers,rows,title="Hover for details") {
  const head=headers.map(h=>`<th>${escapeHtml(h)}</th>`).join("");
  const body=rows.join("");
  return `<span class="hoverable-prop quick-table-trigger" title="${escapeHtml(title)}" data-quick-table="1" data-quick-title="${escapeHtml(title)}">${summary}<span class="quick-table-template"><table><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table></span></span>`;
}
function summaryList(items,limit=3,mapper=v=>escapeHtml(v)){
  const arr=items.filter(Boolean);
  if(!arr.length)return "—";
  const shown=arr.slice(0,limit).map(mapper).join(", ");
  return arr.length>limit?`${shown}, ...`:shown;
}
function wireQuickTables(){
  const triggers=details.querySelectorAll('.quick-table-trigger');
  let hideTimer=null;
  const hide=()=>{
    if(hideTimer)clearTimeout(hideTimer);
    hideTimer=setTimeout(()=>{
      document.querySelectorAll('.quick-table-portal').forEach(x=>x.remove());
      hideTimer=null;
    },70);
  };
  const show=(trigger)=>{
    if(hideTimer)clearTimeout(hideTimer);
    document.querySelectorAll('.quick-table-portal').forEach(x=>x.remove());
    const source=trigger.querySelector('.quick-table-template');
    if(!source)return;
    const portal=document.createElement('div');
    portal.className='quick-table-portal';
    portal.innerHTML=source.innerHTML;
    portal.setAttribute('role','tooltip');
    portal.setAttribute('aria-label',trigger.dataset.quickTitle||'Additional information');
    document.body.appendChild(portal);
    requestAnimationFrame(()=>positionFloatingTip(trigger,portal));
    portal.addEventListener('mouseenter',()=>{if(hideTimer)clearTimeout(hideTimer);});
    portal.addEventListener('mouseleave',hide);
    portal.addEventListener('click',e=>{
      const target=e.target.closest('.clickable-prop');
      if(!target)return;
      handlePropertyClick(e);
      portal.remove();
    });
  };
  triggers.forEach(trigger=>{
    trigger.addEventListener('mouseenter',()=>show(trigger));
    trigger.addEventListener('mouseleave',hide);
  });
}
function ordinalLabel(n){const map={1:'1st',2:'2nd',3:'3rd'};return map[n]||`${n}th`;}
function formatAbundanceDimension(dimension,value){
  if(value==null)return'—';
  if(dimension==='ocean'){
    if(value===0)return'0 mg/L';
    if(Math.abs(value)>=1)return`${parseFloat(value.toPrecision(5))} mg/L`;
    return`${parseFloat(value.toPrecision(4))} mg/L`;
  }
  return formatAbundance(value);
}
function abundanceDistributionTable(el){
  const defs=[['crust','Crust'],['ocean','Ocean'],['universe','Universe'],['humans','Human body']];
  const available=defs.map(([dim,label])=>({dim,label,value:DATA_MODEL.abundance(el.z,dim)})).filter(x=>x.value!=null);
  if(!available.length)return'—';
  const first=available[0];
  const firstValue=formatAbundanceDimension(first.dim,first.value);
  const summaryValue=Number.isFinite(first.value)&&first.value>=0
    ? clickableValue(`abundance:${first.dim}`,first.value,`${escapeHtml(first.label)}: ${escapeHtml(firstValue)}`,'distribution-value')
    : `${escapeHtml(first.label)}: ${escapeHtml(firstValue)}`;
  const summary=available.length>1?`${summaryValue}, ...`:summaryValue;
  const rows=available.map(x=>{
    const clickable=Number.isFinite(x.value)&&x.value>=0;
    const valueHtml=clickable?clickableValue(`abundance:${x.dim}`,x.value,formatAbundanceDimension(x.dim,x.value),'distribution-value'):escapeHtml(formatAbundanceDimension(x.dim,x.value));
    return `<tr><td>${escapeHtml(x.label)}</td><td>${valueHtml}</td></tr>`;
  });
  return quickTable(summary,['Environment','Abundance'],rows,'Hover for abundance distribution');
}
function ionizationTable(el){
  const vals=getIonizations(el.z);if(!vals.length)return'—';
  const first=vals[0];
  const firstHtml=clickableValue('ionization:1',first,`${parseFloat(first.toPrecision(6))} kJ/mol`,'distribution-value');
  const summary=vals.length>1?`${firstHtml}, ...`:firstHtml;
  const rows=vals.map((v,i)=>{
    const stage=i+1;
    const value=clickableValue(`ionization:${stage}`,v,`${parseFloat(v.toPrecision(6))} kJ/mol`,'distribution-value');
    return `<tr><td>${ordinalLabel(stage)}</td><td>${value}</td></tr>`;
  });
  return quickTable(summary,['Ionization','Energy'],rows,'Hover for ionization energies');
}
function isotopeTable(el){
  const masses=DATA_MODEL.stableIsotopes(el.z),abs=DATA_MODEL.isotopeAbundances(el.z);
  if(!masses.length)return'—';
  const first=masses[0];
  const firstHtml=clickableValue('stableIsotope',first,isotopeNuclideHtml(el.sym,first),'distribution-value');
  const summary=masses.length>1?`${firstHtml}, ...`:firstHtml;
  const rows=masses.map((mass,i)=>{
    const massHtml=clickableValue('stableIsotope',mass,isotopeNuclideHtml(el.sym,mass),'distribution-value');
    const abundance=Number.isFinite(abs[i])?parseFloat((abs[i]*100).toPrecision(5))+'%':'—';
    return `<tr><td>${massHtml}</td><td>${abundance}</td></tr>`;
  });
  return quickTable(summary,['Isotope','Natural abundance'],rows,'Hover for stable isotope data');
}
function showDetails(el){
  const meltC=KtoC(el.melt),boilC=KtoC(el.boil),neutrons=Math.round(el.mass-el.z),ph=phase(el,currentTempC),cmp=(comparisonMode&&selected&&selected.z!==el.z)?selected:null;
  const magVal=magType(el.z,currentTempC);
  const line=(label,value,a,b,clickable=false,propData=null)=>{const ar=(cmp&&a!=null&&b!=null)?arrow(a,b):"";let valueHtml=value;if(clickable&&propData){const attrs=Object.entries(propData).map(([k,v])=>`data-${k}="${escapeHtml(v)}"`).join(" ");valueHtml=`<span class="clickable-prop" ${attrs}>${value}</span>`;}return`<div class="detail-row"><strong>${label}:</strong> ${valueHtml}${ar}</div>`;};
  const tempDisplay=`${currentTempC} °C  |  ${CtoF(currentTempC)} °F  |  ${CtoK(currentTempC)} K`;
  const title=`${nuclideHtml(el)} — ${el.name} <span class="additional-info">(${el.latin||'—'})</span>`;
  let basic=`<div class="detail-section ${detailsTab==='basic'?'active':''}" data-section="basic">`;
  basic+=line("Latin name",el.latin||'—');
  basic+=line("Atomic number (Z)",el.z);
  basic+=line("Approx. neutrons",neutrons);
  basic+=line("Atomic mass / g·mol⁻¹",el.mass.toFixed(3)+" g/mol",el.mass,cmp?.mass,true,{prop:"mass",value:el.mass});
  basic+=line("Density",el.density!=null?el.density+" g/cm³":"—",el.density,cmp?.density,el.density!=null,{prop:"density",value:el.density});
  basic+=line("Electron config",el.config||"—");
  const oxidStr=el.oxidation>0?"+"+el.oxidation:String(el.oxidation);basic+=line("Common oxidation state",oxidStr,null,null,true,{prop:"oxidation",value:el.oxidation});basic+=line("Category",el.cat,null,null,true,{prop:"category",value:el.cat});
  const meltVal=meltC!=null?meltC.toFixed(1):null,boilVal=boilC!=null?boilC.toFixed(1):null;
  basic+=line("Melting point",meltVal?`${meltVal} °C / ${CtoF(meltC)} °F / ${CtoK(meltC)} K`:"—",meltC,cmp?KtoC(cmp.melt):null,meltVal!=null,{prop:"melt",value:meltVal});
  basic+=line("Boiling point",boilVal?`${boilVal} °C / ${CtoF(boilC)} °F / ${CtoK(boilC)} K`:"—",boilC,cmp?KtoC(cmp.boil):null,boilVal!=null,{prop:"boil",value:boilVal});
  basic+=line("Phase at "+currentTempC+" °C",ph||"unknown",null,null,ph!=="",{prop:"phase",value:ph});basic+='</div>';
  let extra=`<div class="detail-section ${detailsTab==='extra'?'active':''}" data-section="extra">`;
  extra+=line("Electronegativity",el.en!=null?el.en:"—",el.en,cmp?.en,el.en!=null,{prop:"en",value:el.en});
  const ions=getIonizations(el.z),firstIE=ions[0]??el.ie;
  extra+=line("Ionization energies",firstIE!=null?ionizationTable(el):"—",firstIE,cmp?getIonizations(cmp.z)[0]:null,false,null);
  const e0str=el.e0!==0?el.e0.toFixed(2):null;extra+=line("Standard electrode potential (E°)",e0str?e0str+" V":"—",el.e0!==0?el.e0:null,cmp&&cmp.e0!==0?cmp.e0:null,e0str!=null,{prop:"e0",value:e0str});
  extra+=line("Radiation Level",el.halflife>0?"Radioactive":"—",null,null,true,{prop:"radiation",value:el.halflife>0?"Radioactive":"—"});extra+=line("Half-life",formatHalfLife(el.halflife));
  extra+=line("Toxicity Level",toxicityLabel(el.tox),null,null,true,{prop:"toxicity",value:el.tox});extra+=line("Magnetic response",magVal,null,null,true,{prop:"magnetism",value:magVal});
  const yearPart=el.year!=null?clickableValue("year",el.year,el.year):"Ancient / unknown";
  const sourcePart=el.discoverySource?`, ${clickableValue("discoverySource",el.discoverySource,escapeHtml(el.discoverySource))}`:"";
  const countryPart=el.discoveryCountry?` ${el.discoveryCountry.split(/\s+and\s+/i).map(c=>flagHtml(c)).join(" ")}`:"";
  extra+=line("Discovery",yearPart+sourcePart+countryPart);
  extra+=line("Abundance Distribution",abundanceDistributionTable(el));
  const srcArr=(el.sources||"").split(/,\s*/).filter(Boolean);extra+=line("Known Occurencies",compactList(srcArr,3,sourceHtml));
  const conductivity=EXTRA_CONDUCTIVITY[el.z],heat=EXTRA_HEAT[el.z],thermal=THERMAL_CONDUCTIVITY[el.z];
  extra+=line("Electrical conductivity",`${clickableValue("electricalConductivity",conductivity??"",conductivity!=null?(conductivity===0?"~0 S/m":conductivity.toExponential(3)+" S/m"):"—")} ${clickableValue("electricalType",ELECTRICAL_TYPE[el.z]||"N/A",ELECTRICAL_TYPE[el.z]||"N/A","additional-info")}`);
  const tType=thermalType(thermal);
  extra+=line("Thermal conductivity",`${clickableValue("thermal",thermal??"",thermal!=null?thermal+" W/(m·K)":"—")} ${clickableValue("thermalType",tType,tType,"additional-info")}`);
  extra+=line("Specific heat",heat!=null?clickableValue("specificHeat",heat,heat+" J/g·K"):"—");
  extra+=line("Stable isotopes",isotopeTable(el));extra+='</div>';
  let html=`<h2>${title}</h2><div class="details-header-bar"></div><p style="margin-bottom:4px;color:var(--accent);font-weight:500;">🌡️ ${tempDisplay}</p>`;if(cmp)html+=`<p><em style="color:var(--accent)">Comparing with ${cmp.sym} (${cmp.name})</em></p>`;html+=`<div class="details-tabs"><button class="details-tab ${detailsTab==='basic'?'active':''}" data-tab="basic">Basic</button><button class="details-tab ${detailsTab==='extra'?'active':''}" data-tab="extra">Extra</button></div>${basic}${extra}`;details.innerHTML=html;
  wireQuickTables();
  setupPropertyClicks();
}

function setDetailsTab(tab){if(tab!=="basic"&&tab!=="extra")return;detailsTab=tab;details.querySelectorAll('.details-tab').forEach(b=>b.classList.toggle('active',b.dataset.tab===tab));details.querySelectorAll('.detail-section').forEach(s=>s.classList.toggle('active',s.dataset.section===tab))}
function changeTemp(delta){
  const v=Math.max(-273,Math.min(6000,+tempSlider.value+delta));
  tempSlider.value=v;tempSlider.dispatchEvent(new Event("input"));
}
const tempBox=document.querySelector(".temp-box");
/* =====================================================================
   Bash-style search history
   - Ring buffer capped at HIST_MAX; oldest entry drops when full.
   - Entries are "settled" queries: because search is incremental (no Enter
     needed) we commit on an idle timer that restarts on every keystroke,
     and also immediately on Enter / blur, so a query is only recorded once
     the user has actually stopped typing it.
   - Persisted across page loads via localStorage, falling back to a cookie,
     falling back to memory-only (file:// pages block one or both in some
     browsers, so all three layers are wrapped in try/catch).
   ===================================================================== */
const HIST_MAX=50, HIST_KEY="apt.searchHistory.v1", HIST_IDLE_MS=900;

const histStore=(()=>{
  let memory=null;
  const okLS=()=>{try{const k="__apt_t";localStorage.setItem(k,"1");localStorage.removeItem(k);return true}catch(e){return false}};
  const hasLS=okLS();
  function readCookie(){
    try{
      const m=document.cookie.match(/(?:^|;\s*)apt_hist=([^;]*)/);
      return m?decodeURIComponent(m[1]):null;
    }catch(e){return null}
  }
  function writeCookie(str){
    try{document.cookie="apt_hist="+encodeURIComponent(str)+";max-age=31536000;path=/;SameSite=Lax";return true}
    catch(e){return false}
  }
  return {
    load(){
      let raw=null;
      if(hasLS){try{raw=localStorage.getItem(HIST_KEY)}catch(e){}}
      if(raw==null)raw=readCookie();
      if(raw==null)raw=memory;
      if(!raw)return [];
      try{
        const parsed=JSON.parse(raw);
        return Array.isArray(parsed)?parsed.filter(x=>typeof x==="string"&&x.trim()).slice(-HIST_MAX):[];
      }catch(e){return []}
    },
    save(list){
      const str=JSON.stringify(list);
      memory=str;
      if(hasLS){try{localStorage.setItem(HIST_KEY,str);return}catch(e){}}
      /* Cookies cap near 4 KB; drop oldest entries until it fits. */
      let attempt=list.slice();
      while(attempt.length&&!writeCookie(JSON.stringify(attempt))&&encodeURIComponent(JSON.stringify(attempt)).length>3800)attempt.shift();
      if(attempt.length)writeCookie(JSON.stringify(attempt));
    }
  };
})();

let searchHistory=histStore.load();
let searchHistoryIndex=-1;        /* -1 = not navigating (live/blank line) */
let historyNavigating=false;      /* suppresses re-recording while we set the field */
let historyTimer=null;
let histDraft="";                 /* the in-progress line stashed when navigation starts */

function updateHistUI(){
  const n=searchHistory.length;
  const pos=searchHistoryIndex>=0?searchHistoryIndex+1:0;
  histCount.textContent=pos+"/"+n;
  histBtn.classList.toggle("empty",n===0);
  histBtn.classList.toggle("active",isearch.active||searchHistoryIndex>=0);
  histIco.textContent=(isearch.active||searchHistoryIndex>=0)?"📖":"📕";
  histBtn.title=n===0
    ?"Search history: empty — queries are saved once you stop typing (results-only, unless forced).\nCtrl+R or click: search history · Hold 2.2 s: clear all"
    :`Search history: entry ${pos} of ${n}${pos===0?" (new line)":""}.\n↑/↓ browse · Ctrl+R or click: search history (forces current query in even with 0 results) · Shift+Del: delete entry · Hold 2.2 s: clear all`;
}
function bumpHistIcon(){
  histBtn.classList.remove("bump");
  void histBtn.offsetWidth;   /* restart the CSS animation */
  histBtn.classList.add("bump");
}
function normalizeHistKey(s){return String(s||"").toLowerCase().replace(/\s+/g," ").trim();}
function rememberSearch(value,opts){
  const force=!!(opts&&opts.force);
  const q=String(value||"").trim();
  if(!q)return false;
  /* Half-typed queries ("boi" on the way to "boils") almost always match
     nothing and aren't worth cluttering history with — skip them unless the
     user explicitly forces it via the history button. */
  if(!force&&applyFilter(q,currentTempC).length===0)return false;
  /* Spam-click / retype guard: compared case-insensitively with whitespace
     collapsed, so "Gold", "gold" and "  gold " are all the same entry. */
  if(searchHistory.length&&normalizeHistKey(searchHistory[searchHistory.length-1])===normalizeHistKey(q)){
    searchHistoryIndex=-1;updateHistUI();return false;
  }
  searchHistory.push(q);
  while(searchHistory.length>HIST_MAX)searchHistory.shift();  /* oldest out, newest in */
  searchHistoryIndex=-1;
  histStore.save(searchHistory);
  bumpHistIcon();
  updateHistUI();
  return true;
}
/* Manual override for "the search yielded nothing but I still want this kept"
   — triggered by clicking the history button (see below). */
function forceRememberCurrent(){
  return rememberSearch(effectiveQuery(),{force:true});
}
function scheduleRememberSearch(value){
  clearTimeout(historyTimer);
  if(historyNavigating||isearch.active)return;
  const q=String(value||"").trim();
  if(!q)return;
  /* Timer restarts on every keystroke, so only a query the user has paused on
     for HIST_IDLE_MS gets committed. */
  historyTimer=setTimeout(()=>{
    if(effectiveQuery().trim()===q)rememberSearch(q);
  },HIST_IDLE_MS);
}
function commitSearchNow(){
  clearTimeout(historyTimer);
  if(historyNavigating||isearch.active)return;
  rememberSearch(effectiveQuery());
}
function setSearchFromHistory(value){
  historyNavigating=true;
  clearAutocomplete();
  searchInput.value=value;
  searchInput.dispatchEvent(new Event("input"));
  historyNavigating=false;
  const n=searchInput.value.length;
  searchInput.setSelectionRange(n,n);
  updateHistUI();
}
function historyPrev(){
  if(!searchHistory.length)return;
  if(searchHistoryIndex<0){
    /* Stash the live line bash-style so ↓ brings it back — but if that line was
       already committed as the newest entry, the user has effectively submitted
       it and expects ↓ to land on an empty field instead of re-typing it. */
    const live=effectiveQuery();
    histDraft=live.trim()&&live.trim()===searchHistory[searchHistory.length-1]?"":live;
    searchHistoryIndex=searchHistory.length-1;
  }else if(searchHistoryIndex>0){
    searchHistoryIndex--;
  }
  setSearchFromHistory(searchHistory[searchHistoryIndex]);
}
function historyNext(){
  if(searchHistoryIndex<0)return;
  if(searchHistoryIndex<searchHistory.length-1){
    searchHistoryIndex++;
    setSearchFromHistory(searchHistory[searchHistoryIndex]);
  }else{
    /* Past the newest entry you land back on the blank/draft line. */
    searchHistoryIndex=-1;
    setSearchFromHistory(histDraft||"");
    histDraft="";
  }
}
function deleteHistoryEntry(idx){
  if(idx<0||idx>=searchHistory.length)return false;
  searchHistory.splice(idx,1);
  histStore.save(searchHistory);
  if(!searchHistory.length){
    searchHistoryIndex=-1;
    setSearchFromHistory("");
  }else{
    searchHistoryIndex=Math.min(idx,searchHistory.length-1);
    setSearchFromHistory(searchHistory[searchHistoryIndex]);
  }
  updateHistUI();
  return true;
}
function clearAllHistory(){
  searchHistory=[];
  searchHistoryIndex=-1;
  histDraft="";
  histStore.save(searchHistory);
  histBtn.classList.remove("cleared");
  void histBtn.offsetWidth;
  histBtn.classList.add("cleared");
  updateHistUI();
}

/* ===== Press-and-hold (2200 ms) on the history button clears everything =====
   The fill animation runs bottom-to-top; releasing early cancels. */
let armTimer=null,armed=false;
function startArm(e){
  if(e&&e.type==="mousedown"&&e.button!==0)return;
  if(!searchHistory.length)return;
  armed=true;
  histBtn.classList.add("arming");
  clearTimeout(armTimer);
  armTimer=setTimeout(()=>{
    armed=false;
    histBtn.classList.remove("arming");
    clearAllHistory();
  },2200);
}
function cancelArm(){
  clearTimeout(armTimer);
  if(!armed)return;
  armed=false;
  histBtn.classList.remove("arming");
}
histBtn.addEventListener("mousedown",startArm);
histBtn.addEventListener("touchstart",e=>{startArm(e)},{passive:true});
histBtn.addEventListener("mouseup",cancelArm);
histBtn.addEventListener("mouseleave",cancelArm);
histBtn.addEventListener("touchend",cancelArm);
histBtn.addEventListener("touchcancel",cancelArm);
histBtn.addEventListener("click",e=>{
  e.preventDefault();
  /* A click that completed the hold-to-clear gesture shouldn't also toggle. */
  if(histBtn.classList.contains("cleared"))return;
  if(isearch.active){exitISearch(true);return}
  forceRememberCurrent();   /* "I want this kept even though it found nothing" */
  enterISearch();
});
histBtn.addEventListener("contextmenu",e=>e.preventDefault());

/* =====================================================================
   Reverse-i-search (bash Ctrl+R)
   The input holds the search pattern; the bar under it previews the matched
   history entry. Enter/Tab accepts it, Esc restores the original line.
   ===================================================================== */
const isearch={active:false,pattern:"",matchIdx:-1,saved:""};
function isearchMatches(pattern){
  const p=pattern.toLowerCase();
  const out=[];
  for(let i=searchHistory.length-1;i>=0;i--){          /* newest first, like bash */
    if(!p||searchHistory[i].toLowerCase().includes(p))out.push(i);
  }
  return out;
}
function renderISearch(){
  const matches=isearchMatches(isearch.pattern);
  const found=matches.length>0;
  if(!found)isearch.matchIdx=-1;
  else if(isearch.matchIdx<0||!matches.includes(isearch.matchIdx))isearch.matchIdx=matches[0];
  searchInput.classList.toggle("isearch-fail",!found&&isearch.pattern.length>0);
  if(found){
    const entry=searchHistory[isearch.matchIdx];
    const at=entry.toLowerCase().indexOf(isearch.pattern.toLowerCase());
    if(isearch.pattern&&at>=0){
      isearchMatch.innerHTML=escapeHTML(entry.slice(0,at))+'<span class="hl">'+escapeHTML(entry.slice(at,at+isearch.pattern.length))+"</span>"+escapeHTML(entry.slice(at+isearch.pattern.length));
    }else{
      isearchMatch.textContent=entry;
    }
    isearchMatch.classList.remove("none");
    isearchPos.textContent=(matches.indexOf(isearch.matchIdx)+1)+"/"+matches.length;
    render(entry);                                     /* live-preview the candidate */
  }else{
    isearchMatch.textContent=searchHistory.length?"no match":"history is empty";
    isearchMatch.classList.add("none");
    isearchPos.textContent="0/0";
  }
  updateHistUI();
}
function enterISearch(){
  if(isearch.active)return;
  clearTimeout(historyTimer);
  clearAutocomplete();
  isearch.active=true;
  isearch.saved=searchInput.value;
  isearch.pattern="";
  isearch.matchIdx=-1;
  searchInput.value="";
  searchInput.placeholder="Type to search history…";
  searchInput.classList.add("isearch");
  isearchBar.classList.add("open");
  searchInput.focus();
  renderISearch();
}
function exitISearch(restore){
  if(!isearch.active)return;
  isearch.active=false;
  searchInput.classList.remove("isearch","isearch-fail");
  isearchBar.classList.remove("open");
  searchInput.placeholder=SEARCH_PLACEHOLDER;
  if(restore){
    searchInput.value=isearch.saved;
    render(searchInput.value);
  }
  searchHistoryIndex=-1;
  updateHistUI();
  searchInput.focus();
}
function acceptISearch(){
  if(!isearch.active)return;
  const idx=isearch.matchIdx;
  const value=idx>=0?searchHistory[idx]:isearch.saved;
  isearch.active=false;
  searchInput.classList.remove("isearch","isearch-fail");
  isearchBar.classList.remove("open");
  searchInput.placeholder=SEARCH_PLACEHOLDER;
  searchInput.value=value;
  render(value);
  searchHistoryIndex=idx>=0?idx:-1;
  const n=searchInput.value.length;
  searchInput.setSelectionRange(n,n);
  updateHistUI();
  searchInput.focus();
}
function isearchStep(dir){
  const matches=isearchMatches(isearch.pattern);
  if(!matches.length)return;
  let at=matches.indexOf(isearch.matchIdx);
  if(at<0)at=0;else at=Math.min(Math.max(at+dir,0),matches.length-1);
  isearch.matchIdx=matches[at];
  renderISearch();
}

/* =====================================================================
   Inline autocomplete ("va" -> "va[nadium]")
   The completion is inserted into the field and left selected, so typing
   replaces it, Tab/Enter accepts it, and Delete/Backspace discards it.
   ===================================================================== */
const AUTOCOMPLETE_ENGINE=new AutocompleteEngine(elements);
let acActive=false,acUserText="",acAnchorStart=0,acSelStart=0,acSelEnd=0;
function clearAutocomplete(){acActive=false;acUserText=""}
/* The query the table should actually be filtered by: while a completion is
   pending we filter on what the user really typed, so that completing "toxic"
   to "toxicity" doesn't flash a zero-result table under them. */
function effectiveQuery(){return acActive?acUserText:searchInput.value}
/* The token being completed is the text after the last space or comma. */
function lastTokenStart(text){
  const m=text.match(/[^\s,]*$/);
  return m?text.length-m[0].length:text.length;
}
function tryAutocomplete(viaErasedSpace){
  if(isearch.active)return;
  const value=searchInput.value;
  const caret=searchInput.selectionStart;
  if(caret!==searchInput.selectionEnd)return;
  const start=lastTokenStart(value.slice(0,caret));
  const token=value.slice(start,caret);
  const after=value[caret];
  const boundaryAhead=after===undefined||/[\s,]/.test(after);

  if(viaErasedSpace){
    gapSession={anchor:start};
  }else if(!boundaryAhead){
    if(token.length<=1){
      const before=prevSearchValue[start-1];
      const wasBoundary=start===0||before===undefined||/[\s,]/.test(before);
      gapSession=wasBoundary?{anchor:start}:gapSession;
    }else if(!(gapSession&&gapSession.anchor===start)){
      gapSession=null;
    }
    if(!gapSession)return;
  }else{
    gapSession=null;
  }

  const suggestion=AUTOCOMPLETE_ENGINE.suggest(value,caret,searchHistory);
  if(!suggestion)return;
  const prefix=suggestion.prefix;
  if(prefix.length<2)return;
  const completion=prefix+suggestion.best.slice(prefix.length);
  const typedPrefix=value.slice(suggestion.start,caret);
  if(typedPrefix.toLowerCase()!==prefix.toLowerCase())return;
  acUserText=value;
  acAnchorStart=suggestion.start;
  acSelStart=caret;
  acSelEnd=suggestion.start+completion.length;
  searchInput.value=value.slice(0,suggestion.start)+completion+value.slice(caret);
  searchInput.setSelectionRange(acSelStart,acSelEnd);
  acActive=true;
}
function acceptAutocomplete(){
  if(!acActive)return false;
  searchInput.setSelectionRange(acSelEnd,acSelEnd);
  clearAutocomplete();
  prevSearchValue=searchInput.value;
  render(searchInput.value);
  updateHistUI();
  return true;
}
function hasLiveSuggestion(){
  return acActive&&searchInput.selectionStart===acSelStart&&searchInput.selectionEnd===acSelEnd;
}
let gapSession=null;
function collapseGhostWithBackspace(){
  const before=acUserText.slice(0,Math.max(acAnchorStart,acSelStart-1));
  const after=acUserText.slice(acSelStart);
  const newValue=before+after;
  clearAutocomplete();
  searchInput.value=newValue;
  searchInput.setSelectionRange(before.length,before.length);
  prevSearchValue=newValue;
  render(newValue);
  if(!historyNavigating)searchHistoryIndex=-1;
  scheduleRememberSearch(newValue);
  updateHistUI();
}
function cancelGhostKeepingPrefix(){
  const newValue=acUserText,caretPos=acSelStart;
  clearAutocomplete();
  searchInput.value=newValue;
  searchInput.setSelectionRange(caretPos,caretPos);
  prevSearchValue=newValue;
  render(newValue);
  updateHistUI();
}

searchInput.addEventListener("keydown",e=>{
  if(!hasLiveSuggestion())return;
  const bare=!e.shiftKey&&!e.ctrlKey&&!e.metaKey&&!e.altKey;
  if(!bare)return;
  if(e.key===" " || e.code==="Space"){
    e.preventDefault();e.stopPropagation();
    const end=acSelEnd,current=searchInput.value;
    const next=/\s/.test(current[end]||"")?current:current.slice(0,end)+" "+current.slice(end);
    clearAutocomplete();
    searchInput.value=next;
    searchInput.setSelectionRange(end+1,end+1);
    prevSearchValue=next;
    gapSession=null;
    render(next);
    if(!historyNavigating)searchHistoryIndex=-1;
    scheduleRememberSearch(next);
    updateHistUI();
  }else if(e.key==="Backspace"||e.key==="Delete"){
    e.preventDefault();e.stopPropagation();
    collapseGhostWithBackspace();
  }else if(e.key==="ArrowLeft"){
    e.preventDefault();e.stopPropagation();
    cancelGhostKeepingPrefix();
  }else if(e.key==="ArrowRight"){
    e.preventDefault();e.stopPropagation();
    acceptAutocomplete();
  }else if(e.key.length===1 && !/\s/.test(e.key)){
    /* Branch inside a multi-word completion instead of producing a malformed
       token. Example: "united" → "united states"; typing "k" turns that into
       "united k" and immediately re-ranks against "united kingdom". */
    e.preventDefault();e.stopPropagation();
    const selectedTail=searchInput.value.slice(acSelStart,acSelEnd);
    const leadingSpace=(selectedTail.match(/^\s+/)||[''])[0];
    const before=acUserText.slice(0,acSelStart);
    const after=acUserText.slice(acSelStart);
    const next=before+leadingSpace+e.key+after;
    const caret=before.length+leadingSpace.length+1;
    clearAutocomplete();
    searchInput.value=next;
    searchInput.setSelectionRange(caret,caret);
    prevSearchValue=next;
    const newStart=lastTokenStart(next.slice(0,caret));
    gapSession={anchor:newStart};
    tryAutocomplete(false);
    render(effectiveQuery());
    if(!historyNavigating)searchHistoryIndex=-1;
    scheduleRememberSearch(effectiveQuery());
    updateHistUI();
  }
});
tempSlider.addEventListener("input",()=>{
  currentTempC=+tempSlider.value;
  updateTempDisplay();
  TABLE_RENDERER.updateTemperature(currentTempC);
  if(selected)showDetails(selected);
});
tempMinus.addEventListener("click",()=>changeTemp(-10));
tempPlus.addEventListener("click",()=>changeTemp(10));
resetBtn.addEventListener("click",()=>{tempSlider.value=25;tempSlider.dispatchEvent(new Event("input"))});
let prevSearchValue="";
searchInput.addEventListener("input",e=>{
  /* While reverse-i-search is open the field is the pattern buffer, not a query. */
  if(isearch.active){
    isearch.pattern=searchInput.value;
    isearch.matchIdx=-1;
    renderISearch();
    prevSearchValue=searchInput.value;
    return;
  }

  const type=e&&e.inputType||"";
  const data=e&&e.data;
  const isTyping=type==="insertText"||type==="insertCompositionText"||(!type&&searchInput.value.length>prevSearchValue.length);
  const isDeleting=type.startsWith("delete");
  /* Erasing a space that used to separate two words puts the caret back
     inside the word before it, so the suggestion system re-triggers there —
     wherever in the sentence that happens, not just at the very end. For a
     plain single-character Backspace the caret lands exactly where the
     removed character used to sit, so prevSearchValue[caret] is that
     character. */
  const caretNow=searchInput.selectionStart;
  const removedChar=isDeleting&&searchInput.selectionStart===searchInput.selectionEnd
    &&prevSearchValue.length===searchInput.value.length+1
    ?prevSearchValue[caretNow]:null;
  const erasedSpace=removedChar!=null&&/\s/.test(removedChar);

  clearAutocomplete();
  if(isTyping&&data!==" "&&!/\s/.test(data||""))tryAutocomplete(false);
  else if(erasedSpace)tryAutocomplete(true);

  const q=effectiveQuery();
  render(q);
  if(!historyNavigating)searchHistoryIndex=-1;
  scheduleRememberSearch(q);
  updateHistUI();
  prevSearchValue=searchInput.value;
});
/* A settled query is also committed when focus leaves the field. */
searchInput.addEventListener("blur",()=>{if(!isearch.active)commitSearchNow()});

/* Editable temperature */
function parseTempInput(str){
  const m=String(str).trim().match(/^(-?\d+(?:\.\d+)?)\s*°?\s*([cfk])?$/i);
  if(!m)return null;
  const val=parseFloat(m[1]),unit=(m[2]||"c").toLowerCase();
  let c;if(unit==="c")c=val;else if(unit==="f")c=(val-32)*5/9;else if(unit==="k")c=val-273.15;else return null;
  if(!isFinite(c)||c<-273||c>6000)return null;
  return Math.round(c);
}
function startEditTemp(){
  if(editingTemp)return;
  tempEditReturnFocus=document.activeElement;
  editingTemp=true;
  tempValue.style.visibility="hidden";tempEdit.style.display="block";tempConfirm.style.display="flex";tempCancel.style.display="flex";
  tempEdit.value="";tempEdit.focus();
}
function endEditTemp(confirm){
  if(!editingTemp)return;
  if(confirm){const parsed=parseTempInput(tempEdit.value);if(parsed!=null){tempSlider.value=parsed;tempSlider.dispatchEvent(new Event("input"))}}
  editingTemp=false;
  tempValue.style.visibility="visible";tempEdit.style.display="none";tempConfirm.style.display="none";tempCancel.style.display="none";
  const returnTo=tempEditReturnFocus;tempEditReturnFocus=null;
  if(returnTo&&document.contains(returnTo)){returnTo.focus({preventScroll:true});if(returnTo===table&&focusedElement)focusedElement.style.outline="2px solid var(--accent)";}
}
tempValue.addEventListener("click",startEditTemp);
tempConfirm.addEventListener("click",()=>endEditTemp(true));
tempCancel.addEventListener("click",()=>endEditTemp(false));
tempEdit.addEventListener("keydown",e=>{e.stopPropagation();if(e.key==="Enter"){e.preventDefault();endEditTemp(true)}else if(e.key==="Escape"){e.preventDefault();endEditTemp(false)}});

function getElementAt(row,col){
  const idx=row*18+col;return(idx>=0&&idx<table.children.length)?table.children[idx]:null;
}
function focusElement(row,col){
  const totalRows=9,totalCols=18;
  if(row<0)row=totalRows-1;if(row>=totalRows)row=0;if(col<0)col=totalCols-1;if(col>=totalCols)col=0;
  let attempts=0;
  while(attempts<totalRows*totalCols){
    const el=getElementAt(row,col);
    if(el&&!el.classList.contains("spacer")){
      lastClickedPos={row,col};
        table.focus({preventScroll:true});
      el.scrollIntoView({block:"nearest",inline:"nearest"});
      if(focusedElement)focusedElement.style.outline="";
      focusedElement=el;el.style.outline="2px solid var(--accent)";el.style.outlineOffset="2px";
      const elData=elements.find(e=>{const pos=POS[e.z];return pos&&pos[0]-1===row&&pos[1]-1===col});
      if(elData&&(!detailsLocked||comparisonMode))showDetails(elData);
      return;
    }
    col++;if(col>=totalCols){col=0;row++}if(row>=totalRows)row=0;attempts++;
  }
}

document.addEventListener("keydown",e=>{
  const isSearch=e.target===searchInput,modalOpen=helpModal.classList.contains("open");
  const isTempControl=tempBox&&tempBox.contains(e.target);
  const isTableFocus=e.target===table||e.target.closest?.("#table");

  /* Ctrl+Shift is a global tab-switch chord. */
  if(e.ctrlKey&&e.shiftKey&&(e.key==="Control"||e.key==="Shift")&&!e.repeat&&!tabChordToggled){
    tabChordToggled=true;
    e.preventDefault();
    setDetailsTab(detailsTab==="basic"?"extra":"basic");
    return;
  }

  /* --- Reverse-i-search owns the keyboard while it is open. --- */
  if(isearch.active&&!modalOpen){
    if(e.key==="Escape"){e.preventDefault();e.stopPropagation();exitISearch(true);return}
    if(e.key==="Enter"||e.key==="Tab"){e.preventDefault();acceptISearch();return}
    if(e.key==="ArrowUp"||(e.ctrlKey&&e.key.toLowerCase()==="r")){e.preventDefault();isearchStep(1);return}
    if(e.key==="ArrowDown"){e.preventDefault();isearchStep(-1);return}
    if(e.shiftKey&&(e.key==="Delete"||e.key==="Backspace")&&isearch.matchIdx>=0){
      e.preventDefault();
      searchHistory.splice(isearch.matchIdx,1);
      histStore.save(searchHistory);
      isearch.matchIdx=-1;
      renderISearch();
      return;
    }
    return;
  }

  if(e.key==="Escape"){
    if(modalOpen){helpModal.classList.remove("open");e.preventDefault();return}
    if(editingTemp){endEditTemp(false);e.preventDefault();return}
    clearSelectionUI();
    if(isSearch&&acActive){
      const typed=acUserText,caret=acSelStart;
      clearAutocomplete();
      searchInput.value=typed;
      searchInput.setSelectionRange(caret,caret);
      prevSearchValue=typed;
      gapSession=null;
      render(typed);
      updateHistUI();
      e.preventDefault();
      return;
    }
    if(isSearch){
      if(searchInput.value){
        searchInput.value="";
        searchInput.dispatchEvent(new Event("input"));
      }else{
        table.focus({preventScroll:true});
        focusElement(lastClickedPos.row,lastClickedPos.col);
      }
      e.preventDefault();
      return;
    }
    if(isTableFocus||focusedElement){
      if(focusedElement){focusedElement.style.outline="";focusedElement=null}
      searchInput.focus();
      searchInput.select();
      e.preventDefault();
      return;
    }
    resetBtn.click();
    e.preventDefault();
    return;
  }

  /* Ctrl+R opens history search (bash). Double-tapping ↑ is deliberately NOT
     used for this: ↑↑ is the normal way to step back two entries. */
  if(isSearch&&e.ctrlKey&&e.key.toLowerCase()==="r"){
    e.preventDefault();
    enterISearch();
    return;
  }

  /* Tab is hooked only to accept a live suggestion; otherwise it tabs normally. */
  if(isSearch&&e.key==="Tab"&&!e.shiftKey&&hasLiveSuggestion()){
    e.preventDefault();
    acceptAutocomplete();
    return;
  }

  if(isSearch&&e.key==="Enter"){
    e.preventDefault();
    acceptAutocomplete();
    commitSearchNow();
    return;
  }

  /* Shift+Delete removes the history entry currently loaded in the field. */
  if(isSearch&&e.shiftKey&&(e.key==="Delete"||e.key==="Backspace")&&searchHistoryIndex>=0){
    e.preventDefault();
    deleteHistoryEntry(searchHistoryIndex);
    return;
  }

  if(isSearch&&!e.shiftKey&&e.key==="ArrowUp"){
    if(searchHistory.length){e.preventDefault();historyPrev()}
    return;
  }
  if(isSearch&&!e.shiftKey&&e.key==="ArrowDown"){
    if(searchHistoryIndex>=0){e.preventDefault();historyNext()}
    return;
  }

  if(e.key==="/"&&!isSearch&&!modalOpen&&!e.ctrlKey&&!e.metaKey){
    e.preventDefault();
    searchInput.focus();
    searchInput.select();
    return;
  }

  if(isTableFocus&&!modalOpen&&e.key.toLowerCase()==="t"){
    e.preventDefault();
    startEditTemp();
    return;
  }

  if(!isSearch&&!modalOpen&&!e.target.closest?.("input,textarea,select,button")&&e.key.toLowerCase()==="h"){
    e.preventDefault();
    openHelp();
    return;
  }

  if(!modalOpen&&e.target!==tempEdit&&e.shiftKey&&(e.key==="ArrowUp"||e.key==="ArrowDown")){
    e.preventDefault();
    changeTemp(e.key==="ArrowDown"?-10:10);
    return;
  }

  if(!modalOpen&&e.target===tempSlider&&!e.shiftKey&&(e.key==="ArrowUp"||e.key==="ArrowDown")){
    e.preventDefault();
    return;
  }

  if(!isSearch&&!isTempControl&&!modalOpen&&!e.target.closest?.("button,input,select,textarea")&&["ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].includes(e.key)){
    e.preventDefault();
    let{row,col}=lastClickedPos;
    if(e.key==="ArrowUp")row--;
    else if(e.key==="ArrowDown")row++;
    else if(e.key==="ArrowLeft")col--;
    else if(e.key==="ArrowRight")col++;
    focusElement(row,col);
    return;
  }

  if(isTableFocus&&e.key==="Enter"&&!modalOpen&&focusedElement){
    e.preventDefault();
    focusedElement.click();
  }
});

document.addEventListener("keyup",e=>{
  if(!e.ctrlKey||!e.shiftKey)tabChordToggled=false;
});

/* ===== Help modal: collapsible sections + topic search ===== */
const helpSections=()=>[...document.querySelectorAll(".help-sec")];
const helpEmpty=document.getElementById("helpEmpty");
let helpDefaultOpen=null;
function filterHelp(){
  const q=(helpSearch.value||"").trim().toLowerCase();
  const secs=helpSections();
  if(helpDefaultOpen===null)helpDefaultOpen=secs.map(s=>s.open);
  if(!q){
    secs.forEach((s,i)=>{s.hidden=false;s.open=helpDefaultOpen[i]});
    helpEmpty.style.display="none";
    return;
  }
  let hits=0;
  secs.forEach(s=>{
    const match=s.textContent.toLowerCase().includes(q);
    s.hidden=!match;
    s.open=match;            /* auto-expand whatever matched */
    if(match)hits++;
  });
  helpEmpty.style.display=hits?"none":"block";
}
helpSearch.addEventListener("input",filterHelp);
helpSearch.addEventListener("keydown",e=>{
  e.stopPropagation();       /* keep global hotkeys out of this field */
  if(e.key==="Escape"){
    if(helpSearch.value){helpSearch.value="";filterHelp();e.preventDefault()}
    else helpModal.classList.remove("open");
  }
});
function openHelp(){
  helpModal.classList.add("open");
  helpSearch.value="";
  filterHelp();
  setTimeout(()=>helpSearch.focus(),30);
}
helpLink.addEventListener("click",openHelp);
closeHelp.addEventListener("click",()=>helpModal.classList.remove("open"));
helpModal.addEventListener("click",e=>{if(e.target===helpModal)helpModal.classList.remove("open")});
tempSlider.dispatchEvent(new Event("input"));
searchInput.focus();
render("");
updateHistUI();

})();
