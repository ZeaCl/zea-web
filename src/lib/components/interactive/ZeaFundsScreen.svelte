<script lang="ts">
  import { fade } from 'svelte/transition';
  import { tick } from 'svelte';
  import ZeaLogo from '../atoms/ZeaLogo.svelte';
  import ZeaModeToggle from '../ds/ZeaModeToggle.svelte';
  import ZeaSheet from '../ds/ZeaSheet.svelte';

  let {
    lang = 'es',
    platform = 'ios'
  }: {
    lang?: 'en' | 'es';
    platform?: 'ios' | 'android';
  } = $props();

  const es = $derived(lang !== 'en');

  // Navigation tabs: Resumen, Llamados, Portafolio, Aportantes
  let activeTab = $state<'summary' | 'calls' | 'portfolio' | 'lps'>('summary');
  // Chat is the default mode
  let viewMode = $state<'chat' | 'app'>('chat');

  let toastMessage = $state<string | null>(null);
  let toastTimeout: any = null;
  let faceIdSigned = $state(false);

  let sheetOpen = $state(false);
  let sheetData = $state<any>(null);
  let lpSearchQuery = $state('');

  function showToast(msg: string) {
    if (toastTimeout) clearTimeout(toastTimeout);
    toastMessage = msg;
    toastTimeout = setTimeout(() => (toastMessage = null), 2500);
  }

  function openItemDetails(item: any) {
    sheetData = item;
    sheetOpen = true;
  }

  function signCall() {
    faceIdSigned = true;
    showToast(es ? 'Llamada #4 firmada con FaceID' : 'Capital Call #4 signed with FaceID');
  }

  // =========================================================================
  // 1. CHART DATA (Harvey-style hairline density charts)
  // =========================================================================
  // Exponential AUM growth: thin vertical hairlines
  const aumLines = Array.from({ length: 64 }, (_, i) => {
    const t = i / 63;
    const v = 10 + 88 * Math.pow(t, 2.4) + Math.sin(i * 1.7) * 2.5;
    return Math.max(6, Math.min(100, v));
  });

  // Sigmoid collection curve for Capital Call #4
  const callLines = Array.from({ length: 64 }, (_, i) => {
    const t = i / 63;
    const v = 12 + 80 / (1 + Math.exp(-9 * (t - 0.45))) + Math.sin(i * 2.3) * 2;
    return Math.max(6, Math.min(100, v));
  });

  // Peers benchmark curve (thin gray line overlay)
  const peersPath = Array.from({ length: 24 }, (_, i) => {
    const t = i / 23;
    const y = 100 - (24 + 42 * Math.pow(t, 1.25));
    return `${i === 0 ? 'M' : 'L'}${(t * 100).toFixed(2)},${y.toFixed(2)}`;
  }).join(' ');

  const monthLabels = $derived(es ? ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'] : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']);
  const weekLabels = $derived(es ? ['Lun', 'Mar', 'Mié', 'Jue', 'Vie'] : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']);

  // Grouped bars: deployed vs target (attention flag = clearing)
  const allocation = $derived([
    { name: 'Infra', current: 68, target: 86, attention: false },
    { name: es ? 'Activos reales' : 'Real assets', current: 58, target: 40, attention: false },
    { name: 'Scaleups', current: 46, target: 38, attention: false },
    { name: 'AgTech', current: 47, target: 52, attention: false },
    { name: es ? 'Energía' : 'Energy', current: 30, target: 26, attention: false },
    { name: es ? 'Liquidez' : 'Cash', current: 20, target: 45, attention: true }
  ]);

  // Operational events
  const fundsTimeline = $derived([
    {
      id: '1',
      time: '09:30',
      title: es ? 'Conciliación banco custodio' : 'Custodian bank reconciliation',
      subtitle: es ? 'Abonos cuadrados al 100%' : 'All payments matched',
      done: true
    },
    {
      id: '2',
      time: '11:00',
      title: es ? 'Comité de inversiones' : 'Investment committee',
      subtitle: es ? 'Serie A Empresa X · $450K' : 'Series A Company X · $450K',
      done: false,
      actionLabel: es ? 'Ficha' : 'Details',
      onAction: () =>
        openItemDetails({
          avatarText: 'H2',
          title: es ? 'Comité de inversiones' : 'Investment committee',
          subtitle: es ? 'Horizon II · Directorio' : 'Horizon II · Board',
          progressLabel: es ? 'Capital desplegado' : 'Capital deployed',
          progressValueText: '$10.2M / $14.8M',
          progressPct: 69,
          stats: [
            { label: es ? 'TIR objetivo' : 'Target IRR', value: '18.4%' },
            { label: es ? 'Añada' : 'Vintage', value: '2026' }
          ]
        })
    },
    {
      id: '3',
      time: '14:30',
      title: es ? 'Cierre llamada de capital #4' : 'Capital call #4 close',
      subtitle: es ? 'Horizon II · 88% recibido' : 'Horizon II · 88% received',
      done: false,
      actionLabel: es ? 'Auditar' : 'Audit',
      onAction: () => (activeTab = 'lps')
    },
    {
      id: '4',
      time: '16:00',
      title: es ? 'Sellado del registro de auditoría' : 'Audit ledger sealing',
      subtitle: es ? 'Ley 21.719 · registro inmutable' : 'Law 21.719 · immutable log',
      done: false,
      actionLabel: es ? 'Verificar' : 'Verify',
      onAction: () => showToast(es ? 'Sello SHA-256 verificado' : 'SHA-256 seal verified')
    }
  ]);

  const capitalCallsList = $derived([
    { id: 'cc-4', fund: 'Horizon II', title: es ? 'Llamada de capital #4' : 'Capital call #4', amount: '$1,250,000', active: true, badge: es ? 'En curso · 88%' : 'Active · 88%', lps: '30 / 32', bank: 'Banco Custodio Central' },
    { id: 'cc-3', fund: 'Horizon II', title: es ? 'Llamada de capital #3' : 'Capital call #3', amount: '$2,500,000', active: false, badge: es ? 'Completada' : 'Completed', lps: '32 / 32', bank: 'Banco Custodio Central' },
    { id: 'cc-2', fund: 'Terra Infraestructura I', title: es ? 'Llamada de capital #2' : 'Capital call #2', amount: '$3,800,000', active: false, badge: es ? 'Completada' : 'Completed', lps: '24 / 24', bank: 'Pacific Custody Bank' },
    { id: 'cc-1', fund: 'Horizon I', title: es ? 'Llamada de capital #1' : 'Capital call #1', amount: '$5,000,000', active: false, badge: es ? 'Cerrada' : 'Closed', lps: '20 / 20', bank: 'Banco Custodio Central' }
  ]);

  const portfolioHoldings = $derived([
    { id: 'p-1', name: 'Logix Cold Chain SpA', sector: es ? 'Logística y frío' : 'Logistics & cold chain', deployed: '$4.20M', irr: '21.2%', stake: '28.5%' },
    { id: 'p-2', name: 'AeroData Cloud Systems', sector: es ? 'Infraestructura edge' : 'Edge infrastructure', deployed: '$4.00M', irr: '16.8%', stake: '35.0%' },
    { id: 'p-3', name: 'BioSensor Dynamics', sector: es ? 'Sensores industriales' : 'Industrial sensors', deployed: '$2.80M', irr: '19.5%', stake: '22.0%' },
    { id: 'p-4', name: 'Solaria Clean Energy', sector: es ? 'Energía renovable' : 'Renewable energy', deployed: '$1.70M', irr: '15.4%', stake: '40.0%' }
  ]);

  const institutionalLPs = $derived([
    { id: 'lp-1', name: 'Alpha Horizon Family Office', short: 'Alpha Horizon', rut: '76.890.123-K', commitment: '$2.5M', callShare: '$250K', pct: 92, reconciled: true },
    { id: 'lp-2', name: 'Inversiones Polaris SpA', short: 'Polaris SpA', rut: '77.456.789-2', commitment: '$1.8M', callShare: '$180K', pct: 78, reconciled: true },
    { id: 'lp-3', name: 'Kensington Family Office', short: 'Kensington FO', rut: '76.123.456-8', commitment: '$1.5M', callShare: '$150K', pct: 65, reconciled: false },
    { id: 'lp-4', name: 'Fundación Solis Capital', short: 'Solis Capital', rut: '65.345.678-1', commitment: '$1.2M', callShare: '$120K', pct: 54, reconciled: true },
    { id: 'lp-5', name: 'Vanguardia Ventures Ltda.', short: 'Vanguardia', rut: '78.901.234-5', commitment: '$1.0M', callShare: '$100K', pct: 42, reconciled: false },
    { id: 'lp-6', name: 'Pacific Crest Holdings', short: 'Pacific Crest', rut: '79.234.567-3', commitment: '$0.8M', callShare: '$80K', pct: 32, reconciled: true }
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
  // 2. CONVERSATION
  // =========================================================================
  interface ChatMessage {
    id: string;
    sender: 'user' | 'agent';
    time: string;
    text: string;
    briefing?: boolean;
  }

  let chatMessages = $state<ChatMessage[]>([]);

  $effect(() => {
    chatMessages = [
      { id: 'f-0', sender: 'user', time: '09:30', text: es ? '¿Qué tenemos para hoy?' : 'What do we have for today?' },
      {
        id: 'f-1',
        sender: 'agent',
        time: '09:30',
        text: es
          ? 'Buenos días. Lo urgente es cerrar la llamada de capital #4 antes de las 14:30. Te dejo el panorama de ahora, hoy, la semana, el mes y lo proyectado.'
          : 'Good morning. The urgent item is closing capital call #4 before 14:30. Here is the picture for now, today, this week, this month and the projection.',
        briefing: true
      }
    ];
  });

  let chatInputText = $state('');
  let isAgentTyping = $state(false);
  let scrollEl = $state<HTMLDivElement | null>(null);

  async function scrollToBottom() {
    await tick();
    if (scrollEl && typeof scrollEl.scrollTo === 'function') {
      scrollEl.scrollTo({ top: scrollEl.scrollHeight, behavior: 'smooth' });
    }
  }

  function handleSendPrompt(promptText: string) {
    if (!promptText.trim()) return;
    const text = promptText.trim();
    chatInputText = '';
    const uid = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    chatMessages.push({ id: `u-${uid}`, sender: 'user', time: '09:34', text });
    scrollToBottom();

    isAgentTyping = true;
    setTimeout(() => {
      isAgentTyping = false;
      const lower = text.toLowerCase();
      let reply = '';
      let briefing = false;
      if (lower.includes('hoy') || lower.includes('today')) {
        reply = es ? 'Este es el panorama actualizado para hoy.' : 'Here is the updated picture for today.';
        briefing = true;
      } else if (lower.includes('aportante') || lower.includes('lp') || lower.includes('concilia') || lower.includes('custod')) {
        reply = es
          ? 'Los 32 aportantes fueron verificados contra el banco custodio. Dos transferencias por $150K siguen en compensación.'
          : 'All 32 LPs were verified against the custodian. Two transfers totalling $150K are still clearing.';
      } else if (lower.includes('llamada') || lower.includes('call')) {
        reply = es
          ? 'La llamada #4 está pre-validada con sello de integridad. Lista para tu firma con FaceID.'
          : 'Call #4 is pre-validated with an integrity seal. Ready for your FaceID signature.';
      } else {
        reply = es
          ? 'Operaciones verificadas. Las empresas del portafolio operan dentro de los parámetros esperados.'
          : 'Operations verified. Portfolio companies are within expected parameters.';
      }
      chatMessages.push({ id: `a-${uid}`, sender: 'agent', time: '09:35', text: reply, briefing });
      scrollToBottom();
    }, 700);
  }
</script>

<!-- ===================================================================== -->
<!-- SNIPPETS (Harvey design primitives)                                    -->
<!-- ===================================================================== -->

{#snippet chevron()}
  <svg class="w-2.5 h-2.5 text-[#8A8A8A]" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5">
    <path d="M3 4.5l3 3 3-3" stroke-linecap="round" stroke-linejoin="round" />
  </svg>
{/snippet}

{#snippet select(label: string)}
  <span class="hv-sans inline-flex items-center gap-1 text-[10px] text-[#3A3A3A] bg-white border border-[#E6E4DF] px-2 py-[3px] rounded-md">
    {label}{@render chevron()}
  </span>
{/snippet}

{#snippet up(value: string)}
  <span class="hv-sans text-[10.5px] text-[#2F7D4F] font-medium">↑ {value}</span>
{/snippet}

{#snippet cardFooter()}
  <div class="flex items-center justify-end gap-2.5 text-[#9A9A9A]">
    <svg class="w-3 h-3" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M2 4h12M4.5 8h7M7 12h2" stroke-linecap="round" /></svg>
    <svg class="w-3 h-3" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M8 2v8m0 0l-3-3m3 3l3-3M3 13h10" stroke-linecap="round" stroke-linejoin="round" /></svg>
  </div>
{/snippet}

{#snippet densityChart(lines: number[], labels: string[], showPeers: boolean, heightClass: string)}
  <div class="relative {heightClass} border-b border-[#EDEBE7]">
    <div class="absolute inset-0 flex items-end justify-between">
      {#each lines as h, i}
        <div
          class="w-px bg-[#44464D]"
          style="height: {h}%; opacity: {0.28 + 0.72 * (i / (lines.length - 1))};"
        ></div>
      {/each}
    </div>
    {#if showPeers}
      <svg class="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
        <path d={peersPath} fill="none" stroke="#A3A3A3" stroke-width="1" vector-effect="non-scaling-stroke" />
      </svg>
    {/if}
  </div>
  <div class="hv-sans flex justify-between text-[8.5px] text-[#A0A0A0] pt-1">
    {#each labels as l}<span>{l}</span>{/each}
  </div>
{/snippet}

{#snippet groupedChart()}
  <div class="flex gap-2 pt-1">
    <div class="hv-sans flex flex-col justify-between text-[8px] text-[#A0A0A0] h-24 pb-0.5 text-right w-6 shrink-0">
      <span>100%</span><span>75%</span><span>50%</span><span>25%</span><span>0%</span>
    </div>
    <div class="flex-1 relative h-24 border-b border-[#EDEBE7]">
      {#each [0, 25, 50, 75] as g}
        <div class="absolute left-0 right-0 border-t border-dashed border-[#F0EEEA]" style="top: {g}%;"></div>
      {/each}
      <div class="absolute inset-0 flex items-end justify-around">
        {#each allocation as item}
          <div class="flex items-end gap-[3px] h-full">
            <div class="w-[7px] rounded-t-[1px] {item.attention ? 'bg-[#7A4B3E]' : 'bg-[#4A4D56]'}" style="height: {item.current}%;"></div>
            <div class="w-[7px] rounded-t-[1px] bg-[#D6D5D2]" style="height: {item.target}%;"></div>
          </div>
        {/each}
      </div>
    </div>
  </div>
  <div class="hv-sans flex justify-around text-[8px] text-[#A0A0A0] pt-1 pl-8">
    {#each allocation as item}<span class="truncate max-w-[44px] text-center">{item.name}</span>{/each}
  </div>
{/snippet}

{#snippet legend(items: { label: string; color: string; dotted?: boolean }[])}
  <div class="hv-sans flex items-center gap-3 text-[9.5px] text-[#7A7A7A]">
    {#each items as it}
      <span class="flex items-center gap-1.5">
        <span class="w-1.5 h-1.5 rounded-full" style="background-color: {it.color};"></span>
        <span class={it.dotted ? 'underline decoration-dotted underline-offset-2' : ''}>{it.label}</span>
      </span>
    {/each}
  </div>
{/snippet}

{#snippet hbarChart(count: number)}
  <div class="space-y-2.5 pt-1">
    {#each institutionalLPs.slice(0, count) as lp}
      <div class="flex items-center gap-2">
        <span class="hv-sans text-[9.5px] text-[#5A5A5A] w-[78px] truncate shrink-0">{lp.short}</span>
        <div class="flex-1 flex items-center gap-1.5">
          <div class="h-[9px] rounded-[1px] {lp.reconciled ? 'bg-[#4A4D56]' : 'bg-[#7A4B3E]'}" style="width: {lp.pct * 0.8}%;"></div>
          <span class="hv-sans text-[9px] text-[#8A8A8A] shrink-0">{lp.callShare}</span>
        </div>
      </div>
    {/each}
  </div>
{/snippet}

{#snippet agendaList()}
  <div class="divide-y divide-[#F0EEEA]">
    {#each fundsTimeline as item}
      <div class="flex items-center justify-between gap-2 py-2">
        <div class="flex items-start gap-2.5 min-w-0">
          <span class="hv-sans text-[10px] text-[#9A9A9A] pt-[1px] w-8 shrink-0 tabular-nums">{item.time}</span>
          <div class="min-w-0">
            <p class="hv-sans text-[11.5px] text-[#1A1A1A] leading-snug truncate {item.done ? 'line-through decoration-[#C8C8C8] text-[#8A8A8A]' : ''}">{item.title}</p>
            <p class="hv-sans text-[10px] text-[#8A8A8A] leading-tight truncate">{item.subtitle}</p>
          </div>
        </div>
        {#if item.actionLabel}
          <button
            type="button"
            onclick={() => item.onAction?.()}
            class="hv-sans text-[10px] text-[#2A2A2A] bg-white border border-[#E6E4DF] hover:bg-[#F7F6F3] px-2 py-[3px] rounded-md shrink-0 cursor-pointer transition"
          >
            {item.actionLabel}
          </button>
        {/if}
      </div>
    {/each}
  </div>
{/snippet}

{#snippet sectionLabel(text: string)}
  <span class="hv-sans text-[10.5px] text-[#8A8A8A]">{text}</span>
{/snippet}

<!-- Toast -->
{#if toastMessage}
  <div
    class="hv-sans absolute top-14 left-1/2 -translate-x-1/2 z-50 px-3.5 py-1.5 rounded-md bg-[#111111] text-white text-[11px] shadow-lg flex items-center gap-2 pointer-events-none whitespace-nowrap"
    in:fade={{ duration: 150 }}
    out:fade={{ duration: 150 }}
  >
    {toastMessage}
  </div>
{/if}

<div
  class="hv-sans flex flex-col h-full w-full bg-[#F6F5F2] text-[#1A1A1A] relative overflow-hidden select-none"
  data-testid="zea-funds-screen"
>
  <!-- Header -->
  <header class="px-4 py-2.5 bg-[#F6F5F2] border-b border-[#E9E7E2] flex items-center justify-between z-20 shrink-0">
    <div class="flex items-baseline gap-1.5">
      <ZeaLogo class="h-3 w-auto text-[#111111]" />
      <h2 class="hv-serif text-[13.5px] font-normal text-[#111111] leading-none tracking-tight">Funds</h2>
    </div>
    <ZeaModeToggle bind:viewMode theme="funds" variant="light" />
  </header>

  <div class="flex-1 overflow-hidden relative">
    <!-- =============================================================== -->
    <!-- TAB 1: RESUMEN                                                  -->
    <!-- =============================================================== -->
    {#if activeTab === 'summary'}
      <div class="h-full flex flex-col" in:fade={{ duration: 150 }}>
        {#if viewMode === 'chat'}
          <div bind:this={scrollEl} class="flex-1 overflow-y-auto px-3.5 py-3 space-y-3 text-left">
            {#each chatMessages as msg (msg.id)}
              {#if msg.sender === 'user'}
                <div class="flex justify-end">
                  <div class="max-w-[82%] pl-3 pr-2 pt-1.5 pb-1 rounded-lg rounded-tr-[3px] bg-[#ECEAE5] text-[#1A1A1A]">
                    <span class="text-[12.5px] leading-snug">{msg.text}</span>
                    <span class="inline-flex items-center gap-0.5 float-right ml-2 mt-[5px] text-[9px] text-[#8E8E8E] tabular-nums">
                      {msg.time}
                      <svg class="w-3 h-3 text-[#5B8DB8]" viewBox="0 0 16 16" fill="currentColor">
                        <path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z" />
                        <path d="M10.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-.5-.5a.5.5 0 1 1 .708-.708l.146.147 6.646-6.647a.5.5 0 0 1 .708 0z" />
                      </svg>
                    </span>
                  </div>
                </div>
              {:else}
                <div class="space-y-2.5">
                  <!-- Agent reply: editorial plain text, no bubble -->
                  <div class="flex items-start gap-2">
                    <div class="w-5 h-5 rounded-[4px] bg-[#111111] text-white flex items-center justify-center hv-serif text-[11px] leading-none shrink-0 mt-[1px]">G</div>
                    <p class="text-[12.5px] text-[#2A2A2A] leading-relaxed">
                      {msg.text}
                      <span class="text-[9px] text-[#A0A0A0] ml-1 tabular-nums whitespace-nowrap">{msg.time}</span>
                    </p>
                  </div>

                  {#if msg.briefing}
                    <div class="space-y-2.5 pl-7">
                      <!-- AHORA -->
                      <div class="hv-card p-3.5 space-y-2.5">
                        <div class="flex items-center justify-between">
                          {@render sectionLabel(es ? 'Ahora · Llamada de capital #4' : 'Now · Capital call #4')}
                          <span class="text-[10px] text-[#7A4B3E]">{es ? 'Cierra en 4 h' : 'Closes in 4h'}</span>
                        </div>
                        <div>
                          <div class="flex items-baseline gap-1.5">
                            <span class="hv-serif text-[30px] leading-none text-[#111111] tracking-[-0.02em]">$1.10M</span>
                            {@render up('88%')}
                          </div>
                          <p class="text-[10.5px] text-[#8A8A8A] mt-1">{es ? 'de $1.25M · 30 de 32 aportantes conciliados' : 'of $1.25M · 30 of 32 LPs reconciled'}</p>
                        </div>
                        <div class="h-[5px] rounded-full bg-[#EFEDE9] overflow-hidden">
                          <div class="h-full bg-[#44464D] rounded-full" style="width: 88%;"></div>
                        </div>
                        <div class="grid grid-cols-2 gap-2 pt-0.5">
                          <button type="button" onclick={() => (activeTab = 'lps')} class="hv-btn-secondary">
                            {es ? 'Ver pendientes' : 'View pending'}
                          </button>
                          <button type="button" onclick={signCall} class="hv-btn-primary">
                            {faceIdSigned ? (es ? 'Firmado' : 'Signed') : (es ? 'Firmar con FaceID' : 'Sign with FaceID')}
                          </button>
                        </div>
                      </div>

                      <!-- HOY -->
                      <div class="hv-card p-3.5">
                        <div class="flex items-center justify-between pb-0.5">
                          {@render sectionLabel(es ? 'Hoy' : 'Today')}
                          <span class="text-[10px] text-[#A0A0A0]">{es ? '4 hitos' : '4 items'}</span>
                        </div>
                        {@render agendaList()}
                      </div>

                      <!-- SEMANA -->
                      <div class="hv-card p-3.5 space-y-2">
                        <div class="flex items-start justify-between">
                          <div>
                            <h4 class="text-[12.5px] text-[#1A1A1A] font-medium">{es ? 'Despliegue de capital' : 'Capital deployment'}</h4>
                            <p class="text-[10px] text-[#8A8A8A]">{es ? 'Esta semana, según peso objetivo' : 'This week, by target weight'}</p>
                          </div>
                          {@render select(es ? 'Esta semana' : 'This week')}
                        </div>
                        {@render groupedChart()}
                        {@render legend([
                          { label: es ? 'Desplegado' : 'Deployed', color: '#4A4D56' },
                          { label: es ? 'Objetivo' : 'Target', color: '#D6D5D2', dotted: true },
                          { label: es ? 'Requiere atención' : 'Needs attention', color: '#7A4B3E' }
                        ])}
                      </div>

                      <!-- MES -->
                      <div class="hv-card p-3.5 space-y-2">
                        <div class="flex items-start justify-between">
                          <div>
                            <h4 class="text-[12.5px] text-[#1A1A1A] font-medium">{es ? 'Principales aportantes' : 'Top LPs'}</h4>
                            <p class="text-[10px] text-[#8A8A8A]">{es ? 'Este mes, según capital aportado' : 'This month, by capital paid in'}</p>
                          </div>
                          {@render select(es ? 'Este mes' : 'This month')}
                        </div>
                        {@render hbarChart(5)}
                      </div>

                      <!-- PROYECTADO -->
                      <div class="hv-card p-3.5 space-y-2">
                        <div class="flex items-start justify-between">
                          <div>
                            <div class="flex items-baseline gap-1.5">
                              <span class="hv-serif text-[30px] leading-none text-[#111111] tracking-[-0.02em]">$14.85M</span>
                              {@render up('18.4%')}
                            </div>
                            <p class="text-[10.5px] text-[#8A8A8A] mt-1">{es ? 'AUM proyectado · meta $20M' : 'Projected AUM · $20M target'}</p>
                          </div>
                          {@render select('2026')}
                        </div>
                        {@render densityChart(aumLines, monthLabels, true, 'h-20')}
                        {@render legend([
                          { label: es ? 'Horizon II' : 'Horizon II', color: '#44464D' },
                          { label: es ? 'Pares' : 'Peers', color: '#C4C4C4', dotted: true }
                        ])}
                      </div>
                    </div>
                  {/if}
                </div>
              {/if}
            {/each}

            {#if isAgentTyping}
              <div class="flex items-center gap-1 pl-7 py-1">
                <span class="w-1 h-1 rounded-full bg-[#8A8A8A] animate-bounce"></span>
                <span class="w-1 h-1 rounded-full bg-[#8A8A8A] animate-bounce [animation-delay:0.15s]"></span>
                <span class="w-1 h-1 rounded-full bg-[#8A8A8A] animate-bounce [animation-delay:0.3s]"></span>
              </div>
            {/if}
          </div>

          <!-- Prompt bar -->
          <div class="shrink-0 bg-[#F6F5F2] border-t border-[#E9E7E2] px-3 pt-2 pb-2.5 space-y-2 z-20">
            <div class="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              {#each (es ? ['¿Qué tenemos para hoy?', 'Conciliar custodio', 'Auditar aportantes', 'Estado llamada #4'] : ['What do we have today?', 'Reconcile custodian', 'Audit LPs', 'Call #4 status']) as chip}
                <button
                  type="button"
                  onclick={() => handleSendPrompt(chip)}
                  class="shrink-0 px-2.5 py-1 rounded-md text-[10.5px] bg-white border border-[#E6E4DF] text-[#3A3A3A] hover:bg-[#FBFAF8] transition cursor-pointer"
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
              class="flex items-center gap-2 bg-white border border-[#E6E4DF] rounded-lg pl-3 pr-1 py-1"
            >
              <input
                type="text"
                bind:value={chatInputText}
                placeholder={es ? 'Pregunta a Funds Agent' : 'Ask Funds Agent'}
                class="flex-1 bg-transparent text-[12px] text-[#1A1A1A] placeholder:text-[#A6A6A6] focus:outline-none py-1"
              />
              <button type="submit" aria-label="Enviar prompt" class="w-7 h-7 rounded-md bg-[#111111] text-white hover:bg-[#2A2A2A] flex items-center justify-center cursor-pointer shrink-0">
                <svg class="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6">
                  <path d="M8 13V3m0 0L4 7m4-4l4 4" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
              </button>
            </form>
          </div>
        {:else}
          <!-- =========================================================== -->
          <!-- APP MODE: Harvey analytics dashboard                        -->
          <!-- =========================================================== -->
          <div class="flex-1 overflow-y-auto px-3.5 py-3.5 space-y-3 text-left">
            <!-- Recommendation banner -->
            <div class="hv-card px-3 py-2 flex items-center justify-between gap-2">
              <div class="flex items-center gap-2 min-w-0">
                <span class="w-4 h-4 rounded-[3px] bg-[#111111] text-white flex items-center justify-center hv-serif text-[10px] leading-none shrink-0">G</span>
                <p class="text-[10.5px] text-[#3A3A3A] truncate">
                  {es ? 'Hay 2 acciones recomendadas para la llamada #4' : 'There are 2 recommended actions for call #4'}
                </p>
              </div>
              <button type="button" onclick={() => (activeTab = 'lps')} class="text-[10.5px] text-[#111111] underline underline-offset-2 shrink-0 cursor-pointer">
                {es ? 'Revisar' : 'Review'}
              </button>
            </div>

            <!-- AUM -->
            <div class="hv-card p-3.5 space-y-2">
              <div class="flex items-start justify-between">
                <div>
                  <div class="flex items-baseline gap-1.5">
                    <span class="hv-serif text-[32px] leading-none text-[#111111] tracking-[-0.02em]">$14.85M</span>
                    {@render up('18.4%')}
                  </div>
                  <p class="text-[10.5px] text-[#8A8A8A] mt-1">{es ? 'AUM consolidado' : 'Consolidated AUM'}</p>
                </div>
                <div class="flex items-center gap-1">
                  {@render select(es ? '6 meses' : '6 months')}
                  {@render select('2026')}
                </div>
              </div>
              {@render densityChart(aumLines, monthLabels, true, 'h-24')}
              <div class="flex items-center justify-between">
                {@render legend([
                  { label: es ? 'Tu fondo' : 'Your fund', color: '#44464D' },
                  { label: es ? 'Pares' : 'Peers', color: '#C4C4C4', dotted: true }
                ])}
                {@render cardFooter()}
              </div>
            </div>

            <!-- Deployment -->
            <div class="hv-card p-3.5 space-y-2">
              <div class="flex items-start justify-between">
                <div>
                  <h4 class="text-[12.5px] text-[#1A1A1A] font-medium">{es ? 'Despliegue de capital' : 'Capital deployment'}</h4>
                  <p class="text-[10px] text-[#8A8A8A]">{es ? 'Según peso objetivo del portafolio' : 'Based on target portfolio weight'}</p>
                </div>
                {@render select(es ? 'Esta semana' : 'This week')}
              </div>
              {@render groupedChart()}
              <div class="flex items-center justify-between">
                {@render legend([
                  { label: es ? 'Desplegado' : 'Deployed', color: '#4A4D56' },
                  { label: es ? 'Objetivo' : 'Target', color: '#D6D5D2', dotted: true },
                  { label: es ? 'Atención' : 'Attention', color: '#7A4B3E' }
                ])}
                {@render cardFooter()}
              </div>
            </div>

            <!-- Capital call -->
            <div class="hv-card p-3.5 space-y-2">
              <div class="flex items-start justify-between">
                <div>
                  <div class="flex items-baseline gap-1.5">
                    <span class="hv-serif text-[32px] leading-none text-[#111111] tracking-[-0.02em]">$1.10M</span>
                    {@render up('88%')}
                  </div>
                  <p class="text-[10.5px] text-[#8A8A8A] mt-1">{es ? 'Recaudado · llamada de capital #4' : 'Collected · capital call #4'}</p>
                </div>
                <div class="flex items-center gap-1">
                  {@render select(es ? 'Diario' : 'Daily')}
                  {@render select(es ? 'Esta semana' : 'This week')}
                </div>
              </div>
              {@render densityChart(callLines, weekLabels, false, 'h-20')}
              <div class="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onclick={() =>
                    openItemDetails({
                      avatarText: 'H2',
                      title: 'Horizon II',
                      subtitle: es ? 'Llamada de capital #4' : 'Capital call #4',
                      progressLabel: es ? 'Recaudado' : 'Collected',
                      progressValueText: '$1.10M / $1.25M',
                      progressPct: 88,
                      stats: [
                        { label: es ? 'Aportantes' : 'LPs', value: '30 / 32' },
                        { label: es ? 'Pendiente' : 'Pending', value: '$150K' }
                      ]
                    })}
                  class="hv-btn-secondary"
                >
                  {es ? 'Ver detalle' : 'View detail'}
                </button>
                <button type="button" onclick={signCall} class="hv-btn-primary">
                  {faceIdSigned ? (es ? 'Firmado' : 'Signed') : (es ? 'Firmar con FaceID' : 'Sign with FaceID')}
                </button>
              </div>
            </div>

            <!-- Top LPs -->
            <div class="hv-card p-3.5 space-y-2">
              <div class="flex items-start justify-between">
                <div>
                  <h4 class="text-[12.5px] text-[#1A1A1A] font-medium">{es ? 'Principales aportantes' : 'Top LPs'}</h4>
                  <p class="text-[10px] text-[#8A8A8A]">{es ? 'Según capital aportado' : 'Based on capital paid in'}</p>
                </div>
                {@render select(es ? 'Último mes' : 'Past month')}
              </div>
              {@render hbarChart(6)}
            </div>

            <!-- Agenda -->
            <div class="hv-card p-3.5">
              <div class="flex items-start justify-between pb-1">
                <div>
                  <h4 class="text-[12.5px] text-[#1A1A1A] font-medium">{es ? 'Agenda de hoy' : "Today's agenda"}</h4>
                  <p class="text-[10px] text-[#8A8A8A]">{es ? 'Comités, cierres y sellados' : 'Committees, closings and sealing'}</p>
                </div>
              </div>
              {@render agendaList()}
            </div>
          </div>
        {/if}
      </div>

    <!-- =============================================================== -->
    <!-- TAB 2: LLAMADOS                                                 -->
    <!-- =============================================================== -->
    {:else if activeTab === 'calls'}
      <div class="h-full overflow-y-auto px-3.5 py-3.5 space-y-3 text-left" in:fade={{ duration: 150 }}>
        <div class="hv-card p-3.5">
          <p class="text-[10.5px] text-[#8A8A8A]">{es ? 'Estado de Llamados · Fondos Activos' : 'Capital call status · Active funds'}</p>
          <div class="grid grid-cols-3 gap-2 mt-2.5">
            <div>
              <span class="hv-serif text-[22px] leading-none text-[#111111] block">$20.0M</span>
              <span class="text-[9.5px] text-[#8A8A8A]">{es ? 'Comprometido' : 'Committed'}</span>
            </div>
            <div>
              <span class="hv-serif text-[22px] leading-none text-[#111111] block">$12.55M</span>
              <span class="text-[9.5px] text-[#8A8A8A]">{es ? 'Llamado' : 'Called'}</span>
            </div>
            <div>
              <span class="hv-serif text-[22px] leading-none text-[#111111] block">99.1%</span>
              <span class="text-[9.5px] text-[#8A8A8A]">{es ? 'Cumplimiento' : 'Compliance'}</span>
            </div>
          </div>
        </div>

        <div class="hv-card divide-y divide-[#F0EEEA]">
          {#each capitalCallsList as call}
            <div class="p-3.5 space-y-1.5">
              <div class="flex items-center justify-between">
                <span class="text-[10px] text-[#8A8A8A]">{call.fund}</span>
                <span class="text-[10px] {call.active ? 'text-[#111111]' : 'text-[#9A9A9A]'} flex items-center gap-1">
                  <span class="w-1.5 h-1.5 rounded-full {call.active ? 'bg-[#2F7D4F]' : 'bg-[#C8C8C8]'}"></span>
                  {call.badge}
                </span>
              </div>
              <div class="flex items-baseline justify-between">
                <h4 class="text-[12.5px] text-[#1A1A1A] font-medium">{call.title}</h4>
                <span class="hv-serif text-[17px] text-[#111111]">{call.amount}</span>
              </div>
              <div class="flex items-center justify-between text-[10px] text-[#8A8A8A]">
                <span>{call.lps} {es ? 'aportantes' : 'LPs'}</span>
                <span>{call.bank}</span>
              </div>
              {#if call.active}
                <button type="button" onclick={() => (activeTab = 'lps')} class="hv-btn-primary w-full mt-1.5">
                  {es ? 'Auditar aportantes' : 'Audit LPs'}
                </button>
              {/if}
            </div>
          {/each}
        </div>
      </div>

    <!-- =============================================================== -->
    <!-- TAB 3: PORTAFOLIO                                               -->
    <!-- =============================================================== -->
    {:else if activeTab === 'portfolio'}
      <div class="h-full overflow-y-auto px-3.5 py-3.5 space-y-3 text-left" in:fade={{ duration: 150 }}>
        <div class="hv-card p-3.5">
          <div class="flex items-baseline gap-1.5">
            <span class="hv-serif text-[30px] leading-none text-[#111111] tracking-[-0.02em]">$12.70M</span>
            {@render up('17.9%')}
          </div>
          <p class="text-[10.5px] text-[#8A8A8A] mt-1">{es ? 'Empresas en Portafolio Directo' : 'Direct portfolio holdings'} · 4</p>
        </div>

        <div class="hv-card divide-y divide-[#F0EEEA]">
          {#each portfolioHoldings as holding}
            <button
              type="button"
              onclick={() =>
                openItemDetails({
                  avatarText: holding.name.slice(0, 2).toUpperCase(),
                  title: holding.name,
                  subtitle: holding.sector,
                  progressLabel: es ? 'Participación' : 'Equity stake',
                  progressValueText: holding.stake,
                  progressPct: parseFloat(holding.stake),
                  stats: [
                    { label: es ? 'Desplegado' : 'Deployed', value: holding.deployed },
                    { label: es ? 'TIR' : 'IRR', value: holding.irr }
                  ]
                })}
              class="w-full p-3.5 text-left flex items-center justify-between gap-3 hover:bg-[#FBFAF8] transition cursor-pointer"
            >
              <div class="min-w-0">
                <h4 class="text-[12.5px] text-[#1A1A1A] font-medium truncate">{holding.name}</h4>
                <p class="text-[10px] text-[#8A8A8A] truncate">{holding.sector} · {holding.stake}</p>
              </div>
              <div class="text-right shrink-0">
                <span class="hv-serif text-[17px] text-[#111111] block leading-tight">{holding.deployed}</span>
                <span class="text-[10px] text-[#2F7D4F]">↑ {holding.irr}</span>
              </div>
            </button>
          {/each}
        </div>
      </div>

    <!-- =============================================================== -->
    <!-- TAB 4: APORTANTES                                               -->
    <!-- =============================================================== -->
    {:else if activeTab === 'lps'}
      <div class="h-full overflow-y-auto px-3.5 py-3.5 space-y-3 text-left" in:fade={{ duration: 150 }}>
        <div class="flex items-center gap-2 bg-white border border-[#E6E4DF] rounded-lg px-3 py-2">
          <svg class="w-3.5 h-3.5 text-[#A0A0A0] shrink-0" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5">
            <circle cx="7" cy="7" r="4.5" /><path d="M10.5 10.5L14 14" stroke-linecap="round" />
          </svg>
          <input
            type="text"
            bind:value={lpSearchQuery}
            placeholder={es ? 'Buscar aportante o RUT...' : 'Search LP or tax ID...'}
            class="flex-1 bg-transparent text-[12px] text-[#1A1A1A] placeholder:text-[#A6A6A6] focus:outline-none"
          />
        </div>

        <p class="text-[10px] text-[#8A8A8A] px-0.5">
          {es
            ? 'Nómina protegida bajo Ley 21.719 con registro de auditoría inmutable.'
            : 'Investor records protected under Law 21.719 with an immutable audit log.'}
        </p>

        <div class="hv-card divide-y divide-[#F0EEEA]">
          {#each filteredLPs as lp}
            <button
              type="button"
              onclick={() =>
                openItemDetails({
                  avatarText: lp.name.slice(0, 2).toUpperCase(),
                  title: lp.name,
                  subtitle: `RUT ${lp.rut}`,
                  progressLabel: es ? 'Compromiso total' : 'Total commitment',
                  progressValueText: lp.commitment,
                  progressPct: lp.pct,
                  stats: [
                    { label: es ? 'Cuota llamada #4' : 'Call #4 share', value: lp.callShare },
                    { label: es ? 'Estado' : 'Status', value: lp.reconciled ? (es ? 'Conciliado' : 'Reconciled') : (es ? 'En compensación' : 'Clearing') }
                  ]
                })}
              class="w-full p-3.5 text-left flex items-center justify-between gap-3 hover:bg-[#FBFAF8] transition cursor-pointer"
            >
              <div class="min-w-0">
                <h4 class="text-[12.5px] text-[#1A1A1A] font-medium truncate">{lp.name}</h4>
                <p class="text-[10px] text-[#8A8A8A] flex items-center gap-1.5">
                  <span class="w-1.5 h-1.5 rounded-full {lp.reconciled ? 'bg-[#2F7D4F]' : 'bg-[#7A4B3E]'}"></span>
                  {lp.reconciled ? (es ? 'Conciliado' : 'Reconciled') : (es ? 'En compensación' : 'Clearing')} · {lp.rut}
                </p>
              </div>
              <div class="text-right shrink-0">
                <span class="hv-serif text-[17px] text-[#111111] block leading-tight">{lp.callShare}</span>
                <span class="text-[10px] text-[#9A9A9A]">{es ? 'de' : 'of'} {lp.commitment}</span>
              </div>
            </button>
          {/each}
        </div>
      </div>
    {/if}
  </div>

  <!-- Bottom tab bar -->
  <nav
    id="funds-bottom-tabbar"
    class="shrink-0 h-13 bg-[#F6F5F2] border-t border-[#E9E7E2] flex items-center justify-around px-2 z-20"
  >
    {#each [
      { id: 'summary', label: es ? 'Resumen' : 'Summary', d: 'M3 13h4v7H3zM10 8h4v12h-4zM17 4h4v16h-4z' },
      { id: 'calls', label: es ? 'Llamados' : 'Calls', d: 'M4 6h16M4 12h16M4 18h10' },
      { id: 'portfolio', label: es ? 'Portafolio' : 'Portfolio', d: 'M3 7h18v13H3zM8 7V4h8v3' },
      { id: 'lps', label: es ? 'Aportantes' : 'LPs', d: 'M9 11a3.5 3.5 0 100-7 3.5 3.5 0 000 7zM2.5 20a6.5 6.5 0 0113 0M16 4.5a3.5 3.5 0 010 6.5M18 14a6 6 0 013.5 6' }
    ] as tab}
      <button
        type="button"
        onclick={() => (activeTab = tab.id as any)}
        class="flex flex-col items-center gap-[3px] px-2 py-1 transition cursor-pointer {activeTab === tab.id ? 'text-[#111111]' : 'text-[#A3A3A3] hover:text-[#5A5A5A]'}"
      >
        <svg class="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <path d={tab.d} />
        </svg>
        <span class="text-[9.5px] {activeTab === tab.id ? 'font-medium' : ''}">{tab.label}</span>
      </button>
    {/each}
  </nav>

  <ZeaSheet
    theme="funds"
    variant="light"
    isOpen={sheetOpen}
    avatarText={sheetData?.avatarText || 'H2'}
    title={sheetData?.title || 'Horizon II'}
    subtitle={sheetData?.subtitle || ''}
    progressLabel={sheetData?.progressLabel || ''}
    progressValueText={sheetData?.progressValueText || ''}
    progressPct={sheetData?.progressPct || 0}
    stats={sheetData?.stats || []}
    onClose={() => (sheetOpen = false)}
  />
</div>

<style>
  /* Harvey-like typography: editorial serif for figures & titles, neutral grotesk for UI */
  .hv-serif {
    font-family: 'Newsreader', 'Source Serif 4', Georgia, 'Times New Roman', serif;
    font-weight: 400;
    font-optical-sizing: auto;
  }
  .hv-sans {
    font-family: 'Inter', 'Helvetica Neue', Arial, system-ui, sans-serif;
    font-feature-settings: 'cv11', 'ss01';
    -webkit-font-smoothing: antialiased;
  }
  .hv-card {
    background: #ffffff;
    border: 1px solid #ebe9e4;
    border-radius: 10px;
    box-shadow: 0 1px 2px rgba(17, 17, 17, 0.03);
  }
  .hv-btn-primary {
    font-family: 'Inter', 'Helvetica Neue', Arial, sans-serif;
    font-size: 11px;
    padding: 7px 10px;
    border-radius: 6px;
    background: #111111;
    color: #ffffff;
    cursor: pointer;
    transition: background 0.15s;
  }
  .hv-btn-primary:hover {
    background: #2a2a2a;
  }
  .hv-btn-secondary {
    font-family: 'Inter', 'Helvetica Neue', Arial, sans-serif;
    font-size: 11px;
    padding: 7px 10px;
    border-radius: 6px;
    background: #ffffff;
    color: #1a1a1a;
    border: 1px solid #e6e4df;
    cursor: pointer;
    transition: background 0.15s;
  }
  .hv-btn-secondary:hover {
    background: #f7f6f3;
  }
</style>
