<script lang="ts">
  import type { ZeaTheme } from './tokens';
  import { ZEA_THEMES } from './tokens';

  export interface MetricRingItem {
    label: string;
    value: string;
    delta?: string;
    pct: number; // 0 to 1
    color?: string;
  }

  let {
    theme = 'sport',
    title = 'Esta semana',
    subtitle = '27 oct – 2 nov',
    items = []
  }: {
    theme?: ZeaTheme;
    title?: string;
    subtitle?: string;
    items: MetricRingItem[];
  } = $props();

  const cfg = $derived(ZEA_THEMES[theme] || ZEA_THEMES.sport);

  const ringConfigs = [
    { r: 54, strokeWidth: 10 },
    { r: 41, strokeWidth: 10 },
    { r: 28, strokeWidth: 10 }
  ];

  const computedRings = $derived(
    items.slice(0, 3).map((item, idx) => {
      const ringCfg = ringConfigs[idx];
      const color = item.color || cfg.ringColors[idx] || cfg.accent;
      const c = 2 * Math.PI * ringCfg.r;
      const pctClamped = Math.max(0, Math.min(1, item.pct));
      return {
        ...item,
        ...ringCfg,
        color,
        circumference: c,
        strokeDash: `${(c * pctClamped).toFixed(1)} ${c.toFixed(1)}`
      };
    })
  );
</script>

<section class="p-4 rounded-[24px] bg-[#141418] border border-[#24242C]">
  <div class="flex items-baseline justify-between mb-3">
    <h4 class="text-[15px] font-semibold text-white tracking-tight">{title}</h4>
    <span class="text-[11px] text-zinc-500 tabular-nums font-mono">{subtitle}</span>
  </div>

  <div class="flex items-center gap-4">
    <!-- SVG Rings -->
    <svg width="116" height="116" viewBox="0 0 130 130" class="shrink-0">
      {#each computedRings as ring}
        <!-- Background Track -->
        <circle
          cx="65"
          cy="65"
          r={ring.r}
          fill="none"
          stroke={ring.color}
          stroke-opacity="0.16"
          stroke-width={ring.strokeWidth}
        />
        <!-- Progress Fill -->
        <circle
          cx="65"
          cy="65"
          r={ring.r}
          fill="none"
          stroke={ring.color}
          stroke-width={ring.strokeWidth}
          stroke-linecap="round"
          stroke-dasharray={ring.strokeDash}
          transform="rotate(-90 65 65)"
        />
      {/each}
    </svg>

    <!-- Legend & Values -->
    <dl class="flex-1 space-y-2.5">
      {#each computedRings as ring}
        <div>
          <dt class="text-[11px] text-zinc-400 flex items-center gap-1.5">
            <span class="w-2 h-2 rounded-full" style="background-color: {ring.color}"></span>
            {ring.label}
          </dt>
          <dd class="text-[15.5px] font-semibold text-white tabular-nums font-mono">
            {ring.value}
            {#if ring.delta}
              <span class="text-[10px] font-medium ml-1" style="color: {ring.color}">
                {ring.delta}
              </span>
            {/if}
          </dd>
        </div>
      {/each}
    </dl>
  </div>
</section>
