<script lang="ts">
  import Header from '$lib/components/layout/Header.svelte';
  import MobileSimulator from '$lib/components/interactive/MobileSimulator.svelte';
  import CodeEditorSnippet, { type ActiveSkills } from '$lib/components/interactive/CodeEditorSnippet.svelte';
  import { content, type Language } from '$lib/config/i18n';

  let lang = $state<Language>('es');
  let platform = $state<'ios' | 'android'>('ios');
  let activeNav = $state<'products' | 'industries' | 'developer'>('industries');
  let activePillar = $state<'none' | 'edge' | 'sport' | 'venture'>('none');
  const t = $derived(content[lang]);

  let skills = $state<ActiveSkills>({
    audio: false,
    vision: false,
    security: false
  });

  function toggleSkill(skill: keyof ActiveSkills) {
    skills[skill] = !skills[skill];
  }
</script>

<svelte:head>
  <title>{t.meta.title}</title>
  <meta name="description" content={t.meta.description} />
  <meta property="og:title" content={t.meta.title} />
  <meta property="og:description" content={t.meta.description} />
  <meta property="og:type" content="website" />
  <meta name="twitter:card" content="summary_large_image" />
</svelte:head>

<div class="relative min-h-screen w-full bg-[#141418] text-[#f4f4f6] flex flex-col selection:bg-emerald-500/30 selection:text-white">
  <!-- Minimalist Header with pure typography ZEA Logo, Products / Developer / Industries Nav, and Right Utility Actions -->
  <Header bind:lang bind:platform bind:activeNav />

  <!-- Center Experience: Contextual Stage + Mobile Simulator -->
  <main class="flex-1 w-full flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-6 relative overflow-hidden">
    <!-- Ambient subtle background glow -->
    <div class="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-emerald-500/5 blur-[140px]"></div>

    <!-- Main Grid: Left Column Contextual View + Right Mobile Simulator -->
    <div class="relative z-10 w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center justify-center">
      <!-- Left Column: Contextual based on activeNav (Products, Industries, Developer) -->
      <div class="w-full lg:col-span-6 flex flex-col justify-center space-y-6">
        {#if activeNav === 'developer'}
          <!-- Developer View: Code Editor Snippet & Runtime Info -->
          <div class="space-y-4 text-left">
            <div class="space-y-1.5">
              <span class="block text-[10.5px] font-mono uppercase tracking-widest text-zinc-500 font-semibold">
                {lang === 'es' ? 'Arquitectura para Desarrolladores' : 'Developer Architecture'}
              </span>
              <h1 class="text-3xl sm:text-4xl lg:text-4xl font-extrabold leading-[1.1] tracking-[-0.03em] text-white">
                <span class="text-white">Native </span><span class="z-gradient-text">Swift & Kotlin</span> Runtime
              </h1>
              <p class="text-sm text-zinc-400 font-sans leading-relaxed max-w-xl">
                {lang === 'es'
                  ? 'Runtime agéntico en el dispositivo sin servidores intermediarios. Ejecución en memoria, streaming reactivo y enclave criptográfico.'
                  : 'On-device agentic runtime with zero intermediary servers. In-memory execution, reactive streaming, and hardware cryptographic enclave.'}
              </p>
            </div>

            <!-- Code Editor Snippet with Minimalist Superpower Activator Icons -->
            <CodeEditorSnippet
              {platform}
              {skills}
              onToggleSkill={toggleSkill}
            />
          </div>
        {:else if activeNav === 'products'}
          <!-- Products View: Sovereign Product Suite -->
          <div class="space-y-5 text-left">
            <div>
              <span class="block text-[10.5px] font-mono uppercase tracking-widest text-zinc-500 font-semibold mb-2">
                {lang === 'es' ? 'Suite de Productos' : 'Product Suite'}
              </span>
              <h1 class="text-4xl sm:text-5xl lg:text-5xl font-extrabold leading-[1.08] tracking-[-0.03em] text-white">
                <span class="text-white">The Mobile-Native </span><span class="z-gradient-text">AI Platform</span>
              </h1>
            </div>

            <div class="space-y-3 pt-1">
              <button
                type="button"
                onclick={() => { activeNav = 'industries'; activePillar = 'edge'; }}
                class="w-full text-left p-3.5 rounded-2xl bg-[#16161D]/80 border border-white/[0.06] hover:border-white/20 transition cursor-pointer"
              >
                <div class="flex items-center justify-between">
                  <span class="text-sm font-bold text-white tracking-tight">ZEA Edge</span>
                  <span class="text-[10.5px] font-mono text-zinc-400">Industrial</span>
                </div>
                <p class="text-xs text-zinc-400 mt-1 font-sans leading-relaxed">
                  {lang === 'es'
                    ? 'Operaciones y certificaciones de faena 100% offline. Visión artificial y checklists por voz para terreno.'
                    : '100% offline field operations and compliance. Computer vision and voice-driven field checklists.'}
                </p>
              </button>

              <button
                type="button"
                onclick={() => { activeNav = 'industries'; activePillar = 'sport'; }}
                class="w-full text-left p-3.5 rounded-2xl bg-[#16161D]/80 border border-white/[0.06] hover:border-white/20 transition cursor-pointer"
              >
                <div class="flex items-center justify-between">
                  <span class="text-sm font-bold text-white tracking-tight">ZEA Sport</span>
                  <span class="text-[10.5px] font-mono text-zinc-400">Athletic</span>
                </div>
                <p class="text-xs text-zinc-400 mt-1 font-sans leading-relaxed">
                  {lang === 'es'
                    ? 'Análisis biomecánico en tiempo real para deportistas y entrenadores. Detección de técnica y conteo de repeticiones.'
                    : 'Real-time on-device biomechanics for athletes and coaches. Technique validation and repetition tracking.'}
                </p>
              </button>

              <button
                type="button"
                onclick={() => { activeNav = 'industries'; activePillar = 'venture'; }}
                class="w-full text-left p-3.5 rounded-2xl bg-[#16161D]/80 border border-white/[0.06] hover:border-white/20 transition cursor-pointer"
              >
                <div class="flex items-center justify-between">
                  <span class="text-sm font-bold text-white tracking-tight">ZEA Funds</span>
                  <span class="text-[10.5px] font-mono text-zinc-400">Private Funds</span>
                </div>
                <p class="text-xs text-zinc-400 mt-1 font-sans leading-relaxed">
                  {lang === 'es'
                    ? 'Gobernanza de capital privado desde el móvil. Conciliaciones con custodio y firma de llamadas de capital con FaceID.'
                    : 'Mobile-first private capital governance. Custodian reconciliations and FaceID capital call approvals.'}
                </p>
              </button>
            </div>
          </div>
        {:else}
          <!-- Industries View (Main): The Interactive Industries Stage -->
          <div class="space-y-4 text-left">
            <h1 class="text-4xl sm:text-5xl lg:text-5xl font-extrabold leading-[1.08] tracking-[-0.03em] text-white">
              <span class="text-white">{t.mobilePlatform.titlePrefix}</span><span class="z-gradient-text">{t.mobilePlatform.titleHighlight}</span>
            </h1>

            <!-- Industries Section (Estilo Claude / Anthropic) -->
            <div class="pt-2">
              <span class="block text-[10.5px] font-mono uppercase tracking-widest text-zinc-500 font-semibold mb-2.5">
                {t.mobilePlatform.industriesLabel}
              </span>
              <div class="grid grid-cols-3 gap-4 border-t border-white/[0.08] pt-3">
                <button
                  type="button"
                  onclick={() => activePillar = 'edge'}
                  class="text-left group cursor-pointer transition"
                  data-testid="pillar-edge"
                >
                  <span class="text-xs font-semibold block transition {activePillar === 'edge' ? 'text-white underline underline-offset-4 decoration-white/40' : 'text-zinc-300 hover:text-white'}">
                    {t.mobilePlatform.pillars.edge.title}
                  </span>
                  <span class="text-[11px] text-zinc-400 block mt-0.5 font-sans">
                    {t.mobilePlatform.pillars.edge.label}
                  </span>
                </button>

                <button
                  type="button"
                  onclick={() => activePillar = 'sport'}
                  class="text-left group cursor-pointer transition"
                  data-testid="pillar-sport"
                >
                  <span class="text-xs font-semibold block transition {activePillar === 'sport' ? 'text-white underline underline-offset-4 decoration-white/40' : 'text-zinc-300 hover:text-white'}">
                    {t.mobilePlatform.pillars.sport.title}
                  </span>
                  <span class="text-[11px] text-zinc-400 block mt-0.5 font-sans">
                    {t.mobilePlatform.pillars.sport.label}
                  </span>
                </button>

                <button
                  type="button"
                  onclick={() => activePillar = 'venture'}
                  class="text-left group cursor-pointer transition"
                  data-testid="pillar-venture"
                >
                  <span class="text-xs font-semibold block transition {activePillar === 'venture' ? 'text-white underline underline-offset-4 decoration-white/40' : 'text-zinc-300 hover:text-white'}">
                    {t.mobilePlatform.pillars.venture.title}
                  </span>
                  <span class="text-[11px] text-zinc-400 block mt-0.5 font-sans">
                    {t.mobilePlatform.pillars.venture.label}
                  </span>
                </button>
              </div>
            </div>
          </div>
        {/if}
      </div>

      <!-- Right: Mobile Simulator reacting live to Code, Platform, Language, and Superpowers -->
      <div class="w-full lg:col-span-6 flex flex-col items-center justify-center">
        <MobileSimulator
          {lang}
          {platform}
          bind:skills={skills}
          {activePillar}
        />
      </div>
    </div>
  </main>
</div>
