export type IndustryVertical = 'legal' | 'finance' | 'industrial' | 'other';

export interface LeadDiagnosticProps {
  id?: string;
  name: string;
  email: string;
  company: string;
  role: string;
  vertical: IndustryVertical;
  challenge: string;
  createdAt?: string;
}

export class LeadDiagnostic {
  readonly id: string;
  readonly name: string;
  readonly email: string;
  readonly company: string;
  readonly role: string;
  readonly vertical: IndustryVertical;
  readonly challenge: string;
  readonly createdAt: string;

  private constructor(props: Required<LeadDiagnosticProps>) {
    this.id = props.id;
    this.name = props.name;
    this.email = props.email;
    this.company = props.company;
    this.role = props.role;
    this.vertical = props.vertical;
    this.challenge = props.challenge;
    this.createdAt = props.createdAt;
  }

  static create(props: LeadDiagnosticProps): { success: true; lead: LeadDiagnostic } | { success: false; errors: string[] } {
    const errors: string[] = [];

    if (!props.name || props.name.trim().length < 2) {
      errors.push('El nombre debe tener al menos 2 caracteres.');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!props.email || !emailRegex.test(props.email.trim())) {
      errors.push('Debe proporcionar un correo electrónico corporativo válido.');
    }

    if (!props.company || props.company.trim().length < 2) {
      errors.push('El nombre de la empresa es obligatorio.');
    }

    if (!props.role || props.role.trim().length < 2) {
      errors.push('El cargo o rol es obligatorio.');
    }

    if (!['legal', 'finance', 'industrial', 'other'].includes(props.vertical)) {
      errors.push('Vertical no soportada.');
    }

    if (!props.challenge || props.challenge.trim().length < 10) {
      errors.push('Por favor describe tu desafío u operación en al menos 10 caracteres.');
    }

    if (errors.length > 0) {
      return { success: false, errors };
    }

    const lead = new LeadDiagnostic({
      id: props.id || `lead_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name: props.name.trim(),
      email: props.email.trim().toLowerCase(),
      company: props.company.trim(),
      role: props.role.trim(),
      vertical: props.vertical,
      challenge: props.challenge.trim(),
      createdAt: props.createdAt || new Date().toISOString()
    });

    return { success: true, lead };
  }

  toJSON(): Required<LeadDiagnosticProps> {
    return {
      id: this.id,
      name: this.name,
      email: this.email,
      company: this.company,
      role: this.role,
      vertical: this.vertical,
      challenge: this.challenge,
      createdAt: this.createdAt
    };
  }
}
