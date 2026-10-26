export interface VerticalFeature {
  title: string;
  description: string;
}

export interface VerticalCaseProps {
  id: string;
  category: 'legal' | 'finance' | 'industrial';
  title: string;
  client: string;
  description: string;
  features: VerticalFeature[];
  primaryMetric: {
    value: string;
    label: string;
  };
  tags: string[];
}

export class VerticalCase {
  constructor(readonly props: VerticalCaseProps) {}

  get id(): string {
    return this.props.id;
  }

  get category(): string {
    return this.props.category;
  }

  get client(): string {
    return this.props.client;
  }
}
