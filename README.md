# ITX Frontend Challenge

SPA React del reto frontend ITX para consultar dispositivos móviles y añadir opciones de producto mediante la API del enunciado. El desarrollo sigue Spec-Driven Development (SDD), con hitos pequeños y verificables.

## Estado actual

**M05 completado: catálogo y detalle de solo lectura. Las opciones de compra y el carrito siguen pendientes de M06.**

- `/`: catálogo completo obtenido mediante `getProducts()` de M03, con imagen, marca, modelo, precio y enlace al ID real de cada producto. Búsqueda local inmediata por marca/modelo, parcial y sin distinguir mayúsculas; limpiar restaura el listado.
- `/products/:id`: detalle real mediante `getProduct(id, { signal })`, con once atributos, imagen/fallback reutilizados, resumen de modelo/precio, enlace de vuelta explícito y breadcrumbs. Admite entrada directa y recarga local. Escritorio: imagen izquierda/información derecha; móvil: imagen antes de la descripción.
- Cabecera persistente, enlace al inicio, breadcrumbs, contador estático `0`, idioma español, enlace para saltar al contenido, foco y título actualizados al navegar.
- Las rutas desconocidas redirigen al listado mediante reemplazo de historial y muestran un aviso de página no encontrada. Se sigue el diseño aprobado, sin añadir una tercera vista de negocio ni simular un estado HTTP 404 del servidor.
- La PLP reutiliza la caché de una hora de M03. Distingue carga, API vacía, búsqueda sin coincidencias y error con reintento explícito. Precios vacíos muestran “Precio no disponible”; imágenes ausentes o fallidas tienen fallback accesible. No hay paginación, ordenación, selectores ni operaciones/persistencia de carrito.
- M00 y M01 conservan sus commits y las evidencias API del 9 de noviembre de 2026. B-01 sigue abierto como riesgo aceptado.
- Repositorio: [j0ssGZ/itx-fe-challenge](https://github.com/j0ssGZ/itx-fe-challenge). No hay PR ni despliegue. M06 requiere aprobación explícita.

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
  app/                     App, sus estilos y tests de navegación
  components/              Header, ProductCard/Image/Description y CSS Modules
  pages/                   catálogo y detalle funcional de solo lectura
  api/                     cliente HTTP y lecturas de productos, con tests
  storage/                 almacenamiento JSON y caché de productos, con tests
  styles/                  estilos globales y foco accesible
  test/                    configuración, aislamiento de fetch y fixtures M01
e2e/                       shell, catálogo, detalle/estados y fixtures en cuatro viewports
```

La PLP coordina petición/query y deriva resultados. La PDP coordina la lectura por ID; ProductDescription presenta los once atributos en `dl/dt/dd`. ProductImage conserva su variante de tarjeta y añade una de detalle con más espacio, sin cambiar el fallback. No hay hooks genéricos, nuevas librerías ni estado de opciones/carrito. API/caché M03 y manifiesto/lockfile permanecen intactos. Se elimina el CSS del placeholder, ya sin usos.

## Verificación realizada en M05

- `npm run lint`: código de salida 0, sin warnings de lint.
- `npm test`: **156 tests, 7 archivos, aprobados**: 25 añadidos en M05 y los 131 anteriores conservados. Las pruebas antiguas ahora navegan al contenido real, con las mismas verificaciones de historial, entrada directa y vuelta. Se cubren las cuatro muestras M01, los once atributos, arrays/texto, valores ausentes, fallos, retry, teclado, StrictMode, cambio de ID y respuestas tardías tanto correctas como fallidas.
- `npm run build`: código de salida 0; JS 270,49 kB (85,97 kB gzip) y CSS 6,86 kB (1,99 kB gzip), según Vite.
- `npm run test:e2e`: **36 tests aprobados**, nueve escenarios en Chromium a 320 × 800, 768 × 1024, 1280 × 800 y 1920 × 1080. Conservan los recorridos PLP/shell y añaden PDP directa/recarga/retorno por teclado, imagen izquierda o apilada, once atributos, ausencia de overflow, carga/500/retry, valores ausentes y datos inválidos. Los mocks permiten solo GET de listado/detalles conocidos; ningún carrito ni petición real.
- Vite de desarrollo arrancó correctamente. Se inspeccionaron capturas PDP locales a 320, 768, 1280 y 1920 px contra la estructura del PDF p.4, y estados de carga/error/valores ausentes en móvil. Capturas fuera de Git, con datos M01 y el fallback de imagen existente forzado; no se han creado fotos de producto ni cambiado de proveedor.
- `npm ls --depth=0`: dependencias resueltas, sin cambios de manifiesto/lockfile; no fue necesario repetir `npm ci`. La auditoría de cero vulnerabilidades citada arriba corresponde a M02, no a una nueva consulta de M05.

Vitest sustituye fetch por defecto y Playwright responde con las muestras M01, intercepta las imágenes y bloquea otros endpoints API. Las variaciones de fallo son fixtures sintéticas identificadas. M05 no ha vuelto a consultar listado/detalle/carrito ni fotos remotas: los ocho timeouts de imágenes configurados a 15 s pertenecen a M04 (9/11), no son evidencia nueva. En E2E se reutiliza la imagen sintética de test de M04; las capturas manuales muestran el fallback real. No se afirma disponibilidad actual del servicio ni se resuelve B-01.

## API y caché de productos (M03)

- `src/api/client.js`: `requestJson(path, { signal })` realiza un GET con `Accept: application/json` y `credentials: 'omit'`. Comprueba HTTP antes de leer JSON. No hay reintentos ni timeout automático; el llamador puede cancelar con AbortController.
- Los errores son instancias de `ApiError` con `name`, `type`, `status` (o `null`), mensaje español y causa técnica opcional. Los tipos son `http`, `network`, `invalid-json`, `aborted`, `invalid-response` e `invalid-argument`. Una cancelación es distinguible de un fallo; las páginas presentan mensajes seguros con reintento, sin mostrar texto crudo del servidor ni detalles técnicos.
- `src/api/products.js`: `getProducts({ signal })` y `getProduct(id, { signal })` leen los endpoints reales. Los IDs son cadenas no vacías y se preservan/escapan como un segmento URL; los segmentos `.`/`..` y el Unicode no codificable se rechazan como argumentos inseguros. El listado debe ser un array con IDs únicos; el detalle debe ser un objeto con el ID solicitado. Son validaciones mínimas del cliente, no garantías universales del servidor.
- Los campos opcionales de texto ausentes, vacíos, `-` o con tipo no soportado se devuelven como `null`. Un precio numérico inesperado tampoco se convierte: `"0"` sigue siendo válido y un precio vacío nunca pasa a cero. CPU/cámaras de texto o arrays de strings se normalizan a texto; se conservan las claves `dimentions`, `secondaryCmera` y ambos campos de pantalla. Las opciones utilizables conservan su código numérico finito y nombre no vacío; grupos ausentes o incorrectos son arrays vacíos y opciones incorrectas se descartan. No se crean códigos, unidades, moneda ni reglas de stock.
- `src/storage/productCache.js`: claves `itx:products:v1:<URL absoluta>` separan base API, listado y cada ID de detalle. La entrada `{ version: 1, fetchedAt, data }` guarda la respuesta recibida solo tras validarla; al leerla se vuelve a validar y normalizar. Los fixtures solo se importan en tests.
- TTL fijo de **3.600.000 ms** desde la recepción correcta del JSON. Una edad menor devuelve caché sin red; a una hora exacta o más, se elimina la entrada y la siguiente lectura hace GET. Leer no modifica `fetchedAt`. No hay timers, prefetch, expiración deslizante, ETags asumidos ni deduplicación de peticiones en curso.
- JSON corrupto, versión incompatible, identidad/datos inválidos y timestamps no enteros seguros, negativos o futuros producen un miss. Las claves de versiones anteriores no se reutilizan ni se borran globalmente. Una revalidación fallida o cancelada no guarda ni presenta datos caducados como frescos; la siguiente lectura vuelve a intentarlo deliberadamente.
- `src/storage/storage.js`: acceso JSON protegido a `localStorage`, con copia en memoria. Tras un fallo de acceso/lectura/escritura/eliminación, esa instancia utiliza solo memoria durante su vida; el TTL sigue igual. No promete persistencia al recargar: solo se recupera lo que haya logrado guardarse. La serialización impide que mutaciones de objetos devueltos alteren la caché. Nunca se llama a `localStorage.clear()` en producción ni se tocan claves ajenas.

La caché solo la invocan las dos lecturas de producto; la PLP conecta `getProducts({ signal })` mediante un efecto local que cancela al desmontar e ignora resultados obsoletos. Solo un reintento deliberado vuelve a pedir tras fallo; escribir en la búsqueda no solicita datos. No hay hooks genéricos, mutaciones ni persistencia de carrito.

## Detalle de producto (M05)

- `ProductDetailsPage` obtiene el ID de ruta como string y usa la lectura/cache M03. Un hijo local con `key={id}` reinicia el estado inmediatamente al cambiar de producto, sin mostrar datos de A durante la carga de B. El efecto cancela con AbortController al cambiar/desmontar; las callbacks ignoran cancelaciones y no hay reintentos automáticos. Reintentar inicia otra lectura y lleva el foco al enlace de retorno, que permanece disponible.
- `ProductDescription` conserva once etiquetas: marca/modelo/precio desde `brand`/`model`/`price`; CPU/RAM/sistema operativo desde `cpu`/`ram`/`os`; resolución desde **`displaySize`**; batería desde `battery`; cámaras principal y secundaria desde **`primaryCamera`/`secondaryCmera`**; dimensiones desde **`dimentions`** y peso desde `weight`. M03 convierte arrays de strings de CPU/cámaras en texto; la UI no imprime objetos ni arrays crudos. No usa las pulgadas de `displayResolution` como resolución ni añade moneda o unidad de peso.
- Especificaciones ausentes/vacías/`-` muestran “No disponible”, y el precio ausente “Precio no disponible”. Un detalle mínimo válido conserva todas las etiquetas. Si falla la identidad/estructura validada, se muestra “No podemos mostrar este producto”; red/HTTP/JSON usan un error de carga genérico. El 500 observado para un ID desconocido no se etiqueta como 404 ni como inexistencia confirmada.
- Hay anuncio de carga/finalización para lectores, alertas de error, navegación por teclado, foco visible, cabecera/breadcrumbs compartidos y enlace a `/` independiente del historial. El resumen no expone IDs opacos ni diagnósticos internos. No se muestran selectores, controles deshabilitados de compra ni botones de añadir en este hito.

## Decisión de librería UI

Se mantiene React + CSS Modules. [La evaluación de Astryx](docs/decisions/ui-library-evaluation.md) documenta compatibilidad, accesibilidad, personalización, dependencias y tamaño. Se conservó este stack en M05: el beneficio para estos controles nativos no compensa añadir tema, CSS compartido e integración beta. No se ha instalado ni autorizado Astryx.

## SDD y siguientes hitos

- [Requisitos](docs/specs/requirements.md): matriz R-01–R-29, fuentes y criterios de aceptación.
- [Diseño](docs/specs/design.md): responsabilidades, rutas, estado y estrategia de pruebas.
- [Tareas](docs/specs/tasks.md): hitos, dependencias, entregables y checkpoints.
- [Decisiones y riesgos](docs/specs/open-questions.md): acuerdos y B-01 abierto.
- [Evidencias M01](docs/evidence/m01/2026-11-09/README.md): observaciones HTTP/navegador, respuestas y metadatos fechados, sin valores de cookies.

M00 inicializó Git; M01 verificó contratos; M02 configuró herramientas/navegación; M03 implementó API/caché; M04 completó catálogo/búsqueda; M05 completó la lectura del detalle. El siguiente hito es **M06 — opciones, alta de carrito y contador persistido**, pendiente de autorización. Después: M07 revisión de recorridos/UX y M08 entrega reproducible. B-01 limita las afirmaciones de integración acumulativa, sin reabrir decisiones ya aprobadas.

Las decisiones aprobadas se mantienen: interfaz española; búsqueda parcial en tiempo real sin distinguir mayúsculas; singleton visible/preseleccionado y opciones múltiples inicialmente sin selección; caché de productos de una hora con revalidación; contador persistido de forma independiente y tomado de la respuesta API.

## Flujo permanente por hito

**Implementar → Test → Lint → Build → Revisar diff → Commit → Push → Verificar → STOP.** Ejecutar también el smoke E2E cuando aplique. Usar conventional commits, un incremento coherente por hito, conservar el historial y mantener la documentación sincronizada. Antes de commit/push, revisar archivos y secretos y comprobar que PDF, entornos locales y artefactos siguen excluidos. No publicar implementación con comprobaciones fallidas, no hacer force-push ni reescribir historia, y no iniciar otro hito sin aprobación.

Después de cada push o actualización de PR, comprobar CI una sola vez. Si hay checks pendientes/en ejecución, informar del estado, pedir al usuario que vuelva cuando terminen o fallen y detener la sesión; no hacer polling, watch ni agentes de espera. Las fusiones y despliegues nunca son automáticos. Este proyecto todavía no configura workflows de GitHub Actions; los resultados locales son los registrados arriba.

## API, B-01 y material original

El servicio del enunciado es `https://itx-frontend-test.onrender.com/`. M04/M05 conectan GET de listado/detalle a sus páginas; las pruebas utilizan mocks y no verifican de nuevo su disponibilidad en vivo. La verificación M01 está fechada y no garantiza su disponibilidad futura. **B-01 permanece abierto y aceptado:** la sesión/CORS limita la acumulación del carrito entre orígenes; no se ha introducido proxy, cambio de credenciales ni contador local compensatorio.

El PDF original sigue únicamente en el entorno local e ignorado por Git por falta de permiso de redistribución. Las referencias relativas de las especificaciones requieren esa copia local y no funcionan en un clon sin ella. No se han alterado las evidencias API ni distribuido el PDF.
