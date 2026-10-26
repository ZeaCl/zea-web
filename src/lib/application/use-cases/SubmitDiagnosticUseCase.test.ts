import { describe, it, expect, vi } from 'vitest';
import { SubmitDiagnosticUseCase } from './SubmitDiagnosticUseCase';
import type { DiagnosticNotifier } from '../../domain/ports/DiagnosticNotifier';

describe('SubmitDiagnosticUseCase', () => {
  const mockNotifier: DiagnosticNotifier = {
    notify: vi.fn().mockResolvedValue({ success: true, messageId: 'msg_123' })
  };

  it('debe procesar un lead corporativo válido correctamente', async () => {
    const useCase = new SubmitDiagnosticUseCase(mockNotifier);
    const result = await useCase.execute({
      name: 'Carlos Valenzuela',
      email: 'carlos@empresa.com',
      company: 'Constructora Austral',
      role: 'Gerente de Operaciones',
      vertical: 'industrial',
      challenge: 'Necesitamos automatizar la trazabilidad de asfalto en faenas viales.'
    });

    expect(result.success).toBe(true);
    expect(result.leadId).toBeDefined();
    expect(mockNotifier.notify).toHaveBeenCalledTimes(1);
  });

  it('debe rechazar solicitudes con correo inválido o campos faltantes', async () => {
    const useCase = new SubmitDiagnosticUseCase(mockNotifier);
    const result = await useCase.execute({
      name: '',
      email: 'correo-invalido',
      company: '',
      role: '',
      vertical: 'legal',
      challenge: 'Corto'
    });

    expect(result.success).toBe(false);
    expect(result.errors).toBeDefined();
    expect(result.errors?.length).toBeGreaterThanOrEqual(4);
  });

  it('debe manejar errores del servicio de notificación', async () => {
    const failingNotifier: DiagnosticNotifier = {
      notify: vi.fn().mockResolvedValue({ success: false, error: 'Webhook timeout' })
    };
    const useCase = new SubmitDiagnosticUseCase(failingNotifier);
    const result = await useCase.execute({
      name: 'Elena Rostova',
      email: 'elena@fund.com',
      company: 'Austral Asset Management',
      role: 'General Partner',
      vertical: 'finance',
      challenge: 'Conciliación de AUM trimestral y distribución de waterfall automatizada.'
    });

    expect(result.success).toBe(false);
    expect(result.errors).toContain('Webhook timeout');
  });
});
