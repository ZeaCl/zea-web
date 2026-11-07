<script lang="ts">
  import type { ZeaTheme } from './tokens';
  import { ZEA_THEMES } from './tokens';

  export interface TimelineEntry {
    id: string;
    time: string;
    title: string;
    subtitle: string;
    status: 'completed' | 'active' | 'available' | 'scheduled';
    actionLabel?: string;
    onAction?: () => void;
    onClick?: () => void;
  }

  let {
    theme = 'sport',
    title = 'Hoy',
    headerActionLabel = 'Ver todo',
    onHeaderAction,
    entries = []
  }: {
    theme?: ZeaTheme;
    title?: string;
    headerActionLabel?: string;
    onHeaderAction?: () => void;
    entries: TimelineEntry[];
  } = $props();

  const cfg = $derived(ZEA_THEMES[theme] || ZEA_THEMES.sport);
</script>

<section class="p-4 rounded-[24px] bg-[#141418] border border-[#24242C]">
  <div class="flex items-baseline justify-between mb-2.5">
    <h4 class="text-[15px] font-semibold text-white tracking-tight">{title}</h4>
    {#if headerActionLabel}
      <button
        type="button"
        onclick={() => onHeaderAction?.()}
        class="text-[12px] text-zinc-400 hover:text-white transition cursor-pointer"
      >
        {headerActionLabel}
      </button>
    {/if}
  </div>

  <ol class="relative">
    {#each entries as entry}
      <li class="flex gap-3 py-2">
        <!-- Time Stamp -->
        <span
          class="w-11 shrink-0 text-[12px] tabular-nums pt-0.5 font-mono"
          style="{entry.status === 'active' ? `color: ${cfg.accent}; font-weight: 600;` : (entry.status === 'completed' ? 'color: #71717A;' : 'color: #A1A1AA;')}"
        >
          {entry.time}
        </span>

        <!-- Vertical Line & Entry Body -->
        {#if entry.status === 'available'}
          <div class="flex-1 border-l border-dashed border-[#3A3A42] pl-3 -my-2 py-2 flex items-center justify-between">
            <div>
              <p class="text-[13px] text-zinc-300">{entry.title}</p>
              <p class="text-[11px] text-zinc-500">{entry.subtitle}</p>
            </div>
            {#if entry.actionLabel}
              <button
                type="button"
                onclick={() => entry.onAction?.()}
                class="text-[11px] font-medium text-white bg-white/10 hover:bg-white/15 px-2.5 py-1 rounded-full transition cursor-pointer"
              >
                {entry.actionLabel}
              </button>
            {/if}
          </div>
        {:else if entry.onClick}
          <button
            type="button"
            onclick={() => entry.onClick?.()}
            class="flex-1 flex gap-3 text-left cursor-pointer group"
          >
            <div
              class="flex-1 pl-3 -my-2 py-2"
              style="{entry.status === 'active' ? `border-left: 2px solid ${cfg.accent};` : 'border-left: 1px solid #2A2A31;'}"
            >
              <p class="text-[13.5px] text-white font-medium group-hover:text-zinc-200 transition">{entry.title}</p>
              <p class="text-[11.5px] text-zinc-400">{entry.subtitle}</p>
            </div>
          </button>
        {:else}
          <div
            class="flex-1 pl-3 -my-2 py-2"
            style="{entry.status === 'active' ? `border-left: 2px solid ${cfg.accent};` : 'border-left: 1px solid #2A2A31;'}"
          >
            <p
              class="text-[13px] {entry.status === 'completed' ? 'text-zinc-500 line-through decoration-zinc-700' : 'text-zinc-200'}"
            >
              {entry.title}
            </p>
            <p class="text-[11px] {entry.status === 'completed' ? 'text-zinc-600' : 'text-zinc-500'}">
              {entry.subtitle}
            </p>
          </div>
        {/if}
      </li>
    {/each}
  </ol>
</section>
