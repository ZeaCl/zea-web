<script lang="ts">
  import { slide } from 'svelte/transition';
  import Header from '$lib/components/layout/Header.svelte';
  import ZeaLogo from '$lib/components/atoms/ZeaLogo.svelte';
  import MobileSimulator from '$lib/components/interactive/MobileSimulator.svelte';
  import ZeaContactDrawer from '$lib/components/interactive/ZeaContactDrawer.svelte';
  import { content, type Language } from '$lib/config/i18n';

  let lang = $state<Language>('es');
  let platform = $state<'ios' | 'android'>('ios');
  let activePillar = $state<'none' | 'edge' | 'sport' | 'venture' | 'default' | 'glia'>('venture');
  let showVerticals = $state(true);
  let isContactDrawerOpen = $state(false);
  let selectedContactFocus = $state<'industrial' | 'sport' | 'funds' | 'core'>('funds');
  const t = $derived(content[lang]);

  let skills = $state({
    audio: false,
    vision: false,
    security: false
  });

  function openContact(focus: 'industrial' | 'sport' | 'funds' | 'core' = 'funds') {
    selectedContactFocus = focus;
    isContactDrawerOpen = true;
  }

  function handleGliaClick() {
    showVerticals = true;
    activePillar = 'glia';
    skills.vision = false;
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
      <!-- Left Column: Contextual Stage (Manifesto + Productos + Verticales) -->
      <div class="w-full lg:col-span-6 flex flex-col justify-center space-y-7">
        <div class="space-y-6 text-left">
          <!-- ZEA Manifesto Block (Left Dotted Rule + ZEA Logo + Body Text) -->
          <div class="border-l border-dotted border-white/35 pl-4 sm:pl-5 py-0.5 space-y-2">
            <ZeaLogo class="h-4 sm:h-4.5 w-auto text-white" />
            <p class="font-sans text-[13.5px] sm:text-[14px] text-zinc-400 font-normal leading-relaxed max-w-lg pt-0.5">
              {lang === 'es'
                ? 'Desarrollamos bases técnicas profundas para impulsar productos propios en entretenimiento interactivo, operaciones especializadas y sistemas del mundo real.'
                : 'We engineer deep technical foundations to power proprietary products across interactive entertainment, specialized operations, and real-world systems.'}
            </p>
          </div>

          <!-- 1. Productos (Glia) -->
          <div class="pt-1">
            <span class="block text-[11.5px] font-sans text-zinc-500 font-medium mb-2.5">
              {lang === 'es' ? 'Productos' : 'Products'}
            </span>
            <div class="border-t border-white/[0.08] pt-3">
              <div class="grid grid-cols-3 gap-2.5">
                <button
                  type="button"
                  onclick={handleGliaClick}
                  class="text-left group cursor-pointer transition flex flex-col"
                  data-testid="core-glia"
                >
                  <span class="text-xs font-semibold flex items-center gap-1.5 transition {activePillar === 'glia' || showVerticals ? 'text-white underline underline-offset-4 decoration-white/40' : 'text-zinc-300 group-hover:text-white'}">
                    <span>Glia</span>
                    <span class="text-[10px] text-zinc-500 font-sans transition-transform duration-200 {showVerticals ? 'rotate-90 text-zinc-300' : ''}">›</span>
                  </span>
                  <span class="text-[11px] text-zinc-400 block mt-1 font-sans leading-snug">
                    {#if lang === 'es'}
                      Infraestructura de<br />
                      agentes autónomos para<br />
                      operaciones complejas
                    {:else}
                      Autonomous agent<br />
                      infrastructure for<br />
                      complex operations
                    {/if}
                  </span>
                </button>
              </div>
            </div>
          </div>

          <!-- 2. Verticales Operativas (Desplegadas al hacer click en Glia) -->
          {#if showVerticals}
            <div class="pt-1" transition:slide={{ duration: 180 }}>
              <span class="block text-[11.5px] font-sans text-zinc-500 font-medium mb-2.5">
                {t.mobilePlatform.industriesLabel}
              </span>
              <div class="grid grid-cols-3 gap-2.5 border-t border-white/[0.08] pt-3">
                <button
                  type="button"
                  onclick={() => (activePillar = 'venture')}
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

                <button
                  type="button"
                  onclick={() => (activePillar = 'edge')}
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
                  onclick={() => (activePillar = 'sport')}
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
              </div>
            </div>
          {/if}
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
