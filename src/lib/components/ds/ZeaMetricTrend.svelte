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
    metricValue = '',
    metricUnit = '',
    metricSubtitle = '',
    targetValue,
    targetLabel = '',
    bars = [9, 11, 10, 13, 12, 14, 15, 18],
    barLabels = ['S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'S7', 'Hoy'],
    distribution = [
      { label: 'Parque Araucano', percentage: 62 },
      { label: 'Gimnasio Central', percentage: 38 }
    ]
  }: {
    theme?: ZeaTheme;
    title?: string;
    badgeText?: string;
    metricValue?: string;
    metricUnit?: string;
    metricSubtitle?: string;
    targetValue?: number;
    targetLabel?: string;
    bars?: number[];
    barLabels?: string[];
    distribution?: DistributionItem[];
  } = $props();

  const cfg = $derived(ZEA_THEMES[theme] || ZEA_THEMES.sport);
  const maxVal = $derived(Math.max(...bars, targetValue ?? 0, 1));
</script>

<section class="p-4 rounded-[24px] bg-[#141418] border border-[#24242C]">
  <!-- Header -->
  <div class="flex items-baseline justify-between mb-2.5">
    <h4 class="text-[15px] font-semibold text-white tracking-tight">{title}</h4>
    {#if badgeText}
      <span class="text-[11px] font-medium" style="color: {cfg.accent}">{badgeText}</span>
    {/if}
  </div>

  <!-- Hero Metric (Apple Health / Fitness style) -->
  {#if metricValue}
    <div class="mb-3.5">
      <div class="flex items-baseline gap-1.5">
        <span class="text-[26px] font-bold text-white font-mono tracking-tight leading-none">
          {metricValue}
        </span>
        {#if metricUnit}
          <span class="text-[12px] text-zinc-400 font-medium">{metricUnit}</span>
        {/if}
      </div>
      {#if metricSubtitle}
        <p class="text-[11px] text-zinc-400 mt-1 leading-snug">{metricSubtitle}</p>
      {/if}
    </div>
  {/if}

  <!-- Chart Area with Target Reference Line -->
  <div class="relative pt-2 pb-1">
    <!-- Dashed target line if provided -->
    {#if targetValue}
      {@const targetBottom = Math.round((targetValue / maxVal) * 58) + 18}
      <div
        class="absolute left-0 right-0 border-b border-dashed border-zinc-700/60 flex items-center justify-end z-0 pointer-events-none"
        style="bottom: {targetBottom}px;"
      >
        {#if targetLabel}
          <span class="text-[9px] font-mono text-zinc-500 bg-[#141418] px-1 -translate-y-1/2">
            {targetLabel}
          </span>
        {/if}
      </div>
    {/if}

    <!-- Bar Columns -->
    <div class="relative z-1 flex items-end gap-1.5 h-[80px]">
      {#each bars as v, i}
        {@const isCurrent = i === bars.length - 1}
        {@const label = barLabels?.[i] ?? `S${i + 1}`}
        {@const barHeight = Math.max(8, Math.round((v / maxVal) * 56))}
        <div class="flex-1 flex flex-col items-center gap-1 group">
          <span
            class="text-[9.5px] tabular-nums font-mono transition-opacity duration-150 {isCurrent ? 'text-white font-semibold' : 'text-zinc-400 opacity-0 group-hover:opacity-100'}"
          >
            {v}
          </span>
          <div
            class="w-full rounded-t-[3.5px] transition-all duration-300"
            style="{isCurrent ? `background-color: ${cfg.accent}; height: ${barHeight}px; box-shadow: 0 0 10px ${cfg.accent}33;` : `background-color: #2A2A31; height: ${barHeight}px;`}"
          ></div>
          <span
            class="text-[10px] font-mono mt-0.5 {isCurrent ? 'font-bold' : 'text-zinc-500'}"
            style="{isCurrent ? `color: ${cfg.accent};` : ''}"
          >
            {label}
          </span>
        </div>
      {/each}
    </div>
  </div>

  <!-- Distribution Segmented Bar -->
  {#if distribution && distribution.length > 0}
    <div class="mt-4 pt-3 border-t border-white/5">
      <div class="flex h-1.5 rounded-full overflow-hidden gap-0.5">
        {#each distribution as dist, idx}
          <div
            style="width: {dist.percentage}%; background-color: {dist.color || (idx === 0 ? cfg.accent : '#52525B')};"
          ></div>
        {/each}
      </div>

      <div class="flex flex-wrap items-center justify-between gap-y-1 mt-2 text-[11px]">
        {#each distribution as dist, idx}
          <span class="flex items-center text-zinc-300">
            <span
              class="inline-block w-2 h-2 rounded-full mr-1.5 shrink-0"
              style="background-color: {dist.color || (idx === 0 ? cfg.accent : '#52525B')};"
            ></span>
            <span>{dist.label}</span>
            <span class="text-zinc-500 tabular-nums font-mono ml-1">({dist.percentage}%)</span>
          </span>
        {/each}
      </div>
    </div>
  {/if}
</section>
