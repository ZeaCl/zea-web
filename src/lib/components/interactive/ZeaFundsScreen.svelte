<script lang="ts">
  import { fade } from 'svelte/transition';
  import { tick } from 'svelte';
  import { dragScroll } from '../ds/dragScroll';
  import ZeaModeToggle from '../ds/ZeaModeToggle.svelte';
  import ZeaSheet from '../ds/ZeaSheet.svelte';

  let {
    lang = 'es',
    platform = 'ios'
  }: {
    lang?: 'en' | 'es';
    platform?: 'ios' | 'android';
  } = $props();

  // Navigation tabs: Resumen, Llamados, Portafolio, Aportantes
  let activeTab = $state<'summary' | 'calls' | 'portfolio' | 'lps'>('summary');
  // Default mode is Chat
  let viewMode = $state<'chat' | 'app'>('chat');

  // Interactive state
  let toastMessage = $state<string | null>(null);
  let toastTimeout: any = null;

  // Actions states
  let callApprovalDone = $state(false);
  let callApprovalRejected = $state(false);
  let faceIdSigned = $state(false);

  // Time filters dropdown states
  let selectedRange = $state('6 months');
  let selectedYear = $state('2026');

  // Sheet modal state
  let sheetOpen = $state(false);
  let sheetData = $state<any>(null);

  // LP Search query
  let lpSearchQuery = $state('');

  function showToast(msg: string) {
    if (toastTimeout) clearTimeout(toastTimeout);
    toastMessage = msg;
    toastTimeout = setTimeout(() => {
      toastMessage = null;
    }, 2500);
  }

  function openItemDetails(item: any) {
    sheetData = item;
    sheetOpen = true;
  }

  function closeSheet() {
    sheetOpen = false;
  }

  function approveCapitalCall() {
    if (callApprovalDone) return;
    callApprovalDone = true;
    showToast(
      lang === 'en'
        ? 'Capital Call #4 authorized ($1,250,000 USD)'
        : 'Llamada de Capital #4 autorizada ($1,250,000 USD)'
    );
  }

  // =========================================================================
  // 1. DATA MODELS
  // =========================================================================
  // Exponential density curve bars (Harvey style)
  const densityBars = [
    8, 9, 10, 11, 12, 13, 14, 15, 17, 19, 21, 24, 27, 31, 36, 42, 49, 57, 66, 76, 88, 100
  ];

  // Grouped allocation bars
  const allocationGrouped = $derived([
    { name: lang === 'en' ? 'Infra' : 'Infra', current: 55, target: 60 },
    { name: lang === 'en' ? 'Real Assets' : 'Real Ast', current: 75, target: 80 },
    { name: lang === 'en' ? 'Scaleups' : 'Scaleups', current: 60, target: 50 },
    { name: lang === 'en' ? 'AgTech' : 'AgTech', current: 48, target: 65 },
    { name: lang === 'en' ? 'Energy' : 'Energía', current: 35, target: 45 },
    { name: lang === 'en' ? 'Dry Powder' : 'Liquidez', current: 25, target: 30 }
  ]);

  // Operational events
  const fundsTimeline = $derived([
    {
      id: '1',
      time: '09:30',
      title: lang === 'en' ? 'Custodian Bank Reconciliation' : 'Conciliación Banco Custodio',
      subtitle: lang === 'en' ? '100% matched vs Banco Custodio Central' : '100% de abonos cuadraron vs Banco Custodio Central',
      status: 'completed' as const
    },
    {
      id: '2',
      time: '11:00',
      title: lang === 'en' ? 'Investment Committee (Board)' : 'Comité de Inversiones (Directorio)',
      subtitle: lang === 'en' ? 'Evaluate follow-on series A for Company X ($450K)' : 'Evaluación desembolso Serie A Empresa X ($450K)',
      status: 'active' as const,
      onClick: () =>
        openItemDetails({
          avatarText: 'H2',
          title: lang === 'en' ? 'Investment Committee: Horizon II' : 'Comité de Inversiones: Horizon II',
          subtitle: lang === 'en' ? 'Fund II · Board Review' : 'Fondo II · Sesión de Directorio',
          progressLabel: lang === 'en' ? 'Capital deployed' : 'Capital desplegado',
          progressValueText: '$10.2M de $14.8M',
          progressPct: 69,
          stats: [
            { label: lang === 'en' ? 'Target IRR' : 'TIR Objetivo', value: '18.4%' },
            { label: lang === 'en' ? 'Vintage' : 'Añada', value: '2026' }
          ]
        })
    },
    {
      id: '3',
      time: '14:30',
      title: lang === 'en' ? 'Capital Call #4 Window Close' : 'Cierre Ventana Llamada #4',
      subtitle: lang === 'en' ? 'Horizon II · $1,250,000 USD · 88% received' : 'Horizon II · $1,250,000 USD · 88% recibido',
      status: 'active' as const,
      actionLabel: lang === 'en' ? 'Audit LPs' : 'Auditar LPs',
      onAction: () => {
        activeTab = 'lps';
        showToast(lang === 'en' ? 'Auditing 32 LPs...' : 'Auditando 32 Aportantes...');
      }
    },
    {
      id: '4',
      time: '16:00',
      title: lang === 'en' ? 'Ledger & APDP Sealing' : 'Sellado Ledger & Sello APDP',
      subtitle: lang === 'en' ? 'Law 21.719 immutable audit log on GCP' : 'Log inmutable Ley 21.719 en Google Cloud',
      status: 'available' as const,
      actionLabel: lang === 'en' ? 'Verify seal' : 'Verificar sello',
      onAction: () => showToast(lang === 'en' ? 'SHA-256 seal verified' : 'Sello SHA-256 verificado')
    }
  ]);

  // Capital calls list
  const capitalCallsList = $derived([
    {
      id: 'cc-4',
      fund: 'Fondo Horizon II',
      title: lang === 'en' ? 'Capital Call #4' : 'Llamada de Capital #4',
      amount: '$1,250,000 USD',
      status: 'active',
      badge: lang === 'en' ? 'Active · 88% received' : 'En curso · 88% recibido',
      dueDate: lang === 'en' ? 'Closes today at 14:30' : 'Cierra hoy a las 14:30',
      lpsReconciled: '30 / 32 LPs',
      bankStatus: 'Banco Custodio Central · 100% match'
    },
    {
      id: 'cc-3',
      fund: 'Fondo Horizon II',
      title: lang === 'en' ? 'Capital Call #3' : 'Llamada de Capital #3',
      amount: '$2,500,000 USD',
      status: 'completed',
      badge: lang === 'en' ? 'Completed 100%' : 'Completado 100%',
      dueDate: '15 Ene 2026',
      lpsReconciled: '32 / 32 LPs',
      bankStatus: 'Banco Custodio Central · Conciliado'
    },
    {
      id: 'cc-2',
      fund: 'Terra Infraestructura I',
      title: lang === 'en' ? 'Capital Call #2' : 'Llamada de Capital #2',
      amount: '$3,800,000 USD',
      status: 'completed',
      badge: lang === 'en' ? 'Completed 100%' : 'Completado 100%',
      dueDate: '20 Oct 2025',
      lpsReconciled: '24 / 24 LPs',
      bankStatus: 'Pacific Custody Bank · Conciliado'
    },
    {
      id: 'cc-1',
      fund: 'Horizon I (Vintage 2024)',
      title: lang === 'en' ? 'Capital Call #1' : 'Llamada de Capital #1',
      amount: '$5,000,000 USD',
      status: 'completed',
      badge: lang === 'en' ? 'Closed' : 'Cerrado',
      dueDate: '12 May 2024',
      lpsReconciled: '20 / 20 LPs',
      bankStatus: 'Banco Custodio Central · Conciliado'
    }
  ]);

  // Direct portfolio holdings
  const portfolioHoldings = $derived([
    {
      id: 'p-1',
      name: 'Logix Cold Chain SpA',
      sector: lang === 'en' ? 'Smart Logistics & Cold Storage' : 'Logística Inteligente & Frío',
      location: 'Hub Logístico Puerto Central',
      deployed: '$4.20M USD',
      irr: '21.2% TIR',
      status: lang === 'en' ? 'Optimal operations' : 'Operación óptima',
      equityStake: '28.5%',
      vintage: '2024'
    },
    {
      id: 'p-2',
      name: 'AeroData Cloud Systems',
      sector: lang === 'en' ? 'Sustainable Edge Infra Tier III' : 'Infraestructura Crítica Edge Tier III',
      location: 'Zona Tecnológica Biobío',
      deployed: '$4.00M USD',
      irr: '16.8% TIR',
      status: lang === 'en' ? 'Phase II expansion' : 'Expansión Fase II',
      equityStake: '35.0%',
      vintage: '2025'
    },
    {
      id: 'p-3',
      name: 'BioSensor Dynamics',
      sector: lang === 'en' ? 'Industrial Bio-Sensors & Telemetry' : 'Biometría & Sensores Industriales',
      location: 'Parque de Innovación Austral',
      deployed: '$2.80M USD',
      irr: '19.5% TIR',
      status: lang === 'en' ? 'Commercial scaling' : 'Escalamiento comercial',
      equityStake: '22.0%',
      vintage: '2025'
    },
    {
      id: 'p-4',
      name: 'Solaria Clean Energy',
      sector: lang === 'en' ? 'Renewable Generation & Storage' : 'Generación Renovable & BESS',
      location: 'Distrito de Energía Renovable',
      deployed: '$1.70M USD',
      irr: '15.4% TIR',
      status: lang === 'en' ? 'Continuous generation' : 'Generación continua',
      equityStake: '40.0%',
      vintage: '2024'
    }
  ]);

  // Institutional LPs list
  const institutionalLPs = $derived([
    {
      id: 'lp-1',
      name: 'Alpha Horizon Family Office',
      rut: '76.890.123-K',
      commitment: '$2,500,000 USD',
      callShare: '$250,000 USD',
      daysOrPct: 92,
      status: 'reconciled',
      statusLabel: lang === 'en' ? 'Reconciled ✓' : 'Conciliado ✓',
      custodianBank: 'Banco Custodio Central'
    },
    {
      id: 'lp-2',
      name: 'Inversiones Polaris SpA',
      rut: '77.456.789-2',
      commitment: '$1,800,000 USD',
      callShare: '$180,000 USD',
      daysOrPct: 78,
      status: 'reconciled',
      statusLabel: lang === 'en' ? 'Reconciled ✓' : 'Conciliado ✓',
      custodianBank: 'Banco Custodio Central'
    },
    {
      id: 'lp-3',
      name: 'Kensington Family Office',
      rut: '76.123.456-8',
      commitment: '$1,500,000 USD',
      callShare: '$150,000 USD',
      daysOrPct: 65,
      status: 'pending',
      statusLabel: lang === 'en' ? 'In clearing ⏳' : 'En clearing ⏳',
      custodianBank: 'Banco Custodio Central'
    },
    {
      id: 'lp-4',
      name: 'Fundación Solis Capital',
      rut: '65.345.678-1',
      commitment: '$1,200,000 USD',
      callShare: '$120,000 USD',
      daysOrPct: 54,
      status: 'reconciled',
      statusLabel: lang === 'en' ? 'Reconciled ✓' : 'Conciliado ✓',
      custodianBank: 'Banco Custodio Central'
    },
    {
      id: 'lp-5',
      name: 'Vanguardia Ventures Ltda.',
      rut: '78.901.234-5',
      commitment: '$1,000,000 USD',
      callShare: '$100,000 USD',
      daysOrPct: 42,
      status: 'pending',
      statusLabel: lang === 'en' ? 'In clearing ⏳' : 'En clearing ⏳',
      custodianBank: 'Banco Custodio Central'
    },
    {
      id: 'lp-6',
      name: 'Pacific Crest Holdings',
      rut: '79.234.567-3',
      commitment: '$800,000 USD',
      callShare: '$80,000 USD',
      daysOrPct: 32,
      status: 'reconciled',
      statusLabel: lang === 'en' ? 'Reconciled ✓' : 'Conciliado ✓',
      custodianBank: 'Banco Custodio Central'
    }
  ]);

  const filteredLPs = $derived(
    lpSearchQuery.trim()
      ? institutionalLPs.filter(
          (lp) =>
            lp.name.toLowerCase().includes(lpSearchQuery.toLowerCase()) ||
            lp.rut.toLowerCase().includes(lpSearchQuery.toLowerCase())
        )
      : institutionalLPs
  );

  // =========================================================================
  // 2. CONVERSATIONAL STREAM (Briefing con Widgets Progresivos)
  // =========================================================================
  interface ChatMessage {
    id: string;
    sender: 'user' | 'agent';
    time: string;
    text: string;
    showFullBriefingWidgets?: boolean;
  }

  let chatMessages = $state<ChatMessage[]>([
    {
      id: 'f-msg-0',
      sender: 'user',
      time: '09:30',
      text: '¿Qué tenemos para hoy?'
    },
    {
      id: 'f-msg-1',
      sender: 'agent',
      time: '09:30',
      text: '¡Buenos días! El foco prioritario de esta mañana es cerrar la Llamada de Capital #4 antes de las 14:30. A continuación tienes el reporte consolidado con los horizontes de ejecución:',
      showFullBriefingWidgets: true
    }
  ]);

  $effect(() => {
    chatMessages = [
      {
        id: 'f-msg-0',
        sender: 'user',
        time: '09:30',
        text: lang === 'en' ? 'What do we have for today?' : '¿Qué tenemos para hoy?'
      },
      {
        id: 'f-msg-1',
        sender: 'agent',
        time: '09:30',
        text:
          lang === 'en'
            ? 'Good morning! The top priority this morning is closing Capital Call #4 before 14:30. Below is your consolidated briefing across chronological execution horizons:'
            : '¡Buenos días! El foco prioritario de esta mañana es cerrar la Llamada de Capital #4 antes de las 14:30. A continuación tienes el reporte consolidado con los horizontes de ejecución:',
        showFullBriefingWidgets: true
      }
    ];
  });

  let chatInputText = $state('');
  let isAgentTyping = $state(false);
  let summaryScrollEl = $state<HTMLDivElement | null>(null);

  async function scrollToBottom(el: HTMLDivElement | null) {
    await tick();
    if (el && typeof el.scrollTo === 'function') {
      el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
    }
  }

  function handleSendPrompt(promptText: string) {
    if (!promptText.trim()) return;
    const text = promptText.trim();
    chatInputText = '';
    const now = '09:34';
    const uid = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

    chatMessages.push({
      id: `usr-${uid}`,
      sender: 'user',
      time: now,
      text
    });
    scrollToBottom(summaryScrollEl);

    isAgentTyping = true;
    setTimeout(() => {
      isAgentTyping = false;
      const lower = text.toLowerCase();
      let reply = '';
      let isBriefing = false;

      if (lower.includes('hoy') || lower.includes('tenemos') || lower.includes('today')) {
        reply =
          lang === 'en'
            ? 'Here is today’s active fund operations report across all horizons:'
            : 'Aquí tienes el reporte operativo de fondos para hoy en todos los horizontes:';
        isBriefing = true;
      } else if (lower.includes('aportante') || lower.includes('lp') || lower.includes('concilia')) {
        reply =
          lang === 'en'
            ? 'All 32 LPs have been verified against the custodian bank. 2 transfers ($150,000 USD total) are undergoing clearing with Banco Custodio Central.'
            : 'Los 32 aportantes fueron verificados contra el banco custodio. 2 transferencias ($150.000 USD en total) están en proceso de compensación en Banco Custodio Central.';
      } else if (lower.includes('aprobar') || lower.includes('llamada') || lower.includes('call')) {
        reply =
          lang === 'en'
            ? 'Capital Call #4 is fully pre-validated with SHA-256 integrity seal. Ready for FaceID authorization.'
            : 'La Llamada de Capital #4 está pre-validada con sello de integridad SHA-256. Lista para autorización con FaceID.';
      } else {
        reply =
          lang === 'en'
            ? 'Operations verified. Portfolio companies are operating within targeted parameters.'
            : 'Operaciones verificadas. Las empresas de portafolio operan dentro de los parámetros esperados.';
      }

      chatMessages.push({
        id: `agent-${uid}`,
        sender: 'agent',
        time: '09:35',
        text: reply,
        showFullBriefingWidgets: isBriefing
      });
      scrollToBottom(summaryScrollEl);
    }, 700);
  }
