<script lang="ts">
  import { fade } from 'svelte/transition';
  import { tick } from 'svelte';
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

  // Bottom Navigation Tabs: Resumen, Seguimiento, Sensores, Perfil
  let activeTab = $state<'summary' | 'tracking' | 'sensors' | 'profile'>('summary');
  // Default mode is Chat
  let viewMode = $state<'chat' | 'app'>('chat');

  let toastMessage = $state<string | null>(null);
  let toastTimeout: any = null;
  let batchDispatched = $state(false);

  let sheetOpen = $state(false);
  let sheetData = $state<any>(null);

  function showToast(msg: string) {
    if (toastTimeout) clearTimeout(toastTimeout);
    toastMessage = msg;
    toastTimeout = setTimeout(() => (toastMessage = null), 2400);
  }

  function openUnitSheet(unit: any) {
    sheetData = unit;
    sheetOpen = true;
  }

  function applyAndDispatch() {
    batchDispatched = true;
    showToast(
      es
        ? 'Compensación (-18 L) aplicada · Lote #114 en carga'
        : 'Compensation (-18 L) applied · Batch #114 loading'
    );
  }

  // =========================================================================
  // 1. REVIT BIM / MEP DATA MODELS (Fictional & Neutral)
  // =========================================================================
  interface PropertyRow {
    id: string;
    group: 'equipment' | 'dispatch';
    parameter: string;
    value: string;
    unit: string;
    verified: boolean;
  }

  let dailyProperties = $state<PropertyRow[]>([
    {
      id: 'pd-1',
      group: 'equipment',
      parameter: 'Horómetro secador y mezclador',
      value: '4,812.5',
      unit: 'h',
      verified: true
    },
    {
      id: 'pd-2',
      group: 'equipment',
      parameter: 'Estanque GLP / combustible',
      value: '145.0 / 200',
      unit: 't (84%)',
      verified: true
    },
    {
      id: 'pd-3',
      group: 'dispatch',
      parameter: 'Compensación humedad Lote #114',
      value: '-18.0',
      unit: 'L H2O',
      verified: false
    },
    {
      id: 'pd-4',
      group: 'dispatch',
      parameter: 'Guía electrónica unidad MX-42',
      value: 'GE-88412',
      unit: '28.0 t',
      verified: false
    },
    {
      id: 'pd-5',
      group: 'dispatch',
      parameter: 'Cierre de suministro diario',
      value: '420.0',
      unit: 't norma',
      verified: false
    }
  ]);

  function togglePropertyRow(id: string) {
    dailyProperties = dailyProperties.map((r) =>
      r.id === id ? { ...r, verified: !r.verified } : r
    );
    const target = dailyProperties.find((r) => r.id === id);
    if (target) {
      showToast(
        target.verified
          ? `${target.parameter}: ${es ? 'validado' : 'verified'}`
          : `${target.parameter}: ${es ? 'pendiente' : 'pending'}`
      );
    }
  }

  // S-Curve hairline density bars (Cumulative monthly tonnage toward 12,000 t)
  const sCurveLines = Array.from({ length: 60 }, (_, i) => {
    const t = i / 59;
    const v = 8 + 87 / (1 + Math.exp(-7.5 * (t - 0.48))) + Math.sin(i * 1.4) * 1.5;
    return Math.max(6, Math.min(100, v));
  });

  // Programmed baseline path for S-Curve
  const plannedPath = Array.from({ length: 24 }, (_, i) => {
    const t = i / 23;
    const y = 100 - (10 + 82 / (1 + Math.exp(-6.5 * (t - 0.5))));
    return `${i === 0 ? 'M' : 'L'}${(t * 100).toFixed(2)},${y.toFixed(2)}`;
  }).join(' ');

  // Weekly production grouped bars (Dispatched vs Scheduled)
  const weeklyProduction = $derived([
    { day: es ? 'Lun' : 'Mon', actual: 78, planned: 80, attention: false },
    { day: es ? 'Mar' : 'Tue', actual: 84, planned: 80, attention: false },
    { day: es ? 'Mié' : 'Wed', actual: 72, planned: 80, attention: false },
    { day: es ? 'Jue' : 'Thu', actual: 88, planned: 82, attention: false },
    { day: es ? 'Vie' : 'Fri', actual: 64, planned: 80, attention: true },
    { day: es ? 'Hoy' : 'Today', actual: 84, planned: 80, attention: false }
  ]);

  // Project Browser Tree: Silos & Fleet Units
  const plantSilos = $derived([
    {
      code: 'SL-01',
      name: es ? 'Silo ligante AC-20' : 'Binder silo AC-20',
      level: '145.0 / 200 t',
      temp: '170.2 °C',
      pct: 73,
      ok: true
    },
    {
      code: 'SL-02',
      name: es ? 'Silo filler mineral' : 'Mineral filler silo',
      level: '82.0 / 100 t',
      temp: '42.0 °C',
      pct: 82,
      ok: true
    },
    {
      code: 'AG-03',
      name: es ? 'Tolva árido 3/4"' : 'Aggregate hopper 3/4"',
      level: '64.0 / 120 t',
      temp: 'Humedad 4.8%',
      pct: 53,
      ok: false
    }
  ]);

  const fleetUnits = $derived([
    {
      code: 'MX-42',
      operator: 'R. Valdivia',
      mix: 'AC-20 · Lote #114',
      route: es ? 'Tramo Sur Km 14' : 'South Sector Km 14',
      loadTon: 28.0,
      maxTon: 30,
      temp: '165.4 °C',
      status: es ? 'En carga' : 'Loading',
      eta: '14 min',
      ok: true
    },
    {
      code: 'MX-19',
      operator: 'M. Contreras',
      mix: 'H-30 Estructural',
      route: es ? 'Viaducto Central' : 'Central Viaduct',
      loadTon: 27.5,
      maxTon: 30,
      temp: '162.8 °C',
      status: es ? 'En tránsito' : 'In transit',
      eta: '22 min',
      ok: true
    },
    {
      code: 'TL-08',
      operator: 'P. Arriagada',
      mix: 'Base Granular CBR',
      route: es ? 'Acceso Norte' : 'North Access',
      loadTon: 29.0,
      maxTon: 30,
      temp: '158.1 °C',
      status: es ? 'Desviación térmica' : 'Thermal drift',
      eta: '08 min',
      ok: false
    },
    {
      code: 'MX-07',
      operator: 'C. Morales',
      mix: 'AC-20 · Lote #113',
      route: es ? 'Retorno a planta' : 'Returning to plant',
      loadTon: 0.0,
      maxTon: 30,
      temp: '94.0 °C',
      status: es ? 'Descargado' : 'Unloaded',
      eta: '05 min',
      ok: true
    }
  ]);

  const sensorNodes = $derived([
    {
      id: 'TH-101',
      system: 'MEP · Thermal',
      location: es ? 'Tambor secador rotatorio' : 'Rotary dryer drum',
      reading: '170.2 °C',
      tolerance: '160–175 °C',
      color: '#D97706',
      ok: true
    },
    {
      id: 'HY-204',
      system: 'MEP · Moisture',
      location: es ? 'Banda pesadora de áridos' : 'Aggregate weigh belt',
      reading: '4.8 %',
      tolerance: '< 3.5 %',
      color: '#0284C7',
      ok: false
    },
    {
      id: 'FL-309',
      system: 'MEP · Flow',
      location: es ? 'Bomba dosificadora ligante' : 'Binder dosing pump',
      reading: '5.4 %',
      tolerance: '5.3–5.5 %',
      color: '#7C3AED',
      ok: true
    },
    {
      id: 'LD-412',
      system: 'STR · Load Cell',
      location: es ? 'Puente báscula despacho' : 'Dispatch weighbridge',
      reading: '28.02 t',
      tolerance: '± 0.05 t',
      color: '#475569',
      ok: true
    }
  ]);

  // =========================================================================
  // 2. CONVERSATION STREAM
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
      {
        id: 'e-0',
        sender: 'user',
        time: '08:15',
        text: es ? '¿Qué tenemos para hoy?' : 'What do we have for today?'
      },
      {
        id: 'e-1',
        sender: 'agent',
        time: '08:15',
        text: es
          ? 'Buenos días. El sensor HY-204 detectó 4.8% de humedad en el árido del Lote #114 antes de cargar la unidad MX-42. A continuación tienes el esquema MEP para ahora, el parte diario de hoy, la semana, el mes y la curva S proyectada.'
          : 'Good morning. Sensor HY-204 detected 4.8% moisture in Batch #114 aggregate prior to loading unit MX-42. Below is the MEP schematic for now, today’s plant log, this week, this month and the projected S-curve.',
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
    chatMessages.push({ id: `u-${uid}`, sender: 'user', time: '08:19', text });
    scrollToBottom();

    isAgentTyping = true;
    setTimeout(() => {
      isAgentTyping = false;
      const lower = text.toLowerCase();
      let reply = '';
      let briefing = false;
      if (lower.includes('hoy') || lower.includes('today')) {
        reply = es
          ? 'Reporte actualizado de planta en los 5 horizontes operativos.'
          : 'Updated plant report across all 5 operational horizons.';
        briefing = true;
      } else if (lower.includes('silo') || lower.includes('temp') || lower.includes('sensor')) {
        reply = es
          ? 'Silo SL-01 opera a 170.2 °C con 145.0 t disponibles. El sensor HY-204 requiere compensación de -18 L de agua en el mezclador.'
          : 'Silo SL-01 is running at 170.2 °C with 145.0 t available. Sensor HY-204 requires -18 L water compensation in the mixer.';
      } else if (lower.includes('flota') || lower.includes('mixer') || lower.includes('mx')) {
        reply = es
          ? '18 unidades activas en ruta. La unidad MX-42 está en báscula con 28.0 t a 165.4 °C lista para despacho.'
          : '18 active units on route. Unit MX-42 is on the weighbridge with 28.0 t at 165.4 °C ready for dispatch.';
      } else {
        reply = es
          ? 'Parámetros de planta verificados. Producción acumulada del turno: 420.0 t dentro de norma.'
          : 'Plant parameters verified. Cumulative shift production: 420.0 t within spec.';
      }
      chatMessages.push({ id: `a-${uid}`, sender: 'agent', time: '08:20', text: reply, briefing });
      scrollToBottom();
    }, 650);
  }
