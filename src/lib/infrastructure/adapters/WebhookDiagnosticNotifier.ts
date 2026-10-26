import type { LeadDiagnostic } from '../../domain/entities/LeadDiagnostic';
import type { DiagnosticNotifier, DiagnosticNotifierResult } from '../../domain/ports/DiagnosticNotifier';

export class WebhookDiagnosticNotifier implements DiagnosticNotifier {
  constructor(private readonly webhookUrl?: string) {}

  async notify(lead: LeadDiagnostic): Promise<DiagnosticNotifierResult> {
    if (!this.webhookUrl) {
      // In local/preview mode without webhook, log and gracefully succeed
      console.log('[DiagnosticNotifier] Lead recorded locally:', lead.toJSON());
      return {
        success: true,
        messageId: `local_${lead.id}`
      };
    }

    try {
      const response = await fetch(this.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          source: 'zea.cl-b2b',
          timestamp: new Date().toISOString(),
          lead: lead.toJSON()
        })
      });

      if (!response.ok) {
        return {
          success: false,
          error: `Error HTTP en webhook de notificación: ${response.status}`
        };
      }

      return {
        success: true,
        messageId: `wh_${Date.now()}`
      };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Fallo de conexión';
      return {
        success: false,
        error: message
      };
    }
  }
}
