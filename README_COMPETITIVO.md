# Truco League — versión competitiva corregida 1

## Cambios de esta versión

### Ranking oficial
- Se conserva el modelo original del campeonato.
- **1v1 = 1 punto** para cada ganador.
- **2v2 = 2 puntos** para cada jugador del equipo ganador.
- **3v3 = 2 puntos** para cada jugador del equipo ganador.
- La tabla se ordena oficialmente por **Pts → Ventaja**.
- No existe RTG/Elo ni ninguna puntuación auxiliar que altere la posición oficial.
- El cálculo vuelve a usar **todas las partidas APROBADAS disponibles**, no únicamente las de la temporada actual. Esto es intencional para conservar el historial y los valores que ya tenía la tabla original.
- No se modifican ni borran automáticamente documentos históricos de Firebase.

### Tabla de posiciones
- Se conserva la información principal del modo original: Pos, Jugador, Pts, G/P, PJ, Ventaja, WR% y movimiento.
- **Forma** se muestra de manera compacta con `V` = victoria y `D` = derrota.
- En celular se ocultan las columnas secundarias `PJ`, `Ventaja` y `WR%` para evitar una tabla apretada; en escritorio vuelven a mostrarse.
- Las flechas ↑ ↓ comparan la posición anterior con la nueva.
- El snapshot de movimiento ahora espera a que Firebase haya completado la primera sincronización de partidas, evitando guardar como referencia una tabla incompleta.

### H2H
- El H2H se calcula directamente desde las partidas 1v1 APROBADAS.
- Muestra victorias de cada jugador, enfrentamientos totales y **Winrate (WR%)** para ambos.
- No depende de un contador mutable separado que pueda quedar desincronizado.

### Salón de Fama
- Se simplificó el encabezado y se redujeron los indicadores visuales.
- Se mantienen los elementos competitivos útiles: mejor WR, racha actual, mejor dúo, humillaciones 30-0, palizas y títulos.
- Las **humillaciones 30-0** se calculan sobre todo el conjunto de partidas aprobadas, por lo que vuelven a aparecer los registros históricos.

### Accesos — solo administradores
Todo el apartado administrativo queda concentrado en **Accesos** y no aparece para jugadores normales. Incluye:
- **Permisos de partidas:** revisión, aprobación y rechazo de resultados.
- **Solicitudes:** aprobación/rechazo de registros de nuevos jugadores.
- **Jugadores:** cambio de nombre y visibilidad pública.
- **Auditoría:** registro de accesos administrativos y de jugadores.

### Centro de Desarrollo
Se mantiene y amplía para diagnóstico y mantenimiento, sin alterar la puntuación oficial:
- salud e integridad de datos;
- detección de posibles duplicados;
- exportación de backup JSON;
- exportación CSV de la tabla;
- reinicio controlado de las flechas de movimiento;
- recarga de aplicación;
- limpieza opcional de contraseñas legacy.

### Modo móvil / contador
- Se redujo el contenido innecesario de la tabla en pantallas pequeñas.
- El contador de marcador mantiene números grandes y legibles también cuando el navegador está configurado como **“sitio para computadoras”**.
- Los controles del anotador conservan tamaños táctiles y disposición adaptativa.

## Integridad y seguridad
- Firebase Authentication es la fuente de identidad para cuentas nuevas.
- Las nuevas contraseñas no se almacenan en Firestore.
- Las cargas de jugadores quedan vinculadas a UID, correo y nombre.
- Un jugador no puede marcar una partida como APROBADA desde el cliente.
- Las partidas rechazadas/anuladas pueden conservarse para auditoría en lugar de desaparecer.
- `firestore.rules` debe desplegarse junto con la aplicación; el HTML por sí solo no es una frontera de seguridad.

## Importante sobre la corrección de puntajes
La versión anterior de este proyecto aplicaba un filtro por `seasonNumber` a la lectura de partidas. Eso ocultaba partidos aprobados que la tabla original sí contaba y podía hacer que un jugador pasara, por ejemplo, de 49 a 29 puntos y que el H2H mostrara menos enfrentamientos.

Esta versión elimina ese filtro para el ranking/H2H/Salón de Fama. La app vuelve a leer las **partidas APROBADAS completas** como la versión original. El cambio es de lectura: no reescribe ni borra el historial existente.

## Migración y despliegue

1. Respaldar datos antes del despliegue.
2. Publicar `index.html`, `manifest.json`, `sw.js`, `_redirects` y los recursos locales.
3. Desplegar `firestore.rules` y `firestore.indexes.json` si la versión de Firebase utilizada los necesita.
4. Verificar el acceso de administrador en Firebase Authentication.
5. Comprobar primero la tabla oficial y luego H2H/Humillaciones.
6. Si las flechas deben empezar a calcularse desde cero, usar **Dev → Reiniciar flechas** una vez.

## Ideas futuras compatibles con el ranking oficial

- Confirmación del resultado por ambos jugadores.
- Alertas de partidas duplicadas o patrones anómalos para revisión del administrador.
- Ficha previa del rival con H2H, forma y últimos resultados.
- Logros, marcos y títulos por hitos competitivos.
- Mejor remontada, partida más cerrada y mayor diferencia.
- Historial de anulaciones/rechazos con motivo obligatorio.
- Cierre de temporada con backup y congelación de estadísticas.

