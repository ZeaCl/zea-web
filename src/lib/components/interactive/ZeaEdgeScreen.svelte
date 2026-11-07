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

  // Navigation and Mode states
  let activeTab = $state<'ops' | 'fleet' | 'crews' | 'plant'>('ops');
  let viewMode = $state<'chat' | 'app'>('chat');

  // Interactive toast state
  let toastMessage = $state<string | null>(null);
  let toastTimeout: any = null;
  let dischargeDone = $state(false);
  let approvalDone = $state(false);
  let approvalRejected = $state(false);

  // Sheet Modal state
  let sheetOpen = $state(false);
  let sheetData = $state<any>(null);

  // Filters
  let selectedPlantFilter = $state<'all' | 'Planta Maipú' | 'Planta Quilicura'>('all');
  let crewSearchQuery = $state('');

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

  // Industrial Fleet Data (Mixers & Hoppers)
  const fleetList = [
    { id: 'm42', code: 'M-42', type: 'Mixer Asfáltico', driver: 'Rodrigo Baeza', mixType: 'Asfalto AC-20', temp: '165°C', status: 'En ruta', eta: '18 min', loadTon: 28, maxTon: 30, plant: 'Planta Maipú', destination: 'Autopista Central Tramo 4' },
    { id: 't08', code: 'T-08', type: 'Tolva Térmica', driver: 'Manuel Soto', mixType: 'SMA-12 Antiruido', temp: '162°C', status: 'Descarga finalizada', eta: 'En obra', loadTon: 32, maxTon: 32, plant: 'Planta Maipú', destination: 'Autopista Central Tramo 2' },
    { id: 'm19', code: 'M-19', type: 'Mixer Pesado', driver: 'Cristián Vega', mixType: 'Binder Gravas-Asfalto', temp: '158°C', status: 'Carga en planta', eta: 'Salida 13:00', loadTon: 26, maxTon: 28, plant: 'Planta Quilicura', destination: 'Av. Américo Vespucio' },
    { id: 't14', code: 'T-14', type: 'Tolva Térmica', driver: 'Eduardo Pino', mixType: 'Base Asfáltica', temp: '160°C', status: 'En retorno a silo', eta: 'Planta 15:30', loadTon: 0, maxTon: 32, plant: 'Planta Maipú', destination: 'Planta Maipú Silo 1' }
  ];

  // Crews Data
  const crewsList = [
    { id: 'c1', name: 'Cuadrilla Alpha (Pavimentación)', lead: 'Carlos Mendoza', role: 'Jefe de Frente', size: '12 operarios', machinery: 'Finisher Cat AP1055F · Rodillo Doble Tambor', status: 'Activa en tramo 4', progress: '85%' },
    { id: 'c2', name: 'Cuadrilla Beta (Fresado y Bacheo)', lead: 'Héctor Navarro', role: 'Supervisor Técnico', size: '8 operarios', machinery: 'Fresadora Cat PM622 · Miniexcavadora', status: 'Tramo 2 concluido', progress: '100%' },
    { id: 'c3', name: 'Cuadrilla Gamma (Control Calidad)', lead: 'Ing. Valeria Lagos', role: 'Control Termografía & Densidad', size: '4 laboratoristas', machinery: 'Densímetro Nuclear · Termocámara FLIR', status: 'Muestreo en caliente', progress: '92%' }
  ];

  // Chat message management
  interface ChatMessage {
    id: string;
    sender: 'user' | 'agent';
    time: string;
    text: string;
    isPrimarySummary?: boolean;
    quickCard?: 'mixer42' | 'temp-alert' | null;
  }

  let opsChat = $state<ChatMessage[]>([
    {
      id: 'op-1',
      sender: 'user',
      time: '08:42',
      text: '¿Cómo viene el despacho crítico para el frente de Autopista Central?'
    },
    {
      id: 'op-2',
      sender: 'agent',
      time: '08:42',
      text: '¡Hola, Carlos! La mezcla del Mixer #42 salió de Planta Maipú a 165°C dentro de la norma técnica. Arribo estimado en 18 minutos al Tramo 4. Aquí tienes la telemetría en tiempo real:',
      isPrimarySummary: true
    }
  ]);

  let fleetChat = $state<ChatMessage[]>([
    {
      id: 'fl-1',
      sender: 'user',
      time: '08:40',
      text: '¿Cuál es el estado de temperatura de la flota en ruta?'
    },
    {
      id: 'fl-2',
      sender: 'agent',
      time: '08:40',
      text: 'Todos los camiones en tránsito reportan temperatura sobre los 158°C, dentro de la ventana de trabajabilidad. M-42 y T-08 operando sin retrasos:'
    }
  ]);

  let crewsChat = $state<ChatMessage[]>([
    {
      id: 'cr-1',
      sender: 'user',
      time: '08:38',
      text: '¿Cómo va el avance de la cuadrilla de pavimentación Alpha?'
    },
    {
      id: 'cr-2',
      sender: 'agent',
      time: '08:38',
      text: 'Cuadrilla Alpha lleva 420 metros lineales compactados con 98.6% de densidad requerida por el MOP. Finisher operando a ritmo óptimo:'
    }
  ]);

  let plantChat = $state<ChatMessage[]>([
    {
      id: 'pl-1',
      sender: 'user',
      time: '08:35',
      text: '¿Cuánto stock de asfalto AC-20 nos queda en los silos de Maipú?'
    },
    {
      id: 'pl-2',
      sender: 'agent',
      time: '08:35',
      text: 'Silo 1 cuenta con 145 toneladas a 170°C. Silo 2 en recirculación con 80 toneladas. Autonomía garantizada para toda la jornada de hoy:'
    }
  ]);

  let chatInputText = $state('');
  let isAgentTyping = $state(false);

  let opsScrollEl = $state<HTMLDivElement | null>(null);
  let fleetScrollEl = $state<HTMLDivElement | null>(null);
  let crewsScrollEl = $state<HTMLDivElement | null>(null);
  let plantScrollEl = $state<HTMLDivElement | null>(null);

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

    if (activeTab === 'ops') {
      opsChat.push({
        id: `op-${Date.now()}`,
        sender: 'user',
        time: now,
        text
      });
      scrollToBottom(opsScrollEl);

      isAgentTyping = true;
      setTimeout(() => {
        isAgentTyping = false;
        let reply = '';
        let quickCard: 'mixer42' | 'temp-alert' | null = null;

        if (text.toLowerCase().includes('mixer') || text.toLowerCase().includes('42')) {
          reply = 'Mixer #42 en ruta por Autopista Central km 14. Sensores térmicos reportan tambor a 165.2°C. Operador Rodrigo Baeza al volante.';
          quickCard = 'mixer42';
        } else if (text.toLowerCase().includes('aprobar') || text.toLowerCase().includes('ajuste') || text.toLowerCase().includes('humedad')) {
          approvalDone = true;
          reply = '✓ Ajuste térmico del Lote #114 compensado y aprobado en el SCADA de Planta Maipú.';
          showToast('Compensación térmica aprobada');
        } else if (text.toLowerCase().includes('stock') || text.toLowerCase().includes('silo')) {
          reply = 'Silos de asfalto AC-20 al 78% de capacidad total. Consumo previsto: 420t / Capacidad: 600t.';
        } else {
          reply = `Comando industrial recibido: "${text}". Parámetros sincronizados con los sensores IoT de planta y camiones.`;
        }

        opsChat.push({
          id: `op-agent-${Date.now()}`,
          sender: 'agent',
          time: now,
          text: reply,
          quickCard
        });
        scrollToBottom(opsScrollEl);
      }, 550);
    } else if (activeTab === 'fleet') {
      fleetChat.push({
        id: `fl-${Date.now()}`,
        sender: 'user',
        time: now,
        text
      });
      scrollToBottom(fleetScrollEl);
      isAgentTyping = true;
      setTimeout(() => {
        isAgentTyping = false;
        fleetChat.push({
          id: `fl-agent-${Date.now()}`,
          sender: 'agent',
          time: now,
          text: 'Telemetría de camiones actualizada vía enlace satelital 5G. Todos los sensores en verde.'
        });
        scrollToBottom(fleetScrollEl);
      }, 500);
    } else if (activeTab === 'crews') {
      crewsChat.push({
        id: `cr-${Date.now()}`,
        sender: 'user',
        time: now,
        text
      });
      scrollToBottom(crewsScrollEl);
      isAgentTyping = true;
      setTimeout(() => {
        isAgentTyping = false;
        crewsChat.push({
          id: `cr-agent-${Date.now()}`,
          sender: 'agent',
          time: now,
          text: 'Estado de cuadrillas sincronizado. Jornada diurna con cero incidentes de seguridad.'
        });
        scrollToBottom(crewsScrollEl);
      }, 500);
    } else if (activeTab === 'plant') {
      plantChat.push({
        id: `pl-${Date.now()}`,
        sender: 'user',
        time: now,
        text
      });
      scrollToBottom(plantScrollEl);
      isAgentTyping = true;
      setTimeout(() => {
        isAgentTyping = false;
        plantChat.push({
          id: `pl-agent-${Date.now()}`,
          sender: 'agent',
          time: now,
          text: 'Planta Maipú operando a 240 toneladas/hora. Quemadores de gas a régimen nominal.'
        });
        scrollToBottom(plantScrollEl);
      }, 500);
    }
  }

  // Industrial Timeline entries
  const timelineEntries = [
    { id: '1', time: '07:30', title: 'Tolva #08 (Manuel Soto)', subtitle: 'SMA-12 Antiruido · Vertido Concluido a 162°C', status: 'completed' as const },
    { id: '2', time: '08:42', title: 'Mixer #42 (Rodrigo Baeza)', subtitle: 'Asfalto AC-20 · En ruta a 165°C · Frente Autopista', status: 'active' as const, onClick: () => openTruckDetails(fleetList[0]) },
    { id: '3', time: '11:30', title: 'Cupo Tolva Térmica Silo 2', subtitle: 'Planta Maipú · Orden en preparación', status: 'available' as const, actionLabel: 'Despachar', onAction: () => showToast('Orden de Tolva Silo 2 confirmada') },
    { id: '4', time: '13:00', title: 'Mixer #19 (Cristián Vega)', subtitle: 'Binder Gravas-Asfalto · Planta Quilicura', status: 'scheduled' as const }
  ];

  // Industrial Concentric Rings
  const industrialRings = [
    { label: 'Tonelaje Despachado', value: '420 / 500 t', delta: '+35 t vs ayer', pct: 420 / 500, color: '#FFCD00' },
    { label: 'Flota en Ruta', value: '18 / 20 unidades', delta: '90% activa', pct: 18 / 20, color: '#F59E0B' },
    { label: 'Densidad en Norma', value: '98.6%', delta: 'Cumple MOP', pct: 0.986, color: '#38BDF8' }
  ];

  // Industrial Production Bars (Tons over 8 days)
  const productionBars = [310, 340, 390, 420, 380, 450, 410, 420];
  const plantDistribution = [
    { label: 'Planta Maipú', percentage: 64, color: '#FFCD00' },
    { label: 'Planta Quilicura', percentage: 36, color: '#71717A' }
  ];
