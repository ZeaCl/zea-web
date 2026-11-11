<script lang="ts">
  import Header from '$lib/components/layout/Header.svelte';
  import MobileSimulator from '$lib/components/interactive/MobileSimulator.svelte';
  import ZeaContactDrawer from '$lib/components/interactive/ZeaContactDrawer.svelte';
  import { content, type Language } from '$lib/config/i18n';

  let lang = $state<Language>('es');
  let platform = $state<'ios' | 'android'>('ios');
  let activePillar = $state<'none' | 'edge' | 'sport' | 'venture' | 'default' | 'glia'>('edge');
  let isContactDrawerOpen = $state(false);
  let selectedContactFocus = $state<'industrial' | 'sport' | 'funds' | 'core'>('industrial');
  const t = $derived(content[lang]);

  let skills = $state({
    audio: false,
    vision: false,
    security: false
  });

  function openContact(focus: 'industrial' | 'sport' | 'funds' | 'core' = 'industrial') {
    selectedContactFocus = focus;
    isContactDrawerOpen = true;
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
  <!-- Minimalist Header with pure typography ZEA Logo, Get Started CTA, and Right Utility Actions -->
  <Header
    bind:lang
    bind:platform
    onGetStarted={() => openContact(activePillar === 'edge' ? 'industrial' : (activePillar === 'sport' ? 'sport' : (activePillar === 'venture' ? 'funds' : 'core')))}
  />

  <!-- Center Experience: Contextual Stage + Mobile Simulator -->
  <main class="flex-1 w-full flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-6 relative overflow-hidden">
    <!-- Ambient subtle background glow -->
    <div class="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-emerald-500/5 blur-[140px]"></div>

    <!-- Main Grid: Left Column Contextual View + Right Mobile Simulator -->
    <div class="relative z-10 w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center justify-center">
      <!-- Left Column: Contextual Stage (Verticales + Plataforma Core) -->
      <div class="w-full lg:col-span-6 flex flex-col justify-center space-y-6">
        <div class="space-y-4 text-left">
          <h1 class="text-4xl sm:text-5xl lg:text-5xl font-extrabold leading-[1.08] tracking-[-0.03em] text-white">
            <span class="text-white">{t.mobilePlatform.titlePrefix}</span><span class="z-gradient-text">{t.mobilePlatform.titleHighlight}</span>
          </h1>

          <!-- 1. Verticales Operativas (Industrial, Sport, Funds) -->
          <div class="pt-2">
            <span class="block text-[10.5px] font-mono uppercase tracking-widest text-zinc-500 font-semibold mb-2.5">
              {t.mobilePlatform.industriesLabel}
            </span>
            <div class="grid grid-cols-3 gap-2.5 border-t border-white/[0.08] pt-3">
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

          <!-- 2. Plataforma Core (Glia, Thalamus, Cerebelum, Occipital) -->
          <div class="pt-4">
            <span class="block text-[10.5px] font-mono uppercase tracking-widest text-zinc-500 font-semibold mb-2.5">
              {lang === 'es' ? 'Plataforma Core' : 'Platform Core'}
            </span>
            <div class="grid grid-cols-4 gap-2.5 border-t border-white/[0.08] pt-3">
              <button
                type="button"
                onclick={() => { activePillar = 'glia'; skills.vision = false; }}
                class="text-left group cursor-pointer transition"
                data-testid="core-glia"
              >
                <span class="text-xs font-semibold block transition {activePillar === 'glia' ? 'text-white underline underline-offset-4 decoration-white/40' : 'text-zinc-300 group-hover:text-white'}">
                  Glia
                </span>
                <span class="text-[11px] text-zinc-400 block mt-0.5 font-sans leading-tight">
                  Multi-Agent Engine
                </span>
              </button>

              <button
                type="button"
                onclick={() => { activePillar = 'glia'; skills.security = !skills.security; skills.vision = false; }}
                class="text-left group cursor-pointer transition"
                data-testid="core-thalamus"
              >
                <span class="text-xs font-semibold block transition {skills.security ? 'text-white underline underline-offset-4 decoration-white/40' : 'text-zinc-300 group-hover:text-white'}">
                  Thalamus
                </span>
                <span class="text-[11px] text-zinc-400 block mt-0.5 font-sans leading-tight">
                  Auth & Enclave
                </span>
              </button>

              <button
                type="button"
                onclick={() => { activePillar = 'glia'; skills.vision = false; }}
                class="text-left group cursor-pointer transition"
                data-testid="core-cerebelum"
              >
                <span class="text-xs font-semibold block transition text-zinc-300 group-hover:text-white">
                  Cerebelum
                </span>
                <span class="text-[11px] text-zinc-400 block mt-0.5 font-sans leading-tight">
                  Workflows Engine
                </span>
              </button>

              <button
                type="button"
                onclick={() => { skills.vision = !skills.vision; }}
                class="text-left group cursor-pointer transition"
                data-testid="core-occipital"
              >
                <span class="text-xs font-semibold block transition {skills.vision ? 'text-white underline underline-offset-4 decoration-white/40' : 'text-zinc-300 group-hover:text-white'}">
                  Occipital
                </span>
                <span class="text-[11px] text-zinc-400 block mt-0.5 font-sans leading-tight">
                  Vision & Image AI
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Column: Mobile Simulator -->
      <div class="w-full lg:col-span-6 flex flex-col items-center justify-center">
        <MobileSimulator
          {lang}
          {platform}
          bind:skills={skills}
          bind:activePillar={activePillar}
          activeNav="industries"
        />
      </div>
    </div>
  </main>

  <!-- Palantir-style Contact / Demo Request Slide-Over Drawer with Titanium Phone Tokens -->
  <ZeaContactDrawer
    isOpen={isContactDrawerOpen}
    {lang}
    initialFocus={selectedContactFocus}
    onClose={() => (isContactDrawerOpen = false)}
  />
</div>
