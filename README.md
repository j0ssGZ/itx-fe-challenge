# ITX Frontend Challenge

SPA React del reto frontend ITX para consultar dispositivos móviles y añadir opciones de producto mediante la API del enunciado. El desarrollo sigue Spec-Driven Development (SDD), con hitos pequeños y verificables.

## Estado actual

**M06 completado: catálogo, detalle, opciones y contador confirmado por API. La verificación frontend pasa; el POST actual en vivo no pudo comprobarse y B-01 sigue abierto.**

- `/`: catálogo completo obtenido mediante `getProducts()` de M03, con imagen, marca, modelo, precio y enlace al ID real de cada producto. Búsqueda local inmediata por marca/modelo, parcial y sin distinguir mayúsculas; limpiar restaura el listado.
- `/products/:id`: detalle real mediante `getProduct(id, { signal })`, con once atributos, imagen/fallback reutilizados, resumen de modelo/precio, enlace de vuelta explícito y breadcrumbs. Admite entrada directa y recarga local. Escritorio: imagen izquierda/información derecha; móvil: imagen antes de la descripción.
- Cabecera persistente, enlace al inicio, breadcrumbs, contador compartido/restaurado, idioma español, enlace para saltar al contenido, foco y título actualizados al navegar.
- Las rutas desconocidas redirigen al listado mediante reemplazo de historial y muestran un aviso de página no encontrada. Se sigue el diseño aprobado, sin añadir una tercera vista de negocio ni simular un estado HTTP 404 del servidor.
- La PLP reutiliza la caché de una hora de M03. Distingue carga, API vacía, búsqueda sin coincidencias y error con reintento explícito. Precios vacíos muestran “Precio no disponible”; imágenes ausentes o fallidas tienen fallback accesible. No hay paginación ni ordenación. Las opciones y el alta se integran únicamente en PDP.
- M00 y M01 conservan sus commits y las evidencias API del 9 de noviembre de 2026. B-01 sigue abierto como riesgo aceptado.
- Repositorio: [j0ssGZ/itx-fe-challenge](https://github.com/j0ssGZ/itx-fe-challenge). No hay PR ni despliegue. M07 requiere aprobación explícita.

## Requisitos e instalación

Entorno verificado: **Node 24.19.0 y npm 11.17.0**. `.nvmrc` fija la versión probada; `package.json` admite Node `>=24.15.0 <25` y npm `>=11 <12`, compatibles con las dependencias elegidas. Las versiones distintas de la probada dentro de esos rangos no han sido ejecutadas en esta entrega.

Desde la raíz del proyecto, con ese entorno disponible:

```sh
npm ci
npx playwright install chromium
```

`npm ci` utiliza el único lockfile versionado. Playwright descarga su Chromium de prueba fuera del repositorio; no se necesita un navegador global. En sistemas Linux, las bibliotecas del navegador pueden requerir `npx playwright install --with-deps chromium`; esta variante no se ha probado en este entorno macOS.

No hacen falta variables de entorno ni credenciales. El catálogo y el detalle en desarrollo/preview necesitan el servicio remoto cuando no dispone de caché fresca. Los tests interceptan las peticiones y funcionan sin acceder a la API real.

## Desarrollo y validación

- `npm run start`: inicia Vite; URL predeterminada `http://localhost:5173`. Consultar el puerto que informe Vite si está ocupado.
- `npm test`: ejecuta una vez los tests de Vitest/React Testing Library y termina.
- `npm run test:watch`: modo interactivo de Vitest.
- `npm run lint`: ESLint; los warnings hacen fallar el comando.
- `npm run build`: compila la SPA en `dist/`.
- `npm run preview`: sirve el build localmente; URL predeterminada `http://localhost:4173`.
- `npm run test:e2e`: ejecuta Playwright contra el build de producción. **Ejecutar primero `npm run build`.** Playwright inicia y detiene su propio preview en `127.0.0.1:4173`; ese puerto debe estar libre.

Secuencia de comprobación local:

```sh
npm test
npm run lint
npm run build
npm run test:e2e
```

El build contiene recursos estáticos. Un alojamiento futuro debe devolver `index.html` para rutas frontend como `/products/ejemplo`; la recarga directa se ha verificado con el preview local, no con un despliegue público. Preview no es un servidor de producción.

## Stack instalado

Versiones directas fijadas, sin TypeScript en el código/configuración del proyecto:

- React / React DOM **19.3.1**; React Router **8.5.1**, en modo declarativo.
- Vite **8.3.7**; plugin React **6.3.0**; CSS Modules y estilos globales nativos.
- Vitest **5.1.0**; React Testing Library **16.3.3**; jsdom **31.0.0**.
- DOM Testing Library **10.4.2**, user-event **14.6.8**, jest-dom **7.0.1**.
- Playwright Test **1.65.0**, Chromium **158.0.8127.18** para el smoke.
- ESLint / @eslint/js **9.39.5**, React Hooks **7.1.1**, JSX accessibility **6.10.2**, globals **17.14.0**.

ESLint 9 se mantiene para respetar el peer range de `eslint-plugin-jsx-a11y` 6.10.2, que no admite ESLint 10. npm marca esta versión de ESLint como deprecada/sin soporte: es una limitación de mantenimiento documentada, no una garantía de soporte futuro. No se han forzado peers ni ignorado incompatibilidades. Una actualización compatible del conjunto podrá evaluarse en un hito aprobado. `npm audit` informó de cero vulnerabilidades durante la verificación de M02; no es una garantía permanente.

## Estructura actual

```text
src/
  main.jsx                 montaje React y BrowserRouter
  app/                     App, CartProvider y tests de navegación
  components/              Header, ProductCard/Image/Description/Actions y CSS Modules
  pages/                   catálogo y detalle funcional con opciones
  api/                     cliente HTTP, lecturas de productos y POST carrito, con tests
  storage/                 almacenamiento JSON, caché y contador independiente, con tests
  styles/                  estilos globales y foco accesible
  test/                    configuración, aislamiento de fetch y fixtures M01
e2e/                       shell, catálogo, detalle/carrito y fixtures en cuatro viewports
```

La PLP coordina petición/query y deriva resultados. La PDP coordina la lectura por ID; ProductDescription presenta los once atributos en `dl/dt/dd`. ProductImage conserva su variante de tarjeta y añade una de detalle con más espacio, sin cambiar el fallback. ProductActions coordina opciones y envío; CartProvider comparte solo el contador confirmado. No hay hooks genéricos ni nuevas librerías. Se amplía el cliente HTTP para POST; la caché/normalización M03, el manifiesto y el lockfile permanecen intactos. Se elimina el CSS del placeholder, ya sin usos.

## Verificación realizada en M06

- `npm run lint`: código de salida 0, sin warnings de lint.
- `npm test`: **220 tests, 10 archivos, aprobados**: 64 añadidos en M06 (API, almacenamiento y opciones/integración), con los 156 anteriores conservados. Los checks M05 de ausencia de acciones se adaptan a los controles ahora autorizados; se mantienen los atributos, navegación y cancelación. Se cubren defaults, códigos numéricos/0, validación, doble envío, errores/JSON/count, respuestas repetidas `1`, reemplazo, rutas/recarga, corrupción/denegación/cuota y TTL independiente.
- `npm run build`: código de salida 0; JS 273,87 kB (87,00 kB gzip) y CSS 8,13 kB (2,24 kB gzip), según Vite.
- `npm run test:e2e`: **52 tests aprobados**, 13 escenarios en Chromium a 320 × 800, 768 × 1024, 1280 × 800 y 1920 × 1080. Los 36 casos anteriores se conservan y se añaden 16 de carrito: teclado, payload, pendiente/doble clic, contador entre rutas/recarga, respuestas repetidas, fallo con selección conservada, reset de producto y opciones inválidas. Las respuestas acumulativas simuladas no prueban acumulación del servidor.
- Vite de desarrollo arrancó correctamente. Se inspeccionaron capturas a 320 y 1280 px, incluidas confirmación y error, contra la estructura del PDF p.4: acciones debajo de descripción, foco/controles visibles, sin overflow ni errores JS. Capturas fuera de Git, con mocks M01 y fallback de imagen; no se inventan fotos de producto. La suite comprueba también 768 y 1920 px.
- `npm ls --depth=0`: dependencias resueltas, sin cambios de manifiesto/lockfile; no fue necesario repetir `npm ci`. La auditoría de cero vulnerabilidades citada arriba corresponde a M02, no a una nueva consulta de M06.

Vitest sustituye fetch por defecto y Playwright intercepta API e imágenes; las variaciones de error/opciones son casos sintéticos identificados. Los tests no mutan la API real. La comprobación manual separada de M06 no recibió respuesta HTTP del detalle en la espera acotada, por lo que **no envió ningún POST**: véase [evidencia de navegador](docs/evidence/m06/2026-11-10/README.md). M01 conserva la evidencia histórica del POST `count: 1`; no se presenta como una verificación actual. Los ocho timeouts de fotos son históricos de M04. B-01 continúa abierto.

## API y caché de productos (M03)

- `src/api/client.js`: `requestJson(path, { signal })` realiza GET por defecto y acepta `method`/`body` para el POST, con `Accept: application/json` y Content-Type JSON cuando hay body y `credentials: 'omit'`. Comprueba HTTP antes de leer JSON. No hay reintentos ni timeout automático; el llamador puede cancelar con AbortController.
- Los errores son instancias de `ApiError` con `name`, `type`, `status` (o `null`), mensaje español y causa técnica opcional. Los tipos son `http`, `network`, `invalid-json`, `aborted`, `invalid-response` e `invalid-argument`. Una cancelación es distinguible de un fallo; las páginas presentan mensajes seguros con reintento, sin mostrar texto crudo del servidor ni detalles técnicos.
- `src/api/products.js`: `getProducts({ signal })` y `getProduct(id, { signal })` leen los endpoints reales. Los IDs son cadenas no vacías y se preservan/escapan como un segmento URL; los segmentos `.`/`..` y el Unicode no codificable se rechazan como argumentos inseguros. El listado debe ser un array con IDs únicos; el detalle debe ser un objeto con el ID solicitado. Son validaciones mínimas del cliente, no garantías universales del servidor.
- Los campos opcionales de texto ausentes, vacíos, `-` o con tipo no soportado se devuelven como `null`. Un precio numérico inesperado tampoco se convierte: `"0"` sigue siendo válido y un precio vacío nunca pasa a cero. CPU/cámaras de texto o arrays de strings se normalizan a texto; se conservan las claves `dimentions`, `secondaryCmera` y ambos campos de pantalla. Las opciones utilizables conservan su código numérico finito y nombre no vacío; grupos ausentes o incorrectos son arrays vacíos y opciones incorrectas se descartan. No se crean códigos, unidades, moneda ni reglas de stock.
- `src/storage/productCache.js`: claves `itx:products:v1:<URL absoluta>` separan base API, listado y cada ID de detalle. La entrada `{ version: 1, fetchedAt, data }` guarda la respuesta recibida solo tras validarla; al leerla se vuelve a validar y normalizar. Los fixtures solo se importan en tests.
- TTL fijo de **3.600.000 ms** desde la recepción correcta del JSON. Una edad menor devuelve caché sin red; a una hora exacta o más, se elimina la entrada y la siguiente lectura hace GET. Leer no modifica `fetchedAt`. No hay timers, prefetch, expiración deslizante, ETags asumidos ni deduplicación de peticiones en curso.
- JSON corrupto, versión incompatible, identidad/datos inválidos y timestamps no enteros seguros, negativos o futuros producen un miss. Las claves de versiones anteriores no se reutilizan ni se borran globalmente. Una revalidación fallida o cancelada no guarda ni presenta datos caducados como frescos; la siguiente lectura vuelve a intentarlo deliberadamente.
- `src/storage/storage.js`: acceso JSON protegido a `localStorage`, con copia en memoria. Tras un fallo de acceso/lectura/escritura/eliminación, esa instancia utiliza solo memoria durante su vida; el TTL sigue igual. No promete persistencia al recargar: solo se recupera lo que haya logrado guardarse. La serialización impide que mutaciones de objetos devueltos alteren la caché. Nunca se llama a `localStorage.clear()` en producción ni se tocan claves ajenas.

La caché solo la invocan las dos lecturas de producto; la PLP conecta `getProducts({ signal })` mediante un efecto local que cancela al desmontar e ignora resultados obsoletos. Solo un reintento deliberado vuelve a pedir tras fallo; escribir en la búsqueda no solicita datos. La mutación no usa esta caché: el contador se persiste por separado, sin TTL.

## Detalle de producto (M05)

- `ProductDetailsPage` obtiene el ID de ruta como string y usa la lectura/cache M03. Un hijo local con `key={id}` reinicia el estado inmediatamente al cambiar de producto, sin mostrar datos de A durante la carga de B. El efecto cancela con AbortController al cambiar/desmontar; las callbacks ignoran cancelaciones y no hay reintentos automáticos. Reintentar inicia otra lectura y lleva el foco al enlace de retorno, que permanece disponible.
- `ProductDescription` conserva once etiquetas: marca/modelo/precio desde `brand`/`model`/`price`; CPU/RAM/sistema operativo desde `cpu`/`ram`/`os`; resolución desde **`displaySize`**; batería desde `battery`; cámaras principal y secundaria desde **`primaryCamera`/`secondaryCmera`**; dimensiones desde **`dimentions`** y peso desde `weight`. M03 convierte arrays de strings de CPU/cámaras en texto; la UI no imprime objetos ni arrays crudos. No usa las pulgadas de `displayResolution` como resolución ni añade moneda o unidad de peso.
- Especificaciones ausentes/vacías/`-` muestran “No disponible”, y el precio ausente “Precio no disponible”. Un detalle mínimo válido conserva todas las etiquetas. Si falla la identidad/estructura validada, se muestra “No podemos mostrar este producto”; red/HTTP/JSON usan un error de carga genérico. El 500 observado para un ID desconocido no se etiqueta como 404 ni como inexistencia confirmada.
- Hay anuncio de carga/finalización para lectores, alertas de error, navegación por teclado, foco visible, cabecera/breadcrumbs compartidos y enlace a `/` independiente del historial. El resumen no expone IDs opacos ni diagnósticos internos. M06 añade ProductActions debajo de esta descripción sin alterar las lecturas/cancelación.

## Opciones y carrito (M06)

- `ProductActions` muestra radios nativos en fieldsets Color/Almacenamiento con nombres de `options.colors`/`options.storages`. Un singleton permanece visible/preseleccionado; un grupo múltiple empieza sin selección. Solo se aceptan códigos que pertenecen al producto. Los callbacks conservan números, incluido `0`; el ID se mantiene como string. Al cambiar de producto se reinician selección y feedback.
- `Añadir` permanece deshabilitado si faltan selecciones válidas o durante el envío. Grupos ausentes/inválidos muestran una explicación; no se inventan opciones ni reglas de stock por precio vacío. Se deshabilitan también radios mientras se envía y una ref impide eventos duplicados antes del render.
- `addToCart({ id, colorCode, storageCode })` envía **solo** esos tres campos como JSON a `POST https://itx-frontend-test.onrender.com/api/cart`, con `credentials: 'omit'`. Valida string no vacío, códigos numéricos finitos y respuesta con `count` entero seguro no negativo. Reutiliza errores HTTP/red/JSON; sin caché, actualizaciones optimistas ni reintentos automáticos.
- `CartProvider` comparte `count`/`confirmCount` entre Header/PDP. Cada respuesta válida reemplaza el valor anterior: `5 → 1 → 1` termina en `1`. Fallos/JSON/count inválidos conservan contador y selección, con feedback accesible. Un error de red puede ocultar una operación ya recibida por el servidor: se indica que no se ha confirmado, y no se repite automáticamente.
- `storage/cartCount.js` guarda `{ version: 1, count }` bajo `itx:cart-count:v1`, sin timestamp ni TTL. Reutiliza el almacenamiento JSON protegido; corrupción/versión/count inválidos se descartan y el Header muestra `0` si no hay confirmación válida. La expiración de productos no toca esta clave.
- Si localStorage falla, la confirmación permanece en memoria durante la vida del provider. La recarga solo recupera lo que logró persistirse; puede perderse el valor nuevo o restaurarse uno anterior si falló la escritura. Un fallo de storage no convierte una respuesta API correcta en un error de alta. No hay sincronización entre pestañas ni endpoint de lectura de carrito inventado.
- Navegar no cancela ni reenvía un POST que puede haber llegado al servidor. Si confirma tras abandonar PDP, se actualiza el contador compartido; el feedback de la página desmontada se ignora. Los bloqueos de duplicados se aplican a la operación pendiente del formulario.
- La persistencia restaura **el último contador confirmado**, no la sesión ni los artículos remotos. Con B-01 el servicio puede volver a devolver `1`; la interfaz lo respeta y no fabrica totales acumulados. No hay proxy, backend, lectura de cookies ni cambio de credenciales.

## Decisión de librería UI

Se mantiene React + CSS Modules. [La evaluación de Astryx](docs/decisions/ui-library-evaluation.md) documenta compatibilidad, accesibilidad, personalización, dependencias y tamaño. Se conservó este stack en M05: el beneficio para estos controles nativos no compensa añadir tema, CSS compartido e integración beta. No se ha instalado ni autorizado Astryx.

## SDD y siguientes hitos

- [Requisitos](docs/specs/requirements.md): matriz R-01–R-29, fuentes y criterios de aceptación.
- [Diseño](docs/specs/design.md): responsabilidades, rutas, estado y estrategia de pruebas.
- [Tareas](docs/specs/tasks.md): hitos, dependencias, entregables y checkpoints.
- [Decisiones y riesgos](docs/specs/open-questions.md): acuerdos y B-01 abierto.
- [Evidencias M01](docs/evidence/m01/2026-11-09/README.md): observaciones HTTP/navegador, respuestas y metadatos fechados, sin valores de cookies.

M00 inicializó Git; M01 verificó contratos; M02 configuró herramientas/navegación; M03 implementó API/caché; M04 completó catálogo/búsqueda; M05 completó la lectura del detalle y M06 incorpora opciones/alta/contador. El siguiente hito es **M07 — revisión de recorridos, UX y accesibilidad**, pendiente de autorización. Después: M08 entrega reproducible. B-01 limita las afirmaciones de integración acumulativa, sin reabrir decisiones ya aprobadas.

Las decisiones aprobadas se mantienen: interfaz española; búsqueda parcial en tiempo real sin distinguir mayúsculas; singleton visible/preseleccionado y opciones múltiples inicialmente sin selección; caché de productos de una hora con revalidación; contador persistido de forma independiente y tomado de la respuesta API.

## Flujo permanente por hito

**Implementar → Test → Lint → Build → Revisar diff → Commit → Push → Verificar → STOP.** Ejecutar también el smoke E2E cuando aplique. Usar conventional commits, un incremento coherente por hito, conservar el historial y mantener la documentación sincronizada. Antes de commit/push, revisar archivos y secretos y comprobar que PDF, entornos locales y artefactos siguen excluidos. No publicar implementación con comprobaciones fallidas, no hacer force-push ni reescribir historia, y no iniciar otro hito sin aprobación.

Después de cada push o actualización de PR, comprobar CI una sola vez. Si hay checks pendientes/en ejecución, informar del estado, pedir al usuario que vuelva cuando terminen o fallen y detener la sesión; no hacer polling, watch ni agentes de espera. Las fusiones y despliegues nunca son automáticos. Este proyecto todavía no configura workflows de GitHub Actions; los resultados locales son los registrados arriba.

## API, B-01 y material original

El servicio del enunciado es `https://itx-frontend-test.onrender.com/`. M04/M05 conectan GET de listado/detalle y M06 el POST. Las pruebas utilizan mocks; la lectura previa del diagnóstico manual M06 no respondió dentro de la espera acotada y no permitió verificar el POST actual. La verificación M01 está fechada y no garantiza su disponibilidad futura. **B-01 permanece abierto y aceptado:** la sesión/CORS limita la acumulación del carrito entre orígenes; no se ha introducido proxy, cambio de credenciales ni contador local compensatorio.

El PDF original sigue únicamente en el entorno local e ignorado por Git por falta de permiso de redistribución. Las referencias relativas de las especificaciones requieren esa copia local y no funcionan en un clon sin ella. No se han alterado las evidencias API ni distribuido el PDF.