</script>

<!-- Outer Screen Container (Flex Column with min-h-0 for proper scroll containment) -->
<div class="relative flex-1 min-h-0 bg-black flex flex-col justify-between overflow-hidden select-none text-white font-sans text-left" data-testid="zea-edge-screen">

  <!-- ============================================== -->
  <!-- TAB 1: OPERACIONES (RESUMEN INDUSTRIAL)        -->
  <!-- ============================================== -->
  {#if activeTab === 'ops'}
    {#if viewMode === 'chat'}
      <!-- MODE A: INDUSTRIAL AI CHAT (CATERPILLAR YELLOW) -->
      <div class="flex-1 min-h-0 flex flex-col overflow-hidden bg-black">
        <!-- Top Navigation Bar with Mode Switcher on Right -->
        <div class="px-5 pt-2.5 pb-2 bg-black/90 backdrop-blur-md sticky top-0 z-20 flex items-center justify-between border-b border-[#242114]">
          <div class="flex items-center gap-2.5">
            <div class="relative">
              <div class="w-8 h-8 rounded-full bg-gradient-to-tr from-[#FFCD00] to-[#FFE066] flex items-center justify-center font-black text-[13px] text-black shadow-md">
                Z
              </div>
              <span class="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-black"></span>
            </div>
            <div>
              <h2 class="font-semibold text-[13.5px] tracking-tight text-white leading-tight flex items-center gap-1.5">
                ZEA Edge Agent
                <span class="text-[9px] font-mono px-1.5 py-0.2 rounded-md bg-[#FFCD00]/20 text-[#FFCD00] border border-[#FFCD00]/40 font-bold">INDUSTRIAL</span>
              </h2>
              <span class="text-[11px] text-zinc-400">VialCore · SCADA & IoT Activo</span>
            </div>
          </div>

          <!-- Top-Right Mode Toggle -->
          <ZeaModeToggle bind:viewMode theme="industrial" onToggle={(m) => showToast(m === 'chat' ? 'Modo ZEA Chat AI activado' : 'Modo SCADA clásica activado')} />
        </div>

        <!-- Scrollable Industrial Chat Stream -->
        <div
          class="flex-1 min-h-0 overflow-y-auto no-scrollbar px-4 pt-3 pb-3 space-y-4 overscroll-contain touch-pan-y"
          bind:this={opsScrollEl}
          use:dragScroll
          role="region"
          aria-label="Chat de Operaciones Industriales"
        >
          <div class="flex items-center justify-center">
            <span class="text-[10px] text-zinc-400 bg-[#1A1810] border border-[#2B2610] px-2.5 py-0.5 rounded-full font-mono text-[#FFCD00]/90">
              Hoy · Turno Mañana 08:42
            </span>
          </div>

          {#each opsChat as msg (msg.id)}
            {#if msg.sender === 'user'}
              <div class="flex flex-col items-end gap-1 pl-12" in:fade={{ duration: 120 }}>
                <div class="bg-[#24211A] border border-[#FFCD00]/20 text-white rounded-[20px] rounded-br-xs px-4 py-2.5 shadow-md">
                  <p class="text-[13.5px] leading-relaxed font-sans">{msg.text}</p>
                </div>
                <div class="flex items-center gap-1 text-[10px] text-zinc-500 font-mono pr-1">
                  <span>{msg.time}</span>
                  <span class="text-[#FFCD00]">✓✓</span>
                </div>
              </div>
            {:else}
              <div class="flex flex-col items-start gap-2 pr-2" in:fade={{ duration: 120 }}>
                <div class="flex items-center gap-2">
                  <div class="w-5 h-5 rounded-full bg-[#FFCD00] flex items-center justify-center text-[10px] font-black text-black">Z</div>
                  <span class="text-[12px] font-semibold text-zinc-300">ZEA Edge Agent</span>
                </div>

                <div class="bg-[#141412] border border-[#262418] text-zinc-200 rounded-[20px] rounded-tl-xs px-4 py-2.5 max-w-[95%]">
                  <p class="text-[13.5px] leading-relaxed">{msg.text}</p>
                </div>

                <!-- Primary Summary Industrial Components -->
                {#if msg.isPrimarySummary}
                  <div class="w-full space-y-4 pt-1">
                    <!-- COMPONENT 1: Focus Card (Mixer #42 en ruta) -->
                    <ZeaFocusCard
                      theme="industrial"
                      badgeText="Despacho en ruta"
                      etaText="arribo 18 min"
                      mainMetric="165°C"
                      metricSuffix=" · Lote #114"
                      avatarText="M42"
                      title="Mixer #42 · Planta Maipú"
                      subtitle="Asfalto AC-20 · Frente Autopista Central · 28t"
                      secondaryActionLabel="Telemetría IoT"
                      primaryActionLabel="Confirmar Vertido"
                      primaryDoneLabel="✓ Vertido Registrado"
                      isDone={dischargeDone}
                      onSecondaryAction={() => openTruckDetails(fleetList[0])}
                      onPrimaryAction={() => {
                        dischargeDone = true;
                        showToast('Vertido de Mixer #42 confirmado');
                      }}
                    />

                    <!-- COMPONENT 2: Timeline de Lotes y Despachos -->
                    <ZeaTimeline
                      theme="industrial"
                      title="Despachos de Hoy"
                      headerActionLabel="Ver flota"
                      onHeaderAction={() => activeTab = 'fleet'}
                      entries={timelineEntries}
                    />

                    <!-- COMPONENT 3: Alerta Operativa por Aprobar -->
                    <ZeaApprovalCard
                      theme="industrial"
                      title="Alerta de Producción"
                      avatarText="T-03"
                      entityName="Humedad en Tolva 3 (+1.4%)"
                      entityDetails="Lote #114 · Planta Maipú · Requiere compensación"
                      isApproved={approvalDone}
                      isRejected={approvalRejected}
                      onApprove={() => {
                        approvalDone = true;
                        showToast('Compensación térmica aprobada');
                      }}
                      onReject={() => {
                        approvalRejected = true;
                        showToast('Lote detenido para revisión');
                      }}
                    />

                    <!-- COMPONENT 4: Anillos Concéntricos de Planta -->
                    <ZeaConcentricRings
                      theme="industrial"
                      title="Rendimiento del Turno"
                      subtitle="VialCore Planta Maipú"
                      items={industrialRings}
                    />

                    <!-- COMPONENT 5: Tendencia de Producción -->
                    <ZeaMetricTrend
                      theme="industrial"
                      title="Producción (Últimas 8 jornadas)"
                      badgeText="+14% vs semana previa"
                      bars={productionBars}
                      distribution={plantDistribution}
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
                      class="px-2.5 py-1 rounded-xl bg-[#FFCD00] text-black font-semibold text-xs"
                    >
                      Ver ficha
                    </button>
                  </div>
                {/if}
              </div>
            {/if}
          {/each}

          {#if isAgentTyping}
            <div class="flex items-center gap-2 pt-1" in:fade={{ duration: 100 }}>
              <div class="w-5 h-5 rounded-full bg-[#FFCD00] flex items-center justify-center text-[10px] font-black text-black">Z</div>
              <div class="bg-[#141412] border border-[#262418] rounded-full px-3 py-1.5 flex items-center gap-1.5 shadow-xs">
                <span class="w-1.5 h-1.5 rounded-full bg-[#FFCD00] animate-bounce" style="animation-delay: 0ms"></span>
                <span class="w-1.5 h-1.5 rounded-full bg-[#FFCD00] animate-bounce" style="animation-delay: 150ms"></span>
                <span class="w-1.5 h-1.5 rounded-full bg-[#FFCD00] animate-bounce" style="animation-delay: 300ms"></span>
              </div>
            </div>
          {/if}
        </div>

        <!-- Glia Bar with CAT Yellow Accent -->
        <ZeaGliaBar
          theme="industrial"
          placeholder="Pregunta a ZEA Edge o pide telemetría..."
          chips={['Telemetría Mixer #42', 'Aprobar ajuste Lote #114', 'Stock de asfalto AC-20']}
          bind:inputText={chatInputText}
          onSendPrompt={handleSendPrompt}
        />
      </div>
    {:else}
      <!-- MODE B: SCADA CLASSIC APP (PURE INDUSTRIAL DASHBOARD) -->
      <div class="flex-1 min-h-0 flex flex-col overflow-hidden bg-black">
        <div class="px-5 pt-2.5 pb-2 bg-black/90 backdrop-blur-md sticky top-0 z-20 flex items-center justify-between border-b border-[#242114]">
          <div>
            <h2 class="font-semibold text-[22px] tracking-tight text-white leading-tight">Operaciones</h2>
            <span class="text-[11px] text-[#FFCD00] font-mono">VialCore · Planta Maipú</span>
          </div>

          <ZeaModeToggle bind:viewMode theme="industrial" onToggle={(m) => showToast(m === 'chat' ? 'Modo ZEA Chat AI activado' : 'Modo SCADA clásica activado')} />
        </div>

        <div
          class="flex-1 min-h-0 overflow-y-auto no-scrollbar px-5 pt-3 pb-8 space-y-5 overscroll-contain touch-pan-y"
          use:dragScroll
        >
          <section class="pt-0.5">
            <h3 class="text-[25px] font-semibold tracking-tight text-white leading-tight">Panel de Despacho</h3>
            <p class="text-[13px] text-zinc-400 mt-1">
              Hoy: <span class="text-white font-medium">420 t despachadas</span> y
              <span class="text-[#FFCD00] font-semibold">1 ajuste de tolva pendiente</span>.
            </p>
          </section>

          <!-- Focus Card -->
          <ZeaFocusCard
            theme="industrial"
            badgeText="Despacho en ruta"
            etaText="arribo 18 min"
            mainMetric="165°C"
            metricSuffix=" · Lote #114"
            avatarText="M42"
            title="Mixer #42 · Planta Maipú"
            subtitle="Asfalto AC-20 · Frente Autopista Central · 28t"
            secondaryActionLabel="Telemetría IoT"
            primaryActionLabel="Confirmar Vertido"
            primaryDoneLabel="✓ Vertido Registrado"
            isDone={dischargeDone}
            onSecondaryAction={() => openTruckDetails(fleetList[0])}
            onPrimaryAction={() => {
              dischargeDone = true;
              showToast('Vertido de Mixer #42 confirmado');
            }}
          />

          <!-- Timeline -->
          <ZeaTimeline
            theme="industrial"
            title="Cronograma de Lotes"
            headerActionLabel="Ver flota"
            onHeaderAction={() => activeTab = 'fleet'}
            entries={timelineEntries}
          />

          <!-- Approval Card -->
          <ZeaApprovalCard
            theme="industrial"
            title="Alerta de Calidad"
            avatarText="T-03"
            entityName="Compensación de Humedad Tolva 3"
            entityDetails="Variación +1.4% · Lote #114 Planta Maipú"
            isApproved={approvalDone}
            isRejected={approvalRejected}
            onApprove={() => {
              approvalDone = true;
              showToast('Compensación térmica aprobada');
            }}
            onReject={() => {
              approvalRejected = true;
              showToast('Lote detenido para revisión');
            }}
          />

          <!-- Concentric Rings -->
          <ZeaConcentricRings
            theme="industrial"
            title="Métricas Operativas del Turno"
            subtitle="VialCore Infraestructura"
            items={industrialRings}
          />

          <!-- Production Trend -->
          <ZeaMetricTrend
            theme="industrial"
            title="Producción (Últimas 8 jornadas)"
            badgeText="+14% vs semana previa"
            bars={productionBars}
            distribution={plantDistribution}
          />
        </div>
      </div>
    {/if}

  <!-- ============================================== -->
  <!-- TAB 2: FLOTA IOT                               -->
  <!-- ============================================== -->
  {:else if activeTab === 'fleet'}
    <div class="flex-1 min-h-0 flex flex-col overflow-hidden bg-black">
      <div class="px-5 pt-2.5 pb-2 bg-black/90 backdrop-blur-md sticky top-0 z-20 flex items-center justify-between border-b border-[#242114]">
        <div class="flex items-center gap-2">
          <h2 class="font-semibold text-[20px] tracking-tight text-white leading-tight">Flota IoT</h2>
          <span class="text-[9px] font-mono px-1.5 py-0.2 rounded-md bg-[#FFCD00]/20 text-[#FFCD00] border border-[#FFCD00]/40 font-bold">18 ACTIVOS</span>
        </div>

        <ZeaModeToggle bind:viewMode theme="industrial" />
      </div>

      <div
        class="flex-1 min-h-0 overflow-y-auto no-scrollbar px-4 pt-3 pb-6 space-y-4 overscroll-contain touch-pan-y"
        bind:this={fleetScrollEl}
        use:dragScroll
      >
        {#if viewMode === 'chat'}
          {#each fleetChat as msg (msg.id)}
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

        <!-- Plant Filter Pills -->
        <div class="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onclick={() => selectedPlantFilter = 'all'}
            class="px-3 py-1 rounded-full text-[11px] font-medium {selectedPlantFilter === 'all' ? 'bg-[#FFCD00] text-black font-semibold' : 'bg-[#1C1C20] text-zinc-400 hover:text-white'} transition shrink-0 cursor-pointer"
          >
            Todas las Plantas
          </button>
          <button
            type="button"
            onclick={() => selectedPlantFilter = 'Planta Maipú'}
            class="px-3 py-1 rounded-full text-[11px] font-medium {selectedPlantFilter === 'Planta Maipú' ? 'bg-[#FFCD00] text-black font-semibold' : 'bg-[#1C1C20] text-zinc-400 hover:text-white'} transition shrink-0 cursor-pointer"
          >
            Planta Maipú
          </button>
          <button
            type="button"
            onclick={() => selectedPlantFilter = 'Planta Quilicura'}
            class="px-3 py-1 rounded-full text-[11px] font-medium {selectedPlantFilter === 'Planta Quilicura' ? 'bg-[#FFCD00] text-black font-semibold' : 'bg-[#1C1C20] text-zinc-400 hover:text-white'} transition shrink-0 cursor-pointer"
          >
            Planta Quilicura
          </button>
        </div>

        <!-- Truck Cards List -->
        <div class="space-y-2.5">
          {#each fleetList.filter(t => selectedPlantFilter === 'all' || t.plant === selectedPlantFilter) as truck}
            <button
              type="button"
              onclick={() => openTruckDetails(truck)}
              class="w-full p-3.5 rounded-2xl bg-[#141412] border border-[#262418] hover:border-[#FFCD00]/50 text-left transition flex items-center justify-between cursor-pointer group"
            >
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-full bg-[#FFCD00]/15 border border-[#FFCD00]/30 flex items-center justify-center font-bold text-[#FFCD00] text-xs font-mono">
                  {truck.code}
                </div>
                <div>
                  <div class="flex items-center gap-2">
                    <p class="text-[14px] font-semibold text-white group-hover:text-[#FFCD00] transition">{truck.code} · {truck.driver}</p>
                    <span class="text-[9.5px] px-1.5 py-0.2 rounded-full font-mono bg-white/10 text-zinc-300">{truck.status}</span>
                  </div>
                  <p class="text-[11.5px] text-zinc-400 mt-0.5">{truck.mixType} · {truck.destination}</p>
                </div>
              </div>

              <div class="text-right">
                <span class="text-[14px] font-mono font-bold text-[#FFCD00]">{truck.temp}</span>
                <span class="block text-[10.5px] text-zinc-500 font-mono">{truck.loadTon}t cargadas</span>
              </div>
            </button>
          {/each}
        </div>
      </div>

      {#if viewMode === 'chat'}
        <ZeaGliaBar
          theme="industrial"
          placeholder="Consultar ubicación o temperatura de camión..."
          chips={['Ver Mixer #42', 'Camiones en planta', 'Tolerancias térmicas']}
          bind:inputText={chatInputText}
          onSendPrompt={handleSendPrompt}
        />
      {/if}
    </div>

  <!-- ============================================== -->
  <!-- TAB 3: CUADRILLAS                              -->
  <!-- ============================================== -->
  {:else if activeTab === 'crews'}
    <div class="flex-1 min-h-0 flex flex-col overflow-hidden bg-black">
      <div class="px-5 pt-2.5 pb-2 bg-black/90 backdrop-blur-md sticky top-0 z-20 flex items-center justify-between border-b border-[#242114]">
        <div class="flex items-baseline gap-2">
          <h2 class="font-semibold text-[20px] tracking-tight text-white leading-tight">Cuadrillas</h2>
          <span class="text-[11px] text-zinc-400">Frentes de Pavimentación</span>
        </div>

        <ZeaModeToggle bind:viewMode theme="industrial" />
      </div>

      <div
        class="flex-1 min-h-0 overflow-y-auto no-scrollbar px-4 pt-3 pb-6 space-y-4 overscroll-contain touch-pan-y"
        bind:this={crewsScrollEl}
        use:dragScroll
      >
        {#if viewMode === 'chat'}
          {#each crewsChat as msg (msg.id)}
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

        <!-- Search Bar -->
        <div class="relative">
          <input
            type="text"
            bind:value={crewSearchQuery}
            placeholder="Buscar cuadrilla, operador o maquinaria..."
            class="w-full pl-8 pr-3 py-1.5 rounded-xl bg-[#141412] border border-[#262418] text-[12px] text-white placeholder-zinc-500 focus:outline-none"
          />
          <span class="absolute left-2.5 top-2 text-zinc-500 text-xs">🔍</span>
        </div>

        <!-- Crews List -->
        <div class="space-y-3">
          {#each crewsList as crew}
            <div class="p-4 rounded-2xl bg-[#141412] border border-[#262418] space-y-2">
              <div class="flex items-center justify-between">
                <div>
                  <h4 class="font-semibold text-white text-[14px]">{crew.name}</h4>
                  <p class="text-[11.5px] text-zinc-400">{crew.lead} · {crew.role}</p>
                </div>
                <span class="text-[12px] font-mono font-bold text-[#FFCD00]">{crew.progress}</span>
              </div>

              <div class="p-2.5 rounded-xl bg-black/40 border border-white/5 text-[11px] text-zinc-300">
                <span class="text-zinc-500 block">Maquinaria asignada:</span>
                <span class="font-mono">{crew.machinery}</span>
              </div>

              <div class="flex items-center justify-between text-[11px] text-zinc-400 pt-1">
                <span>{crew.size}</span>
                <span class="text-emerald-400 font-medium">{crew.status}</span>
              </div>
            </div>
          {/each}
        </div>
      </div>

      {#if viewMode === 'chat'}
        <ZeaGliaBar
          theme="industrial"
          placeholder="Consultar cuadrilla o frente de trabajo..."
          chips={['Cuadrilla Alpha', 'Densidad en tramo 4', 'Maquinaria en obra']}
          bind:inputText={chatInputText}
          onSendPrompt={handleSendPrompt}
        />
      {/if}
    </div>

  <!-- ============================================== -->
  <!-- TAB 4: PLANTA                                  -->
  <!-- ============================================== -->
  {:else if activeTab === 'plant'}
    <div class="flex-1 min-h-0 flex flex-col overflow-hidden bg-black">
      <div class="px-5 pt-2.5 pb-2 bg-black/90 backdrop-blur-md sticky top-0 z-20 flex items-center justify-between border-b border-[#242114]">
        <h2 class="font-semibold text-[20px] tracking-tight text-white leading-tight">Planta & Silos</h2>

        <div class="flex items-center gap-2">
          <button
            type="button"
            onclick={() => showToast('Reporte SCADA exportado en PDF')}
            class="px-2.5 py-1 rounded-full text-[11px] font-medium bg-[#1C1C20] hover:bg-[#25252D] text-zinc-200 transition"
          >
            Exportar SCADA
          </button>
          <ZeaModeToggle bind:viewMode theme="industrial" />
        </div>
      </div>

      <div
        class="flex-1 min-h-0 overflow-y-auto no-scrollbar px-4 pt-3 pb-6 space-y-4 overscroll-contain touch-pan-y"
        bind:this={plantScrollEl}
        use:dragScroll
      >
        {#if viewMode === 'chat'}
          {#each plantChat as msg (msg.id)}
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

        <!-- Silos & Drum SCADA Cards -->
        <div class="space-y-3">
          <!-- Silo 1 -->
          <div class="p-4 rounded-2xl bg-[#141412] border border-[#262418] space-y-2.5">
            <div class="flex items-center justify-between">
              <div>
                <h4 class="font-semibold text-white text-[14px]">Silo de Asfalto #1 (AC-20)</h4>
                <p class="text-[11.5px] text-zinc-400">Planta Maipú · Calefacción Térmica Activa</p>
              </div>
              <span class="text-[15px] font-mono font-bold text-[#FFCD00]">170°C</span>
            </div>
            <div class="h-2 rounded-full bg-black/60 overflow-hidden">
              <div class="h-full rounded-full bg-[#FFCD00]" style="width: 72%;"></div>
            </div>
            <div class="flex justify-between text-[11px] text-zinc-400">
              <span>Stock: 145 / 200 t</span>
              <span class="text-emerald-400">Presión normal (2.4 bar)</span>
            </div>
          </div>

          <!-- Silo 2 -->
          <div class="p-4 rounded-2xl bg-[#141412] border border-[#262418] space-y-2.5">
            <div class="flex items-center justify-between">
              <div>
                <h4 class="font-semibold text-white text-[14px]">Silo de Asfalto #2 (SMA-12)</h4>
                <p class="text-[11.5px] text-zinc-400">Planta Maipú · Mezcla en Caliente</p>
              </div>
              <span class="text-[15px] font-mono font-bold text-[#FFCD00]">165°C</span>
            </div>
            <div class="h-2 rounded-full bg-black/60 overflow-hidden">
              <div class="h-full rounded-full bg-[#F59E0B]" style="width: 53%;"></div>
            </div>
            <div class="flex justify-between text-[11px] text-zinc-400">
              <span>Stock: 80 / 150 t</span>
              <span class="text-emerald-400">Recirculación activa</span>
            </div>
          </div>

          <!-- Tambor Mezclador -->
          <div class="grid grid-cols-2 gap-2">
            <div class="p-3.5 rounded-2xl bg-[#141412] border border-[#262418]">
              <span class="text-[11px] text-zinc-400 block">Régimen Quemador</span>
              <span class="text-[16px] font-semibold text-white font-mono">240 t/h</span>
            </div>
            <div class="p-3.5 rounded-2xl bg-[#141412] border border-[#262418]">
              <span class="text-[11px] text-zinc-400 block">Áridos en Tolva</span>
              <span class="text-[16px] font-semibold text-[#FFCD00] font-mono">480 t</span>
            </div>
          </div>
        </div>
      </div>

      {#if viewMode === 'chat'}
        <ZeaGliaBar
          theme="industrial"
          placeholder="Consultar telemetría de silos y planta..."
          chips={['Temperatura Silo 1', 'Régimen de quemador', 'Stock de áridos']}
          bind:inputText={chatInputText}
          onSendPrompt={handleSendPrompt}
        />
      {/if}
    </div>
  {/if}

  <!-- ============================================== -->
  <!-- NATIVE BOTTOM TAB BAR (INDUSTRIAL CATERPILLAR) -->
  <!-- ============================================== -->
  <div id="bottom-tabbar" class="shrink-0 h-14 bg-black/95 backdrop-blur-md border-t border-[#262418] flex items-center justify-around px-2 z-20">
    <!-- TAB 1: OPERACIONES -->
    <button
      type="button"
      onclick={() => activeTab = 'ops'}
      class="flex flex-col items-center gap-1 transition px-3 cursor-pointer {activeTab === 'ops' ? 'text-[#FFCD00] font-semibold' : 'text-zinc-500 hover:text-zinc-300'}"
    >
      <div class="relative">
        <svg class="w-5 h-5 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
        </svg>
        {#if viewMode === 'chat'}
          <span class="absolute -top-1 -right-1 w-1.5 h-1.5 rounded-full bg-[#FFCD00]"></span>
        {/if}
      </div>
      <span class="text-[10px] tracking-tight">Operaciones</span>
    </button>

    <!-- TAB 2: FLOTA IOT -->
    <button
      type="button"
      onclick={() => activeTab = 'fleet'}
      class="flex flex-col items-center gap-1 transition px-3 cursor-pointer {activeTab === 'fleet' ? 'text-[#FFCD00] font-semibold' : 'text-zinc-500 hover:text-zinc-300'}"
    >
      <svg class="w-5 h-5 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
        <rect x="1" y="3" width="15" height="13"></rect>
        <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
        <circle cx="5.5" cy="18.5" r="2.5"></circle>
        <circle cx="18.5" cy="18.5" r="2.5"></circle>
      </svg>
      <span class="text-[10px] tracking-tight">Flota IoT</span>
    </button>

    <!-- TAB 3: CUADRILLAS -->
    <button
      type="button"
      onclick={() => activeTab = 'crews'}
      class="flex flex-col items-center gap-1 transition px-3 cursor-pointer {activeTab === 'crews' ? 'text-[#FFCD00] font-semibold' : 'text-zinc-500 hover:text-zinc-300'}"
    >
      <svg class="w-5 h-5 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
      </svg>
      <span class="text-[10px] tracking-tight">Cuadrillas</span>
    </button>

    <!-- TAB 4: PLANTA -->
    <button
      type="button"
      onclick={() => activeTab = 'plant'}
      class="flex flex-col items-center gap-1 transition px-3 cursor-pointer {activeTab === 'plant' ? 'text-[#FFCD00] font-semibold' : 'text-zinc-500 hover:text-zinc-300'}"
    >
      <svg class="w-5 h-5 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
      </svg>
      <span class="text-[10px] tracking-tight">Planta</span>
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
