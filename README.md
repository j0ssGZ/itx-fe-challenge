# ITX Frontend Challenge

Miniaplicación para consultar dispositivos móviles, ver sus características y añadir una combinación de color y almacenamiento al carrito mediante la API del enunciado.

El objetivo es desarrollar una SPA React pequeña, accesible, adaptable y bien probada, manteniendo la trazabilidad entre los requisitos, las decisiones de diseño y cada incremento de implementación.

## Estado actual

**M01: verificación documental de contratos API completada, con B-01 abierto y aceptado como riesgo. La aplicación todavía no está implementada.**

- Las fases de especificación y revisión 1.1 están documentadas.
- M00 creó Git, README y `.gitignore` en el primer commit. M01 actualiza las especificaciones y conserva metadatos y respuestas reales de la API en [sus evidencias versionadas](docs/evidence/m01/2026-11-09/README.md).
- No existen código de aplicación, `package.json`, dependencias instaladas, configuración Vite, scripts de desarrollo ni infraestructura de pruebas.
- No se han ejecutado pruebas de aplicación, lint ni compilaciones. Las comprobaciones previas de la API son exploraciones del servicio, no pruebas de una aplicación terminada.
- Esta autorización cubre únicamente M01. M02 y los hitos posteriores requieren aprobación explícita.
- El repositorio es local; no se ha configurado un remoto ni realizado una publicación.

Las observaciones históricas de la revisión del 6 de noviembre están separadas de la verificación M01 del 9 de noviembre de 2026. No se presentan muestras antiguas como resultados recién obtenidos. El código, las herramientas y las pruebas de aplicación siguen siendo planes, no entregables existentes.

## Alcance del enunciado

La aplicación tendrá únicamente dos vistas:

1. **Listado de productos:** todos los productos devueltos por la API, con imagen, marca, modelo y precio; búsqueda inmediata por marca/modelo; cuadrícula adaptable con un máximo de cuatro productos por fila.
2. **Detalle de producto:** imagen, al menos los once atributos exigidos, selectores de color y almacenamiento, acción de añadir al carrito y enlace explícito de vuelta al listado.

Ambas vistas compartirán cabecera con enlace al inicio, breadcrumbs y contador del carrito. La composición seguirá las referencias visuales del enunciado, con libertad de estilo y adaptación a pantallas pequeñas.

No se incluyen una página de carrito, checkout, autenticación, ordenación ni funcionalidades comerciales adicionales.

## Decisiones aprobadas

- Interfaz en español.
- Búsqueda en tiempo real, parcial y sin distinguir mayúsculas/minúsculas sobre marca y modelo.
- Selectores de una sola opción visibles y preseleccionados; grupos con varias opciones inicialmente sin selección.
- Caché de productos con TTL de una hora y revalidación de los datos caducados.
- Contador persistido de forma independiente de la caducidad de productos.
- El valor `count` devuelto por la API será la fuente de verdad del contador, sin incrementos locales artificiales.

## Stack previsto

Estas herramientas están planificadas; todavía no se han instalado ni configurado:

- React y React DOM con JavaScript ES6+/JSX, sin TypeScript.
- Vite para desarrollo y compilación de la SPA.
- React Router para las dos rutas de cliente.
- CSS Modules y una hoja global pequeña.
- `fetch`, estado local y un Context acotado al contador; persistencia y caché separadas de la presentación.
- Vitest y React Testing Library para pruebas unitarias y de integración.
- Playwright para los recorridos E2E críticos.
- ESLint para comprobación estática.

Se propone npm con un único lockfile. Las versiones compatibles y los requisitos de Node/npm se fijarán durante la configuración de herramientas. No se prescribe todavía un entorno de ejecución verificable.

## Metodología SDD y especificaciones

El desarrollo sigue Spec-Driven Development: requisitos identificados, decisiones explícitas, tareas pequeñas y criterios verificables antes de implementar. Cada incremento incorporará sus comprobaciones relevantes y un commit que refleje el trabajo real, sin presentar planes como funcionalidad terminada.

Los cuatro documentos son la referencia del proyecto:

- [Requisitos y criterios de aceptación](docs/specs/requirements.md): matriz R-01–R-29, referencias al PDF y observaciones de la API.
- [Diseño y arquitectura](docs/specs/design.md): responsabilidades, rutas, componentes, estado, persistencia y estrategia de pruebas.
- [Hitos y tareas](docs/specs/tasks.md): objetivos, dependencias, entregables, comprobaciones y checkpoints de Git.
- [Decisiones, preguntas y riesgos](docs/specs/open-questions.md): decisiones cerradas, límites conocidos y riesgo B-01.

