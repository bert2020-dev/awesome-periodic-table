import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const HERE=path.dirname(fileURLToPath(import.meta.url)),ROOT=path.resolve(HERE,'..');
const version=fs.readFileSync(path.join(ROOT,'VERSION'),'utf8').trim();
if(!/^\d+\.\d+\.\d+$/.test(version)) throw new Error(`VERSION is not X.Y.Z: ${version}`);
const pkg=JSON.parse(fs.readFileSync(path.join(ROOT,'package.json'),'utf8'));
if(pkg.version!==version) throw new Error(`package.json version ${pkg.version} != VERSION ${version}`);
const shell=fs.readFileSync(path.join(ROOT,'src/index.html'),'utf8');
const app=fs.readFileSync(path.join(ROOT,'src/js/app.js'),'utf8');
const css=fs.readFileSync(path.join(ROOT,'src/css/app.css'),'utf8');
if(!shell.includes('__APP_VERSION__')) throw new Error('Missing __APP_VERSION__ token');
if(!shell.includes('<link rel="stylesheet"')||!shell.includes('<link rel="csv"')) throw new Error('Source shell must retain CSS/CSV resource links for Arcager --merge.');
if(!app.includes('window.__APT_DATA_READY__')) throw new Error('App must consume the generated data promise.');
if(!shell.includes('<script src="js/data-bootstrap.js"></script>')||!shell.includes('<script src="js/app.js"></script>')) throw new Error('Source shell must retain JS resource links for the builder/Arcager merge.');
for(const file of ['elements.csv','element-extra.csv','lookups.csv']) if(!fs.existsSync(path.join(ROOT,'data',file))) throw new Error(`Missing data/${file}`);

function header(file){return fs.readFileSync(path.join(ROOT,'data',file),'utf8').split(/\r?\n/,1)[0];}
const expectedHeaders={
  'elements.csv':'z,sym,name,latin,mass,cat,melt,boil,config,density,en,ie,sources,e0,tox,year,oxidation,halflife,discoverySource,discoveryCountry',
  'element-extra.csv':'z,electricalConductivity,thermalConductivity,specificHeat,electricalType,crustAbundance,oceanAbundance,ionizationEnergies,isotopes,isotopeAbundance,universeAbundance,humanAbundance',
  'lookups.csv':'kind,key,value'
};
for(const [file,expected] of Object.entries(expectedHeaders)) if(header(file)!==expected) throw new Error(`CSV schema changed in data/${file}. Update the data pipeline, pipe format and docs before proceeding.`);
if(!css.includes('.app-version')) throw new Error('Header version styling missing');
console.log(`Source checks passed for ${version}`);
