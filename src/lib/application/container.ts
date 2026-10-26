import { WebhookDiagnosticNotifier } from '../infrastructure/adapters/WebhookDiagnosticNotifier';
import { SubmitDiagnosticUseCase } from './use-cases/SubmitDiagnosticUseCase';

class ApplicationContainer {
  private _submitDiagnosticUseCase?: SubmitDiagnosticUseCase;

  get submitDiagnosticUseCase(): SubmitDiagnosticUseCase {
    if (!this._submitDiagnosticUseCase) {
      const webhookUrl = typeof process !== 'undefined' ? process.env?.DIAGNOSTIC_WEBHOOK_URL : undefined;
      const notifier = new WebhookDiagnosticNotifier(webhookUrl);
      this._submitDiagnosticUseCase = new SubmitDiagnosticUseCase(notifier);
    }
    return this._submitDiagnosticUseCase;
  }
}

export const container = new ApplicationContainer();
