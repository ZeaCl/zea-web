<script lang="ts">
  import MetallicButton from '../atoms/MetallicButton.svelte';
  import { content, type Language } from '../../config/i18n';
  import type { IndustryVertical } from '../../domain/entities/LeadDiagnostic';

  let {
    lang = 'es'
  }: {
    lang?: Language;
  } = $props();

  const t = $derived(content[lang].form);

  let name = $state('');
  let email = $state('');
  let company = $state('');
  let role = $state('');
  let vertical = $state<IndustryVertical>('legal');
  let challenge = $state('');

  let isSubmitting = $state(false);
  let submittedLeadId = $state<string | null>(null);
  let formError = $state<string | null>(null);

  async function handleSubmit(e: SubmitEvent) {
    e.preventDefault();
    formError = null;

    if (!name || name.trim().length < 2) {
      formError = t.errorRequired;
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email.trim())) {
      formError = t.errorEmailInvalid;
      return;
    }

    if (!company || company.trim().length < 2 || !role || role.trim().length < 2) {
      formError = t.errorRequired;
      return;
    }

    if (!challenge || challenge.trim().length < 10) {
      formError = t.errorRequired;
      return;
    }

    isSubmitting = true;

    try {
      const response = await fetch('/api/diagnostic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          company,
          role,
          vertical,
          challenge
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        submittedLeadId = data.leadId || `diag_${Date.now()}`;
      } else {
        formError = data.errors ? data.errors.join(', ') : 'Ocurrió un error al procesar tu solicitud.';
      }
    } catch {
      formError = 'Error de conexión con el servidor ZEA. Por favor reintenta.';
    } finally {
      isSubmitting = false;
    }
  }

  function handleReset() {
    name = '';
    email = '';
    company = '';
    role = '';
    challenge = '';
    vertical = 'legal';
    submittedLeadId = null;
    formError = null;
  }
</script>

<section id="diagnostico" class="py-24 border-t border-[#2f2f3b] bg-gradient-to-b from-[#141418] to-[#1c1c22]">
  <div class="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
    <!-- Header -->
    <div class="text-center max-w-2xl mx-auto mb-12">
      <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-300 text-[11px] font-mono font-semibold tracking-wider mb-4">
        {t.tag}
      </div>
      <h2 class="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
        <span>{t.title}</span>
        <span class="z-gradient-text block sm:inline">{t.titleHighlight}</span>
      </h2>
      <p class="text-sm sm:text-base text-zinc-400 mt-4 leading-relaxed font-sans">
        {t.subtitle}
      </p>
    </div>

    <!-- Form / Success Card -->
    <div class="rounded-2xl border border-[#3d3d4b] bg-[#17171d] p-6 sm:p-10 shadow-2xl relative">
      {#if submittedLeadId}
        <div class="text-center py-8 space-y-5" data-testid="diagnostic-success">
          <div class="w-16 h-16 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto text-2xl">
            ✓
          </div>
          <h3 class="text-2xl font-bold text-white font-sans">{t.successTitle}</h3>
          <p class="text-zinc-300 max-w-md mx-auto text-sm leading-relaxed">
            {t.successMessage}
          </p>
          <div class="inline-block p-3 rounded-lg bg-[#0e0e12] border border-zinc-800 font-mono text-xs text-zinc-400">
            ID de Auditoría: <span class="text-emerald-400 font-bold">{submittedLeadId}</span>
          </div>
          <div class="pt-4">
            <button
              type="button"
              onclick={handleReset}
              class="z-btn z-btn--ghost z-btn--sm font-mono text-xs text-zinc-300"
            >
              {t.resetButton}
            </button>
          </div>
        </div>
      {:else}
        <form onsubmit={handleSubmit} class="space-y-6" data-testid="diagnostic-form">
          {#if formError}
            <div class="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs font-mono">
              ⚠️ {formError}
            </div>
          {/if}

          <!-- Grid: Name & Email -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label for="diag-name" class="block text-xs font-mono text-zinc-300 mb-2">
                {t.nameLabel} *
              </label>
              <input
                id="diag-name"
                type="text"
                required
                bind:value={name}
                placeholder={t.namePlaceholder}
                class="w-full px-4 py-3 rounded-xl bg-[#0f0f13] border border-[#2f2f3b] text-white text-sm focus:border-zinc-400 focus:outline-none transition"
              />
            </div>

            <div>
              <label for="diag-email" class="block text-xs font-mono text-zinc-300 mb-2">
                {t.emailLabel} *
              </label>
              <input
                id="diag-email"
                type="email"
                required
                bind:value={email}
                placeholder={t.emailPlaceholder}
                class="w-full px-4 py-3 rounded-xl bg-[#0f0f13] border border-[#2f2f3b] text-white text-sm focus:border-zinc-400 focus:outline-none transition"
              />
            </div>
          </div>

          <!-- Grid: Company & Role -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label for="diag-company" class="block text-xs font-mono text-zinc-300 mb-2">
                {t.companyLabel} *
              </label>
              <input
                id="diag-company"
                type="text"
                required
                bind:value={company}
                placeholder={t.companyPlaceholder}
                class="w-full px-4 py-3 rounded-xl bg-[#0f0f13] border border-[#2f2f3b] text-white text-sm focus:border-zinc-400 focus:outline-none transition"
              />
            </div>

            <div>
              <label for="diag-role" class="block text-xs font-mono text-zinc-300 mb-2">
                {t.roleLabel} *
              </label>
              <input
                id="diag-role"
                type="text"
                required
                bind:value={role}
                placeholder={t.rolePlaceholder}
                class="w-full px-4 py-3 rounded-xl bg-[#0f0f13] border border-[#2f2f3b] text-white text-sm focus:border-zinc-400 focus:outline-none transition"
              />
            </div>
          </div>

          <!-- Vertical Selection -->
          <div>
            <label for="diag-vertical" class="block text-xs font-mono text-zinc-300 mb-2">
              {t.verticalLabel}
            </label>
            <select
              id="diag-vertical"
              bind:value={vertical}
              class="w-full px-4 py-3 rounded-xl bg-[#0f0f13] border border-[#2f2f3b] text-white text-sm focus:border-zinc-400 focus:outline-none transition"
            >
              <option value="legal">{t.verticalOptionLegal}</option>
              <option value="finance">{t.verticalOptionFinance}</option>
              <option value="industrial">{t.verticalOptionIndustrial}</option>
              <option value="other">{t.verticalOptionOther}</option>
            </select>
          </div>

          <!-- Challenge Description -->
          <div>
            <label for="diag-challenge" class="block text-xs font-mono text-zinc-300 mb-2">
              {t.challengeLabel} *
            </label>
            <textarea
              id="diag-challenge"
              required
              rows="4"
              bind:value={challenge}
              placeholder={t.challengePlaceholder}
              class="w-full px-4 py-3 rounded-xl bg-[#0f0f13] border border-[#2f2f3b] text-white text-sm focus:border-zinc-400 focus:outline-none transition"
            ></textarea>
          </div>

          <!-- Submit Button -->
          <div class="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              class="w-full z-btn z-btn--gradient-border z-btn--lg text-sm font-mono uppercase tracking-wider font-bold cursor-pointer"
            >
              <span>{isSubmitting ? t.submittingButton : t.submitButton}</span>
            </button>
          </div>

          <div class="text-center">
            <span class="text-[11px] font-mono text-zinc-500">
              🔒 Acuerdo de Confidencialidad Automático (NDA) · Cero Almacenamiento No Autorizado
            </span>
          </div>
        </form>
      {/if}
    </div>
  </div>
</section>
