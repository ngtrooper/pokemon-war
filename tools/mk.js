const {Dex}=require('@pkmn/dex');const fs=require('fs');
const B=JSON.parse(fs.readFileSync('basics.json'));
const HAND=new Set('bulbasaur charmander squirtle pikachu eevee growlithe poliwag geodude machop oddish pidgey rattata chikorita cyndaquil totodile mareep togepi sentret hoothoot wooper spinarak sudowoodo marill snubbull'.split(' '));
const BOSSONLY=new Set(['onix','snorlax','heracross']);
const STARTERS=new Set('bulbasaur charmander squirtle pikachu eevee chikorita cyndaquil totodile mareep togepi dratini larvitar'.split(' '));
const P={Normal:['tackle','tackle'],Fire:['flamewheel','ember'],Water:['watergun','watergun'],Grass:['vinewhip','absorb'],Electric:['thundershock','thundershock'],
 Ice:['powdersnow','powdersnow'],Fighting:['lowkick','lowkick'],Poison:['poisonsting','acid'],Ground:['mudslap','mudslap'],Flying:['peck','gust'],
 Psychic:['confusion','confusion'],Bug:['bugbite','bugbite'],Rock:['rockthrow','rockthrow'],Ghost:['lick','lick'],Dragon:['dragonrage','dragonrage'],
 Dark:['bite','bite'],Steel:['metalclaw','metalclaw'],Fairy:['playrough','fairywind']};
const key=n=>n.toLowerCase().replace(/[^a-z]/g,'').replace('nidoranf','nidoranf');
const cl=(v,a,b)=>Math.max(a,Math.min(b,v));
const species={}, pools={kanto:{rare:[],uncommon:[],common:[]},johto:{rare:[],uncommon:[],common:[]}};
for(const reg of ['kanto','johto']) for(const e of B[reg]){
  const s=Dex.species.get(e.name), k=key(s.name), b=s.baseStats;
  if(BOSSONLY.has(k)) continue;
  const bst=Object.values(b).reduce((x,y)=>x+y,0);
  const tier=STARTERS.has(k)||bst>=450?'rare':bst>=300?'uncommon':'common';
  pools[reg][tier].push(k);
  if(HAND.has(k)) continue;
  const st={hp:Math.round(10+Math.min(b.hp,130)*.22)}; for(const x of ['atk','def','spa','spd','spe']) st[x]=Math.max(1,Math.round(Math.min(b[x],130)/8));
  const gr={hp:cl(Math.round(b.hp*.5)+30,30,90)}; for(const x of ['atk','def','spa','spd','spe']) gr[x]=cl(Math.round(b[x]*.55)+15,15,85);
  if(bst>=450&&!s.evos.length){ st.hp=Math.round(st.hp*.85); for(const x of ['atk','def','spa','spd','spe']) st[x]=Math.max(1,Math.round(st[x]*.8)); }
  const phys=b.atk>=b.spa?0:1; const mv=[];
  for(const t of s.types){ const m=P[t][phys]; if(!mv.includes(m)) mv.push(m); }
  if(s.types.length===1){ if(s.types[0]!=='Normal') mv.unshift(b.atk>=b.spa?'tackle':'pound'); else mv.push(b.spe>=70?'quickattack':'bite'); }
  if(k==='magikarp') mv.splice(0,mv.length,'splash','tackle');
  const fly=s.types.includes('Flying')||Object.values(s.abilities).includes('Levitate');
  species[k]={id:e.id,n:s.name.replace('Nidoran-F','Nidoran♀').replace('Nidoran-M','Nidoran♂'),ty:s.types,mov:b.spe>=90?6:b.spe<=40?4:5,st,gr,mv,...(fly?{fly:true}:{})};
}
let js='// Auto-generated from Pokémon Showdown base stats (@pkmn/dex): stats = base/8 (HP 10 + base×0.22), growth from base.\nconst AUTO_SPECIES = {\n';
for(const k in species) js+=`  ${k}:${JSON.stringify(species[k])},\n`;
js+='};\nconst AUTO_POOLS = '+JSON.stringify(pools)+';\n';
fs.writeFileSync('/home/claude/parts/auto.js',js);
for(const r in pools) console.log(r,Object.fromEntries(Object.entries(pools[r]).map(([t,l])=>[t,l.length])), pools[r].rare.join(','));
console.log(Object.keys(species).length,'new species'); console.log(species.lapras, species.gastly, species.magikarp);
fs.writeFileSync('ids.txt',Object.values(species).map(s=>s.id).join(' '));
