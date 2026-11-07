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
  import ZeaChecklistCard, { type ZeaChecklistItem } from '../ds/ZeaChecklistCard.svelte';

  let {
    lang = 'es',
    platform = 'ios'
  }: {
    lang?: 'en' | 'es';
    platform?: 'ios' | 'android';
  } = $props();

  // Navigation tabs: Resumen, Agenda, Hábitos, Perfil
  let activeTab = $state<'summary' | 'agenda' | 'habits' | 'profile'>('summary');
  let viewMode = $state<'chat' | 'app'>('chat');

  // Interactive toast
  let toastMessage = $state<string | null>(null);
  let toastTimeout: any = null;

  // Actions states
  let deployDone = $state(false);
  let cloudApprovalDone = $state(false);
  let cloudApprovalRejected = $state(false);
  let checklistExpanded = $state(false);

  // Sheet modal state
  let sheetOpen = $state(false);
  let sheetData = $state<any>(null);

  function showToast(msg: string) {
    if (toastTimeout) clearTimeout(toastTimeout);
    toastMessage = msg;
    toastTimeout = setTimeout(() => {
      toastMessage = null;
    }, 2400);
  }

  function openItemDetails(item: any) {
    sheetData = item;
    sheetOpen = true;
  }

  function closeSheet() {
    sheetOpen = false;
  }

  // =========================================================================
  // 1. HABITS & ROUTINE CHECKLIST (Personal Life Calibration)
  // =========================================================================
  let habitItems = $state<ZeaChecklistItem[]>([
    {
      id: 'hb-1',
      label: 'Café matutino sin pantallas ni notificaciones (20 min)',
      checked: true,
      requiresInput: false
    },
    {
      id: 'hb-2',
      label: 'Hidratación & Movilidad articular antes de pantalla',
      checked: true,
      requiresInput: true,
      inputValue: '1.2 L agua',
      inputPlaceholder: 'Ingresar litros (ej: 1.5 L)',
      presetValues: ['1.5 L agua', '2.0 L agua']
    },
    {
      id: 'hb-3',
      label: 'Deploy Producción v2.4 (Sprint 14 Core)',
      checked: false,
      requiresInput: true,
      inputValue: '',
      inputPlaceholder: 'Hash commit (ej: 0x9f4a1c)',
      presetValues: ['0x9f4a1c', 'PR #412']
    },
    {
      id: 'hb-4',
      label: 'Sesión de Fuerza en Gimnasio (13:00)',
      checked: false,
      requiresInput: true,
      inputValue: '',
      inputPlaceholder: 'Duración (ej: 50 min)',
      presetValues: ['50 min fuerza', '60 min tren superior']
    },
    {
      id: 'hb-5',
      label: 'Cierre de jornada sin laptop abierta con la familia',
      checked: false,
      requiresInput: false
    }
  ]);

  function toggleHabitItem(id: string) {
    habitItems = habitItems.map((item) =>
      item.id === id ? { ...item, checked: !item.checked } : item
    );
  }

  function handleHabitInput(id: string, value: string) {
    habitItems = habitItems.map((item) =>
      item.id === id ? { ...item, inputValue: value, checked: true } : item
    );
    showToast(`Dato registrado: ${value}`);
  }

  function approveCloudPayment() {
    if (cloudApprovalDone) return;
    cloudApprovalDone = true;
    showToast('Infraestructura Cloud autorizada ($149 USD)');
  }

  // =========================================================================
  // 2. TIMELINE ENTRIES (Hoy)
  // =========================================================================
  const personalTimeline = $derived([
    {
      id: '1',
      time: '07:30',
      title: 'Hábitos Matutinos & Foco',
      subtitle: checklistExpanded
        ? 'Ocultar checklist de hábitos'
        : `${habitItems.filter((i) => i.checked).length} de ${habitItems.length} completados`,
      actionLabel: checklistExpanded ? 'Ocultar' : 'Ver hábitos',
      status: 'active' as const,
      onClick: () => {
        checklistExpanded = !checklistExpanded;
        showToast(checklistExpanded ? 'Hábitos desplegados' : 'Hábitos minimizados');
      }
    },
    {
      id: '2',
      time: '09:00',
      title: 'Daily Standup & Sincronización',
      subtitle: 'Banco X · Arquitectura & Code Review',
      status: 'completed' as const
    },
    {
      id: '3',
      time: '10:30',
      title: 'Deploy a Producción v2.4 (Core)',
      subtitle: 'Release ventana programada · PR #412',
      status: 'active' as const,
      onClick: () =>
        openItemDetails({
          title: 'Deploy Producción v2.4',
          driver: 'Banco X Core',
          type: 'Sprint 14',
          plant: 'AWS us-east-1',
          temp: '0 vulnerabilidades',
          destination: 'API Gateway & Core',
          status: 'Listo para deploy',
          eta: '10:30 AM',
          loadTon: 412,
          maxTon: 412
        })
    },
    {
      id: '4',
      time: '13:00',
      title: 'Entrenamiento Gimnasio (Fuerza)',
      subtitle: 'Salud · 50 min con entrenador personal',
      status: 'available' as const,
      actionLabel: 'Check-in',
      onAction: () => showToast('Check-in de gimnasio registrado')
    },
    {
      id: '5',
      time: '16:30',
      title: 'Salida Colegio & Tiempo en Familia',
      subtitle: 'Traslado niños · Cero pantallas',
      status: 'scheduled' as const
    },
    {
      id: '6',
      time: '19:30',
      title: 'Partido de Pádel · Chicureo',
      subtitle: 'Cancha 4 reservada · Rodrigo, Felipe y Matías',
      status: 'scheduled' as const
    }
  ]);

  // Life Balance Concentric Rings (Apple Health inspired)
  const lifeRings = [
    { label: 'Deep Work / Foco', value: '34 / 40 hrs', delta: '85% completado', pct: 34 / 40, color: '#FFFFFF' },
    { label: 'Salud & Deporte', value: '4 / 5 días', delta: '3 gym + 1 pádel', pct: 4 / 5, color: '#A1A1AA' },
    { label: 'Presupuesto Familiar', value: '65% mes', delta: 'Dentro de norma', pct: 0.65, color: '#71717A' }
  ];

  // 8-Week Trends
  const focusBars = [32, 35, 38, 40, 36, 42, 37, 38];
  const focusLabels = ['S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'S7', 'Hoy'];
  const focusDistribution = [
    { label: 'Deep Work & Desarrollo', percentage: 60, color: '#FFFFFF' },
    { label: 'Salud, Pádel & Familia', percentage: 40, color: '#71717A' }
  ];

  // =========================================================================
  // CHAT STREAM
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
      id: 'msg-0',
      sender: 'user',
      time: '08:00',
      text: '¿Qué tenemos para hoy?'
    },
    {
      id: 'msg-1',
      sender: 'agent',
      time: '08:00',
      text: '¡Buenos días, Carlos! Hoy tu foco principal es el Deploy a Producción a las 10:30, la sesión de gimnasio a las 13:00 y pádel a las 19:30. Tienes una aprobación pendiente de infraestructura. ¿Autorizamos la renovación de servidores Cloud ($149 USD)?',
      isPrimarySummary: true
    }
  ]);

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
    const now = '08:45';
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

      if (lower.includes('swift') || lower.includes('ios')) {
        reply = 'En Swift solo necesitas instanciar IOSClient con la clave del Secure Enclave. Cero servidores intermediarios y latencia < 20ms.';
      } else if (lower.includes('deploy') || lower.includes('aprobar')) {
        deployDone = true;
        cloudApprovalDone = true;
        reply = '✓ Deploy a Producción v2.4 confirmado. Pipeline en ejecución en AWS us-east-1 sin vulnerabilidades reportadas.';
        showToast('Deploy ejecutado');
      } else if (lower.includes('padel') || lower.includes('pádel')) {
        reply = 'El partido de pádel está programado a las 19:30 en Cancha 4 Club Chicureo con Rodrigo, Felipe y Matías. Cancha reservada y pagada.';
      } else if (lower.includes('foco') || lower.includes('horas')) {
        reply = 'Llevas 34 horas de Deep Work esta semana (85% de tu meta de 40h). Buen balance con tus 4 sesiones de deporte.';
      } else {
        reply = `Entendido Carlos. He registrado "${text}" en tu agenda y calibrado las prioridades del día.`;
      }

      chatMessages.push({
        id: `agent-${Date.now()}`,
        sender: 'agent',
        time: now,
        text: reply
      });
      scrollToBottom(summaryScrollEl);
    }, 450);
  }
