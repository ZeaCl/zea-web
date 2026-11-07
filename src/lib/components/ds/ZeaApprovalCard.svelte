<script lang="ts">
  import type { ZeaTheme } from './tokens';
  import { ZEA_THEMES } from './tokens';

  let {
    theme = 'sport',
    title = 'Por aprobar',
    avatarText = 'MV',
    entityName = 'Matías Valdés',
    entityDetails = 'Jue 29 · 09:00 · Rehab',
    isApproved = false,
    isRejected = false,
    onApprove,
    onReject
  }: {
    theme?: ZeaTheme;
    title?: string;
    avatarText?: string;
    entityName?: string;
    entityDetails?: string;
    isApproved?: boolean;
    isRejected?: boolean;
    onApprove?: () => void;
    onReject?: () => void;
  } = $props();

  const cfg = $derived(ZEA_THEMES[theme] || ZEA_THEMES.sport);
</script>

{#if !isApproved && !isRejected}
  <section class="p-4 rounded-[24px] bg-[#141418] border border-[#24242C]">
    <h4 class="text-[15px] font-semibold text-white tracking-tight mb-2">{title}</h4>
    <div class="flex items-center gap-3">
      <div
        class="w-9 h-9 rounded-full bg-[#1C1C20] flex items-center justify-center text-[12px] font-semibold text-zinc-200 shrink-0 font-mono"
        style="{theme === 'industrial' ? `color: ${cfg.accent}; border: 1px solid ${cfg.accentBorder};` : ''}"
      >
        {avatarText}
      </div>
      <div class="flex-1 min-w-0">
        <p class="text-[13.5px] text-white truncate">{entityName}</p>
        <p class="text-[11px] text-zinc-500 truncate">{entityDetails}</p>
      </div>

      <!-- Decline button -->
      <button
        type="button"
        aria-label="Rechazar"
        onclick={() => onReject?.()}
        class="w-8 h-8 rounded-full bg-[#1C1C20] hover:bg-[#25252D] text-zinc-400 hover:text-white flex items-center justify-center transition cursor-pointer"
      >
        <svg class="w-3.5 h-3.5 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
          <path stroke-linecap="round" d="M6 6l12 12M18 6L6 18" />
        </svg>
      </button>

      <!-- Approve button -->
      <button
        type="button"
        aria-label="Aprobar"
        onclick={() => onApprove?.()}
        class="w-8 h-8 rounded-full flex items-center justify-center transition cursor-pointer"
        style="{theme === 'industrial' ? `background-color: ${cfg.btnPrimaryBg}; color: ${cfg.btnPrimaryText};` : 'background-color: #FFFFFF; color: #000000;'}"
      >
        <svg class="w-3.5 h-3.5 fill-none stroke-current stroke-[2.5]" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M5 12.5l4.5 4.5L19 7.5" />
        </svg>
      </button>
    </div>
  </section>
{/if}
