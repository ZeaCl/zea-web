<script lang="ts">
  import { content, type Language } from '../../config/i18n';

  let {
    lang = 'es'
  }: {
    lang?: Language;
  } = $props();

  const t = $derived(content[lang].verticals.finance);

  let capitalCallAmount = $state(2500000);
  const hurdleRate = 0.08;
  const carryRate = 0.20;

  const lpDistribution = $derived(Math.round(capitalCallAmount * (1 - carryRate)));
  const gpCarry = $derived(Math.round(capitalCallAmount * carryRate));
</script>

<section id="finanzas" class="py-20 border-t border-[#2f2f3b]/70 bg-[#141418]">
  <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
    <!-- Header -->
    <div class="max-w-3xl mb-12">
      <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-[11px] font-mono font-semibold tracking-wider mb-4">
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

    <!-- Main Grid: Features & Deterministic Engine Simulator -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      <!-- Feature Points (5 cols) -->
      <div class="lg:col-span-5 space-y-6">
        <div class="z-card p-6 border border-[#3d3d4b]/70">
          <div class="flex items-start gap-4">
            <div class="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold font-mono text-sm shrink-0">
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
            <div class="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold font-mono text-sm shrink-0">
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
            <div class="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold font-mono text-sm shrink-0">
              03
            </div>
            <div>
              <h3 class="text-base font-bold text-white mb-1.5">{t.feature3Title}</h3>
              <p class="text-xs text-zinc-400 leading-relaxed font-sans">{t.feature3Desc}</p>
            </div>
          </div>
        </div>

        <!-- Metric Callout -->
        <div class="p-6 rounded-2xl bg-gradient-to-r from-emerald-950/40 to-[#1c1c22] border border-emerald-800/40 flex items-center justify-between">
          <div>
            <div class="text-3xl font-extrabold font-mono text-emerald-300">{t.metricStat}</div>
            <div class="text-xs text-zinc-400 font-medium">{t.metricLabel}</div>
          </div>
          <span class="text-xs font-mono px-3 py-1 bg-emerald-500/20 text-emerald-300 rounded border border-emerald-500/40">
            Cero Alucinación
          </span>
        </div>
      </div>

      <!-- Interactive Deterministic Calculator / Waterfall Simulator (7 cols) -->
      <div class="lg:col-span-7">
        <div class="rounded-2xl border border-[#3d3d4b] bg-[#141418] overflow-hidden shadow-xl">
          <!-- Header -->
          <div class="bg-[#1c1c22] px-5 py-3.5 border-b border-[#2f2f3b] flex items-center justify-between">
            <span class="text-xs font-mono text-zinc-300 font-bold uppercase tracking-wider">
              Simulador de Waterfall & Balance Determinista
            </span>
            <span class="text-[11px] font-mono text-emerald-400 font-semibold">Motor Elixir / ZEA Soma</span>
          </div>

          <div class="p-6 space-y-6 bg-[#111115]">
            <!-- Slider control for capital call -->
            <div>
              <div class="flex justify-between items-baseline mb-2">
                <label for="capital-slider" class="text-xs font-mono text-zinc-400">Distribución de Ganancias / Capital Call:</label>
                <span class="text-lg font-bold font-mono text-white">
                  ${(capitalCallAmount).toLocaleString('en-US')} USD
                </span>
              </div>
              <input
                id="capital-slider"
                type="range"
                min="500000"
                max="10000000"
                step="250000"
                bind:value={capitalCallAmount}
                class="w-full h-2 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
              <div class="flex justify-between text-[10px] font-mono text-zinc-500 mt-1">
                <span>$500K USD</span>
                <span>$5M USD</span>
                <span>$10M USD</span>
              </div>
            </div>

            <!-- Waterfall Split Breakdown -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div class="p-4 rounded-xl bg-[#181820] border border-[#2e2e3d]">
                <div class="flex items-center justify-between mb-2">
                  <span class="text-xs font-mono text-zinc-400 font-medium">Limited Partners (LPs):</span>
                  <span class="text-[11px] font-mono text-emerald-400 font-bold">80% Retorno</span>
                </div>
                <div class="text-2xl font-bold font-mono text-emerald-300">
                  ${lpDistribution.toLocaleString('en-US')}
                </div>
                <p class="text-[11px] text-zinc-500 mt-1">
                  Amortización de capital preferente con Hurdle {(hurdleRate * 100).toFixed(1)}%.
                </p>
              </div>

              <div class="p-4 rounded-xl bg-[#181820] border border-[#2e2e3d]">
                <div class="flex items-center justify-between mb-2">
                  <span class="text-xs font-mono text-zinc-400 font-medium">General Partner (GP):</span>
                  <span class="text-[11px] font-mono text-amber-400 font-bold">20% Carry</span>
                </div>
                <div class="text-2xl font-bold font-mono text-amber-300">
                  ${gpCarry.toLocaleString('en-US')}
                </div>
                <p class="text-[11px] text-zinc-500 mt-1">
                  Incentivo por desempeño certificado en libros contables.
                </p>
              </div>
            </div>

            <!-- Audit Trail & Certification -->
            <div class="p-4 rounded-xl bg-[#0b0b0e] border border-zinc-800 font-mono text-xs text-zinc-400 space-y-2">
              <div class="flex items-center gap-2 text-zinc-300 font-semibold text-[11px]">
                <span class="w-2 h-2 rounded-full bg-emerald-400"></span>
                <span>Certificación de Cuadre Contable Automático:</span>
              </div>
              <p class="text-zinc-400 font-sans text-xs">
                "Conciliación bancaria en tiempo real contra bancos custodios. Descuadre matemático: <span class="text-emerald-400 font-mono font-bold">$0.00 USD</span>. Reporte para auditores Big Four exportable en 1 clic."
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>
