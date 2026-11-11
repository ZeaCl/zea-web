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
  let viewMode = $state<'chat' | 'app'>('chat');

  // Interactive state
  let toastMessage = $state<string | null>(null);
  let toastTimeout: any = null;

  // Actions states
  let callApprovalDone = $state(false);
  let callApprovalRejected = $state(false);
  let faceIdSigned = $state(false);

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
  // 1. DATA MODELS (Südlich Capital Private Equity)
  // =========================================================================
  const fundsTimeline = $derived([
    {
      id: '1',
      time: '09:30',
      title: lang === 'en' ? 'Custodian Bank Reconciliation' : 'Conciliación Banco Custodio',
      subtitle: lang === 'en' ? '100% matched vs Banco de Chile' : '100% de abonos cuadraron vs Banco de Chile',
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
          avatarText: 'F2',
          title: lang === 'en' ? 'Investment Committee: Fram II' : 'Comité de Inversiones: Fram II',
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
      subtitle: lang === 'en' ? 'Fram II · $1,250,000 USD · 88% received' : 'Fram II · $1,250,000 USD · 88% recibido',
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
      title: lang === 'en' ? 'WORM & APDP Ledger Sealing' : 'Sellado WORM & Sello APDP',
      subtitle: lang === 'en' ? 'Law 21.719 immutable audit log on GCP' : 'Log inmutable Ley 21.719 en Google Cloud',
      status: 'available' as const,
      actionLabel: lang === 'en' ? 'Verify seal' : 'Verificar sello',
      onAction: () => showToast(lang === 'en' ? 'SHA-256 seal verified' : 'Sello SHA-256 verificado')
    }
  ]);

  // Asset allocation breakdown
  const assetAllocation = $derived([
    {
      label: lang === 'en' ? 'Infrastructure & Real Assets' : 'Infraestructura & Real Assets',
      value: '$8.20M USD',
      percentage: 55,
      color: 'bg-emerald-600'
    },
    {
      label: lang === 'en' ? 'Private Equity & Scaleups' : 'Private Equity & Scaleups',
      value: '$4.50M USD',
      percentage: 30,
      color: 'bg-zinc-800'
    },
    {
      label: lang === 'en' ? 'Dry Powder (Liquid Cash)' : 'Dry Powder (Capital Disponible)',
      value: '$2.15M USD',
      percentage: 15,
      color: 'bg-emerald-400'
    }
  ]);

  // Quarterly Capital Call History
  const callBars = [2.1, 3.4, 4.2, 5.0, 7.8, 9.6, 12.4, 14.85];
  const callLabels = ['Q1', 'Q2', 'Q3', 'Q4', 'Q1', 'Q2', 'Q3', 'Hoy'];

  // Capital calls list
  const capitalCallsList = $derived([
    {
      id: 'cc-4',
      fund: 'Fondo Fram II',
      title: lang === 'en' ? 'Capital Call #4' : 'Llamada de Capital #4',
      amount: '$1,250,000 USD',
      status: 'active',
      badge: lang === 'en' ? 'Active · 88% received' : 'En curso · 88% recibido',
      dueDate: lang === 'en' ? 'Closes today at 14:30' : 'Cierra hoy a las 14:30',
      lpsReconciled: '30 / 32 LPs',
      bankStatus: 'Banco de Chile · 100% match'
    },
    {
      id: 'cc-3',
      fund: 'Fondo Fram II',
      title: lang === 'en' ? 'Capital Call #3' : 'Llamada de Capital #3',
      amount: '$2,500,000 USD',
      status: 'completed',
      badge: lang === 'en' ? 'Completed 100%' : 'Completado 100%',
      dueDate: '15 Ene 2026',
      lpsReconciled: '32 / 32 LPs',
      bankStatus: 'Banco de Chile · Conciliado'
    },
    {
      id: 'cc-2',
      fund: 'Patagonia Infraestructura I',
      title: lang === 'en' ? 'Capital Call #2' : 'Llamada de Capital #2',
      amount: '$3,800,000 USD',
      status: 'completed',
      badge: lang === 'en' ? 'Completed 100%' : 'Completado 100%',
      dueDate: '20 Oct 2025',
      lpsReconciled: '24 / 24 LPs',
      bankStatus: 'Banco Santander · Conciliado'
    },
    {
      id: 'cc-1',
      fund: 'Fram I (Vintage 2024)',
      title: lang === 'en' ? 'Capital Call #1' : 'Llamada de Capital #1',
      amount: '$5,000,000 USD',
      status: 'completed',
      badge: lang === 'en' ? 'Closed' : 'Cerrado',
      dueDate: '12 May 2024',
      lpsReconciled: '20 / 20 LPs',
      bankStatus: 'Banco de Chile · Conciliado'
    }
  ]);

  // Direct portfolio holdings
  const portfolioHoldings = $derived([
    {
      id: 'p-1',
      name: 'Frío Austral SpA',
      sector: lang === 'en' ? 'Cold Chain & Logistics' : 'Logística Frío & Exportación',
      location: 'Puerto Montt, Región de Los Lagos',
      deployed: '$4.20M USD',
      irr: '21.2% TIR',
      status: lang === 'en' ? 'Optimal operations' : 'Operación óptima',
      equityStake: '28.5%',
      vintage: '2024'
    },
    {
      id: 'p-2',
      name: 'Datacenter Patagonia',
      sector: lang === 'en' ? 'Sustainable Edge Infra' : 'Infraestructura Crítica Sostenible',
      location: 'Valdivia, Región de Los Ríos',
      deployed: '$4.00M USD',
      irr: '16.8% TIR',
      status: lang === 'en' ? 'Phase II expansion' : 'Expansión Fase II',
      equityStake: '35.0%',
      vintage: '2025'
    },
    {
      id: 'p-3',
      name: 'AgTech Sur SpA',
      sector: lang === 'en' ? 'Precision Aquaculture IoT' : 'Biometría & Sensores Salmón',
      location: 'Castro, Chiloé',
      deployed: '$2.80M USD',
      irr: '19.5% TIR',
      status: lang === 'en' ? 'Commercial scaling' : 'Escalamiento comercial',
      equityStake: '22.0%',
      vintage: '2025'
    },
    {
      id: 'p-4',
      name: 'Energías Limpias Chiloé',
      sector: lang === 'en' ? 'Renewable Energy Assets' : 'Generación Minihidro & Solar',
      location: 'Ancud, Chiloé',
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
      name: 'Family Office Los Alerces',
      rut: '76.412.890-K',
      commitment: '$2,500,000 USD',
      callShare: '$250,000 USD',
      status: 'reconciled',
      statusLabel: lang === 'en' ? 'Reconciled ✓' : 'Conciliado ✓',
      custodianBank: 'Banco de Chile',
      apdpStatus: 'Validado Ley 21.719'
    },
    {
      id: 'lp-2',
      name: 'Inversiones Antártica SpA',
      rut: '77.892.114-3',
      commitment: '$1,800,000 USD',
      callShare: '$180,000 USD',
      status: 'reconciled',
      statusLabel: lang === 'en' ? 'Reconciled ✓' : 'Conciliado ✓',
      custodianBank: 'Banco de Chile',
      apdpStatus: 'Validado Ley 21.719'
    },
    {
      id: 'lp-3',
      name: 'Fundación Patagonia Sur',
      rut: '65.109.823-1',
      commitment: '$1,200,000 USD',
      callShare: '$120,000 USD',
      status: 'reconciled',
      statusLabel: lang === 'en' ? 'Reconciled ✓' : 'Conciliado ✓',
      custodianBank: 'Banco de Chile',
      apdpStatus: 'Validado Ley 21.719'
    },
    {
      id: 'lp-4',
      name: 'Larraín & Asociados Family Office',
      rut: '76.321.009-8',
      commitment: '$1,500,000 USD',
      callShare: '$150,000 USD',
      status: 'pending',
      statusLabel: lang === 'en' ? 'In clearing ⏳' : 'En clearing ⏳',
      custodianBank: 'Banco de Chile',
      apdpStatus: 'Validado Ley 21.719'
    },
    {
      id: 'lp-5',
      name: 'Grupo Transoceánica Inversiones',
      rut: '79.112.443-2',
      commitment: '$800,000 USD',
      callShare: '$80,000 USD',
      status: 'reconciled',
      statusLabel: lang === 'en' ? 'Reconciled ✓' : 'Conciliado ✓',
      custodianBank: 'Banco de Chile',
      apdpStatus: 'Validado Ley 21.719'
    },
    {
      id: 'lp-6',
      name: 'Inversiones Reloncaví Ltda.',
      rut: '78.502.190-6',
      commitment: '$1,000,000 USD',
      callShare: '$100,000 USD',
      status: 'pending',
      statusLabel: lang === 'en' ? 'In clearing ⏳' : 'En clearing ⏳',
      custodianBank: 'Banco de Chile',
      apdpStatus: 'Validado Ley 21.719'
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
  // 2. CONVERSATIONAL STREAM (Glia Funds Agent)
  // =========================================================================
  interface ChatMessage {
    id: string;
    sender: 'user' | 'agent';
    time: string;
    text: string;
    isPrimarySummary?: boolean;
  }

  let chatMessages = $state<ChatMessage[]>([
    {
      id: 'f-msg-0',
      sender: 'user',
      time: '09:30',
      text: 'Glia, ¿cuál es el estado de la Llamada de Capital #4 y el AUM consolidado?'
    },
    {
      id: 'f-msg-1',
      sender: 'agent',
      time: '09:30',
      text: '¡Buenos días! El AUM consolidado es de $14.85M USD con una TIR anual neta de 18.4%. De la Llamada de Capital #4 hemos recibido $1,100,000 USD (88%) con 30 de 32 aportantes conciliados al 100% contra el banco custodio. Quedan $150,000 USD pendientes que cierran hoy a las 14:30.',
      isPrimarySummary: true
    }
  ]);

  $effect(() => {
    chatMessages = [
      {
        id: 'f-msg-0',
        sender: 'user',
        time: '09:30',
        text:
          lang === 'en'
            ? 'Glia, what is the status of Capital Call #4 and our consolidated AUM?'
            : 'Glia, ¿cuál es el estado de la Llamada de Capital #4 y el AUM consolidado?'
      },
      {
        id: 'f-msg-1',
        sender: 'agent',
        time: '09:30',
        text:
          lang === 'en'
            ? 'Good morning! Consolidated AUM stands at $14.85M USD with an 18.4% net annualized IRR. On Capital Call #4 we have received $1,100,000 USD (88%) with 30 of 32 LPs fully reconciled against the custodian bank. $150,000 USD remains queued for close today at 14:30.'
            : '¡Buenos días! El AUM consolidado es de $14.85M USD con una TIR anual neta de 18.4%. De la Llamada de Capital #4 hemos recibido $1,100,000 USD (88%) con 30 de 32 aportantes conciliados al 100% contra el banco custodio. Quedan $150,000 USD pendientes que cierran hoy a las 14:30.',
        isPrimarySummary: true
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
    const now = '09:45';
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

      if (lower.includes('aportante') || lower.includes('lp') || lower.includes('concilia')) {
        reply =
          lang === 'en'
            ? 'All 32 LPs have been verified against the custodian bank. 2 transfers ($150,000 USD total) are undergoing clearing with Banco de Chile.'
            : 'Los 32 aportantes fueron verificados contra el banco custodio. 2 transferencias ($150.000 USD en total) están en proceso de compensación en Banco de Chile.';
      } else if (lower.includes('aprobar') || lower.includes('llamada') || lower.includes('call')) {
        reply =
          lang === 'en'
            ? 'Capital Call #4 is fully pre-validated with SHA-256 integrity seal. Ready for FaceID authorization.'
            : 'La Llamada de Capital #4 está pre-validada con sello de integridad SHA-256. Lista para autorización con FaceID.';
      } else {
        reply =
          lang === 'en'
            ? 'Operations verified for Südlich Private Capital. Portfolio companies are operating within targeted parameters.'
            : 'Operaciones verificadas para Südlich Capital. Las empresas de portafolio operan dentro de los parámetros esperados.';
      }

      chatMessages.push({
        id: `agent-${uid}`,
        sender: 'agent',
        time: '09:46',
        text: reply
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
  class="flex flex-col h-full w-full bg-[#F8F9FA] text-[#0F172A] relative font-sans overflow-hidden select-none"
  data-testid="zea-funds-screen"
>
  <!-- Institutional Editorial Top Header -->
  <header
    class="px-4.5 pt-3 pb-2.5 bg-white/95 backdrop-blur-md border-b border-[#E5E7EB] flex items-center justify-between z-20 shrink-0 shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
  >
    <div class="flex items-center gap-2.5">
      <div
        class="w-8 h-8 rounded-lg bg-[#0F172A] text-white flex items-center justify-center font-bold text-xs font-mono shadow-sm"
      >
        SF
      </div>
      <div>
        <div class="flex items-center gap-1.5">
          <h2 class="text-sm font-semibold tracking-tight text-zinc-900 leading-tight">
            ZEA Funds agent
          </h2>
          <span
            class="hidden sm:inline-flex items-center gap-1 text-[9px] font-mono text-emerald-800 bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded-md"
          >
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
            WORM
          </span>
        </div>
        <p class="text-[10.5px] text-zinc-500 font-mono">
          Südlich Private Capital
        </p>
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
    <!-- TAB 1: RESUMEN (SUMMARY)                                  -->
    <!-- ========================================================= -->
    {#if activeTab === 'summary'}
      <div class="h-full flex flex-col" in:fade={{ duration: 150 }}>
        {#if viewMode === 'chat'}
          <!-- Harvey AI Chat Stream -->
          <div
            bind:this={summaryScrollEl}
            class="flex-1 overflow-y-auto px-4 py-3.5 space-y-3.5 text-xs text-left"
          >
            {#each chatMessages as msg (msg.id)}
              {#if msg.sender === 'user'}
                <div class="flex justify-end">
                  <div
                    class="max-w-[85%] px-3.5 py-2.5 rounded-2xl rounded-tr-xs bg-[#F1F5F9] border border-[#E2E8F0] text-zinc-900 shadow-xs leading-relaxed"
                  >
                    <p>{msg.text}</p>
                    <span class="text-[9.5px] text-zinc-400 block text-right mt-1 font-mono">{msg.time}</span>
                  </div>
                </div>
              {:else}
                <div class="flex justify-start">
                  <div class="max-w-[92%] space-y-2">
                    <div
                      class="p-3.5 rounded-2xl rounded-tl-xs bg-white border border-[#E5E7EB] text-zinc-800 shadow-[0_1px_3px_rgba(0,0,0,0.03)] leading-relaxed space-y-2"
                    >
                      <div class="flex items-center gap-1.5 text-[#065F46] text-[11px] font-semibold">
                        <span class="w-1.5 h-1.5 rounded-full bg-[#065F46]"></span>
                        <span>{lang === 'en' ? 'Glia Funds Agent' : 'Glia Agente de Fondos'}</span>
                      </div>
                      <p class="text-[12.5px] text-zinc-700 leading-normal">{msg.text}</p>
                      <span class="text-[9.5px] text-zinc-400 block font-mono">{msg.time}</span>
                    </div>

                    {#if msg.isPrimarySummary}
                      <!-- Harvey Style Interactive Priority Focus Card -->
                      <div
                        class="p-4 rounded-2xl bg-white border border-[#E5E7EB] shadow-[0_1px_4px_rgba(0,0,0,0.04)] space-y-3"
                      >
                        <div class="flex items-center justify-between">
                          <span
                            class="inline-flex items-center gap-1.5 text-[11px] font-medium text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full"
                          >
                            <span class="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                            {lang === 'en' ? 'Capital Call #4 Active' : 'Llamada de Capital #4 en curso'}
                          </span>
                          <span
                            class="text-[10px] font-semibold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full font-mono"
                          >
                            {lang === 'en' ? 'Closes in 48h' : 'Cierra en 48 hrs'}
                          </span>
                        </div>

                        <div>
                          <div class="text-[26px] font-semibold text-zinc-900 font-mono tracking-tight leading-none">
                            $1,250,000<span class="text-zinc-500 text-[18px]"> USD</span>
                          </div>
                          <p class="text-[12px] font-medium text-zinc-700 mt-1">
                            Fondo Fram II · Private Equity
                          </p>
                          <p class="text-[11px] text-zinc-500">
                            {lang === 'en' ? '30/32 LPs reconciled · 88% received' : '30/32 Aportantes conciliados · 88% recibido'}
                          </p>
                        </div>

                        <!-- Progress Bar -->
                        <div class="space-y-1">
                          <div class="flex justify-between text-[10px] text-zinc-500 font-mono">
                            <span>$1,100,000 USD recibido</span>
                            <span class="font-semibold text-emerald-700">88%</span>
                          </div>
                          <div class="h-2 rounded-full bg-zinc-100 overflow-hidden">
                            <div class="h-full rounded-full bg-[#065F46]" style="width: 88%;"></div>
                          </div>
                        </div>

                        <div class="grid grid-cols-2 gap-2 pt-1">
                          <button
                            type="button"
                            onclick={() => (activeTab = 'lps')}
                            class="px-3 py-2 rounded-xl text-xs font-medium bg-white border border-[#E5E7EB] text-zinc-800 hover:bg-zinc-50 transition cursor-pointer text-center"
                          >
                            {lang === 'en' ? 'View LPs' : 'Ver aportantes'}
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
                            class="px-3 py-2 rounded-xl text-xs font-medium transition cursor-pointer text-center {faceIdSigned ? 'bg-emerald-700 text-white font-semibold' : 'bg-zinc-950 text-white hover:bg-zinc-800'}"
                          >
                            {faceIdSigned ? (lang === 'en' ? '✓ Authorized' : '✓ Autorizado') : (lang === 'en' ? 'Sign with FaceID' : 'Firmar con FaceID')}
                          </button>
                        </div>
                      </div>
                    {/if}
                  </div>
                </div>
              {/if}
            {/each}

            {#if isAgentTyping}
              <div
                class="flex items-center gap-1.5 p-3 rounded-2xl bg-white border border-[#E5E7EB] w-20 shadow-xs"
              >
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-bounce"></span>
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-bounce [animation-delay:0.2s]"></span>
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-bounce [animation-delay:0.4s]"></span>
              </div>
            {/if}
          </div>

          <!-- Light Harvey Prompt Bar -->
          <div class="shrink-0 bg-white border-t border-[#E5E7EB] p-2.5 space-y-2 z-20">
            <div class="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
              {#each (lang === 'en' ? ['Audit Custodian', 'Reconcile LPs', 'Call #4 Status'] : ['Conciliar custodio', 'Auditar LPs', 'Estado Llamada #4']) as chip}
                <button
                  type="button"
                  onclick={() => handleSendPrompt(chip)}
                  class="shrink-0 px-3 py-1 rounded-full text-[11px] font-medium bg-[#F8F9FA] hover:bg-[#F1F5F9] border border-[#E5E7EB] text-zinc-700 transition cursor-pointer"
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
                placeholder={lang === 'en' ? 'Ask about AUM, LPs, or Capital Calls...' : 'Pregunta sobre AUM, aportantes o llamadas...'}
                class="flex-1 bg-[#F8F9FA] border border-[#E2E8F0] rounded-xl px-3.5 py-2 text-xs text-zinc-900 placeholder:text-zinc-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-zinc-400"
              />
              <button
                type="submit"
                aria-label="Enviar prompt"
                class="p-2 rounded-xl bg-zinc-900 text-white hover:bg-zinc-800 transition cursor-pointer shrink-0"
              >
                <svg class="w-4 h-4 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </button>
            </form>
          </div>
        {:else}
          <!-- App Mode (Harvey Institutional Cards) -->
          <div class="flex-1 overflow-y-auto px-4 py-4 space-y-4 text-left">
            <!-- 1. PRIORITY FOCUS CARD: Capital Call #4 -->
            <section
              class="p-4 rounded-2xl bg-white border border-[#E5E7EB] shadow-[0_1px_4px_rgba(0,0,0,0.04)] space-y-3"
            >
              <div class="flex items-center justify-between">
                <span
                  class="inline-flex items-center gap-1.5 text-[11px] font-medium text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full"
                >
                  <span class="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                  {lang === 'en' ? 'Capital Call #4 in progress' : 'Llamada de Capital #4 en curso'}
                </span>
                <span
                  class="text-[10px] font-semibold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full font-mono"
                >
                  {lang === 'en' ? 'Closes in 48h' : 'Cierra en 48 hrs'}
                </span>
              </div>

              <div>
                <div class="text-[28px] font-semibold text-zinc-900 font-mono tracking-tight leading-none">
                  $1,250,000<span class="text-zinc-500 text-[18px]"> USD</span>
                </div>
                <p class="text-[13px] font-medium text-zinc-800 mt-1">
                  Fondo Fram II · Private Equity
                </p>
                <p class="text-[11.5px] text-zinc-500">
                  {lang === 'en' ? '30/32 LPs reconciled · $150K pending' : '30/32 Aportantes conciliados · $150K pendiente'}
                </p>
              </div>

              <div class="p-2.5 rounded-xl bg-[#F8F9FA] border border-[#E5E7EB] flex items-center justify-between text-xs">
                <span class="text-zinc-600 font-medium">Banco Custodio</span>
                <span class="font-mono text-emerald-700 font-semibold">Banco de Chile · 100% Conciliado</span>
              </div>

              <div class="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onclick={() =>
                    openItemDetails({
                      avatarText: 'F2',
                      title: 'Fondo Fram II (Südlich)',
                      subtitle: 'Private Equity · Vintage 2026',
                      progressLabel: 'AUM Objetivo alcanzado',
                      progressValueText: '$14.85M de $20M',
                      progressPct: 74,
                      stats: [
                        { label: 'TIR Neta', value: '18.4%' },
                        { label: 'Moneda', value: 'USD' }
                      ]
                    })}
                  class="px-3.5 py-2 rounded-xl text-xs font-medium bg-white border border-[#E5E7EB] text-zinc-800 hover:bg-zinc-50 transition cursor-pointer text-center"
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
                  class="px-3.5 py-2 rounded-xl text-xs font-medium transition cursor-pointer text-center {faceIdSigned ? 'bg-emerald-700 text-white font-semibold' : 'bg-zinc-950 text-white hover:bg-zinc-800'}"
                >
                  {faceIdSigned ? (lang === 'en' ? '✓ Authorized' : '✓ Autorizada') : (lang === 'en' ? 'Sign Call #4' : 'Aprobar llamada')}
                </button>
              </div>
            </section>

            <!-- 2. OPERATIONAL TIMELINE: Hoy -->
            <section
              class="p-4 rounded-2xl bg-white border border-[#E5E7EB] shadow-[0_1px_4px_rgba(0,0,0,0.04)] space-y-3"
            >
              <div class="flex items-baseline justify-between">
                <h4 class="text-[14px] font-semibold text-zinc-900 tracking-tight">
                  {lang === 'en' ? 'Today Operations' : 'Operaciones de Hoy'}
                </h4>
                <button
                  type="button"
                  onclick={() => (activeTab = 'calls')}
                  class="text-[11.5px] font-medium text-emerald-700 hover:text-emerald-800 transition cursor-pointer"
                >
                  {lang === 'en' ? 'All events' : 'Ver todo'}
                </button>
              </div>

              <div class="space-y-2.5">
                {#each fundsTimeline as item}
                  <div
                    class="p-3 rounded-xl bg-[#F8F9FA] border border-[#E5E7EB] hover:border-zinc-300 transition flex items-start justify-between gap-3"
                  >
                    <div class="flex items-start gap-2.5">
                      <span class="text-[11px] font-mono font-semibold text-zinc-500 pt-0.5">
                        {item.time}
                      </span>
                      <div>
                        <p class="text-[12.5px] font-semibold text-zinc-900 leading-snug">
                          {item.title}
                        </p>
                        <p class="text-[11px] text-zinc-500 leading-normal mt-0.5">
                          {item.subtitle}
                        </p>
                      </div>
                    </div>

                    {#if item.actionLabel}
                      <button
                        type="button"
                        onclick={() => item.onAction?.()}
                        class="text-[10.5px] font-medium text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2 py-1 rounded-lg shrink-0 cursor-pointer transition"
                      >
                        {item.actionLabel}
                      </button>
                    {:else if item.onClick}
                      <button
                        type="button"
                        onclick={() => item.onClick?.()}
                        class="text-[10.5px] font-medium text-zinc-700 bg-white hover:bg-zinc-50 border border-zinc-200 px-2 py-1 rounded-lg shrink-0 cursor-pointer transition"
                      >
                        {lang === 'en' ? 'Details' : 'Ficha'}
                      </button>
                    {/if}
                  </div>
                {/each}
              </div>
            </section>

            <!-- 3. PENDING BOARD APPROVAL -->
            {#if !callApprovalDone && !callApprovalRejected}
              <section
                class="p-4 rounded-2xl bg-white border border-[#E5E7EB] shadow-[0_1px_4px_rgba(0,0,0,0.04)] space-y-3"
              >
                <div class="flex items-center justify-between">
                  <span class="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200">
                    {lang === 'en' ? 'Pending Approval' : 'Por Aprobar'}
                  </span>
                  <span class="text-[10px] font-mono text-zinc-400">
                    Fram II · Board
                  </span>
                </div>

                <div>
                  <h4 class="text-[14px] font-semibold text-zinc-900">
                    {lang === 'en' ? 'Capital Call #4 Authorization' : 'Autorización Llamada de Capital #4'}
                  </h4>
                  <p class="text-[11.5px] text-zinc-600 mt-0.5">
                    Fund Fram II · $1,250,000 USD
                  </p>
                  <p class="text-[11px] text-zinc-500 mt-2 bg-[#F8F9FA] p-2 rounded-lg border border-[#E5E7EB] leading-relaxed">
                    {lang === 'en'
                      ? 'SHA-256 integrity seal verified against custodian bank. Law 21.719 APDP audit seal created.'
                      : 'Sello de integridad SHA-256 verificado contra banco custodio. Sello de auditoría Ley 21.719 generado.'}
                  </p>
                </div>

                <div class="grid grid-cols-2 gap-2 pt-1">
                  <button
                    type="button"
                    onclick={() => {
                      callApprovalRejected = true;
                      showToast(lang === 'en' ? 'Approval postponed' : 'Aprobación postergada');
                    }}
                    class="px-3 py-2 rounded-xl text-xs font-medium bg-white border border-[#E5E7EB] text-zinc-700 hover:bg-zinc-50 transition cursor-pointer"
                  >
                    {lang === 'en' ? 'Postpone' : 'Postergar'}
                  </button>
                  <button
                    type="button"
                    onclick={approveCapitalCall}
                    class="px-3 py-2 rounded-xl text-xs font-medium bg-zinc-950 text-white hover:bg-zinc-800 transition cursor-pointer"
                  >
                    {lang === 'en' ? 'Approve' : 'Aprobar'}
                  </button>
                </div>
              </section>
            {/if}

            <!-- 4. ASSET ALLOCATION BREAKDOWN -->
            <section
              class="p-4 rounded-2xl bg-white border border-[#E5E7EB] shadow-[0_1px_4px_rgba(0,0,0,0.04)] space-y-3"
            >
              <div class="flex items-baseline justify-between">
                <h4 class="text-[14px] font-semibold text-zinc-900 tracking-tight">
                  {lang === 'en' ? 'Asset Allocation' : 'Distribución de Activos'}
                </h4>
                <span class="text-[11px] text-zinc-500 font-mono">$14.85M USD Total</span>
              </div>

              <div class="space-y-2.5">
                {#each assetAllocation as item}
                  <div>
                    <div class="flex justify-between text-xs mb-1">
                      <span class="text-zinc-700 font-medium">{item.label}</span>
                      <span class="font-mono text-zinc-900 font-semibold">{item.value} ({item.percentage}%)</span>
                    </div>
                    <div class="h-2 rounded-full bg-zinc-100 overflow-hidden">
                      <div class="h-full rounded-full {item.color}" style="width: {item.percentage}%;"></div>
                    </div>
                  </div>
                {/each}
              </div>
            </section>

            <!-- 5. CONSOLIDATED AUM & TREND -->
            <section
              class="p-4 rounded-2xl bg-white border border-[#E5E7EB] shadow-[0_1px_4px_rgba(0,0,0,0.04)] space-y-3"
            >
              <div class="flex items-baseline justify-between">
                <div>
                  <span class="text-[11px] text-zinc-500 uppercase tracking-wider block font-mono">
                    {lang === 'en' ? 'Consolidated AUM' : 'AUM Consolidado'}
                  </span>
                  <div class="text-[26px] font-semibold text-zinc-900 font-mono tracking-tight leading-tight mt-0.5">
                    $14.85M <span class="text-zinc-500 text-[16px]">USD</span>
                  </div>
                </div>
                <span
                  class="text-[11px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full font-mono"
                >
                  +18.4% TIR Neta
                </span>
              </div>

              <p class="text-[11px] text-zinc-500">
                {lang === 'en'
                  ? '3 active funds · 48 institutional LPs & family offices'
                  : '3 fondos activos · 48 LPs institucionales y family offices'}
              </p>

              <!-- Clean Light Bar Chart -->
              <div class="pt-2">
                <div class="flex items-end justify-between gap-1.5 h-20 pt-4 px-1 border-b border-[#E5E7EB]">
                  {#each callBars as val, idx}
                    <div class="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                      <div
                        class="w-full rounded-t-xs transition-all {idx === callBars.length - 1 ? 'bg-emerald-600' : 'bg-zinc-200 hover:bg-zinc-300'}"
                        style="height: {(val / 15) * 100}%;"
                      ></div>
                    </div>
                  {/each}
                </div>
                <div class="flex justify-between text-[9px] text-zinc-400 font-mono pt-1.5 px-1">
                  {#each callLabels as label}
                    <span>{label}</span>
                  {/each}
                </div>
              </div>
            </section>
          </div>
        {/if}
      </div>

    <!-- ========================================================= -->
    <!-- TAB 2: LLAMADOS (CAPITAL CALLS)                           -->
    <!-- ========================================================= -->
    {:else if activeTab === 'calls'}
      <div class="h-full flex flex-col overflow-y-auto px-4 py-4 space-y-4 text-left" in:fade={{ duration: 150 }}>
        <!-- Summary Metric Card -->
        <div class="p-4 rounded-2xl bg-white border border-[#E5E7EB] shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
          <span class="text-[11px] text-zinc-500 font-mono uppercase tracking-wider block">
            {lang === 'en' ? 'Capital Call Status · Active Funds' : 'Estado de Llamados · Fondos Activos'}
          </span>
          <div class="grid grid-cols-3 gap-2 mt-2 pt-2 border-t border-[#E5E7EB] text-center">
            <div>
              <span class="text-[10px] text-zinc-500 block">Comprometido</span>
              <span class="text-[14px] font-semibold text-zinc-900 font-mono">$20.0M</span>
            </div>
            <div>
              <span class="text-[10px] text-zinc-500 block">Llamado</span>
              <span class="text-[14px] font-semibold text-emerald-700 font-mono">$12.55M</span>
            </div>
            <div>
              <span class="text-[10px] text-zinc-500 block">Cumplimiento</span>
              <span class="text-[14px] font-semibold text-zinc-900 font-mono">99.1%</span>
            </div>
          </div>
        </div>

        <div class="space-y-3">
          {#each capitalCallsList as call}
            <div
              class="p-4 rounded-2xl bg-white border border-[#E5E7EB] shadow-[0_1px_3px_rgba(0,0,0,0.03)] space-y-2.5"
            >
              <div class="flex items-center justify-between">
                <span class="text-[11px] font-medium text-zinc-500 font-mono">{call.fund}</span>
                <span
                  class="text-[10px] font-mono px-2 py-0.5 rounded-full {call.status === 'active' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold' : 'bg-zinc-100 text-zinc-600'}"
                >
                  {call.badge}
                </span>
              </div>

              <div class="flex items-baseline justify-between">
                <h4 class="text-[15px] font-semibold text-zinc-900">{call.title}</h4>
                <span class="text-[16px] font-semibold text-zinc-900 font-mono">{call.amount}</span>
              </div>

              <div class="pt-2 border-t border-[#E5E7EB] flex items-center justify-between text-xs text-zinc-600">
                <span>{call.lpsReconciled}</span>
                <span class="font-mono text-[11px] text-emerald-700">{call.bankStatus}</span>
              </div>

              {#if call.status === 'active'}
                <button
                  type="button"
                  onclick={() => {
                    activeTab = 'lps';
                    showToast('Abriendo nómina de LPs...');
                  }}
                  class="w-full mt-1 py-1.5 rounded-xl text-xs font-medium bg-[#065F46] hover:bg-emerald-800 text-white transition cursor-pointer text-center"
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
      <div class="h-full flex flex-col overflow-y-auto px-4 py-4 space-y-4 text-left" in:fade={{ duration: 150 }}>
        <!-- Summary Banner -->
        <div class="p-4 rounded-2xl bg-white border border-[#E5E7EB] shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
          <span class="text-[11px] text-zinc-500 font-mono uppercase tracking-wider block">
            {lang === 'en' ? 'Direct Portfolio Holdings' : 'Empresas en Portafolio Directo'}
          </span>
          <div class="flex items-baseline justify-between mt-1">
            <span class="text-[22px] font-semibold text-zinc-900 font-mono">$12.70M USD</span>
            <span class="text-xs text-zinc-500 font-medium">4 Activos Operativos</span>
          </div>
        </div>

        <div class="space-y-3">
          {#each portfolioHoldings as holding}
            <div
              class="p-4 rounded-2xl bg-white border border-[#E5E7EB] shadow-[0_1px_3px_rgba(0,0,0,0.03)] space-y-2.5"
            >
              <div class="flex items-center justify-between">
                <span class="text-[11px] font-mono text-zinc-500">{holding.sector}</span>
                <span class="text-[10.5px] font-mono font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                  {holding.irr}
                </span>
              </div>

              <div>
                <h4 class="text-[15px] font-semibold text-zinc-900">{holding.name}</h4>
                <p class="text-[11px] text-zinc-500 mt-0.5">{holding.location}</p>
              </div>

              <div class="pt-2 border-t border-[#E5E7EB] grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span class="text-[10px] text-zinc-400 block font-mono">Capital Desplegado</span>
                  <span class="font-semibold text-zinc-900 font-mono">{holding.deployed}</span>
                </div>
                <div>
                  <span class="text-[10px] text-zinc-400 block font-mono">Participación</span>
                  <span class="font-semibold text-zinc-900 font-mono">{holding.equityStake}</span>
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
                class="w-full mt-1 py-1.5 rounded-xl text-xs font-medium bg-[#F8F9FA] hover:bg-zinc-100 border border-[#E5E7EB] text-zinc-800 transition cursor-pointer text-center"
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
      <div class="h-full flex flex-col overflow-y-auto px-4 py-4 space-y-3.5 text-left" in:fade={{ duration: 150 }}>
        <!-- Search & Filter Bar -->
        <div class="relative">
          <input
            type="text"
            bind:value={lpSearchQuery}
            placeholder={lang === 'en' ? 'Search LP or tax ID...' : 'Buscar aportante o RUT...'}
            class="w-full bg-white border border-[#E5E7EB] rounded-xl px-3.5 py-2 text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400 shadow-xs"
          />
        </div>

        <!-- Compliance & Regulatory Banner -->
        <div class="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200/80 text-emerald-900 text-xs space-y-1">
          <div class="flex items-center gap-1.5 font-semibold text-[11.5px]">
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
            <span>{lang === 'en' ? 'Law 21.719 APDP & WORM Ledger' : 'Ley 21.719 APDP & Sellado WORM'}</span>
          </div>
          <p class="text-[10.5px] text-emerald-800 leading-normal">
            {lang === 'en'
              ? 'Investor records are protected under encrypted enclave with immutable audit log on GCP.'
              : 'Nómina protegida bajo enclave encriptado con log de auditoría inmutable en Google Cloud.'}
          </p>
        </div>

        <!-- LPs List -->
        <div class="space-y-2.5">
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
              class="w-full p-3.5 rounded-2xl bg-white border border-[#E5E7EB] shadow-[0_1px_3px_rgba(0,0,0,0.03)] hover:border-zinc-300 text-left transition flex items-center justify-between cursor-pointer"
            >
              <div>
                <div class="flex items-center gap-2">
                  <h4 class="text-[13px] font-semibold text-zinc-900">{lp.name}</h4>
                  <span
                    class="text-[9.5px] font-mono px-1.5 py-0.2 rounded-md {lp.status === 'reconciled' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-amber-50 text-amber-800 border border-amber-200'}"
                  >
                    {lp.statusLabel}
                  </span>
                </div>
                <p class="text-[11px] text-zinc-500 font-mono mt-0.5">
                  RUT: {lp.rut} · {lp.custodianBank}
                </p>
              </div>

              <div class="text-right shrink-0">
                <span class="text-[13px] font-semibold text-zinc-900 font-mono block">{lp.callShare}</span>
                <span class="text-[10px] text-zinc-400 font-mono">de {lp.commitment}</span>
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
    class="shrink-0 h-14 bg-white/95 backdrop-blur-md border-t border-[#E5E7EB] flex items-center justify-around px-2 z-20 shadow-[0_-1px_3px_rgba(0,0,0,0.02)]"
  >
    <!-- TAB 1: RESUMEN -->
    <button
      type="button"
      onclick={() => (activeTab = 'summary')}
      class="flex flex-col items-center gap-1 transition px-2 py-1 cursor-pointer {activeTab === 'summary' ? 'text-[#065F46] font-semibold' : 'text-zinc-400 hover:text-zinc-600'}"
    >
      <div class="relative">
        <svg class="w-5 h-5 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        {#if activeTab === 'summary'}
          <span class="absolute -top-1 -right-1 w-1.5 h-1.5 rounded-full bg-[#065F46]"></span>
        {/if}
      </div>
      <span class="text-[10px] tracking-tight">{lang === 'en' ? 'Summary' : 'Resumen'}</span>
    </button>

    <!-- TAB 2: LLAMADOS -->
    <button
      type="button"
      onclick={() => (activeTab = 'calls')}
      class="flex flex-col items-center gap-1 transition px-2 py-1 cursor-pointer {activeTab === 'calls' ? 'text-[#065F46] font-semibold' : 'text-zinc-400 hover:text-zinc-600'}"
    >
      <div class="relative">
        <svg class="w-5 h-5 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        {#if activeTab === 'calls'}
          <span class="absolute -top-1 -right-1 w-1.5 h-1.5 rounded-full bg-[#065F46]"></span>
        {/if}
      </div>
      <span class="text-[10px] tracking-tight">{lang === 'en' ? 'Calls' : 'Llamados'}</span>
    </button>

    <!-- TAB 3: PORTAFOLIO -->
    <button
      type="button"
      onclick={() => (activeTab = 'portfolio')}
      class="flex flex-col items-center gap-1 transition px-2 py-1 cursor-pointer {activeTab === 'portfolio' ? 'text-[#065F46] font-semibold' : 'text-zinc-400 hover:text-zinc-600'}"
    >
      <div class="relative">
        <svg class="w-5 h-5 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
        {#if activeTab === 'portfolio'}
          <span class="absolute -top-1 -right-1 w-1.5 h-1.5 rounded-full bg-[#065F46]"></span>
        {/if}
      </div>
      <span class="text-[10px] tracking-tight">{lang === 'en' ? 'Portfolio' : 'Portafolio'}</span>
    </button>

    <!-- TAB 4: APORTANTES -->
    <button
      type="button"
      onclick={() => (activeTab = 'lps')}
      class="flex flex-col items-center gap-1 transition px-2 py-1 cursor-pointer {activeTab === 'lps' ? 'text-[#065F46] font-semibold' : 'text-zinc-400 hover:text-zinc-600'}"
    >
      <div class="relative">
        <svg class="w-5 h-5 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
        {#if activeTab === 'lps'}
          <span class="absolute -top-1 -right-1 w-1.5 h-1.5 rounded-full bg-[#065F46]"></span>
        {/if}
      </div>
      <span class="text-[10px] tracking-tight">{lang === 'en' ? 'LPs' : 'Aportantes'}</span>
    </button>
  </div>

  <!-- Detail Sheet Modal (supports light theme) -->
  <ZeaSheet
    theme="funds"
    variant="light"
    isOpen={sheetOpen}
    avatarText={sheetData?.avatarText || 'SF'}
    title={sheetData?.title || 'Fondo Fram II'}
    subtitle={sheetData?.subtitle || 'Südlich Capital'}
    progressLabel={sheetData?.progressLabel || 'Avance de inversión'}
    progressValueText={sheetData?.progressValueText || '74%'}
    progressPct={sheetData?.progressPct || 74}
    stats={sheetData?.stats || []}
    onClose={closeSheet}
  />
</div>
