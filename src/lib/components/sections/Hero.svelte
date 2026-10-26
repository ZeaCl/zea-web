<script lang="ts">
  import MetallicButton from '../atoms/MetallicButton.svelte';
  import MetricBadge from '../atoms/MetricBadge.svelte';
  import { content, type Language } from '../../config/i18n';

  let {
    lang = 'es'
  }: {
    lang?: Language;
  } = $props();

  const t = $derived(content[lang]);

  let activeStreamTab = $state<'audit' | 'ledger' | 'field'>('audit');

  const streamData = {
    audit: {
      tag: 'LEGAL AGENT · INFRAESTRUCTURA CRÍTICA',
      file: 'Bases_Licitacion_Concesion_Vial.pdf',
      status: 'VERIFICADO',
      timestamp: '14:23:01.402 UTC',
      log: [
        { type: 'agent', text: 'Extrayendo obligaciones contractuales de la Adenda N° 8, Cláusula 14.3.2...' },
        { type: 'rule', text: 'Regla: "Plazo fatal de hormigonado en fundaciones estructurales: 48 hrs continuas tras inspección".' },
        { type: 'alert', text: 'Alerta Preventiva: Ventana climática crítica se reduce en 14 hrs. Recalculando Gantt...' },
        { type: 'success', text: 'Nueva ruta crítica optimizada (Hito #289 sin penalización contractual).' }
      ]
    },
    ledger: {
      tag: 'FINANCE AGENT · ASSET MANAGEMENT',
      file: 'Fondo_Inversion_Privado_Q3.xml',
      status: 'CONCILIADO',
      timestamp: '14:23:02.115 UTC',
      log: [
        { type: 'agent', text: 'Auditando libro mayor y 32 llamados de capital (Aportantes Serie A y B)...' },
        { type: 'rule', text: 'Cálculo de Hurdle Rate 8.0% anual + Carry 20% con catch-up del 100%.' },
        { type: 'success', text: 'Conciliación de saldos bancarios: $14.850.210 USD verificados contra custodio.' },
        { type: 'success', text: 'Cartas trimestrales a LPs firmadas criptográficamente con 0 descuadre.' }
      ]
    },
    field: {
      tag: 'INDUSTRIAL AGENT · OPERACIONES EN TERRENO',
      file: 'Control_Flota_Despachos.json',
      status: 'EN RUTA',
      timestamp: '14:23:02.890 UTC',
      log: [
        { type: 'agent', text: 'Monitoreando 14 camiones tolva con mezcla asfáltica en caliente SMA-16...' },
        { type: 'rule', text: 'Requisito Técnico: Temperatura de extendido en pista no inferior a 145°C.' },
        { type: 'alert', text: 'Camión BZ-9102 retrasado por tráfico en peaje. Temperatura proyectada: 147°C (Marginal).' },
        { type: 'success', text: 'Despacho redirigido a frente prioritario Km 943. Compactación validada.' }
      ]
    }
  };

  const currentStream = $derived(streamData[activeStreamTab]);
</script>

