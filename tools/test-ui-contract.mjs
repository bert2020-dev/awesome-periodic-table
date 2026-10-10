import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const app=fs.readFileSync(path.join(ROOT,'src','js','app.js'),'utf8');
const css=fs.readFileSync(path.join(ROOT,'src','css','app.css'),'utf8');
const html=fs.readFileSync(path.join(ROOT,'src','index.html'),'utf8');
for(const needle of ['tempUnitMode=\'C\'','tempUnit?.addEventListener','tempUnitValue(currentTempC,tempUnitMode)','Atomic Mass','Electronic Configuration','abundance:meteorite','abundance:solar'])if(!app.includes(needle))throw new Error(`Missing UI contract: ${needle}`);
if(!css.includes('.nuclide-header .nuclide-mass { top:-.18em; }')||!css.includes('.nuclide-header .nuclide-z { bottom:-.18em; }'))throw new Error('Nuclide overlay CSS contract missing.');
if(!html.includes('id="tempUnit"')||!html.includes('25 °C / 77 °F / 298.15 K'))throw new Error('Temperature unit control/tooltip contract missing.');

const detailsStart=app.indexOf('function showDetails(el){');
const detailsEnd=app.indexOf('function setDetailsTab(tab){',detailsStart);
const details=app.slice(detailsStart,detailsEnd);
const orderedBasic=["Latin Name","Atomic Number (Z)","Neutrons (N)","Category","Atomic Mass","Density","Melting Point","Boiling Point","Phase at ","Common Oxidation State","Electronic Configuration"];
const orderedExtra=["Electronegativity","Ionization Energies","Standard Electrode Potential","Magnetic Response at ","Electrical Conductivity","Thermal Conductivity","Specific Heat","Radiation Level","Half-Life","Toxicity Level","Discovery","Abundance Distribution","Known Occurrences","Stable Isotopes"];
for(const [labels,name] of [[orderedBasic,"basic"],[orderedExtra,"extra"]]){
  let pos=-1;
  for(const label of labels){const next=details.indexOf(label,pos+1);if(next<0)throw new Error(`Missing or reordered ${name} detail: ${label}`);pos=next;}
}
for(const obsolete of ["Mass (g/mol)","Density (g/cm³)","Standard Electrode Potential (E°)","Electronic Config.","Known Occurencies"])if(details.includes(obsolete))throw new Error(`Obsolete detail label: ${obsolete}`);
if(!app.includes('if(isTyping&&data!==" "&&!/\\s/.test(data||""))tryAutocomplete(false)')||app.includes("deletionAtWordEnd"))throw new Error("Autocomplete must trigger on inserted characters only, never deletions.");
for(const needle of ["if(e.key==='Tab'||e.key==='Enter')","function hasUnfinishedAutocompleteToken","abundanceDistributionTable(el,cmp)","ionizationTable(el,cmp)","compareIsotopeCount=cmp?DATA_MODEL.stableIsotopes(cmp.z).length:null","return b.value-a.value"])if(!app.includes(needle))throw new Error(`Missing behavior contract: ${needle}`);

console.log('UI contract passed: detail labels/order/units, comparison semantics, abundance sorting, autocomplete behavior, temperature units, and nuclide header.');
