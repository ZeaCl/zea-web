<script lang="ts">
  let {
    value,
    label,
    trend,
    class: className = ''
  }: {
    value: string;
    label: string;
    trend?: string;
    class?: string;
  } = $props();
</script>

<div class="z-card px-5 py-4 border border-[#3d3d4b]/60 flex flex-col gap-1 {className}">
  <div class="flex items-baseline gap-2">
    <span class="text-2xl md:text-3xl font-bold font-mono tracking-tight text-white">{value}</span>
    {#if trend}
      <span class="text-[11px] font-mono font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
        {trend}
      </span>
    {/if}
  </div>
  <span class="text-xs text-zinc-400 font-medium leading-relaxed">{label}</span>
</div>
