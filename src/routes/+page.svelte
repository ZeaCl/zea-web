<script lang="ts">
  import Header from '$lib/components/layout/Header.svelte';
  import MobileSimulator from '$lib/components/interactive/MobileSimulator.svelte';
  import CodeEditorSnippet, { type ActiveSkills } from '$lib/components/interactive/CodeEditorSnippet.svelte';
  import { content, type Language } from '$lib/config/i18n';

  let lang = $state<Language>('es');
  let platform = $state<'ios' | 'android'>('ios');
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
  <!-- Minimalist Header with pure typography ZEA Logo, naked Apple/Android icons, and iOS switch -->
  <Header bind:lang bind:platform />

  <!-- Center Experience: Dev Magic (Dynamic Code Snippet + Mobile Simulator Mutating in Real-Time) -->
  <main class="flex-1 w-full flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-6 relative overflow-hidden">
    <!-- Ambient subtle background glow -->
    <div class="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-emerald-500/5 blur-[140px]"></div>

    <!-- Dev Magic Stage: Code + Superpower Activators + Live Native Simulator -->
    <div class="relative z-10 w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center justify-center">
      <!-- Left: Code Editor Snippet with Minimalist Superpower Activator Icons -->
      <div class="w-full lg:col-span-6 flex flex-col justify-center">
        <CodeEditorSnippet
          {platform}
          {skills}
          onToggleSkill={toggleSkill}
        />
      </div>

      <!-- Right: Mobile Simulator reacting live to Code, Platform, Language, and Superpowers -->
      <div class="w-full lg:col-span-6 flex flex-col items-center justify-center">
        <MobileSimulator
          {lang}
          {platform}
          bind:skills={skills}
        />
      </div>
    </div>
  </main>
</div>
