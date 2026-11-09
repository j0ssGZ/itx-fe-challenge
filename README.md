# ITX Frontend Challenge

SPA React del reto frontend ITX para consultar dispositivos móviles y añadir opciones de producto mediante la API del enunciado. El desarrollo sigue Spec-Driven Development (SDD), con hitos pequeños y verificables.

## Estado actual

**M02 completado: shell React, rutas y herramientas de calidad. Las vistas contienen placeholders.**

- `/`: placeholder del listado, con enlace a un detalle de ejemplo.
- `/products/:id`: placeholder del detalle, con identificador de ruta y retorno explícito al listado.
- Cabecera persistente, enlace al inicio, breadcrumbs, contador estático `0`, idioma español, enlace para saltar al contenido, foco y título actualizados al navegar.
- Las rutas desconocidas redirigen al listado mediante reemplazo de historial y muestran un aviso de página no encontrada. Se sigue el diseño aprobado, sin añadir una tercera vista de negocio ni simular un estado HTTP 404 del servidor.
- No hay llamadas a la API, productos reales, búsqueda, caché, selectores ni operaciones/persistencia de carrito. El estado compartido del carrito se incorporará en su hito correspondiente.
- M00 y M01 conservan sus commits y las evidencias API del 9 de noviembre de 2026. B-01 sigue abierto como riesgo aceptado.
- Repositorio: [j0ssGZ/itx-fe-challenge](https://github.com/j0ssGZ/itx-fe-challenge). No hay PR ni despliegue. M03 no está autorizado.

## Requisitos e instalación

Entorno verificado: **Node 24.19.0 y npm 11.17.0**. `.nvmrc` fija la versión probada; `package.json` admite Node `>=24.15.0 <25` y npm `>=11 <12`, compatibles con las dependencias elegidas. Las versiones distintas de la probada dentro de esos rangos no han sido ejecutadas en esta entrega.

Desde la raíz del proyecto, con ese entorno disponible:

```sh
npm ci
npx playwright install chromium
```

`npm ci` utiliza el único lockfile versionado. Playwright descarga su Chromium de prueba fuera del repositorio; no se necesita un navegador global. En sistemas Linux, las bibliotecas del navegador pueden requerir `npx playwright install --with-deps chromium`; esta variante no se ha probado en este entorno macOS.

No hacen falta variables de entorno, credenciales ni acceso a la API para ejecutar M02.

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
  styles/                  estilos globales y foco accesible
  test/                    configuración de DOM/matchers y limpieza
e2e/                       smoke del shell en dos tamaños de pantalla
```

Los módulos API, caché, productos y proveedor de carrito del diseño se crearán únicamente cuando sus hitos los requieran. No se han generado carpetas vacías ni abstracciones para funcionalidades futuras.

## Verificación realizada en M02

- `npm run lint`: código de salida 0, sin warnings de lint.
- `npm test`: **3 tests, 1 archivo, aprobados**. Navegación desde listado, inicio/breadcrumbs, entrada directa/retorno y fallback de ruta desconocida.
- `npm run build`: código de salida 0; compilación de producción generada correctamente.
- `npm run test:e2e`: **2 tests aprobados**, Chromium a 1280 × 800 y 390 × 844. Comprueban navegación cliente sin recargar el documento, historial, enlaces de retorno/inicio, entrada y recarga directa, fallback, ausencia de errores JS y de solicitudes API.
- Vite de desarrollo arrancó correctamente. Comprobación adicional de navegación por teclado, enlace de salto, idioma español y ausencia de desbordamiento horizontal a 320 px; revisión visual local del shell.
- `npm ls --depth=0`: dependencias resueltas; `npm audit`: cero vulnerabilidades informadas.

Las pruebas cubren el shell de M02. No demuestran comportamiento de productos, caché ni integración acumulativa del carrito. Los tests de navegador bloquean cualquier solicitud `/api/` inesperada y fallan si aparece alguna; no mutan el carrito remoto.

## SDD y siguientes hitos

- [Requisitos](docs/specs/requirements.md): matriz R-01–R-29, fuentes y criterios de aceptación.
- [Diseño](docs/specs/design.md): responsabilidades, rutas, estado y estrategia de pruebas.
- [Tareas](docs/specs/tasks.md): hitos, dependencias, entregables y checkpoints.
- [Decisiones y riesgos](docs/specs/open-questions.md): acuerdos y B-01 abierto.
- [Evidencias M01](docs/evidence/m01/2026-11-09/README.md): observaciones HTTP/navegador, respuestas y metadatos fechados, sin valores de cookies.

M00 inicializó el repositorio; M01 verificó contratos; M02 configura herramientas y navegación. El siguiente hito es **M03 — límite API y caché cliente con TTL de una hora**, pendiente de autorización. Después: M04 listado/búsqueda, M05 detalle, M06 acciones/carrito, M07 recorridos críticos y M08 entrega reproducible. No se adelantan funcionalidades de esos hitos.

Las decisiones aprobadas se mantienen: interfaz española; búsqueda parcial en tiempo real sin distinguir mayúsculas; singleton visible/preseleccionado y opciones múltiples inicialmente sin selección; caché de productos de una hora con revalidación; contador persistido de forma independiente y tomado de la respuesta API.

## Flujo permanente por hito

**Implementar → Test → Lint → Build → Revisar diff → Commit → Push → Verificar → STOP.** Ejecutar también el smoke E2E cuando aplique. Usar conventional commits, un incremento coherente por hito, conservar el historial y mantener la documentación sincronizada. Antes de commit/push, revisar archivos y secretos y comprobar que PDF, entornos locales y artefactos siguen excluidos. No publicar implementación con comprobaciones fallidas, no hacer force-push ni reescribir historia, y no iniciar otro hito sin aprobación.

Después de cada push o actualización de PR, comprobar CI una sola vez. Si hay checks pendientes/en ejecución, informar del estado, pedir al usuario que vuelva cuando terminen o fallen y detener la sesión; no hacer polling, watch ni agentes de espera. Las fusiones y despliegues nunca son automáticos. Este proyecto todavía no configura workflows de GitHub Actions; los resultados locales son los registrados arriba.

## API, B-01 y material original

El servicio del enunciado es `https://itx-frontend-test.onrender.com/`. M02 no lo llama. La verificación M01 está fechada y no garantiza su disponibilidad futura. **B-01 permanece abierto y aceptado:** la sesión/CORS limita la acumulación del carrito entre orígenes; no se ha introducido proxy, cambio de credenciales ni contador local compensatorio.

El PDF original sigue únicamente en el entorno local e ignorado por Git por falta de permiso de redistribución. Las referencias relativas de las especificaciones requieren esa copia local y no funcionan en un clon sin ella. No se han alterado las evidencias API ni distribuido el PDF.
