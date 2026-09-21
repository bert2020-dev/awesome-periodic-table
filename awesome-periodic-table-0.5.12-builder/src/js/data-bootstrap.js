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
  async function awaitArcagerCsv(){
    const a=window.arcager;
    if(!a)return{};
    if(a.resources?.waitFor){
      try{await a.resources.waitFor('csv',{keys:['elements','element-extra','lookups'],timeout:6000});}catch{}
    }else if(a.ready){
      try{await a.ready;}catch{}
    }
    return a.csv||{};
  }
  window.__APT_DATA_READY__=(async()=>{
    let csv=await awaitArcagerCsv();
    /* Arcager creates its csv object before it commits the decompressed HTML,
       so the bundled <script type=\"text/csv\"> blocks are not visible to
       Arcager itself until the document is being rebuilt. Parse those blocks
       directly when the runtime map is empty, then publish the result back to
       window.arcager.csv for callers that expect Arcager's public API. */
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
