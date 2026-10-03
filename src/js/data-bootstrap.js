/* Arcager runtime data bridge.
   Arcager --merge replaces <link rel="csv"> resources with in-memory tables and
   exposes them through window.arcager.csv. This adapter normalizes those tables
   into the same manifest contract consumed by app.js. */
(function(){
  const num=v=>v===''||v==null?null:Number(v);
  const list=v=>v===''||v==null?[]:String(v).split(';').filter(Boolean).map(Number);
  const rowsToObjects=rows=>{
    if(!rows||!rows.length)return[];
    const h=rows[0];
    return rows.slice(1).filter(r=>r&&r.length).map(r=>Object.fromEntries(h.map((k,i)=>[k,r[i]??''])));
  };
  /* Match Arcager's CSV parser semantics: blank leading/trailing lines are
     ignored instead of becoming a bogus one-cell header row. Arcager emits
     inlined CSV blocks with a leading newline, so this detail is critical for
     the standalone packed build. */
  const parseCSV=(text,delim=',')=>{
    text=String(text??'').replace(/^\uFEFF/,'');
    const rows=[];let row=[],field='',inQ=false;
    const flushRow=()=>{
      if(row.length||field.length){row.push(field);rows.push(row);}
      row=[];field='';
    };
    for(let i=0;i<text.length;i++){
      const c=text[i];
      if(inQ){
        if(c==='\"'){
          if(text[i+1]==='\"'){field+='\"';i++;}
          else inQ=false;
        } else field+=c;
      } else if(c==='\"') inQ=true;
      else if(c===delim){row.push(field);field='';}
      else if(c==='\n') flushRow();
      else if(c==='\r'){if(text[i+1]==='\n')i++;flushRow();}
      else field+=c;
    }
    flushRow();
    return rows;
  };
  const inlineCSV=()=>{
    if(typeof document==='undefined')return {};
    const out={};
    const blocks=document.querySelectorAll('script[type=\"text/csv\"]');
    blocks.forEach((el,i)=>{
      const key=el.getAttribute('data-key')||`csv${i}`;
      const rows=parseCSV(el.textContent||'',el.getAttribute('data-delim')||',');
      out[key]={rows,data:rowsToObjects(rows)};
    });
    return out;
  };
  /* Arcager >= 3.2.1 exposes `ready`, a real Promise that resolves only after the
     payload has been decompressed AND every inlined CSV block has been parsed.
     3.2.2 guarantees window.arcager exists before any capability check (ready
     rejects with a clear Error instead), and 3.2.3 adds arcager.state
     ('loading'|'ready'|'error') / arcager.error, mirrored by arcager.loaded.
     Awaiting `ready` is therefore all that is needed on a current runtime; a
     rejection is recorded and we fall through to the DOM fallback below. */
  async function awaitArcagerCsv(){
    const a=window.arcager;
    if(!a)return{};
    if(a.ready&&typeof a.ready.then==='function'){
      try{await a.ready;}
      catch(err){window.__APT_ARCAGER_ERROR__=err;}
    }
    return a.csv||{};
  }
  window.__APT_DATA_READY__=(async()=>{
    let csv=await awaitArcagerCsv();
    /* Safety net only. Arcager 3.2.0 built its csv object before the decompressed
       HTML was committed, so arcager.csv was always empty; 3.2.1+ fixed that. If a
       pre-3.2.1 runtime (or a rejected `ready`) leaves the map incomplete, parse the
       committed <script type=\"text/csv\"> blocks directly and publish the result
       back to window.arcager.csv for callers that expect Arcager's public API. */
    if(!csv.elements||!csv['element-extra']||!csv.lookups){
      const embedded=inlineCSV();
      if(Object.keys(embedded).length){
        csv={...csv,...embedded};
        if(window.arcager)window.arcager.csv=csv;
      }
    }
    const tableRows=key=>{
      const table=csv[key];
      if(!table)throw new Error(`Arcager CSV resource missing: ${key}`);
      const rows=table.rows||[];
      if(rows.length<2)throw new Error(`Arcager CSV resource ${key} is empty or malformed.`);
      return rows;
    };
    const elementsRaw=tableRows('elements');
    const extraRaw=tableRows('element-extra');
    const lookupsRaw=tableRows('lookups');
    if(elementsRaw[0][0]!=='z'||!elementsRaw[0].includes('sym')||!elementsRaw[0].includes('name'))
      throw new Error('Arcager CSV header validation failed for elements.');
    if(extraRaw[0][0]!=='z')throw new Error('Arcager CSV header validation failed for element-extra.');
    if(lookupsRaw[0][0]!=='kind'||!lookupsRaw[0].includes('key'))
      throw new Error('Arcager CSV header validation failed for lookups.');
    const elementsRows=rowsToObjects(elementsRaw);
    const extras=rowsToObjects(extraRaw);
    const lookups=rowsToObjects(lookupsRaw);
    const byZ=new Map(extras.map(r=>[Number(r.z),r]));
    const elements=elementsRows.map(r=>({
      z:Number(r.z),sym:r.sym,name:r.name,latin:r.latin||null,mass:num(r.mass),cat:r.cat,
      melt:num(r.melt),boil:num(r.boil),config:r.config,density:num(r.density),en:num(r.en),ie:num(r.ie),
      sources:r.sources,e0:num(r.e0),tox:r.tox||'—',year:num(r.year),oxidation:num(r.oxidation),
      halflife:num(r.halflife),discoverySource:r.discoverySource||null,discoveryCountry:r.discoveryCountry||null
    }));
    const EXTRA_CONDUCTIVITY=[null,...elements.map(e=>num(byZ.get(e.z)?.electricalConductivity??''))];
    const EXTRA_HEAT=[null,...elements.map(e=>num(byZ.get(e.z)?.specificHeat??''))];
    const THERMAL_CONDUCTIVITY=[null,...elements.map(e=>num(byZ.get(e.z)?.thermalConductivity??''))];
    const ELECTRICAL_TYPE=[null,...elements.map(e=>byZ.get(e.z)?.electricalType||'N/A')];
    const EXTRA_ABUNDANCE=[null,...elements.map(e=>({
      crust:num(byZ.get(e.z)?.crustAbundance??''),
      ocean:num(byZ.get(e.z)?.oceanAbundance??''),
      universe:num(byZ.get(e.z)?.universeAbundance??''),
      humans:num(byZ.get(e.z)?.humanAbundance??'')
    }))];
    const IONIZATION_ENERGIES=[null,...elements.map(e=>list(byZ.get(e.z)?.ionizationEnergies??''))];
    const EXTRA_ISOTOPES=[null,...elements.map(e=>list(byZ.get(e.z)?.isotopes??''))];
    const EXTRA_ISOTOPE_ABUNDANCE=[null,...elements.map(e=>list(byZ.get(e.z)?.isotopeAbundance??''))];
    const CAT=[...new Set(elements.map(e=>e.cat))];
    const TOX=[...new Set(elements.map(e=>e.tox).filter(Boolean).filter(x=>x!=='—'))];
    const E_SOURCES=[...new Set(elements.flatMap(e=>String(e.sources||'').split(',').map(x=>x.trim()).filter(Boolean)))];
    const DISCOVERY_COUNTRY=[null,...elements.map(e=>e.discoveryCountry)];
    const DISCOVERY_SOURCE=[null,...elements.map(e=>e.discoverySource)];
    return {schema:1,version:'__APP_VERSION__',elements,CAT,TOX,E_SOURCES,DISCOVERY_COUNTRY,DISCOVERY_SOURCE,
      EXTRA_CONDUCTIVITY,EXTRA_HEAT,THERMAL_CONDUCTIVITY,ELECTRICAL_TYPE,EXTRA_ISOTOPES,EXTRA_ISOTOPE_ABUNDANCE,
      IONIZATION_ENERGIES,EXTRA_ABUNDANCE,extras,lookups};
  })();
})();
