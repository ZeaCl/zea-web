<script lang="ts">
  import { fade } from 'svelte/transition';
  import type { ZeaTheme } from './tokens';
  import { ZEA_THEMES } from './tokens';

  let {
    theme = 'sport',
    moduleBadge = '',
    domainBadge = '',
    title = 'Por aprobar',
    avatarText = 'MV',
    entityName = 'Matías Valdés',
    entityDetails = 'Jue 29 · 09:00 · Rehab',
    citationText = '',
    isApproved = false,
    isRejected = false,
    onApprove,
    onReject
  }: {
    theme?: ZeaTheme;
    moduleBadge?: string;
    domainBadge?: string;
    title?: string;
    avatarText?: string;
    entityName?: string;
    entityDetails?: string;
    citationText?: string;
    isApproved?: boolean;
    isRejected?: boolean;
    onApprove?: () => void;
    onReject?: () => void;
  } = $props();

  let isExpanded = $state(false);

  const cfg = $derived(ZEA_THEMES[theme] || ZEA_THEMES.sport);
</script>

{#if !isApproved && !isRejected}
  <section class="p-4 rounded-[24px] bg-[#141418] border border-[#24242C] space-y-2">
    {#if moduleBadge || domainBadge}
      <div class="flex items-center justify-between gap-2">
        {#if moduleBadge}
          <span
            class="text-[9.5px] font-mono font-bold px-2 py-0.5 rounded-md uppercase tracking-wider"
            style="background-color: {cfg.accentMuted}; color: {cfg.accent}; border: 1px solid {cfg.accentBorder};"
          >
            {moduleBadge}
          </span>
        {/if}
        {#if domainBadge}
          <span class="text-[9.5px] font-mono px-1.5 py-0.2 rounded bg-white/5 text-zinc-300 border border-white/10">
            {domainBadge}
          </span>
        {/if}
      </div>
    {/if}

    <h4 class="text-[15px] font-semibold text-white tracking-tight">{title}</h4>

    <div class="flex items-center gap-3">
      <div
        class="w-9 h-9 rounded-full bg-[#1C1C20] flex items-center justify-center text-[12px] font-semibold text-zinc-200 shrink-0 font-mono"
        style="{theme === 'industrial' ? `color: ${cfg.accent}; border: 1px solid ${cfg.accentBorder};` : ''}"
      >
        {avatarText}
      </div>
      <div class="flex-1 min-w-0">
        <p class="text-[13.5px] text-white truncate font-medium">{entityName}</p>
        <p class="text-[11px] text-zinc-400 truncate">{entityDetails}</p>
        {#if citationText}
          <button
            type="button"
            onclick={() => (isExpanded = !isExpanded)}
            class="text-[10.5px] text-zinc-400 hover:text-zinc-200 transition cursor-pointer inline-flex items-center gap-1 mt-0.5"
          >
            <span>{isExpanded ? 'Ocultar alerta técnica' : 'Ver alerta técnica'}</span>
            <svg
              class="w-3 h-3 transition-transform {isExpanded ? 'rotate-180' : ''}"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        {/if}
      </div>

      <!-- Decline button -->
      <button
        type="button"
        aria-label="Rechazar"
        onclick={() => onReject?.()}
        class="w-8 h-8 rounded-full bg-[#1C1C20] hover:bg-[#25252D] text-zinc-400 hover:text-white flex items-center justify-center transition cursor-pointer shrink-0"
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
        class="w-8 h-8 rounded-full flex items-center justify-center transition cursor-pointer shrink-0"
        style="{theme === 'industrial' ? `background-color: ${cfg.btnPrimaryBg}; color: ${cfg.btnPrimaryText};` : 'background-color: #FFFFFF; color: #000000;'}"
      >
        <svg class="w-3.5 h-3.5 fill-none stroke-current stroke-[2.5]" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M5 12.5l4.5 4.5L19 7.5" />
        </svg>
      </button>
    </div>

    {#if citationText && isExpanded}
      <p class="text-[11px] text-zinc-400 leading-relaxed pt-1.5 border-t border-white/5" in:fade={{ duration: 120 }}>
        {citationText}
      </p>
    {/if}
  </section>
{/if}
