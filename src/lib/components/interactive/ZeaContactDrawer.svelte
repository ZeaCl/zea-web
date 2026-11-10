<script lang="ts">
  import { fade, fly } from 'svelte/transition';
  import type { IndustryVertical } from '$lib/domain/entities/LeadDiagnostic';

  let {
    isOpen = false,
    lang = 'es',
    onClose
  }: {
    isOpen: boolean;
    lang?: 'es' | 'en';
    onClose: () => void;
  } = $props();

  let firstName = $state('');
  let lastName = $state('');
  let email = $state('');
  let phone = $state('');
  let jobTitle = $state('');
  let company = $state('');
  let vertical = $state<IndustryVertical>('industrial');
  let selectedFocus = $state<'industrial' | 'sport' | 'funds' | 'personal' | 'core'>('industrial');
  let challenge = $state('');

  let isSubmitting = $state(false);
  let submittedLeadId = $state<string | null>(null);
  let formError = $state<string | null>(null);

  function selectVertical(focus: 'industrial' | 'sport' | 'funds' | 'personal' | 'core') {
    selectedFocus = focus;
    if (focus === 'industrial') vertical = 'industrial';
    else if (focus === 'funds') vertical = 'finance';
    else if (focus === 'sport') vertical = 'legal';
    else vertical = 'other';
  }

  async function handleSubmit(e: SubmitEvent) {
    e.preventDefault();
    formError = null;

    const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();
    if (!fullName || fullName.length < 2) {
      formError = lang === 'es' ? 'Por favor ingresa tu nombre y apellido.' : 'Please enter your first and last name.';
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email.trim())) {
      formError = lang === 'es' ? 'Ingresa un correo electrónico corporativo válido.' : 'Please enter a valid corporate email address.';
      return;
    }

    if (!company || company.trim().length < 2) {
      formError = lang === 'es' ? 'Ingresa el nombre de tu empresa u organización.' : 'Please enter your company or organization name.';
      return;
    }

    if (!challenge || challenge.trim().length < 8) {
      formError = lang === 'es' ? 'Describe brevemente tu cuello de botella u operación crítica.' : 'Please briefly describe your operational challenge.';
      return;
    }

    isSubmitting = true;

    try {
      const response = await fetch('/api/diagnostic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: fullName,
          email: email.trim(),
          company: company.trim(),
          role: jobTitle.trim() || (lang === 'es' ? 'Directivo de Operaciones' : 'Operations Leader'),
          vertical,
          challenge: `${phone ? `[Tel: ${phone}] ` : ''}[Focus: ${selectedFocus}] ${challenge.trim()}`
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        submittedLeadId = data.leadId || `diag_${Date.now()}`;
      } else {
        formError = data.errors ? data.errors.join(', ') : (lang === 'es' ? 'Ocurrió un error al procesar tu solicitud.' : 'An error occurred while submitting.');
      }
    } catch {
      formError = lang === 'es' ? 'Error de conexión con el servidor ZEA. Por favor reintenta.' : 'Network error communicating with ZEA server.';
    } finally {
      isSubmitting = false;
    }
  }

  function handleReset() {
    firstName = '';
    lastName = '';
    email = '';
    phone = '';
    jobTitle = '';
    company = '';
    challenge = '';
    selectedFocus = 'industrial';
    vertical = 'industrial';
    submittedLeadId = null;
    formError = null;
  }
</script>

