/* Pure autocomplete engine. No DOM dependencies.
   It completes the current token or the current phrase context, never an
   entire historical query. This keeps multi-word branches ("united k" →
   "united kingdom") discoverable while preventing old searches from being
   pasted wholesale into the current query. */
class AutocompleteEngine {
  constructor(elements=[]) {
    this.weights=new Map();
    this.history=[];
    this._build(elements);
  }
  _add(word,weight=10){
    if(!word)return;
    const value=String(word).trim();
    if(value.length<2)return;
    const key=value.toLowerCase();
    this.weights.set(key,Math.max(this.weights.get(key)||0,weight));
  }
  _addCountryPhrase(value,weight=30){
    String(value||'').split(/\s+and\s+|\s*,\s*/i).map(s=>s.trim()).filter(Boolean).forEach(part=>this._add(part,weight));
  }
  _build(elements){
    elements.forEach(e=>{
      this._add(e.name,60);
      this._add(e.latin,25);
      this._addCountryPhrase(e.discoveryCountry,32);
      String(e.sources||'').split(/[,;]/).map(s=>s.trim()).filter(Boolean).forEach(s=>this._addCountryPhrase(s,18));
    });
    [
      ['United States',57],['United Kingdom',56],['USA',44],['UK',44],
      ['Germany',50],['Sweden',48],['France',48],['Italy',48],['Australia',48],['Brazil',48],['Canada',48],['China',48],['India',48],['Japan',48],['Russia',48],['Spain',48],['Switzerland',48],['Austria',48],['Belgium',48],['Poland',48],['Portugal',48],['Norway',48],['Finland',48],['Denmark',48],['Ireland',48],['Israel',48],['Mexico',48],['Turkey',48],['Greece',48],['Hungary',48],['Romania',48],['Ukraine',48],['South Africa',48],['South Korea',48],['South America',45],['Worldwide',45],
      ['transition',55],['metalloid',55],['metalloids',55],['nonmetal',50],['nonmetals',50],
      ['halogen',50],['halogens',50],['noble gas',50],['noble gases',50],['lanthanide',48],
      ['lanthanides',48],['actinide',48],['actinides',48],['alkali',48],['alkaline',48],
      ['post-transition',48],['metal',45],['metals',45],
      ['solid',50],['liquid',50],['gas',50],['toxic',48],['radioactive',48],['stable',48],
      ['hazardous',44],['conductor',44],['insulator',44],['semiconductor',44],
      ['paramagnetic',44],['diamagnetic',44],['ferromagnetic',44],['antiferromagnetic',44],
      ['density',48],['mass',48],['melts',48],['boils',48],['electronegativity',48],
      ['conductivity',45],['electrical conductivity',45],['thermal conductivity',45],
      ['ionization energy',48],['specific heat',45],['abundance',48],['crust abundance',48],
      ['ocean abundance',48],['universe abundance',48],['human abundance',48],
      ['abundance in humans',48],['abundance in the universe',48],['abundance in the ocean',48],
      ['more abundant in humans',50],['more abundant in universe',50],
      ['more common in humans',50],['more common in universe',50],
      ['less abundant in humans',50],['less abundant in universe',50],
      ['less common in humans',50],['less common in universe',50],
      ['more abundant in the humans',50],['more abundant in the universe',50],
      ['more common in the humans',50],['more common in the universe',50],
      ['oxidation',44],['magnetism',44],['toxicity',44],['radiation',44],['year',44],['category',44],
      ['above',40],['below',40],['between',40],['and',38],['or',38],['not',38],['under',38],['over',38],
      ['greater than',40],['less than',40],['higher than',40],['lower than',40],['more than',40],
      ['heavier than',40],['lighter than',40],['after',40],['before',40],['from',40],['discovered',40],
      ['first ionization energy',45],['second ionization energy',45],['third ionization energy',44],
      ['highest first ionization energy',45],['highest second ionization energy',45],
      ['lowest first ionization energy',45],['lowest second ionization energy',45],
      ['most dense',45],['least dense',45],['densest',45],['heaviest',45],['lightest',45],
      ['most electronegative',45],['least electronegative',45],['highest melting point',45],
      ['lowest melting point',45],['highest boiling point',45],['lowest boiling point',45],
      ['most conductive',45],['least conductive',45],['most abundant',45],['least abundant',45],
      ['most common',45],['least common',45],['earliest discovered',45],['latest discovered',45]
    ].forEach(([w,weight])=>this._add(w,weight));
  }
  setHistory(history=[]){this.history=Array.isArray(history)?history.slice(-50):[];}
  _segmentStart(before){
    let start=0;
    for(const m of before.matchAll(/,|\b(?:and|or|not)\b/gi)) start=m.index+m[0].length;
    return start;
  }
  context(text,caret){
    const before=String(text||'').slice(0,caret);
    const segmentStart=this._segmentStart(before);
    const segment=before.slice(segmentStart).trimStart();
    const lastToken=(segment.match(/[^\s,]*$/)||[''])[0];
    const tokenStart=caret-lastToken.length;
    const fullPrefix=segment;
    const fullMatches=fullPrefix.length>=2 ? this._matching(fullPrefix) : [];
    return {
      start:fullMatches.length?caret-fullPrefix.length:tokenStart,
      prefix:fullMatches.length?fullPrefix:lastToken,
      fullPrefix,
      token:lastToken,
      fullMatches
    };
  }
  _matching(prefix){
    const p=String(prefix||'').toLowerCase();
    if(p.length<2)return[];
    return [...this.weights.entries()].filter(([word])=>word.length>p.length&&word.startsWith(p));
  }
  _historyBoost(word){
    const needle=word.toLowerCase();
    let hits=0;
    for(const entry of this.history){
      const low=String(entry||'').toLowerCase().replace(/\s+/g,' ').trim();
      if(!low)continue;
      if(low===needle)hits+=20;
      else if(low.split(/\s+/).includes(needle))hits+=12;
      else if(low.includes(needle))hits+=1;
    }
    return hits;
  }
  candidates(prefix, history=this.history){
    this.setHistory(history);
    const p=String(prefix||'').toLowerCase();
    if(p.length<2)return[];
    return [...this.weights.entries()]
      .filter(([word])=>word.length>p.length&&word.startsWith(p))
      .map(([word,weight])=>({word,score:weight+this._historyBoost(word)}))
      .sort((a,b)=>b.score-a.score||a.word.length-b.word.length||a.word.localeCompare(b.word));
  }
  suggest(text,caret,history=[]){
    const ctx=this.context(text,caret);
    let candidates=this.candidates(ctx.prefix,history);
    if(!candidates.length && ctx.fullPrefix!==ctx.token)candidates=this.candidates(ctx.token,history);
    const best=candidates[0];
    if(!best)return null;
    return {best:best.word,prefix:ctx.prefix,start:ctx.start,context:ctx};
  }
}