</script>

<!-- ===================================================================== -->
<!-- REVIT CAD / BIM SNIPPETS                                              -->
<!-- ===================================================================== -->

{#snippet chevron()}
  <svg class="w-2.5 h-2.5 text-[#7A7F87]" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5">
    <path d="M3 4.5l3 3 3-3" stroke-linecap="round" stroke-linejoin="round" />
  </svg>
{/snippet}

{#snippet select(label: string)}
  <span class="rv-sans inline-flex items-center gap-1 text-[10px] text-[#2D3139] bg-white border border-[#D4D8DF] px-1.5 py-[2px] rounded-[4px]">
    {label}{@render chevron()}
  </span>
{/snippet}

{#snippet panelBar(viewTitle: string, scaleOrMeta: string)}
  <div class="px-3 py-1.5 bg-[#F3F4F6] border-b border-[#DCE0E6] flex items-center justify-between">
    <div class="flex items-center gap-1.5 min-w-0">
      <span class="w-1.5 h-1.5 rounded-[1px] bg-[#0696D7] shrink-0"></span>
      <span class="rv-sans text-[10px] font-medium text-[#2D3139] truncate">{viewTitle}</span>
    </div>
    <span class="rv-mono text-[9.5px] text-[#7A7F87] shrink-0">{scaleOrMeta}</span>
  </div>
{/snippet}

{#snippet mepViewport()}
  <!-- Revit 3D Axonometric Cutaway Viewport in Shaded Greys (Hidden Line / Shaded mode) -->
  <div
    class="relative h-[138px] border-b border-[#DCE0E6] overflow-hidden"
    style="background: linear-gradient(180deg, #D5D9DF 0%, #E6E9ED 52%, #F4F5F7 100%);"
  >
    <svg class="w-full h-full" viewBox="0 0 320 138" fill="none">
      <!-- Isometric Structural Grid Lines (Base Datum Plane) -->
      <g stroke="#9CA3AF" stroke-width="0.55" stroke-dasharray="2.5 2">
        <!-- Axis family 1 (down-right) -->
        <line x1="48" y1="74" x2="188" y2="134" />
        <line x1="84" y1="58" x2="224" y2="118" />
        <line x1="120" y1="42" x2="260" y2="102" />
        <!-- Axis family 2 (up-right) -->
        <line x1="52" y1="124" x2="196" y2="58" />
        <line x1="92" y1="134" x2="236" y2="68" />
        <line x1="136" y1="136" x2="274" y2="74" />
      </g>

      <!-- Grid Bubbles -->
      <g font-family="Geist Mono, monospace" font-size="5.5" fill="#4B5563">
        <circle cx="44" cy="72" r="4.5" fill="#F3F4F6" stroke="#9CA3AF" stroke-width="0.6" />
        <text x="44" y="74" text-anchor="middle">A</text>
        <circle cx="80" cy="56" r="4.5" fill="#F3F4F6" stroke="#9CA3AF" stroke-width="0.6" />
        <text x="80" y="58" text-anchor="middle">B</text>
        <circle cx="116" cy="40" r="4.5" fill="#F3F4F6" stroke="#9CA3AF" stroke-width="0.6" />
        <text x="116" y="42" text-anchor="middle">C</text>
      </g>

      <!-- =============================================================== -->
      <!-- ISOMETRIC 3D BUILDING / PLANT STRUCTURE (SHADED GREYS)          -->
      <!-- =============================================================== -->

      <!-- Ground Cast Shadow -->
      <polygon points="78,96 164,132 256,90 170,54" fill="#B8BEC7" fill-opacity="0.45" />

      <!-- LOWER PODIUM SLAB (Level 00) -->
      <!-- Top surface -->
      <polygon points="78,88 164,124 248,84 162,48" fill="#F3F4F6" stroke="#1F2937" stroke-width="0.85" stroke-linejoin="round" />
      <!-- Left slab thickness -->
      <polygon points="78,88 164,124 164,129 78,93" fill="#CBD5E1" stroke="#1F2937" stroke-width="0.85" stroke-linejoin="round" />
      <!-- Right slab thickness -->
      <polygon points="164,124 248,84 248,89 164,129" fill="#64748B" stroke="#1F2937" stroke-width="0.85" stroke-linejoin="round" />

      <!-- CUTAWAY BASEMENT / LOWER ROOM WALLS (Left wing, section-cut poche) -->
      <!-- Interior dark cavity floor -->
      <polygon points="86,86 138,108 176,90 124,68" fill="#475569" stroke="#1F2937" stroke-width="0.7" />
      <!-- Back-left shear wall (inner shaded face) -->
      <polygon points="86,62 124,44 124,68 86,86" fill="#94A3B8" stroke="#1F2937" stroke-width="0.85" stroke-linejoin="round" />
      <!-- Front-left exterior wall -->
      <polygon points="86,62 138,84 138,108 86,86" fill="#E2E8F0" stroke="#1F2937" stroke-width="0.9" stroke-linejoin="round" />
      <!-- Interior partition wall 1 -->
      <polygon points="112,73 150,55 150,79 112,97" fill="#64748B" stroke="#1F2937" stroke-width="0.8" stroke-linejoin="round" />
      <!-- Isometric stepped stairs in front bay -->
      <g fill="#CBD5E1" stroke="#1F2937" stroke-width="0.65">
        <polygon points="94,84 106,89 112,86 100,81" />
        <polygon points="97,80 109,85 115,82 103,77" />
        <polygon points="100,76 112,81 118,78 106,73" />
        <polygon points="103,72 115,77 121,74 109,69" />
      </g>
      <!-- Black section-cut poche on top of cut walls (Revit signature detail) -->
      <polygon points="86,62 138,84 141,82.5 91,61.5 124,46 122,44" fill="#111827" />
      <polygon points="112,73 150,55 152,56 114,74" fill="#111827" />

      <!-- CANTILEVERED MID SLABS (Right wing, multi-story structural bays) -->
      <!-- Columns between Level 00 and Level 01 -->
      <line x1="196" y1="81" x2="196" y2="103" stroke="#334155" stroke-width="2" />
      <line x1="222" y1="69" x2="222" y2="91" stroke="#334155" stroke-width="2" />
      <line x1="166" y1="95" x2="166" y2="117" stroke="#334155" stroke-width="2" />

      <!-- Level 01 Floor Slab -->
      <polygon points="134,68 186,90 242,63 190,41" fill="#F8FAFC" stroke="#1F2937" stroke-width="0.85" stroke-linejoin="round" />
      <polygon points="134,68 186,90 186,94 134,72" fill="#CBD5E1" stroke="#1F2937" stroke-width="0.85" stroke-linejoin="round" />
      <polygon points="186,90 242,63 242,67 186,94" fill="#64748B" stroke="#1F2937" stroke-width="0.85" stroke-linejoin="round" />

      <!-- Columns between Level 01 and Level 02 -->
      <line x1="196" y1="59" x2="196" y2="81" stroke="#334155" stroke-width="2" />
      <line x1="222" y1="47" x2="222" y2="69" stroke="#334155" stroke-width="2" />

      <!-- Level 02 Cantilevered Slab -->
      <polygon points="142,46 192,67 242,43 192,22" fill="#FFFFFF" stroke="#1F2937" stroke-width="0.85" stroke-linejoin="round" />
      <polygon points="142,46 192,67 192,71 142,50" fill="#CBD5E1" stroke="#1F2937" stroke-width="0.85" stroke-linejoin="round" />
      <polygon points="192,67 242,43 242,47 192,71" fill="#64748B" stroke="#1F2937" stroke-width="0.85" stroke-linejoin="round" />

      <!-- CENTRAL STRUCTURAL CORE / SILO TOWER (Rising through the slabs) -->
      <!-- Left sunlit core wall -->
      <polygon points="136,24 168,38 168,84 136,70" fill="#E5E7EB" stroke="#1F2937" stroke-width="0.9" stroke-linejoin="round" />
      <!-- Right shaded core wall -->
      <polygon points="168,38 196,25 196,71 168,84" fill="#9CA3AF" stroke="#1F2937" stroke-width="0.9" stroke-linejoin="round" />
      <!-- Core inner shaft cavity (cutaway top) -->
      <polygon points="136,24 168,38 196,25 164,11" fill="#374151" stroke="#1F2937" stroke-width="0.9" stroke-linejoin="round" />
      <!-- Core internal divider wall -->
      <polygon points="150,18 182,31 182,38 150,25" fill="#6B7280" stroke="#1F2937" stroke-width="0.75" />
      <!-- Core thick wall rim (white/light grey top cap) -->
      <polygon points="136,24 168,38 196,25 164,11 160,13 190,25.5 168,35.5 141,23.5" fill="#F9FAFB" stroke="#1F2937" stroke-width="0.7" />

      <!-- Surface panel subdivisions on core wall -->
      <line x1="136" y1="40" x2="168" y2="54" stroke="#9CA3AF" stroke-width="0.6" />
      <line x1="136" y1="55" x2="168" y2="69" stroke="#9CA3AF" stroke-width="0.6" />
      <line x1="168" y1="54" x2="196" y2="41" stroke="#6B7280" stroke-width="0.6" />
      <line x1="168" y1="69" x2="196" y2="56" stroke="#6B7280" stroke-width="0.6" />

      <!-- MONOCHROME CAD LEADER ANNOTATIONS -->
      <g font-family="Geist Mono, monospace" font-size="6.5" fill="#1F2937">
        <!-- Leader 1: Core / Silo -->
        <polyline points="152,29 122,17 72,17" fill="none" stroke="#374151" stroke-width="0.65" />
        <circle cx="152" cy="29" r="1.5" fill="#111827" />
        <rect x="14" y="9" width="58" height="13" rx="1" fill="#FFFFFF" fill-opacity="0.9" stroke="#9CA3AF" stroke-width="0.65" />
        <text x="43" y="17.5" text-anchor="middle" font-weight="600">SL-01 · 170°C</text>

        <!-- Leader 2: Batch Mixer Core -->
        <polyline points="182,54 232,32 252,32" fill="none" stroke="#374151" stroke-width="0.65" />
        <circle cx="182" cy="54" r="1.5" fill="#111827" />
        <rect x="252" y="24" width="56" height="13" rx="1" fill="#FFFFFF" fill-opacity="0.9" stroke="#9CA3AF" stroke-width="0.65" />
        <text x="280" y="32.5" text-anchor="middle" font-weight="600">LOTE #114</text>

        <!-- Leader 3: Dispatch Bay -->
        <polyline points="198,92 236,108 252,108" fill="none" stroke="#374151" stroke-width="0.65" />
        <circle cx="198" cy="92" r="1.5" fill="#111827" />
        <rect x="252" y="100" width="56" height="13" rx="1" fill="#FFFFFF" fill-opacity="0.9" stroke="#9CA3AF" stroke-width="0.65" />
        <text x="280" y="108.5" text-anchor="middle" font-weight="600">MX-42 · 28t</text>
      </g>

      <!-- Revit 3D ViewCube (Top-Right Corner) -->
      <g transform="translate(284, 4)">
        <polygon points="12,1 22,5.5 12,10 2,5.5" fill="#F9FAFC" stroke="#4B5563" stroke-width="0.65" />
        <polygon points="2,5.5 12,10 12,20 2,15.5" fill="#D1D5DB" stroke="#4B5563" stroke-width="0.65" />
        <polygon points="12,10 22,5.5 22,15.5 12,20" fill="#9CA3AF" stroke="#4B5563" stroke-width="0.65" />
      </g>

      <!-- Bottom Viewport Status Bar Metadata -->
      <text x="10" y="132" fill="#4B5563" font-size="6.2" font-family="Geist Mono, monospace">{es ? 'ESTILO VISUAL: SOMBREADO · LÍNEA OCULTA' : 'VISUAL STYLE: SHADED · HIDDEN LINE'}</text>
    </svg>
  </div>
{/snippet}

{#snippet propertiesTable(rows: PropertyRow[])}
  <div class="divide-y divide-[#EAECEF] text-[11px]">
    <!-- Category Header 1 -->
    <div class="px-3 py-1 bg-[#F7F8FA] flex items-center justify-between text-[9.5px] font-medium text-[#5A6069]">
      <span class="flex items-center gap-1">{@render chevron()} {es ? 'Lecturas iniciales de planta' : 'Initial plant readings'}</span>
      <span class="rv-mono text-[9px] text-[#8A9099]">01–02</span>
    </div>
    {#each rows.filter((r) => r.group === 'equipment') as row}
      <button
        type="button"
        onclick={() => togglePropertyRow(row.id)}
        class="w-full grid grid-cols-[1fr_auto] items-center px-3 py-1.5 text-left hover:bg-[#F9FAFB] transition cursor-pointer"
      >
        <span class="text-[#374151] truncate pr-2 border-r border-[#EAECEF]">{row.parameter}</span>
        <span class="rv-mono pl-2.5 flex items-center gap-1.5 text-[10.5px] text-[#111827]">
          <span>{row.value} <span class="text-[#6B7280]">{row.unit}</span></span>
          <span class="w-2 h-2 rounded-[1px] {row.verified ? 'bg-[#15803D]' : 'border border-[#9CA3AF] bg-white'}"></span>
        </span>
      </button>
    {/each}

    <!-- Category Header 2 -->
    <div class="px-3 py-1 bg-[#F7F8FA] flex items-center justify-between text-[9.5px] font-medium text-[#5A6069]">
      <span class="flex items-center gap-1">{@render chevron()} {es ? 'Control de dosificación y despacho' : 'Dosing & dispatch control'}</span>
      <span class="rv-mono text-[9px] text-[#8A9099]">03–05</span>
    </div>
    {#each rows.filter((r) => r.group === 'dispatch') as row}
      <button
        type="button"
        onclick={() => togglePropertyRow(row.id)}
        class="w-full grid grid-cols-[1fr_auto] items-center px-3 py-1.5 text-left hover:bg-[#F9FAFB] transition cursor-pointer"
      >
        <span class="text-[#374151] truncate pr-2 border-r border-[#EAECEF]">{row.parameter}</span>
        <span class="rv-mono pl-2.5 flex items-center gap-1.5 text-[10.5px] text-[#111827]">
          <span>{row.value} <span class="text-[#6B7280]">{row.unit}</span></span>
          <span class="w-2 h-2 rounded-[1px] {row.verified ? 'bg-[#15803D]' : 'border border-[#D97706] bg-[#FEF3C7]'}"></span>
        </span>
      </button>
    {/each}
  </div>
{/snippet}

{#snippet weeklyChart()}
  <div class="flex gap-2 pt-1">
    <div class="rv-mono flex flex-col justify-between text-[8px] text-[#8A9099] h-22 pb-0.5 text-right w-7 shrink-0">
      <span>500t</span><span>375t</span><span>250t</span><span>125t</span><span>0t</span>
    </div>
    <div class="flex-1 relative h-22 border-b border-[#DCE0E6]">
      {#each [0, 25, 50, 75] as g}
        <div class="absolute left-0 right-0 border-t border-dashed border-[#ECEEF2]" style="top: {g}%;"></div>
      {/each}
      <div class="absolute inset-0 flex items-end justify-around">
        {#each weeklyProduction as item}
          <div class="flex items-end gap-[3px] h-full">
            <div class="w-[7px] rounded-t-[1px] {item.attention ? 'bg-[#D97706]' : 'bg-[#334155]'}" style="height: {item.actual}%;"></div>
            <div class="w-[7px] rounded-t-[1px] bg-[#CBD5E1]" style="height: {item.planned}%;"></div>
          </div>
        {/each}
      </div>
    </div>
  </div>
  <div class="rv-sans flex justify-around text-[8.5px] text-[#7A7F87] pt-1 pl-9">
    {#each weeklyProduction as item}<span>{item.day}</span>{/each}
  </div>
{/snippet}

{#snippet projectBrowserTree(limitFleet: number)}
  <div class="p-3 space-y-2 text-[11px]">
    <!-- Root node -->
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-1.5 font-medium text-[#111827]">
        <span class="rv-mono text-[9px] w-3.5 h-3.5 border border-[#9CA3AF] flex items-center justify-center leading-none text-[#4B5563]">-</span>
        <span>{es ? 'Planta Central · Sistemas MEP' : 'Central Plant · MEP Systems'}</span>
      </div>
      <span class="rv-mono text-[9.5px] text-[#15803D]">98.6% OK</span>
    </div>

    <!-- Branch 1: Silos -->
    <div class="pl-3 border-l border-[#D4D8DF] space-y-1">
      {#each plantSilos as silo}
        <div class="flex items-center justify-between py-0.5 text-[10.5px]">
          <div class="flex items-center gap-1.5 min-w-0">
            <span class="w-1.5 h-1.5 rounded-full {silo.ok ? 'bg-[#15803D]' : 'bg-[#D97706]'} shrink-0"></span>
            <span class="rv-mono text-[9.5px] text-[#6B7280]">{silo.code}</span>
            <span class="text-[#374151] truncate">{silo.name}</span>
          </div>
          <span class="rv-mono text-[10px] {silo.ok ? 'text-[#111827]' : 'text-[#B45309] font-medium'} shrink-0 ml-2">{silo.temp}</span>
        </div>
      {/each}
    </div>

    <!-- Branch 2: Active Fleet -->
    <div class="pt-1">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-1.5 font-medium text-[#111827]">
          <span class="rv-mono text-[9px] w-3.5 h-3.5 border border-[#9CA3AF] flex items-center justify-center leading-none text-[#4B5563]">-</span>
          <span>{es ? 'Unidades en ruta' : 'Units on route'}</span>
        </div>
        <span class="rv-mono text-[9.5px] text-[#6B7280]">18 {es ? 'activas' : 'active'}</span>
      </div>

      <div class="pl-3 mt-1 border-l border-[#D4D8DF] space-y-1">
        {#each fleetUnits.slice(0, limitFleet) as unit}
          <button
            type="button"
            onclick={() => openUnitSheet(unit)}
            class="w-full flex items-center justify-between py-1 px-1.5 rounded-[3px] hover:bg-[#F3F4F6] text-left transition cursor-pointer"
          >
            <div class="flex items-center gap-1.5 min-w-0">
              <span class="w-1.5 h-1.5 rounded-full {unit.ok ? 'bg-[#0284C7]' : 'bg-[#D97706]'} shrink-0"></span>
              <span class="rv-mono text-[10px] font-medium text-[#111827]">{unit.code}</span>
              <span class="text-[10.5px] text-[#4B5563] truncate">{unit.route}</span>
            </div>
            <span class="rv-mono text-[10px] text-[#374151] shrink-0 ml-2">{unit.loadTon.toFixed(1)}t · {unit.temp}</span>
          </button>
        {/each}
      </div>
    </div>
  </div>
{/snippet}

{#snippet sCurveChart(heightClass: string)}
  <div class="relative {heightClass} border-b border-[#DCE0E6]">
    <div class="absolute inset-0 flex items-end justify-between">
      {#each sCurveLines as h, i}
        <div
          class="w-px bg-[#334155]"
          style="height: {h}%; opacity: {0.25 + 0.75 * (i / (sCurveLines.length - 1))};"
        ></div>
      {/each}
    </div>
    <svg class="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
      <path d={plannedPath} fill="none" stroke="#0696D7" stroke-width="1.1" stroke-dasharray="2.5 2" vector-effect="non-scaling-stroke" />
    </svg>
  </div>
  <div class="rv-mono flex justify-between text-[8.5px] text-[#8A9099] pt-1">
    <span>S1</span><span>S2</span><span>S3</span><span>{es ? 'Hoy' : 'Now'}</span><span>12,000 t</span>
  </div>
{/snippet}

<!-- Toast -->
{#if toastMessage}
  <div
    class="rv-sans absolute top-14 left-1/2 -translate-x-1/2 z-50 px-3.5 py-1.5 rounded-[4px] bg-[#1E293B] text-white text-[11px] shadow-lg flex items-center gap-2 pointer-events-none whitespace-nowrap"
    in:fade={{ duration: 150 }}
    out:fade={{ duration: 150 }}
  >
    <span class="w-1.5 h-1.5 rounded-full bg-[#0696D7]"></span>
    <span>{toastMessage}</span>
  </div>
{/if}

<div
  class="rv-sans flex flex-col h-full w-full bg-[#EFEFEF] text-[#1A1D21] relative overflow-hidden select-none"
  data-testid="zea-edge-screen"
>
  <!-- Minimalist Header (Homologated with Funds Agent, pure typographic logo) -->
  <header class="px-4 py-2.5 bg-[#F6F7F8] border-b border-[#DCDFE4] flex items-center justify-between z-20 shrink-0">
    <div class="flex items-center">
      <h2 class="text-[13.5px] font-bold tracking-[0.15em] uppercase text-[#111827] leading-none select-none font-sans">Allisbox</h2>
    </div>
    <ZeaModeToggle bind:viewMode theme="industrial" variant="light" />
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
                  <div class="max-w-[82%] pl-3 pr-2 pt-1.5 pb-1 rounded-[6px] rounded-tr-[2px] bg-[#E2E5EA] text-[#111827]">
                    <span class="text-[12.5px] leading-snug">{msg.text}</span>
                    <span class="inline-flex items-center gap-0.5 float-right ml-2 mt-[5px] text-[9px] text-[#6B7280] tabular-nums">
                      {msg.time}
                      <svg class="w-3 h-3 text-[#0284C7]" viewBox="0 0 16 16" fill="currentColor">
                        <path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z" />
                        <path d="M10.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-.5-.5a.5.5 0 1 1 .708-.708l.146.147 6.646-6.647a.5.5 0 0 1 .708 0z" />
                      </svg>
                    </span>
                  </div>
                </div>
              {:else}
                <div class="space-y-2.5">
                  <!-- Agent reply: plain technical text, no bubble -->
                  <div class="flex items-start gap-2">
                    <div class="w-5 h-5 rounded-[3px] bg-[#0696D7] text-white flex items-center justify-center font-semibold text-[10.5px] leading-none shrink-0 mt-[1px]">G</div>
                    <p class="text-[12px] text-[#2D3139] leading-relaxed">
                      {msg.text}
                      <span class="text-[9px] text-[#8A9099] ml-1 tabular-nums whitespace-nowrap">{msg.time}</span>
                    </p>
                  </div>

                  {#if msg.briefing}
                    <div class="space-y-2.5 pl-7">
                      <!-- 1. AHORA: MEP Coordination Viewport + Properties -->
                      <div class="rv-panel overflow-hidden">
                        {@render panelBar(es ? 'Ahora · Coordinación 3D · Lote #114' : 'Now · 3D Coordination · Batch #114', '1:50')}
                        {@render mepViewport()}
                        <div class="divide-y divide-[#EAECEF] text-[11px]">
                          <div class="grid grid-cols-[1fr_auto] px-3 py-1.5">
                            <span class="text-[#6B7280]">{es ? 'Desviación detectada' : 'Detected drift'}</span>
                            <span class="rv-mono text-[#B45309] font-medium">+4.8% {es ? 'humedad árido' : 'aggregate moisture'}</span>
                          </div>
                          <div class="grid grid-cols-[1fr_auto] px-3 py-1.5">
                            <span class="text-[#6B7280]">{es ? 'Ajuste de fórmula' : 'Formula adjustment'}</span>
                            <span class="rv-mono text-[#111827] font-medium">-18.0 L H2O · 165.4 °C</span>
                          </div>
                        </div>
                        <div class="p-2.5 bg-[#F9FAFB] border-t border-[#EAECEF] grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onclick={() => openUnitSheet(fleetUnits[0])}
                            class="rv-btn-secondary"
                          >
                            {es ? 'Inspeccionar MX-42' : 'Inspect MX-42'}
                          </button>
                          <button
                            type="button"
                            onclick={applyAndDispatch}
                            class="rv-btn-primary"
                          >
                            {batchDispatched ? (es ? 'Compensado' : 'Compensated') : (es ? 'Aplicar y despachar' : 'Apply & dispatch')}
                          </button>
                        </div>
                      </div>

                      <!-- 2. HOY: Properties Table (Parte Diario) -->
                      <div class="rv-panel overflow-hidden">
                        {@render panelBar(es ? 'Hoy · Propiedades · Parte diario de planta' : 'Today · Properties · Plant daily log', `${dailyProperties.filter((r) => r.verified).length}/${dailyProperties.length}`)}
                        {@render propertiesTable(dailyProperties)}
                      </div>

                      <!-- 3. SEMANA: Weekly Production Chart -->
                      <div class="rv-panel overflow-hidden">
                        {@render panelBar(es ? 'Esta semana · Producción diaria (t)' : 'This week · Daily production (t)', es ? 'Meta 400 t' : 'Target 400 t')}
                        <div class="p-3 space-y-2">
                          <div class="flex items-baseline justify-between">
                            <div class="flex items-baseline gap-1.5">
                              <span class="rv-mono text-[24px] font-semibold text-[#111827] leading-none tracking-tight">420.0 t</span>
                              <span class="text-[10.5px] text-[#15803D] font-medium">↑ 8.4%</span>
                            </div>
                            {@render select(es ? 'Esta semana' : 'This week')}
                          </div>
                          {@render weeklyChart()}
                          <div class="flex items-center gap-3 text-[9.5px] text-[#6B7280] pt-0.5">
                            <span class="flex items-center gap-1"><span class="w-1.5 h-1.5 rounded-full bg-[#334155]"></span>{es ? 'Despachado' : 'Dispatched'}</span>
                            <span class="flex items-center gap-1"><span class="w-1.5 h-1.5 rounded-full bg-[#CBD5E1]"></span>{es ? 'Programado' : 'Scheduled'}</span>
                            <span class="flex items-center gap-1"><span class="w-1.5 h-1.5 rounded-full bg-[#D97706]"></span>{es ? 'Ajuste humedad' : 'Moisture adj.'}</span>
                          </div>
                        </div>
                      </div>

                      <!-- 4. MES: Project Browser Tree -->
                      <div class="rv-panel overflow-hidden">
                        {@render panelBar(es ? 'Este mes · Navegador de proyecto · Activos y flota' : 'This month · Project Browser · Assets & fleet', 'MEP / STR')}
                        {@render projectBrowserTree(3)}
                      </div>

                      <!-- 5. PROYECTADO: Cumulative S-Curve -->
                      <div class="rv-panel overflow-hidden">
                        {@render panelBar(es ? 'Proyectado · Curva S de suministro' : 'Projected · Supply S-curve', '2026')}
                        <div class="p-3 space-y-2">
                          <div class="flex items-baseline justify-between">
                            <div>
                              <div class="flex items-baseline gap-1.5">
                                <span class="rv-mono text-[24px] font-semibold text-[#111827] leading-none tracking-tight">11,420 t</span>
                                <span class="text-[10.5px] text-[#15803D] font-medium">↑ 95.2%</span>
                              </div>
                              <p class="text-[10px] text-[#6B7280] mt-0.5">{es ? 'Avance físico acumulado · meta 12,000 t' : 'Cumulative physical progress · 12,000 t target'}</p>
                            </div>
                            {@render select(es ? 'Mensual' : 'Monthly')}
                          </div>
                          {@render sCurveChart('h-18')}
                          <div class="flex items-center gap-3 text-[9.5px] text-[#6B7280]">
                            <span class="flex items-center gap-1"><span class="w-1.5 h-1.5 rounded-full bg-[#334155]"></span>{es ? 'Real acumulado' : 'Actual cumulative'}</span>
                            <span class="flex items-center gap-1"><span class="w-2.5 h-[1.5px] bg-[#0696D7]"></span>{es ? 'Curva programada' : 'Planned curve'}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  {/if}
                </div>
              {/if}
            {/each}

            {#if isAgentTyping}
              <div class="flex items-center gap-1 pl-7 py-1">
                <span class="w-1 h-1 rounded-full bg-[#6B7280] animate-bounce"></span>
                <span class="w-1 h-1 rounded-full bg-[#6B7280] animate-bounce [animation-delay:0.15s]"></span>
                <span class="w-1 h-1 rounded-full bg-[#6B7280] animate-bounce [animation-delay:0.3s]"></span>
              </div>
            {/if}
          </div>

          <!-- Prompt Input Bar -->
          <div class="shrink-0 bg-[#F6F7F8] border-t border-[#DCDFE4] px-3 pt-2 pb-2.5 space-y-2 z-20">
            <div class="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              {#each (es ? ['¿Qué tenemos para hoy?', 'Estado silos', 'Flota en ruta', 'Lote #114'] : ['What do we have today?', 'Silo status', 'Active fleet', 'Batch #114']) as chip}
                <button
                  type="button"
                  onclick={() => handleSendPrompt(chip)}
                  class="shrink-0 px-2.5 py-1 rounded-[4px] text-[10.5px] bg-white border border-[#D4D8DF] text-[#2D3139] hover:bg-[#F3F4F6] transition cursor-pointer"
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
              class="flex items-center gap-2 bg-white border border-[#D4D8DF] rounded-[5px] pl-3 pr-1 py-1"
            >
              <input
                type="text"
                bind:value={chatInputText}
                placeholder={es ? 'Pregunta a Allisbox' : 'Ask Allisbox'}
                class="flex-1 bg-transparent text-[12px] text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none py-1"
              />
              <button type="submit" aria-label="Enviar prompt" class="w-7 h-7 rounded-[4px] bg-[#1E293B] text-white hover:bg-[#334155] flex items-center justify-center cursor-pointer shrink-0">
                <svg class="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6">
                  <path d="M8 13V3m0 0L4 7m4-4l4 4" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
              </button>
            </form>
          </div>
        {:else}
          <!-- =========================================================== -->
          <!-- APP MODE: Revit CAD / BIM Engineering Workspace             -->
          <!-- =========================================================== -->
          <div class="flex-1 overflow-y-auto px-3.5 py-3.5 space-y-3 text-left">
            <!-- MEP Viewport Panel -->
            <div class="rv-panel overflow-hidden">
              {@render panelBar(es ? 'Coordinación 3D · Lote #114' : '3D Coordination · Batch #114', '1:50')}
              {@render mepViewport()}
              <div class="p-2.5 bg-white flex items-center justify-between gap-2">
                <div class="min-w-0">
                  <p class="text-[11px] font-medium text-[#111827] truncate">{es ? 'Compensación hídrica requerida (-18.0 L)' : 'Water compensation required (-18.0 L)'}</p>
                  <p class="rv-mono text-[9.5px] text-[#6B7280]">HY-204: 4.8% · MX-42 · 28.0 t</p>
                </div>
                <button type="button" onclick={applyAndDispatch} class="rv-btn-primary shrink-0">
                  {batchDispatched ? (es ? 'Aplicado' : 'Applied') : (es ? 'Aplicar' : 'Apply')}
                </button>
              </div>
            </div>

            <!-- Properties Panel -->
            <div class="rv-panel overflow-hidden">
              {@render panelBar(es ? 'Propiedades · Parte diario de planta' : 'Properties · Plant daily log', `${dailyProperties.filter((r) => r.verified).length}/${dailyProperties.length}`)}
              {@render propertiesTable(dailyProperties)}
            </div>

            <!-- Weekly Production -->
            <div class="rv-panel overflow-hidden">
              {@render panelBar(es ? 'Análisis · Producción semanal' : 'Analyze · Weekly production', '420.0 t')}
              <div class="p-3 space-y-2">
                {@render weeklyChart()}
              </div>
            </div>

            <!-- Project Browser -->
            <div class="rv-panel overflow-hidden">
              {@render panelBar(es ? 'Navegador de proyecto · Planta Central' : 'Project Browser · Central Plant', '18 MX')}
              {@render projectBrowserTree(4)}
            </div>
          </div>
        {/if}
      </div>

    <!-- =============================================================== -->
    <!-- TAB 2: SEGUIMIENTO (PROJECT BROWSER & DISPATCH SCHEDULE)        -->
    <!-- =============================================================== -->
    {:else if activeTab === 'tracking'}
      <div class="h-full overflow-y-auto px-3.5 py-3.5 space-y-3 text-left" in:fade={{ duration: 150 }}>
        <div class="rv-panel overflow-hidden">
          {@render panelBar(es ? 'Programación · Balance de masa del turno' : 'Schedule · Shift mass balance', es ? 'Norma NCh' : 'Spec NCh')}
          <div class="grid grid-cols-3 divide-x divide-[#EAECEF] text-center py-2.5">
            <div>
              <span class="rv-mono text-[18px] font-semibold text-[#111827] block">420.0 t</span>
              <span class="text-[9.5px] text-[#6B7280]">{es ? 'Despachado' : 'Dispatched'}</span>
            </div>
            <div>
              <span class="rv-mono text-[18px] font-semibold text-[#111827] block">18</span>
              <span class="text-[9.5px] text-[#6B7280]">{es ? 'Unidades activas' : 'Active units'}</span>
            </div>
            <div>
              <span class="rv-mono text-[18px] font-semibold text-[#15803D] block">98.6%</span>
              <span class="text-[9.5px] text-[#6B7280]">{es ? 'En tolerancia' : 'Within spec'}</span>
            </div>
          </div>
        </div>

        <div class="rv-panel overflow-hidden">
          {@render panelBar(es ? 'Unidades de transporte en ruta' : 'Transport units on route', es ? 'GPS / Telemetría' : 'GPS / Telemetry')}
          <div class="divide-y divide-[#EAECEF]">
            {#each fleetUnits as unit}
              <button
                type="button"
                onclick={() => openUnitSheet(unit)}
                class="w-full p-3 text-left flex items-center justify-between gap-3 hover:bg-[#F9FAFB] transition cursor-pointer"
              >
                <div class="min-w-0">
                  <div class="flex items-center gap-2">
                    <span class="w-1.5 h-1.5 rounded-full {unit.ok ? 'bg-[#15803D]' : 'bg-[#D97706]'}"></span>
                    <span class="rv-mono text-[11.5px] font-semibold text-[#111827]">{unit.code}</span>
                    <span class="text-[11px] text-[#4B5563] truncate">· {unit.operator}</span>
                  </div>
                  <p class="text-[10px] text-[#6B7280] mt-0.5 truncate">{unit.mix} · {unit.route}</p>
                </div>
                <div class="text-right shrink-0">
                  <span class="rv-mono text-[12px] font-semibold text-[#111827] block">{unit.temp}</span>
                  <span class="rv-mono text-[9.5px] text-[#6B7280]">{unit.loadTon.toFixed(1)} t · ETA {unit.eta}</span>
                </div>
              </button>
            {/each}
          </div>
        </div>
      </div>

    <!-- =============================================================== -->
    <!-- TAB 3: SENSORES (MEP TELEMETRY & ISOMETRIC MODEL)               -->
    <!-- =============================================================== -->
    {:else if activeTab === 'sensors'}
      <div class="h-full overflow-y-auto px-3.5 py-3.5 space-y-3 text-left" in:fade={{ duration: 150 }}>
        <div class="rv-panel overflow-hidden">
          {@render panelBar(es ? 'Coordinación 3D · Telemetría en vivo' : '3D Coordination · Live telemetry', 'MEP 1:50')}
          {@render mepViewport()}
        </div>

        <div class="rv-panel overflow-hidden">
          {@render panelBar(es ? 'Navegador de sistemas · Nodos de instrumentación' : 'System Browser · Instrumentation nodes', es ? '4 canales' : '4 channels')}
          <div class="divide-y divide-[#EAECEF]">
            {#each sensorNodes as node}
              <div class="p-3 flex items-center justify-between gap-2">
                <div class="min-w-0">
                  <div class="flex items-center gap-1.5">
                    <span class="w-2 h-2 rounded-[1px]" style="background-color: {node.color};"></span>
                    <span class="rv-mono text-[11px] font-semibold text-[#111827]">{node.id}</span>
                    <span class="rv-mono text-[9.5px] text-[#6B7280]">({node.system})</span>
                  </div>
                  <p class="text-[10.5px] text-[#4B5563] mt-0.5 truncate">{node.location}</p>
                </div>
                <div class="text-right shrink-0">
                  <span class="rv-mono text-[12px] font-semibold {node.ok ? 'text-[#111827]' : 'text-[#B45309]'} block">{node.reading}</span>
                  <span class="rv-mono text-[9px] text-[#8A9099]">{es ? 'Norma' : 'Spec'} {node.tolerance}</span>
                </div>
              </div>
            {/each}
          </div>
        </div>
      </div>

    <!-- =============================================================== -->
    <!-- TAB 4: PERFIL (IDENTITY DATA SHEET)                             -->
    <!-- =============================================================== -->
    {:else if activeTab === 'profile'}
      <div class="h-full overflow-y-auto px-3.5 py-3.5 space-y-3 text-left" in:fade={{ duration: 150 }}>
        <div class="rv-panel overflow-hidden">
          {@render panelBar(es ? 'Datos de identidad · Operador responsable' : 'Identity Data · Responsible operator', 'ID-OPR-786')}
          <div class="divide-y divide-[#EAECEF] text-[11px]">
            <div class="grid grid-cols-[120px_1fr] px-3 py-2">
              <span class="text-[#6B7280]">{es ? 'Nombre' : 'Name'}</span>
              <span class="font-medium text-[#111827]">Carlos Hinostroza</span>
            </div>
            <div class="grid grid-cols-[120px_1fr] px-3 py-2">
              <span class="text-[#6B7280]">{es ? 'Cargo' : 'Role'}</span>
              <span class="text-[#111827]">{es ? 'Jefe de Planta y Operaciones' : 'Plant & Operations Manager'}</span>
            </div>
            <div class="grid grid-cols-[120px_1fr] px-3 py-2">
              <span class="text-[#6B7280]">{es ? 'Instalación' : 'Facility'}</span>
              <span class="rv-mono text-[#111827]">{es ? 'Planta Central · Sector Sur' : 'Central Plant · South Sector'}</span>
            </div>
            <div class="grid grid-cols-[120px_1fr] px-3 py-2">
              <span class="text-[#6B7280]">{es ? 'Certificación' : 'Certification'}</span>
              <span class="rv-mono text-[#15803D]">{es ? 'ITO Nivel III · Activo' : 'ITO Level III · Active'}</span>
            </div>
            <div class="grid grid-cols-[120px_1fr] px-3 py-2">
              <span class="text-[#6B7280]">{es ? 'Tonelaje turno' : 'Shift tonnage'}</span>
              <span class="rv-mono text-[#111827]">420.0 t / 500.0 t</span>
            </div>
          </div>
        </div>
      </div>
    {/if}
  </div>

  <!-- Bottom Tab Bar -->
  <nav
    id="bottom-tabbar"
    class="shrink-0 h-13 bg-[#F6F7F8] border-t border-[#DCDFE4] flex items-center justify-around px-2 z-20"
  >
    {#each [
      { id: 'summary', label: es ? 'Resumen' : 'Summary', d: 'M3 13h4v7H3zM10 8h4v12h-4zM17 4h4v16h-4z' },
      { id: 'tracking', label: es ? 'Seguimiento' : 'Tracking', d: 'M4 6h16M4 12h16M4 18h10' },
      { id: 'sensors', label: es ? 'Sensores' : 'Sensors', d: 'M12 3v4m0 10v4M3 12h4m10 0h4m-9-4a4 4 0 100 8 4 4 0 000-8z' },
      { id: 'profile', label: es ? 'Perfil' : 'Profile', d: 'M12 11a4 4 0 100-8 4 4 0 000 8zM4 20a8 8 0 0116 0' }
    ] as tab}
      <button
        type="button"
        onclick={() => (activeTab = tab.id as any)}
        class="flex flex-col items-center gap-[3px] px-2 py-1 transition cursor-pointer {activeTab === tab.id ? 'text-[#111827]' : 'text-[#8A9099] hover:text-[#374151]'}"
      >
        <svg class="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <path d={tab.d} />
        </svg>
        <span class="text-[9.5px] {activeTab === tab.id ? 'font-medium' : ''}">{tab.label}</span>
      </button>
    {/each}
  </nav>

  {#if sheetData}
    <ZeaSheet
      theme="industrial"
      variant="light"
      isOpen={sheetOpen}
      avatarText={sheetData.code}
      title="{sheetData.code} · {sheetData.operator}"
      subtitle="{sheetData.mix} · {sheetData.route}"
      progressLabel={es ? `Carga (${sheetData.loadTon} de ${sheetData.maxTon} t)` : `Load (${sheetData.loadTon} of ${sheetData.maxTon} t)`}
      progressValueText={sheetData.temp}
      progressPct={Math.round((sheetData.loadTon / sheetData.maxTon) * 100)}
      stats={[
        { label: es ? 'Temperatura' : 'Temperature', value: sheetData.temp },
        { label: es ? 'Ruta' : 'Route', value: sheetData.route },
        { label: es ? 'Estado' : 'Status', value: sheetData.status },
        { label: 'ETA', value: sheetData.eta }
      ]}
      onClose={() => (sheetOpen = false)}
    />
  {/if}
</div>

<style>
  .rv-sans {
    font-family: 'Inter', 'Helvetica Neue', Arial, system-ui, sans-serif;
    font-feature-settings: 'cv11', 'ss01';
    -webkit-font-smoothing: antialiased;
  }
  .rv-mono {
    font-family: 'Geist Mono', ui-monospace, SFMono-Regular, Menlo, monospace;
    font-variant-numeric: tabular-nums;
  }
  .rv-panel {
    background: #ffffff;
    border: 1px solid #d8dce2;
    border-radius: 5px;
    box-shadow: 0 1px 2px rgba(15, 23, 42, 0.03);
  }
  .rv-btn-primary {
    font-family: 'Inter', 'Helvetica Neue', Arial, sans-serif;
    font-size: 11px;
    font-weight: 500;
    padding: 6px 10px;
    border-radius: 4px;
    background: #1e293b;
    color: #ffffff;
    cursor: pointer;
    transition: background 0.15s;
  }
  .rv-btn-primary:hover {
    background: #334155;
  }
  .rv-btn-secondary {
    font-family: 'Inter', 'Helvetica Neue', Arial, sans-serif;
    font-size: 11px;
    font-weight: 500;
    padding: 6px 10px;
    border-radius: 4px;
    background: #ffffff;
    color: #1e293b;
    border: 1px solid #d4d8df;
    cursor: pointer;
    transition: background 0.15s;
  }
  .rv-btn-secondary:hover {
    background: #f3f4f6;
  }
</style>
