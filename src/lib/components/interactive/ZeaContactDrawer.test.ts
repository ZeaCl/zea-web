import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/svelte';
import ZeaContactDrawer from './ZeaContactDrawer.svelte';

describe('ZeaContactDrawer component', () => {
  it('no debe renderizarse si isOpen es false', () => {
    const onClose = vi.fn();
    render(ZeaContactDrawer, {
      props: {
        isOpen: false,
        lang: 'es',
        onClose
      }
    });

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('debe renderizarse cuando isOpen es true con el estilo Palantir y los campos requeridos', () => {
    const onClose = vi.fn();
    render(ZeaContactDrawer, {
      props: {
        isOpen: true,
        lang: 'es',
        onClose
      }
    });

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('¿Interesado en resolver tus operaciones críticas?')).toBeInTheDocument();
    expect(screen.getByTestId('contact-submit-btn')).toBeInTheDocument();
  });

  it('debe llamar a onClose cuando se hace click en el botón de cerrar', async () => {
    const onClose = vi.fn();
    render(ZeaContactDrawer, {
      props: {
        isOpen: true,
        lang: 'es',
        onClose
      }
    });

    const closeBtn = screen.getByLabelText('Cerrar');
    await fireEvent.click(closeBtn);
    expect(onClose).toHaveBeenCalled();
  });
});
