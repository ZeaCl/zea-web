<script lang="ts">
  import { content, type Language } from '../../config/i18n';

  let {
    lang = 'es'
  }: {
    lang?: Language;
  } = $props();

  const t = $derived(content[lang].verticals.industrial);

  let activeTruck = $state(0);

  const fleet = [
    {
      id: 'TK-402',
      driver: 'Rodrigo Morales',
      plant: 'Planta Principal de Asfaltos',
      destination: 'Frente de Avance Km 24',
      mixType: 'SMA-16 Modificada con Polímeros',
      tempPlant: '168°C',
      tempCurrent: '154°C',
      tempMinAllowed: '145°C',
      status: 'En Descarga',
      eta: 'Llegó 14:15'
    },
    {
      id: 'TK-408',
      driver: 'Hernán Silva',
      plant: 'Planta Principal de Asfaltos',
      destination: 'Frente de Avance Km 26',
      mixType: 'Binder Asfáltico Estructural',
      tempPlant: '165°C',
      tempCurrent: '158°C',
      tempMinAllowed: '140°C',
      status: 'En Tránsito (Ruta)',
      eta: '12 min restantes'
    },
    {
      id: 'TK-415',
      driver: 'Manuel Pardo',
      plant: 'Planta Norte de Áridos',
      destination: 'Enlace Troncal Km 18',
      mixType: 'Capa de Rodadura D-12',
      tempPlant: '170°C',
      tempCurrent: '162°C',
      tempMinAllowed: '148°C',
      status: 'Pesaje en Báscula',
      eta: 'Saliendo de Planta'
    }
  ];

  const currentTruck = $derived(fleet[activeTruck]);
</script>

