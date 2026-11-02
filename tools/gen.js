const {Dex}=require('@pkmn/dex');const fs=require('fs');
const tracker=JSON.parse(fs.readFileSync('/tmp/sc/tracker.json'));
const SKIP=new Set(['Ditto','Unown','Smeargle','Wobbuffet']);
const out={kanto:[],johto:[]};
for(let n=1;n<=251;n++){const s=Dex.species.get(Dex.species.all().find(x=>x.num===n&&!x.forme).name);
  if(s.tags.some(t=>/Legend|Mythical/.test(t))||SKIP.has(s.name)) continue;
  const pre=s.prevo?Dex.species.get(s.prevo):null; const lim=n<=151?151:251;
  if(pre&&pre.num<=lim) continue;
  const id=String(n).padStart(4,'0'); const t=tracker[id];
  const sc=t&&t.sprite_complete, pc=t&&t.portrait_complete;
  const shiny=t&&t.subgroups&&t.subgroups['0000']&&t.subgroups['0000'].subgroups&&t.subgroups['0000'].subgroups['0001'];
  out[n<=151?'kanto':'johto'].push({n,id,name:s.name,sc,pc,shs:shiny?shiny.sprite_complete:-1,bst:Object.values(s.baseStats).reduce((a,b)=>a+b,0)});}
for(const r in out){console.log(r,out[r].length,out[r].filter(x=>!x.sc).map(x=>x.name),'noShiny:',out[r].filter(x=>x.shs<=0).map(x=>x.name));}
fs.writeFileSync('basics.json',JSON.stringify(out));
console.log(out.kanto.map(x=>x.name).join(', '));console.log(out.johto.map(x=>x.name).join(', '));
