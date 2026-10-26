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

    // Inicialmente iOS: AgentRuntime.swift e iOS Client
    await expect(page.locator('text=AgentRuntime.swift')).toBeVisible();
    await expect(page.locator('text=iOS Client')).toBeVisible();

    // Click Android in header -> changes code to AgentRuntime.kt and phone to Android Client
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
});
