<script lang="ts">
  import ZeaLogo from '../atoms/ZeaLogo.svelte';
  import GitHubLogo from '../atoms/GitHubLogo.svelte';
  import AppleLogo from '../atoms/AppleLogo.svelte';
  import AndroidLogo from '../atoms/AndroidLogo.svelte';
  import { type Language } from '../../config/i18n';

  let {
    lang = $bindable<'es' | 'en'>('es'),
    platform = $bindable<'ios' | 'android'>('ios')
  }: {
    lang?: Language;
    platform?: 'ios' | 'android';
  } = $props();

  function toggleLang() {
    lang = lang === 'es' ? 'en' : 'es';
  }
</script>

<header class="sticky top-0 z-50 w-full border-b border-[#2f2f3b]/80 bg-[#1c1c22]/90 backdrop-blur-md">
  <div class="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6 lg:px-8">
    <!-- Brand: Solo letras ZEA tal cual en glia-web -->
    <a href="/" class="flex items-center gap-2.5 transition" aria-label="ZEA">
      <ZeaLogo class="h-4 w-auto text-white" />
    </a>

    <!-- Right Actions: GitHub Icon + Iconos Sueltos Apple/Android + Switch de Idioma estilo iOS -->
    <div class="flex items-center gap-4">
      <!-- GitHub Link Icon sin marcos -->
      <a
        href="https://github.com/ZeaCl"
        target="_blank"
        rel="noopener noreferrer"
        class="text-zinc-400 hover:text-white transition p-1 flex items-center justify-center cursor-pointer"
        aria-label="GitHub"
        data-testid="github-link"
      >
        <GitHubLogo class="h-4 w-auto" />
      </a>

      <!-- Platform Switcher: Solo los iconos sin marcos ni cajas -->
      <div class="flex items-center gap-2.5">
        <button
          type="button"
          onclick={() => (platform = 'ios')}
          data-testid="header-tab-ios"
          aria-label="Apple iOS"
          class="transition-all duration-200 cursor-pointer p-1 flex items-center justify-center {platform === 'ios' ? 'text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.6)] scale-110' : 'text-zinc-500 hover:text-zinc-300'}"
        >
          <AppleLogo class="h-4 w-auto" />
        </button>

        <button
          type="button"
          onclick={() => (platform = 'android')}
          data-testid="header-tab-android"
          aria-label="Android"
          class="transition-all duration-200 cursor-pointer p-1 flex items-center justify-center {platform === 'android' ? 'text-[#3ddc84] drop-shadow-[0_0_8px_rgba(61,220,132,0.6)] scale-110' : 'text-zinc-500 hover:text-zinc-300'}"
        >
          <AndroidLogo class="h-4 w-auto" />
        </button>
      </div>

      <!-- Language Selector: Switch estilo iOS con texto ES | ENG limpio -->
      <div class="flex items-center gap-2 font-mono text-xs select-none" data-testid="lang-switcher-container">
        <button
          type="button"
          onclick={() => (lang = 'es')}
          data-testid="lang-btn-es"
          class="transition cursor-pointer text-xs {lang === 'es' ? 'text-white font-bold' : 'text-zinc-500 hover:text-zinc-300'}"
        >
          ES
        </button>

        <!-- Switch iOS -->
        <button
          type="button"
          role="switch"
          aria-checked={lang === 'en'}
          aria-label="Cambiar idioma entre ES y ENG"
          onclick={toggleLang}
          data-testid="ios-lang-switch"
          class="relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out p-0.5 border border-white/10 {lang === 'en' ? 'bg-[#34c759]' : 'bg-[#393941]'}"
        >
          <span
            class="pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out {lang === 'en' ? 'translate-x-4' : 'translate-x-0'}"
          ></span>
        </button>

        <button
          type="button"
          onclick={() => (lang = 'en')}
          data-testid="lang-btn-en"
          class="transition cursor-pointer text-xs {lang === 'en' ? 'text-white font-bold' : 'text-zinc-500 hover:text-zinc-300'}"
        >
          ENG
        </button>
      </div>
    </div>
  </div>
</header>
