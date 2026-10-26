<script lang="ts">
  import { content, type Language } from '../../config/i18n';

  let {
    lang = 'es'
  }: {
    lang?: Language;
  } = $props();

  const t = $derived(content[lang].verticals.legal);

  let activeClauseIndex = $state(0);

  const sampleClauses = [
    {
      ref: 'Adenda 8 · Art. 14.3.2',
      title: 'Plazo Fatal Hormigonado en Fundaciones Estructurales',
      risk: 'ALTO',
      penalty: '500 UTM / día de atraso',
      extractedText: 'El Concesionario deberá culminar el vertido continuo de hormigón en un lapso improrrogable de 48 horas tras visto bueno del Inspector Fiscal.',
      ganttImpact: 'Bloquea Tarea #412 (Montaje de Pilares) — Holgura recalculada a +1.5 días.'
    },
    {
      ref: 'Res. Exenta 1.402 · Art. 7.1',
      title: 'Monitoreo Batimétrico y Dinámica de Corrientes',
      risk: 'MEDIO',
      penalty: 'Paralización cautelar preventiva',
      extractedText: 'Lecturas batimétricas periódicas durante mareas vivas con transmisión telemétrica inmediata al Inspector Técnico de Obra.',
      ganttImpact: 'Tarea recurrente sincronizada con modelo hidrodinámico en tiempo real.'
    },
    {
      ref: 'Bases Adm. · Art. 29.4',
      title: 'Vigencia de Boletas de Garantía de Fiel Cumplimiento',
      risk: 'CRÍTICO',
      penalty: 'Cobro ejecutivo inmediato',
      extractedText: 'Toda garantía bancaria debe ser renovada al menos 30 días hábiles antes de su expiración.',
      ganttImpact: 'Alerta autónoma disparada a los 45 días con generación de borrador de prórroga.'
    }
  ];

  const currentClause = $derived(sampleClauses[activeClauseIndex]);
</script>

<section id="legal" class="py-20 border-t border-[#2f2f3b]/70 bg-[#17171d]/50">
  <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
    <!-- Header -->
    <div class="max-w-3xl mb-12">
      <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/25 text-cyan-400 text-[11px] font-mono font-semibold tracking-wider mb-4">
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

    <!-- Main Grid: Features & Interactive Clause/Gantt Inspector -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      <!-- Feature Points (5 cols) -->
      <div class="lg:col-span-5 space-y-6">
        <div class="z-card p-6 border border-[#3d3d4b]/70">
          <div class="flex items-start gap-4">
            <div class="w-8 h-8 rounded-lg bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-bold font-mono text-sm shrink-0">
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
            <div class="w-8 h-8 rounded-lg bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-bold font-mono text-sm shrink-0">
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
            <div class="w-8 h-8 rounded-lg bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-bold font-mono text-sm shrink-0">
              03
            </div>
            <div>
              <h3 class="text-base font-bold text-white mb-1.5">{t.feature3Title}</h3>
              <p class="text-xs text-zinc-400 leading-relaxed font-sans">{t.feature3Desc}</p>
            </div>
          </div>
        </div>

        <!-- Metric Callout -->
        <div class="p-6 rounded-2xl bg-gradient-to-r from-cyan-950/40 to-[#1c1c22] border border-cyan-800/40 flex items-center justify-between">
          <div>
            <div class="text-3xl font-extrabold font-mono text-cyan-300">{t.metricStat}</div>
            <div class="text-xs text-zinc-400 font-medium">{t.metricLabel}</div>
          </div>
          <span class="text-xs font-mono px-3 py-1 bg-cyan-500/20 text-cyan-300 rounded border border-cyan-500/40">
            Audit Trail Activo
          </span>
        </div>
      </div>

      <!-- Interactive Clause Audit & Gantt Simulator (7 cols) -->
      <div class="lg:col-span-7">
        <div class="rounded-2xl border border-[#3d3d4b] bg-[#141418] overflow-hidden shadow-xl">
          <!-- Top bar with Clause Selectors -->
          <div class="bg-[#1c1c22] px-5 py-3 border-b border-[#2f2f3b] flex items-center justify-between">
            <span class="text-xs font-mono text-zinc-300 font-bold uppercase tracking-wider">
              Auditor de Cláusulas & Gantt Algorítmica
            </span>
            <span class="text-[11px] font-mono text-zinc-500">Concesión Vial 2024</span>
          </div>

          <!-- Selectors -->
          <div class="flex border-b border-[#24242e] bg-[#0e0e12] overflow-x-auto" data-testid="clause-buttons">
            {#each sampleClauses as clause, idx}
              <button
                type="button"
                data-testid={`clause-btn-${idx}`}
                onclick={() => (activeClauseIndex = idx)}
                class="px-4 py-3 text-xs font-mono text-left whitespace-nowrap transition cursor-pointer border-b-2 {activeClauseIndex === idx ? 'border-cyan-400 text-white bg-[#1a1a22]' : 'border-transparent text-zinc-400 hover:text-white'}"
              >
                {clause.ref}
              </button>
            {/each}
          </div>

          <!-- Clause Detail Card -->
          <div class="p-6 space-y-5 bg-[#121216]">
            <div class="flex flex-wrap items-center justify-between gap-3">
              <div>
                <span class="text-[11px] font-mono text-cyan-400 font-bold uppercase">{currentClause.ref}</span>
                <h4 class="text-lg font-bold text-white">{currentClause.title}</h4>
              </div>
              <div class="flex items-center gap-2 font-mono text-xs">
                <span class="px-2.5 py-1 rounded bg-red-500/10 text-red-400 border border-red-500/30">
                  Riesgo: {currentClause.risk}
                </span>
                <span class="px-2.5 py-1 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30">
                  {currentClause.penalty}
                </span>
              </div>
            </div>

            <!-- Extracted text from PDF -->
            <div class="rounded-xl bg-[#09090c] p-4 border border-[#2a2a36] font-mono text-xs text-zinc-300 leading-relaxed">
              <span class="text-zinc-500 block text-[10px] uppercase tracking-wider mb-1">Texto Extraído por Agente OCR Semántico:</span>
              "{currentClause.extractedText}"
            </div>

            <!-- Gantt Impact Simulation -->
            <div class="rounded-xl bg-cyan-950/20 p-4 border border-cyan-800/30 font-mono text-xs space-y-2">
              <div class="flex items-center justify-between text-cyan-300 font-bold">
                <span class="flex items-center gap-2">
                  <span class="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
                  Impacto en Carta Gantt Automatizada:
                </span>
                <span class="text-[11px] text-zinc-400">456 Nodos Conectados</span>
              </div>
              <p class="text-zinc-300 font-sans text-xs">
                {currentClause.ganttImpact}
              </p>

              <!-- Gantt Bar simulation -->
              <div class="pt-2">
                <div class="flex justify-between text-[10px] text-zinc-500 font-mono mb-1">
                  <span>Día 0</span>
                  <span>Fundaciones Estructurales</span>
                  <span>Día 48 (Montaje)</span>
                </div>
                <div class="w-full h-3 rounded-full bg-zinc-800 overflow-hidden flex">
                  <div class="h-full bg-cyan-500" style="width: 45%;"></div>
                  <div class="h-full bg-orange-500 animate-pulse" style="width: 15%;"></div>
                  <div class="h-full bg-zinc-700" style="width: 40%;"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>
