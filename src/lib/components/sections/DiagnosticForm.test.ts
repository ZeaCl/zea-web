import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/svelte';
import DiagnosticForm from './DiagnosticForm.svelte';

describe('DiagnosticForm component', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('debe renderizar todos los campos requeridos del formulario', () => {
    render(DiagnosticForm, { props: { lang: 'es' } });

    expect(screen.getByLabelText(/Nombre y Apellidos/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Correo Corporativo/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Empresa \/ Institución/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Cargo \/ Rol/)).toBeInTheDocument();
    expect(screen.getByLabelText(/desafío u operación crítica/)).toBeInTheDocument();
  });

  it('debe mostrar error si se intenta enviar con correo inválido', async () => {
    render(DiagnosticForm, { props: { lang: 'es' } });

    const nameInput = screen.getByLabelText(/Nombre y Apellidos/);
    const emailInput = screen.getByLabelText(/Correo Corporativo/);
    const form = screen.getByTestId('diagnostic-form');

    await fireEvent.input(nameInput, { target: { value: 'Carlos Valenzuela' } });
    await fireEvent.input(emailInput, { target: { value: 'correo-sin-arroba' } });
    await fireEvent.submit(form);

    expect(screen.getByText(/correo electrónico corporativo válido/)).toBeInTheDocument();
  });

  it('debe enviar el formulario con éxito y mostrar la pantalla de confirmación', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, leadId: 'lead_test_99' })
    }) as unknown as typeof fetch;

    render(DiagnosticForm, { props: { lang: 'es' } });

    await fireEvent.input(screen.getByLabelText(/Nombre y Apellidos/), { target: { value: 'Carlos Valenzuela' } });
    await fireEvent.input(screen.getByLabelText(/Correo Corporativo/), { target: { value: 'carlos@empresa.com' } });
    await fireEvent.input(screen.getByLabelText(/Empresa \/ Institución/), { target: { value: 'Constructora Austral' } });
    await fireEvent.input(screen.getByLabelText(/Cargo \/ Rol/), { target: { value: 'Gerente General' } });
    await fireEvent.input(screen.getByLabelText(/desafío u operación crítica/), { target: { value: 'Necesitamos auditar contratos de infraestructura y plazos de entrega.' } });

    const form = screen.getByTestId('diagnostic-form');
    await fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.getByTestId('diagnostic-success')).toBeInTheDocument();
      expect(screen.getByText(/lead_test_99/)).toBeInTheDocument();
    });
  });
});