<section id="industrial" class="py-20 border-t border-[#2f2f3b]/70 bg-[#17171d]/50">
  <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
    <!-- Header -->
    <div class="max-w-3xl mb-12">
      <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/25 text-orange-400 text-[11px] font-mono font-semibold tracking-wider mb-4">
        {t.tag}
      </div>
      <h2 class="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
        {t.title}
      </h2>
      <p class="text-xs font-mono text-zinc-400 mt-2">
        {t.industry}
      </p>
      <p class="text-base text-zinc-300 mt-4 leading-relaxed font-sans">
        {t.summary}
      </p>
    </div>

    <!-- Main Grid: Features & Real-time Field Telemetry Simulator -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      <!-- Feature Points (5 cols) -->
      <div class="lg:col-span-5 space-y-6">
        <div class="z-card p-6 border border-[#3d3d4b]/70">
          <div class="flex items-start gap-4">
            <div class="w-8 h-8 rounded-lg bg-orange-500/15 border border-orange-500/30 flex items-center justify-center text-orange-400 font-bold font-mono text-sm shrink-0">
              01
            </div>
            <div>
              <h3 class="text-base font-bold text-white mb-1.5">{t.feature1Title}</h3>
              <p class="text-xs text-zinc-400 leading-relaxed font-sans">{t.feature1Desc}</p>
            </div>
          </div>
        </div>

        <div class="z-card p-6 border border-[#3d3d4b]/70">
          <div class="flex items-start gap-4">
            <div class="w-8 h-8 rounded-lg bg-orange-500/15 border border-orange-500/30 flex items-center justify-center text-orange-400 font-bold font-mono text-sm shrink-0">
              02
            </div>
            <div>
              <h3 class="text-base font-bold text-white mb-1.5">{t.feature2Title}</h3>
              <p class="text-xs text-zinc-400 leading-relaxed font-sans">{t.feature2Desc}</p>
            </div>
          </div>
        </div>

        <div class="z-card p-6 border border-[#3d3d4b]/70">
          <div class="flex items-start gap-4">
            <div class="w-8 h-8 rounded-lg bg-orange-500/15 border border-orange-500/30 flex items-center justify-center text-orange-400 font-bold font-mono text-sm shrink-0">
              03
            </div>
            <div>
              <h3 class="text-base font-bold text-white mb-1.5">{t.feature3Title}</h3>
              <p class="text-xs text-zinc-400 leading-relaxed font-sans">{t.feature3Desc}</p>
            </div>
          </div>
        </div>

        <!-- Metric Callout -->
        <div class="p-6 rounded-2xl bg-gradient-to-r from-orange-950/40 to-[#1c1c22] border border-orange-800/40 flex items-center justify-between">
          <div>
            <div class="text-3xl font-extrabold font-mono text-orange-300">{t.metricStat}</div>
            <div class="text-xs text-zinc-400 font-medium">{t.metricLabel}</div>
          </div>
          <span class="text-xs font-mono px-3 py-1 bg-orange-500/20 text-orange-300 rounded border border-orange-500/40">
            Telemetría GPS & Térmica
          </span>
        </div>
      </div>

      <!-- Real-time Fleet & Thermal Telemetry Inspector (7 cols) -->
      <div class="lg:col-span-7">
        <div class="rounded-2xl border border-[#3d3d4b] bg-[#141418] overflow-hidden shadow-xl">
          <!-- Header -->
          <div class="bg-[#1c1c22] px-5 py-3.5 border-b border-[#2f2f3b] flex items-center justify-between">
            <span class="text-xs font-mono text-zinc-300 font-bold uppercase tracking-wider">
              Control de Pavimentación y Flotas en Ruta
            </span>
            <span class="text-[11px] font-mono text-orange-400 font-semibold flex items-center gap-1.5">
              <span class="w-2 h-2 rounded-full bg-orange-400 animate-ping"></span>
              Live GPS Stream
            </span>
          </div>

          <!-- Truck Selectors -->
          <div class="flex border-b border-[#24242e] bg-[#0e0e12] overflow-x-auto" data-testid="fleet-buttons">
            {#each fleet as truck, idx}
              <button
                type="button"
                data-testid={`truck-btn-${idx}`}
                onclick={() => (activeTruck = idx)}
                class="px-4 py-3 text-xs font-mono text-left whitespace-nowrap transition cursor-pointer border-b-2 {activeTruck === idx ? 'border-orange-400 text-white bg-[#1a1a22]' : 'border-transparent text-zinc-400 hover:text-white'}"
              >
                Camión {truck.id} · {truck.status}
              </button>
            {/each}
          </div>

          <!-- Truck Telemetry Card -->
          <div class="p-6 space-y-6 bg-[#121216]">
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
              <div class="p-3 rounded-lg bg-[#181820] border border-[#2b2b38]">
                <span class="text-[10px] text-zinc-500 block uppercase">Conductor</span>
                <span class="text-white font-semibold">{currentTruck.driver}</span>
              </div>
              <div class="p-3 rounded-lg bg-[#181820] border border-[#2b2b38]">
                <span class="text-[10px] text-zinc-500 block uppercase">Mezcla</span>
                <span class="text-orange-300 font-semibold">{currentTruck.mixType}</span>
              </div>
              <div class="p-3 rounded-lg bg-[#181820] border border-[#2b2b38]">
                <span class="text-[10px] text-zinc-500 block uppercase">Temp. Actual</span>
                <span class="text-emerald-400 font-bold text-sm">{currentTruck.tempCurrent}</span>
              </div>
              <div class="p-3 rounded-lg bg-[#181820] border border-[#2b2b38]">
                <span class="text-[10px] text-zinc-500 block uppercase">Mínima Exigida</span>
                <span class="text-zinc-300 font-semibold">{currentTruck.tempMinAllowed}</span>
              </div>
            </div>

            <!-- Route & Progress Bar -->
            <div class="space-y-2">
              <div class="flex justify-between text-xs font-mono text-zinc-400">
                <span>{currentTruck.plant}</span>
                <span class="text-orange-400 font-bold">{currentTruck.destination}</span>
              </div>
              <div class="w-full h-3 rounded-full bg-zinc-800 overflow-hidden flex">
                <div class="h-full bg-gradient-to-r from-emerald-500 to-orange-500" style="width: 78%;"></div>
              </div>
              <div class="flex justify-between text-[11px] font-mono text-zinc-500">
                <span>Temp. Salida: {currentTruck.tempPlant}</span>
                <span>Estado: {currentTruck.eta}</span>
              </div>
            </div>

            <!-- Agent Supervision Alert -->
            <div class="rounded-xl bg-[#09090c] p-4 border border-[#2a2a36] font-mono text-xs text-zinc-300 space-y-1">
              <span class="text-orange-400 font-bold block text-[11px]">[AGENTE DE FAENA · VERIFICACIÓN AUTOMÁTICA]</span>
              <p class="text-zinc-300 font-sans text-xs">
                La temperatura térmica remota ({currentTruck.tempCurrent}) cumple con la tolerancia de la especificación técnica (+9°C sobre el límite crítico de rechazo). Descarga autorizada sin riesgo de penalización por desintegración.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>
