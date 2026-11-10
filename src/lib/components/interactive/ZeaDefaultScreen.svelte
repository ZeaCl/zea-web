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
    platform = 'ios',
    onNavigateToSport = () => {}
  }: {
    lang?: 'en' | 'es';
    platform?: 'ios' | 'android';
    onNavigateToSport?: () => void;
  } = $props();

  // Navigation tabs: Resumen, Agenda, Deporte, Perfil
  let activeTab = $state<'summary' | 'agenda' | 'sport' | 'profile'>('summary');
  let viewMode = $state<'chat' | 'app'>('chat');

  // Interactive toast
  let toastMessage = $state<string | null>(null);
  let toastTimeout: any = null;

  // Actions states
  let deployDone = $state(false);
  let cloudApprovalDone = $state(false);
  let cloudApprovalRejected = $state(false);

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

  function approveCloudPayment() {
    if (cloudApprovalDone) return;
    cloudApprovalDone = true;
    showToast(lang === 'en' ? 'Cloud infrastructure authorized ($149 USD)' : 'Infraestructura Cloud autorizada ($149 USD)');
  }

  // =========================================================================
  // 1. TIMELINE ENTRIES (Hoy)
  // =========================================================================
  const personalTimeline = $derived([
    {
      id: '1',
      time: '07:30',
      title: lang === 'en' ? 'Strength Training Session' : 'Hacer entrenamiento de fuerza',
      subtitle: lang === 'en' ? '50 min with Gus · Upper body routine' : '50 min con Gus · Rutina de tren superior',
      actionLabel: lang === 'en' ? 'Open ZEA Sport' : 'Ir a ZEA Sport',
      status: 'active' as const,
      onClick: () => {
        showToast(lang === 'en' ? 'Opening ZEA Sport...' : 'Abriendo ZEA Sport...');
        onNavigateToSport();
      }
    },
    {
      id: '2',
      time: '09:00',
      title: lang === 'en' ? 'Daily Standup & Sync' : 'Daily Standup & Sincronización',
      subtitle: lang === 'en' ? 'Bank X · Architecture & Code Review' : 'Banco X · Arquitectura & Code Review',
      status: 'completed' as const
    },
    {
      id: '3',
      time: '10:30',
      title: lang === 'en' ? 'Production Deploy v2.4 (Core)' : 'Deploy a Producción v2.4 (Core)',
      subtitle: lang === 'en' ? 'Scheduled release window · PR #412' : 'Release ventana programada · PR #412',
      status: 'active' as const,
      onClick: () =>
        openItemDetails({
          title: lang === 'en' ? 'Production Deploy v2.4' : 'Deploy Producción v2.4',
          driver: lang === 'en' ? 'Bank X Core' : 'Banco X Core',
          type: 'Sprint 14',
          plant: 'GCP southamerica-west1',
          temp: lang === 'en' ? '0 vulnerabilities' : '0 vulnerabilidades',
          destination: 'API Gateway & Core',
          status: lang === 'en' ? 'Ready for deploy' : 'Listo para deploy',
          eta: '10:30 AM',
          loadTon: 412,
          maxTon: 412
        })
    },
    {
      id: '4',
      time: '13:00',
      title: lang === 'en' ? 'Strategic Review & Board Meeting' : 'Revisión Estratégica & Directorio',
      subtitle: lang === 'en' ? 'Growth metrics and company financials' : 'Métricas de crecimiento y finanzas de la empresa',
      status: 'available' as const,
      actionLabel: lang === 'en' ? 'View details' : 'Ver detalles',
      onAction: () => showToast(lang === 'en' ? 'Board review scheduled' : 'Revisión de directorio programada')
    },
    {
      id: '5',
      time: '16:30',
      title: lang === 'en' ? 'School Pick-up & Family Time' : 'Salida Colegio & Tiempo en Familia',
      subtitle: lang === 'en' ? 'Kids pick-up · Zero screen time' : 'Traslado niños · Cero pantallas',
      status: 'scheduled' as const
    },
    {
      id: '6',
      time: '19:30',
      title: lang === 'en' ? 'Padel Match · Chicureo' : 'Partido de Pádel · Chicureo',
      subtitle: lang === 'en' ? 'Court 4 booked · Rodrigo, Felipe & Matías' : 'Cancha 4 reservada · Rodrigo, Felipe y Matías',
      status: 'scheduled' as const
    }
  ]);

  // Life Balance Concentric Rings (Apple Health inspired)
  const lifeRings = $derived([
    {
      label: lang === 'en' ? 'Deep Work / Focus' : 'Deep Work / Foco',
      value: lang === 'en' ? '34 / 40 hrs' : '34 / 40 hrs',
      delta: lang === 'en' ? '85% completed' : '85% completado',
      pct: 34 / 40,
      color: '#FFFFFF'
    },
    {
      label: lang === 'en' ? 'Health & Sports' : 'Salud & Deporte',
      value: lang === 'en' ? '4 / 5 days' : '4 / 5 días',
      delta: lang === 'en' ? '3 gym + 1 padel' : '3 gym + 1 pádel',
      pct: 4 / 5,
      color: '#A1A1AA'
    },
    {
      label: lang === 'en' ? 'Family Budget' : 'Presupuesto Familiar',
      value: lang === 'en' ? '65% month' : '65% mes',
      delta: lang === 'en' ? 'Within budget' : 'Dentro de norma',
      pct: 0.65,
      color: '#71717A'
    }
  ]);

  // 8-Week Trends
  const focusBars = [32, 35, 38, 40, 36, 42, 37, 38];
  const focusLabels = ['S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'S7', 'Hoy'];
  const focusDistribution = $derived([
    {
      label: lang === 'en' ? 'Deep Work & Development' : 'Deep Work & Desarrollo',
      percentage: 60,
      color: '#FFFFFF'
    },
    {
      label: lang === 'en' ? 'Health, Padel & Family' : 'Salud, Pádel & Familia',
      percentage: 40,
      color: '#71717A'
    }
  ]);

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
      text: '¡Buenos días, Carlos! A las 07:30 tienes tu entrenamiento de fuerza con Gus. Luego tu foco principal es el Deploy a Producción a las 10:30, directorio a las 13:00 y pádel a las 19:30. ¿Autorizamos la renovación de servidores Cloud ($149 USD)?',
      isPrimarySummary: true
    }
  ]);

  $effect(() => {
    chatMessages = [
      {
        id: 'msg-0',
        sender: 'user',
        time: '08:00',
        text: lang === 'en' ? "What's on the schedule today?" : '¿Qué tenemos para hoy?'
      },
      {
        id: 'msg-1',
        sender: 'agent',
        time: '08:00',
        text: lang === 'en'
          ? 'Good morning, Carlos! At 07:30 you have your strength training with Gus. Then your main focus is Production Deploy at 10:30, Board meeting at 13:00, and padel at 19:30. Shall we approve the Cloud server renewal ($149 USD)?'
          : '¡Buenos días, Carlos! A las 07:30 tienes tu entrenamiento de fuerza con Gus. Luego tu foco principal es el Deploy a Producción a las 10:30, directorio a las 13:00 y pádel a las 19:30. ¿Autorizamos la renovación de servidores Cloud ($149 USD)?',
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
        reply = lang === 'en'
          ? 'In Swift, simply instantiate IOSClient with your Secure Enclave key. Zero intermediate servers and latency < 20ms.'
          : 'En Swift solo necesitas instanciar IOSClient con la clave del Secure Enclave. Cero servidores intermediarios y latencia < 20ms.';
      } else if (lower.includes('deploy') || lower.includes('aprobar') || lower.includes('approve')) {
        deployDone = true;
        cloudApprovalDone = true;
        reply = lang === 'en'
          ? '✓ Production Deploy v2.4 confirmed. Pipeline running on AWS us-east-1 with 0 reported vulnerabilities.'
          : '✓ Deploy a Producción v2.4 confirmado. Pipeline en ejecución en AWS us-east-1 sin vulnerabilidades reportadas.';
        showToast(lang === 'en' ? 'Deploy executed' : 'Deploy ejecutado');
      } else if (lower.includes('padel') || lower.includes('pádel')) {
        reply = lang === 'en'
          ? 'Padel match is scheduled for 19:30 on Court 4 Club Chicureo with Rodrigo, Felipe, and Matías. Court booked and paid.'
          : 'El partido de pádel está programado a las 19:30 en Cancha 4 Club Chicureo con Rodrigo, Felipe y Matías. Cancha reservada y pagada.';
      } else if (lower.includes('foco') || lower.includes('focus') || lower.includes('horas') || lower.includes('hours')) {
        reply = lang === 'en'
          ? 'You have logged 34 hours of Deep Work this week (85% of your 40h goal). Great balance with 4 sports sessions.'
          : 'Llevas 34 horas de Deep Work esta semana (85% de tu meta de 40h). Buen balance con tus 4 sesiones de deporte.';
      } else {
        reply = lang === 'en'
          ? `Understood Carlos. I have recorded "${text}" in your schedule and calibrated today's priorities.`
          : `Entendido Carlos. He registrado "${text}" en tu agenda y calibrado las prioridades del día.`;
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
      onModeChange={(m) => showToast(m === 'chat' ? (lang === 'en' ? 'AI Chat Mode active' : 'Modo Chat AI activo') : (lang === 'en' ? 'Classic App Mode active' : 'Modo App Clásica activo'))}
    />
  </header>

  <!-- Main Scrollable Body Area -->
  <main class="flex-1 min-h-0 flex flex-col overflow-hidden bg-black">
    <div
      class="flex-1 overflow-y-auto px-4 py-4 space-y-4 text-left scroll-smooth"
      bind:this={summaryScrollEl}
      use:dragScroll
      role="region"
      aria-label={lang === 'en' ? 'Personal Summary Section' : 'Sección Resumen Personal'}
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
                        <span>{lang === 'en' ? '✓ Payment Authorized' : '✓ Pago Autorizado'}</span>
                      {:else}
                        <span>{lang === 'en' ? 'Approve Cloud Renewal ($149)' : 'Aprobar Renovación Cloud ($149)'}</span>
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
                    badgeText={lang === 'en' ? 'In progress' : 'Release en curso'}
                    etaText={lang === 'en' ? 'in 45 min' : 'en 45 min'}
                    mainMetric="v2.4.0"
                    metricSuffix=" · Sprint 14"
                    avatarText="PR"
                    title="Deploy Core & API Gateway"
                    subtitle={lang === 'en' ? 'Pull Request #412 verified · 0 vulnerabilities' : 'Pull Request #412 verificado · 0 vulnerabilidades'}
                    secondaryActionLabel={lang === 'en' ? 'View Pull Request' : 'Ver Pull Request'}
                    primaryActionLabel={lang === 'en' ? 'Confirm Deploy' : 'Confirmar Deploy'}
                    primaryDoneLabel={lang === 'en' ? '✓ Deploy Executed' : '✓ Deploy Ejecutado'}
                    isDone={deployDone}
                    onSecondaryAction={() =>
                      openItemDetails({
                        title: 'PR #412: Core API Gateway',
                        driver: 'Banco X Core',
                        type: 'TypeScript & Swift',
                        plant: 'Production',
                        temp: lang === 'en' ? 'Validated' : 'Validado',
                        destination: 'AWS us-east-1',
                        status: lang === 'en' ? 'Approved' : 'Aprobado',
                        eta: '10:30 AM',
                        loadTon: 412,
                        maxTon: 412
                      })}
                    onPrimaryAction={() => {
                      deployDone = true;
                      showToast(lang === 'en' ? 'Production Deploy v2.4 confirmed' : 'Deploy a Producción v2.4 confirmado');
                    }}
                  />

                  <!-- 2. EL DÍA: HOY -->
                  <ZeaTimeline
                    theme="default"
                    title={lang === 'en' ? 'Today' : 'Hoy'}
                    headerActionLabel={lang === 'en' ? 'View schedule' : 'Ver agenda'}
                    onHeaderAction={() => (activeTab = 'agenda')}
                    entries={personalTimeline}
                  />

                  <!-- 3. PENDIENTES: POR APROBAR -->
                  <ZeaApprovalCard
                    theme="default"
                    title={lang === 'en' ? 'Pending Approval' : 'Por aprobar'}
                    avatarText="AWS"
                    entityName={lang === 'en' ? 'Cloud Server Renewal' : 'Renovación Servidores Cloud'}
                    entityDetails={lang === 'en' ? 'Production & Sandbox · $149 USD' : 'Producción & Sandbox · $149 USD'}
                    citationText={lang === 'en' ? 'Elastic compute, database, and CDN monthly billing within projected limits.' : 'Facturación de cómputo elástico, base de datos y CDN del mes dentro del límite proyectado.'}
                    isApproved={cloudApprovalDone}
                    isRejected={cloudApprovalRejected}
                    onApprove={approveCloudPayment}
                    onReject={() => {
                      cloudApprovalRejected = true;
                      showToast(lang === 'en' ? 'Renewal postponed' : 'Renovación postergada');
                    }}
                  />

                  <!-- 4. ESTA SEMANA -->
                  <ZeaConcentricRings
                    theme="default"
                    title={lang === 'en' ? 'This week' : 'Esta semana'}
                    subtitle=""
                    items={lifeRings}
                  />

                  <!-- 5. TENDENCIA 8 SEMANAS -->
                  <ZeaMetricTrend
                    theme="default"
                    title={lang === 'en' ? 'Weekly Balance' : 'Balance semanal'}
                    badgeText={lang === 'en' ? '+12% vs last month' : '+12% vs mes anterior'}
                    metricValue="38 hrs"
                    metricUnit={lang === 'en' ? 'this week' : 'esta semana'}
                    metricSubtitle={lang === 'en' ? '298 hrs in last 8 weeks · Avg 37.2 h/wk' : '298 hrs acumuladas en últimas 8 semanas · Prom. 37.2 h/sem'}
                    targetValue={40}
                    targetLabel={lang === 'en' ? 'Goal 40 h' : 'Meta 40 h'}
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
          <h3 class="text-[20px] font-semibold tracking-tight text-white leading-tight">{lang === 'en' ? 'Executive Summary' : 'Resumen Ejecutivo'}</h3>
          <p class="text-[12px] text-zinc-400 mt-0.5">
            {lang === 'en' ? 'End-to-end orchestration of work, health, finances and family.' : 'Orquestación integral de trabajo, salud, finanzas y compromisos familiares.'}
          </p>
        </section>

        <!-- 1. NOW -->
        <ZeaFocusCard
          theme="default"
          badgeText={lang === 'en' ? 'Release in progress' : 'Release en curso'}
          etaText={lang === 'en' ? 'in 45 min' : 'en 45 min'}
          mainMetric="v2.4.0"
          metricSuffix=" · Sprint 14"
          avatarText="PR"
          title="Deploy Core & API Gateway"
          subtitle={lang === 'en' ? 'Pull Request #412 verified · 0 vulnerabilities' : 'Pull Request #412 verificado · 0 vulnerabilidades'}
          secondaryActionLabel={lang === 'en' ? 'View Pull Request' : 'Ver Pull Request'}
          primaryActionLabel={lang === 'en' ? 'Confirm Deploy' : 'Confirmar Deploy'}
          primaryDoneLabel={lang === 'en' ? '✓ Deploy Executed' : '✓ Deploy Ejecutado'}
          isDone={deployDone}
          onSecondaryAction={() =>
            openItemDetails({
              title: 'PR #412: Core API Gateway',
              driver: 'Banco X Core',
              type: 'TypeScript & Swift',
              plant: 'Production',
              temp: lang === 'en' ? 'Validated' : 'Validado',
              destination: 'AWS us-east-1',
              status: lang === 'en' ? 'Approved' : 'Aprobado',
              eta: '10:30 AM',
              loadTon: 412,
              maxTon: 412
            })}
          onPrimaryAction={() => {
            deployDone = true;
            showToast(lang === 'en' ? 'Production Deploy v2.4 confirmed' : 'Deploy a Producción v2.4 confirmado');
          }}
        />

        <!-- 2. EL DÍA: HOY -->
        <ZeaTimeline
          theme="default"
          title={lang === 'en' ? 'Today' : 'Hoy'}
          headerActionLabel={lang === 'en' ? 'View schedule' : 'Ver agenda'}
          onHeaderAction={() => (activeTab = 'agenda')}
          entries={personalTimeline}
        />

        <!-- 3. PENDIENTES -->
        <ZeaApprovalCard
          theme="default"
          title={lang === 'en' ? 'Pending Approval' : 'Por aprobar'}
          avatarText="AWS"
          entityName={lang === 'en' ? 'Cloud Server Renewal' : 'Renovación Servidores Cloud'}
          entityDetails={lang === 'en' ? 'Production & Sandbox · $149 USD' : 'Producción & Sandbox · $149 USD'}
          citationText={lang === 'en' ? 'Elastic compute, database, and CDN monthly billing within projected limits.' : 'Facturación de cómputo elástico, base de datos y CDN del mes dentro del límite proyectado.'}
          isApproved={cloudApprovalDone}
          isRejected={cloudApprovalRejected}
          onApprove={approveCloudPayment}
          onReject={() => {
            cloudApprovalRejected = true;
            showToast(lang === 'en' ? 'Renewal postponed' : 'Renovación postergada');
          }}
        />

        <!-- 4. ESTA SEMANA -->
        <ZeaConcentricRings
          theme="default"
          title={lang === 'en' ? 'This week' : 'Esta semana'}
          subtitle=""
          items={lifeRings}
        />

        <!-- 5. TENDENCIA 8 SEMANAS -->
        <ZeaMetricTrend
          theme="default"
          title={lang === 'en' ? 'Weekly Balance' : 'Balance semanal'}
          badgeText={lang === 'en' ? '+12% vs last month' : '+12% vs mes anterior'}
          metricValue="38 hrs"
          metricUnit={lang === 'en' ? 'this week' : 'esta semana'}
          metricSubtitle={lang === 'en' ? '298 hrs in last 8 weeks · Avg 37.2 h/wk' : '298 hrs acumuladas en últimas 8 semanas · Prom. 37.2 h/sem'}
          targetValue={40}
          targetLabel={lang === 'en' ? 'Goal 40 h' : 'Meta 40 h'}
          bars={focusBars}
          barLabels={focusLabels}
          distribution={focusDistribution}
        />
      {/if}
    </div>

    {#if viewMode === 'chat'}
      <ZeaGliaBar
        theme="default"
        placeholder={lang === 'en' ? 'Ask about the mobile SDK, deploys or schedule...' : 'Pregunta sobre el SDK móvil, deploys o tu agenda...'}
        chips={lang === 'en' ? ['Approve Deploy v2.4', 'What time is padel today?', 'How many focus hours so far?'] : ['Aprobar Deploy v2.4', '¿A qué hora es el pádel?', '¿Cuántas horas de foco llevo?']}
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
      <span class="text-[10px] tracking-tight">{lang === 'en' ? 'Summary' : 'Resumen'}</span>
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
      <span class="text-[10px] tracking-tight">{lang === 'en' ? 'Schedule' : 'Agenda'}</span>
    </button>

    <!-- TAB 3: DEPORTE (Navega directo a ZEA Sport) -->
    <button
      type="button"
      onclick={() => {
        showToast(lang === 'en' ? 'Opening ZEA Sport...' : 'Abriendo ZEA Sport...');
        onNavigateToSport();
      }}
      class="flex flex-col items-center gap-1 transition px-2 cursor-pointer text-zinc-500 hover:text-white"
    >
      <svg class="w-5 h-5 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" d="M6 5v14M18 5v14M2 9v6M22 9v6M6 12h12"/>
      </svg>
      <span class="text-[10px] tracking-tight">{lang === 'en' ? 'Sports' : 'Deporte'}</span>
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
      <span class="text-[10px] tracking-tight">{lang === 'en' ? 'Profile' : 'Perfil'}</span>
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
      progressLabel={lang === 'en' ? 'Code & security verification' : 'Verificación de código y seguridad'}
      progressValueText={sheetData.temp}
      progressPct={100}
      stats={[
        { label: lang === 'en' ? 'Status' : 'Estado', value: sheetData.status },
        { label: lang === 'en' ? 'Target' : 'Destino', value: sheetData.destination },
        { label: lang === 'en' ? 'Security' : 'Seguridad', value: sheetData.temp },
        { label: lang === 'en' ? 'Schedule' : 'Horario', value: sheetData.eta }
      ]}
      onClose={closeSheet}
    />
  {/if}
</div>
