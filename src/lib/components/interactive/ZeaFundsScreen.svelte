<script lang="ts">
  import { fade } from 'svelte/transition';
  import { tick } from 'svelte';
  import { dragScroll } from '../ds/dragScroll';
  import ZeaModeToggle from '../ds/ZeaModeToggle.svelte';
  import ZeaFocusCard from '../ds/ZeaFocusCard.svelte';
  import ZeaConcentricRings from '../ds/ZeaConcentricRings.svelte';
  import ZeaTimeline from '../ds/ZeaTimeline.svelte';
  import ZeaApprovalCard from '../ds/ZeaApprovalCard.svelte';
  import ZeaMetricTrend from '../ds/ZeaMetricTrend.svelte';
  import ZeaGliaBar from '../ds/ZeaGliaBar.svelte';
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
    showToast(lang === 'en' ? 'Capital Call #4 authorized ($1,250,000 USD)' : 'Llamada de Capital #4 autorizada ($1,250,000 USD)');
  }

  // =========================================================================
  // 1. TIMELINE ENTRIES (Südlich Capital Operations)
  // =========================================================================
  const fundsTimeline = $derived([
    {
      id: '1',
      time: '09:30',
      title: lang === 'en' ? 'Custodian Bank Reconciliation' : 'Conciliación Banco Custodio',
      subtitle: lang === 'en' ? '100% payments matched vs Banco de Chile' : '100% de abonos cuadraron vs Banco de Chile',
      status: 'completed' as const
    },
    {
      id: '2',
      time: '11:00',
      title: lang === 'en' ? 'Investment Committee (Board)' : 'Comité de Inversiones (Directorio)',
      subtitle: lang === 'en' ? 'Evaluate follow-on series A for Company X' : 'Evaluación desembolso Serie A Empresa X ($450K)',
      status: 'active' as const,
      onClick: () =>
        openItemDetails({
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
      onAction: () => showToast(lang === 'en' ? 'Auditing 32 LPs...' : 'Auditando 32 Aportantes...')
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

  // Asset allocation rings
  const assetRings = $derived([
    {
      label: lang === 'en' ? 'Infrastructure & Real Assets' : 'Infraestructura & Real Assets',
      value: '$8.2M',
      delta: '55%',
      pct: 0.55,
      color: '#10B981'
    },
    {
      label: lang === 'en' ? 'Private Equity & Scaleups' : 'Private Equity & Scaleups',
      value: '$4.5M',
      delta: '30%',
      pct: 0.30,
      color: '#6366F1'
    },
    {
      label: lang === 'en' ? 'Dry Powder (Liquid Cash)' : 'Dry Powder (Capital Disponible)',
      value: '$2.15M',
      delta: '15%',
      pct: 0.15,
      color: '#E2E8F0'
    }
  ]);

  // Quarterly Capital Call History
  const callBars = [2.1, 3.4, 4.2, 5.0, 7.8, 9.6, 12.4, 14.85];
  const callLabels = ['Q1', 'Q2', 'Q3', 'Q4', 'Q1', 'Q2', 'Q3', 'Hoy'];
  const capitalDistribution = $derived([
    {
      label: lang === 'en' ? 'Deployed Investments' : 'Capital Invertido',
      percentage: 70,
      color: '#10B981'
    },
    {
      label: lang === 'en' ? 'Liquid Reserves' : 'Reservas Líquidas',
      percentage: 30,
      color: '#71717A'
    }
  ]);

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
        text: lang === 'en'
          ? "Glia, what is the status of Capital Call #4 and our consolidated AUM?"
          : 'Glia, ¿cuál es el estado de la Llamada de Capital #4 y el AUM consolidado?'
      },
      {
        id: 'f-msg-1',
        sender: 'agent',
        time: '09:30',
        text: lang === 'en'
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
        reply = lang === 'en'
          ? 'All 32 LPs have been verified against the custodian bank. 2 transfers ($150,000 USD total) are undergoing clearing with Banco de Chile.'
          : 'Los 32 aportantes fueron verificados contra el banco custodio. 2 transferencias ($150.000 USD en total) están en proceso de compensación en Banco de Chile.';
      } else if (lower.includes('aprobar') || lower.includes('llamada') || lower.includes('call')) {
        reply = lang === 'en'
          ? 'Capital Call #4 is fully pre-validated with SHA-256 integrity seal. Ready for FaceID authorization.'
          : 'La Llamada de Capital #4 está pre-validada con sello de integridad SHA-256. Lista para autorización con FaceID.';
      } else {
        reply = lang === 'en'
          ? `Operations verified for Südlich Private Capital. Portfolio companies are operating within targeted parameters.`
          : `Operaciones verificadas para Südlich Capital. Las empresas de portafolio operan dentro de los parámetros esperados.`;
      }

      chatMessages.push({
        id: `agent-${uid}`,
        sender: 'agent',
        time: '09:46',
        text: reply
      });
      scrollToBottom(summaryScrollEl);
    }, 900);
  }
</script>

<!-- Interactive Toast Alert -->
{#if toastMessage}
  <div
    class="absolute top-14 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full bg-emerald-950/90 border border-emerald-500/40 text-emerald-200 text-xs font-medium shadow-2xl backdrop-blur-md flex items-center gap-2"
    in:fade={{ duration: 150 }}
    out:fade={{ duration: 150 }}
  >
    <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
    <span>{toastMessage}</span>
  </div>
{/if}

<div class="flex flex-col h-full w-full bg-black text-white relative font-sans overflow-hidden select-none" data-testid="zea-funds-screen">
  <!-- Minimalist Clean Top Header with Mode Toggle -->
  <header class="px-5 pt-3 pb-2.5 bg-black/95 backdrop-blur-md border-b border-[#222228] flex items-center justify-between z-20 shrink-0">
    <div class="flex items-center gap-2.5">
      <div class="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center font-bold text-emerald-400 text-xs font-mono shadow-sm">
        SF
      </div>
      <div>
        <h2 class="text-sm font-semibold tracking-tight text-white leading-tight">
          ZEA Funds agent
        </h2>
        <p class="text-[10px] text-zinc-400 font-mono">
          Südlich Private Capital
        </p>
      </div>
    </div>

    <ZeaModeToggle
      mode={viewMode}
      theme="funds"
      onToggle={(m) => (viewMode = m)}
    />
  </header>

  <!-- Horizontal Pill Tabs: Resumen, Llamados, Portafolio, Aportantes -->
  <nav
    use:dragScroll
    class="flex items-center gap-1.5 px-4 py-2 border-b border-[#1E1E26] overflow-x-auto no-scrollbar shrink-0 bg-[#0E0E12] cursor-grab active:cursor-grabbing"
  >
    <button
      type="button"
      onclick={() => (activeTab = 'summary')}
      class="px-3.5 py-1.5 rounded-full text-xs font-medium transition cursor-pointer shrink-0 {activeTab === 'summary' ? 'bg-[#10B981] text-white font-semibold' : 'bg-[#16161C] border border-[#26262E] text-zinc-400 hover:text-white'}"
    >
      {lang === 'en' ? 'Summary' : 'Resumen'}
    </button>
    <button
      type="button"
      onclick={() => (activeTab = 'calls')}
      class="px-3.5 py-1.5 rounded-full text-xs font-medium transition cursor-pointer shrink-0 {activeTab === 'calls' ? 'bg-[#10B981] text-white font-semibold' : 'bg-[#16161C] border border-[#26262E] text-zinc-400 hover:text-white'}"
    >
      {lang === 'en' ? 'Capital Calls' : 'Llamados'}
    </button>
    <button
      type="button"
      onclick={() => (activeTab = 'portfolio')}
      class="px-3.5 py-1.5 rounded-full text-xs font-medium transition cursor-pointer shrink-0 {activeTab === 'portfolio' ? 'bg-[#10B981] text-white font-semibold' : 'bg-[#16161C] border border-[#26262E] text-zinc-400 hover:text-white'}"
    >
      {lang === 'en' ? 'Portfolio' : 'Portafolio'}
    </button>
    <button
      type="button"
      onclick={() => (activeTab = 'lps')}
      class="px-3.5 py-1.5 rounded-full text-xs font-medium transition cursor-pointer shrink-0 {activeTab === 'lps' ? 'bg-[#10B981] text-white font-semibold' : 'bg-[#16161C] border border-[#26262E] text-zinc-400 hover:text-white'}"
    >
      {lang === 'en' ? 'LPs / Investors' : 'Aportantes'}
    </button>
  </nav>

  <!-- Scrollable Main Content -->
  <div class="flex-1 overflow-hidden relative">
    {#each ['summary', 'calls', 'portfolio', 'lps'] as tab}
      {#if activeTab === tab}
        <div class="h-full flex flex-col" in:fade={{ duration: 150 }}>
          {#if viewMode === 'chat'}
            <!-- Chat Mode View -->
            <div
              bind:this={summaryScrollEl}
              class="flex-1 overflow-y-auto px-4 py-3 space-y-3.5 text-xs text-left"
            >
              {#each chatMessages as msg (msg.id)}
                {#if msg.sender === 'user'}
                  <div class="flex justify-end">
                    <div class="max-w-[85%] px-3.5 py-2.5 rounded-2xl bg-[#1C1C22] border border-[#2D2D38] text-white shadow-sm leading-relaxed">
                      <p>{msg.text}</p>
                      <span class="text-[9.5px] text-zinc-500 block text-right mt-1 font-mono">{msg.time}</span>
                    </div>
                  </div>
                {:else}
                  <div class="flex justify-start">
                    <div class="max-w-[92%] space-y-2">
                      <div class="p-3.5 rounded-2xl bg-[#141418] border border-[#24242C] text-zinc-200 shadow-sm leading-relaxed space-y-2">
                        <div class="flex items-center gap-1.5 text-emerald-400 text-[11px] font-medium">
                          <span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                          <span>{lang === 'en' ? 'Glia Funds Agent' : 'Glia Agente de Fondos'}</span>
                        </div>
                        <p class="text-[12.5px] text-zinc-300 leading-normal">{msg.text}</p>
                        <span class="text-[9.5px] text-zinc-500 block font-mono">{msg.time}</span>
                      </div>

                      {#if msg.isPrimarySummary}
                        <!-- Interactive Focus Card Embedded in Chat Stream -->
                        <ZeaFocusCard
                          theme="funds"
                          badgeText={lang === 'en' ? 'Capital Call #4 Active' : 'Llamada de Capital #4 en curso'}
                          etaText={lang === 'en' ? 'Closes in 48h' : 'Cierra en 48 hrs'}
                          mainMetric="$1,250,000"
                          metricSuffix=" USD"
                          avatarText="F2"
                          title="Fondo Fram II · Private Equity"
                          subtitle={lang === 'en' ? '30/32 LPs reconciled · 88% received' : '30/32 Aportantes conciliados · 88% recibido'}
                          secondaryActionLabel={lang === 'en' ? 'View LPs' : 'Ver aportantes'}
                          primaryActionLabel={lang === 'en' ? 'Sign with FaceID' : 'Firmar con FaceID'}
                          primaryDoneLabel={lang === 'en' ? '✓ Authorized' : '✓ Autorizado'}
                          isDone={faceIdSigned}
                          onSecondaryAction={() => (activeTab = 'lps')}
                          onPrimaryAction={() => {
                            faceIdSigned = true;
                            showToast(lang === 'en' ? 'Capital Call #4 signed with FaceID' : 'Llamada #4 firmada con FaceID');
                          }}
                        />
                      {/if}
                    </div>
                  </div>
                {/if}
              {/each}

              {#if isAgentTyping}
                <div class="flex items-center gap-1.5 p-3 rounded-2xl bg-[#141418] border border-[#24242C] w-24">
                  <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce"></span>
                  <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce [animation-delay:0.2s]"></span>
                  <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce [animation-delay:0.4s]"></span>
                </div>
              {/if}
            </div>

            <!-- Glia Bar Prompt Input -->
            <ZeaGliaBar
              theme="funds"
              placeholder={lang === 'en' ? 'Ask about AUM, LPs, or Capital Calls...' : 'Pregunta sobre AUM, aportantes o llamadas...'}
              chips={lang === 'en'
                ? ['Audit Custodian', 'Reconcile LPs', 'Call #4 Status']
                : ['Conciliar custodio', 'Auditar LPs', 'Estado Llamada #4']}
              bind:value={chatInputText}
              onSend={handleSendPrompt}
              onChipClick={(chip) => handleSendPrompt(chip)}
            />
          {:else}
            <!-- App Mode View (Native Cards & Financial Timelines) -->
            <div class="flex-1 overflow-y-auto px-4 py-4 space-y-4 text-left">
              <!-- 1. PRIORITY FOCUS CARD: Capital Call #4 -->
              <ZeaFocusCard
                theme="funds"
                badgeText={lang === 'en' ? 'Capital Call #4 in progress' : 'Llamada de Capital #4 en curso'}
                etaText={lang === 'en' ? 'Closes in 48h' : 'Cierra en 48 hrs'}
                mainMetric="$1,250,000"
                metricSuffix=" USD"
                avatarText="F2"
                title="Fondo Fram II · Private Equity"
                subtitle={lang === 'en' ? '30/32 LPs reconciled · $150K pending' : '30/32 Aportantes conciliados · $150K pendiente'}
                secondaryActionLabel={lang === 'en' ? 'Fund details' : 'Ver fondo'}
                primaryActionLabel={lang === 'en' ? 'Sign Call #4' : 'Aprobar llamada'}
                primaryDoneLabel={lang === 'en' ? '✓ Authorized' : '✓ Autorizada'}
                isDone={faceIdSigned}
                onSecondaryAction={() =>
                  openItemDetails({
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
                onPrimaryAction={() => {
                  faceIdSigned = true;
                  showToast(lang === 'en' ? 'Capital Call #4 authorized' : 'Llamada de Capital #4 autorizada');
                }}
              />

              <!-- 2. OPERATIONAL TIMELINE: Hoy -->
              <ZeaTimeline
                theme="funds"
                title={lang === 'en' ? 'Today' : 'Hoy'}
                headerActionLabel={lang === 'en' ? 'All events' : 'Ver todo'}
                onHeaderAction={() => (activeTab = 'calls')}
                entries={fundsTimeline}
              />

              <!-- 3. PENDING BOARD APPROVAL -->
              <ZeaApprovalCard
                theme="funds"
                title={lang === 'en' ? 'Pending Approval' : 'Por aprobar'}
                avatarText="BCI"
                entityName={lang === 'en' ? 'Capital Call #4 Authorization' : 'Autorización Llamada de Capital #4'}
                entityDetails={lang === 'en' ? 'Fund Fram II · $1,250,000 USD' : 'Fondo Fram II · $1,250,000 USD'}
                citationText={lang === 'en' ? 'SHA-256 integrity seal verified against custodian bank. Law 21.719 APDP audit seal created.' : 'Sello de integridad SHA-256 verificado contra banco custodio. Sello de auditoría Ley 21.719 generado.'}
                isApproved={callApprovalDone}
                isRejected={callApprovalRejected}
                onApprove={approveCapitalCall}
                onReject={() => {
                  callApprovalRejected = true;
                  showToast(lang === 'en' ? 'Approval postponed' : 'Aprobación postergada');
                }}
              />

              <!-- 4. ASSET ALLOCATION CONCENTRIC RINGS -->
              <ZeaConcentricRings
                theme="funds"
                title={lang === 'en' ? 'Asset Allocation' : 'Distribución de Activos'}
                subtitle=""
                items={assetRings}
              />

              <!-- 5. 8-QUARTER AUM TREND -->
              <ZeaMetricTrend
                theme="funds"
                title={lang === 'en' ? 'Consolidated AUM' : 'AUM Consolidado'}
                badgeText={lang === 'en' ? '+18.4% Net IRR' : '+18.4% TIR Neta Anual'}
                metricValue="$14.85M"
                metricUnit="USD"
                metricSubtitle={lang === 'en' ? '3 active funds · 48 institutional LPs & family offices' : '3 fondos activos · 48 LPs institucionales y family offices'}
                targetValue={20}
                targetLabel={lang === 'en' ? 'Cap $20M' : 'Meta $20M'}
                bars={callBars}
                barLabels={callLabels}
                distribution={capitalDistribution}
              />
            </div>
          {/if}
        </div>
      {/if}
    {/each}
  </div>

  <!-- Detail Sheet Modal -->
  <ZeaSheet
    theme="funds"
    isOpen={sheetOpen}
    title={sheetData?.title || 'Fondo Fram II'}
    subtitle={sheetData?.subtitle || 'Südlich Capital'}
    progressLabel={sheetData?.progressLabel || 'Avance de inversión'}
    progressValueText={sheetData?.progressValueText || '74%'}
    progressPct={sheetData?.progressPct || 74}
    stats={sheetData?.stats || []}
    onClose={closeSheet}
  />
</div>
