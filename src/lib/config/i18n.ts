export type Language = 'es' | 'en';

export interface I18nContent {
  meta: {
    title: string;
    description: string;
  };
  nav: {
    solutions: string;
    cases: string;
    legal: string;
    finance: string;
    industrial: string;
    diagnostic: string;
    mobileRuntime: string;
    ctaButton: string;
  };
  hero: {
    titlePrefix: string;
    titleHighlight: string;
    titleSuffix: string;
    subtitle: string;
    ctaPrimary: string;
    ctaSecondary: string;
    metric1Val: string;
    metric1Label: string;
    metric2Val: string;
    metric2Label: string;
    metric3Val: string;
    metric3Label: string;
    liveAuditTitle: string;
    liveAuditStatus: string;
    liveContractName: string;
    liveAgentThinking: string;
    liveAgentOutput: string;
  };
  verticals: {
    sectionTag: string;
    sectionTitle: string;
    sectionTitleHighlight: string;
    sectionSubtitle: string;
    legal: {
      tag: string;
      title: string;
      industry: string;
      summary: string;
      feature1Title: string;
      feature1Desc: string;
      feature2Title: string;
      feature2Desc: string;
      feature3Title: string;
      feature3Desc: string;
      metricStat: string;
      metricLabel: string;
    };
    finance: {
      tag: string;
      title: string;
      industry: string;
      summary: string;
      feature1Title: string;
      feature1Desc: string;
      feature2Title: string;
      feature2Desc: string;
      feature3Title: string;
      feature3Desc: string;
      metricStat: string;
      metricLabel: string;
    };
    industrial: {
      tag: string;
      title: string;
      industry: string;
      summary: string;
      feature1Title: string;
      feature1Desc: string;
      feature2Title: string;
      feature2Desc: string;
      feature3Title: string;
      feature3Desc: string;
      metricStat: string;
      metricLabel: string;
    };
  };
  form: {
    tag: string;
    title: string;
    titleHighlight: string;
    subtitle: string;
    nameLabel: string;
    namePlaceholder: string;
    emailLabel: string;
    emailPlaceholder: string;
    companyLabel: string;
    companyPlaceholder: string;
    roleLabel: string;
    rolePlaceholder: string;
    verticalLabel: string;
    verticalOptionLegal: string;
    verticalOptionFinance: string;
    verticalOptionIndustrial: string;
    verticalOptionOther: string;
    challengeLabel: string;
    challengePlaceholder: string;
    submitButton: string;
    submittingButton: string;
    successTitle: string;
    successMessage: string;
    resetButton: string;
    errorRequired: string;
    errorEmailInvalid: string;
  };
  gliaBridge: {
    tag: string;
    title: string;
    titleHighlight: string;
    desc: string;
    badgeSwift: string;
    badgeKotlin: string;
    cta: string;
    caseStudyTag: string;
    caseStudyName: string;
  };
  footer: {
    rights: string;
    tagline: string;
    privacy: string;
    terms: string;
    trustCenter: string;
    contact: string;
  };
}

