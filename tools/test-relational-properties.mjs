import assert from 'node:assert/strict';
import { createSearchContext } from './search-harness.mjs';

const {ctx,manifest}=createSearchContext();
const toxicityOrder=['very low','low','moderate','high','very high'];
const abundance=manifest.EXTRA_ABUNDANCE;

function rank(value){
  const i=toxicityOrder.indexOf(String(value||'').trim().toLowerCase());
  return i<0?null:i;
}
function actual(query){
  return Array.from(ctx.applyFilter(query,25),e=>e.sym).sort();
}
function expectedByToxicity(referenceSymbol,relation){
  const reference=manifest.elements.find(e=>e.sym===referenceSymbol);
  assert.ok(reference, 'reference element must exist');
  const target=rank(reference.tox);
  return manifest.elements.filter(e=>{
    const level=rank(e.tox);
    if(level==null||target==null)return false;
    return relation==='above'?level>target:level<target;
  }).map(e=>e.sym).sort();
}
function expectedByAbundance(fn){
  return manifest.elements.filter(e=>fn(abundance[e.z])).map(e=>e.sym).sort();
}
function sameSet(query,expected,label){
  assert.deepEqual(actual(query),expected,label);
}
const dim=(z,key)=>abundance[z]?.[key]??null;

// Toxicity uses an explicit ordinal scale: very low < low < moderate < high < very high.
sameSet('toxicity above Lithium',expectedByToxicity('Li','above'),'toxicity above an element');
sameSet('toxicity below Lithium',expectedByToxicity('Li','below'),'toxicity below an element');

// Earth is mapped to crustal abundance; the Sun maps to solar abundance.
// Both sides must have data before a cross-environment comparison is made.
sameSet('More abundant on earth than the sun',expectedByAbundance(a=>
  dimFrom(a,'crust')!=null&&dimFrom(a,'solar')!=null&&dimFrom(a,'crust')>dimFrom(a,'solar')
),'Earth-vs-Sun abundance comparison');

function dimFrom(row,key){const value=row?.[key];return Number.isFinite(value)&&value>=0?value:null;}

// An abundance comparison without a stated location uses the default crust dimension.
const copper=manifest.elements.find(e=>e.sym==='Cu');
assert.ok(copper);
const copperCrust=dim(copper.z,'crust');
sameSet('less abundant than copper',expectedByAbundance(a=>
  copperCrust!=null&&dimFrom(a,'crust')!=null&&dimFrom(a,'crust')<copperCrust
),'default crustal abundance comparison');

// A location suffix scopes both sides of the comparison to the requested dataset dimension.
const cobalt=manifest.elements.find(e=>e.sym==='Co');
assert.ok(cobalt);
const cobaltMeteorite=dim(cobalt.z,'meteorite');
sameSet('abundance above Co on meteorites',expectedByAbundance(a=>
  cobaltMeteorite!=null&&dimFrom(a,'meteorite')!=null&&dimFrom(a,'meteorite')>cobaltMeteorite
),'meteorite abundance comparison');

console.log('5/5 toxicity and abundance comparison regressions passed.');
