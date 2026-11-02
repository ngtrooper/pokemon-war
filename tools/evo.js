// Build evolution data for every Gen 1-2 family reachable from our recruitable basics (Gen 2 rules).
const {Dex}=require('@pkmn/dex');const fs=require('fs');const D=Dex.forGen(2);
const key=n=>n.toLowerCase().replace(/[^a-z]/g,'');
const B=JSON.parse(fs.readFileSync('basics.json'));
const cl=(v,a,b)=>Math.max(a,Math.min(b,v));
const P={Normal:['tackle','tackle'],Fire:['flamewheel','ember'],Water:['watergun','watergun'],Grass:['vinewhip','absorb'],Electric:['thundershock','thundershock'],
 Ice:['powdersnow','powdersnow'],Fighting:['lowkick','lowkick'],Poison:['poisonsting','acid'],Ground:['mudslap','mudslap'],Flying:['peck','gust'],
 Psychic:['confusion','confusion'],Bug:['bugbite','bugbite'],Rock:['rockthrow','rockthrow'],Ghost:['lick','lick'],Dragon:['dragonrage','dragonrage'],
 Dark:['bite','bite'],Steel:['metalclaw','metalclaw'],Fairy:['playrough','fairywind']};
const statsOf=b=>{const st={hp:Math.round(10+Math.min(b.hp,130)*.22)};for(const x of ['atk','def','spa','spd','spe'])st[x]=Math.max(1,Math.round(Math.min(b[x],130)/8));return st;};
const growOf=b=>{const g={hp:cl(Math.round(b.hp*.5)+30,30,90)};for(const x of ['atk','def','spa','spd','spe'])g[x]=cl(Math.round(b[x]*.55)+15,15,85);return g;};
const BABY=new Set(['pichu','cleffa','igglybuff','smoochum','elekid','magby','tyrogue','togepi']);
const evo={}, base={}, newSpecies={}; const lvOf={};
function gameLv(s){ // evolution level for species s (the evolved form), scaled to our campaign
  const pre=D.species.get(s.prevo), pk=key(pre.name);
  if(s.evoLevel) return Math.round(5+s.evoLevel*0.42);
  const prevStage=lvOf[pk]||null;
  if(BABY.has(pk)) return 10;
  if(s.evoType==='trade') return (prevStage||12)+5;
  return Math.max(12,(prevStage||8)+4); // stones, friendship, etc.
}
function walk(s){ const k=key(s.name); base[k]=statsOf(s.baseStats);
  for(const e of s.evos){ const t=D.species.get(e); if(!t.exists||t.num>251||t.forme) continue; const tk=key(t.name);
    if((evo[k]||[]).some(x=>x.to===tk)) continue;
    const lv=gameLv(t); lvOf[tk]=lv; (evo[k]=evo[k]||[]).push({to:tk,lv});
    if(!newSpecies[tk]){ const b=t.baseStats, phys=b.atk>=b.spa?0:1, mv=[];
      for(const ty of t.types){const m=P[ty][phys]; if(!mv.includes(m)) mv.push(m);} if(t.types.length===1){ if(t.types[0]!=='Normal') mv.unshift(phys?'pound':'tackle'); else mv.push(b.spe>=70?'quickattack':'bite'); }
      const fly=t.types.includes('Flying')||Object.values(t.abilities).includes('Levitate');
      newSpecies[tk]={id:String(t.num).padStart(4,'0'),n:t.name.replace('Mr. Mime','Mr. Mime'),ty:t.types,mov:b.spe>=90?6:b.spe<=40?4:5,st:statsOf(b),gr:growOf(b),mv,...(fly?{fly:true}:{})}; }
    walk(t); } }
for(const r of ['kanto','johto']) for(const e of B[r]) walk(D.species.get(e.name));
// Onix->Steelix, Scyther->Scizor etc. come through walk(); Snorlax/Heracross have none.
let js='// Auto-generated evolution data (Gen 2 rules, @pkmn/dex). EVOS[from] = [{to, lv}], lv scaled to this campaign.\n';
js+='const EVO_SPECIES = {\n'+Object.entries(newSpecies).map(([k,v])=>`  ${k}:${JSON.stringify(v)},`).join('\n')+'\n};\n';
js+='const EVOS = '+JSON.stringify(evo)+';\n';
js+='const BASE_ST = '+JSON.stringify(base)+';\n';
fs.writeFileSync('/home/claude/parts/evo.js',js);
fs.writeFileSync('evo_ids.txt',[...new Set(Object.values(newSpecies).map(s=>s.id))].join(' '));
console.log(Object.keys(newSpecies).length,'evolved species;', Object.keys(evo).length,'species evolve');
for(const k of ['bulbasaur','ivysaur','charmander','pichu','eevee','poliwhirl','gloom','slowpoke','tyrogue','onix','scyther','golbat','kadabra','dratini','dragonair','larvitar','pupitar','magikarp','togepi','chikorita','mareep']) console.log(k, JSON.stringify(evo[k]));
