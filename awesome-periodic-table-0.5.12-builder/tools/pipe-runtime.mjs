export const PIPE_RUNTIME = String.raw`function __APT_decodePipe(s){
  const un=v=>{if(v==null||v==='')return '';let o='',e=false;for(let i=0;i<v.length;i++){const c=v[i];if(e){o+=c==='n'?'\n':c==='r'?'\r':c;e=false;}else if(c==='\\'){e=true;}else{o+=c}}return o};
  const rows=s.split(/\n/).filter(Boolean); let version='',schema=1; const elements=[],extras=[],lookups=[];
  for(const line of rows){const p=line.split('|'); if(p[0]==='@'){version=un(p[2]);schema=Number(p[3]||1);continue;} if(p[0]==='#')continue;
    const u=p.slice(1).map(un); if(p[0]==='E'){const [z,sym,name,latin,mass,cat,melt,boil,config,density,en,ie,sources,e0,tox,year,oxidation,halflife,discoverySource,discoveryCountry]=u;elements.push({z:Number(z),sym,name,latin:latin||null,mass:mass===''?null:Number(mass),cat,melt:melt===''?null:Number(melt),boil:boil===''?null:Number(boil),config,density:density===''?null:Number(density),en:en===''?null:Number(en),ie:ie===''?null:Number(ie),sources,e0:e0===''?null:Number(e0),tox:tox||'—',year:year===''?null:Number(year),oxidation:oxidation===''?null:Number(oxidation),halflife:halflife===''?null:Number(halflife),discoverySource:discoverySource||null,discoveryCountry:discoveryCountry||null});}
    else if(p[0]==='X'){const [z,electricalConductivity,specificHeat,thermalConductivity,electricalType,crustAbundance,oceanAbundance,universeAbundance,humanAbundance,ionizationEnergies,isotopes,isotopeAbundance]=u;extras.push({z:Number(z),electricalConductivity,specificHeat,thermalConductivity,electricalType,crustAbundance,oceanAbundance,universeAbundance,humanAbundance,ionizationEnergies,isotopes,isotopeAbundance});}
    else if(p[0]==='L')lookups.push({kind:u[0],key:u[1],value:u[2]});
  }
  const byZ=new Map(extras.map(r=>[r.z,r])); const num=v=>v===''?null:Number(v); const list=v=>v===''?[]:v.split(';').filter(Boolean).map(Number);
  const EXTRA_CONDUCTIVITY=[null,...elements.map(e=>num(byZ.get(e.z)?.electricalConductivity??''))];
  const EXTRA_HEAT=[null,...elements.map(e=>num(byZ.get(e.z)?.specificHeat??''))];
  const THERMAL_CONDUCTIVITY=[null,...elements.map(e=>num(byZ.get(e.z)?.thermalConductivity??''))];
  const ELECTRICAL_TYPE=[null,...elements.map(e=>byZ.get(e.z)?.electricalType||'N/A')];
  const EXTRA_ABUNDANCE=[null,...elements.map(e=>({crust:num(byZ.get(e.z)?.crustAbundance??''),ocean:num(byZ.get(e.z)?.oceanAbundance??''),universe:num(byZ.get(e.z)?.universeAbundance??''),humans:num(byZ.get(e.z)?.humanAbundance??'')}))];
  const IONIZATION_ENERGIES=[null,...elements.map(e=>list(byZ.get(e.z)?.ionizationEnergies??''))];
  const EXTRA_ISOTOPES=[null,...elements.map(e=>list(byZ.get(e.z)?.isotopes??''))];
  const EXTRA_ISOTOPE_ABUNDANCE=[null,...elements.map(e=>list(byZ.get(e.z)?.isotopeAbundance??''))];
  const CAT=[...new Set(elements.map(e=>e.cat))],TOX=[...new Set(elements.map(e=>e.tox).filter(Boolean).filter(x=>x!=='—'))],E_SOURCES=[...new Set(elements.flatMap(e=>String(e.sources||'').split(',').map(x=>x.trim()).filter(Boolean)))],DISCOVERY_COUNTRY=[null,...elements.map(e=>e.discoveryCountry)],DISCOVERY_SOURCE=[null,...elements.map(e=>e.discoverySource)];
  return {schema,version,elements,CAT,TOX,E_SOURCES,DISCOVERY_COUNTRY,DISCOVERY_SOURCE,EXTRA_CONDUCTIVITY,EXTRA_HEAT,THERMAL_CONDUCTIVITY,ELECTRICAL_TYPE,EXTRA_ISOTOPES,EXTRA_ISOTOPE_ABUNDANCE,IONIZATION_ENERGIES,EXTRA_ABUNDANCE,extras,lookups};
}`;

export function manifestBootstrapFromExpression(expression){
  return `${PIPE_RUNTIME}\nconst __APT_manifest=__APT_decodePipe(${expression});\nconst APP_VERSION=__APT_manifest.version;\nconst {elements,CAT,TOX,E_SOURCES,DISCOVERY_COUNTRY,DISCOVERY_SOURCE,EXTRA_CONDUCTIVITY,EXTRA_HEAT,THERMAL_CONDUCTIVITY,ELECTRICAL_TYPE,EXTRA_ISOTOPES,EXTRA_ISOTOPE_ABUNDANCE,IONIZATION_ENERGIES,EXTRA_ABUNDANCE}=__APT_manifest;\n`;
}