export const content: Record<Language, I18nContent> = {
  es: {
    meta: {
      title: 'ZEA — Inteligencia Artificial Agéntica para Operaciones de Misión Crítica',
      description: 'Llevamos la IA del prototipo al núcleo de tu operación. Agentes autónomos y deterministas para Concesiones Legales, Fondos Financieros e Infraestructura Industrial.'
    },
    nav: {
      solutions: 'Soluciones',
      cases: 'Industrias',
      legal: 'Legal & Concesiones',
      finance: 'Finanzas & Fondos',
      industrial: 'Faenas & Construcción',
      diagnostic: 'Diagnóstico B2B',
      mobileRuntime: 'Glia Mobile SDK',
      ctaButton: 'Agendar Auditoría'
    },
    hero: {
      titlePrefix: 'Inteligencia Artificial Agéntica para ',
      titleHighlight: 'Operaciones de Misión Crítica',
      titleSuffix: '',
      subtitle: 'Llevamos la IA del prototipo al núcleo operacional de tu compañía. Agentes autónomos y deterministas que auditan contratos complejos, concilian fondos millonarios y supervisan faenas en terreno.',
      ctaPrimary: 'Solicitar Diagnóstico Agéntico',
      ctaSecondary: 'Ver Soluciones por Industria',
      metric1Val: '+2.600',
      metric1Label: 'Cláusulas Legales Auditadas',
      metric2Val: '456',
      metric2Label: 'Dependencias de Ruta Crítica (Gantt)',
      metric3Val: '$0 Descuadre',
      metric3Label: 'Conciliación Determinista de AUM',
      liveAuditTitle: 'Terminal Agéntico ZEA · Auditoría en Vivo',
      liveAuditStatus: 'MONITORIZANDO CONTRATOS DE CONCESIÓN',
      liveContractName: 'Bases_Licitacion_Concesion_Infraestructura_TomoIV.pdf',
      liveAgentThinking: 'Analizando cláusula 14.3.2 sobre penalidades por atraso en fundaciones estructurales...',
      liveAgentOutput: 'Alerta de Compliance: Requiere ensayo de probetas a 28 días antes de izaje de vigas. Gantt recalculada (-3 días de holgura).'
    },
    verticals: {
      sectionTag: 'INDUSTRIAS DE ALTA COMPLEJIDAD',
      sectionTitle: 'Diseñado para sectores donde el ',
      sectionTitleHighlight: 'error no es una opción',
      sectionSubtitle: 'Nuestros agentes operan bajo arquitectura determinista, trazabilidad auditable y control riguroso de contexto legal, financiero e industrial.',
      legal: {
        tag: 'LEGAL & CONCESIONES DE INFRAESTRUCTURA',
        title: 'Auditoría Contractual Continua y Generación de Gantt',
        industry: 'Sector: Grandes Concesiones de Infraestructura, Obras Públicas y Contratos EPC',
        summary: 'Procesamiento de miles de páginas de bases de licitación, resoluciones y adendas contractuales. Extracción automática de matriz de riesgos, multas y generación de Carta Gantt con ruta crítica algorítmica.',
        feature1Title: 'Extracción Semántica PDF',
        feature1Desc: 'Interpreta anexos técnicos, tablas de multas y plazos fatales con citas exactas a fojas.',
        feature2Title: 'Ruta Crítica Algorítmica',
        feature2Desc: 'Construye grafos de dependencias cruzadas (456 hitos) actualizados en tiempo real.',
        feature3Title: 'Alertas Preventivas de Incumplimiento',
        feature3Desc: 'Notificaciones a directores de proyecto antes de vencimientos de boletas de garantía.',
        metricStat: '10x',
        metricLabel: 'Más rápido en detección de contingencias'
      },
      finance: {
        tag: 'FINANZAS & GESTIÓN DE FONDOS',
        title: 'Conciliación Contable y Balance Determinista de AUM',
        industry: 'Sector: Fondos de Inversión Privados, Private Equity & Asset Management',
        summary: 'Automatización integral de llamados de capital, distribución de dividendos, balance de carteras de inversión y reportería determinista para Limited Partners (LPs) y General Partners (GPs).',
        feature1Title: 'Motor Contable Cero-Alucinación',
        feature1Desc: 'Cálculos matemáticos deterministas certificados en libros mayores.',
        feature2Title: 'Llamados de Capital & Waterfall',
        feature2Desc: 'Distribución algorítmica de retornos respetando estructuras de carry e inversión preferente.',
        feature3Title: 'Reportes Automatizados para LPs',
        feature3Desc: 'Generación instantánea de cartas trimestrales y balances auditables.',
        metricStat: '100%',
        metricLabel: 'Trazabilidad y conciliación de saldos'
      },
      industrial: {
        tag: 'CONSTRUCCIÓN & FAENAS INDUSTRIALES',
        title: 'Control de Faenas en Terreno y Trazabilidad Operacional',
        industry: 'Sector: Faenas Industriales, Plantas de Asfalto & Construcción Pesada',
        summary: 'Supervisión en tiempo real de despachos, colocación de mezclas térmicas, temperaturas de compactación y verificación georreferenciada del avance físico de obras.',
        feature1Title: 'Trazabilidad de Cargas Térmicas',
        feature1Desc: 'Control de temperatura de mezclas desde planta dosificadora hasta colocación en terreno.',
        feature2Title: 'Validación de Cubicaciones',
        feature2Desc: 'Cruce automático de pesajes en báscula versus metros cuadrados efectivamente extendidos.',
        feature3Title: 'Bitácora Digital de Operaciones',
        feature3Desc: 'Registro inmutable de rendimientos diarios, maquinaria activa e incidentes de obra.',
        metricStat: '-35%',
        metricLabel: 'Reducción en mermas y retrabajos en ruta'
      }
    },
    form: {
      tag: 'DIAGNÓSTICO EJECUTIVO',
      title: 'Evalúa la viabilidad agéntica en tu ',
      titleHighlight: 'operación corporativa',
      subtitle: 'Nuestros ingenieros de soluciones analizarán tus procesos críticos para entregarte un informe de factibilidad técnica, ROI estimado y arquitectura recomendada.',
      nameLabel: 'Nombre y Apellidos',
      namePlaceholder: 'Ej: Carlos Valenzuela',
      emailLabel: 'Correo Corporativo',
      emailPlaceholder: 'carlos@tuempresa.com',
      companyLabel: 'Empresa / Institución',
      companyPlaceholder: 'Ej: Constructora Andina S.A.',
      roleLabel: 'Cargo / Rol',
      rolePlaceholder: 'Ej: Gerente de Operaciones / Director Legal',
      verticalLabel: 'Industria de Interés',
      verticalOptionLegal: 'Legal, Contratos & Concesiones de Infraestructura',
      verticalOptionFinance: 'Finanzas, AUM & Fondos de Inversión',
      verticalOptionIndustrial: 'Construcción, Faenas & Logística Industrial',
      verticalOptionOther: 'Otra Operación de Misión Crítica',
      challengeLabel: 'Describe brevemente el desafío u operación crítica',
      challengePlaceholder: 'Ej: Necesitamos automatizar el control de 15 contratos de concesión y evitar multas por plazos de entrega...',
      submitButton: 'Solicitar Auditoría y Diagnóstico',
      submittingButton: 'Procesando Solicitud...',
      successTitle: '¡Solicitud de Diagnóstico Recibida!',
      successMessage: 'Un director técnico de ZEA revisará tus antecedentes y te contactará en menos de 24 horas hábiles.',
      resetButton: 'Enviar otra consulta',
      errorRequired: 'Este campo es obligatorio.',
      errorEmailInvalid: 'Por favor ingresa un correo electrónico corporativo válido.'
    },
    gliaBridge: {
      tag: 'ZEA DEV ECOSYSTEM',
      title: '¿Construyes aplicaciones móviles?',
      titleHighlight: 'Conoce Glia SDK',
      desc: 'El runtime nativo en Swift y Kotlin para integrar agentes autónomos directamente en iOS y Android con streaming reactivo de acciones y cero servidores intermedios.',
      badgeSwift: 'Swift 6 & SwiftUI',
      badgeKotlin: 'Kotlin 2 & Compose',
      cta: 'Explorar Glia en glia.zea.cl →',
      caseStudyTag: 'ARQUITECTURA NATIVA EN PRODUCCIÓN',
      caseStudyName: 'Computer Vision, Voice & Edge AI Runtime'
    },
    footer: {
      rights: '© 2026 ZEA Platform. Todos los derechos reservados.',
      tagline: 'Inteligencia Artificial Agéntica para Operaciones de Misión Crítica.',
      privacy: 'Privacidad',
      terms: 'Términos de Servicio',
      trustCenter: 'Centro de Confianza & Seguridad',
      contact: 'Contacto Comercial'
    }
  },
  en: {
    meta: {
      title: 'ZEA — Agentic Artificial Intelligence for Mission-Critical Operations',
      description: 'Taking AI from prototype to the core of your enterprise operations. Autonomous and deterministic agents for Legal Concessions, Investment Funds, and Industrial Infrastructure.'
    },
    nav: {
      solutions: 'Solutions',
      cases: 'Industries',
      legal: 'Legal & Concessions',
      finance: 'Finance & Funds',
      industrial: 'Industrial & Heavy Work',
      diagnostic: 'B2B Diagnostic',
      mobileRuntime: 'Glia Mobile SDK',
      ctaButton: 'Book an Audit'
    },
    hero: {
      titlePrefix: 'Agentic AI for ',
      titleHighlight: 'Mission-Critical Operations',
      titleSuffix: '',
      subtitle: 'Moving AI from prototypes directly into operational cores. Autonomous, deterministic agents auditing complex contracts, reconciling multi-million funds, and supervising field operations.',
      ctaPrimary: 'Request Agentic Diagnostic',
      ctaSecondary: 'Explore Industry Solutions',
      metric1Val: '+2,600',
      metric1Label: 'Audited Legal Clauses',
      metric2Val: '456',
      metric2Label: 'Critical Path Dependencies (Gantt)',
      metric3Val: '$0 Discrepancy',
      metric3Label: 'Deterministic AUM Reconciliation',
      liveAuditTitle: 'ZEA Agentic Terminal · Live Audit Stream',
      liveAuditStatus: 'MONITORING INFRASTRUCTURE CONCESSION AGREEMENTS',
      liveContractName: 'Tender_Bidding_Rules_Infrastructure_Vol_IV.pdf',
      liveAgentThinking: 'Analyzing clause 14.3.2 regarding structural foundation delay penalties...',
      liveAgentOutput: 'Compliance Alert: Requires 28-day cylinder compressive strength test prior to beam lifting. Critical path updated (-3 days slack).'
    },
    verticals: {
      sectionTag: 'HIGH-COMPLEXITY INDUSTRIES',
      sectionTitle: 'Engineered for sectors where ',
      sectionTitleHighlight: 'failure is not an option',
      sectionSubtitle: 'Our agents operate on deterministic architectures, immutable audit trails, and rigorous domain grounding.',
      legal: {
        tag: 'LEGAL & INFRASTRUCTURE CONCESSIONS',
        title: 'Continuous Contract Audit & Autonomous Gantt Generation',
        industry: 'Sector: Major Infrastructure Concessions, EPC Contracts & Public Tenders',
        summary: 'Ingestion of thousands of tender pages, regulatory decrees, and contract addenda. Automatic extraction of risk matrices, penalty clauses, and dynamic critical path calculation.',
        feature1Title: 'Semantic PDF Extraction',
        feature1Desc: 'Parses technical specifications and penalty schedules with pinpoint folio citations.',
        feature2Title: 'Algorithmic Critical Path',
        feature2Desc: 'Builds cross-dependency graphs (456 milestones) updated continuously.',
        feature3Title: 'Predictive Compliance Alerts',
        feature3Desc: 'Alerts project managers well ahead of performance bond expirations.',
        metricStat: '10x',
        metricLabel: 'Faster contingency detection'
      },
      finance: {
        tag: 'FINANCE & ASSET MANAGEMENT',
        title: 'Accounting Reconciliation & Deterministic AUM Calculation',
        industry: 'Sector: Private Investment Funds, Private Equity & Asset Management',
        summary: 'End-to-end automation of capital calls, distribution waterfalls, portfolio balance sheets, and deterministic reporting for Limited Partners (LPs) and General Partners (GPs).',
        feature1Title: 'Zero-Hallucination Accounting Engine',
        feature1Desc: 'Deterministic ledger calculations mathematically certified.',
        feature2Title: 'Capital Calls & Waterfalls',
        feature2Desc: 'Algorithmic distribution adhering to hurdle rates, catch-ups, and carried interest.',
        feature3Title: 'Automated LP Reporting',
        feature3Desc: 'Instant creation of auditable quarterly investor statements.',
        metricStat: '100%',
        metricLabel: 'Balance sheet reconciliation certainty'
      },
      industrial: {
        tag: 'CONSTRUCTION & INDUSTRIAL OPERATIONS',
        title: 'Field Operations Control & Operational Traceability',
        industry: 'Sector: Industrial Roadwork, Asphalt Batching & Heavy Construction',
        summary: 'Real-time telemetry and supervision of batch plant dispatch, mix placement temperatures, and geo-referenced verification of physical project completion.',
        feature1Title: 'Thermal Payload Traceability',
        feature1Desc: 'Monitors material temperatures from batching plant directly to field placement.',
        feature2Title: 'Volumetric Survey Cross-Check',
        feature2Desc: 'Automated weight scale reconciliation against surface area spread.',
        feature3Title: 'Digital Operations Log',
        feature3Desc: 'Immutable record of daily equipment utilization and field incidents.',
        metricStat: '-35%',
        metricLabel: 'Reduction in material waste and rework'
      }
    },
    form: {
      tag: 'EXECUTIVE DIAGNOSTIC',
      title: 'Assess agentic AI viability in your ',
      titleHighlight: 'enterprise operations',
      subtitle: 'Our solutions engineering team will analyze your critical workflows to deliver a technical feasibility evaluation, projected ROI, and target architecture.',
      nameLabel: 'Full Name',
      namePlaceholder: 'e.g., Charles Foster',
      emailLabel: 'Corporate Email',
      emailPlaceholder: 'charles@yourcompany.com',
      companyLabel: 'Company / Organization',
      companyPlaceholder: 'e.g., Pacific Infrastructure Group',
      roleLabel: 'Role / Title',
      rolePlaceholder: 'e.g., VP of Operations / General Counsel',
      verticalLabel: 'Industry Sector',
      verticalOptionLegal: 'Legal, Contracts & Infrastructure Concessions',
      verticalOptionFinance: 'Finance, AUM & Investment Funds',
      verticalOptionIndustrial: 'Construction, Field Operations & Logistics',
      verticalOptionOther: 'Other Mission-Critical Operation',
      challengeLabel: 'Briefly describe your operational bottleneck',
      challengePlaceholder: 'e.g., We need to audit 15 concession agreements and prevent contractual penalty deadlines...',
      submitButton: 'Request Diagnostic & Audit',
      submittingButton: 'Submitting Request...',
      successTitle: 'Diagnostic Request Received!',
      successMessage: 'A ZEA technical director will review your background and reach out within 24 business hours.',
      resetButton: 'Submit another inquiry',
      errorRequired: 'This field is required.',
      errorEmailInvalid: 'Please provide a valid corporate email address.'
    },
    gliaBridge: {
      tag: 'ZEA DEV ECOSYSTEM',
      title: 'Building mobile applications?',
      titleHighlight: 'Discover Glia SDK',
      desc: 'The native runtime in Swift and Kotlin to embed autonomous agents directly into iOS and Android apps with reactive action streaming and zero intermediary servers.',
      badgeSwift: 'Swift 6 & SwiftUI',
      badgeKotlin: 'Kotlin 2 & Compose',
      cta: 'Explore Glia at glia.zea.cl →',
      caseStudyTag: 'NATIVE RUNTIME IN PRODUCTION',
      caseStudyName: 'Computer Vision, Voice & Edge AI Runtime'
    },
    footer: {
      rights: '© 2026 ZEA Platform. All rights reserved.',
      tagline: 'Agentic AI for Mission-Critical Operations.',
      privacy: 'Privacy Policy',
      terms: 'Terms of Service',
      trustCenter: 'Trust & Security Center',
      contact: 'Commercial Inquiries'
    }
  }
};