</script>

<div class="flex flex-col h-full w-full bg-black text-white relative font-sans overflow-hidden select-none" data-testid="zea-default-screen">
  <!-- Toast Notification -->
  {#if toastMessage}
    <div
      class="absolute top-12 left-1/2 -translate-x-1/2 z-50 bg-[#1C1C20] border border-white/20 text-white text-xs px-4 py-2 rounded-full shadow-2xl flex items-center gap-2 pointer-events-none"
      in:fade={{ duration: 150 }}
      out:fade={{ duration: 200 }}
    >
      <span class="w-2 h-2 rounded-full bg-white animate-pulse"></span>
      <span class="font-medium">{toastMessage}</span>
    </div>
  {/if}

  <!-- Fixed Top Header -->
  <header class="px-5 pt-3 pb-2.5 bg-black/95 backdrop-blur-md border-b border-[#222228] flex items-center justify-between z-20 shrink-0">
    <div class="flex items-center gap-2.5">
      <div class="w-8 h-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center font-bold text-white text-xs font-mono shadow-sm">
        Z
      </div>
      <div>
        <h2 class="text-sm font-semibold tracking-tight text-white leading-tight">
          ZEA Personal agent
        </h2>
        <p class="text-[10px] text-zinc-400 font-mono">Personal AI OS</p>
      </div>
    </div>

    <ZeaModeToggle
      theme="default"
      bind:mode={viewMode}
      onModeChange={(m) => showToast(m === 'chat' ? 'Modo Chat AI activo' : 'Modo App Clásica activo')}
    />
  </header>

  <!-- Main Scrollable Body Area -->
  <main class="flex-1 min-h-0 flex flex-col overflow-hidden bg-black">
    <div
      class="flex-1 overflow-y-auto px-4 py-4 space-y-4 text-left scroll-smooth"
      bind:this={summaryScrollEl}
      use:dragScroll
      role="region"
      aria-label="Sección Resumen Personal"
    >
      {#if viewMode === 'chat'}
        {#each chatMessages as msg (msg.id)}
          {#if msg.sender === 'user'}
            <div class="flex flex-col items-end gap-1 pl-12" in:fade={{ duration: 120 }}>
              <div class="bg-[#1C1C22] border border-white/15 text-white rounded-[20px] rounded-br-xs px-4 py-2.5 shadow-md">
                <p class="text-[13.5px] leading-relaxed">{msg.text}</p>
              </div>
              <span class="text-[10px] text-zinc-500 font-mono pr-1">{msg.time} <span class="text-white font-bold">✓✓</span></span>
            </div>
          {:else}
            <div class="flex flex-col items-start gap-1.5 pr-1 w-full" in:fade={{ duration: 120 }}>
              <div class="bg-[#141418] border border-[#26262E] text-zinc-200 rounded-[22px] rounded-tl-xs px-4 py-3 max-w-[96%] space-y-3 shadow-lg">
                <p class="text-[13.5px] leading-relaxed">{msg.text}</p>

                {#if msg.id === 'msg-1'}
                  <div class="flex flex-wrap items-center gap-2 pt-2 border-t border-white/10">
                    <button
                      type="button"
                      onclick={approveCloudPayment}
                      disabled={cloudApprovalDone}
                      class="px-3.5 py-2 rounded-xl text-xs font-semibold transition cursor-pointer shadow-md {cloudApprovalDone ? 'bg-[#27272A] text-zinc-400' : 'bg-white hover:bg-zinc-200 text-black font-bold'}"
                    >
                      {#if cloudApprovalDone}
                        <span>✓ Pago Autorizado</span>
                      {:else}
                        <span>Aprobar Renovación Cloud ($149)</span>
                      {/if}
                    </button>
                  </div>
                {/if}
              </div>

              {#if msg.isPrimarySummary}
                <div class="w-full space-y-4 pt-1">
                  <!-- 1. NOW: URGENCIA ACTUAL -->
                  <ZeaFocusCard
                    theme="default"
                    badgeText="Release en curso"
                    etaText="en 45 min"
                    mainMetric="v2.4.0"
                    metricSuffix=" · Sprint 14"
                    avatarText="PR"
                    title="Deploy Core & API Gateway"
                    subtitle="Pull Request #412 verificado · 0 vulnerabilidades"
                    secondaryActionLabel="Ver Pull Request"
                    primaryActionLabel="Confirmar Deploy"
                    primaryDoneLabel="✓ Deploy Ejecutado"
                    isDone={deployDone}
                    onSecondaryAction={() =>
                      openItemDetails({
                        title: 'PR #412: Core API Gateway',
                        driver: 'Banco X Core',
                        type: 'TypeScript & Swift',
                        plant: 'Production',
                        temp: 'Validado',
                        destination: 'AWS us-east-1',
                        status: 'Aprobado',
                        eta: '10:30 AM',
                        loadTon: 412,
                        maxTon: 412
                      })}
                    onPrimaryAction={() => {
                      deployDone = true;
                      showToast('Deploy a Producción v2.4 confirmado');
                    }}
                  />

                  <!-- 2. EL DÍA: HOY -->
                  <ZeaTimeline
                    theme="default"
                    title="Hoy"
                    headerActionLabel="Ver agenda"
                    onHeaderAction={() => (activeTab = 'agenda')}
                    entries={personalTimeline}
                  />

                  <!-- Checklist Desplegado desde 07:30 -->
                  {#if checklistExpanded}
                    <div in:fade={{ duration: 150 }} id="habits-checklist-card">
                      <ZeaChecklistCard
                        theme="default"
                        moduleBadge="RITUALES & FOCO"
                        title="Hábitos & Calibración"
                        subtitle="Rutina matutina, foco y desconexión"
                        items={habitItems}
                        actionLabel="Consolidar Hábitos"
                        onToggleItem={toggleHabitItem}
                        onInputSubmit={handleHabitInput}
                        onAction={() => showToast('Hábitos del día sincronizados')}
                      />
                    </div>
                  {/if}

                  <!-- 3. PENDIENTES: POR APROBAR -->
                  <ZeaApprovalCard
                    theme="default"
                    title="Por aprobar"
                    avatarText="AWS"
                    entityName="Renovación Servidores Cloud"
                    entityDetails="Producción & Sandbox · $149 USD"
                    citationText="Facturación de cómputo elástico, base de datos y CDN del mes dentro del límite proyectado."
                    isApproved={cloudApprovalDone}
                    isRejected={cloudApprovalRejected}
                    onApprove={approveCloudPayment}
                    onReject={() => {
                      cloudApprovalRejected = true;
                      showToast('Renovación postergada');
                    }}
                  />

                  <!-- 4. ESTA SEMANA -->
                  <ZeaConcentricRings
                    theme="default"
                    title="Esta semana"
                    subtitle=""
                    items={lifeRings}
                  />

                  <!-- 5. TENDENCIA 8 SEMANAS -->
                  <ZeaMetricTrend
                    theme="default"
                    title="Balance semanal"
                    badgeText="+12% vs mes anterior"
                    metricValue="38 hrs"
                    metricUnit="esta semana"
                    metricSubtitle="298 hrs acumuladas en últimas 8 semanas · Prom. 37.2 h/sem"
                    targetValue={40}
                    targetLabel="Meta 40 h"
                    bars={focusBars}
                    barLabels={focusLabels}
                    distribution={focusDistribution}
                  />
                </div>
              {/if}
            </div>
          {/if}
        {/each}

        {#if isAgentTyping}
          <div class="flex items-center gap-2 pt-1" in:fade={{ duration: 100 }}>
            <div class="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[10px] font-bold text-white">Z</div>
            <div class="bg-[#141418] border border-[#24242C] rounded-full px-3 py-1.5 flex items-center gap-1.5 shadow-xs">
              <span class="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-bounce" style="animation-delay: 0ms"></span>
              <span class="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-bounce" style="animation-delay: 150ms"></span>
              <span class="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-bounce" style="animation-delay: 300ms"></span>
            </div>
          </div>
        {/if}
      {:else}
        <!-- MODO APP CLÁSICA NATIVA -->
        <section class="pt-0.5">
          <h3 class="text-[20px] font-semibold tracking-tight text-white leading-tight">Resumen Ejecutivo</h3>
          <p class="text-[12px] text-zinc-400 mt-0.5">
            Orquestación integral de trabajo, salud, finanzas y compromisos familiares.
          </p>
        </section>

        <!-- 1. NOW -->
        <ZeaFocusCard
          theme="default"
          badgeText="Release en curso"
          etaText="en 45 min"
          mainMetric="v2.4.0"
          metricSuffix=" · Sprint 14"
          avatarText="PR"
          title="Deploy Core & API Gateway"
          subtitle="Pull Request #412 verificado · 0 vulnerabilidades"
          secondaryActionLabel="Ver Pull Request"
          primaryActionLabel="Confirmar Deploy"
          primaryDoneLabel="✓ Deploy Ejecutado"
          isDone={deployDone}
          onSecondaryAction={() =>
            openItemDetails({
              title: 'PR #412: Core API Gateway',
              driver: 'Banco X Core',
              type: 'TypeScript & Swift',
              plant: 'Production',
              temp: 'Validado',
              destination: 'AWS us-east-1',
              status: 'Aprobado',
              eta: '10:30 AM',
              loadTon: 412,
              maxTon: 412
            })}
          onPrimaryAction={() => {
            deployDone = true;
            showToast('Deploy a Producción v2.4 confirmado');
          }}
        />

        <!-- 2. EL DÍA: HOY -->
        <ZeaTimeline
          theme="default"
          title="Hoy"
          headerActionLabel="Ver agenda"
          onHeaderAction={() => (activeTab = 'agenda')}
          entries={personalTimeline}
        />

        {#if checklistExpanded}
          <div in:fade={{ duration: 150 }} id="habits-checklist-card">
            <ZeaChecklistCard
              theme="default"
              moduleBadge="RITUALES & FOCO"
              title="Hábitos & Calibración"
              subtitle="Rutina matutina, foco y desconexión"
              items={habitItems}
              actionLabel="Consolidar Hábitos"
              onToggleItem={toggleHabitItem}
              onInputSubmit={handleHabitInput}
              onAction={() => showToast('Hábitos del día sincronizados')}
            />
          </div>
        {/if}

        <!-- 3. PENDIENTES -->
        <ZeaApprovalCard
          theme="default"
          title="Por aprobar"
          avatarText="AWS"
          entityName="Renovación Servidores Cloud"
          entityDetails="Producción & Sandbox · $149 USD"
          citationText="Facturación de cómputo elástico, base de datos y CDN del mes dentro del límite proyectado."
          isApproved={cloudApprovalDone}
          isRejected={cloudApprovalRejected}
          onApprove={approveCloudPayment}
          onReject={() => {
            cloudApprovalRejected = true;
            showToast('Renovación postergada');
          }}
        />

        <!-- 4. ESTA SEMANA -->
        <ZeaConcentricRings
          theme="default"
          title="Esta semana"
          subtitle=""
          items={lifeRings}
        />

        <!-- 5. TENDENCIA 8 SEMANAS -->
        <ZeaMetricTrend
          theme="default"
          title="Balance semanal"
          badgeText="+12% vs mes anterior"
          metricValue="38 hrs"
          metricUnit="esta semana"
          metricSubtitle="298 hrs acumuladas en últimas 8 semanas · Prom. 37.2 h/sem"
          targetValue={40}
          targetLabel="Meta 40 h"
          bars={focusBars}
          barLabels={focusLabels}
          distribution={focusDistribution}
        />
      {/if}
    </div>

    {#if viewMode === 'chat'}
      <ZeaGliaBar
        theme="default"
        placeholder="Pregunta sobre el SDK móvil, tareas o hábitos..."
        chips={['Aprobar Deploy v2.4', '¿Cómo viene el pádel hoy?', '¿Cuántas horas de foco llevo?']}
        bind:inputText={chatInputText}
        onSendPrompt={handleSendPrompt}
      />
    {/if}
  </main>

  <!-- Bottom Navigation Bar (4 Tabs) -->
  <nav class="h-14 border-t border-[#1C1C22] bg-[#0A0A0C]/95 backdrop-blur-md px-6 flex items-center justify-between text-xs z-20 shrink-0">
    <!-- TAB 1: RESUMEN -->
    <button
      type="button"
      onclick={() => (activeTab = 'summary')}
      class="flex flex-col items-center gap-1 transition px-2 cursor-pointer {activeTab === 'summary' ? 'text-white font-semibold' : 'text-zinc-500 hover:text-zinc-300'}"
    >
      <svg class="w-5 h-5 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
      </svg>
      <span class="text-[10px] tracking-tight">Resumen</span>
    </button>

    <!-- TAB 2: AGENDA -->
    <button
      type="button"
      onclick={() => (activeTab = 'agenda')}
      class="flex flex-col items-center gap-1 transition px-2 cursor-pointer {activeTab === 'agenda' ? 'text-white font-semibold' : 'text-zinc-500 hover:text-zinc-300'}"
    >
      <svg class="w-5 h-5 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
      </svg>
      <span class="text-[10px] tracking-tight">Agenda</span>
    </button>

    <!-- TAB 3: HÁBITOS -->
    <button
      type="button"
      onclick={() => (activeTab = 'habits')}
      class="flex flex-col items-center gap-1 transition px-2 cursor-pointer {activeTab === 'habits' ? 'text-white font-semibold' : 'text-zinc-500 hover:text-zinc-300'}"
    >
      <svg class="w-5 h-5 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
      </svg>
      <span class="text-[10px] tracking-tight">Hábitos</span>
    </button>

    <!-- TAB 4: PERFIL -->
    <button
      type="button"
      onclick={() => (activeTab = 'profile')}
      class="flex flex-col items-center gap-1 transition px-2 cursor-pointer {activeTab === 'profile' ? 'text-white font-semibold' : 'text-zinc-500 hover:text-zinc-300'}"
    >
      <svg class="w-5 h-5 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
      </svg>
      <span class="text-[10px] tracking-tight">Perfil</span>
    </button>
  </nav>

  <!-- Sheet Modal -->
  {#if sheetData}
    <ZeaSheet
      theme="default"
      isOpen={sheetOpen}
      avatarText="PR"
      title={sheetData.title}
      subtitle="{sheetData.driver} · {sheetData.type}"
      progressLabel="Verificación de código y seguridad"
      progressValueText={sheetData.temp}
      progressPct={100}
      stats={[
        { label: 'Estado', value: sheetData.status },
        { label: 'Destino', value: sheetData.destination },
        { label: 'Seguridad', value: sheetData.temp },
        { label: 'Horario', value: sheetData.eta }
      ]}
      onClose={closeSheet}
    />
  {/if}
</div>
