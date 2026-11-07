import { test, expect } from '@playwright/test';

test.describe('ZEA Web Mobile Simulator Experience & Dev Magic', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('debe cargar el logo ZEA tipográfico y el simulador de teléfono en el centro', async ({ page }) => {
    await expect(page).toHaveTitle(/ZEA — Inteligencia Artificial Agéntica/);
    const logo = page.locator('header [aria-label="ZEA"]');
    await expect(logo).toBeVisible();

    const simulator = page.getByTestId('mobile-simulator');
    await expect(simulator).toBeVisible();
    await expect(page.locator('text=iOS Client')).toBeVisible();
  });

  test('debe contener el icono de GitHub y los iconos de Apple/Android en el header', async ({ page }) => {
    const githubLink = page.getByTestId('github-link');
    await expect(githubLink).toBeVisible();
    await expect(githubLink).toHaveAttribute('href', 'https://github.com/ZeaCl');

    const iosTab = page.getByTestId('header-tab-ios');
    const androidTab = page.getByTestId('header-tab-android');
    await expect(iosTab).toBeVisible();
    await expect(androidTab).toBeVisible();
  });

  test('debe cambiar el teléfono y el snippet de código al pulsar Apple y Android en el header', async ({ page }) => {
    const androidTab = page.getByTestId('header-tab-android');
    const iosTab = page.getByTestId('header-tab-ios');

    // Click Android in header -> activates developer view, changes code to AgentRuntime.kt and phone to Android Client
    await androidTab.click();
    await expect(page.locator('text=AgentRuntime.kt')).toBeVisible();
    await expect(page.locator('text=Android Client')).toBeVisible();

    // Click Apple in header -> changes back to AgentRuntime.swift and iOS Client
    await iosTab.click();
    await expect(page.locator('text=AgentRuntime.swift')).toBeVisible();
    await expect(page.locator('text=iOS Client')).toBeVisible();
  });

  test('debe alternar el idioma entre ES y ENG usando el switch estilo iOS', async ({ page }) => {
    const switchBtn = page.getByTestId('ios-lang-switch');
    const btnEn = page.getByTestId('lang-btn-en');
    const btnEs = page.getByTestId('lang-btn-es');

    // Switch to English using iOS switch
    await switchBtn.click();
    await expect(btnEn).toHaveClass(/font-bold/);
    await expect(page.locator('text=How do I embed autonomous AI agents natively')).toBeVisible();

    // Switch back to Spanish clicking text ES
    await btnEs.click();
    await expect(btnEs).toHaveClass(/font-bold/);
    await expect(page.locator('text=¿Cómo integro agentes de IA autónomos directamente')).toBeVisible();
  });

  test('debe activar superpoderes (Dev Magic) con los iconos minimalistas sin texto', async ({ page }) => {
    // Cambiar a la vista developer
    await page.getByTestId('nav-developer').click();

    const audioBtn = page.getByTestId('skill-toggle-audio');
    const visionBtn = page.getByTestId('skill-toggle-vision');
    const securityBtn = page.getByTestId('skill-toggle-security');

    await expect(audioBtn).toBeVisible();
    await expect(visionBtn).toBeVisible();
    await expect(securityBtn).toBeVisible();

    // 1. Activar Audio -> Ilumina botón, inyecta LiveAudioStream y activa input de audio estilo WhatsApp
    await audioBtn.click();
    await expect(audioBtn).toHaveClass(/text-emerald-400/);
    await expect(page.locator('text=agent.use(LiveAudioStream())')).toBeVisible();
    await expect(page.locator('text=agent.use(LiveAudioStream)')).toBeVisible();
    await expect(page.getByTestId('audio-recording-input')).toBeVisible();
    await expect(page.getByTestId('audio-send-btn')).toBeVisible();

    // 2. Activar Visión -> Muestra cámara en vivo pura y minimalista
    await visionBtn.click();
    await expect(visionBtn).toHaveClass(/text-cyan-400/);
    await expect(page.locator('text=agent.use(VisionScanner())')).toBeVisible();
    await expect(page.getByTestId('real-camera-viewfinder')).toBeVisible();
    // Cerrar cámara para volver al chat
    await visionBtn.click();

    // 3. Activar Seguridad -> Muestra Secure Enclave Hardware Key
    await securityBtn.click();
    await expect(securityBtn).toHaveClass(/text-violet-400/);
    await expect(page.locator('text=agent.use(SecureEnclave())')).toBeVisible();
    await expect(page.locator('text=Secure Enclave Hardware Key')).toBeVisible();
  });

  test('debe permitir interactuar con el chat del teléfono y recibir respuesta', async ({ page }) => {
    const input = page.locator('input[placeholder*="Pregunta sobre el SDK móvil"], input[placeholder*="Ask about the mobile SDK"]');
    await expect(input).toBeVisible();
    await input.fill('¿Cómo funciona en iOS con Swift?');

    const sendBtn = page.locator('button[aria-label="Enviar mensaje"]');
    await sendBtn.click();

    await expect(page.locator('text=¿Cómo funciona en iOS con Swift?')).toBeVisible();
    await expect(page.locator('text=En Swift solo necesitas instanciar IOSClient')).toBeVisible({ timeout: 5000 });
  });

  test('debe soportar la barra de entrada estilo WhatsApp con (+), input, cámara y micrófono reactivos', async ({ page }) => {
    // Activar vista developer para verificar sincronización bidireccional entre la cámara/audio y el snippet
    await page.getByTestId('nav-developer').click();

    // 1. Botones iniciales presentes estilo WhatsApp: (+), micrófono y botón interactivo Gemini Live
    const plusBtn = page.getByTestId('whatsapp-plus-btn');
    const micBtn = page.getByTestId('whatsapp-mic-btn');
    const geminiLiveBtn = page.getByTestId('gemini-live-btn');
    await expect(plusBtn).toBeVisible();
    await expect(micBtn).toBeVisible();
    await expect(geminiLiveBtn).toBeVisible();

    // 2. Click en (+) -> despliega menú flotante y muestra opción de Cámara
    await plusBtn.click();
    const cameraBtn = page.getByTestId('whatsapp-camera-btn');
    await expect(cameraBtn).toBeVisible();

    // 3. Click en cámara -> abre visor a pantalla completa y activa VisionScanner
    await cameraBtn.click();
    await expect(page.getByTestId('real-camera-viewfinder')).toBeVisible();
    await expect(page.locator('text=agent.use(VisionScanner())')).toBeVisible();

    // 4. Salir de cámara con el botón [X]
    const closeCamBtn = page.getByTestId('camera-close-btn');
    await closeCamBtn.click();
    await expect(page.getByTestId('real-camera-viewfinder')).not.toBeVisible();

    // 5. Click en micrófono -> transforma input a barra (+ | señal | STOP | flecha) de forma aislada sin activar el header
    await micBtn.click();
    await expect(page.getByTestId('audio-recording-input')).toBeVisible();
    await expect(page.getByTestId('audio-signal-wave')).toBeVisible();
    await expect(page.getByTestId('audio-stop-btn')).toBeVisible();
    await expect(page.getByTestId('audio-send-btn')).toBeVisible();
    // El header del editor NO debe activarse al grabar nota de voz local
    await expect(page.getByTestId('skill-toggle-audio')).not.toHaveClass(/text-emerald-400/);
  });

  test('debe capturar foto desde la cámara y desplegar la tarjeta de foto estilo WhatsApp en el chat', async ({ page }) => {
    // 1. Abrir menú (+) y presionar cámara
    const plusBtn = page.getByTestId('whatsapp-plus-btn');
    await plusBtn.click();
    const cameraBtn = page.getByTestId('whatsapp-camera-btn');
    await cameraBtn.click();

    // 2. Tomar foto con el obturador central
    const shutterBtn = page.getByTestId('camera-shutter-btn');
    await expect(shutterBtn).toBeVisible();
    await shutterBtn.click();

    // 3. El visor se cierra y la foto se despliega en el chat con la burbuja estilo WhatsApp
    await expect(page.getByTestId('real-camera-viewfinder')).not.toBeVisible();
    const photoMessage = page.getByTestId('whatsapp-photo-message');
    await expect(photoMessage).toBeVisible();
    await expect(page.locator('img[alt="Foto capturada"]')).toBeVisible();
  });

  test('debe desplegar el hero Mobile-Native AI Platform y las industrias (Edge, Sport, Funds)', async ({ page }) => {
    // 1. Verificar Hero Title
    const h1 = page.locator('h1');
    await expect(h1).toContainText('The Mobile-Native');
    await expect(h1).toContainText('AI Platform');

    // 2. Verificar las 3 industrias con sus etiquetas
    const pillarEdge = page.getByTestId('pillar-edge');
    const pillarSport = page.getByTestId('pillar-sport');
    const pillarVenture = page.getByTestId('pillar-venture');

    await expect(pillarEdge).toBeVisible();
    await expect(pillarEdge).toContainText('ZEA Edge');
    await expect(pillarEdge).toContainText('Industrial');

    await expect(pillarSport).toBeVisible();
    await expect(pillarSport).toContainText('ZEA Sport');
    await expect(pillarSport).toContainText('Athletic');

    await expect(pillarVenture).toBeVisible();
    await expect(pillarVenture).toContainText('ZEA Funds');
    await expect(pillarVenture).toContainText('Private Funds');

    // 3. Click en industria cambia selección y actualiza el teléfono
    await pillarEdge.click();
    await expect(pillarEdge.locator('span').first()).toHaveClass(/underline/);
    await expect(page.locator('text=Mixer #42').first()).toBeVisible();
    await expect(page.locator('text=ZEA Edge Agent').first()).toBeVisible();

    await pillarSport.click();
    await expect(pillarSport.locator('span').first()).toHaveClass(/underline/);
    await expect(page.locator('text=Hola, Gustavo')).toBeVisible();
    await expect(page.getByText('Próxima clase', { exact: true })).toBeVisible();
    await expect(page.locator('text=Felipe Soto').first()).toBeVisible();

    await pillarVenture.click();
    await expect(pillarVenture.locator('span').first()).toHaveClass(/underline/);
    await expect(page.locator('text=AUM consolidado: $14.85M USD')).toBeVisible();
    await expect(page.locator('text=agent.use(FundLedgerAudit)')).toBeVisible();
  });

  test('debe navegar fluidamente entre Products, Developer e Industries desde el menú superior', async ({ page }) => {
    const navProducts = page.getByTestId('nav-products');
    const navDeveloper = page.getByTestId('nav-developer');
    const navIndustries = page.getByTestId('nav-industries');

    // 1. Ir a Products -> Muestra el suite de productos
    await navProducts.click();
    await expect(navProducts).toHaveClass(/font-bold/);
    await expect(page.locator('text=Suite de Productos')).toBeVisible();

    // 2. Ir a Developer -> Muestra el editor de código y la arquitectura
    await navDeveloper.click();
    await expect(navDeveloper).toHaveClass(/font-bold/);
    await expect(page.locator('text=AgentRuntime.swift')).toBeVisible();

    // 3. Volver a Industries -> Muestra el titular principal y los 3 pilares
    await navIndustries.click();
    await expect(navIndustries).toHaveClass(/font-bold/);
    await expect(page.getByTestId('pillar-edge')).toBeVisible();
  });

  test('debe desplegar la interfaz nativa ZEA Sport (Gus Training) con anillos, agenda y alumnos al pulsar ZEA Sport', async ({ page }) => {
    const pillarSport = page.getByTestId('pillar-sport');
    await pillarSport.click();

    // 1. La pantalla nativa ZEA Sport debe estar visible
    const sportScreen = page.getByTestId('zea-sport-screen');
    await expect(sportScreen).toBeVisible();

    // 2. Tab 1: Resumen conversacional con Felipe Soto, Próxima clase y anillos Apple Fitness
    await expect(page.locator('text=Hola, Gustavo')).toBeVisible();
    await expect(page.locator('text=¿Qué tenemos para hoy?')).toBeVisible();
    await expect(page.locator('text=ZEA Coach Agent').first()).toBeVisible();

    const scrollBox = await page.locator('[data-testid="zea-sport-screen"] .overflow-y-auto').boundingBox();
    if (scrollBox) {
      await page.mouse.move(scrollBox.x + scrollBox.width / 2, scrollBox.y + scrollBox.height / 2);
      await page.mouse.wheel(0, 200);
      await page.waitForTimeout(100);
    }
    const afterWheelScrollTop = await page.evaluate(() => {
      const el = document.querySelector('[data-testid="zea-sport-screen"] .overflow-y-auto');
      return el ? el.scrollTop : 0;
    });
    expect(afterWheelScrollTop).toBeGreaterThan(0);

    await expect(page.locator('text=Felipe Soto').first()).toBeVisible();
    await expect(page.getByText('Próxima clase', { exact: true })).toBeVisible();
    await expect(page.getByText('Clases', { exact: true })).toBeVisible();
    await expect(page.locator('text=Ocupación')).toBeVisible();

    // 3. Cambiar a Tab Agenda
    await page.getByRole('button', { name: 'Agenda', exact: true }).click();
    await expect(page.locator('text=Octubre 2026')).toBeVisible();
    await expect(page.locator('text=Parque Araucano').first()).toBeVisible();

    // 4. Cambiar a Tab Alumnos
    await page.getByRole('button', { name: 'Alumnos', exact: true }).click();
    await expect(page.locator('text=28 activos')).toBeVisible();
    await expect(page.locator('text=Camila Alvarez')).toBeVisible();

    // 5. Cambiar a Tab Perfil
    await page.getByRole('button', { name: 'Perfil', exact: true }).click();
    await expect(page.locator('text=Gustavo Hinostroza')).toBeVisible();
    await expect(page.locator('text=Coach certificado ZEA')).toBeVisible();

    // 6. Volver a Resumen y alternar entre Modo App Clásica y Modo Chat AI
    await page.getByRole('button', { name: 'Resumen', exact: true }).click();
    const modeAppBtn = page.getByTestId('mode-app-btn').first();
    const modeChatBtn = page.getByTestId('mode-chat-btn').first();

    // Cambiar a Modo App clásica (sin burbuja de chat)
    await modeAppBtn.click();
    await expect(page.locator('text=¿Qué tenemos para hoy?')).not.toBeVisible();
    await expect(page.locator('text=Hola, Gustavo')).toBeVisible();
    await expect(page.getByText('Próxima clase', { exact: true })).toBeVisible();

    // Volver a Modo Chat AI (con burbuja de chat y asistente)
    await modeChatBtn.click();
    await expect(page.locator('text=¿Qué tenemos para hoy?')).toBeVisible();
    await expect(page.locator('text=ZEA Coach Agent').first()).toBeVisible();
  });

  test('debe desplegar la interfaz industrial ZEA Edge (estilo Caterpillar amarillo/negro) con telemetría, flota y switch SCADA/Chat', async ({ page }) => {
    const pillarEdge = page.getByTestId('pillar-edge');
    await pillarEdge.click();

    // 1. La pantalla nativa ZEA Edge debe estar visible
    const edgeScreen = page.getByTestId('zea-edge-screen');
    await expect(edgeScreen).toBeVisible();

    // 2. Tab 1: Operaciones con telemetría de Mixer #42 a 165°C y anillos industriales
    await expect(page.locator('text=ZEA Edge Agent').first()).toBeVisible();
    await expect(page.locator('text=165°C').first()).toBeVisible();
    await expect(page.locator('text=Mixer #42 · Planta Maipú').first()).toBeVisible();
    await expect(page.locator('text=Tonelaje Despachado')).toBeVisible();

    // 3. Cambiar a Tab Flota IoT
    await page.getByRole('button', { name: 'Flota IoT', exact: true }).click();
    await expect(page.locator('text=18 ACTIVOS')).toBeVisible();
    await expect(page.locator('text=Planta Maipú').first()).toBeVisible();

    // 4. Cambiar a Tab Cuadrillas
    await page.getByRole('button', { name: 'Cuadrillas', exact: true }).click();
    await expect(page.locator('text=Cuadrilla Alpha (Pavimentación)')).toBeVisible();

    // 5. Cambiar a Tab Planta
    await page.getByRole('button', { name: 'Planta', exact: true }).click();
    await expect(page.locator('text=Silo de Asfalto #1 (AC-20)')).toBeVisible();

    // 6. Volver a Operaciones y alternar entre Modo SCADA clásica y Modo Chat AI
    await page.getByRole('button', { name: 'Operaciones', exact: true }).click();
    const modeAppBtn = page.getByTestId('mode-app-btn').first();
    const modeChatBtn = page.getByTestId('mode-chat-btn').first();

    // Cambiar a SCADA clásica
    await modeAppBtn.click();
    await expect(page.locator('text=Panel de Despacho')).toBeVisible();
    await expect(page.locator('text=165°C').first()).toBeVisible();

    // Volver a Chat AI
    await modeChatBtn.click();
    await expect(page.locator('text=ZEA Edge Agent').first()).toBeVisible();
  });
});
