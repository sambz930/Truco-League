TRUCO LEAGUE v2 · TEST
2
BASE
- Parte de la versión con autenticación corregida.
- Perfiles legacy con correo + contraseña pueden migrarse al primer acceso.
- No se exige verificación de correo.
- “Ocultar de tabla” solo cambia la visibilidad; no bloquea la cuenta.

RATING / MMR
- El ranking principal ya no usa los puntos fijos 1v1/2v2/3v3.
- MMR inicial: 1200.
- K normal: 24.
- K de calibración: 50 durante las primeras 5 partidas del jugador en la temporada.
- Expectativa: E = 1 / (1 + 10^((MMR rival/equipo - MMR propio/equipo)/400)).
- Resultado: S=1 victoria, S=0 derrota.
- Ventaja normalizada: PdV limitada a 0..30.
- Multiplicador: M = 0.85 + 0.30*(PdV/30).
- Delta: ΔMMR = K*M*(S-E).
- En 2v2 y 3v3 el MMR de equipo es el promedio del MMR de sus integrantes.
- La ventaja afecta tanto las victorias como las derrotas: una caída amplia resta más que una caída cerrada.

DIVISIONES
- ⚔️ CALIBRANDO: primeras 5 partidas.
- 🟫 BRONCE: 0–999
- ⬜ PLATA: 1000–1399
- 🟨 ORO: 1400–1699
- 🟦 PLATINO: 1700–1999
- 💎 DIAMANTE: 2000–2299
- 👑 LEYENDA: 2300+

TEMPORADAS
- Duración: 45 días.
- Al cerrar la temporada se archivan las partidas y se genera una semilla nueva para cada jugador.
- Soft reset actual: 1000 + (MMR anterior - 1000)*0.75.
- La calibración vuelve a 0/5 en la nueva temporada.
- Se guarda `maxMmr` de cada jugador en `season_history` para conservar el récord histórico.

MISIONES
- Una misión por jugador y semana.
- Cazador: ganar contra un rival activo en los últimos 5 días.
- Demoledor: ganar por 20+ PdV.
- Equipo: jugar una partida 2v2.
- Constancia: jugar 10 partidas en la semana.
- Bonus máximo: +8 MMR por semana.
- Los objetivos de Cazador no dependen de que el rival esté visible en la tabla: oculto ≠ inactivo.
- La misión semanal queda congelada y persistida para no cambiar al recargar.

TABLA PRINCIPAL
POS · JUGADOR · DIV · MMR · V/D · VENT. · WR
- MMR es la métrica principal.
- VENT. muestra PdV promedio por partida.
- Los jugadores ocultos quedan fuera de la tabla pública pero continúan activos.

PARTIDO DE LA SEMANA
- Debajo de NOTICIAS DE LA SEMANA.
- Solo usa partidas APROBADAS jugadas hoy.
- Selecciona la partida destacada del día según competitividad/cercanía y presencia en puestos altos.

PERFIL
- División, MMR, V/D, WR y ventaja promedio.
- Rachas actuales y mejor racha histórica.
- Últimos 5 resultados.
- Evolución de MMR.
- Récord de MMR máximo histórico.
- Radar competitivo informativo 0–100.
- Misión semanal.
- Química 2v2 y socio ideal.
- H2H avanzado y últimos 5.
- Paternidad (≥70% con ≥5 duelos), Némesis y Rivalidad Histórica.
- Logros existentes.

PWA / INSTALACIÓN
- Se eliminó el aviso automático/agresivo de “Instalar Truco League” en teléfonos.
- El archivo ya no intercepta `beforeinstallprompt` para forzar un banner propio.
- La instalación queda a elección del jugador mediante las opciones normales del navegador/SO.

TEST
- TEST-MMR-V2.js valida multiplicadores, victorias, derrotas, sorpresas, goleadas, calibración, divisiones y soft reset.

NOTA DE PRODUCCIÓN
El cálculo v2 sigue derivándose en cliente a partir de partidas APROBADAS. Para producción, la autoridad final de MMR, bonus de misión y cierre de temporada debería trasladarse a backend/Cloud Functions para evitar manipulación del cliente.
