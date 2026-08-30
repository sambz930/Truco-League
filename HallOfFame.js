// HallOfFame.js
function HallOfFame({ rankingData, approvedPartidas }) {
  const hallOfFameData = React.useMemo(() => {
    if (!rankingData.length) return null;

    const topWins = [...rankingData].sort((a, b) => b.ganadas - a.ganadas)[0];

    const streakMap = {};
    rankingData.forEach(p => { streakMap[p.nombre] = { maxStreak: 0, current: 0 }; });

    const sortedMatches = [...approvedPartidas].sort((a, b) => Number(a.id) - Number(b.id));
    sortedMatches.forEach(m => {
      if (streakMap[m.ganador]) {
        streakMap[m.ganador].current += 1;
        if (streakMap[m.ganador].current > streakMap[m.ganador].maxStreak) {
          streakMap[m.ganador].maxStreak = streakMap[m.ganador].current;
        }
      }
      if (streakMap[m.perdedor]) {
        streakMap[m.perdedor].current = 0;
      }
    });

    let topStreakPlayer = { nombre: 'N/A', maxStreak: 0 };
    Object.keys(streakMap).forEach(name => {
      if (streakMap[name].maxStreak > topStreakPlayer.maxStreak) {
        topStreakPlayer = { nombre: name, maxStreak: streakMap[name].maxStreak };
      }
    });

    let biggestBlowout = { winner: 'N/A', loser: 'N/A', ventaja: 0, score: '' };
    approvedPartidas.forEach(m => {
      const diff = Number(m.ventaja || 0);
      if (diff > biggestBlowout.ventaja) {
        biggestBlowout = {
          winner: m.ganador,
          loser: m.perdedor,
          ventaja: diff,
          score: `${m.ptsGanador} - ${m.ptsPerdedor}`
        };
      }
    });

    const topWR = [...rankingData]
      .filter(p => p.pj >= 3)
      .sort((a, b) => b.wrPct - a.wrPct)[0];

    return {
      top1: rankingData[0],
      topWins,
      topStreakPlayer,
      biggestBlowout,
      topWR
    };
  }, [rankingData, approvedPartidas]);

  if (!hallOfFameData || !hallOfFameData.top1) {
    return (
      <div className="glass-card rounded-2xl p-8 text-center text-slate-400">
        <span className="text-4xl">🏛️</span>
        <p className="mt-2 text-sm">Se necesitan más partidas para habilitar el Salón de la Fama.</p>
      </div>
    );
  }

  const { top1, topWins, topStreakPlayer, biggestBlowout, topWR } = hallOfFameData;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="text-center space-y-1">
        <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-400 to-yellow-500 flex items-center justify-center gap-2">
          🏛️ SALÓN DE LA FAMA 🏛️
        </h2>
        <p className="text-xs text-slate-400">Leyendas y récords históricos de la Truco League</p>
      </div>

      <div className="glass-card-accent rounded-2xl p-6 border-2 border-amber-500/40 text-center relative overflow-hidden shadow-2xl bg-gradient-to-b from-amber-500/10 via-slate-900 to-slate-950">
        <div className="absolute top-3 right-3 text-3xl opacity-20">👑</div>
        <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 bg-amber-500/20 px-3 py-1 rounded-full border border-amber-500/30 inline-block mb-3">
          Líder Absoluto de la Liga
        </span>
        <h3 className="text-3xl font-black text-white tracking-tight">{top1.nombre}</h3>
        <p className="text-xs text-slate-400 mt-1">
          <strong className="text-emerald-400 font-extrabold text-sm">{top1.puntos} pts</strong> | {top1.ganadas}G - {top1.perdidas}P ({top1.wrPct}% WR)
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="glass-card rounded-2xl p-4 border border-slate-800 space-y-2">
          <div className="flex items-center gap-2 text-amber-400">
            <span className="text-xl">🏆</span>
            <h4 className="text-xs font-black uppercase tracking-wider">Máximo Ganador</h4>
          </div>
          <p className="text-lg font-bold text-white">{topWins?.nombre || 'N/A'}</p>
          <p className="text-xs text-slate-400 font-medium">
            <strong className="text-amber-300 font-bold">{topWins?.ganadas || 0}</strong> victorias registradas
          </p>
        </div>

        <div className="glass-card rounded-2xl p-4 border border-slate-800 space-y-2">
          <div className="flex items-center gap-2 text-orange-400">
            <span className="text-xl">🔥</span>
            <h4 className="text-xs font-black uppercase tracking-wider">Mayor Racha Imbatible</h4>
          </div>
          <p className="text-lg font-bold text-white">{topStreakPlayer.nombre}</p>
          <p className="text-xs text-slate-400 font-medium">
            <strong className="text-orange-400 font-bold">{topStreakPlayer.maxStreak}</strong> partidas seguidas sin perder
          </p>
        </div>

        <div className="glass-card rounded-2xl p-4 border border-slate-800 space-y-2">
          <div className="flex items-center gap-2 text-cyan-400">
            <span className="text-xl">🎯</span>
            <h4 className="text-xs font-black uppercase tracking-wider">Rey de la Efectividad</h4>
          </div>
          <p className="text-lg font-bold text-white">{topWR?.nombre || 'N/A'}</p>
          <p className="text-xs text-slate-400 font-medium">
            <strong className="text-cyan-300 font-bold">{topWR?.wrPct || 0}%</strong> de efectividad (Mín. 3 PJ)
          </p>
        </div>

        <div className="glass-card rounded-2xl p-4 border border-slate-800 space-y-2">
          <div className="flex items-center gap-2 text-red-400">
            <span className="text-xl">💥</span>
            <h4 className="text-xs font-black uppercase tracking-wider">Paliza Histórica</h4>
          </div>
          <p className="text-lg font-bold text-white">
            {biggestBlowout.winner} <span className="text-slate-500 font-normal">vs</span> {biggestBlowout.loser}
          </p>
          <p className="text-xs text-slate-400 font-medium">
            Resultado: <strong className="text-emerald-400">{biggestBlowout.score}</strong> (+{biggestBlowout.ventaja} pts)
          </p>
        </div>
      </div>
    </div>
  );
}
