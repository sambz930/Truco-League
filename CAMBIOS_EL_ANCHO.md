# EL ANCHO — Renovación

## Interfaz
- Renovación completa con estética de bar argentino antiguo: madera, latón, paño verde y cartelería.
- Nueva jerarquía visual para login, salón de mesas, tabla y mesa de juego.
- Animaciones de entrada, cartas, acciones, modales, salas y avisos.
- Diseño adaptable a escritorio y móvil.
- Respeta `prefers-reduced-motion`.

## Baraja española
- Reemplazo de emojis/iconos de palo por símbolos vectoriales SVG.
- Cartas con marco y textura tipo naipe, reverso de baraja y figuras Sota/Caballo/Rey.
- La baraja continúa siendo de 40 cartas y la jerarquía existente no cambia.

## Juego por puntos
- Cada mesa puede ser amistosa (0) o apostar 1, 2 o 3 puntos de la tabla por jugador.
- Al entrar el segundo jugador, la apuesta se bloquea en una transacción de Firestore.
- El pozo es el doble de la apuesta; el ganador recibe el pozo, por lo que la variación neta de la apuesta es +N / -N.
- La apuesta se liquida una sola vez y queda registrada en `partidas`.
- El resultado de la partida sigue utilizando el cálculo existente de `VENTAJA`.

## Compatibilidad
- Se mantienen las colecciones Firestore existentes.
- No se modifican las reglas de Truco, Envido, Retruco, Vale Cuatro, resolución de manos ni mazo.
