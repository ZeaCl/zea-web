# Walkthrough: Landing B2B Enterprise de ZEA (`zea.cl`)

Construcción completa y despliegue del andamiaje corporativo B2B para **ZEA Platform** en `zea.cl`, replicando la arquitectura limpia, tokens de diseño y estándares de ingeniería observados en `zea/glia-web`.

---

## 🏛️ Resumen de Implementación

### 1. Clean Architecture (`src/lib/`)
* **`domain/`**:
  * [LeadDiagnostic.ts](file:///Users/dev/Documents/zea/zea-web/src/lib/domain/entities/LeadDiagnostic.ts): Entidad con validaciones de negocio para correos corporativos, roles y descripción de operaciones críticas.
  * [VerticalCase.ts](file:///Users/dev/Documents/zea/zea-web/src/lib/domain/entities/VerticalCase.ts): Modelos para los casos de éxito de MOP, Südlich y Bitumix.
  * [DiagnosticNotifier.ts](file:///Users/dev/Documents/zea/zea-web/src/lib/domain/ports/DiagnosticNotifier.ts): Puerto para notificación y webhook de leads comerciales.
* **`application/`**:
  * [SubmitDiagnosticUseCase.ts](file:///Users/dev/Documents/zea/zea-web/src/lib/application/use-cases/SubmitDiagnosticUseCase.ts): Caso de uso desacoplado que orquesta la captura y auditoría previa.
  * [container.ts](file:///Users/dev/Documents/zea/zea-web/src/lib/application/container.ts): Contenedor de inyección de dependencias para runtime serverless y local.
* **`infrastructure/`**:
  * [WebhookDiagnosticNotifier.ts](file:///Users/dev/Documents/zea/zea-web/src/lib/infrastructure/adapters/WebhookDiagnosticNotifier.ts): Adaptador HTTP con tolerancia a fallos.
  * [+server.ts](file:///Users/dev/Documents/zea/zea-web/src/routes/api/diagnostic/+server.ts): API endpoint en SvelteKit validando requests en el backend.

---

### 2. ZEA Metallic Design System & Componentes Svelte 5 (Runes)
* [app.css](file:///Users/dev/Documents/zea/zea-web/src/app.css): Tailwind CSS v4 con variables CSS `--z-bg: #1c1c22`, `--z-surface: #25252d`, acentos plateados y animación de borde gradiente dinámico (`.z-btn--gradient-border`).
* **Atoms**:
  * [ZeaLogo.svelte](file:///Users/dev/Documents/zea/zea-web/src/lib/components/atoms/ZeaLogo.svelte) & [ZeaIcon.svelte](file:///Users/dev/Documents/zea/zea-web/src/lib/components/atoms/ZeaIcon.svelte): Vectores oficiales de la marca ZEA.
  * [MetallicButton.svelte](file:///Users/dev/Documents/zea/zea-web/src/lib/components/atoms/MetallicButton.svelte): Botones interactivos con bordes metálicos y estilos primary/ghost.
  * [MetricBadge.svelte](file:///Users/dev/Documents/zea/zea-web/src/lib/components/atoms/MetricBadge.svelte): Tarjetas de métricas operativas con badges de estado.
* **Layout & Secciones**:
  * [Header.svelte](file:///Users/dev/Documents/zea/zea-web/src/lib/components/layout/Header.svelte) & [Footer.svelte](file:///Users/dev/Documents/zea/zea-web/src/lib/components/layout/Footer.svelte): Navbar responsive con selector de idioma (ES / EN) y anclas de navegación.
  * [Hero.svelte](file:///Users/dev/Documents/zea/zea-web/src/lib/components/sections/Hero.svelte): Hero corporativo con terminal interactivo simulando razonamiento agéntico en tiempo real (Legal, Finanzas, Faenas).
  * [VerticalLegal.svelte](file:///Users/dev/Documents/zea/zea-web/src/lib/components/sections/VerticalLegal.svelte): Extracción semántica de cláusulas y Carta Gantt de 456 nodos para el MOP Puente Chacao.
  * [VerticalFinance.svelte](file:///Users/dev/Documents/zea/zea-web/src/lib/components/sections/VerticalFinance.svelte): Caso Südlich Capital con simulador de Waterfall y balance contable sin alucinación.
  * [VerticalIndustrial.svelte](file:///Users/dev/Documents/zea/zea-web/src/lib/components/sections/VerticalIndustrial.svelte): Caso Bitumix con telemetría GPS y control térmico de mezclas asfálticas.
  * [DiagnosticForm.svelte](file:///Users/dev/Documents/zea/zea-web/src/lib/components/sections/DiagnosticForm.svelte): Formulario de auditoría agéntica con validaciones reactivas y pantalla de éxito.
  * [GliaBridgeCard.svelte](file:///Users/dev/Documents/zea/zea-web/src/lib/components/sections/GliaBridgeCard.svelte): Cross-link hacia el SDK móvil de ZEA ([glia.zea.cl](https://glia.zea.cl)) con mención a NutriSnaps.

---

### 3. CI/CD & Despliegue en GCP
* [Dockerfile](file:///Users/dev/Documents/zea/zea-web/Dockerfile): Multi-stage build optimizado con Node 20 slim, precompresión y ejecución con usuario no privilegiado `node` en puerto 3000.
* [cloudbuild.yaml](file:///Users/dev/Documents/zea/zea-web/cloudbuild.yaml): Pipeline de compilación y despliegue a Cloud Run en la región `southamerica-west1` (Chile).

---

## 🧪 Resultados de Verificación

### 1. Pruebas Unitarias y de Componentes (Vitest)
```bash
npm test
```
```
 ✓ src/lib/application/use-cases/SubmitDiagnosticUseCase.test.ts (3 tests)
 ✓ src/lib/components/layout/Header.test.ts (2 tests)
 ✓ src/lib/components/sections/Hero.test.ts (2 tests)
 ✓ src/lib/components/sections/DiagnosticForm.test.ts (3 tests)

 Test Files  4 passed (4)
      Tests  10 passed (10)
```

### 2. Verificación Estática (TypeScript + Svelte Check)
```bash
npm run check
```
```
svelte-check found 0 errors and 0 warnings
```

### 3. Pruebas End-to-End (Playwright)
```bash
npm run test:e2e
```
```
Running 6 tests using 4 workers
  ✓ [chromium] › debe cargar correctamente el título y branding corporativo
  ✓ [chromium] › debe alternar el idioma entre Español e Inglés en tiempo real
  ✓ [chromium] › debe permitir interactuar con el Terminal Agéntico del Hero
  ✓ [chromium] › debe permitir explorar las 3 verticales de industria
  ✓ [chromium] › debe contener el puente cross-link a Glia Mobile Runtime
  ✓ [chromium] › debe completar el formulario de diagnóstico B2B y recibir confirmación

  6 passed (4.3s)
```

### 4. Build de Producción (Node Adapter)
```bash
npm run build
```
```
> Using @sveltejs/adapter-node
  ✔ done in 2.10s
```
Bundle generado exitosamente en `build/`.
