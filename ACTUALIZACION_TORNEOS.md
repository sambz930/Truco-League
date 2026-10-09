# Truco League · Auditoría y actualización de torneos EL ANCHO (V2)

## Comportamiento acordado

- Los cruces se juegan a **15 puntos por defecto**. El organizador puede elegir 30 antes de confirmar participantes; el objetivo se congela al crear la llave y cada enfrentamiento conserva ese objetivo.
- Cada participante solo puede sumar puntos para su propio lado. Cuando uno alcanza el objetivo, el mismo commit cierra el enfrentamiento, registra ganador/perdedor, crea el premio determinista y avanza al siguiente cruce. No necesita que el organizador toque “cargar resultado”.
- El organizador/admin conserva una acción manual de respaldo para cerrar un partido si los participantes no anotaron en la app.
- Cada cruce ganado otorga 1 punto y el campeón recibe además un bonus equivalente al número de inscriptos. Los premios son documentos separados, con ID determinista, y se escriben en la misma transacción que cierra el cruce.
- Los participantes eliminados vuelven a la app común. El campeón puede ver las llaves en la sesión en que termina el torneo y dispone de “Volver a Truco League”.
- Se permiten entre 2 y 64 participantes. Las llaves cubren cantidades que no son potencia de dos con pases libres y propagación de ganadores.

## Correcciones de esta auditoría

- Se incorporó el cierre automático al alcanzar 15/30 puntos, incluido el avance inmediato y el fin automático de la final.
- Se añadió salida explícita de la vista de campeón y se mantiene al campeón en la llave solo durante la sesión donde finalizó el torneo.
- Se habilitó recuperar el candado de torneo si el documento del torneo anterior fue eliminado manualmente, sin permitir reemplazar un torneo todavía activo.
- Las reglas de puntaje validan ambos marcadores por debajo del objetivo antes de aceptar el punto; la transacción vuelve a leer el estado actualizado si hay clicks casi simultáneos.
- El sorteo usa Fisher–Yates con Web Crypto cuando está disponible; la estructura de la llave se verifica antes de guardarse.
- El service worker cambió a `truc-league-v9-torneo-auditoria` para invalidar el caché anterior de la PWA.
- Se mantiene intacta la lógica normal de Truco/Envido. El anotador de torneos es un flujo separado.

## Validación realizada

- `node /mnt/data/audit/validate_syntax.cjs`: analiza sintaxis de los scripts/JSX extraídos del HTML y no encontró errores.
- `node /mnt/data/audit/simulate_tournament.mjs`: 6.300 llaves simuladas para 2–64 participantes; comprueba presencia única de cada inscrito en la primera ronda, ausencia de cruces bloqueados tras propagar ganadores, final y cantidad de cruces jugados igual a `participantes - 1`.
- `node /mnt/data/audit/tournament_audit_test.mjs`: controles estáticos y modelo de cierre/anti doble premio para objetivos 15 y 30.
- `firestore.indexes.json` y `firebase.json`: JSON válido.

**Límite de la validación:** no se pudo instalar/ejecutar Firebase CLI ni levantar el emulador porque el entorno no tiene acceso al registro npm; tampoco hay credenciales del proyecto para probar contra Firebase real. Por lo tanto, las reglas Firestore no se presentan como compiladas ni como probadas en un entorno Firebase real. La prueba de llaves/puntaje es una simulación de modelo, no una prueba de integración de Firebase.

## Antes de publicar

1. Hacer copia de seguridad de `firestore.rules` y probar primero en un proyecto/staging de Firebase.
2. Desde la raíz de este proyecto, con Firebase CLI autenticado y el proyecto correcto seleccionado, desplegar las reglas e índices: `firebase deploy --only firestore:rules,firestore:indexes`.
3. Desplegar la nueva web y `sw.js` al hosting que uses. Si el hosting es Cloudflare, reemplazar los archivos publicados allí por los de este paquete; Cloudflare no despliega las reglas de Firestore por sí solo.
4. Probar con cuentas reales separadas (admin, organizador y dos participantes) un cruce a 15; después a 30; luego torneos de 3 y 5 jugadores (pases libres); y dos dispositivos anotando casi simultáneamente el punto final.
5. Confirmar en Firebase que cada cruce tiene un solo documento `torneo_puntos` de victoria, que el campeón tiene un solo bonus y que el ranking refleja los puntos de la temporada correcta.

## Límite de seguridad conocido

La aplicación web y las reglas validan los cambios ordinarios, transiciones de estado y liquidación atómica. Sin embargo, el sorteo global de hasta 63 documentos nace en el cliente. Firestore Rules no puede iterar de forma general por toda una llave para demostrar que un organizador malicioso no ha duplicado un participante entre documentos. Para protección anti-trampa frente a un organizador deliberadamente malicioso, el sorteo y la liquidación deberían trasladarse a una Cloud Function/backend con privilegios controlados. Esto no impide el flujo normal, pero debe tenerse presente si el torneo pasa a considerarse competitivo de alto riesgo.
