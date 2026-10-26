# Task Checklist - ZEA Web Clean Header & Mobile Platform Switcher

- [x] **Header Ultra-Minimalista con Iconos Sueltos:**
  - [x] Logo ZEA tipográfico a la izquierda (idéntico a `glia-web`)
  - [x] Enlace a GitHub sin marcos a la derecha
  - [x] Iconos de **Apple ** y **Android Robot** colocados en el header junto al selector de idioma:
    - Sin cajas, bordes ni marcos de botón (solo los iconos vectoriales sueltos)
    - Iluminación reactiva al seleccionar (Apple se ilumina blanco brillante, Android en verde `#3ddc84`, apagados en gris metálico)
    - Al hacer clic, cambia reactivamente el teléfono que se muestra en el centro (iPhone Pro con Dynamic Island vs Android con cámara punch-hole)
  - [x] Selector de idioma con texto limpio `ES | ENG` y switch nativo estilo iOS
  - [x] Eliminados los botones redundantes del cuerpo para dejar el teléfono completamente centrado y limpio
- [x] **Pruebas y Verificación:**
  - [x] `npm test` pasando al 100% (6 suites, 16 tests)
  - [x] `npm run check` con 0 errores y 0 warnings
  - [x] `npm run test:e2e` Playwright pasando al 100% (5 tests E2E)
  - [x] `npm run build` exitoso con `@sveltejs/adapter-node`
  - [x] Servidor dev activo en `http://localhost:5175`
