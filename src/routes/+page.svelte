<script lang="ts">
  import Header from '$lib/components/layout/Header.svelte';
  import MobileSimulator from '$lib/components/interactive/MobileSimulator.svelte';
  import CodeEditorSnippet, { type ActiveSkills } from '$lib/components/interactive/CodeEditorSnippet.svelte';
  import { content, type Language } from '$lib/config/i18n';

  let lang = $state<Language>('es');
  let platform = $state<'ios' | 'android'>('ios');
  let activeNav = $state<'products' | 'industries' | 'developer'>('industries');
  let activePillar = $state<'none' | 'edge' | 'sport' | 'venture' | 'default'>('default');
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
          <!-- Platform Core & Verticals View -->
          <div class="space-y-6 text-left max-h-[calc(100vh-130px)] overflow-y-auto pr-2 scroll-smooth">
            <!-- 1. COMPONENTE CORE / PLATFORM (PRIMERO) -->
            <div class="space-y-3.5">
              <div>
                <span class="block text-[10.5px] font-mono uppercase tracking-widest text-zinc-500 font-semibold mb-1.5">
                  {lang === 'es' ? 'Plataforma Core' : 'Core Platform'}
                </span>
                <h1 class="text-3xl sm:text-4xl font-extrabold leading-[1.1] tracking-[-0.03em] text-white">
                  <span class="text-white">The Mobile-Native </span><span class="z-gradient-text">AI Platform</span>
                </h1>
                <p class="text-xs text-zinc-400 font-sans leading-relaxed mt-1">
                  {lang === 'es'
                    ? 'Infraestructura soberana y runtime nativo para operaciones móviles de alta exigencia.'
                    : 'Sovereign infrastructure and native runtime engineered for mission-critical mobile operations.'}
                </p>
              </div>

              <div class="space-y-2.5 pt-0.5">
                <button
                  type="button"
                  onclick={() => (activeNav = 'developer')}
                  class="w-full text-left p-3.5 rounded-2xl bg-[#16161D]/80 border border-white/[0.06] hover:border-white/20 transition cursor-pointer group"
                >
                  <div class="flex items-center justify-between">
                    <span class="text-sm font-bold text-white tracking-tight group-hover:text-emerald-400 transition">Multi-Agent Engine</span>
                    <span class="text-[10.5px] font-mono text-zinc-400">AI Agents</span>
                  </div>
                  <p class="text-xs text-zinc-400 mt-1 font-sans leading-relaxed">
                    {lang === 'es'
                      ? 'Servidor agéntico y runtime distribuido Glia para orquestar redes de agentes colaborativos con memoria y herramientas.'
                      : 'Glia agentic server and distributed runtime to orchestrate collaborative agent networks with memory and tools.'}
                  </p>
                </button>

                <button
                  type="button"
                  onclick={() => (activeNav = 'developer')}
                  class="w-full text-left p-3.5 rounded-2xl bg-[#16161D]/80 border border-white/[0.06] hover:border-white/20 transition cursor-pointer group"
                >
                  <div class="flex items-center justify-between">
                    <span class="text-sm font-bold text-white tracking-tight group-hover:text-emerald-400 transition">ZEA Cloud</span>
                    <span class="text-[10.5px] font-mono text-zinc-400">Control Plane & Sync</span>
                  </div>
                  <p class="text-xs text-zinc-400 mt-1 font-sans leading-relaxed">
                    {lang === 'es'
                      ? 'Autenticación soberana (IAM), orquestación de workflows deterministas, telemetría de activos y sincronización multi-tenant.'
                      : 'Sovereign IAM authentication, deterministic workflow orchestration, real-time asset telemetry, and multi-tenant synchronization.'}
                  </p>
                </button>

                <button
                  type="button"
                  onclick={() => (activeNav = 'developer')}
                  class="w-full text-left p-3.5 rounded-2xl bg-[#16161D]/80 border border-white/[0.06] hover:border-white/20 transition cursor-pointer group"
                >
                  <div class="flex items-center justify-between">
                    <span class="text-sm font-bold text-white tracking-tight group-hover:text-emerald-400 transition">ZEA Edge</span>
                    <span class="text-[10.5px] font-mono text-zinc-400">On-Device Runtime</span>
                  </div>
                  <p class="text-xs text-zinc-400 mt-1 font-sans leading-relaxed">
                    {lang === 'es'
                      ? 'Runtime en Swift y Kotlin 100% offline, visión computacional en el dispositivo, Secure Enclave y latencia menor a 20ms.'
                      : 'Native Swift and Kotlin runtime running 100% offline, on-device vision AI, hardware Secure Enclave, and sub-20ms latency.'}
                  </p>
                </button>
              </div>
            </div>

            <!-- 2. COMPONENTE VERTICALES OPERATIVAS (SEGUNDO) -->
            <div class="space-y-3.5 pt-4 border-t border-white/[0.08]">
              <div>
                <span class="block text-[10.5px] font-mono uppercase tracking-widest text-zinc-500 font-semibold mb-1.5">
                  {lang === 'es' ? 'Soluciones de Industria' : 'Industry Solutions'}
                </span>
                <h2 class="text-2xl sm:text-3xl font-extrabold leading-[1.12] tracking-[-0.03em] text-white">
                  <span class="text-white">{lang === 'es' ? 'Verticales ' : 'Operational '}</span><span class="z-gradient-text">{lang === 'es' ? 'Operativas' : 'Verticals'}</span>
                </h2>
                <p class="text-xs text-zinc-400 font-sans leading-relaxed mt-1">
                  {lang === 'es'
                    ? 'Aplicaciones móviles diseñadas para flujos de trabajo críticos de negocio.'
                    : 'Turnkey mobile applications purpose-built for high-stakes operational workflows.'}
                </p>
              </div>

              <div class="space-y-2.5 pt-0.5">
                <button
                  type="button"
                  onclick={() => { activeNav = 'industries'; activePillar = 'edge'; }}
                  class="w-full text-left p-3.5 rounded-2xl bg-[#16161D]/80 border border-white/[0.06] hover:border-white/20 transition cursor-pointer"
                >
                  <div class="flex items-center justify-between">
                    <span class="text-sm font-bold text-white tracking-tight">ZEA Industrial</span>
                    <span class="text-[10.5px] font-mono text-zinc-400">Procesos & Faenas</span>
                  </div>
                  <p class="text-xs text-zinc-400 mt-1 font-sans leading-relaxed">
                    {lang === 'es'
                      ? 'Trazabilidad de faenas, control de calidad, partes diarios e inspección en terreno 100% offline para minería, acuicultura y obras civiles.'
                      : 'Field traceability, quality control, shift logs, and 100% offline inspections for mining, aquaculture, and civil works.'}
                  </p>
                </button>

                <button
                  type="button"
                  onclick={() => { activeNav = 'industries'; activePillar = 'sport'; }}
                  class="w-full text-left p-3.5 rounded-2xl bg-[#16161D]/80 border border-white/[0.06] hover:border-white/20 transition cursor-pointer"
                >
                  <div class="flex items-center justify-between">
                    <span class="text-sm font-bold text-white tracking-tight">ZEA Sport</span>
                    <span class="text-[10.5px] font-mono text-zinc-400">Sport Operations</span>
                  </div>
                  <p class="text-xs text-zinc-400 mt-1 font-sans leading-relaxed">
                    {lang === 'es'
                      ? 'Operaciones agénticas para academias y entidades deportivas. Gestión de entrenadores, control de asistencia y rendimiento.'
                      : 'Agentic operations for athletic academies and clubs. Centralized coach management, athlete attendance, and performance.'}
                  </p>
                </button>

                <button
                  type="button"
                  onclick={() => { activeNav = 'industries'; activePillar = 'venture'; }}
                  class="w-full text-left p-3.5 rounded-2xl bg-[#16161D]/80 border border-white/[0.06] hover:border-white/20 transition cursor-pointer"
                >
                  <div class="flex items-center justify-between">
                    <span class="text-sm font-bold text-white tracking-tight">ZEA Funds</span>
                    <span class="text-[10.5px] font-mono text-zinc-400">Private Capital</span>
                  </div>
                  <p class="text-xs text-zinc-400 mt-1 font-sans leading-relaxed">
                    {lang === 'es'
                      ? 'Gobernanza de capital privado desde el móvil. Conciliaciones con custodio y firma de llamadas de capital con FaceID.'
                      : 'Mobile-first private capital governance. Custodian reconciliations and FaceID capital call approvals.'}
                  </p>
                </button>
              </div>
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
              <div class="grid grid-cols-4 gap-2.5 border-t border-white/[0.08] pt-3">
                <button
                  type="button"
                  onclick={() => activePillar = 'default'}
                  class="text-left group cursor-pointer transition"
                  data-testid="pillar-core"
                >
                  <span class="text-xs font-semibold block transition {activePillar === 'default' ? 'text-white underline underline-offset-4 decoration-white/40' : 'text-zinc-300 hover:text-white'}">
                    ZEA Personal
                  </span>
                  <span class="text-[11px] text-zinc-400 block mt-0.5 font-sans leading-tight">
                    Personal AI
                  </span>
                </button>

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

            <!-- Platform Core Section (Mismo componente exacto repetido abajo) -->
            <div class="pt-4">
              <span class="block text-[10.5px] font-mono uppercase tracking-widest text-zinc-500 font-semibold mb-2.5">
                {lang === 'es' ? 'Plataforma Core' : 'Platform Core'}
              </span>
              <div class="grid grid-cols-4 gap-2.5 border-t border-white/[0.08] pt-3">
                <button
                  type="button"
                  onclick={() => (activeNav = 'developer')}
                  class="text-left group cursor-pointer transition"
                  data-testid="core-multiagent"
                >
                  <span class="text-xs font-semibold block transition text-zinc-300 group-hover:text-white group-hover:underline underline-offset-4 decoration-white/40">
                    Multi-Agent Engine
                  </span>
                  <span class="text-[11px] text-zinc-400 block mt-0.5 font-sans leading-tight">
                    AI Agents
                  </span>
                </button>

                <button
                  type="button"
                  onclick={() => (activeNav = 'developer')}
                  class="text-left group cursor-pointer transition"
                  data-testid="core-auth"
                >
                  <span class="text-xs font-semibold block transition text-zinc-300 group-hover:text-white group-hover:underline underline-offset-4 decoration-white/40">
                    Auth & IAM
                  </span>
                  <span class="text-[11px] text-zinc-400 block mt-0.5 font-sans leading-tight">
                    Secure Enclave
                  </span>
                </button>

                <button
                  type="button"
                  onclick={() => (activeNav = 'developer')}
                  class="text-left group cursor-pointer transition"
                  data-testid="core-workflows"
                >
                  <span class="text-xs font-semibold block transition text-zinc-300 group-hover:text-white group-hover:underline underline-offset-4 decoration-white/40">
                    Workflows
                  </span>
                  <span class="text-[11px] text-zinc-400 block mt-0.5 font-sans leading-tight">
                    Deterministic AI
                  </span>
                </button>

                <button
                  type="button"
                  onclick={() => (activeNav = 'developer')}
                  class="text-left group cursor-pointer transition"
                  data-testid="core-vision"
                >
                  <span class="text-xs font-semibold block transition text-zinc-300 group-hover:text-white group-hover:underline underline-offset-4 decoration-white/40">
                    Image AI
                  </span>
                  <span class="text-[11px] text-zinc-400 block mt-0.5 font-sans leading-tight">
                    On-Device Vision
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
          bind:activePillar={activePillar}
          {activeNav}
        />
      </div>
    </div>
  </main>
</div>
