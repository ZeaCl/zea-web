import { LeadDiagnostic, type LeadDiagnosticProps } from '../../domain/entities/LeadDiagnostic';
import type { DiagnosticNotifier } from '../../domain/ports/DiagnosticNotifier';

export interface SubmitDiagnosticInput {
  name: string;
  email: string;
  company: string;
  role: string;
  vertical: LeadDiagnosticProps['vertical'];
  challenge: string;
}

export interface SubmitDiagnosticOutput {
  success: boolean;
  leadId?: string;
  errors?: string[];
}

export class SubmitDiagnosticUseCase {
  constructor(private readonly notifier: DiagnosticNotifier) {}

  async execute(input: SubmitDiagnosticInput): Promise<SubmitDiagnosticOutput> {
    const result = LeadDiagnostic.create(input);

    if (!result.success) {
      return {
        success: false,
        errors: result.errors
      };
    }

    const lead = result.lead;
    const notificationResult = await this.notifier.notify(lead);

    if (!notificationResult.success) {
      return {
        success: false,
        errors: [notificationResult.error || 'Error al procesar la notificación de auditoría.']
      };
    }

    return {
      success: true,
      leadId: lead.id
    };
  }
}