</script>

<!-- Interactive Toast Alert -->
{#if toastMessage}
  <div
    class="absolute top-14 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full bg-zinc-900/95 border border-zinc-700 text-white text-xs font-medium shadow-2xl backdrop-blur-md flex items-center gap-2 pointer-events-none"
    in:fade={{ duration: 150 }}
    out:fade={{ duration: 150 }}
  >
    <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
    <span>{toastMessage}</span>
  </div>
{/if}

<!-- Harvey AI Institutional Light Theme Screen Container -->
<div
  class="flex flex-col h-full w-full bg-[#F4F4F6] text-[#0F172A] relative font-sans overflow-hidden select-none"
  data-testid="zea-funds-screen"
>
  <!-- Minimal Clean Top Header -->
  <header
    class="px-4 py-2.5 bg-white/95 backdrop-blur-md border-b border-[#E5E7EB] flex items-center justify-between z-20 shrink-0"
  >
    <div class="flex items-center gap-2.5">
      <!-- Glia Square Monogram (G) -->
      <div
        class="w-7 h-7 rounded bg-[#111111] text-white flex items-center justify-center font-serif font-bold text-xs shadow-xs"
      >
        G
      </div>
      <div>
        <h2 class="text-xs font-semibold tracking-tight text-zinc-900 leading-tight">
          Funds Agent
        </h2>
      </div>
    </div>

    <!-- Mode Toggle (Chat vs App) in Harvey Light Theme -->
    <ZeaModeToggle
      mode={viewMode}
      theme="funds"
      variant="light"
      onToggle={(m) => (viewMode = m)}
    />
  </header>

  <!-- Scrollable Main Content across 4 Tabs -->
  <div class="flex-1 overflow-hidden relative">
    <!-- ========================================================= -->
    <!-- TAB 1: RESUMEN (CHAT CONVERSACIONAL CON WIDGETS PROGRESIVOS) -->
    <!-- ========================================================= -->
    {#if activeTab === 'summary'}
      <div class="h-full flex flex-col" in:fade={{ duration: 150 }}>
        {#if viewMode === 'chat'}
          <!-- Harvey AI Chat Stream con WhatsApp Timestamps y Widgets -->
          <div
            bind:this={summaryScrollEl}
            class="flex-1 overflow-y-auto px-3.5 py-3 space-y-3.5 text-xs text-left"
          >
            {#each chatMessages as msg (msg.id)}
              {#if msg.sender === 'user'}
                <!-- WhatsApp Style User Bubble -->
                <div class="flex justify-end">
                  <div
                    class="max-w-[85%] px-3 py-2 rounded-2xl rounded-tr-xs bg-[#F1F5F9] border border-[#E2E8F0] text-zinc-900 shadow-xs leading-relaxed"
                  >
                    <p class="text-[13px]">{msg.text}</p>
                    <span class="text-[9.5px] text-zinc-400 font-mono float-right mt-1 ml-2 flex items-center gap-0.5">
                      {msg.time}
                      <svg class="w-3.5 h-3.5 text-emerald-600 inline ml-0.5" viewBox="0 0 16 16" fill="currentColor">
                        <path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z"/>
                        <path d="M10.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-.5-.5a.5.5 0 1 1 .708-.708l.146.147 6.646-6.647a.5.5 0 0 1 .708 0z"/>
                      </svg>
                    </span>
                  </div>
                </div>
              {:else}
                <!-- Agent Message Bubble + Structured Horizon Widgets -->
                <div class="flex justify-start">
                  <div class="w-full max-w-[96%] space-y-2.5">
                    <!-- Text Introduction Bubble with WhatsApp timestamp -->
                    <div
                      class="p-3 rounded-2xl rounded-tl-xs bg-white border border-[#E5E7EB] text-zinc-800 shadow-[0_1px_3px_rgba(0,0,0,0.03)] leading-relaxed space-y-1.5"
                    >
                      <div class="flex items-center gap-1.5 text-zinc-900 text-[11px] font-semibold">
                        <span class="w-4 h-4 rounded bg-[#111111] text-white flex items-center justify-center font-serif text-[9px] font-bold">G</span>
                        <span>Funds Agent</span>
                      </div>
                      <p class="text-[12px] text-zinc-700 leading-normal">{msg.text}</p>
                      <span class="text-[9.5px] text-zinc-400 font-mono block text-right mt-0.5">{msg.time}</span>
                    </div>

                    {#if msg.showFullBriefingWidgets}
                      <!-- ═════════════════════════════════════════════════════ -->
                      <!-- WIDGET 1: EL AHORA (PRIORIDAD INMEDIATA · LLAMADA #4) -->
                      <!-- ═════════════════════════════════════════════════════ -->
                      <div class="p-3.5 rounded-xl bg-white border border-[#E5E7EB] shadow-[0_1px_4px_rgba(0,0,0,0.04)] space-y-2.5">
                        <div class="flex items-center justify-between">
                          <span class="inline-flex items-center gap-1 text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                            <span class="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                            EL AHORA · PRIORIDAD INMEDIATA
                          </span>
                          <span class="text-[9.5px] font-mono text-amber-800 bg-amber-50 border border-amber-200 px-1.5 py-0.2 rounded">
                            Cierra en 4 hrs
                          </span>
                        </div>

                        <div>
                          <div class="text-[26px] font-serif font-normal text-zinc-900 tracking-tight leading-none">
                            $1,250,000<span class="text-zinc-500 text-[15px] font-sans"> USD</span>
                            <span class="text-[11.5px] font-sans font-medium text-emerald-700 ml-1.5">↑ 88%</span>
                          </div>
                          <p class="text-[11px] text-zinc-500 font-sans mt-1">
                            Llamada #4 (Horizon II) · 30 de 32 LPs conciliados · $150K pendiente
                          </p>
                        </div>

                        <!-- Progress Bar -->
                        <div class="space-y-1">
                          <div class="h-2 rounded-full bg-zinc-100 overflow-hidden">
                            <div class="h-full rounded-full bg-zinc-900 transition-all" style="width: 88%;"></div>
                          </div>
                        </div>

                        <div class="grid grid-cols-2 gap-2 pt-0.5">
                          <button
                            type="button"
                            onclick={() => (activeTab = 'lps')}
                            class="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-white border border-[#E5E7EB] text-zinc-800 hover:bg-zinc-50 transition cursor-pointer text-center"
                          >
                            Ver 2 pendientes
                          </button>
                          <button
                            type="button"
                            onclick={() => {
                              faceIdSigned = true;
                              showToast(
                                lang === 'en'
                                  ? 'Capital Call #4 signed with FaceID'
                                  : 'Llamada #4 firmada con FaceID'
                              );
                            }}
                            class="px-2.5 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer text-center {faceIdSigned ? 'bg-emerald-700 text-white font-semibold' : 'bg-[#111111] text-white hover:bg-zinc-800'}"
                          >
                            {faceIdSigned ? (lang === 'en' ? '✓ Authorized' : '✓ Autorizado') : (lang === 'en' ? 'Firmar con FaceID' : 'Firmar con FaceID')}
                          </button>
                        </div>
                      </div>

                      <!-- ═════════════════════════════════════════════════════ -->
                      <!-- WIDGET 2: EL HOY (AGENDA OPERATIVA DEL DÍA)           -->
                      <!-- ═════════════════════════════════════════════════════ -->
                      <div class="p-3.5 rounded-xl bg-white border border-[#E5E7EB] shadow-[0_1px_4px_rgba(0,0,0,0.04)] space-y-2.5 font-sans">
                        <div class="flex items-baseline justify-between">
                          <span class="text-[10px] font-mono font-semibold text-zinc-500 uppercase tracking-wider">
                            📅 EL HOY · HITOS OPERATIVOS
                          </span>
                          <span class="text-[10px] text-zinc-400 font-mono">4 eventos</span>
                        </div>

                        <div class="space-y-1.5">
                          {#each fundsTimeline as item}
                            <div class="p-2 rounded-lg bg-zinc-50 border border-zinc-200/70 flex items-start justify-between gap-2">
                              <div class="flex items-start gap-2">
                                <span class="text-[9.5px] font-mono font-semibold text-zinc-500 pt-0.5 shrink-0">
                                  {item.time}
                                </span>
                                <div>
                                  <p class="text-[11.5px] font-medium text-zinc-900 leading-snug">{item.title}</p>
                                  <p class="text-[10px] text-zinc-500 leading-tight mt-0.5">{item.subtitle}</p>
                                </div>
                              </div>
                              {#if item.actionLabel}
                                <button
                                  type="button"
                                  onclick={() => item.onAction?.()}
                                  class="text-[9.5px] font-medium text-zinc-800 bg-white hover:bg-zinc-100 border border-zinc-200 px-1.5 py-0.5 rounded shrink-0 cursor-pointer"
                                >
                                  {item.actionLabel}
                                </button>
                              {:else if item.onClick}
                                <button
                                  type="button"
                                  onclick={() => item.onClick?.()}
                                  class="text-[9.5px] font-medium text-zinc-700 bg-white hover:bg-zinc-100 border border-zinc-200 px-1.5 py-0.5 rounded shrink-0 cursor-pointer"
                                >
                                  Ficha
                                </button>
                              {/if}
                            </div>
                          {/each}
                        </div>
                      </div>

                      <!-- ═════════════════════════════════════════════════════ -->
                      <!-- WIDGET 3: LA SEMANA (ASSET DEPLOYMENT GROUPED BARS)    -->
                      <!-- ═════════════════════════════════════════════════════ -->
                      <div class="p-3.5 rounded-xl bg-white border border-[#E5E7EB] shadow-[0_1px_4px_rgba(0,0,0,0.04)] space-y-2">
                        <div class="flex items-baseline justify-between">
                          <div>
                            <span class="text-[10px] font-mono font-semibold text-zinc-500 uppercase tracking-wider block">
                              📊 LA SEMANA · ASSET DEPLOYMENT
                            </span>
                            <p class="text-[10.5px] text-zinc-500 font-sans mt-0.5">
                              Capital desplegado vs target
                            </p>
                          </div>
                          <span class="text-[9.5px] text-zinc-600 bg-zinc-50 border border-zinc-200 px-1.5 py-0.5 rounded flex items-center gap-1 font-sans">
                            This week ▾
                          </span>
                        </div>

                        <!-- Grouped Bars -->
                        <div class="pt-2">
                          <div class="flex items-end justify-around h-18 border-b border-zinc-100 px-1">
                            {#each allocationGrouped as item}
                              <div class="flex flex-col items-center gap-1">
                                <div class="flex items-end gap-1 h-14">
                                  <div class="w-2 rounded-t-xs bg-zinc-800" style="height: {item.current}%;"></div>
                                  <div class="w-2 rounded-t-xs bg-zinc-200" style="height: {item.target}%;"></div>
                                </div>
                                <span class="text-[8.5px] text-zinc-400 font-sans">{item.name}</span>
                              </div>
                            {/each}
                          </div>
                        </div>

                        <div class="flex items-center gap-3 pt-1 text-[9px] text-zinc-500 font-sans">
                          <span class="flex items-center gap-1">
                            <span class="w-1.5 h-1.5 rounded-full bg-zinc-800"></span> Desplegado
                          </span>
                          <span class="flex items-center gap-1">
                            <span class="w-1.5 h-1.5 rounded-full bg-zinc-300"></span> Meta 2026
                          </span>
                          <span class="flex items-center gap-1">
                            <span class="w-1.5 h-1.5 rounded-full bg-amber-700"></span> Clearing
                          </span>
                        </div>
                      </div>

                      <!-- ═════════════════════════════════════════════════════ -->
                      <!-- WIDGET 4: EL MES (TOP POWER LPs RANKING)              -->
                      <!-- ═════════════════════════════════════════════════════ -->
                      <div class="p-3.5 rounded-xl bg-white border border-[#E5E7EB] shadow-[0_1px_4px_rgba(0,0,0,0.04)] space-y-2">
                        <div class="flex items-baseline justify-between">
                          <div>
                            <span class="text-[10px] font-mono font-semibold text-zinc-500 uppercase tracking-wider block">
                              👥 EL MES · TOP POWER LPs
                            </span>
                            <p class="text-[10.5px] text-zinc-500 font-sans mt-0.5">
                              Cumplimiento de compromisos
                            </p>
                          </div>
                          <span class="text-[9.5px] text-zinc-600 bg-zinc-50 border border-zinc-200 px-1.5 py-0.5 rounded flex items-center gap-1 font-sans">
                            Past month ▾
                          </span>
                        </div>

                        <div class="space-y-1.5 pt-1 font-sans">
                          {#each institutionalLPs.slice(0, 4) as lp}
                            <div class="space-y-0.5">
                              <div class="flex items-center justify-between text-[10.5px]">
                                <span class="text-zinc-700 truncate max-w-[65%]">{lp.name}</span>
                                <span class="font-mono text-[10px] text-zinc-500">{lp.callShare} {lp.status === 'reconciled' ? '✓' : '⏳'}</span>
                              </div>
                              <div class="h-1.5 rounded-full bg-zinc-100 overflow-hidden flex items-center">
                                <div
                                  class="h-full rounded-full transition-all {lp.status === 'reconciled' ? 'bg-[#3b4252]' : 'bg-[#d08770]'}"
                                  style="width: {lp.daysOrPct}%;"
                                ></div>
                              </div>
                            </div>
                          {/each}
                        </div>
                      </div>

                      <!-- ═════════════════════════════════════════════════════ -->
                      <!-- WIDGET 5: EL PROYECTADO (AUM & TIR OBJETIVO CURVE)    -->
                      <!-- ═════════════════════════════════════════════════════ -->
                      <div class="p-3.5 rounded-xl bg-white border border-[#E5E7EB] shadow-[0_1px_4px_rgba(0,0,0,0.04)] space-y-2">
                        <div class="flex items-baseline justify-between">
                          <div>
                            <span class="text-[10px] font-mono font-semibold text-zinc-500 uppercase tracking-wider block">
                              📈 EL PROYECTADO · AUM & TIR
                            </span>
                            <div class="flex items-baseline gap-1.5 mt-0.5">
                              <span class="font-serif text-[24px] font-normal tracking-tight text-zinc-900 leading-none">
                                $14.85M
                              </span>
                              <span class="text-[11px] text-emerald-700 font-sans font-medium">
                                ↑ 18.4% TIR Neta
                              </span>
                            </div>
                          </div>
                          <span class="text-[9.5px] text-zinc-600 bg-zinc-50 border border-zinc-200 px-1.5 py-0.5 rounded flex items-center gap-1 font-sans">
                            2026 Target ▾
                          </span>
                        </div>

                        <!-- Micro Density Exponential Chart -->
                        <div class="pt-1">
                          <div class="flex items-end justify-between gap-[2px] h-14 pt-2 border-b border-zinc-100">
                            {#each densityBars as pct, idx}
                              <div class="flex-1 flex flex-col justify-end h-full">
                                <div
                                  class="w-full rounded-t-xs transition-all {idx === densityBars.length - 1 ? 'bg-zinc-800' : 'bg-zinc-200'}"
                                  style="height: {pct}%;"
                                ></div>
                              </div>
                            {/each}
                          </div>
                          <div class="flex justify-between text-[8px] text-zinc-400 font-sans pt-1">
                            <span>Q1</span>
                            <span>Q2</span>
                            <span>Q3</span>
                            <span>Hoy</span>
                            <span>$20M Cap</span>
                          </div>
                        </div>
                      </div>
                    {/if}
                  </div>
                </div>
              {/if}
            {/each}

            {#if isAgentTyping}
              <div
                class="flex items-center gap-1.5 p-2.5 rounded-xl bg-white border border-[#E5E7EB] w-18 shadow-xs"
              >
                <span class="w-1.5 h-1.5 rounded-full bg-zinc-600 animate-bounce"></span>
                <span class="w-1.5 h-1.5 rounded-full bg-zinc-600 animate-bounce [animation-delay:0.2s]"></span>
                <span class="w-1.5 h-1.5 rounded-full bg-zinc-600 animate-bounce [animation-delay:0.4s]"></span>
              </div>
            {/if}
          </div>

          <!-- Prompt Input Bar -->
          <div class="shrink-0 bg-white border-t border-[#E5E7EB] p-2.5 space-y-2 z-20">
            <div class="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
              {#each (lang === 'en' ? ['What do we have today?', 'Reconcile Custodian', 'Audit LPs', 'Call #4 Status'] : ['¿Qué tenemos para hoy?', 'Conciliar custodio', 'Auditar LPs', 'Estado Llamada #4']) as chip}
                <button
                  type="button"
                  onclick={() => handleSendPrompt(chip)}
                  class="shrink-0 px-2.5 py-1 rounded-full text-[10.5px] font-medium bg-[#F8F9FA] hover:bg-[#F1F5F9] border border-[#E5E7EB] text-zinc-700 transition cursor-pointer"
                >
                  {chip}
                </button>
              {/each}
            </div>

            <form
              onsubmit={(e) => {
                e.preventDefault();
                handleSendPrompt(chatInputText);
              }}
              class="flex items-center gap-2"
            >
              <input
                type="text"
                bind:value={chatInputText}
                placeholder={lang === 'en' ? 'Ask Funds Agent about AUM, LPs or Calls...' : 'Pregunta a Funds Agent sobre AUM, LPs o llamadas...'}
                class="flex-1 bg-[#F8F9FA] border border-[#E2E8F0] rounded-lg px-3 py-2 text-xs text-zinc-900 placeholder:text-zinc-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-zinc-400"
              />
              <button
                type="submit"
                aria-label="Enviar prompt"
                class="p-2 rounded-lg bg-[#111111] text-white hover:bg-zinc-800 transition cursor-pointer shrink-0"
              >
                <svg class="w-4 h-4 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </button>
            </form>
          </div>
        {:else}
          <!-- ========================================================= -->
          <!-- APP DASHBOARD (CLEAN ANALYTICAL CARDS, SIN TITULOS INNECESARIOS) -->
          <!-- ========================================================= -->
          <div class="flex-1 overflow-y-auto px-3.5 py-3.5 space-y-3.5 text-left">
            <!-- 1. Recommendation Banner -->
            <div
              class="p-2.5 rounded-xl bg-white border border-[#E5E7EB] shadow-[0_1px_3px_rgba(0,0,0,0.03)] flex items-center justify-between gap-2.5"
            >
              <div class="flex items-center gap-2">
                <span class="w-5 h-5 rounded bg-[#111111] text-white flex items-center justify-center font-serif font-bold text-[10px] shrink-0">
                  G
                </span>
                <p class="text-[11px] text-zinc-700 font-sans leading-tight">
                  {lang === 'en'
                    ? 'There are 2 recommended actions for Capital Call #4'
                    : 'Hay 2 acciones recomendadas para la Llamada de Capital #4'}
                </p>
              </div>
              <button
                type="button"
                onclick={() => { activeTab = 'lps'; showToast('Auditando 32 LPs...'); }}
                class="text-[10.5px] font-medium text-zinc-900 underline hover:text-black shrink-0 cursor-pointer"
              >
                {lang === 'en' ? 'Audit' : 'Auditar'}
              </button>
            </div>

            <!-- 2. CARD 1: AUM Consolidado with Density Exponential Bars -->
            <div class="p-3.5 rounded-xl bg-white border border-[#E5E7EB] shadow-[0_1px_3px_rgba(0,0,0,0.03)] space-y-2">
              <div class="flex items-baseline justify-between">
                <div>
                  <div class="flex items-baseline gap-1.5">
                    <span class="font-serif text-[26px] font-normal tracking-tight text-zinc-900 leading-none">
                      $14.85M
                    </span>
                    <span class="text-[11.5px] text-zinc-500 font-sans font-medium">
                      ↑ 18.4%
                    </span>
                  </div>
                  <span class="text-[10px] text-zinc-400 font-mono uppercase tracking-wider block mt-1">
                    AUM CONSOLIDADO / NET IRR
                  </span>
                </div>

                <div class="flex items-center gap-1 font-sans">
                  <span class="text-[10px] text-zinc-600 bg-zinc-50 border border-zinc-200 px-2 py-0.5 rounded-md flex items-center gap-1">
                    6 months <span class="text-[8px] text-zinc-400">▾</span>
                  </span>
                  <span class="text-[10px] text-zinc-600 bg-zinc-50 border border-zinc-200 px-1.5 py-0.5 rounded-md flex items-center gap-1">
                    2026 <span class="text-[8px] text-zinc-400">▾</span>
                  </span>
                </div>
              </div>

              <!-- Exponential Density Trend Chart -->
              <div class="pt-2">
                <div class="flex items-end justify-between gap-[2px] h-18 pt-2 border-b border-zinc-100">
                  {#each densityBars as pct, idx}
                    <div class="flex-1 flex flex-col justify-end h-full">
                      <div
                        class="w-full rounded-t-xs transition-all {idx === densityBars.length - 1 ? 'bg-zinc-800' : 'bg-zinc-200 hover:bg-zinc-400'}"
                        style="height: {pct}%;"
                      ></div>
                    </div>
                  {/each}
                </div>
                <div class="flex justify-between text-[8.5px] text-zinc-400 font-sans pt-1">
                  <span>Ene</span>
                  <span>Feb</span>
                  <span>Mar</span>
                  <span>Abr</span>
                  <span>May</span>
                  <span>Jun</span>
                </div>
              </div>

              <div class="flex items-center gap-3 pt-1 text-[9.5px] text-zinc-500 font-sans">
                <span class="flex items-center gap-1">
                  <span class="w-1.5 h-1.5 rounded-full bg-zinc-800"></span>
                  Horizon II
                </span>
                <span class="flex items-center gap-1">
                  <span class="w-1.5 h-1.5 rounded-full bg-zinc-300"></span>
                  Bench Peers (14.2%)
                </span>
              </div>
            </div>

            <!-- 3. CARD 2: Asset Allocation Grouped Vertical Bars -->
            <div class="p-3.5 rounded-xl bg-white border border-[#E5E7EB] shadow-[0_1px_3px_rgba(0,0,0,0.03)] space-y-2">
              <div class="flex items-baseline justify-between">
                <div>
                  <h4 class="font-serif text-[15px] font-normal text-zinc-900 leading-tight">
                    Asset deployment
                  </h4>
                  <p class="text-[10.5px] text-zinc-500 font-sans">
                    Based on target portfolio weight
                  </p>
                </div>
                <span class="text-[10px] text-zinc-600 bg-zinc-50 border border-zinc-200 px-2 py-0.5 rounded-md flex items-center gap-1 font-sans">
                  This week <span class="text-[8px] text-zinc-400">▾</span>
                </span>
              </div>

              <div class="pt-3">
                <div class="flex items-end justify-around h-20 border-b border-zinc-100 px-1">
                  {#each allocationGrouped as item}
                    <div class="flex flex-col items-center gap-1">
                      <div class="flex items-end gap-1 h-16">
                        <div class="w-2 rounded-t-xs bg-zinc-800" style="height: {item.current}%;"></div>
                        <div class="w-2 rounded-t-xs bg-zinc-200" style="height: {item.target}%;"></div>
                      </div>
                      <span class="text-[8.5px] text-zinc-400 font-sans">{item.name}</span>
                    </div>
                  {/each}
                </div>
              </div>

              <div class="flex items-center gap-3 pt-1 text-[9.5px] text-zinc-500 font-sans">
                <span class="flex items-center gap-1">
                  <span class="w-1.5 h-1.5 rounded-full bg-zinc-800"></span> Desplegado
                </span>
                <span class="flex items-center gap-1">
                  <span class="w-1.5 h-1.5 rounded-full bg-zinc-300"></span> Meta 2026
                </span>
                <span class="flex items-center gap-1">
                  <span class="w-1.5 h-1.5 rounded-full bg-amber-700"></span> Atención
                </span>
              </div>
            </div>

            <!-- 4. CARD 3: Active Capital Call #4 with FaceID -->
            <div class="p-3.5 rounded-xl bg-white border border-[#E5E7EB] shadow-[0_1px_3px_rgba(0,0,0,0.03)] space-y-2.5">
              <div class="flex items-baseline justify-between">
                <div>
                  <div class="flex items-baseline gap-1.5">
                    <span class="font-serif text-[26px] font-normal tracking-tight text-zinc-900 leading-none">
                      $1,250,000
                    </span>
                    <span class="text-[11.5px] text-emerald-700 font-sans font-medium">
                      ↑ 88%
                    </span>
                  </div>
                  <span class="text-[10px] text-zinc-400 font-mono uppercase tracking-wider block mt-1">
                    LLAMADA DE CAPITAL #4 · HORIZON II
                  </span>
                </div>

                <div class="flex items-center gap-1 font-sans">
                  <span class="text-[10px] text-zinc-600 bg-zinc-50 border border-zinc-200 px-2 py-0.5 rounded-md flex items-center gap-1">
                    Cierra hoy ▾
                  </span>
                </div>
              </div>

              <div class="p-2.5 rounded-lg bg-zinc-50 border border-zinc-200/80 flex items-center justify-between text-xs font-sans">
                <span class="text-zinc-600">30 de 32 LPs conciliados</span>
                <span class="font-mono text-zinc-900 font-semibold">$150,000 pendiente</span>
              </div>

              <div class="grid grid-cols-2 gap-2 pt-1 font-sans">
                <button
                  type="button"
                  onclick={() =>
                    openItemDetails({
                      avatarText: 'H2',
                      title: 'Fondo Horizon II',
                      subtitle: 'Private Equity · Vintage 2026',
                      progressLabel: 'AUM Objetivo alcanzado',
                      progressValueText: '$14.85M de $20M',
                      progressPct: 74,
                      stats: [
                        { label: 'TIR Neta', value: '18.4%' },
                        { label: 'Moneda', value: 'USD' }
                      ]
                    })}
                  class="px-3 py-2 rounded-lg text-xs font-medium bg-white border border-[#E5E7EB] text-zinc-800 hover:bg-zinc-50 transition cursor-pointer text-center"
                >
                  {lang === 'en' ? 'Fund details' : 'Ver fondo'}
                </button>
                <button
                  type="button"
                  onclick={() => {
                    faceIdSigned = true;
                    showToast(
                      lang === 'en'
                        ? 'Capital Call #4 authorized'
                        : 'Llamada de Capital #4 autorizada'
                    );
                  }}
                  class="px-3 py-2 rounded-lg text-xs font-medium transition cursor-pointer text-center {faceIdSigned ? 'bg-emerald-700 text-white font-semibold' : 'bg-[#111111] text-white hover:bg-zinc-800'}"
                >
                  {faceIdSigned ? (lang === 'en' ? '✓ Authorized' : '✓ Autorizada') : (lang === 'en' ? 'Sign Call #4' : 'Aprobar llamada')}
                </button>
              </div>
            </div>

            <!-- 5. CARD 4: Top Aportantes (LPs) Horizontal Rank Bars -->
            <div class="p-3.5 rounded-xl bg-white border border-[#E5E7EB] shadow-[0_1px_3px_rgba(0,0,0,0.03)] space-y-2.5">
              <div class="flex items-baseline justify-between">
                <div>
                  <h4 class="font-serif text-[15px] font-normal text-zinc-900 leading-tight">
                    Top power LPs
                  </h4>
                  <p class="text-[10.5px] text-zinc-500 font-sans">
                    Based on capital commitment & reconciliation
                  </p>
                </div>
                <span class="text-[10px] text-zinc-600 bg-zinc-50 border border-zinc-200 px-2 py-0.5 rounded-md flex items-center gap-1 font-sans">
                  Past month ▾
                </span>
              </div>

              <div class="space-y-2 pt-1 font-sans">
                {#each institutionalLPs as lp}
                  <div class="space-y-1">
                    <div class="flex items-center justify-between text-[11px]">
                      <span class="text-zinc-700 font-medium truncate max-w-[65%]">{lp.name}</span>
                      <span class="font-mono text-[10.5px] text-zinc-500">{lp.callShare}</span>
                    </div>
                    <div class="h-2 rounded-full bg-zinc-100 overflow-hidden flex items-center">
                      <div
                        class="h-full rounded-full transition-all {lp.status === 'reconciled' ? 'bg-[#3b4252]' : 'bg-[#d08770]'}"
                        style="width: {lp.daysOrPct}%;"
                      ></div>
                    </div>
                  </div>
                {/each}
              </div>
            </div>

            <!-- 6. Operational Agenda / Hoy -->
            <div class="p-3.5 rounded-xl bg-white border border-[#E5E7EB] shadow-[0_1px_3px_rgba(0,0,0,0.03)] space-y-2.5 font-sans">
              <div class="flex items-baseline justify-between">
                <h4 class="font-serif text-[15px] font-normal text-zinc-900 tracking-tight">
                  {lang === 'en' ? 'Today operations' : 'Operaciones de Hoy'}
                </h4>
                <button
                  type="button"
                  onclick={() => (activeTab = 'calls')}
                  class="text-[10.5px] font-medium text-zinc-600 hover:text-zinc-900 transition cursor-pointer"
                >
                  {lang === 'en' ? 'All events' : 'Ver todo'}
                </button>
              </div>

              <div class="space-y-2">
                {#each fundsTimeline as item}
                  <div
                    class="p-2.5 rounded-lg bg-zinc-50 border border-zinc-200/70 hover:border-zinc-300 transition flex items-start justify-between gap-2.5"
                  >
                    <div class="flex items-start gap-2">
                      <span class="text-[10px] font-mono font-semibold text-zinc-500 pt-0.5">
                        {item.time}
                      </span>
                      <div>
                        <p class="text-[12px] font-medium text-zinc-900 leading-snug">
                          {item.title}
                        </p>
                        <p class="text-[10.5px] text-zinc-500 leading-normal mt-0.5">
                          {item.subtitle}
                        </p>
                      </div>
                    </div>

                    {#if item.actionLabel}
                      <button
                        type="button"
                        onclick={() => item.onAction?.()}
                        class="text-[10px] font-medium text-zinc-800 bg-white hover:bg-zinc-100 border border-zinc-200 px-2 py-0.5 rounded shrink-0 cursor-pointer transition"
                      >
                        {item.actionLabel}
                      </button>
                    {:else if item.onClick}
                      <button
                        type="button"
                        onclick={() => item.onClick?.()}
                        class="text-[10px] font-medium text-zinc-700 bg-white hover:bg-zinc-100 border border-zinc-200 px-2 py-0.5 rounded shrink-0 cursor-pointer transition"
                      >
                        {lang === 'en' ? 'Details' : 'Ficha'}
                      </button>
                    {/if}
                  </div>
                {/each}
              </div>
            </div>
          </div>
        {/if}
      </div>

    <!-- ========================================================= -->
    <!-- TAB 2: LLAMADOS (CAPITAL CALLS)                           -->
    <!-- ========================================================= -->
    {:else if activeTab === 'calls'}
      <div class="h-full flex flex-col overflow-y-auto px-3.5 py-3.5 space-y-3.5 text-left font-sans" in:fade={{ duration: 150 }}>
        <!-- Summary Metric Card -->
        <div class="p-3.5 rounded-xl bg-white border border-[#E5E7EB] shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
          <span class="text-[10.5px] text-zinc-400 font-mono uppercase tracking-wider block">
            {lang === 'en' ? 'Capital Call Status · Active Funds' : 'Estado de Llamados · Fondos Activos'}
          </span>
          <div class="grid grid-cols-3 gap-2 mt-2 pt-2 border-t border-zinc-100 text-center">
            <div>
              <span class="text-[9.5px] text-zinc-400 block font-mono">Comprometido</span>
              <span class="text-[15px] font-serif font-normal text-zinc-900">$20.0M</span>
            </div>
            <div>
              <span class="text-[9.5px] text-zinc-400 block font-mono">Llamado</span>
              <span class="text-[15px] font-serif font-normal text-zinc-900">$12.55M</span>
            </div>
            <div>
              <span class="text-[9.5px] text-zinc-400 block font-mono">Cumplimiento</span>
              <span class="text-[15px] font-serif font-normal text-emerald-700">99.1%</span>
            </div>
          </div>
        </div>

        <div class="space-y-2.5">
          {#each capitalCallsList as call}
            <div
              class="p-3.5 rounded-xl bg-white border border-[#E5E7EB] shadow-[0_1px_3px_rgba(0,0,0,0.03)] space-y-2"
            >
              <div class="flex items-center justify-between">
                <span class="text-[10.5px] font-medium text-zinc-500 font-mono">{call.fund}</span>
                <span
                  class="text-[9.5px] font-mono px-2 py-0.5 rounded-md {call.status === 'active' ? 'bg-zinc-100 text-zinc-800 border border-zinc-200 font-semibold' : 'bg-zinc-50 text-zinc-500'}"
                >
                  {call.badge}
                </span>
              </div>

              <div class="flex items-baseline justify-between">
                <h4 class="text-[14px] font-serif font-normal text-zinc-900">{call.title}</h4>
                <span class="text-[15px] font-serif font-normal text-zinc-900">{call.amount}</span>
              </div>

              <div class="pt-2 border-t border-zinc-100 flex items-center justify-between text-xs text-zinc-600">
                <span class="text-[11px]">{call.lpsReconciled}</span>
                <span class="font-mono text-[10.5px] text-zinc-500">{call.bankStatus}</span>
              </div>

              {#if call.status === 'active'}
                <button
                  type="button"
                  onclick={() => {
                    activeTab = 'lps';
                    showToast('Abriendo nómina de LPs...');
                  }}
                  class="w-full mt-1 py-1.5 rounded-lg text-xs font-medium bg-[#111111] hover:bg-zinc-800 text-white transition cursor-pointer text-center"
                >
                  {lang === 'en' ? 'Audit LPs' : 'Auditar Aportantes'}
                </button>
              {/if}
            </div>
          {/each}
        </div>
      </div>

    <!-- ========================================================= -->
    <!-- TAB 3: PORTAFOLIO (PORTFOLIO COMPANIES)                   -->
    <!-- ========================================================= -->
    {:else if activeTab === 'portfolio'}
      <div class="h-full flex flex-col overflow-y-auto px-3.5 py-3.5 space-y-3.5 text-left font-sans" in:fade={{ duration: 150 }}>
        <!-- Summary Banner -->
        <div class="p-3.5 rounded-xl bg-white border border-[#E5E7EB] shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
          <span class="text-[10.5px] text-zinc-400 font-mono uppercase tracking-wider block">
            {lang === 'en' ? 'Direct Portfolio Holdings' : 'Empresas en Portafolio Directo'}
          </span>
          <div class="flex items-baseline justify-between mt-1">
            <span class="text-[22px] font-serif font-normal text-zinc-900">$12.70M USD</span>
            <span class="text-xs text-zinc-500 font-medium">4 Activos Operativos</span>
          </div>
        </div>

        <div class="space-y-2.5">
          {#each portfolioHoldings as holding}
            <div
              class="p-3.5 rounded-xl bg-white border border-[#E5E7EB] shadow-[0_1px_3px_rgba(0,0,0,0.03)] space-y-2"
            >
              <div class="flex items-center justify-between">
                <span class="text-[10px] font-mono text-zinc-400">{holding.sector}</span>
                <span class="text-[10px] font-mono font-semibold text-zinc-800 bg-zinc-100 border border-zinc-200 px-1.5 py-0.5 rounded">
                  {holding.irr}
                </span>
              </div>

              <div>
                <h4 class="text-[15px] font-serif font-normal text-zinc-900">{holding.name}</h4>
                <p class="text-[11px] text-zinc-500 mt-0.5">{holding.location}</p>
              </div>

              <div class="pt-2 border-t border-zinc-100 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span class="text-[9.5px] text-zinc-400 block font-mono">Capital Desplegado</span>
                  <span class="font-serif text-[13px] text-zinc-900">{holding.deployed}</span>
                </div>
                <div>
                  <span class="text-[9.5px] text-zinc-400 block font-mono">Participación</span>
                  <span class="font-serif text-[13px] text-zinc-900">{holding.equityStake}</span>
                </div>
              </div>

              <button
                type="button"
                onclick={() =>
                  openItemDetails({
                    avatarText: holding.name.slice(0, 2).toUpperCase(),
                    title: holding.name,
                    subtitle: `${holding.sector} · ${holding.location}`,
                    progressLabel: 'Participación en Fondos',
                    progressValueText: holding.equityStake,
                    progressPct: parseInt(holding.equityStake),
                    stats: [
                      { label: 'Desplegado', value: holding.deployed },
                      { label: 'TIR Proyectada', value: holding.irr }
                    ]
                  })}
                class="w-full mt-1 py-1.5 rounded-lg text-xs font-medium bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 text-zinc-800 transition cursor-pointer text-center"
              >
                {lang === 'en' ? 'View Details' : 'Ver Ficha Completa'}
              </button>
            </div>
          {/each}
        </div>
      </div>

    <!-- ========================================================= -->
    <!-- TAB 4: APORTANTES (LPS / INVESTORS)                       -->
    <!-- ========================================================= -->
    {:else if activeTab === 'lps'}
      <div class="h-full flex flex-col overflow-y-auto px-3.5 py-3.5 space-y-3 text-left font-sans" in:fade={{ duration: 150 }}>
        <!-- Search & Filter Bar -->
        <div class="relative">
          <input
            type="text"
            bind:value={lpSearchQuery}
            placeholder={lang === 'en' ? 'Search LP or tax ID...' : 'Buscar aportante o RUT...'}
            class="w-full bg-white border border-[#E5E7EB] rounded-lg px-3 py-2 text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400 shadow-xs"
          />
        </div>

        <!-- Compliance & Regulatory Banner -->
        <div class="p-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-zinc-800 text-xs space-y-1">
          <div class="flex items-center gap-1.5 font-semibold text-[11px]">
            <span class="w-1.5 h-1.5 rounded-full bg-zinc-800"></span>
            <span>{lang === 'en' ? 'Law 21.719 APDP Audit Ledger' : 'Ley 21.719 APDP & Log de Auditoría'}</span>
          </div>
          <p class="text-[10px] text-zinc-600 leading-normal">
            {lang === 'en'
              ? 'Investor records are protected under encrypted enclave with immutable audit log on GCP.'
              : 'Nómina protegida bajo enclave encriptado con log de auditoría inmutable en Google Cloud.'}
          </p>
        </div>

        <!-- LPs List -->
        <div class="space-y-2">
          {#each filteredLPs as lp}
            <button
              type="button"
              onclick={() =>
                openItemDetails({
                  avatarText: lp.name.slice(0, 2).toUpperCase(),
                  title: lp.name,
                  subtitle: `RUT ${lp.rut} · ${lp.custodianBank}`,
                  progressLabel: 'Compromiso Total',
                  progressValueText: lp.commitment,
                  progressPct: 88,
                  stats: [
                    { label: 'Cuota Llamada #4', value: lp.callShare },
                    { label: 'Estado', value: lp.statusLabel }
                  ]
                })}
              class="w-full p-3 rounded-xl bg-white border border-[#E5E7EB] shadow-[0_1px_3px_rgba(0,0,0,0.03)] hover:border-zinc-300 text-left transition flex items-center justify-between cursor-pointer"
            >
              <div>
                <div class="flex items-center gap-2">
                  <h4 class="text-[13px] font-serif font-normal text-zinc-900">{lp.name}</h4>
                  <span
                    class="text-[9px] font-mono px-1.5 py-0.2 rounded-md {lp.status === 'reconciled' ? 'bg-zinc-100 text-zinc-700' : 'bg-amber-50 text-amber-800 border border-amber-200'}"
                  >
                    {lp.statusLabel}
                  </span>
                </div>
                <p class="text-[10.5px] text-zinc-400 font-mono mt-0.5">
                  RUT: {lp.rut} · {lp.custodianBank}
                </p>
              </div>

              <div class="text-right shrink-0">
                <span class="text-[13px] font-serif font-normal text-zinc-900 block">{lp.callShare}</span>
                <span class="text-[9.5px] text-zinc-400 font-mono">de {lp.commitment}</span>
              </div>
            </button>
          {/each}
        </div>
      </div>
    {/if}
  </div>

  <!-- ========================================================= -->
  <!-- NATIVE HARVEY BOTTOM TAB BAR: RESUMEN, LLAMADOS, PORTAFOLIO, APORTANTES -->
  <!-- ========================================================= -->
  <div
    id="funds-bottom-tabbar"
    class="shrink-0 h-13 bg-white/95 backdrop-blur-md border-t border-[#E5E7EB] flex items-center justify-around px-2 z-20 shadow-[0_-1px_3px_rgba(0,0,0,0.02)]"
  >
    <!-- TAB 1: RESUMEN -->
    <button
      type="button"
      onclick={() => (activeTab = 'summary')}
      class="flex flex-col items-center gap-1 transition px-2 py-1 cursor-pointer {activeTab === 'summary' ? 'text-zinc-950 font-semibold' : 'text-zinc-400 hover:text-zinc-600'}"
    >
      <div class="relative">
        <svg class="w-4.5 h-4.5 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        {#if activeTab === 'summary'}
          <span class="absolute -top-1 -right-1 w-1.5 h-1.5 rounded-full bg-zinc-900"></span>
        {/if}
      </div>
      <span class="text-[9.5px] tracking-tight">{lang === 'en' ? 'Summary' : 'Resumen'}</span>
    </button>

    <!-- TAB 2: LLAMADOS -->
    <button
      type="button"
      onclick={() => (activeTab = 'calls')}
      class="flex flex-col items-center gap-1 transition px-2 py-1 cursor-pointer {activeTab === 'calls' ? 'text-zinc-950 font-semibold' : 'text-zinc-400 hover:text-zinc-600'}"
    >
      <div class="relative">
        <svg class="w-4.5 h-4.5 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        {#if activeTab === 'calls'}
          <span class="absolute -top-1 -right-1 w-1.5 h-1.5 rounded-full bg-zinc-900"></span>
        {/if}
      </div>
      <span class="text-[9.5px] tracking-tight">{lang === 'en' ? 'Calls' : 'Llamados'}</span>
    </button>

    <!-- TAB 3: PORTAFOLIO -->
    <button
      type="button"
      onclick={() => (activeTab = 'portfolio')}
      class="flex flex-col items-center gap-1 transition px-2 py-1 cursor-pointer {activeTab === 'portfolio' ? 'text-zinc-950 font-semibold' : 'text-zinc-400 hover:text-zinc-600'}"
    >
      <div class="relative">
        <svg class="w-4.5 h-4.5 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
        {#if activeTab === 'portfolio'}
          <span class="absolute -top-1 -right-1 w-1.5 h-1.5 rounded-full bg-zinc-900"></span>
        {/if}
      </div>
      <span class="text-[9.5px] tracking-tight">{lang === 'en' ? 'Portfolio' : 'Portafolio'}</span>
    </button>

    <!-- TAB 4: APORTANTES -->
    <button
      type="button"
      onclick={() => (activeTab = 'lps')}
      class="flex flex-col items-center gap-1 transition px-2 py-1 cursor-pointer {activeTab === 'lps' ? 'text-zinc-950 font-semibold' : 'text-zinc-400 hover:text-zinc-600'}"
    >
      <div class="relative">
        <svg class="w-4.5 h-4.5 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
        {#if activeTab === 'lps'}
          <span class="absolute -top-1 -right-1 w-1.5 h-1.5 rounded-full bg-zinc-900"></span>
        {/if}
      </div>
      <span class="text-[9.5px] tracking-tight">{lang === 'en' ? 'LPs' : 'Aportantes'}</span>
    </button>
  </div>

  <!-- Detail Sheet Modal (supports light theme) -->
  <ZeaSheet
    theme="funds"
    variant="light"
    isOpen={sheetOpen}
    avatarText={sheetData?.avatarText || 'H2'}
    title={sheetData?.title || 'Fondo Horizon II'}
    subtitle={sheetData?.subtitle || 'Fondos'}
    progressLabel={sheetData?.progressLabel || 'Avance de inversión'}
    progressValueText={sheetData?.progressValueText || '74%'}
    progressPct={sheetData?.progressPct || 74}
    stats={sheetData?.stats || []}
    onClose={closeSheet}
  />
</div>
