# M01 — Evidencias de contratos e integración

Fecha de ejecución: **9 de noviembre de 2026**. Base: `https://itx-frontend-test.onrender.com`.

Este directorio conserva observaciones de la API y muestras de datos, sin implementar la aplicación ni configurar herramientas de M02. No contiene valores de cookies, credenciales, rutas personales ni perfiles del navegador.

## Artefactos y procedencia

- [verification.json](verification.json): solicitudes, horas UTC, límites, duración de curl, estados HTTP, cabeceras seleccionadas, atributos de cookies con valores eliminados, diagnósticos de Chrome, estadísticas y límites de lo demostrado.
- [responses.json](responses.json): listado completo de 100 elementos, cuatro respuestas de detalle, respuesta de error, petición/respuesta del único POST y cuerpo del preflight. Es un contenedor de evidencias; sus claves superiores **no son un envelope de la API**. El listado real es un array y cada GET de detalle devuelve un objeto.

Las respuestas JSON se conservaron sin corregir claves, unidades, tipos ni valores vacíos. El índice de detalles agrupa cuatro respuestas independientes; no es un nuevo endpoint. El PDF solo se identifica por nombre y SHA-256, sin redistribuirlo. Las cabeceras son una selección explícita, no una captura completa.

Cada respuesta capturada por curl referencia su valor dentro de `responses.json` y su SHA-256 canónico. Para comprobarlo, resolver la referencia, serializar el valor con claves ordenadas y separadores `,`/`:` sin espacios, conservar Unicode (`ensure_ascii=False`), codificar en UTF-8 y calcular SHA-256. La misma regla se aplica a la respuesta del carrito. Es una comprobación de integridad de los datos registrados, no una garantía de que futuras respuestas sean idénticas.

## Solicitudes realizadas y límites

Se efectuaron nueve operaciones con curl: dos GET del listado, cuatro GET de detalles representativos, un GET de ID inexistente, un GET reutilizando una cookie de sesión y un OPTIONS del carrito. Los tres detalles posteriores al primero se seleccionaron del listado fresco para cubrir varios colores, campos vacíos y CPU en array. El primer detalle partió de un ID histórico y su presencia quedó confirmada en el listado de esta ejecución.

El límite de conexión fue de 10 segundos. El primer GET del listado tuvo un límite total de 45 segundos; el único segundo intento, de 60 segundos. El primer detalle y OPTIONS tuvieron 45 segundos; las demás lecturas, 30 segundos. No hubo bucles de espera, reintentos automáticos ni nuevas pruebas tras completar esta cobertura.

Chrome **157.0.8103.38**, ya instalado y con seguridad web normal, ejecutó dos lecturas y **un único POST deliberado**, desde páginas de diagnóstico locales temporales. Cada fetch tuvo un límite de 12 segundos; los procesos se limitaron a 45 y 35 segundos. No se repitió el POST ni se probó otro POST con credenciales. El navegador puede ejecutar su preflight automáticamente; no está contado como otro fetch deliberado de JavaScript.

El diagnóstico usó tiempo virtual de Chrome. Sus `elapsedMs` **no son medidas de latencia real de la API**; tampoco la duración total del proceso aísla la petición. Las duraciones de curl sí son tiempos de pared por operación. No se ha realizado un benchmark ni establecido un SLA.

## Resultados actuales

- Primer GET del listado: timeout de **45,007 s**, cero bytes y ningún estado HTTP recibido (`httpStatus: null`; el `000` de curl no es un estado de la API).
- Segundo GET: **HTTP 200**, aproximadamente **0,243 s**, 100 productos con IDs únicos; cinco campos de texto por registro y seis precios vacíos.
- Cuatro detalles: **HTTP 200**, aproximadamente **0,112–0,227 s**. Los campos necesarios para las etiquetas exigidas están presentes en estas cuatro muestras, pero algunos valores están vacíos. No se garantiza el esquema de todos los detalles a partir de ellas.
- ID intencionadamente inexistente: **HTTP 500**, `{"message":"An Unexpected Error Occurred","code":0}`. No debe convertirse en un supuesto contrato de 404 ni generalizarse a todos los errores.
- OPTIONS del carrito: **HTTP 200**, cuerpo `POST`, `Allow: POST`; no aparece `Access-Control-Allow-Methods` en las cabeceras capturadas. Esto no impidió el POST JSON sin credenciales en Chrome.
- POST desde Chrome sin credenciales: **HTTP 200**, `{"count":1}`. Se enviaron un ID real de texto y códigos numéricos obtenidos del detalle, sin calcularlos a partir de nombres.

Los valores confirman `dimentions` y `secondaryCmera`, CPU/cámaras de tipo texto o array, `displaySize` con píxeles y `displayResolution` con pulgadas. Hay precio, batería y peso vacíos, además de dimensiones `-`. No se recibió moneda ni unidad de peso. Las opciones con códigos están en `options.colors`/`options.storages`; `colors` e `internalMemory` superiores solo contienen etiquetas.

