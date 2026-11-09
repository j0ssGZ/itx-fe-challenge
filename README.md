# ITX Frontend Challenge

SPA React del reto frontend ITX para consultar dispositivos móviles y añadir opciones de producto mediante la API del enunciado. El desarrollo sigue Spec-Driven Development (SDD), con hitos pequeños y verificables.

## Estado actual

**M03 completado: acceso a productos y caché de una hora probados de forma aislada. Las vistas siguen siendo placeholders de M02.**

- `/`: placeholder del listado, con enlace a un detalle de ejemplo.
- `/products/:id`: placeholder del detalle, con identificador de ruta y retorno explícito al listado.
- Cabecera persistente, enlace al inicio, breadcrumbs, contador estático `0`, idioma español, enlace para saltar al contenido, foco y título actualizados al navegar.
- Las rutas desconocidas redirigen al listado mediante reemplazo de historial y muestran un aviso de página no encontrada. Se sigue el diseño aprobado, sin añadir una tercera vista de negocio ni simular un estado HTTP 404 del servidor.
- Existen el cliente HTTP, las operaciones de lectura de productos y la caché, aún sin conectar a React. Abrir las páginas no hace solicitudes API. No hay renderizado de productos, búsqueda, selectores ni operaciones/persistencia de carrito.
- M00 y M01 conservan sus commits y las evidencias API del 9 de noviembre de 2026. B-01 sigue abierto como riesgo aceptado.
- Repositorio: [j0ssGZ/itx-fe-challenge](https://github.com/j0ssGZ/itx-fe-challenge). No hay PR ni despliegue. M04 requiere aprobación explícita.

## Requisitos e instalación

Entorno verificado: **Node 24.19.0 y npm 11.17.0**. `.nvmrc` fija la versión probada; `package.json` admite Node `>=24.15.0 <25` y npm `>=11 <12`, compatibles con las dependencias elegidas. Las versiones distintas de la probada dentro de esos rangos no han sido ejecutadas en esta entrega.

Desde la raíz del proyecto, con ese entorno disponible:

```sh
npm ci
npx playwright install chromium
```

`npm ci` utiliza el único lockfile versionado. Playwright descarga su Chromium de prueba fuera del repositorio; no se necesita un navegador global. En sistemas Linux, las bibliotecas del navegador pueden requerir `npx playwright install --with-deps chromium`; esta variante no se ha probado en este entorno macOS.

No hacen falta variables de entorno, credenciales ni acceso a la API para ejecutar el shell y sus pruebas. Las futuras lecturas reales necesitarán disponibilidad del servicio.

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
  components/              Header con breadcrumbs e indicador estático
  pages/                   placeholders PLP/PDP y estilos compartidos
  api/                     cliente HTTP y lecturas de productos, con tests
  storage/                 almacenamiento JSON y caché de productos, con tests
  styles/                  estilos globales y foco accesible
  test/                    configuración, aislamiento de fetch y fixtures M01
e2e/                       smoke del shell en dos tamaños de pantalla
```

Los módulos API/caché de M03 no se importan desde las páginas. El proveedor y la API de carrito siguen pendientes de M06. No se han añadido dependencias ni cambiado el lockfile en M03.

## Verificación realizada en M03

- `npm run lint`: código de salida 0, sin warnings de lint.
- `npm test`: **112 tests, 4 archivos, aprobados**: 109 nuevos de HTTP/productos/almacenamiento/caché y los 3 de navegación de M02 conservados. Se usan reloj simulado, fetch mockeado y las muestras reales de M01; las variaciones sintéticas de robustez están identificadas en los tests.
- `npm run build`: código de salida 0; compilación de producción generada correctamente.
- `npm run test:e2e`: **2 tests aprobados**, Chromium a 1280 × 800 y 390 × 844. Comprueban navegación cliente sin recargar el documento, historial, enlaces de retorno/inicio, entrada y recarga directa, fallback, ausencia de errores JS y de solicitudes API.
- M02 ya verificó el servidor de desarrollo, teclado, enlace de salto y layout a 320 px. Esa revisión visual es histórica; M03 no modifica la interfaz.
- `npm ls --depth=0`: dependencias resueltas, sin cambios de manifiesto/lockfile; no fue necesario repetir `npm ci`. La auditoría de cero vulnerabilidades citada arriba corresponde a M02, no a una nueva consulta de M03.

Las pruebas unitarias cubren M03 y las de navegador siguen cubriendo el shell de M02. Vitest sustituye fetch por defecto para impedir tráfico remoto accidental; cada test configura las respuestas necesarias. Los E2E bloquean solicitudes `/api/` y fallan si aparece alguna. No se ha hecho un nuevo sondeo remoto ni mutado el carrito; estos resultados no prueban disponibilidad o integración acumulativa real.

## API y caché de productos (M03)

- `src/api/client.js`: `requestJson(path, { signal })` realiza un GET con `Accept: application/json` y `credentials: 'omit'`. Comprueba HTTP antes de leer JSON. No hay reintentos ni timeout automático; el llamador puede cancelar con AbortController.
- Los errores son instancias de `ApiError` con `name`, `type`, `status` (o `null`), mensaje español y causa técnica opcional. Los tipos son `http`, `network`, `invalid-json`, `aborted`, `invalid-response` e `invalid-argument`. Una cancelación es distinguible de un fallo; las futuras páginas usarán el mensaje normalizado, sin mostrar texto crudo del servidor.
- `src/api/products.js`: `getProducts({ signal })` y `getProduct(id, { signal })` leen los endpoints reales. Los IDs son cadenas no vacías y se preservan/escapan como un segmento URL; los segmentos `.`/`..` y el Unicode no codificable se rechazan como argumentos inseguros. El listado debe ser un array con IDs únicos; el detalle debe ser un objeto con el ID solicitado. Son validaciones mínimas del cliente, no garantías universales del servidor.
- Los campos opcionales de texto ausentes, vacíos, `-` o con tipo no soportado se devuelven como `null`. Un precio numérico inesperado tampoco se convierte: `"0"` sigue siendo válido y un precio vacío nunca pasa a cero. CPU/cámaras de texto o arrays de strings se normalizan a texto; se conservan las claves `dimentions`, `secondaryCmera` y ambos campos de pantalla. Las opciones utilizables conservan su código numérico finito y nombre no vacío; grupos ausentes o incorrectos son arrays vacíos y opciones incorrectas se descartan. No se crean códigos, unidades, moneda ni reglas de stock.
- `src/storage/productCache.js`: claves `itx:products:v1:<URL absoluta>` separan base API, listado y cada ID de detalle. La entrada `{ version: 1, fetchedAt, data }` guarda la respuesta recibida solo tras validarla; al leerla se vuelve a validar y normalizar. Los fixtures solo se importan en tests.
- TTL fijo de **3.600.000 ms** desde la recepción correcta del JSON. Una edad menor devuelve caché sin red; a una hora exacta o más, se elimina la entrada y la siguiente lectura hace GET. Leer no modifica `fetchedAt`. No hay timers, prefetch, expiración deslizante, ETags asumidos ni deduplicación de peticiones en curso.
- JSON corrupto, versión incompatible, identidad/datos inválidos y timestamps no enteros seguros, negativos o futuros producen un miss. Las claves de versiones anteriores no se reutilizan ni se borran globalmente. Una revalidación fallida o cancelada no guarda ni presenta datos caducados como frescos; la siguiente lectura vuelve a intentarlo deliberadamente.
- `src/storage/storage.js`: acceso JSON protegido a `localStorage`, con copia en memoria. Tras un fallo de acceso/lectura/escritura/eliminación, esa instancia utiliza solo memoria durante su vida; el TTL sigue igual. No promete persistencia al recargar: solo se recupera lo que haya logrado guardarse. La serialización impide que mutaciones de objetos devueltos alteren la caché. Nunca se llama a `localStorage.clear()` en producción ni se tocan claves ajenas.

La caché solo la invocan las dos lecturas de producto. No existen cliente de mutación, contador persistido ni caché de carrito en M03. No se añaden hooks ni se conectan estos módulos al shell hasta el hito autorizado correspondiente.

## SDD y siguientes hitos

- [Requisitos](docs/specs/requirements.md): matriz R-01–R-29, fuentes y criterios de aceptación.
- [Diseño](docs/specs/design.md): responsabilidades, rutas, estado y estrategia de pruebas.
- [Tareas](docs/specs/tasks.md): hitos, dependencias, entregables y checkpoints.
- [Decisiones y riesgos](docs/specs/open-questions.md): acuerdos y B-01 abierto.
- [Evidencias M01](docs/evidence/m01/2026-11-09/README.md): observaciones HTTP/navegador, respuestas y metadatos fechados, sin valores de cookies.

M00 inicializó el repositorio; M01 verificó contratos; M02 configuró herramientas/navegación; M03 implementó el límite API y la caché cliente. El siguiente hito es **M04 — listado de productos, búsqueda y tarjetas adaptables**, pendiente de autorización. Después: M05 detalle, M06 acciones/carrito, M07 recorridos críticos y M08 entrega reproducible.

Las decisiones aprobadas se mantienen: interfaz española; búsqueda parcial en tiempo real sin distinguir mayúsculas; singleton visible/preseleccionado y opciones múltiples inicialmente sin selección; caché de productos de una hora con revalidación; contador persistido de forma independiente y tomado de la respuesta API.

## Flujo permanente por hito

**Implementar → Test → Lint → Build → Revisar diff → Commit → Push → Verificar → STOP.** Ejecutar también el smoke E2E cuando aplique. Usar conventional commits, un incremento coherente por hito, conservar el historial y mantener la documentación sincronizada. Antes de commit/push, revisar archivos y secretos y comprobar que PDF, entornos locales y artefactos siguen excluidos. No publicar implementación con comprobaciones fallidas, no hacer force-push ni reescribir historia, y no iniciar otro hito sin aprobación.

Después de cada push o actualización de PR, comprobar CI una sola vez. Si hay checks pendientes/en ejecución, informar del estado, pedir al usuario que vuelva cuando terminen o fallen y detener la sesión; no hacer polling, watch ni agentes de espera. Las fusiones y despliegues nunca son automáticos. Este proyecto todavía no configura workflows de GitHub Actions; los resultados locales son los registrados arriba.

## API, B-01 y material original

El servicio del enunciado es `https://itx-frontend-test.onrender.com/`. M03 incorpora su acceso GET, aún sin conectar a la interfaz; sus pruebas no lo llaman. La verificación M01 está fechada y no garantiza su disponibilidad futura. **B-01 permanece abierto y aceptado:** la sesión/CORS limita la acumulación del carrito entre orígenes; no se ha introducido proxy, cambio de credenciales ni contador local compensatorio.

El PDF original sigue únicamente en el entorno local e ignorado por Git por falta de permiso de redistribución. Las referencias relativas de las especificaciones requieren esa copia local y no funcionan en un clon sin ella. No se han alterado las evidencias API ni distribuido el PDF.
