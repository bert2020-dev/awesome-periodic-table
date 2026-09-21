import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const source=fs.readFileSync(new URL('../src/js/autocomplete-engine.js', import.meta.url),'utf8').replace(/\nif\(typeof module!==[\s\S]*$/,'');
const sandbox={};
vm.createContext(sandbox);
vm.runInContext(source+'\nthis.AutocompleteEngine=AutocompleteEngine;',sandbox);
const {AutocompleteEngine}=sandbox;

const elements=[
  {name:'Hydrogen',latin:'Hydrogenium',discoveryCountry:'United Kingdom',sources:'Air'},
  {name:'Helium',latin:'Helium',discoveryCountry:'Sweden and United Kingdom',sources:'Natural gas'},
  {name:'Boron',latin:'Borum',discoveryCountry:'France and United Kingdom',sources:'Turkey, USA'},
  {name:'Titanium',latin:'Titanium',discoveryCountry:'United Kingdom',sources:'Australia, South Africa, China'},
  {name:'Germanium',latin:'Germanium',discoveryCountry:'Germany',sources:'Germany'},
];
const engine=new AutocompleteEngine(elements);

function best(prefix,history=[]){
  const out=engine.suggest(prefix,prefix.length,history);
  return out?.best?.toLowerCase()||null;
}

assert.equal(best('united'),'united states','default United completion should remain stable');
assert.equal(best('united k'),'united kingdom','multi-word completion must branch on the typed second word');
assert.equal(best('united s'),'united states','United States should remain discoverable');
assert.equal(best('more common in h'),'more common in humans','new abundance comparison phrase should autocomplete');
assert.equal(best('more common in u'),'more common in universe','new universe comparison phrase should autocomplete');

const history=['united kingdom and germany and sweden'];
const historyResult=best('united kingdom and ge',history);
assert.equal(historyResult,'germany','history should boost the current token, not paste a whole historical query');
assert.equal(historyResult?.includes('and sweden'),false,'historical remainder must never be offered as the completion');

console.log('7/7 autocomplete tests passed');