La [evidencia M01](docs/evidence/m01/2026-11-09/README.md) añade respuestas de referencia, metadatos HTTP, límites de espera, comparación de credenciales en Chrome y comprobaciones de integridad. Son datos documentales para futuros tests, no un backend alternativo ni funcionalidad de aplicación.

Los documentos distinguen requisitos del enunciado, decisiones aprobadas, propuestas técnicas y comportamiento observado. No debe inferirse un contrato a partir de valores ilustrativos ni de un único resultado del servicio.

## Hitos previstos

1. **M00 — Inicialización:** completado; repositorio local, README, exclusiones y primer commit documental.
2. **M01 — Base de contratos e integración:** verificación completada con respuestas y metadatos versionados, límites explícitos y B-01 abierto como riesgo aceptado. No se ha implementado un cliente API ni configurado tests.
3. **M02 — Herramientas y estructura:** configurar React/Vite, las dos rutas, la cabecera y los scripts de validación.
4. **M03 — API y caché:** límites de acceso a datos, persistencia y expiración de una hora.
5. **M04 — Listado:** productos, búsqueda y tarjetas adaptables.
6. **M05 — Detalle:** atributos, imagen, navegación y estados de carga/error.
7. **M06 — Carrito:** opciones, petición de añadir y contador compartido persistido.
8. **M07 — Recorridos y calidad visual:** E2E críticos y revisión de accesibilidad y adaptación.
9. **M08 — Entrega reproducible:** comprobación desde una copia limpia y documentación final basada en resultados reales.

El siguiente hito es **M02 — herramientas y estructura**. No se ha iniciado y requiere aprobación explícita.

## Instalación y comandos de desarrollo

**No disponibles en M00/M01. No ejecutar hasta autorizar y configurar M02.** M01 no incluye instalación de herramientas ni creación de scripts.

No existe `package.json` y actualmente no hay una aplicación que instalar, iniciar, probar o compilar. Los siguientes nombres son únicamente el contrato de ejecución previsto:

- `npm start`: futuro servidor de desarrollo; **no disponible**.
- `npm run build`: futura compilación de producción; **no disponible**.
- `npm test`: futura ejecución finita de pruebas; **no disponible**.
- `npm run lint`: futura comprobación de código; **no disponible**.

Los comandos de E2E, modo watch y vista previa se documentarán cuando existan. No hay resultados de pruebas, cobertura ni build que comunicar en este estado. Las instrucciones de instalación, versiones y configuración se añadirán con su implementación y verificación.

## API y riesgo abierto B-01

El enunciado define la base `https://itx-frontend-test.onrender.com/` y tres operaciones: `GET /api/product`, `GET /api/product/:id` y `POST /api/cart`. Las estructuras y particularidades observadas están registradas en la especificación; no se presupone que la disponibilidad actual ni el comportamiento de sesión estén garantizados.

En M01, el primer GET agotó 45 segundos sin respuesta HTTP; su único segundo intento respondió 200. Se conservaron el listado de 100 productos, cuatro detalles, el error 500 de un ID inexistente y el resultado 200 del único POST deliberado (`count: 1`). No se repitieron altas para comprobar acumulación. Los campos vacíos, tipos variables y claves con erratas permanecen tal como fueron recibidos.

**B-01 permanece abierto como riesgo de integración aceptado, sin considerarse resuelto.** La exploración previa mostró acumulación del contador al conservar la cookie de sesión, mientras que las llamadas independientes devolvían `1`. La configuración CORS observada plantea una limitación para mantener esa sesión desde otro origen en el navegador.

M00/M01 aceptan este riesgo para continuar con trabajo local autorizado. M01 volvió a observar GET legible en Chrome con credenciales omitidas y fallo con `include`, junto a cabeceras GET/OPTIONS de origen comodín sin permiso de credenciales. No se revalidó la acumulación de varias altas ni se introdujo un proxy, cambio de transporte o contador local alternativo. La aceptación no demuestra un carrito acumulativo funcional; véase [B-01](docs/specs/open-questions.md#b-01--unresolved-direct-cross-origin-cumulative-cart-integration).

## Material original y entrega futura

El PDF original se conserva únicamente como material local y está excluido de Git porque no se ha establecido permiso de redistribución. Las referencias relativas al PDF en las especificaciones requieren disponer de esa copia local; el documento no se distribuirá con un clon del repositorio.

El README se ampliará de forma incremental con instrucciones ejecutables, decisiones verificadas, resultados reales de pruebas, limitaciones y documentación de entrega. No se ha creado un repositorio remoto, una PR ni un despliegue. La publicación futura será una acción independiente y autorizada.
