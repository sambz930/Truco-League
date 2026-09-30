function expected(a,b){return 1/(1+Math.pow(10,(b-a)/400));}
function mult(m){return 0.85+0.30*(Math.min(30,Math.max(0,m))/30)}
function matchDeltas(mmra,mmrb,winnerA,k,margin){
  const eA=expected(mmra,mmrb);
  const m=mult(margin);
  const deltaA=k*m*((winnerA?1:0)-eA);
  const deltaB=k*m*((winnerA?0:1)-(1-eA));
  return {eA,deltaA,deltaB,m};
}
function approx(a,b,eps=1e-9){return Math.abs(a-b)<=eps;}
function assert(name,cond,msg){if(!cond)throw new Error(`${name}: ${msg}`);console.log(`✅ ${name}`);}

const m0=mult(0),m15=mult(15),m30=mult(30);
assert('Multiplicador 0 PdV',approx(m0,0.85),'esperado 0.85');
assert('Multiplicador 15 PdV',approx(m15,1.00),'esperado 1.00');
assert('Multiplicador 30 PdV',approx(m30,1.15),'esperado 1.15');

let r=matchDeltas(1500,1500,true,24,2);
assert('Victoria cerrada equilibrada',r.deltaA>0 && r.deltaB<0,'el ganador debe subir y el perdedor bajar');
assert('Victoria cerrada suma cero',approx(r.deltaA+r.deltaB,0),'los cambios deben compensarse');

const close=matchDeltas(1500,1500,true,20,2);
const blowout=matchDeltas(1500,1500,true,20,26);
assert('Goleada cambia más MMR',blowout.deltaA>close.deltaA,'26 PdV debe producir mayor cambio que 2 PdV');

const underdog=matchDeltas(1300,1700,true,20,2);
const favorite=matchDeltas(1700,1300,true,20,2);
assert('Sorpresa da más MMR al favorito derrotado',underdog.deltaA>favorite.deltaA,'vencer con 1300 a 1700 debe premiar más que 1700 a 1300');

const closeLoss=matchDeltas(1500,1500,false,20,2);
const blowoutLoss=matchDeltas(1500,1500,false,20,26);
assert('Derrota amplia castiga más',blowoutLoss.deltaA<closeLoss.deltaA,'26 PdV debe restar más que 2 PdV');

let seed=1000;
for(let i=0;i<5;i++) seed += matchDeltas(seed,1000,true,35,15).deltaA;
assert('Calibración 5 partidas',Number.isFinite(seed) && seed>1000,'el jugador debe poder desplazarse durante la calibración');

function division(mmr,calibrating){
  if(calibrating)return 'CALIBRANDO';
  if(mmr<=899)return 'BRONCE';
  if(mmr<=999)return 'PLATA';
  if(mmr<=1099)return 'ORO';
  if(mmr<=1199)return 'PLATINO';
  if(mmr<=1299)return 'DIAMANTE';
  return 'LEYENDA';
}
assert('Divisiones',division(899,false)==='BRONCE' && division(900,false)==='PLATA' && division(1000,false)==='ORO' && division(1100,false)==='PLATINO' && division(1200,false)==='DIAMANTE' && division(1300,false)==='LEYENDA','umbrales incorrectos');
assert('Calibrando',division(2300,true)==='CALIBRANDO','la calibración debe ocultar la división hasta 5 partidas');

const softReset = mmr => Math.round(1000 + (Number(mmr)-1000)*0.75);
assert('Soft reset 1800 → 1600',softReset(1800)===1600,'resultado incorrecto');
assert('Soft reset 1200 → 1150',softReset(1200)===1150,'resultado incorrecto');

console.log('---');
console.log(`M(0)=${m0.toFixed(3)} · M(15)=${m15.toFixed(3)} · M(30)=${m30.toFixed(3)}`);
console.log('Todos los tests MMR v2 pasaron.');


// Temporada corta: 49 partidas, 34 victorias / 15 derrotas.
// En rivales equivalentes, el orden de resultados produce una banda aproximada;
// la referencia debe quedar alrededor de PLATINO, no automáticamente en DIAMANTE/LEYENDA.
function simOrder(order,k=20,kc=35,seed=1000,margin=15){
  let r=seed;
  for(let i=0;i<order.length;i++){
    const kk=i<5?kc:k;
    const e=expected(r,1000);
    const won=order[i]===1;
    r += kk*mult(margin)*((won?1:0)-(won?e:1-e));
  }
  return r;
}
let base=[...Array(34).fill(1),...Array(15).fill(0)];
let min49=Infinity,max49=-Infinity,sum49=0;
for(let trial=0;trial<2000;trial++){
  const order=base.slice();
  for(let i=order.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[order[i],order[j]]=[order[j],order[i]];}
  const value=simOrder(order);
  min49=Math.min(min49,value); max49=Math.max(max49,value); sum49+=value;
}
const avg49=sum49/2000;
assert('49 partidas / 34V 15D alrededor de PLATINO',avg49>=1100 && avg49<1200,'la referencia de 70% WR debería caer aproximadamente en PLATINO frente a rivales equivalentes');
assert('34V/15D no llega automáticamente a rangos extremos',max49<1300,'ni el mejor orden de resultados debe regalar DIAMANTE/LEYENDA automáticamente');
console.log(`49 partidas · 34V/15D → promedio ≈ ${Math.round(avg49)} MMR · rango observado ${Math.round(min49)}–${Math.round(max49)} en simulaciones`);
console.log('Todos los tests MMR v2 pasaron.');
