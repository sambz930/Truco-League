# Informe técnico: auditoría de torneos EL ANCHO

## Resultado

Se corrigieron varios huecos operativos en el código cliente y en las reglas; la versión queda preparada para pasar a pruebas de staging, no para saltarse la prueba con Firebase real.

## Flujo esperado

1. Un jugador pulsa **REALIZAR TORNEO**. Su documento estable de solicitud evita crear solicitudes duplicadas al insistir desde dos pestañas.
2. El administrador aprueba la solicitud. La creación del torneo, la actualización del candado global y la aprobación se confirman en una transacción.
3. El organizador selecciona participantes registrados, fija 15 (predeterminado) o 30 puntos y confirma. Antes del sorteo puede volver atrás a editar.
4. El sorteo genera una llave de hasta 64 participantes con pases libres. Los participantes se asignan desde la primera ronda; las rondas futuras esperan sus dos fuentes.
5. En un cruce activo, cada jugador incrementa únicamente su marcador. La llegada al objetivo cierra el cruce automáticamente y propaga el ganador en una sola transacción.
6. Una transacción concurrente que intente anotar el mismo punto final vuelve a leer el estado. Si el cruce ya está cerrado, no suma otro punto ni vuelve a pagar el premio.
7. El ganador pasa al cruce siguiente; el perdedor vuelve a la interfaz común. El organizador puede registrar manualmente un ganador si no se usó el anotador.
8. La final marca el torneo como completo, guarda campeón y bonus. Se mantiene una pantalla breve de llaves para el campeón y se ofrece salida explícita a la app normal.

## Riesgos revisados y mitigaciones

| Riesgo | Tratamiento en esta versión | Límite restante |
|---|---|---|
| Punto final duplicado desde dos dispositivos | Transacción sobre el documento del cruce; condición de estado `PLAYING`; premio con ID determinista | Requiere verificarlo en Firebase Emulator/staging |
| Marcador sobrepasa objetivo | UI y reglas limitan el objetivo a 15/30 y no aceptan incrementos luego del cierre | Un administrador privilegiado conserva override por las reglas `admin()` |
| Doble torneo activo | Documento `torneos_control/active` y validación transaccional | En caso de datos históricos corruptos, puede requerirse recuperación manual del documento de control |
| Candado que apunta a torneo borrado | La actualización del candado admite recuperación solo si el documento anterior no existe o es terminal | Solo administrador puede efectuarla |
| Participantes duplicados por UI | Se deduplican y se valida la lista antes del sorteo; estructura se valida antes de persistir | No hay verificación global antitrampa en reglas para un organizador que manipule directamente Firestore |
| Pases libres/rondas impares | Propagación de BYE por ronda y simulación exhaustiva de tamaños 2–64 | Verificar también el render real con 3, 5, 17 y 63 jugadores en staging |
| Campeón atrapado al terminar | Kiosco del campeón visible solo si la final se completa en la sesión actual; botón de salida | No sustituye prueba visual en móvil real |
| PWA sirviendo HTML anterior | Se incrementa `CACHE_VERSION` | Confirmar versión luego de despliegue en una PWA instalada |
| Cambios de Firestore no desplegados | Documentación explícita de despliegue de `rules` e `indexes` | Desplegar ambos por Firebase CLI; subir HTML a Cloudflare no hace esto |

## Pruebas ejecutadas durante la preparación

- Validación de sintaxis de los bloques JavaScript/JSX extraídos del HTML.
- Validación JSON de `firebase.json` y `firestore.indexes.json`.
- Simulación modelo de 6.300 llaves (100 por cantidad, de 2 a 64 participantes).
- Test de guardarraíles estáticos y modelo de cierre a 15/30, bloqueo después del cierre e ID de premio único.

Los scripts auxiliares de construcción no se incluyen en el paquete publicado; estas pruebas verifican sintaxis y el modelo de lógica, no reemplazan una prueba integral en Firebase Emulator.

## Lo que NO se debe afirmar

No se ejecutó el Firebase Emulator ni se desplegó a un proyecto Firebase real. Firebase CLI no se pudo instalar por una falla de resolución de npm en el entorno y no se proporcionaron credenciales de Firebase. La sintaxis JavaScript/JSX y los JSON sí se validaron; la sintaxis/semántica de Firestore Rules debe confirmarse en el Emulator o proyecto de staging antes de publicar.
