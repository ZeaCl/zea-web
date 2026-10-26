import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/svelte';
import MobileSimulator from './MobileSimulator.svelte';

describe('MobileSimulator component', () => {
  it('debe renderizar el simulador móvil según la plataforma seleccionada', () => {
    const { rerender } = render(MobileSimulator, { props: { lang: 'es', platform: 'ios' } });

    expect(screen.getByTestId('mobile-simulator')).toBeInTheDocument();
    expect(screen.getByText('iOS Client')).toBeInTheDocument();

    rerender({ lang: 'es', platform: 'android' });
    expect(screen.getByText('Android Client')).toBeInTheDocument();
  });

  it('debe permitir enviar un mensaje y recibir respuesta simulada del agente', async () => {
    render(MobileSimulator, { props: { lang: 'es', platform: 'ios' } });

    const input = screen.getByPlaceholderText(/Pregunta sobre el SDK móvil/);
    await fireEvent.input(input, { target: { value: '¿Cómo funciona en iOS?' } });

    const form = input.closest('form')!;
    await fireEvent.submit(form);

    expect(screen.getByText('¿Cómo funciona en iOS?')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText(/En Swift solo necesitas instanciar/)).toBeInTheDocument();
    }, { timeout: 2000 });
  });

  it('debe activar el visor de cámara en vivo puro y minimalista cuando vision está activo', () => {
    render(MobileSimulator, {
      props: {
        lang: 'es',
        platform: 'ios',
        skills: { audio: false, vision: true, security: false }
      }
    });

    expect(screen.getByTestId('real-camera-viewfinder')).toBeInTheDocument();
  });

  it('debe transformar los componentes inferiores estilo WhatsApp cuando audio está activo (+ | señal | STOP | flecha)', () => {
    render(MobileSimulator, {
      props: {
        lang: 'es',
        platform: 'ios',
        skills: { audio: true, vision: false, security: false }
      }
    });

    expect(screen.getByTestId('audio-recording-input')).toBeInTheDocument();
    expect(screen.getByTestId('audio-signal-wave')).toBeInTheDocument();
    expect(screen.getByTestId('audio-stop-btn')).toBeInTheDocument();
    expect(screen.getByTestId('audio-send-btn')).toBeInTheDocument();
  });

  it('debe renderizar (+), micrófono y botón Gemini Live en reposo, y abrir cámara desde (+)', async () => {
    render(MobileSimulator, {
      props: {
        lang: 'es',
        platform: 'ios',
        skills: { audio: false, vision: false, security: false }
      }
    });

    const plusBtn = screen.getByTestId('whatsapp-plus-btn');
    expect(plusBtn).toBeInTheDocument();
    expect(screen.getByTestId('whatsapp-mic-btn')).toBeInTheDocument();
    expect(screen.getByTestId('gemini-live-btn')).toBeInTheDocument();

    // Click en (+) abre el menú con la Cámara
    await fireEvent.click(plusBtn);
    expect(screen.getByTestId('whatsapp-camera-btn')).toBeInTheDocument();
  });

  it('debe permitir enviar una nota de voz y mostrar la burbuja de audio con botón play', async () => {
    render(MobileSimulator, {
      props: {
        lang: 'es',
        platform: 'ios',
        skills: { audio: true, vision: false, security: false }
      }
    });

    const sendBtn = screen.getByTestId('audio-send-btn');
    await fireEvent.click(sendBtn);

    // Debe aparecer el reproductor de nota de voz con botón play
    await waitFor(() => {
      expect(screen.getByLabelText('Reproducir nota de voz')).toBeInTheDocument();
      expect(screen.getByText('✓✓')).toBeInTheDocument();
    });
  });

  it('debe capturar una foto con el obturador y mostrarla en el chat estilo WhatsApp', async () => {
    render(MobileSimulator, {
      props: {
        lang: 'es',
        platform: 'ios',
        skills: { audio: false, vision: true, security: false }
      }
    });

    const shutterBtn = screen.getByTestId('camera-shutter-btn');
    await fireEvent.click(shutterBtn);

    // La foto debe desplegarse en el chat en una tarjeta estilo WhatsApp
    await waitFor(() => {
      expect(screen.getByTestId('whatsapp-photo-message')).toBeInTheDocument();
      expect(screen.getByAltText('Foto capturada')).toBeInTheDocument();
    });
  });

  it('debe abrir la pantalla completa (100% screen con fondo bg-black) al hacer click en el menú superior izquierdo con Nueva sesión, Configuración, Sesiones y Usuario logeado', async () => {
    render(MobileSimulator, {
      props: {
        lang: 'es',
        platform: 'ios',
        skills: { audio: false, vision: false, security: false }
      }
    });

    const menuBtn = screen.getByTestId('header-menu-btn');
    expect(menuBtn).toBeInTheDocument();

    // 1. Click en menú -> Despliega la pantalla completa al 100%
    await fireEvent.click(menuBtn);
    expect(screen.getByTestId('menu-full-screen')).toBeInTheDocument();
    expect(screen.getByText('Nueva sesión')).toBeInTheDocument();
    expect(screen.getByText('Configuración')).toBeInTheDocument();
    expect(screen.getByText('Sesiones')).toBeInTheDocument();
    expect(screen.getByText('Dev User')).toBeInTheDocument();
    expect(screen.getByTestId('user-settings-btn')).toBeInTheDocument();

    // 2. Click en botón cerrar [X] -> Regresa al chat
    const closeBtn = screen.getByTestId('menu-close-btn');
    await fireEvent.click(closeBtn);
    expect(screen.queryByTestId('menu-full-screen')).not.toBeInTheDocument();
  });
});
