# M06 — Comprobación de integración del navegador

Fecha: **10 de noviembre de 2026**, 00:02:01–00:02:14 UTC. [Registro saneado](browser-check.json).

Se abrió la PDP real de la aplicación en desarrollo, desde `http://127.0.0.1:5173`, en Chromium **158.0.8127.18**, con seguridad normal y un contexto nuevo sin caché ni contador. No se interceptó ni simuló la API. Se bloquearon únicamente las imágenes para aislar la lectura y evitar descargar fotos; no se introdujo un proveedor ni un activo alternativo.

La comprobación temporal añadió a los fetch de la API un AbortSignal de **12 segundos**, combinado con la señal original. Es una cota del diagnóstico, no un timeout instalado en el cliente de producción. No se cambiaron URL, credenciales (`omit`), payload, CORS ni la seguridad del navegador. No hubo reintentos automáticos ni se pulsó Reintentar.

Se registraron dos eventos GET al detalle `ZmGrkLRPXOTpxsU4jjAcv` durante el montaje de desarrollo con StrictMode. El efecto puede iniciar y cancelar la primera lectura; las causas exactas por evento no se capturaron. Ningún estado/cabecera HTTP ni JSON de respuesta quedó disponible para registrar. La aplicación terminó en su error de lectura seguro dentro de la espera acotada. No se atribuye el fallo a CORS, arranque en frío ni otra causa no demostrada.

**POST enviados: cero.** El plan permitía un único envío si el detalle respondía con opciones reales válidas; al fallar la lectura previa, no se envió ni repitió una mutación. No se sustituyeron las opciones actuales por muestras históricas para forzar una alta. No se afirma que el POST actual funcione ni que toda la API esté caída.

**B-01 permanece abierto y aceptado.** M01 sigue siendo la evidencia histórica del POST legible sin credenciales que devolvió `1`; sus muestras y metadatos no se han modificado. No hay nueva comparación de `include`, prueba de acumulación ni restauración de sesión. El contador local de M06 conserva solamente la última respuesta válida, no el carrito del servidor.

La suite automática es independiente: usa fetch/Playwright interceptados y muestras M01. Sus respuestas `5`, `1`, `1`, etc. prueban reemplazo/persistencia del contador, nunca acumulación real. Las capturas manuales de escritorio/móvil quedan fuera de Git y usan mocks explícitos/fallback de imagen. No se repite este diagnóstico durante tests ni para esperar al servicio.
