<script lang="ts">
  import type { ZeaTheme } from './tokens';
  import { ZEA_THEMES } from './tokens';

  export interface ZeaCaptureFeedItem {
    id: string;
    source: 'ESCANEO QR' | 'LECTURA OCR' | 'VISIÓN IA' | 'SENSOR IOT';
    domain: 'Planta' | 'Flota';
    title: string;
    detail: string;
    metric: string;
    status: 'ok' | 'warning';
  }

  let {
    theme = 'industrial',
    moduleBadge = 'VISIÓN IA + SENSORES IOT',
    title = 'Capturas & Telemetría en Vivo',
    subtitle = 'Visión computacional, QR/OCR y sensores en tiempo real',
    captures = [],
    scanActionLabel = 'Capturar en Terreno',
    onScanAction,
    onSelectCapture
  }: {
    theme?: ZeaTheme;
    moduleBadge?: string;
    title?: string;
    subtitle?: string;
    captures?: ZeaCaptureFeedItem[];
    scanActionLabel?: string;
    onScanAction?: () => void;
    onSelectCapture?: (item: ZeaCaptureFeedItem) => void;
  } = $props();

  const cfg = $derived(ZEA_THEMES[theme] || ZEA_THEMES.industrial);
</script>

<section
  class="p-4 rounded-[24px] bg-[#141418] border border-[#24242C] space-y-3"
  data-testid="zea-retina-capture-card"
>
  <!-- Header -->
  <div class="flex items-start justify-between gap-2">
    <div>
      <div class="flex items-center gap-1.5 mb-1">
        <span
          class="text-[9.5px] font-mono font-bold px-2 py-0.5 rounded-md uppercase tracking-wider"
          style="background-color: {cfg.accentMuted}; color: {cfg.accent}; border: 1px solid {cfg.accentBorder};"
        >
          {moduleBadge}
        </span>
        <span class="inline-flex items-center gap-1 text-[9.5px] font-mono text-sky-400 bg-sky-500/10 border border-sky-500/30 px-1.5 py-0.5 rounded-md">
          <span class="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse"></span>
          LIVE STREAM
        </span>
      </div>
      <h4 class="text-[15px] font-semibold text-white tracking-tight">{title}</h4>
      <p class="text-[11px] text-zinc-400">{subtitle}</p>
    </div>

    {#if onScanAction}
      <button
        type="button"
        onclick={() => onScanAction?.()}
        class="px-2.5 py-1.5 rounded-xl text-[11px] font-semibold transition cursor-pointer shrink-0 flex items-center gap-1"
        style="background-color: {cfg.btnPrimaryBg}; color: {cfg.btnPrimaryText};"
      >
        <span>📷</span>
        <span>{scanActionLabel}</span>
      </button>
    {/if}
  </div>

  <!-- Captures List -->
  <div class="space-y-2">
    {#each captures as cap (cap.id)}
      <button
        type="button"
        onclick={() => onSelectCapture?.(cap)}
        class="w-full p-2.5 rounded-2xl bg-[#1A1A20] hover:bg-[#22222A] border border-white/8 text-left transition flex items-center justify-between gap-2.5 cursor-pointer"
      >
        <div class="min-w-0 flex-1">
          <div class="flex items-center gap-1.5 mb-0.5">
            <span
              class="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded"
              style="background-color: {cfg.accentMuted}; color: {cfg.accent};"
            >
              {cap.source}
            </span>
            <span class="text-[9px] font-mono px-1.5 py-0.2 rounded bg-white/5 text-zinc-300 border border-white/10">
              {cap.domain}
            </span>
          </div>
          <p class="text-[12.5px] font-semibold text-white truncate">{cap.title}</p>
          <p class="text-[11px] text-zinc-400 truncate">{cap.detail}</p>
        </div>

        <div class="text-right shrink-0">
          <span
            class="text-[12.5px] font-mono font-bold block {cap.status === 'warning' ? 'text-amber-400' : ''}"
            style={cap.status === 'ok' ? `color: ${cfg.accent};` : ''}
          >
            {cap.metric}
          </span>
          <span class="text-[9.5px] font-mono {cap.status === 'warning' ? 'text-amber-400/80' : 'text-emerald-400'}">
            {cap.status === 'warning' ? '⚠ Revisar' : '✓ Verificado'}
          </span>
        </div>
      </button>
    {/each}
  </div>
</section>
