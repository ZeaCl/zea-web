<script lang="ts">
  import ZeaLogo from '../atoms/ZeaLogo.svelte';
  import { content, type Language } from '../../config/i18n';

  let {
    lang = 'es'
  }: {
    lang?: Language;
  } = $props();

  const t = $derived(content[lang]);
</script>

<footer class="border-t border-[#2f2f3b] bg-[#141418] text-xs font-mono text-zinc-400 py-12 px-4 sm:px-6 lg:px-8">
  <div class="mx-auto max-w-7xl">
    <div class="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-[#2f2f3b]/70">
      <!-- Col 1: Brand & Tagline -->
      <div class="md:col-span-2 space-y-4">
        <div class="flex items-center gap-3">
          <ZeaLogo class="h-4 w-auto text-white" />
        </div>
        <p class="text-zinc-400 text-xs max-w-md leading-relaxed font-sans">
          {t.footer.tagline}
        </p>
        <div class="flex items-center gap-2 text-[11px] text-zinc-500">
          <span class="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Sistemas Operacionales 99.98% SLA en Producción</span>
        </div>
      </div>

      <!-- Col 2: Soluciones -->
      <div class="space-y-3">
        <span class="text-zinc-200 font-bold uppercase tracking-wider text-[11px]">Plataforma</span>
        <ul class="space-y-2 text-zinc-400">
          <li><a href="#legal" class="hover:text-white transition">Legal & Concesiones de Infraestructura</a></li>
          <li><a href="#finanzas" class="hover:text-white transition">Finanzas & Fondos de Inversión</a></li>
          <li><a href="#industrial" class="hover:text-white transition">Faenas Industriales & Construcción</a></li>
          <li><a href="#diagnostico" class="hover:text-white transition">Auditoría Agéntica B2B</a></li>
        </ul>
      </div>

      <!-- Col 3: Glia & Ecosistema -->
      <div class="space-y-3">
        <span class="text-zinc-200 font-bold uppercase tracking-wider text-[11px]">Ecosistema</span>
        <ul class="space-y-2 text-zinc-400">
          <li>
            <a href="https://glia.zea.cl" target="_blank" rel="noopener noreferrer" class="hover:text-amber-400 transition flex items-center gap-1.5">
              <span>Glia Mobile Runtime</span>
              <span class="text-[9px] px-1 py-0.2 bg-amber-500/10 text-amber-400 rounded">iOS/Android</span>
            </a>
          </li>
          <li><a href="https://github.com/ZeaCl" target="_blank" rel="noopener noreferrer" class="hover:text-white transition">GitHub Organization</a></li>
          <li><a href="#diagnostico" class="hover:text-white transition">{t.footer.contact}</a></li>
        </ul>
      </div>
    </div>

    <!-- Bottom line -->
    <div class="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-zinc-500">
      <div>
        {t.footer.rights}
      </div>
      <div class="flex items-center gap-6">
        <span>Santiago & Puerto Montt, Chile</span>
        <span>GCP southamerica-west1</span>
      </div>
    </div>
  </div>
</footer>
