# Implementation Plan - Setup Inicial y Arquitectura Enterprise de Zea Web (Issues #1 a #5)

## Contexto y Alcance
Construcción de la nueva plataforma web corporativa B2B de ZEA (`zea.cl`), replicando y respetando la arquitectura limpia, tokens de diseño y calidad de ingeniería observada en `zea/glia-web`. No será una landing simple, sino una aplicación completa estructurada bajo Clean Architecture con soporte i18n, componentes interactivos de demostración por vertical de industria, formulario de diagnóstico/lead capture validado, pipeline de pruebas (Vitest + Playwright E2E) y contenedor de producción para Google Cloud Run.

---

## Estructura del Proyecto (Inspirada en `glia-web`)

```
zea-web/
├── .github/
├── e2e/                                    # Playwright E2E tests
│   └── landing.spec.ts
├── src/
│   ├── app.css                             # Tailwind CSS v4 + ZEA Metallic tokens
│   ├── app.html                            # HTML Shell dark mode
│   ├── test-setup.ts                       # Setup para Vitest & Testing Library
│   ├── lib/
│   │   ├── config/
│   │   │   ├── i18n.ts                     # Diccionario bilingüe (ES / EN)
│   │   │   └── navigation.ts               # Rutas, anclas y meta tags
│   │   ├── domain/                         # Capa de Dominio (Clean Architecture)
│   │   │   ├── entities/
│   │   │   │   ├── LeadDiagnostic.ts       # Modelo de solicitud de auditoría agéntica
│   │   │   │   ├── VerticalCase.ts         # Modelos de casos (Legal, Finanzas, Faenas)
│   │   │   │   └── MetricBadge.ts          # Métricas de validación operativa
│   │   │   └── ports/
│   │   │       ├── DiagnosticNotifier.ts   # Interfaz de notificación de leads
│   │   │       └── AnalyticsTracker.ts     # Interfaz de eventos de conversión
│   │   ├── application/                    # Capa de Aplicación
│   │   │   ├── use-cases/
│   │   │   │   ├── SubmitDiagnosticUseCase.ts
│   │   │   │   └── SubmitDiagnosticUseCase.test.ts
│   │   │   └── container.ts                # Inyección de dependencias
│   │   ├── infrastructure/                 # Capa de Infraestructura
│   │   │   ├── adapters/
│   │   │   │   └── WebhookDiagnosticNotifier.ts
│   │   │   └── repositories/
│   │   └── components/                     # Componentes Svelte 5 (Runes)
│   │       ├── atoms/
│   │       │   ├── ZeaLogo.svelte          # Logo vectorial corporativo ZEA
│   │       │   ├── ZeaIcon.svelte          # Isotipo vectorial ZEA
│   │       │   ├── MetallicButton.svelte   # Botones con borde gradiente plateado
│   │       │   └── MetricBadge.svelte      # Pills de métricas operativas
│   │       ├── layout/
│   │       │   ├── Header.svelte           # Navbar corporativo con selector ES/EN y CTA
│   │       │   ├── Header.test.ts
│   │       │   └── Footer.svelte           # Footer corporativo con links legales y Glia
│   │       ├── sections/
│   │       │   ├── Hero.svelte             # Hero B2B con simulación interactiva
│   │       │   ├── Hero.test.ts
│   │       │   ├── VerticalLegal.svelte    # MOP Chacao-Chonchi / Concesiones / Gantt
│   │       │   ├── VerticalFinance.svelte  # Südlich Capital / AUM / Determinismo
│   │       │   ├── VerticalIndustrial.svelte# Bitumix / Supervisión en terreno
│   │       │   ├── DiagnosticForm.svelte   # Formulario interactivo con validaciones
│   │       │   ├── DiagnosticForm.test.ts
│   │       │   └── GliaBridgeCard.svelte   # Cross-link hacia glia.zea.cl
│   └── routes/
│       ├── +layout.svelte                  # Layout raíz con tema oscuro ZEA
│       ├── +page.svelte                    # Landing Page principal integrada
│       └── api/
│           └── diagnostic/
│               └── +server.ts              # Endpoint de captura de leads validado
├── Dockerfile                              # Multi-stage build para Cloud Run (Node 20 slim)
├── cloudbuild.yaml                         # Pipeline Cloud Build (southamerica-west1)
├── package.json
├── playwright.config.ts                    # Configuración de E2E
├── svelte.config.js                        # @sveltejs/adapter-node
├── tsconfig.json
└── vite.config.ts                          # Tailwind v4 + SvelteKit + Vitest
```

---

## Fases de Implementación

