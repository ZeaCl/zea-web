<script lang="ts">
  import type { ZeaTheme } from './tokens';
  import { ZEA_THEMES } from './tokens';

  export interface ZeaChecklistItem {
    id: string;
    label: string;
    domain?: 'Planta' | 'Flota' | string;
    citation?: string;
    evidenceTag?: string;
    checked: boolean;
    requiresInput?: boolean;
    inputValue?: string;
    inputPlaceholder?: string;
    presetValues?: string[];
  }

  let {
    theme = 'industrial',
    moduleBadge = '',
    title = 'Parte Diario',
    subtitle = '',
    items = [],
    actionLabel = '',
    embedded = false,
    onToggleItem,
    onInputSubmit,
    onAction
  }: {
    theme?: ZeaTheme;
    moduleBadge?: string;
    title?: string;
    subtitle?: string;
    items?: ZeaChecklistItem[];
    actionLabel?: string;
    embedded?: boolean;
    onToggleItem?: (id: string) => void;
    onInputSubmit?: (id: string, value: string) => void;
    onAction?: () => void;
  } = $props();

  const cfg = $derived(ZEA_THEMES[theme] || ZEA_THEMES.industrial);
  const completedCount = $derived(items.filter((i) => i.checked).length);

  function submitItemInput(item: ZeaChecklistItem) {
    const val = item.inputValue?.trim() || item.presetValues?.[0] || '';
    if (val) {
      item.inputValue = val;
      item.checked = true;
      onInputSubmit?.(item.id, val);
    } else {
      item.checked = !item.checked;
      onToggleItem?.(item.id);
    }
  }
</script>

<section
  class={embedded
    ? 'space-y-2.5 w-full pt-1'
    : 'p-4 rounded-[24px] bg-[#141418] border border-[#24242C] space-y-3'}
  data-testid="zea-checklist-card"