{#if isOpen}
  <!-- Backdrop oscuro con blur que dimmea la web completa -->
  <div
    class="fixed inset-0 bg-black/75 backdrop-blur-xs z-50 transition-opacity cursor-pointer"
    onclick={onClose}
    onkeydown={(e) => e.key === 'Escape' && onClose()}
    tabindex="0"
    role="button"
    aria-label="Cerrar modal"
    in:fade={{ duration: 150 }}
    out:fade={{ duration: 150 }}
  ></div>

  <!-- Slide-Over Drawer derecho estilo Palantir con Titanium Monochrome de las screens del móvil -->
  <div
    class="fixed inset-y-0 right-0 z-50 w-full max-w-xl bg-[#0A0A0C] border-l border-[#24242C] shadow-2xl flex flex-col font-sans select-none overflow-hidden"
    in:fly={{ x: 500, duration: 250 }}
    out:fly={{ x: 500, duration: 200 }}
    aria-labelledby="contact-drawer-title"
    role="dialog"
    aria-modal="true"
  >
    <!-- Top Bar: Close Button + Breadcrumbs + Developer Docs Link -->
    <div class="px-6 py-4.5 border-b border-[#1E1E26] flex items-center justify-between shrink-0 bg-[#0A0A0C]/95 backdrop-blur-md">
      <div class="flex items-center gap-3">
        <button
          type="button"
          onclick={onClose}
          aria-label={lang === 'es' ? 'Cerrar' : 'Close'}
          class="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-zinc-300 hover:text-white flex items-center justify-center transition cursor-pointer"
        >
          <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        <span class="text-[10px] font-mono uppercase tracking-widest text-zinc-500 font-semibold">
          {lang === 'es' ? 'CONTACTO / SOLICITUD DE DEMO OPERATIVA' : 'CONTACT / DEMO REQUEST & INQUIRY'}
        </span>
      </div>

      <a
        href="https://github.com/ZeaCl"
        target="_blank"
        rel="noopener noreferrer"
        class="text-[10.5px] font-mono text-zinc-400 hover:text-white flex items-center gap-1 transition cursor-pointer"
      >
        <span>DEVELOPER SDK</span>
        <span>↗</span>
      </a>
    </div>

    <!-- Scrollable Body Content -->
    <div class="flex-1 overflow-y-auto px-6 sm:px-8 py-6 space-y-6">
      {#if submittedLeadId}
        <!-- Success Confirmation State (estilo ZeaFocusCard nativo) -->
        <div class="space-y-5 pt-8 text-left" in:fade={{ duration: 150 }}>
          <div class="w-12 h-12 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white text-xl font-bold font-mono">
            ✓
          </div>

          <div>
            <span class="text-[10.5px] font-mono uppercase tracking-widest text-emerald-400 font-semibold block mb-1">
              {lang === 'es' ? 'SOLICITUD RECIBIDA' : 'REQUEST SUBMITTED'}
            </span>
            <h3 class="text-2xl font-bold tracking-tight text-white leading-tight">
              {lang === 'es' ? 'Diagnóstico y Demo en Proceso' : 'Operations Diagnostic In Review'}
            </h3>
            <p class="text-xs text-zinc-400 mt-2 leading-relaxed">
              {lang === 'es'
                ? `Hemos registrado la solicitud de ${company || 'tu organización'}. Un director técnico de ZEA revisará tus antecedentes para coordinar una demo operativa de la arquitectura agéntica en menos de 24 horas hábiles.`
                : `We received your inquiry for ${company || 'your organization'}. A ZEA technical director will review your workflows and schedule a mission-critical demo within 24 business hours.`}
            </p>
          </div>

          <div class="p-4 rounded-2xl bg-[#141418] border border-[#24242C] space-y-2">
            <div class="flex items-center justify-between text-xs">
              <span class="text-zinc-500 font-mono">Folio ID:</span>
              <span class="text-white font-mono font-semibold">{submittedLeadId}</span>
            </div>
            <div class="flex items-center justify-between text-xs">
              <span class="text-zinc-500 font-mono">{lang === 'es' ? 'Foco Operativo:' : 'Operational Focus:'}</span>
              <span class="text-white font-mono uppercase font-semibold">{selectedFocus}</span>
            </div>
          </div>

          <div class="pt-4 flex gap-3">
            <button
              type="button"
              onclick={onClose}
              class="flex-1 py-3 px-4 rounded-xl bg-white hover:bg-zinc-200 text-black font-bold text-xs transition cursor-pointer shadow-md"
            >
              {lang === 'es' ? 'Volver a la Plataforma' : 'Return to Platform'}
            </button>
            <button
              type="button"
              onclick={handleReset}
              class="py-3 px-4 rounded-xl bg-[#141418] border border-white/15 text-zinc-300 hover:text-white font-medium text-xs transition cursor-pointer"
            >
              {lang === 'es' ? 'Nueva Consulta' : 'New Inquiry'}
            </button>
          </div>
        </div>
      {:else}
        <!-- Form Header estilo Palantir con tipografía nítida -->
        <div class="space-y-2 text-left">
          <h2 id="contact-drawer-title" class="text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-[1.15]">
            {lang === 'es'
              ? '¿Interesado en resolver tus operaciones críticas?'
              : 'Interested in solving your mission-critical operations?'}
          </h2>
          <p class="text-xs text-zinc-400 font-sans leading-relaxed">
            {lang === 'es'
              ? 'Cuéntanos sobre tus flujos de trabajo, faenas industriales o desafíos de gobernanza para evaluar viabilidad y arquitectura.'
              : 'Tell us about your workflows, field operations, or governance challenges to assess technical feasibility and target architecture.'}
          </p>
        </div>

        {#if formError}
          <div class="p-3 rounded-xl bg-red-950/60 border border-red-500/30 text-red-200 text-xs flex items-center gap-2" in:fade={{ duration: 100 }}>
            <span class="w-1.5 h-1.5 rounded-full bg-red-400"></span>
            <span>{formError}</span>
          </div>
        {/if}

        <!-- Form Body con inputs estilizados tipo screen nativa -->
        <form onsubmit={handleSubmit} class="space-y-4.5 text-left">
          <!-- First & Last Name -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div class="space-y-1.5">
              <label for="first-name-input" class="block text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-semibold">
                {lang === 'es' ? 'NOMBRE *' : 'FIRST NAME *'}
              </label>
              <input
                id="first-name-input"
                type="text"
                bind:value={firstName}
                required
                placeholder={lang === 'es' ? 'Ej: Carlos' : 'e.g., Charles'}
                class="w-full bg-[#141418] border border-[#26262E] focus:border-white focus:outline-none rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-600 transition"
              />
            </div>

            <div class="space-y-1.5">
              <label for="last-name-input" class="block text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-semibold">
                {lang === 'es' ? 'APELLIDO *' : 'LAST NAME *'}
              </label>
              <input
                id="last-name-input"
                type="text"
                bind:value={lastName}
                required
                placeholder={lang === 'es' ? 'Ej: Hinostroza' : 'e.g., Foster'}
                class="w-full bg-[#141418] border border-[#26262E] focus:border-white focus:outline-none rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-600 transition"
              />
            </div>
          </div>

          <!-- Business Email Address -->
          <div class="space-y-1.5">
            <label for="email-input" class="block text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-semibold">
              {lang === 'es' ? 'CORREO CORPORATIVO *' : 'BUSINESS EMAIL ADDRESS *'}
            </label>
            <input
              id="email-input"
              type="email"
              bind:value={email}
              required
              placeholder={lang === 'es' ? 'tu.nombre@empresa.com' : 'you@company.com'}
              class="w-full bg-[#141418] border border-[#26262E] focus:border-white focus:outline-none rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-600 transition"
            />
          </div>

          <!-- Phone Number & Job Title -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div class="space-y-1.5">
              <label for="phone-input" class="block text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-semibold">
                {lang === 'es' ? 'TELÉFONO' : 'PHONE NUMBER'}
              </label>
              <input
                id="phone-input"
                type="tel"
                bind:value={phone}
                placeholder="+56 9 1234 5678"
                class="w-full bg-[#141418] border border-[#26262E] focus:border-white focus:outline-none rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-600 transition"
              />
            </div>

            <div class="space-y-1.5">
              <label for="job-title-input" class="block text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-semibold">
                {lang === 'es' ? 'CARGO / ROL' : 'JOB TITLE'}
              </label>
              <input
                id="job-title-input"
                type="text"
                bind:value={jobTitle}
                placeholder={lang === 'es' ? 'Ej: Gerente de Operaciones / CTO' : 'e.g., VP of Operations / CTO'}
                class="w-full bg-[#141418] border border-[#26262E] focus:border-white focus:outline-none rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-600 transition"
              />
            </div>
          </div>

          <!-- Company / Institution -->
          <div class="space-y-1.5">
            <label for="company-input" class="block text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-semibold">
              {lang === 'es' ? 'EMPRESA / INSTITUCIÓN *' : 'COMPANY / INSTITUTION *'}
            </label>
            <input
              id="company-input"
              type="text"
              bind:value={company}
              required
              placeholder={lang === 'es' ? 'Ej: Minera X, Aqua Y, Constructora Z' : 'e.g., Enterprise Corp'}
              class="w-full bg-[#141418] border border-[#26262E] focus:border-white focus:outline-none rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-600 transition"
            />
          </div>

          <!-- Vertical Selection Pills (estilo GliaBar chips) -->
          <div class="space-y-2 pt-1">
            <span class="block text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-semibold">
              {lang === 'es' ? 'ÁREA / FOCO OPERACIONAL' : 'OPERATIONAL FOCUS'}
            </span>
            <div class="flex flex-wrap gap-2">
              <button
                type="button"
                onclick={() => selectVertical('industrial')}
                class="px-3 py-1.5 rounded-full text-xs font-mono transition cursor-pointer {selectedFocus === 'industrial' ? 'bg-white text-black font-bold' : 'bg-[#141418] border border-[#26262E] text-zinc-400 hover:text-white'}"
              >
                Industrial
              </button>

              <button
                type="button"
                onclick={() => selectVertical('sport')}
                class="px-3 py-1.5 rounded-full text-xs font-mono transition cursor-pointer {selectedFocus === 'sport' ? 'bg-white text-black font-bold' : 'bg-[#141418] border border-[#26262E] text-zinc-400 hover:text-white'}"
              >
                Sport
              </button>

              <button
                type="button"
                onclick={() => selectVertical('funds')}
                class="px-3 py-1.5 rounded-full text-xs font-mono transition cursor-pointer {selectedFocus === 'funds' ? 'bg-white text-black font-bold' : 'bg-[#141418] border border-[#26262E] text-zinc-400 hover:text-white'}"
              >
                Funds
              </button>

              <button
                type="button"
                onclick={() => selectVertical('personal')}
                class="px-3 py-1.5 rounded-full text-xs font-mono transition cursor-pointer {selectedFocus === 'personal' ? 'bg-white text-black font-bold' : 'bg-[#141418] border border-[#26262E] text-zinc-400 hover:text-white'}"
              >
                Personal
              </button>

              <button
                type="button"
                onclick={() => selectVertical('core')}
                class="px-3 py-1.5 rounded-full text-xs font-mono transition cursor-pointer {selectedFocus === 'core' ? 'bg-white text-black font-bold' : 'bg-[#141418] border border-[#26262E] text-zinc-400 hover:text-white'}"
              >
                Platform Core
              </button>
            </div>
          </div>

          <!-- Operational Challenge / Requirements -->
          <div class="space-y-1.5 pt-1">
            <label for="challenge-input" class="block text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-semibold">
              {lang === 'es' ? 'DESAFÍO OPERACIONAL / DESCRIPCIÓN *' : 'OPERATIONAL CHALLENGE / SCOPE *'}
            </label>
            <textarea
              id="challenge-input"
              bind:value={challenge}
              required
              rows="3"
              placeholder={lang === 'es' ? 'Describe brevemente tus procesos, faenas o flujos críticos a digitalizar...' : 'Describe your operational bottleneck, field challenges, or target workflow...'}
              class="w-full bg-[#141418] border border-[#26262E] focus:border-white focus:outline-none rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-600 transition resize-none leading-relaxed"
            ></textarea>
          </div>

          <!-- Submit Button (estilo exacto del botón de Zea Personal en el móvil) -->
          <div class="pt-3">
            <button
              type="submit"
              disabled={isSubmitting}
              data-testid="contact-submit-btn"
              class="w-full py-3.5 px-5 rounded-xl bg-white hover:bg-zinc-200 text-black font-bold text-xs tracking-tight transition cursor-pointer shadow-lg active:scale-[0.99] flex items-center justify-center gap-2 disabled:bg-zinc-700 disabled:text-zinc-400"
            >
              {#if isSubmitting}
                <span class="w-3.5 h-3.5 rounded-full border-2 border-black border-t-transparent animate-spin"></span>
                <span>{lang === 'es' ? 'Enviando Solicitud...' : 'Submitting Request...'}</span>
              {:else}
                <span>{lang === 'es' ? 'Enviar Solicitud de Operaciones' : 'Submit Operations Request'}</span>
                <span>→</span>
              {/if}
            </button>
          </div>
        </form>
      {/if}
    </div>
  </div>
{/if}
