<script lang="ts">
  import { content, type Language } from '../../config/i18n';

  let {
    lang = 'es'
  }: {
    lang?: Language;
  } = $props();

  const t = $derived(content[lang].gliaBridge);
</script>

<section class="py-16 border-t border-[#2f2f3b]/70 bg-[#121216]">
  <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
    <div class="rounded-3xl border border-[#3d3d4b] bg-gradient-to-br from-[#1c1c24] via-[#16161d] to-[#0f0f13] p-8 sm:p-12 shadow-2xl relative overflow-hidden">
      <!-- Background accent glow -->
      <div class="pointer-events-none absolute -right-20 -bottom-20 w-80 h-80 rounded-full bg-amber-500/10 blur-3xl"></div>

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
        <!-- Left Column -->
        <div class="lg:col-span-8 space-y-4">
          <div class="flex items-center gap-3">
            <span class="text-[11px] font-mono font-bold tracking-widest uppercase px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400">
              {t.tag}
            </span>
            <span class="text-[11px] font-mono text-zinc-500">
              iOS & Android Runtime
            </span>
          </div>

          <h3 class="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
            <span>{t.title}</span>
            <span class="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-orange-400 to-amber-500">
              {t.titleHighlight}
            </span>
          </h3>

          <p class="text-sm sm:text-base text-zinc-300 max-w-2xl leading-relaxed font-sans">
            {t.desc}
          </p>

          <!-- Badges & Case Study Tag -->
          <div class="flex flex-wrap items-center gap-3 pt-2 text-xs font-mono">
            <span class="px-3 py-1 rounded-lg bg-[#242430] border border-[#3d3d4d] text-zinc-300 font-semibold">
               {t.badgeSwift}
            </span>
            <span class="px-3 py-1 rounded-lg bg-[#242430] border border-[#3d3d4d] text-emerald-400 font-semibold">
              🤖 {t.badgeKotlin}
            </span>
            <span class="px-3 py-1 rounded-lg bg-zinc-800/80 border border-zinc-700 text-zinc-400">
              ★ {t.caseStudyName}
            </span>
          </div>
        </div>

        <!-- Right Column / Direct Link Button -->
        <div class="lg:col-span-4 flex lg:justify-end">
          <a
            href="https://glia.zea.cl"
            target="_blank"
            rel="noopener noreferrer"
            class="z-btn z-btn--gradient-border z-btn--lg text-xs font-mono uppercase tracking-wider font-bold w-full sm:w-auto text-center"
          >
            <span>{t.cta}</span>
          </a>
        </div>
      </div>
    </div>
  </div>
</section>