>
  <!-- Top Header -->
  <div class="flex items-start justify-between gap-2">
    <div>
      {#if moduleBadge}
        <div class="flex items-center gap-1.5 mb-1">
          <span
            class="text-[9.5px] font-mono font-bold px-2 py-0.5 rounded-md uppercase tracking-wider"
            style="background-color: {cfg.accentMuted}; color: {cfg.accent}; border: 1px solid {cfg.accentBorder};"
          >
            {moduleBadge}
          </span>
        </div>
      {/if}
      <div class="flex items-center gap-2">
        <!-- Checklist Icon to the left of title -->
        <svg
          class="w-4 h-4 text-[#FFCD00] shrink-0"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <path d="M9 11l3 3L22 4" />
          <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
        </svg>
        <h4 class="text-[15px] font-semibold text-white tracking-tight">{title}</h4>
      </div>
      {#if subtitle}
        <p class="text-[11px] text-zinc-400">{subtitle}</p>
      {/if}
    </div>

    <div class="text-right shrink-0">
      <span
        class="text-[14px] font-mono font-bold"
        style="color: {cfg.accent};"
      >
        {completedCount}/{items.length}
      </span>
      <span class="block text-[9.5px] text-zinc-500 font-mono">completados</span>
    </div>
  </div>

  <!-- Checklist Items -->
  <div class="space-y-2">
    {#each items as item (item.id)}
      <div
        class="w-full p-2.5 rounded-xl {embedded ? 'bg-black/45 hover:bg-black/60' : 'bg-[#1A1A20] hover:bg-[#22222A]'} border {item.checked ? (embedded ? 'border-white/5' : 'border-white/10') : 'border-[#FFCD00]/40'} text-left transition flex flex-col gap-2"
      >
        <!-- Header Row (Checkbox + Label + Badges) -->
        <div class="flex items-start gap-2.5 w-full">
          <!-- Checkbox button -->
          <button
            type="button"
            onclick={() => {
              if (item.checked) {
                item.checked = false;
                onToggleItem?.(item.id);
              } else if (!item.requiresInput) {
                item.checked = true;
                onToggleItem?.(item.id);
              } else {
                submitItemInput(item);
              }
            }}
            class="w-5 h-5 rounded-lg mt-0.5 flex items-center justify-center shrink-0 transition font-bold text-[11px] cursor-pointer"
            style={item.checked
              ? `background-color: ${cfg.accent}; color: ${cfg.btnPrimaryText};`
              : 'background-color: #101014; border: 1.5px solid #52525B; color: transparent;'}
            aria-label={item.checked ? `Desmarcar ${item.label}` : `Marcar ${item.label}`}
          >
            ✓
          </button>

          <div class="flex-1 min-w-0">
            <div class="flex items-center justify-between gap-1.5">
              <p class="text-[12.5px] font-medium {item.checked ? 'text-zinc-200' : 'text-white font-semibold'} leading-snug">
                {item.label}
              </p>
              {#if item.domain}
                <span class="text-[9.5px] font-mono px-1.5 py-0.2 rounded bg-white/5 text-zinc-300 border border-white/10 shrink-0">
                  {item.domain}
                </span>
              {/if}
            </div>

            <!-- Value Display if already registered -->
            {#if item.checked && item.inputValue}
              <div class="flex items-center gap-1.5 mt-1">
                <span class="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md bg-[#FFCD00]/15 text-[#FFCD00] border border-[#FFCD00]/30">
                  Dato: {item.inputValue}
                </span>
                <button
                  type="button"
                  onclick={() => {
                    item.checked = false;
                    onToggleItem?.(item.id);
                  }}
                  class="text-[9.5px] text-zinc-500 hover:text-zinc-300 transition underline cursor-pointer"
                >
                  editar
                </button>
              </div>
            {/if}

            {#if item.citation || item.evidenceTag}
              <div class="flex flex-wrap items-center gap-1.5 mt-1">
                {#if item.citation}
                  <span class="text-[10px] font-mono text-zinc-400 bg-black/40 px-1.5 py-0.2 rounded border border-white/5">
                    {item.citation}
                  </span>
                {/if}
                {#if item.evidenceTag}
                  <span class="text-[9.5px] font-mono text-emerald-400/90">
                    {item.evidenceTag}
                  </span>
                {/if}
              </div>
            {/if}
          </div>
        </div>

        <!-- Manual Input Row (when requiresInput and not yet checked) -->
        {#if item.requiresInput && !item.checked}
          <div class="w-full pt-1.5 border-t border-white/5 pl-7 space-y-1.5">
            <div class="flex items-center gap-1.5">
              <input
                type="text"
                placeholder={item.inputPlaceholder || 'Ingresar valor para validar...'}
                bind:value={item.inputValue}
                onkeydown={(e) => {
                  if (e.key === 'Enter') submitItemInput(item);
                }}
                class="flex-1 px-2.5 py-1.5 rounded-lg bg-black/70 border border-white/15 text-white text-[12px] placeholder:text-zinc-500 focus:outline-none focus:border-[#FFCD00] font-mono"
              />
              <button
                type="button"
                onclick={() => submitItemInput(item)}
                class="px-3 py-1.5 rounded-lg bg-[#FFCD00] hover:bg-[#FFE066] text-black font-bold text-[11px] transition cursor-pointer shrink-0"
              >
                Validar OK
              </button>
            </div>

            <!-- Quick Preset Chips -->
            {#if item.presetValues && item.presetValues.length > 0}
              <div class="flex items-center gap-1.5 flex-wrap pt-0.5">
                <span class="text-[9.5px] text-zinc-500 font-mono">Sugerido:</span>
                {#each item.presetValues as preset}
                  <button
                    type="button"
                    onclick={() => {
                      item.inputValue = preset;
                      submitItemInput(item);
                    }}
                    class="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white/5 hover:bg-white/10 text-zinc-300 border border-white/10 transition cursor-pointer"
                  >
                    {preset}
                  </button>
                {/each}
              </div>
            {/if}
          </div>
        {/if}
      </div>
    {/each}
  </div>

  <!-- Footer Action -->
  {#if onAction && actionLabel}
    <div class="pt-1 flex items-center justify-end gap-2 border-t border-white/5">
      <button
        type="button"
        onclick={() => onAction?.()}
        class="px-3 py-1.5 rounded-xl text-[11.5px] font-semibold transition cursor-pointer"
        style="background-color: {cfg.btnPrimaryBg}; color: {cfg.btnPrimaryText};"
      >
        {actionLabel}
      </button>
    </div>
  {/if}
</section>
