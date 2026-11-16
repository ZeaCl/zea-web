<script lang="ts">
  import Header from '$lib/components/layout/Header.svelte';
  import ZeaLogo from '$lib/components/atoms/ZeaLogo.svelte';
  import MobileSimulator from '$lib/components/interactive/MobileSimulator.svelte';
  import ZeaContactDrawer from '$lib/components/interactive/ZeaContactDrawer.svelte';
  import { content, type Language } from '$lib/config/i18n';

  let lang = $state<Language>('es');
  let platform = $state<'ios' | 'android'>('ios');
  let activePillar = $state<'none' | 'edge' | 'sport' | 'venture' | 'default' | 'glia'>('venture');
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
          <!-- ZEA Manifesto Block (Left Dotted Rule + ZEA Logo + Subtítulo + Body Text) -->
          <div class="border-l border-dotted border-white/35 pl-4 sm:pl-5 py-0.5 space-y-1.5">
            <ZeaLogo class="h-4 sm:h-4.5 w-auto text-white" />
            <h1 class="font-sans text-[15px] sm:text-[16px] font-semibold tracking-[-0.01em] text-white leading-snug pt-0.5">
              {lang === 'es' ? 'Laboratorio de tecnología y productos.' : 'Technology & product lab.'}
            </h1>
            <p class="font-sans text-[13.5px] sm:text-[14px] text-zinc-400 font-normal leading-relaxed max-w-lg pt-0.5">
              {lang === 'es'
                ? 'Invertimos en explorar, para construir la tecnología que navega operaciones complejas y sistemas del mundo real.'
                : 'We invest in exploring, to build the technology that navigates complex operations and real-world systems.'}
            </p>
          </div>

          <!-- Productos (Funds, Industrial, Sport) -->
          <div class="pt-1">
            <span class="block text-[11.5px] font-sans text-zinc-500 font-medium mb-2.5">
              {lang === 'es' ? 'Productos' : 'Products'}
            </span>
            <div class="grid grid-cols-3 gap-2.5 border-t border-white/[0.08] pt-3">
              <button
                type="button"
                onclick={() => (activePillar = 'venture')}
                class="text-left group cursor-pointer transition"
                data-testid="pillar-venture"
              >
                <span class="hv-serif text-[16px] sm:text-[17px] font-normal leading-none block transition {activePillar === 'venture' ? 'text-white underline underline-offset-4 decoration-white/40' : 'text-zinc-300 hover:text-white'}">
                  {t.mobilePlatform.pillars.venture.title}
                </span>
                <span class="text-[11px] text-zinc-300 font-medium block mt-2 font-sans leading-tight">
                  {t.mobilePlatform.pillars.venture.label}
                </span>
                <span class="text-[10px] text-zinc-400 block mt-1 font-sans leading-tight whitespace-pre-line">
                  {t.mobilePlatform.pillars.venture.desc}
                </span>
              </button>

              <button
                type="button"
                onclick={() => (activePillar = 'edge')}
                class="text-left group cursor-pointer transition"
                data-testid="pillar-edge"
              >
                <span class="inline-flex items-baseline leading-none text-[13px] font-bold tracking-[0.12em] uppercase transition {activePillar === 'edge' ? 'text-white underline underline-offset-4 decoration-white/40' : 'text-zinc-300 hover:text-white'}">
                  <span class="sr-only">{t.mobilePlatform.pillars.edge.title}</span>
                  <span aria-hidden="true" class="inline-flex items-baseline">
                    <span>ALLIS</span><span class="box-3d-dark ml-[1.5px]">BOX</span>
                  </span>
                </span>
                <span class="text-[11px] text-zinc-300 font-medium block mt-2 font-sans leading-tight">
                  {t.mobilePlatform.pillars.edge.label}
                </span>
                <span class="text-[10px] text-zinc-400 block mt-1 font-sans leading-tight whitespace-pre-line">
                  {t.mobilePlatform.pillars.edge.desc}
                </span>
              </button>

              <button
                type="button"
                onclick={() => (activePillar = 'sport')}
                class="text-left group cursor-pointer transition"
                data-testid="pillar-sport"
              >
                <span class="inline-flex items-baseline gap-1.5 -skew-x-6 leading-none transition {activePillar === 'sport' ? 'underline underline-offset-4 decoration-white/40' : ''}">
                  <span class="font-black italic uppercase tracking-tight text-[15px] sm:text-[16px] text-white font-sans">
                    GUS
                  </span>
                  <span class="font-bold uppercase tracking-[0.16em] text-[10.5px] text-[#FA7343] font-mono">
                    TRAINING
                  </span>
                </span>
                <span class="text-[11px] text-zinc-300 font-medium block mt-2 font-sans leading-tight">
                  {t.mobilePlatform.pillars.sport.label}
                </span>
                <span class="text-[10px] text-zinc-400 block mt-1 font-sans leading-tight whitespace-pre-line">
                  {t.mobilePlatform.pillars.sport.desc}
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
