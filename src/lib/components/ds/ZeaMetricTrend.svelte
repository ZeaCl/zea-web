<script lang="ts">
  import type { ZeaTheme } from './tokens';
  import { ZEA_THEMES } from './tokens';

  export interface DistributionItem {
    label: string;
    percentage: number;
    color?: string;
  }

  let {
    theme = 'sport',
    title = 'Últimas 8 semanas',
    badgeText = '+20% vs mes anterior',
    bars = [9, 11, 10, 13, 12, 14, 15, 18],
    distribution = [
      { label: 'Parque Araucano', percentage: 62 },
      { label: 'Gimnasio Central', percentage: 38 }
    ]
  }: {
    theme?: ZeaTheme;
    title?: string;
    badgeText?: string;
    bars?: number[];
    distribution?: DistributionItem[];
  } = $props();

  const cfg = $derived(ZEA_THEMES[theme] || ZEA_THEMES.sport);
  const maxVal = $derived(Math.max(...bars, 1));
</script>

<section class="p-4 rounded-[24px] bg-[#141418] border border-[#24242C]">
  <div class="flex items-baseline justify-between mb-3">
    <h4 class="text-[15px] font-semibold text-white tracking-tight">{title}</h4>
    <span class="text-[11px] font-medium" style="color: {cfg.accent}">{badgeText}</span>
  </div>

  <!-- Bar Chart -->
  <div class="flex items-end gap-1.5 h-[80px]">
    {#each bars as v, i}
      {@const isCurrent = i === bars.length - 1}
      <div class="flex-1 flex flex-col items-center gap-1">
        <span class="text-[10px] tabular-nums font-mono {isCurrent ? 'text-white font-semibold' : 'text-transparent'}">
          {v}
        </span>
        <div
          class="w-full rounded-xs transition-all duration-300"
          style="{isCurrent ? `background-color: ${cfg.accent}; height: ${Math.round((v / maxVal) * 58)}px;` : `background-color: #2A2A31; height: ${Math.round((v / maxVal) * 58)}px;`}"
        ></div>
      </div>
    {/each}
  </div>

  <!-- Distribution Segmented Bar -->
  {#if distribution && distribution.length > 0}
    <div class="mt-4">
      <div class="flex h-1.5 rounded-full overflow-hidden gap-0.5">
        {#each distribution as dist, idx}
          <div
            style="width: {dist.percentage}%; background-color: {dist.color || (idx === 0 ? '#E4E4E7' : '#52525B')};"
          ></div>
        {/each}
      </div>

      <div class="flex justify-between mt-2 text-[11px]">
        {#each distribution as dist, idx}
          <span class="text-zinc-300">
            <span
              class="inline-block w-2 h-2 rounded-full mr-1.5"
              style="background-color: {dist.color || (idx === 0 ? '#E4E4E7' : '#52525B')};"
            ></span>
            {dist.label} <span class="text-zinc-500 tabular-nums font-mono">{dist.percentage}%</span>
          </span>
        {/each}
      </div>
    </div>
  {/if}
</section>
