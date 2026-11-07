<script lang="ts">
  import type { ZeaTheme } from './tokens';
  import { ZEA_THEMES } from './tokens';

  let {
    theme = 'sport',
    badgeText = 'Próxima clase',
    etaText = 'en 25 min',
    mainMetric = '10:00',
    metricSuffix = ' – 11:00',
    avatarText = 'FS',
    title = 'Felipe Soto',
    subtitle = 'Fuerza · Parque Araucano',
    secondaryActionLabel = 'Ver ficha',
    primaryActionLabel = 'Check-in',
    primaryDoneLabel = '✓ Listo',
    isDone = false,
    onSecondaryAction,
    onPrimaryAction
  }: {
    theme?: ZeaTheme;
    badgeText?: string;
    etaText?: string;
    mainMetric?: string;
    metricSuffix?: string;
    avatarText?: string;
    title?: string;
    subtitle?: string;
    secondaryActionLabel?: string;
    primaryActionLabel?: string;
    primaryDoneLabel?: string;
    isDone?: boolean;
    onSecondaryAction?: () => void;
    onPrimaryAction?: () => void;
  } = $props();

  const cfg = $derived(ZEA_THEMES[theme] || ZEA_THEMES.sport);
</script>

<section
  class="relative overflow-hidden rounded-[26px] p-4.5 border bg-gradient-to-br shadow-lg transition-all"
  style="border-color: {cfg.accentBorder};"
  class:from-[#282108]={theme === 'industrial'}
  class:from-[#2B1810]={theme === 'sport'}
  class:from-[#0F241C]={theme === 'funds'}
  class:via-[#141412]={theme === 'industrial'}
  class:via-[#141010]={theme === 'sport'}
  class:via-[#0E1513]={theme === 'funds'}
  class:to-[#0A0A0C]={true}
>
  <!-- Ambient background glow matching theme accent -->
  <div
    class="absolute -top-16 -right-16 w-44 h-44 rounded-full blur-3xl pointer-events-none"
    style="background-color: {cfg.glow};"
  ></div>

  <div class="relative">
    <div class="flex items-center justify-between">
      <span class="flex items-center gap-2 text-[12px] font-medium" style="color: {cfg.accent}">
        <span class="relative flex w-2 h-2">
          <span
            class="absolute inline-flex w-full h-full rounded-full opacity-75 animate-ping"
            style="background-color: {cfg.accent}"
          ></span>
          <span
            class="relative inline-flex w-2 h-2 rounded-full"
            style="background-color: {cfg.accent}"
          ></span>
        </span>
        {badgeText}
      </span>
      <span class="text-[11px] font-semibold text-white bg-white/10 px-2.5 py-1 rounded-full">
        {etaText}
      </span>
    </div>

    <!-- Main Big Metric in Geist Mono -->
    <div class="mt-3.5 text-[30px] sm:text-[32px] font-semibold tracking-tight text-white leading-none tabular-nums font-mono">
      {mainMetric}<span class="text-zinc-500 text-[20px] font-medium">{metricSuffix}</span>
    </div>

    <!-- Entity Identity Row -->
    <div class="mt-3.5 flex items-center gap-3">
      <div
        class="w-9 h-9 rounded-full flex items-center justify-center text-[12.5px] font-semibold text-white bg-white/10 shrink-0 font-mono"
        style="{theme === 'industrial' ? `background-color: ${cfg.accentMuted}; color: ${cfg.accent}; border: 1px solid ${cfg.accentBorder};` : ''}"
      >
        {avatarText}
      </div>
      <div class="min-w-0">
        <p class="text-[14.5px] font-medium text-white truncate">{title}</p>
        <p class="text-[11.5px] text-zinc-400 truncate">{subtitle}</p>
      </div>
    </div>

    <!-- Action Buttons Row -->
    <div class="mt-4 grid grid-cols-2 gap-2">
      <button
        type="button"
        onclick={() => onSecondaryAction?.()}
        class="py-2.5 rounded-2xl bg-white/10 hover:bg-white/15 text-[12.5px] font-medium text-white transition cursor-pointer text-center active:scale-98"
      >
        {secondaryActionLabel}
      </button>

      <button
        type="button"
        onclick={() => onPrimaryAction?.()}
        class="py-2.5 rounded-2xl text-[12.5px] font-semibold transition cursor-pointer text-center active:scale-98"
        style="{isDone ? 'background-color: #10B981; color: #000000;' : (theme === 'industrial' ? `background-color: ${cfg.btnPrimaryBg}; color: ${cfg.btnPrimaryText};` : 'background-color: #FFFFFF; color: #000000;')}"
      >
        {isDone ? primaryDoneLabel : primaryActionLabel}
      </button>
    </div>
  </div>
</section>