<section class="relative overflow-hidden pt-12 pb-20 md:pt-16 md:pb-28">
  <!-- Subtle ambient background glow -->
  <div class="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 h-[500px] w-[900px] rounded-full bg-gradient-to-b from-zinc-700/10 via-zinc-800/5 to-transparent blur-3xl"></div>

  <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
    <div class="text-center max-w-4xl mx-auto space-y-6">
      <!-- Main Headline -->
      <h1 class="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.08] text-white">
        <span>{t.hero.titlePrefix}</span>
        <span class="z-gradient-text block sm:inline">{t.hero.titleHighlight}</span>
        {#if t.hero.titleSuffix}
          <span>{t.hero.titleSuffix}</span>
        {/if}
      </h1>

      <!-- Subtitle -->
      <p class="text-base sm:text-lg md:text-xl text-zinc-300 max-w-3xl mx-auto leading-relaxed font-sans">
        {t.hero.subtitle}
      </p>

      <!-- CTAs -->
      <div class="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
        <MetallicButton
          href="#diagnostico"
          variant="gradient-border"
          size="lg"
          class="w-full sm:w-auto font-mono uppercase tracking-wider text-xs font-bold"
        >
          <span>{t.hero.ctaPrimary}</span>
        </MetallicButton>

        <MetallicButton
          href="#soluciones"
          variant="ghost"
          size="lg"
          class="w-full sm:w-auto font-mono tracking-wider text-xs"
        >
          <span>{t.hero.ctaSecondary} ↓</span>
        </MetallicButton>
      </div>

      <!-- 3 Key Metric Badges -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-8 text-left">
        <MetricBadge
          value={t.hero.metric1Val}
          label={t.hero.metric1Label}
          trend="+100% Audit"
        />
        <MetricBadge
          value={t.hero.metric2Val}
          label={t.hero.metric2Label}
          trend="Sin Colisión"
        />
        <MetricBadge
          value={t.hero.metric3Val}
          label={t.hero.metric3Label}
          trend="Cero Error"
        />
      </div>
    </div>

    <!-- Live Agent Terminal Simulation -->
    <div id="hero-terminal" class="mt-14 max-w-5xl mx-auto">
      <div class="overflow-hidden rounded-2xl border border-[#3d3d4b] bg-[#141418] shadow-2xl">
        <!-- Terminal Header with Tabs -->
        <div class="border-b border-[#2f2f3b] bg-[#1c1c22] px-4 py-3 flex flex-wrap items-center justify-between gap-3">
          <div class="flex items-center gap-2">
            <span class="w-3 h-3 rounded-full bg-red-500/80 inline-block"></span>
            <span class="w-3 h-3 rounded-full bg-yellow-500/80 inline-block"></span>
            <span class="w-3 h-3 rounded-full bg-emerald-500/80 inline-block"></span>
            <span class="ml-2 font-mono text-xs text-zinc-400 font-semibold hidden sm:inline">
              zea-agent-engine // v2.6.4-prod
            </span>
          </div>

          <!-- Vertical Switchers inside terminal -->
          <div class="flex items-center gap-1.5 font-mono text-[11px]" data-testid="terminal-tabs">
            <button
              type="button"
              data-tab="audit"
              onclick={() => (activeStreamTab = 'audit')}
              class="px-3 py-1 rounded-md transition cursor-pointer {activeStreamTab === 'audit' ? 'bg-[#2a2a36] text-white border border-zinc-500' : 'text-zinc-400 hover:text-white'}"
            >
              Infraestructura
            </button>
            <button
              type="button"
              data-tab="ledger"
              onclick={() => (activeStreamTab = 'ledger')}
              class="px-3 py-1 rounded-md transition cursor-pointer {activeStreamTab === 'ledger' ? 'bg-[#2a2a36] text-white border border-zinc-500' : 'text-zinc-400 hover:text-white'}"
            >
              Finanzas & AUM
            </button>
            <button
              type="button"
              data-tab="field"
              onclick={() => (activeStreamTab = 'field')}
              class="px-3 py-1 rounded-md transition cursor-pointer {activeStreamTab === 'field' ? 'bg-[#2a2a36] text-white border border-zinc-500' : 'text-zinc-400 hover:text-white'}"
            >
              Faenas & Flotas
            </button>
          </div>
        </div>

        <!-- Terminal Sub-bar -->
        <div class="bg-[#111115] px-5 py-2.5 border-b border-[#24242e] flex flex-wrap items-center justify-between text-[11px] font-mono text-zinc-400">
          <div class="flex items-center gap-3">
            <span class="text-emerald-400 font-semibold flex items-center gap-1.5">
              <span class="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              {currentStream.status}
            </span>
            <span>•</span>
            <span class="text-zinc-300 font-medium">{currentStream.tag}</span>
          </div>
          <div class="text-zinc-500">
            {currentStream.file} ({currentStream.timestamp})
          </div>
        </div>

        <!-- Terminal Console Body -->
        <div class="p-6 font-mono text-xs leading-relaxed space-y-3.5 bg-[#0e0e12] text-zinc-300">
          {#each currentStream.log as item}
            <div class="flex items-start gap-3">
              {#if item.type === 'agent'}
                <span class="text-cyan-400 font-bold shrink-0">[AGENT]</span>
                <span class="text-zinc-200">{item.text}</span>
              {:else if item.type === 'rule'}
                <span class="text-amber-400 font-bold shrink-0">[POLICY]</span>
                <span class="text-zinc-300 italic">{item.text}</span>
              {:else if item.type === 'alert'}
                <span class="text-orange-400 font-bold shrink-0">[CRITICAL]</span>
                <span class="text-orange-200">{item.text}</span>
              {:else}
                <span class="text-emerald-400 font-bold shrink-0">[RESOLVED]</span>
                <span class="text-emerald-200 font-semibold">{item.text}</span>
              {/if}
            </div>
          {/each}

          <div class="pt-2 flex items-center gap-2 text-zinc-500 text-[11px]">
            <span class="animate-pulse font-bold text-white">▋</span>
            <span>Esperando siguiente ciclo de telemetría de misión crítica (polling cada 1.0s)...</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>
