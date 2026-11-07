<script lang="ts">
  import type { ZeaTheme } from './tokens';
  import { ZEA_THEMES } from './tokens';

  export interface SheetStat {
    label: string;
    value: string;
  }

  let {
    theme = 'sport',
    isOpen = false,
    avatarText = 'FS',
    title = 'Felipe Soto',
    subtitle = 'Fuerza · Parque Araucano',
    progressLabel = 'Progreso del ciclo actual',
    progressValueText = '9 de 12 sesiones',
    progressPct = 75,
    stats = [
      { label: 'Asistencia', value: '98%' },
      { label: 'Sede', value: 'Parque Araucano' }
    ],
    onClose
  }: {
    theme?: ZeaTheme;
    isOpen?: boolean;
    avatarText?: string;
    title?: string;
    subtitle?: string;
    progressLabel?: string;
    progressValueText?: string;
    progressPct?: number;
    stats?: SheetStat[];
    onClose?: () => void;
  } = $props();

  const cfg = $derived(ZEA_THEMES[theme] || ZEA_THEMES.sport);
</script>

{#if isOpen}
  <!-- Backdrop -->
  <button
    type="button"
    aria-label="Cerrar modal"
    class="absolute inset-0 bg-black/60 z-30 transition-opacity cursor-pointer border-none"
    onclick={() => onClose?.()}
  ></button>

  <!-- Sheet Container -->
  <div
    class="absolute inset-x-0 bottom-0 bg-[#1c1c24] border-t border-[#343445] rounded-t-[28px] p-5 shadow-2xl z-40 transition-transform font-sans"
  >
    <div class="w-10 h-1 bg-zinc-600 rounded-full mx-auto mb-4"></div>

    <div class="flex items-center justify-between pb-3.5 border-b border-[#2D2D34]">
      <div class="flex items-center gap-3">
        <div
          class="w-11 h-11 rounded-full bg-[#25252D] flex items-center justify-center text-[14px] font-semibold text-white font-mono"
          style="{theme === 'industrial' ? `background-color: ${cfg.accentMuted}; color: ${cfg.accent}; border: 1px solid ${cfg.accentBorder};` : ''}"
        >
          {avatarText}
        </div>
        <div>
          <h4 class="font-semibold text-white text-[16px]">{title}</h4>
          <p class="text-[12px] text-zinc-400 mt-0.5">{subtitle}</p>
        </div>
      </div>
      <button
        type="button"
        aria-label="Cerrar ficha"
        onclick={() => onClose?.()}
        class="p-1 rounded-full bg-white/10 text-zinc-400 hover:text-white cursor-pointer"
      >
        <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>

    <!-- Progress Bar -->
    <div class="mt-3.5 space-y-2">
      <div class="flex items-baseline justify-between text-[12px]">
        <span class="text-zinc-400">{progressLabel}</span>
        <span class="text-white font-semibold font-mono">{progressValueText}</span>
      </div>
      <div class="h-2 rounded-full bg-[#25252D] overflow-hidden">
        <div
          class="h-full rounded-full transition-all duration-300"
          style="width: {Math.max(0, Math.min(100, progressPct))}%; background-color: {cfg.accent};"
        ></div>
      </div>

      <!-- Key-Value Grid -->
      {#if stats && stats.length > 0}
        <div class="grid grid-cols-2 gap-2 pt-2 text-center text-xs">
          {#each stats as stat}
            <div class="p-2 rounded-xl bg-black/40">
              <span class="text-[11px] text-zinc-400 block">{stat.label}</span>
              <span class="font-semibold text-white text-[13.5px] truncate block font-mono">
                {stat.value}
              </span>
            </div>
          {/each}
        </div>
      {/if}
    </div>
  </div>
{/if}