### Fase 1: Andamiaje Base e Infraestructura de Build (Issue #2 - Task 1/4)
1. Inicializar `package.json` con SvelteKit 2, Svelte 5, Tailwind CSS v4 (`@tailwindcss/vite`), TypeScript, Vitest y `@testing-library/svelte`.
2. Configurar `svelte.config.js` con `@sveltejs/adapter-node` (idéntico a `glia-web`).
3. Configurar `vite.config.ts` y `tsconfig.json`.
4. Crear `src/app.css` con el **ZEA Metallic Slate-Gray Design System** (variables CSS `--z-bg: #1c1c22`, `--z-surface: #25252d`, `--z-border: #3d3d4b`, acentos plateados de gradiente animado `.z-btn--gradient-border`, etc.).
5. Implementar `src/app.html` y `src/routes/+layout.svelte`.
6. Configurar tests base en `src/test-setup.ts` y soporte Playwright.

### Fase 2: Clean Architecture y Capas de Dominio / Aplicación
1. Implementar entidades en `src/lib/domain/entities/`:
   - `LeadDiagnostic.ts`: Validación de correo corporativo, tamaño de empresa, industria y requerimiento.
   - `VerticalCase.ts`: Especificación de casos de éxito (Legal MOP, Finanzas Südlich, Faenas Bitumix).
2. Implementar caso de uso `SubmitDiagnosticUseCase.ts` con tests unitarios en Vitest.
3. Configurar contenedor de dependencias `src/lib/application/container.ts`.
4. Implementar diccionario y estado de i18n reactivo (ES / EN) en `src/lib/config/i18n.ts`.

### Fase 3: Componentes UI de Alto Impacto y Verticales (Issue #3 - Task 2/4)
1. **Componentes Atómicos**: `ZeaLogo.svelte`, `ZeaIcon.svelte`, `MetallicButton.svelte`, `MetricBadge.svelte`.
2. **Header y Footer**: Responsive con navegación suave por anclas, selector de idioma (ES/EN) y CTA directo.
3. **Hero Principal B2B**:
   - Titular corporativo de alto impacto sobre Operaciones de Misión Crítica.
   - Métricas destacadas: +2.600 cláusulas auditadas, 456 dependencias de ruta crítica, conciliación de AUM.
   - Terminal interactivo/visualizador agéntico simulando auditoría de contratos en vivo.
4. **Vertical 1 (Legal & Concesiones)**:
   - Caso MOP Chacao-Chonchi / Salmoneras.
   - Visualizador interactivo de cláusulas contractuales, matriz de riesgos y Carta Gantt generada por IA.
5. **Vertical 2 (Finanzas & Fondos de Inversión)**:
   - Caso Südlich Capital.
   - Cálculo determinista de AUM, auditoría contable y reporte a LPs.
6. **Vertical 3 (Faenas Industriales & Infraestructura)**:
   - Caso Bitumix.
   - Control de faenas viales, trazabilidad de asfalto y despacho en tiempo real.

### Fase 4: Conversión, Endpoint API y Glia Bridge (Issue #4 - Task 3/4)
1. **DiagnosticForm.svelte**:
   - Formulario de agendamiento y diagnóstico para directivos con validación instantánea.
   - Feedback visual de éxito con confirmación y calendarización.
2. **Endpoint `/api/diagnostic/+server.ts`**:
   - Validación con schema estricto en el servidor y respuesta tipada.
3. **GliaBridgeCard.svelte**:
   - Tarjeta corporativa hacia `https://glia.zea.cl` para ingenieros y fundadores de apps móviles (Swift/Kotlin).

### Fase 5: Dockerfile, Cloud Build y CI/CD (Issue #5 - Task 4/4)
1. Crear `Dockerfile` multi-stage optimizado para `node:20-slim`, `PORT=3000` y runner sin privilegios (`node`).
2. Crear `cloudbuild.yaml` para despliegue automatizado en Artifact Registry y Cloud Run en `southamerica-west1`.
3. Crear `.dockerignore` y `.gitignore`.

### Fase 6: Pruebas Exhaustivas y Verificación
1. Ejecutar suites de Vitest unitarios y de componentes (`npm test`).
2. Ejecutar `npm run check` (TypeScript + Svelte Check con 0 errores y 0 warnings).
3. Ejecutar pruebas Playwright E2E (`npm run test:e2e`).
4. Generar reporte visual y walkthrough.

---

## Verificación y Criterios de Éxito
- `npm run check` pasa sin errores ni advertencias.
- `npm test` pasa 100% de los tests unitarios y de componentes.
- `npm run build` genera el bundle de producción en `build/` con `@sveltejs/adapter-node`.
- Playwright E2E valida renderizado completo, alternancia de idiomas ES/EN y envío del formulario de contacto.
