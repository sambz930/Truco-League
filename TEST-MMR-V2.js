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

const close=matchDeltas(1500,1500,true,24,2);
const blowout=matchDeltas(1500,1500,true,24,26);
assert('Goleada cambia más MMR',blowout.deltaA>close.deltaA,'26 PdV debe producir mayor cambio que 2 PdV');

const underdog=matchDeltas(1300,1700,true,24,2);
const favorite=matchDeltas(1700,1300,true,24,2);
assert('Sorpresa da más MMR al favorito derrotado',underdog.deltaA>favorite.deltaA,'vencer con 1300 a 1700 debe premiar más que 1700 a 1300');

const closeLoss=matchDeltas(1500,1500,false,24,2);
const blowoutLoss=matchDeltas(1500,1500,false,24,26);
assert('Derrota amplia castiga más',blowoutLoss.deltaA<closeLoss.deltaA,'26 PdV debe restar más que 2 PdV');

let seed=1200;
for(let i=0;i<5;i++) seed += matchDeltas(seed,1200,true,50,15).deltaA;
assert('Calibración 5 partidas',Number.isFinite(seed) && seed>1200,'el jugador debe poder desplazarse durante la calibración');

function division(mmr,calibrating){
  if(calibrating)return 'CALIBRANDO';
  if(mmr<=999)return 'BRONCE';
  if(mmr<=1399)return 'PLATA';
  if(mmr<=1699)return 'ORO';
  if(mmr<=1999)return 'PLATINO';
  if(mmr<=2299)return 'DIAMANTE';
  return 'LEYENDA';
}
assert('Divisiones',division(999,false)==='BRONCE' && division(1000,false)==='PLATA' && division(1400,false)==='ORO' && division(1700,false)==='PLATINO' && division(2000,false)==='DIAMANTE' && division(2300,false)==='LEYENDA','umbrales incorrectos');
assert('Calibrando',division(2300,true)==='CALIBRANDO','la calibración debe ocultar la división hasta 5 partidas');

const softReset = mmr => Math.round(1000 + (Number(mmr)-1000)*0.75);
assert('Soft reset 1800 → 1600',softReset(1800)===1600,'resultado incorrecto');
assert('Soft reset 1200 → 1150',softReset(1200)===1150,'resultado incorrecto');

console.log('---');
console.log(`M(0)=${m0.toFixed(3)} · M(15)=${m15.toFixed(3)} · M(30)=${m30.toFixed(3)}`);
console.log('Todos los tests MMR v2 pasaron.');
