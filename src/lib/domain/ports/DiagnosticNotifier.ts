import type { LeadDiagnostic } from '../entities/LeadDiagnostic';

export interface DiagnosticNotifierResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export interface DiagnosticNotifier {
  notify(lead: LeadDiagnostic): Promise<DiagnosticNotifierResult>;
}
