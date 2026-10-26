import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/svelte';
import CodeEditorSnippet from './CodeEditorSnippet.svelte';

describe('CodeEditorSnippet component', () => {
  it('debe renderizar código Swift cuando la plataforma es ios', () => {
    const onToggleSkill = vi.fn();
    render(CodeEditorSnippet, {
      props: {
        platform: 'ios',
        skills: { audio: false, vision: false, security: false },
        onToggleSkill
      }
    });

    expect(screen.getByText('AgentRuntime.swift')).toBeInTheDocument();
    expect(screen.getByText('GliaMobileSDK')).toBeInTheDocument();
    expect(screen.getByTestId('skill-toggle-audio')).toBeInTheDocument();
    expect(screen.getByTestId('skill-toggle-vision')).toBeInTheDocument();
    expect(screen.getByTestId('skill-toggle-security')).toBeInTheDocument();
  });

  it('debe renderizar código Kotlin cuando la plataforma es android', () => {
    const onToggleSkill = vi.fn();
    render(CodeEditorSnippet, {
      props: {
        platform: 'android',
        skills: { audio: false, vision: false, security: false },
        onToggleSkill
      }
    });

    expect(screen.getByText('AgentRuntime.kt')).toBeInTheDocument();
    expect(screen.getByText('cl.zea.glia.GliaAgent')).toBeInTheDocument();
  });

  it('debe invocar onToggleSkill al hacer click en los iconos minimalistas sin texto', async () => {
    const onToggleSkill = vi.fn();
    render(CodeEditorSnippet, {
      props: {
        platform: 'ios',
        skills: { audio: false, vision: false, security: false },
        onToggleSkill
      }
    });

    const audioBtn = screen.getByTestId('skill-toggle-audio');
    const visionBtn = screen.getByTestId('skill-toggle-vision');
    const securityBtn = screen.getByTestId('skill-toggle-security');

    await fireEvent.click(audioBtn);
    expect(onToggleSkill).toHaveBeenCalledWith('audio');

    await fireEvent.click(visionBtn);
    expect(onToggleSkill).toHaveBeenCalledWith('vision');

    await fireEvent.click(securityBtn);
    expect(onToggleSkill).toHaveBeenCalledWith('security');
  });

  it('debe iluminar el código y el icono cuando un superpoder está activo', () => {
    const onToggleSkill = vi.fn();
    const { container } = render(CodeEditorSnippet, {
      props: {
        platform: 'ios',
        skills: { audio: true, vision: false, security: false },
        onToggleSkill
      }
    });

    const audioBtn = screen.getByTestId('skill-toggle-audio');
    expect(audioBtn.className).toContain('text-emerald-400');

    expect(container.textContent).toContain('LiveAudioStream');
  });
});
