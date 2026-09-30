# Truco League — versión competitiva

## Qué cambia en esta entrega

### Tabla de posicions
- La tabla queda deliberadamente compacta y competitiva: **POS · JUGADOR · PTS · G/P · VENT. · WR**.
- **↑↓ fue eliminado** por no funcionar de forma confiable y para ahorrar espacio, especialmente en celular.
- **Forma** fue eliminada de la tabla. La secuencia de los últimos cinco partidos pasa a la ficha competitiva.
- En móvil se mantienen visibles **Ventaja** y **WR**, que antes se ocultaban.
- El nombre de cada jugador lleva un avatar pequeño, recortado en cuadrado y comprimido automáticamente.
- Una racha activa de 3 o más victorias se destaca de forma compacta junto al nombre.

### Ficha competitiva del jugador
Al tocar un jugador se abre una ficha separada, con la información más importante antes de los logros:
- posición, puntos, partidos jugados, victorias, derrotas y WR;
- ventaja acumulada;
- racha actual y mejor racha histórica;
- hitos visuales de 🔥 3, 🔥 5 y 🔥 10;
- últimos cinco resultados V/D;
- duelo de posición: jugador inmediatamente arriba y abajo;
- récords personales: victorias, ventaja acumulada, mayor goleada, partidos jugados, mejor racha y mejor partida;
- últimos cinco partidos con marcador;
- logros y acciones propias cuando corresponde.

### Partido de la fecha
Se selecciona automáticamente un enfrentamiento relevante ponderando posición de los participantes, cercanía del marcador y recencia. Se priorizan las partidas del día y, si no existen, el historial aprobado más reciente.

### H2H / Rivalidades
El H2H 1v1 ahora muestra:
- enfrentamientos totales;
- victorias de cada jugador;
- WR individual dentro de esa rivalidad;
- los últimos cinco enfrentamientos con el resultado de ambos jugadores.

Esto convierte el H2H en una sección de rivalidades, no solamente en dos números.

### Resumen semanal
La portada del ranking incorpora un bloque **RESUMEN · ÚLTIMOS 7 DÍAS** que genera noticias desde los datos disponibles: rachas, movimientos de posiciones, hitos de victorias y rivalidades que alcanzaron nuevos enfrentamientos. Cuando no hay novedades relevantes muestra:

> **La liga está tranquila. ¡Juega para generar noticias!**

### Centro de Desarrollo → Accesos
El panel administrativo concentra ahora:
- **Jugadores:** crear, renombrar, activar/desactivar, fusionar duplicados, ver UID, avatar y abrir historial.
- **Partidas:** pendientes y aprobadas, con acceso directo a revisión.
- **Auditoría:** fecha/hora, acción, usuario que cargó, jugadores involucrados, resultado y `matchId`.

Los cambios de nombre/fusión actualizan también las partidas existentes sin reescribir el historial completo de documentos.

## Avatares y peso de la aplicación
La solución no necesita un servidor propio para procesar imágenes:
- el navegador hace el recorte cuadrado;
- reduce la imagen a **96×96 px**;
- prueba WebP/JPEG y baja la calidad hasta entrar en un límite conservador de **22 KB**;
- la imagen optimizada se guarda en el documento del jugador de Firestore como `avatarData`.

El límite de entrada local es de 8 MB para evitar que el navegador intente procesar archivos enormes. El avatar final es mucho menor y el límite de reglas de Firestore evita que un cliente escriba una imagen fuera del tamaño previsto.

## Seguridad / anti-trampas
Las partidas cargadas por jugadores quedan vinculadas a identidad de Firebase y a un registro de auditoría. El log de `MATCH_SUBMISSION` conserva quién cargó, cuándo, jugadores y resultado, y las reglas comprueban que el registro apunta a la misma partida creada por ese usuario.

La aprobación/rechazo/anulación continúa siendo exclusiva del administrador. Las reglas siguen siendo la frontera real de seguridad; el HTML no debe considerarse una medida de seguridad por sí solo.

## Integridad del ranking
- Se conserva el modelo oficial existente de puntuación.
- El ranking/H2H/Salón de Fama usan el historial de partidas aprobadas que ya utilizaba la aplicación.
- No se borran automáticamente partidas históricas.

## Despliegue
Publicar los archivos de la carpeta junto con `firestore.rules`. Después del deploy, verificar:
1. tabla en móvil y escritorio;
2. apertura de ficha tocando un jugador;
3. H2H y últimos cinco enfrentamientos;
4. carga de una partida como jugador;
5. registro de auditoría en administrador;
6. avatar de prueba y recarga de página;
7. renombrar/fusionar jugador desde `Accesos`.

## Nota de hosting
Cloudflare puede servir los archivos estáticos; el avatar optimizado no se convierte en una imagen estática adicional del sitio, sino que queda dentro del perfil del jugador en Firestore. Esto reduce la cantidad de archivos del despliegue y evita depender de un backend de imágenes.
