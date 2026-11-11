# ZEA — Contexto de Proyecto & Estado Actual
**Fecha de generación:** 11 de Noviembre de 2026  
**Repositorio:** `/Users/dev/Documents/zea/zea-web`  
**Branch:** `feature/native-platform-design-systems`  
**Entorno de desarrollo:** SvelteKit 2 + Svelte 5 (Runes) + Tailwind CSS + Vitest

---

## 1. Identidad, Filosofía y Posicionamiento de ZEA

### Qué es ZEA
ZEA es un **estudio de tecnología y productos** (*Technology & Product Studio*). No es una agencia digital tradicional de diseño web ni una consultora corporativa. Diseña, investiga y construye **productos propios de software** para industrias complejas del mundo real.

### El origen del nombre
- **ZEA** proviene de **Odisea**: el espíritu de emprender una travesía técnica, explorar terrenos difíciles donde no hay manuales y construir tecnología propietaria que funcione donde las cosas no pueden fallar.
- **Tono de marca:** No es militar ni distópico como Palantir, pero tampoco frívolo ni genérico como las agencias de marketing digital. Habla de industrias reales, de precisión y de respeto por quien trabaja en terreno o en la mesa de decisiones.
- **La frase sobre IA:** Hoy no se menciona "Inteligencia Artificial" explícitamente en el Hero ni como bandera comercial porque ya se da por sentada (commodity). Se habla de oficio, investigación en terreno, software propio y operaciones reales.

---

## 2. Ecosistema de Productos Actuales

Se eliminó la capa intermedia interna (Glia no se muestra al usuario final, es el motor técnico interno). Los **3 productos insignia** que se exhiben al público en la web y en el simulador móvil son:

### 1. **Cooper** (Anteriormente *Funds*)
* **Industria:** Capital Privado / Private Equity / Venture Capital.
* **Inspiración y Tono:** Bautizado por el personaje de Jon Hamm (Andrew "Coop" Cooper) en la serie de Apple TV+ *Your Friends & Neighbors*, con la vibra analítica de Wall Street (*Billions*).
* **Estética de la pantalla:** Inspirada en **Harvey AI**:
  - Paleta clara/cálida editorial (`#F6F5F2` de fondo, tarjetas blancas finas con borde `#EBE9E4`).
  - Tipografías: `Newsreader` (serif editorial) para cifras y títulos, e `Inter` para datos tabulares.
  - Cero emojis. Gráficos de alta densidad con líneas de 1px (AUM, llamadas de capital, waterfall, ranking de LPs).
  - Encabezado móvil: `Cooper` (en tipografía serif grande y limpia) + selector de modo Chat / App.
  - Componente: `src/lib/components/interactive/ZeaFundsScreen.svelte`.

### 2. **Allisbox** (Anteriormente *Industrial* / Fusión Bitumix + ASPAL)
* **Industria:** Gemelo Digital Industrial, faenas viales, plantas de asfalto/áridos, cálculo de cubicación y obra en terreno.
* **ADN del producto:**
  - **Allisbox:** El espacio de trabajo y gemelo digital 3D unificado para industrias pesadas.
  - **Bitumix:** Automatización multi-planta de producción de mezclas asfálticas, fórmulas de ligantes, temperaturas de despacho y bitácora diaria sin transcripciones manuales.
  - **ASPAL:** Extracción y cubicación automatizada bajo Norma NCh 353 desde planos CAD/BIM (DWG / PDF), control de mermas dinámicas y contraste entre lo presupuestado y lo extendido en obra.
* **Estética de la pantalla:** Inspirada en **Autodesk Revit**:
  - Paleta CAD/BIM Workstation en gris técnico (`#EFEFEF` / `#F6F7F8`, paneles ortogonales blancos con borde `#DCDFE4`).
  - Modelo axonométrico 3D isométrico en escala de grises sombreada (*Shaded / Hidden Line* con poché negro en cortes, losas y núcleo de silos).
  - Vistas y tablas técnicas: `3D - Coordination Mech`, `Properties` (parte diario), `Schedule` (balance de masa del turno) y árbol de activos.
  - Componente: `src/lib/components/interactive/ZeaEdgeScreen.svelte`.
  - Repositorio dedicado: `/Users/dev/Documents/zea/allisbox`.

### 3. **G.U.S.** (Anteriormente *Sport*)
* **Industria:** Operaciones Deportivas / Alto Rendimiento.
* **Significado:** **G.U.S.** es el acrónimo de **"Good for US"** (juego de palabras nativo en inglés para salud, equipo y bienestar colectivo) presentado con personalidad de entrenador/coach senior de confianza.
* **Subtítulo:** *Plataforma de gestión deportiva* / *Sports management platform*.
* **Componente:** `src/lib/components/interactive/ZeaSportScreen.svelte`.

---

## 3. Estado de la Arquitectura Web (`zea-web`)

### Header Superior (`src/lib/components/layout/Header.svelte`)
- Logo vectorial minimalista `ZEA` (`src/lib/components/atoms/ZeaLogo.svelte`).
- Acciones a la derecha: enlace GitHub, selector de plataforma móvil (iOS / Android) sin marcos, switch de idioma iOS (`ES` / `ENG`) y botón CTA (`Comenzar` en español / `Get Started` en inglés).

### Bloque Hero (`src/routes/+page.svelte`)
- Bloque del manifiesto con línea izquierda punteada:
  1. Logo vectorial `ZEA`.
  2. Subtítulo: `Estudio de tecnología y productos.` / `Technology & product studio.`
  3. Declaración de principios actual:
     - **ES:** *"Invertimos en explorar, para construir la tecnología que navega operaciones complejas y sistemas del mundo real."*
     - **ENG:** *"We invest in exploring, to build the technology that navigates complex operations and real-world systems."*
  4. Discusión abierta reciente: Evolucionar este texto hacia algo aún más auténtico y no genérico, como: *"Construimos software para industrias donde las cosas pesan, los números importan y el error cuesta caro"* / *"We build software for industries where things are heavy, numbers matter, and mistakes are costly"*.

### Selector de Productos (Columna izquierda)
Organizado en una grilla de 3 columnas limpias bajo el título `PRODUCTOS`:
1. **Cooper** — *Capital privado*
2. **Allisbox** — *Gemelo digital y faenas* (anteriormente Industrial)
3. **G.U.S.** (Good for US) — *Plataforma de gestión deportiva*

Al seleccionar cualquiera de los 3 productos, el simulador móvil de la derecha conmuta instantáneamente a su respectiva pantalla nativa interactiva. Inicia por defecto en **Cooper**.

---

## 4. Reglas Críticas de Desarrollo
1. **NUNCA ejecutar tests de Playwright** sin autorización explícita del usuario. Utilizar exclusivamente:
   ```bash
   npm test -- --run
   ```
2. **Cero emojis:** Tanto en la web como en los componentes móviles (`ZeaFundsScreen`, `ZeaEdgeScreen`, etc.), no se deben incluir emojis. La estética debe ser 100% tipográfica, editorial y técnica.
3. **Internacionalización (i18n):** Todo texto nuevo debe contemplar soporte reactivo para `ES` y `ENG` a través de `src/lib/config/i18n.ts` y las propiedades derivadas de Svelte 5.
