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
  import ZeaRetinaCaptureCard, { type ZeaCaptureFeedItem } from '../ds/ZeaRetinaCaptureCard.svelte';

  let {
    lang = 'es',
    platform = 'ios'
  }: {
    lang?: 'en' | 'es';
    platform?: 'ios' | 'android';
  } = $props();

  // Bottom Navigation Tabs: Resumen, Seguimiento, Sensores, Perfil (Jefe de Planta)
  let activeTab = $state<'summary' | 'tracking' | 'sensors' | 'profile'>('summary');
  let viewMode = $state<'chat' | 'app'>('chat');

  // Interactive toast state
  let toastMessage = $state<string | null>(null);
  let toastTimeout: any = null;
  let dischargeDone = $state(false);
  let approvalDone = $state(false);
  let approvalRejected = $state(false);
  let batchApprovalDone = $state(false);
  let batchApprovalRejected = $state(false);
  let rcaApprovalDone = $state(false);
  let rcaApprovalRejected = $state(false);
  let roadApprovalDone = $state(false);
  let roadApprovalRejected = $state(false);

  // Sheet Modal state
  let sheetOpen = $state(false);
  let sheetData = $state<any>(null);

  // Focus Card priority / Checklist expansion state
  let checklistExpanded = $state(false);
  let urgentBatchCompleted = $state(false);

  function showToast(msg: string) {
    if (toastTimeout) clearTimeout(toastTimeout);
    toastMessage = msg;
    toastTimeout = setTimeout(() => {
      toastMessage = null;
    }, 2400);
  }

  function openTruckDetails(truck: any) {
    sheetData = truck;
    sheetOpen = true;
  }

  function closeSheet() {
    sheetOpen = false;
  }

  // =========================================================================
  // 1. PARTE DIARIO CHECKLIST DATA (Planta & Despacho)
  // =========================================================================
  let parteDiarioItems = $state<ZeaChecklistItem[]>([
    {
      id: 'pd-1',
      label: 'Lectura Horómetros iniciales de planta (Secador & Mezclador)',
      checked: true,
      requiresInput: true,
      inputValue: '4,812.5 hrs',
      inputPlaceholder: 'Ej: 4812.5 hrs',
      presetValues: ['4,812.5 hrs', '4,850.0 hrs']
    },
    {
      id: 'pd-2',
      label: 'Medición de Estanques de Combustible (GLP / Petróleo / R20)',
      checked: true,
      requiresInput: true,
      inputValue: '84% (145 t)',
      inputPlaceholder: 'Ej: 84% o 145 t',
      presetValues: ['84% (145 t)', '90% (160 t)']
    },
    {
      id: 'pd-3',
      label: 'Dosificación de Áridos y Filler por Fórmula (Lote #114)',
      checked: false,
      requiresInput: true,
      inputValue: '',
      inputPlaceholder: 'Ingresar compensación (ej: -18 L)',
      presetValues: ['-18 L agua (28t)', 'Fórmula standard']
    },
    {
      id: 'pd-4',
      label: 'Despacho & Guías Mixer #42 / Tolva #08',
      checked: false,
      requiresInput: true,
      inputValue: '',
      inputPlaceholder: 'Número de guía (ej: Guía #88412)',
      presetValues: ['Guía #88412', 'Guía #88413']
    },
    {
      id: 'pd-5',
      label: 'Cierre de Producción del Día',
      checked: false,
      requiresInput: true,
      inputValue: '',
      inputPlaceholder: 'Tonelaje total (ej: 420 t)',
      presetValues: ['420 t en norma', '450 t']
    }
  ]);

  function toggleParteDiarioItem(id: string) {
    parteDiarioItems = parteDiarioItems.map((item) =>
      item.id === id ? { ...item, checked: !item.checked } : item
    );
    showToast('Parte Diario actualizado');
  }

  function handleParteDiarioInput(id: string, value: string) {
    parteDiarioItems = parteDiarioItems.map((item) =>
      item.id === id ? { ...item, checked: true, inputValue: value } : item
    );
    showToast(`Dato validado: ${value}`);
  }

  function compensateAndRelease() {
    if (urgentBatchCompleted) return;
    urgentBatchCompleted = true;
    batchApprovalDone = true;
    parteDiarioItems[2].checked = true;
    parteDiarioItems[2].inputValue = '-18 L agua (28t)';
    parteDiarioItems[3].checked = true;
    parteDiarioItems[3].inputValue = 'Guía #88412';
    showToast('Compensación de -18L aplicada y Lote #114 liberado');

    const now = '08:02';
    checklistChat = [
      ...checklistChat,
      {
        id: `usr-comp-${Date.now()}`,
        sender: 'user',
        time: now,
        text: 'Compensar agua y liberar Lote #114'
      }
    ];

    setTimeout(() => {
      checklistChat = [
        ...checklistChat,
        {
          id: `agt-comp-${Date.now()}`,
          sender: 'agent',
          time: now,
          text: 'Compensación de agua aplicada (-18 L). Lote #114 cargado en Mixer #42. Tambor a 165°C en ruta por Autopista Central. Parte Diario al 100% con firma digital.'
        }
      ];
      scrollToBottom(summaryScrollEl);
    }, 250);
  }

  // =========================================================================
  // 2. SEGUIMIENTO DATA (Workflows, Cola O(1), SLA & Anillos)
  // =========================================================================
  const timelineEntries = $derived([
    {
      id: '1',
      time: '07:30',
      title: 'Parte Diario de Planta',
      subtitle: checklistExpanded
        ? 'Ocultar checklist del turno'
        : `${parteDiarioItems.filter((i) => i.checked).length} de ${parteDiarioItems.length} verificaciones`,
      actionLabel: checklistExpanded ? 'Ocultar' : 'Ver parte diario',
      status: 'active' as const,
      onClick: () => {
        checklistExpanded = !checklistExpanded;
        showToast(checklistExpanded ? 'Parte Diario desplegado' : 'Parte Diario minimizado');
      }
    },
    {
      id: '2',
      time: '08:42',
      title: 'Workflow Despacho · Mixer #42 (Rodrigo Baeza)',
      subtitle: 'Flota · Asfalto AC-20 a 165°C · Frente Autopista',
      status: 'active' as const,
      onClick: () => openTruckDetails(fleetList[0])
    },
    {
      id: '3',
      time: '11:30',
      title: 'Validación Cita Técnica & Orden Silo 2',
      subtitle: 'Planta · Esperando firma de Jefe de Planta',
      status: 'available' as const,
      actionLabel: 'Autorizar',
      onAction: () => showToast('Orden de Silo 2 autorizada')
    },
    {
      id: '4',
      time: '13:00',
      title: 'Cierre Guía DTE & Auditoría Terreno',
      subtitle: 'Flota · Despacho con guía electrónica firmada',
      status: 'scheduled' as const
    }
  ]);

  const industrialRings = [
    { label: 'Tonelaje Despachado', value: '420 / 500 t', delta: '+35 t vs ayer', pct: 420 / 500, color: '#FFCD00' },
    { label: 'Checklists Terreno', value: '34 / 35 sitios', delta: '97% SHA-256 OK', pct: 34 / 35, color: '#F59E0B' },
    { label: 'Compliance & Norma', value: '98.6%', delta: 'Citas verificadas', pct: 0.986, color: '#38BDF8' }
  ];

  // =========================================================================
  // 3. SENSORES DATA (Capturas QR/OCR/Visión + Telemetría IoT Planta/Flota)
  // =========================================================================
  const sensorCaptures: ZeaCaptureFeedItem[] = [
    {
      id: 'cap-1',
      source: 'ESCANEO QR',
      domain: 'Flota',
      title: 'Escaneo QR Cabina · Mixer #42',
      detail: 'Patente y Guía #88412 vinculadas al Parte Diario sin tipeo',
      metric: '99.9% Match',
      status: 'ok'
    },
    {
      id: 'cap-2',
      source: 'SENSOR IOT',
      domain: 'Planta',
      title: 'Telemetría Silo #1 & Tambor Secador',
      detail: 'Asfalto AC-20 en norma · Humedad áridos Tolva 3 (+1.4%)',
      metric: '165.2°C',
      status: 'warning'
    },
    {
      id: 'cap-3',
      source: 'LECTURA OCR',
      domain: 'Planta',
      title: 'Lectura Óptica Horómetro & Flujómetro GLP',
      detail: 'Captura directa desde tablero de planta · Cero error humano',
      metric: '4,812.5 hrs',
      status: 'ok'
    },
    {
      id: 'cap-4',
      source: 'VISIÓN IA',
      domain: 'Flota',
      title: 'Evidencia Georreferenciada Frente / Instalación',
      detail: 'Foto con hash SHA-256 vinculada a requisito RCA / MOP',
      metric: 'GPS + Hash',
      status: 'ok'
    }
  ];

  const fleetList = [
    { id: 'm42', code: 'M-42', type: 'Mixer Asfáltico', driver: 'Rodrigo Baeza', mixType: 'Asfalto AC-20', temp: '165°C', status: 'En ruta', eta: '18 min', loadTon: 28, maxTon: 30, plant: 'Planta Maipú', destination: 'Autopista Central Tramo 4', domain: 'Flota' as const },
    { id: 't08', code: 'T-08', type: 'Tolva Térmica', driver: 'Manuel Soto', mixType: 'SMA-12 Antiruido', temp: '162°C', status: 'Descarga finalizada', eta: 'En obra', loadTon: 32, maxTon: 32, plant: 'Planta Maipú', destination: 'Autopista Central Tramo 2', domain: 'Flota' as const },
    { id: 'm19', code: 'M-19', type: 'Mixer Pesado', driver: 'Cristián Vega', mixType: 'Binder Gravas-Asfalto', temp: '158°C', status: 'Carga en planta', eta: 'Salida 13:00', loadTon: 26, maxTon: 28, plant: 'Planta Quilicura', destination: 'Av. Américo Vespucio', domain: 'Flota' as const }
  ];

  const productionBars = [310, 340, 390, 420, 380, 450, 410, 420];
  const productionLabels = ['S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'S7', 'Hoy'];
  const asphaltDistribution = [
    { label: 'Asfalto AC-20', percentage: 58, color: '#FFCD00' },
    { label: 'SMA-12 Antiruido', percentage: 42, color: '#71717A' }
  ];

  // =========================================================================
  // CHAT STREAMS PER SECTION
  // =========================================================================
  interface ChatMessage {
    id: string;
    sender: 'user' | 'agent';
    time: string;
    text: string;
    isPrimarySummary?: boolean;
    quickCard?: 'mixer42' | 'checklist' | 'tracking' | 'sensors' | 'notifications' | null;
  }

  function scrollToParteDiario() {
    const el = document.getElementById('parte-diario-task-card');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    showToast('Enfocando Tarea Asignada: Parte Diario');
  }

  let checklistChat = $state<ChatMessage[]>([
    {
      id: 'chk-msg-0',
      sender: 'user',
      time: '08:00',
      text: '¿Qué tenemos para hoy?'
    },
    {
      id: 'chk-msg-1',
      sender: 'agent',
      time: '08:00',
      text: '¡Buenos días, Carlos! Tienes 4 despachos programados hoy (420 de 500 t completadas). El Mixer #42 va en ruta hacia Autopista Central (165°C) y en la Tolva 3 detectamos +1.4% de humedad para el Lote #114. ¿Compensamos agua automáticamente para liberar la bachada?',
      isPrimarySummary: true
    }
  ]);

  let trackingChat = $state<ChatMessage[]>([
    {
      id: 'trk-msg-1',
      sender: 'user',
      time: '08:40',
      text: '¿En qué etapa van los workflows de despacho y cumplimiento hoy?'
    },
    {
      id: 'trk-msg-2',
      sender: 'agent',
      time: '08:40',
      text: '34 de 35 sitios están al día (98.6% en norma) y se han despachado 420 toneladas. Aquí tienes el seguimiento en tiempo real de Planta y Flota:',
      isPrimarySummary: true
    }
  ]);

  let sensorsChat = $state<ChatMessage[]>([
    {
      id: 'sen-msg-1',
      sender: 'user',
      time: '08:38',
      text: 'Muéstrame las capturas de visión, QR y sensores IoT del turno.'
    },
    {
      id: 'sen-msg-2',
      sender: 'agent',
      time: '08:38',
      text: 'Las cámaras validaron el QR del Mixer #42 y la lectura óptica del horómetro sin tipeo manual. Silo #1 opera a 170°C nominal:',
      isPrimarySummary: true
    }
  ]);

  let profileChat = $state<ChatMessage[]>([
    {
      id: 'prf-msg-1',
      sender: 'agent',
      time: '08:00',
      text: 'Ficha operativa de Jefatura de Planta Maipú activa. Registros de firma y certificaciones al día.'
    }
  ]);

  let chatInputText = $state('');
  let isAgentTyping = $state(false);

  let summaryScrollEl = $state<HTMLDivElement | null>(null);
  let trackingScrollEl = $state<HTMLDivElement | null>(null);
  let sensorsScrollEl = $state<HTMLDivElement | null>(null);
  let profileScrollEl = $state<HTMLDivElement | null>(null);

  async function scrollToBottom(el: HTMLDivElement | null) {
    await tick();
    if (el) {
      el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
    }
  }

  function handleSendPrompt(promptText: string) {
    if (!promptText.trim()) return;
    const text = promptText.trim();
    chatInputText = '';
    const now = '08:45';
    const uid = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

    const targetList =
      activeTab === 'summary'
        ? checklistChat
        : activeTab === 'tracking'
          ? trackingChat
          : activeTab === 'sensors'
            ? sensorsChat
            : profileChat;

    const targetScroll =
      activeTab === 'summary'
        ? summaryScrollEl
        : activeTab === 'tracking'
          ? trackingScrollEl
          : activeTab === 'sensors'
            ? sensorsScrollEl
            : profileScrollEl;

    targetList.push({
      id: `usr-${uid}`,
      sender: 'user',
      time: now,
      text
    });
    scrollToBottom(targetScroll);

    isAgentTyping = true;
    setTimeout(() => {
      isAgentTyping = false;
      const lower = text.toLowerCase();
      let reply = '';
      let quickCard: ChatMessage['quickCard'] = null;

      if (lower.includes('compensar') || lower.includes('liberar') || lower.includes('114')) {
        urgentBatchCompleted = true;
        parteDiarioItems[2].checked = true;
        parteDiarioItems[3].checked = true;
        reply = 'Compensación de agua aplicada (-18 L). Lote #114 cargado en Mixer #42. Tambor a 165°C en ruta por Autopista Central. Parte Diario al 100% con firma digital.';
        showToast('Lote #114 liberado');
      } else if (lower.includes('mixer') || lower.includes('42')) {
        reply = 'Mixer #42 en ruta por Autopista Central km 14. Sensores térmicos reportan tambor a 165.2°C y QR de guía validado.';
        quickCard = 'mixer42';
      } else if (lower.includes('aprobar') || lower.includes('hitl') || lower.includes('firma')) {
        approvalDone = true;
        reply = '✓ Compensación térmica del Lote #114 aprobada y firmada digitalmente.';
        showToast('Aprobación registrada con éxito');
      } else if (lower.includes('checklist') || lower.includes('parte diario')) {
        reply = 'Las 80 columnas del Parte Diario y las inspecciones con firma SHA-256 + GPS están sincronizadas en la cola O(1).';
        quickCard = 'checklist';
      } else {
        reply = `Instrucción procesada: "${text}". Sincronizado con los módulos de Planta y Flota.`;
      }

      targetList.push({
        id: `agt-${uid}`,
        sender: 'agent',
        time: now,
        text: reply,
        quickCard
      });
      scrollToBottom(targetScroll);
    }, 450);
  }
</script>

<!-- Outer Screen Container (Flex Column with min-h-0 for proper scroll containment) -->
<div class="relative flex-1 min-h-0 bg-black flex flex-col justify-between overflow-hidden select-none text-white font-sans text-left" data-testid="zea-edge-screen">

  <!-- ========================================================= -->
  <!-- STICKY TOP HEADER: TITLE + MODE SWITCHER                  -->
  <!-- ========================================================= -->
  <div class="px-4 pt-2.5 pb-2 bg-black/95 backdrop-blur-md sticky top-0 z-20 border-b border-[#242114] shrink-0">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-2.5">
        <div class="relative">
          <div class="w-8 h-8 rounded-full bg-gradient-to-tr from-[#FFCD00] to-[#FFE066] flex items-center justify-center font-black text-[13px] text-black shadow-md">
            Z
          </div>
          <span class="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-black"></span>
        </div>
        <div>
          {#if viewMode === 'chat'}
            <h2 class="font-semibold text-[13.5px] tracking-tight text-white leading-tight">
              ZEA Edge Agent
            </h2>
          {:else}
            <h2 class="font-semibold text-[13.5px] tracking-tight text-white leading-tight">
              {#if activeTab === 'summary'}
                Resumen Operativo
              {:else if activeTab === 'tracking'}
                Seguimiento Workflows
              {:else if activeTab === 'sensors'}
                Sensores & Capturas
              {:else}
                Perfil Jefe de Planta
              {/if}
            </h2>
          {/if}
        </div>
      </div>

      <!-- Top-Right Mode Toggle (Chat AI vs Classic App) -->
      <ZeaModeToggle bind:viewMode theme="industrial" onToggle={(m) => showToast(m === 'chat' ? 'Modo ZEA Chat AI activado' : 'Modo App Industrial activado')} />
    </div>
  </div>

  <!-- ========================================================= -->
  <!-- TAB 1: RESUMEN (PARTE DIARIO & PRIORIDAD DE TURNO)        -->
  <!-- ========================================================= -->
  {#if activeTab === 'summary'}
    <div class="flex-1 min-h-0 flex flex-col overflow-hidden bg-black">
      <div
        class="flex-1 min-h-0 overflow-y-auto no-scrollbar px-4 pt-3 pb-4 space-y-4 overscroll-contain touch-pan-y"
        bind:this={summaryScrollEl}
        use:dragScroll
        role="region"
        aria-label="Sección Resumen"
      >
        {#if viewMode === 'chat'}
          {#each checklistChat as msg (msg.id)}
            {#if msg.sender === 'user'}
              <div class="flex flex-col items-end gap-1 pl-12" in:fade={{ duration: 120 }}>
                <div class="bg-[#24211A] border border-[#FFCD00]/20 text-white rounded-[20px] rounded-br-xs px-4 py-2.5 shadow-md">
                  <p class="text-[13.5px] leading-relaxed">{msg.text}</p>
                </div>
                <span class="text-[10px] text-zinc-500 font-mono pr-1">{msg.time} <span class="text-[#FFCD00]">✓✓</span></span>
              </div>
            {:else}
              <div class="flex flex-col items-start gap-1.5 pr-1 w-full" in:fade={{ duration: 120 }}>
                <div class="bg-[#141412] border border-[#262418] text-zinc-200 rounded-[22px] rounded-tl-xs px-4 py-3 max-w-[96%] space-y-3 shadow-lg">
                  <p class="text-[13.5px] leading-relaxed">{msg.text}</p>

                  <!-- Botones de Acción Inmediata (porque el mensaje termina en pregunta de alerta) -->
                  {#if msg.id === 'chk-msg-1'}
                    <div class="flex flex-wrap items-center gap-2 pt-2 border-t border-[#262418]">
                      <button
                        type="button"
                        onclick={compensateAndRelease}
                        disabled={urgentBatchCompleted}
                        class="px-3.5 py-2 rounded-xl text-xs font-semibold transition cursor-pointer shadow-md {urgentBatchCompleted ? 'bg-[#27272A] text-zinc-400' : 'bg-[#FFCD00] hover:bg-[#FFE066] text-black font-bold'}"
                      >
                        {#if urgentBatchCompleted}
                          <span>✓ Lote Liberado</span>
                        {:else}
                          <span>Compensar agua y liberar</span>
                        {/if}
                      </button>
                    </div>
                  {/if}
                </div>

                {#if msg.isPrimarySummary}
                  <div class="w-full space-y-4 pt-1">
                    <!-- 1. NOW: URGENCIA ACTUAL (ZeaFocusCard) -->
                    <ZeaFocusCard
                      theme="industrial"
                      badgeText="Despacho en ruta"
                      etaText="arribo 18 min"
                      mainMetric="165°C"
                      metricSuffix=" · Mixer #42"
                      avatarText="M42"
                      title="Mixer #42 · Planta Maipú"
                      subtitle="Asfalto AC-20 · Frente Autopista Central · 28t"
                      secondaryActionLabel="Ver ficha camión"
                      primaryActionLabel="Confirmar Vertido"
                      primaryDoneLabel="✓ Vertido Registrado"
                      isDone={dischargeDone}
                      onSecondaryAction={() => openTruckDetails(fleetList[0])}
                      onPrimaryAction={() => {
                        dischargeDone = true;
                        showToast('Vertido de Mixer #42 confirmado');
                      }}
                    />

                    <!-- 2. EL DÍA: HOY (ZeaTimeline con hito 07:30 Parte Diario) -->
                    <ZeaTimeline
                      theme="industrial"
                      title="Hoy"
                      headerActionLabel="Ver seguimiento"
                      onHeaderAction={() => (activeTab = 'tracking')}
                      entries={timelineEntries}
                    />

                    <!-- Despliegue interactivo del Parte Diario activado desde el hito 07:30 de Hoy -->
                    {#if checklistExpanded}
                      <div in:fade={{ duration: 150 }} id="parte-diario-task-card">
                        <ZeaChecklistCard
                          theme="industrial"
                          moduleBadge="TAREA ASIGNADA"
                          title="Parte Diario de Operaciones"
                          subtitle="Turno Mañana · Asignado a: Carlos (Jefe de Planta)"
                          items={parteDiarioItems}
                          actionLabel="Consolidar y Firmar Turno"
                          onToggleItem={toggleParteDiarioItem}
                          onInputSubmit={handleParteDiarioInput}
                          onAction={() => showToast('Parte Diario consolidado y firmado con éxito')}
                        />
                      </div>
                    {/if}

                    <!-- 3. PENDIENTES: POR APROBAR (ZeaApprovalCard) -->
                    <ZeaApprovalCard
                      theme="industrial"
                      title="Por aprobar"
                      avatarText="L114"
                      entityName="Compensación Lote #114"
                      entityDetails="Tolva 3 (+1.4% humedad) · Ajustar -18L agua"
                      citationText="Alerta técnica: Humedad de áridos fuera de rango (+1.4%). Autorizar compensación de -18L para liberar bachada."
                      isApproved={batchApprovalDone}
                      isRejected={batchApprovalRejected}
                      onApprove={() => {
                        batchApprovalDone = true;
                        urgentBatchCompleted = true;
                        parteDiarioItems[2].checked = true;
                        parteDiarioItems[2].inputValue = '-18 L agua (28t)';
                        showToast('Compensación del Lote #114 aprobada');
                      }}
                      onReject={() => {
                        batchApprovalRejected = true;
                        showToast('Compensación rechazada - Mantener fórmula standard');
                      }}
                    />

                    <!-- 4. MEDIO PLAZO: ESTA SEMANA (ZeaConcentricRings) -->
                    <ZeaConcentricRings
                      theme="industrial"
                      title="Esta semana"
                      subtitle=""
                      items={industrialRings}
                    />

                    <!-- 5. LARGO PLAZO: ÚLTIMAS 8 SEMANAS (ZeaMetricTrend) -->
                    <ZeaMetricTrend
                      theme="industrial"
                      title="Producción semanal"
                      badgeText="+14% vs mes anterior"
                      metricValue="420 t"
                      metricUnit="esta semana"
                      metricSubtitle="3.120 t acumuladas en últimas 8 semanas · Prom. 390 t/sem"
                      targetValue={400}
                      targetLabel="Meta 400 t"
                      bars={productionBars}
                      barLabels={productionLabels}
                      distribution={asphaltDistribution}
                    />
                  </div>
                {/if}

                {#if msg.quickCard === 'mixer42'}
                  <div class="p-3.5 rounded-2xl bg-[#1C1A10] border border-[#FFCD00]/30 w-full flex items-center justify-between">
                    <div class="flex items-center gap-3">
                      <div class="w-10 h-10 rounded-full bg-[#FFCD00]/20 border border-[#FFCD00]/40 flex items-center justify-center font-bold text-[#FFCD00] text-xs font-mono">M42</div>
                      <div>
                        <p class="text-xs font-semibold text-white">Mixer #42 · Autopista Central</p>
                        <p class="text-[11px] text-zinc-400">165.2°C · 28 toneladas en ruta</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onclick={() => openTruckDetails(fleetList[0])}
                      class="px-2.5 py-1 rounded-xl bg-[#FFCD00] text-black font-semibold text-xs cursor-pointer"
                    >
                      Ver ficha
                    </button>
                  </div>
                {:else if msg.quickCard === 'checklist'}
                  <div class="w-full pt-1">
                    <ZeaChecklistCard
                      theme="industrial"
                      title="Parte Diario"
                      items={parteDiarioItems}
                      actionLabel="Consolidar Turno"
                      onToggleItem={toggleParteDiarioItem}
                      onInputSubmit={handleParteDiarioInput}
                      onAction={() => showToast('Parte Diario sincronizado')}
                    />
                  </div>
                {/if}
              </div>
            {/if}
          {/each}
        {:else}
          <!-- CLASSIC APP MODE FOR CHECKLIST -->
          <section class="pt-0.5">
            <h3 class="text-[20px] font-semibold tracking-tight text-white leading-tight">Parte Diario de Planta</h3>
            <p class="text-[12px] text-zinc-400 mt-0.5">
              Control diario de producción, horómetros, combustibles y despacho.
            </p>
          </section>

          <!-- 1. NOW: URGENCIA ACTUAL (ZeaFocusCard) -->
          <ZeaFocusCard
            theme="industrial"
            badgeText="Despacho en ruta"
            etaText="arribo 18 min"
            mainMetric="165°C"
            metricSuffix=" · Mixer #42"
            avatarText="M42"
            title="Mixer #42 · Planta Maipú"
            subtitle="Asfalto AC-20 · Frente Autopista Central · 28t"
            secondaryActionLabel="Ver ficha camión"
            primaryActionLabel="Confirmar Vertido"
            primaryDoneLabel="✓ Vertido Registrado"
            isDone={dischargeDone}
            onSecondaryAction={() => openTruckDetails(fleetList[0])}
            onPrimaryAction={() => {
              dischargeDone = true;
              showToast('Vertido de Mixer #42 confirmado');
            }}
          />

          <!-- 2. EL DÍA: HOY (ZeaTimeline con hito 07:30 Parte Diario) -->
          <ZeaTimeline
            theme="industrial"
            title="Hoy"
            headerActionLabel="Ver seguimiento"
            onHeaderAction={() => (activeTab = 'tracking')}
            entries={timelineEntries}
          />

          <!-- Despliegue interactivo del Parte Diario activado desde el hito 07:30 de Hoy -->
          {#if checklistExpanded}
            <div in:fade={{ duration: 150 }} id="parte-diario-task-card">
              <ZeaChecklistCard
                theme="industrial"
                moduleBadge="TAREA ASIGNADA"
                title="Parte Diario de Operaciones"
                subtitle="Turno Mañana · Asignado a: Carlos (Jefe de Planta)"
                items={parteDiarioItems}
                actionLabel="Consolidar y Firmar Turno"
                onToggleItem={toggleParteDiarioItem}
                onInputSubmit={handleParteDiarioInput}
                onAction={() => showToast('Parte Diario consolidado y firmado con éxito')}
              />
            </div>
          {/if}

          <!-- 3. PENDIENTES: POR APROBAR (ZeaApprovalCard) -->
          <ZeaApprovalCard
            theme="industrial"
            title="Por aprobar"
            avatarText="L114"
            entityName="Compensación Lote #114"
            entityDetails="Tolva 3 (+1.4% humedad) · Ajustar -18L agua"
            citationText="Alerta técnica: Humedad de áridos fuera de rango (+1.4%). Autorizar compensación de -18L para liberar bachada."
            isApproved={batchApprovalDone}
            isRejected={batchApprovalRejected}
            onApprove={() => {
              batchApprovalDone = true;
              urgentBatchCompleted = true;
              parteDiarioItems[2].checked = true;
              parteDiarioItems[2].inputValue = '-18 L agua (28t)';
              showToast('Compensación del Lote #114 aprobada');
            }}
            onReject={() => {
              batchApprovalRejected = true;
              showToast('Compensación rechazada - Mantener fórmula standard');
            }}
          />

          <!-- 4. MEDIO PLAZO: ESTA SEMANA (ZeaConcentricRings) -->
          <ZeaConcentricRings
            theme="industrial"
            title="Esta semana"
            subtitle=""
            items={industrialRings}
          />

          <!-- 5. LARGO PLAZO: ÚLTIMAS 8 SEMANAS (ZeaMetricTrend) -->
          <ZeaMetricTrend
            theme="industrial"
            title="Producción semanal"
            badgeText="+14% vs mes anterior"
            metricValue="420 t"
            metricUnit="esta semana"
            metricSubtitle="3.120 t acumuladas en últimas 8 semanas · Prom. 390 t/sem"
            targetValue={400}
            targetLabel="Meta 400 t"
            bars={productionBars}
            barLabels={productionLabels}
            distribution={asphaltDistribution}
          />
        {/if}
      </div>

      {#if viewMode === 'chat'}
        <ZeaGliaBar
          theme="industrial"
          placeholder="Consultar dosificación, silos o parte diario..."
          chips={['Compensar agua y liberar', 'Estado Parte Diario', 'Ubicación Mixer #42']}
          bind:inputText={chatInputText}
          onSendPrompt={handleSendPrompt}
        />
      {/if}
    </div>

  <!-- ========================================================= -->
  <!-- TAB 2: SEGUIMIENTO (WORKFLOWS, ESTADOS & ANILLOS)         -->
  <!-- ========================================================= -->
  {:else if activeTab === 'tracking'}
    <div class="flex-1 min-h-0 flex flex-col overflow-hidden bg-black">
      <div
        class="flex-1 min-h-0 overflow-y-auto no-scrollbar px-4 pt-3 pb-4 space-y-4 overscroll-contain touch-pan-y"
        bind:this={trackingScrollEl}
        use:dragScroll
        role="region"
        aria-label="Sección Seguimiento"
      >
        {#if viewMode === 'chat'}
          {#each trackingChat as msg (msg.id)}
            {#if msg.sender === 'user'}
              <div class="flex flex-col items-end gap-1 pl-12">
                <div class="bg-[#24211A] border border-[#FFCD00]/20 text-white rounded-[20px] rounded-br-xs px-4 py-2.5 shadow-md">
                  <p class="text-[13.5px]">{msg.text}</p>
                </div>
                <span class="text-[10px] text-zinc-500 font-mono pr-1">{msg.time} ✓✓</span>
              </div>
            {:else}
              <div class="flex flex-col items-start gap-1.5 pr-1">
                <div class="bg-[#141412] border border-[#262418] text-zinc-200 rounded-[20px] rounded-tl-xs px-4 py-2.5 max-w-[95%]">
                  <p class="text-[13.5px] leading-relaxed">{msg.text}</p>
                </div>

                {#if msg.isPrimarySummary}
                  <div class="w-full space-y-4 pt-1">
                    <ZeaTimeline
                      theme="industrial"
                      title="Flujo Operativo End-to-End"
                      headerActionLabel="Ver Sensores"
                      onHeaderAction={() => (activeTab = 'sensors')}
                      entries={timelineEntries}
                    />

                    <ZeaConcentricRings
                      theme="industrial"
                      title="Avance Consolidado del Turno"
                      subtitle="Planta & Flota en Tiempo Real"
                      items={industrialRings}
                    />
                  </div>
                {/if}
              </div>
            {/if}
          {/each}
        {:else}
          <ZeaTimeline
            theme="industrial"
            title="Flujo Operativo End-to-End"
            headerActionLabel="Ver Sensores"
            onHeaderAction={() => (activeTab = 'sensors')}
            entries={timelineEntries}
          />

          <ZeaConcentricRings
            theme="industrial"
            title="Avance Consolidado del Turno"
            subtitle="Planta & Flota en Tiempo Real"
            items={industrialRings}
          />
        {/if}
      </div>

      {#if viewMode === 'chat'}
        <ZeaGliaBar
          theme="industrial"
          placeholder="Consultar etapa de workflow, SLA o despacho..."
          chips={['Estado cola O(1)', 'Avance de flota', 'Plazos de subsanación']}
          bind:inputText={chatInputText}
          onSendPrompt={handleSendPrompt}
        />
      {/if}
    </div>

  <!-- ========================================================= -->
  <!-- TAB 3: SENSORES (CAPTURAS QR/OCR/VISIÓN & TELEMETRÍA IOT) -->
  <!-- ========================================================= -->
  {:else if activeTab === 'sensors'}
    <div class="flex-1 min-h-0 flex flex-col overflow-hidden bg-black">
      <div
        class="flex-1 min-h-0 overflow-y-auto no-scrollbar px-4 pt-3 pb-4 space-y-4 overscroll-contain touch-pan-y"
        bind:this={sensorsScrollEl}
        use:dragScroll
        role="region"
        aria-label="Sección Sensores"
      >
        {#if viewMode === 'chat'}
          {#each sensorsChat as msg (msg.id)}
            {#if msg.sender === 'user'}
              <div class="flex flex-col items-end gap-1 pl-12">
                <div class="bg-[#24211A] border border-[#FFCD00]/20 text-white rounded-[20px] rounded-br-xs px-4 py-2.5 shadow-md">
                  <p class="text-[13.5px]">{msg.text}</p>
                </div>
                <span class="text-[10px] text-zinc-500 font-mono pr-1">{msg.time} ✓✓</span>
              </div>
            {:else}
              <div class="flex flex-col items-start gap-1.5 pr-1">
                <div class="bg-[#141412] border border-[#262418] text-zinc-200 rounded-[20px] rounded-tl-xs px-4 py-2.5 max-w-[95%]">
                  <p class="text-[13.5px] leading-relaxed">{msg.text}</p>
                </div>
              </div>
            {/if}
          {/each}
        {/if}

        <!-- Capturas de Visión, QR/OCR & Sensores IoT -->
        <ZeaRetinaCaptureCard
          theme="industrial"
          captures={sensorCaptures}
          onScanAction={() => showToast('QR y lectura óptica capturados con firma SHA-256')}
          onSelectCapture={(cap) => showToast(`${cap.source}: ${cap.title}`)}
        />

        <!-- Telemetría de Planta (Silos & Estanques) -->
        <div class="p-4 rounded-2xl bg-[#141412] border border-[#262418] space-y-2.5">
          <div class="flex items-center justify-between">
            <div>
              <span class="text-[9.5px] font-mono text-[#FFCD00] uppercase">DOMINIO PLANTA</span>
              <h4 class="font-semibold text-white text-[14px]">Silo de Asfalto #1 (AC-20)</h4>
              <p class="text-[11px] text-zinc-400">Planta Maipú · Quemador GLP 240 t/h</p>
            </div>
            <span class="text-[15px] font-mono font-bold text-[#FFCD00]">170°C</span>
          </div>
          <div class="h-2 rounded-full bg-black/60 overflow-hidden">
            <div class="h-full rounded-full bg-[#FFCD00]" style="width: 72%;"></div>
          </div>
          <div class="flex justify-between text-[11px] text-zinc-400">
            <span>Stock: 145 / 200 t</span>
            <span class="text-emerald-400">Estanques GLP/Petróleo 84%</span>
          </div>
        </div>

        <!-- Telemetría de Flota en Ruta -->
        <div class="space-y-2">
          <div class="flex items-center justify-between px-1">
            <span class="text-[11px] font-mono text-zinc-400 uppercase">Flota Monitoreada</span>
            <span class="text-[9px] font-mono px-1.5 py-0.2 rounded-md bg-[#FFCD00]/20 text-[#FFCD00] border border-[#FFCD00]/40 font-bold">18 ACTIVOS</span>
          </div>
          {#each fleetList as truck}
            <button
              type="button"
              onclick={() => openTruckDetails(truck)}
              class="w-full p-3 rounded-2xl bg-[#141412] border border-[#262418] hover:border-[#FFCD00]/50 text-left transition flex items-center justify-between cursor-pointer"
            >
              <div class="flex items-center gap-3">
                <div class="w-9 h-9 rounded-full bg-[#FFCD00]/15 border border-[#FFCD00]/30 flex items-center justify-center font-bold text-[#FFCD00] text-xs font-mono">
                  {truck.code}
                </div>
                <div>
                  <p class="text-[13px] font-semibold text-white">{truck.code} · {truck.driver}</p>
                  <p class="text-[11px] text-zinc-400">{truck.mixType} · {truck.destination}</p>
                </div>
              </div>
              <div class="text-right">
                <span class="text-[13.5px] font-mono font-bold text-[#FFCD00]">{truck.temp}</span>
                <span class="block text-[10px] text-zinc-500 font-mono">{truck.loadTon}t</span>
              </div>
            </button>
          {/each}
        </div>

        <ZeaMetricTrend
          theme="industrial"
          title="Producción & Capturas (Últimas 8 jornadas)"
          badgeText="+14% vs semana previa"
          metricValue="420 t"
          metricUnit="hoy"
          metricSubtitle="Registro continuo IoT con tolerancia ±2.5°C y OCR activo"
          targetValue={400}
          targetLabel="Meta 400 t"
          bars={productionBars}
          barLabels={productionLabels}
          distribution={asphaltDistribution}
        />
      </div>

      {#if viewMode === 'chat'}
        <ZeaGliaBar
          theme="industrial"
          placeholder="Consultar cámara QR, OCR o sensores IoT..."
          chips={['Escanear QR camión', 'Temperatura Silo 1', 'Ver Mixer #42']}
          bind:inputText={chatInputText}
          onSendPrompt={handleSendPrompt}
        />
      {/if}
    </div>

  <!-- ========================================================= -->
  <!-- TAB 4: PERFIL (JEFE DE PLANTA)                            -->
  <!-- ========================================================= -->
  {:else if activeTab === 'profile'}
    <div class="flex-1 min-h-0 flex flex-col overflow-hidden bg-black">
      <div class="px-5 pt-2.5 pb-2 bg-black/90 backdrop-blur-md sticky top-0 z-20 flex items-center justify-between border-b border-[#242114]">
        <h2 class="font-semibold text-[18px] tracking-tight text-white leading-tight">Perfil</h2>
        <ZeaModeToggle bind:viewMode theme="industrial" />
      </div>

      <div
        class="flex-1 min-h-0 overflow-y-auto no-scrollbar px-4 pt-3 pb-6 space-y-4 overscroll-contain touch-pan-y"
        bind:this={profileScrollEl}
        use:dragScroll
      >
        {#if viewMode === 'chat'}
          {#each profileChat as msg (msg.id)}
            {#if msg.sender === 'user'}
              <div class="flex flex-col items-end gap-1 pl-12">
                <div class="bg-[#24211A] border border-[#FFCD00]/20 text-white rounded-[20px] rounded-br-xs px-4 py-2.5 shadow-md">
                  <p class="text-[13.5px]">{msg.text}</p>
                </div>
                <span class="text-[10px] text-zinc-500 font-mono pr-1">{msg.time} ✓✓</span>
              </div>
            {:else}
              <div class="bg-[#141412] border border-[#262418] text-zinc-200 rounded-[20px] rounded-tl-xs px-4 py-2.5 max-w-[95%]">
                <p class="text-[13.5px] leading-relaxed">{msg.text}</p>
              </div>
            {/if}
          {/each}
        {/if}

        <!-- Industrial Profile Card (Jefe de Planta) -->
        <div class="space-y-3">
          <div class="p-4 rounded-[24px] bg-[#141412] border border-[#262418]">
            <div class="flex items-center gap-3.5">
              <div class="w-12 h-12 rounded-full bg-gradient-to-tr from-[#FFCD00] to-[#FFE066] flex items-center justify-center font-bold text-black text-base font-mono">
                CH
              </div>
              <div>
                <h3 class="font-semibold text-white text-[16px]">Carlos Hinostroza</h3>
                <p class="text-[11.5px] text-zinc-400">Jefe de Operaciones & Planta · Planta Maipú</p>
              </div>
            </div>
            <div class="mt-3.5 pt-3 border-t border-white/5 flex items-center justify-between text-xs">
              <span class="text-zinc-400 font-mono">ID: OPR-786 · Certificado ITO</span>
              <span class="px-2 py-0.5 rounded-full bg-[#FFCD00]/15 text-[#FFCD00] text-[10.5px] font-semibold border border-[#FFCD00]/30">Turno Activo</span>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-2">
            <div class="p-3.5 rounded-2xl bg-[#141412] border border-[#262418]">
              <span class="text-[11px] text-zinc-400 block">Producción Turno</span>
              <span class="text-[16px] font-semibold text-white font-mono">420 t</span>
            </div>
            <div class="p-3.5 rounded-2xl bg-[#141412] border border-[#262418]">
              <span class="text-[11px] text-zinc-400 block">Flota en Ruta</span>
              <span class="text-[16px] font-semibold text-[#FFCD00] font-mono">18 mixers</span>
            </div>
          </div>

          <div class="p-4 rounded-[24px] bg-[#141412] border border-[#262418] space-y-2">
            <h4 class="text-[13.5px] font-semibold text-white">Responsabilidades del Turno</h4>
            <p class="text-[11.5px] text-zinc-400 leading-relaxed">
              Supervisión de Parte Diario, validación de tolerancias térmicas en silos, escaneo de guías de despacho y firma de alertas Human-in-the-Loop.
            </p>
          </div>
        </div>
      </div>

      {#if viewMode === 'chat'}
        <ZeaGliaBar
          theme="industrial"
          placeholder="Consultar métricas de planta o turno..."
          chips={['Resumen del turno', 'Horómetro de planta', 'Firmas pendientes']}
          bind:inputText={chatInputText}
          onSendPrompt={handleSendPrompt}
        />
      {/if}
    </div>
  {/if}

  <!-- ========================================================= -->
  <!-- NATIVE BOTTOM TAB BAR: RESUMEN, SEGUIMIENTO, SENSORES, PERFIL -->
  <!-- ========================================================= -->
  <div id="bottom-tabbar" class="shrink-0 h-14 bg-black/95 backdrop-blur-md border-t border-[#262418] flex items-center justify-around px-1 z-20">
    <!-- TAB 1: RESUMEN -->
    <button
      type="button"
      onclick={() => (activeTab = 'summary')}
      class="flex flex-col items-center gap-1 transition px-2 cursor-pointer {activeTab === 'summary' ? 'text-[#FFCD00] font-semibold' : 'text-zinc-500 hover:text-zinc-300'}"
    >
      <div class="relative">
        <svg class="w-5 h-5 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
        </svg>
        {#if viewMode === 'chat'}
          <span class="absolute -top-1 -right-1 w-1.5 h-1.5 rounded-full bg-[#FFCD00]"></span>
        {/if}
      </div>
      <span class="text-[10px] tracking-tight">Resumen</span>
    </button>

    <!-- TAB 2: SEGUIMIENTO -->
    <button
      type="button"
      onclick={() => (activeTab = 'tracking')}
      class="flex flex-col items-center gap-1 transition px-2 cursor-pointer {activeTab === 'tracking' ? 'text-[#FFCD00] font-semibold' : 'text-zinc-500 hover:text-zinc-300'}"
    >
      <svg class="w-5 h-5 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/>
      </svg>
      <span class="text-[10px] tracking-tight">Seguimiento</span>
    </button>

    <!-- TAB 3: SENSORES -->
    <button
      type="button"
      onclick={() => (activeTab = 'sensors')}
      class="flex flex-col items-center gap-1 transition px-2 cursor-pointer {activeTab === 'sensors' ? 'text-[#FFCD00] font-semibold' : 'text-zinc-500 hover:text-zinc-300'}"
    >
      <svg class="w-5 h-5 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
        <path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
      </svg>
      <span class="text-[10px] tracking-tight">Sensores</span>
    </button>

    <!-- TAB 4: PERFIL (JEFE DE PLANTA) -->
    <button
      type="button"
      onclick={() => (activeTab = 'profile')}
      class="flex flex-col items-center gap-1 transition px-2 cursor-pointer {activeTab === 'profile' ? 'text-[#FFCD00] font-semibold' : 'text-zinc-500 hover:text-zinc-300'}"
    >
      <svg class="w-5 h-5 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
      </svg>
      <span class="text-[10px] tracking-tight">Perfil</span>
    </button>
  </div>

  <!-- Bottom Sheet Modal for Truck IoT Inspection -->
  {#if sheetData}
    <ZeaSheet
      theme="industrial"
      isOpen={sheetOpen}
      avatarText={sheetData.code}
      title="{sheetData.code} · {sheetData.driver}"
      subtitle="{sheetData.type} · {sheetData.plant}"
      progressLabel="Carga en tolva ({sheetData.loadTon} de {sheetData.maxTon} t)"
      progressValueText="{sheetData.temp} en tambor"
      progressPct={Math.round((sheetData.loadTon / sheetData.maxTon) * 100)}
      stats={[
        { label: 'Temperatura', value: sheetData.temp },
        { label: 'Destino', value: sheetData.destination },
        { label: 'Estado', value: sheetData.status },
        { label: 'Arribo Estimado', value: sheetData.eta }
      ]}
      onClose={closeSheet}
    />
  {/if}

  <!-- Toast Notification -->
  {#if toastMessage}
    <div
      class="fixed bottom-20 left-1/2 -translate-x-1/2 px-4 py-2 bg-[#221F10] border border-[#FFCD00]/40 text-[#FFCD00] font-semibold text-xs rounded-full shadow-2xl z-50 flex items-center gap-2 pointer-events-none"
      transition:fade={{ duration: 150 }}
    >
      <span class="w-1.5 h-1.5 rounded-full bg-[#FFCD00] animate-ping"></span>
      <span>{toastMessage}</span>
    </div>
  {/if}
</div>