La causa del primer timeout no está demostrada. Un arranque en frío, un problema de red o cualquier otra causa sería una hipótesis; la posterior respuesta rápida no identifica el motivo ni garantiza disponibilidad futura.

## B-01 — Hechos, límites e interpretación

En las respuestas curl de GET/OPTIONS aparece la cookie `session_id` con `Path=/` y `HttpOnly`; no aparecen atributos `SameSite` o `Secure`. Sus valores se eliminaron. Un GET de detalle que envió manualmente la cookie del listado obtuvo HTTP 200 sin un nuevo `Set-Cookie`. Eso acredita la operación realizada, **no demuestra estado persistente del carrito ni duración de la sesión**.

Las cabeceras GET/OPTIONS capturadas contienen `Access-Control-Allow-Origin: *` y no `Access-Control-Allow-Credentials`. En Chrome, desde `http://localhost:49788`, el GET con `credentials: 'omit'` fue legible (HTTP 200); el mismo recurso con `credentials: 'include'` produjo `TypeError: Failed to fetch`, sin estado HTTP legible para JavaScript. El único POST, desde `http://localhost:49823`, usó `omit` y devolvió `1`. Las cabeceras completas del POST no se capturaron: JavaScript solo registró su Content-Type expuesto.

La combinación es coherente con las [reglas de Fetch para CORS con credenciales](https://fetch.spec.whatwg.org/#cors-protocol-and-credentials). Activar `include` no anula CORS ni las restricciones de cookies entre sitios; véanse [Request.credentials](https://developer.mozilla.org/en-US/docs/Web/API/Request/credentials) y [Set-Cookie](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Set-Cookie). `HttpOnly` impide leer la cookie con JavaScript, pero por sí solo no impide que el navegador la envíe cuando la política lo permite. Un error de fetch no prueba que el servidor no recibiera la solicitud.

**B-01 sigue abierto y aceptado como riesgo para continuar con herramientas y trabajo local tras autorización.** No se ha añadido proxy, sesión cliente alternativa ni incremento local. No se ha repetido la acumulación mediante varias altas: el resultado `count: 2` al reutilizar cookie pertenece exclusivamente al registro histórico del **6/11/2026** en las especificaciones, cuyas trazas temporales originales no están disponibles. No se presenta como evidencia fresca.

## Campos exigidos frente a contrato observado

El PDF exige etiquetas/contenido de presentación y tres nombres de campo para la petición del carrito. No proporciona un esquema completo de producto ni garantías generales sobre nulabilidad, tipos o códigos de error. Los cinco campos del listado están presentes en los 100 registros; las claves de detalle necesarias están presentes en las cuatro muestras, sin que ello convierta sus valores en siempre disponibles.

Para una alta segura hacen falta el ID real y códigos de las opciones del producto. Un precio vacío no debe convertirse en cero ni en una regla de stock inexistente. Las claves de especificaciones opcionales adicionales no obligan a añadir más interfaz. La normalización y las futuras validaciones se limitarán al comportamiento necesario, siguiendo [R-07 y R-13–R-21](../../../specs/requirements.md).

## Reproducción acotada

Ejemplo de lectura, sin guardar cookies ni mutar el carrito:

```sh
curl --silent --show-error --connect-timeout 10 --max-time 45 \
  --header 'Accept: application/json' \
  --header 'Origin: http://localhost:5173' \
  --write-out '\nHTTP %{http_code}; total %{time_total}s\n' \
  'https://itx-frontend-test.onrender.com/api/product'
```

Para detalles, utilizar un ID obtenido del listado; los IDs y opciones de las muestras son observaciones fechadas, no constantes de implementación. Los metadatos contienen el método, path y cabeceras de cada operación. Un OPTIONS puede reproducir el preflight sin añadir productos, enviando `Origin`, `Access-Control-Request-Method: POST` y `Access-Control-Request-Headers: content-type`.

La comparación `omit`/`include` debe hacerse desde un origen local en un navegador con seguridad normal; un encabezado Origin enviado por curl no aplica las restricciones del navegador. Mantener límites de espera. No repetir altas para reproducir estadísticas ni añadir un POST a una comprobación rutinaria: esta ejecución ya conserva una respuesta válida, y la acumulación queda fuera de lo recién demostrado.

## Cierre del hito

M01 entrega verificación fechada, respuestas representativas reutilizables y trazabilidad, sin código de producción, dependencias ni infraestructura de tests. Las muestras son datos documentales; su incorporación como fixtures de tests se hará cuando exista el entorno correspondiente.

**M02 puede proponerse para aprobación**, limitado a herramientas, estructura y rutas previstas. B-01 no bloquea ese alcance; sigue impidiendo afirmar una integración acumulativa completa. La disponibilidad intermitente, los valores ausentes y la cobertura parcial de esquemas quedan documentados. No se ha ejecutado M02 ni se afirma que existan pruebas de aplicación aprobadas.
