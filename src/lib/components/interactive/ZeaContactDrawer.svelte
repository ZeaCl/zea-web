<script lang="ts">
  import { fade, fly } from 'svelte/transition';
  import type { IndustryVertical } from '$lib/domain/entities/LeadDiagnostic';

  let {
    isOpen = false,
    lang = 'es',
    initialFocus = 'industrial',
    onClose
  }: {
    isOpen: boolean;
    lang?: 'es' | 'en';
    initialFocus?: 'industrial' | 'sport' | 'funds' | 'personal' | 'core';
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

  $effect(() => {
    if (initialFocus) {
      selectVertical(initialFocus);
    }
  });

  // Honeypot anti-spam trap (invisible to human users)
  let honeypot = $state('');

  // Touched state for inline interactive validation
  let touched = $state({
    firstName: false,
    lastName: false,
    email: false,
    phone: false,
    jobTitle: false,
    company: false,
    challenge: false
  });

  let isSubmitting = $state(false);
  let submittedLeadId = $state<string | null>(null);
  let formError = $state<string | null>(null);

  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const phoneRegex = /^[+0-9\s\-()]{7,25}$/;

  let firstNameError = $derived.by(() => {
    if (!touched.firstName) return null;
    const val = firstName.trim();
    if (!val) return lang === 'es' ? 'El nombre es obligatorio.' : 'First name is required.';
    if (val.length < 2) return lang === 'es' ? 'Debe tener al menos 2 caracteres.' : 'Must be at least 2 characters.';
    return null;
  });

  let lastNameError = $derived.by(() => {
    if (!touched.lastName) return null;
    const val = lastName.trim();
    if (!val) return lang === 'es' ? 'El apellido es obligatorio.' : 'Last name is required.';
    if (val.length < 2) return lang === 'es' ? 'Debe tener al menos 2 caracteres.' : 'Must be at least 2 characters.';
    return null;
  });

  let emailError = $derived.by(() => {
    if (!touched.email) return null;
    const val = email.trim();
    if (!val) return lang === 'es' ? 'El correo corporativo es obligatorio.' : 'Corporate email is required.';
    if (!emailRegex.test(val)) return lang === 'es' ? 'Ingresa un correo corporativo válido.' : 'Enter a valid corporate email.';
    return null;
  });

  let phoneError = $derived.by(() => {
    if (!touched.phone) return null;
    const val = phone.trim();
    if (val && !phoneRegex.test(val)) return lang === 'es' ? 'Formato de teléfono no válido.' : 'Invalid phone format.';
    return null;
  });

  let companyError = $derived.by(() => {
    if (!touched.company) return null;
    const val = company.trim();
    if (!val) return lang === 'es' ? 'La empresa u organización es obligatoria.' : 'Company name is required.';
    if (val.length < 2) return lang === 'es' ? 'Debe tener al menos 2 caracteres.' : 'Must be at least 2 characters.';
    return null;
  });

  let challengeError = $derived.by(() => {
    if (!touched.challenge) return null;
    const val = challenge.trim();
    if (!val) return lang === 'es' ? 'Describe tu desafío u operación crítica.' : 'Please describe your operational challenge.';
    if (val.length < 8) return lang === 'es' ? 'La descripción debe tener al menos 8 caracteres.' : 'Description must be at least 8 characters.';
    return null;
  });

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

    // Mark all as touched on submit attempt
    touched.firstName = true;
    touched.lastName = true;
    touched.email = true;
    touched.phone = true;
    touched.company = true;
    touched.challenge = true;

    // Bot detection via honeypot field
    if (honeypot.trim() !== '') {
      isSubmitting = true;
      setTimeout(() => {
        isSubmitting = false;
        submittedLeadId = `lead_${Date.now()}`;
      }, 500);
      return;
    }

    if (firstNameError || lastNameError || emailError || phoneError || companyError || challengeError) {
      formError = lang === 'es'
        ? 'Por favor completa y corrige los campos requeridos.'
        : 'Please complete and correct the required fields.';
      return;
    }

    const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();
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
          challenge: `${phone.trim() ? `[Tel: ${phone.trim()}] ` : ''}[Focus: ${selectedFocus}] ${challenge.trim()}`
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
    honeypot = '';
    selectedFocus = 'industrial';
    vertical = 'industrial';
    submittedLeadId = null;
    formError = null;
    touched = {
      firstName: false,
      lastName: false,
      email: false,
      phone: false,
      jobTitle: false,
      company: false,
      challenge: false
    };
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
    <!-- Top Bar: Close Button + Navigation Title -->
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

        <span class="text-[12px] font-medium text-zinc-400">
          {lang === 'es' ? 'Contacto · Solicitud de demo operativa' : 'Contact · Operations demo request'}
        </span>
      </div>
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
            <span class="text-xs font-semibold text-emerald-400 block mb-1">
              {lang === 'es' ? 'Solicitud recibida' : 'Request submitted'}
            </span>
            <h3 class="text-2xl font-bold tracking-tight text-white leading-tight">
              {lang === 'es' ? 'Diagnóstico y demo en proceso' : 'Operations diagnostic in review'}
            </h3>
            <p class="text-[13px] text-zinc-400 mt-2 leading-relaxed">
              {lang === 'es'
                ? `Hemos registrado la solicitud de ${company || 'tu organización'}. Un director técnico de ZEA revisará tus antecedentes para coordinar una demo operativa de la arquitectura agéntica en menos de 24 horas hábiles.`
                : `We received your inquiry for ${company || 'your organization'}. A ZEA technical director will review your workflows and schedule a mission-critical demo within 24 business hours.`}
            </p>
          </div>

          <div class="p-4 rounded-2xl bg-[#141418] border border-[#24242C] space-y-2">
            <div class="flex items-center justify-between text-xs">
              <span class="text-zinc-400">Folio ID:</span>
              <span class="text-white font-mono font-semibold">{submittedLeadId}</span>
            </div>
            <div class="flex items-center justify-between text-xs">
              <span class="text-zinc-400">{lang === 'es' ? 'Foco operativo:' : 'Operational focus:'}</span>
              <span class="text-white font-medium capitalize">{selectedFocus}</span>
            </div>
          </div>

          <div class="pt-4 flex gap-3">
            <button
              type="button"
              onclick={onClose}
              class="flex-1 py-3 px-4 rounded-2xl bg-white hover:bg-zinc-200 text-black font-semibold text-[13px] transition cursor-pointer shadow-md"
            >
              {lang === 'es' ? 'Volver a la plataforma' : 'Return to platform'}
            </button>
            <button
              type="button"
              onclick={handleReset}
              class="py-3 px-4 rounded-2xl bg-[#141418] border border-white/15 text-zinc-300 hover:text-white font-medium text-[13px] transition cursor-pointer"
            >
              {lang === 'es' ? 'Nueva consulta' : 'New inquiry'}
            </button>
          </div>
        </div>
      {:else}
        <!-- Form Header con tipografía nativa tipo mobile screen -->
        <div class="space-y-1.5 text-left">
          <h2 id="contact-drawer-title" class="text-2xl sm:text-[26px] font-bold tracking-tight text-white leading-snug">
            {lang === 'es'
              ? '¿Interesado en resolver tus operaciones críticas?'
              : 'Interested in solving your mission-critical operations?'}
          </h2>
          <p class="text-[13px] text-zinc-400 leading-relaxed font-normal">
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
        <form onsubmit={handleSubmit} novalidate class="space-y-4 text-left">
          <!-- Honeypot Bot Trap: invisible to human users and assistive tech -->
          <div style="position: absolute; left: -9999px; opacity: 0; pointer-events: none; width: 0; height: 0;" aria-hidden="true" tabindex="-1">
            <label for="company-website-hp">Website</label>
            <input
              id="company-website-hp"
              type="text"
              name="company_website_hp"
              tabindex="-1"
              autocomplete="off"
              bind:value={honeypot}
            />
          </div>

          <!-- First & Last Name -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div class="space-y-1.5">
              <label for="first-name-input" class="block text-[12.5px] font-medium text-zinc-300">
                {lang === 'es' ? 'Nombre' : 'First name'} <span class="text-zinc-500">*</span>
              </label>
              <input
                id="first-name-input"
                type="text"
                autocomplete="given-name"
                maxlength="80"
                bind:value={firstName}
                onblur={() => touched.firstName = true}
                aria-invalid={!!firstNameError}
                aria-describedby={firstNameError ? "first-name-error" : undefined}
                required
                placeholder={lang === 'es' ? 'Ej: Carlos' : 'e.g., Charles'}
                class="w-full bg-[#141418] border {firstNameError ? 'border-red-500/80 bg-red-950/20 text-red-100 focus:border-red-400' : 'border-[#26262E] focus:border-white'} focus:outline-none rounded-xl px-3.5 py-2.5 text-[13px] text-white placeholder-zinc-500 transition"
              />
              {#if firstNameError}
                <p id="first-name-error" role="alert" class="text-[11px] text-red-400 mt-1 flex items-center gap-1">
                  <span>⚠</span> {firstNameError}
                </p>
              {/if}
            </div>

            <div class="space-y-1.5">
              <label for="last-name-input" class="block text-[12.5px] font-medium text-zinc-300">
                {lang === 'es' ? 'Apellido' : 'Last name'} <span class="text-zinc-500">*</span>
              </label>
              <input
                id="last-name-input"
                type="text"
                autocomplete="family-name"
                maxlength="80"
                bind:value={lastName}
                onblur={() => touched.lastName = true}
                aria-invalid={!!lastNameError}
                aria-describedby={lastNameError ? "last-name-error" : undefined}
                required
                placeholder={lang === 'es' ? 'Ej: Hinostroza' : 'e.g., Foster'}
                class="w-full bg-[#141418] border {lastNameError ? 'border-red-500/80 bg-red-950/20 text-red-100 focus:border-red-400' : 'border-[#26262E] focus:border-white'} focus:outline-none rounded-xl px-3.5 py-2.5 text-[13px] text-white placeholder-zinc-500 transition"
              />
              {#if lastNameError}
                <p id="last-name-error" role="alert" class="text-[11px] text-red-400 mt-1 flex items-center gap-1">
                  <span>⚠</span> {lastNameError}
                </p>
              {/if}
            </div>
          </div>

          <!-- Business Email Address -->
          <div class="space-y-1.5">
            <label for="email-input" class="block text-[12.5px] font-medium text-zinc-300">
              {lang === 'es' ? 'Correo corporativo' : 'Business email'} <span class="text-zinc-500">*</span>
            </label>
            <input
              id="email-input"
              type="email"
              autocomplete="email"
              maxlength="120"
              bind:value={email}
              onblur={() => touched.email = true}
              aria-invalid={!!emailError}
              aria-describedby={emailError ? "email-error" : undefined}
              required
              placeholder={lang === 'es' ? 'tu.nombre@empresa.com' : 'you@company.com'}
              class="w-full bg-[#141418] border {emailError ? 'border-red-500/80 bg-red-950/20 text-red-100 focus:border-red-400' : 'border-[#26262E] focus:border-white'} focus:outline-none rounded-xl px-3.5 py-2.5 text-[13px] text-white placeholder-zinc-500 transition"
            />
            {#if emailError}
              <p id="email-error" role="alert" class="text-[11px] text-red-400 mt-1 flex items-center gap-1">
                <span>⚠</span> {emailError}
              </p>
            {/if}
          </div>

          <!-- Phone Number & Job Title -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div class="space-y-1.5">
              <label for="phone-input" class="block text-[12.5px] font-medium text-zinc-300">
                {lang === 'es' ? 'Teléfono' : 'Phone number'} <span class="text-zinc-500 text-[11px]">({lang === 'es' ? 'opcional' : 'optional'})</span>
              </label>
              <input
                id="phone-input"
                type="tel"
                autocomplete="tel"
                maxlength="30"
                bind:value={phone}
                onblur={() => touched.phone = true}
                aria-invalid={!!phoneError}
                aria-describedby={phoneError ? "phone-error" : undefined}
                placeholder="+56 9 1234 5678"
                class="w-full bg-[#141418] border {phoneError ? 'border-red-500/80 bg-red-950/20 text-red-100 focus:border-red-400' : 'border-[#26262E] focus:border-white'} focus:outline-none rounded-xl px-3.5 py-2.5 text-[13px] text-white placeholder-zinc-500 transition"
              />
              {#if phoneError}
                <p id="phone-error" role="alert" class="text-[11px] text-red-400 mt-1 flex items-center gap-1">
                  <span>⚠</span> {phoneError}
                </p>
              {/if}
            </div>

            <div class="space-y-1.5">
              <label for="job-title-input" class="block text-[12.5px] font-medium text-zinc-300">
                {lang === 'es' ? 'Cargo o rol' : 'Job title'}
              </label>
              <input
                id="job-title-input"
                type="text"
                autocomplete="organization-title"
                maxlength="100"
                bind:value={jobTitle}
                placeholder={lang === 'es' ? 'Ej: Gerente de Operaciones / CTO' : 'e.g., VP of Operations / CTO'}
                class="w-full bg-[#141418] border border-[#26262E] focus:border-white focus:outline-none rounded-xl px-3.5 py-2.5 text-[13px] text-white placeholder-zinc-500 transition"
              />
            </div>
          </div>

          <!-- Company / Institution -->
          <div class="space-y-1.5">
            <label for="company-input" class="block text-[12.5px] font-medium text-zinc-300">
              {lang === 'es' ? 'Empresa u organización' : 'Company or organization'} <span class="text-zinc-500">*</span>
            </label>
            <input
              id="company-input"
              type="text"
              autocomplete="organization"
              maxlength="100"
              bind:value={company}
              onblur={() => touched.company = true}
              aria-invalid={!!companyError}
              aria-describedby={companyError ? "company-error" : undefined}
              required
              placeholder={lang === 'es' ? 'Ej: Minera X, Aqua Y, Constructora Z' : 'e.g., Enterprise Corp'}
              class="w-full bg-[#141418] border {companyError ? 'border-red-500/80 bg-red-950/20 text-red-100 focus:border-red-400' : 'border-[#26262E] focus:border-white'} focus:outline-none rounded-xl px-3.5 py-2.5 text-[13px] text-white placeholder-zinc-500 transition"
            />
            {#if companyError}
              <p id="company-error" role="alert" class="text-[11px] text-red-400 mt-1 flex items-center gap-1">
                <span>⚠</span> {companyError}
              </p>
            {/if}
          </div>

          <!-- Vertical Selection Pills (estilo GliaBar chips) -->
          <div class="space-y-2 pt-1">
            <span class="block text-[12.5px] font-medium text-zinc-300">
              {lang === 'es' ? 'Área o foco operacional' : 'Operational focus'}
            </span>
            <div class="flex flex-wrap gap-2">
              <button
                type="button"
                onclick={() => selectVertical('industrial')}
                class="px-3.5 py-1.5 rounded-full text-xs font-medium transition cursor-pointer {selectedFocus === 'industrial' ? 'bg-white text-black font-semibold shadow-xs' : 'bg-[#141418] border border-[#26262E] text-zinc-300 hover:text-white hover:border-[#383844]'}"
              >
                Allisbox
              </button>

              <button
                type="button"
                onclick={() => selectVertical('sport')}
                class="px-3.5 py-1.5 rounded-full text-xs font-medium transition cursor-pointer {selectedFocus === 'sport' ? 'bg-white text-black font-semibold shadow-xs' : 'bg-[#141418] border border-[#26262E] text-zinc-300 hover:text-white hover:border-[#383844]'}"
              >
                Gus Training
              </button>

              <button
                type="button"
                onclick={() => selectVertical('funds')}
                class="px-3.5 py-1.5 rounded-full text-xs font-medium transition cursor-pointer {selectedFocus === 'funds' ? 'bg-white text-black font-semibold shadow-xs' : 'bg-[#141418] border border-[#26262E] text-zinc-300 hover:text-white hover:border-[#383844]'}"
              >
                Cooper
              </button>

              <button
                type="button"
                onclick={() => selectVertical('core')}
                class="px-3.5 py-1.5 rounded-full text-xs font-medium transition cursor-pointer {selectedFocus === 'core' ? 'bg-white text-black font-semibold shadow-xs' : 'bg-[#141418] border border-[#26262E] text-zinc-300 hover:text-white hover:border-[#383844]'}"
              >
                Platform Core
              </button>
            </div>
          </div>

          <!-- Operational Challenge / Requirements -->
          <div class="space-y-1.5 pt-1">
            <div class="flex items-center justify-between">
              <label for="challenge-input" class="block text-[12.5px] font-medium text-zinc-300">
                {lang === 'es' ? 'Desafío operacional o requerimiento' : 'Operational challenge or scope'} <span class="text-zinc-500">*</span>
              </label>
              <span class="text-[11px] font-mono text-zinc-500">
                {challenge.length}/1500
              </span>
            </div>
            <textarea
              id="challenge-input"
              bind:value={challenge}
              onblur={() => touched.challenge = true}
              aria-invalid={!!challengeError}
              aria-describedby={challengeError ? "challenge-error" : undefined}
              maxlength="1500"
              required
              rows="3"
              placeholder={lang === 'es' ? 'Describe brevemente tus procesos, faenas o flujos críticos a digitalizar...' : 'Describe your operational bottleneck, field challenges, or target workflow...'}
              class="w-full bg-[#141418] border {challengeError ? 'border-red-500/80 bg-red-950/20 text-red-100 focus:border-red-400' : 'border-[#26262E] focus:border-white'} focus:outline-none rounded-xl px-3.5 py-2.5 text-[13px] text-white placeholder-zinc-500 transition resize-none leading-relaxed"
            ></textarea>
            {#if challengeError}
              <p id="challenge-error" role="alert" class="text-[11px] text-red-400 mt-1 flex items-center gap-1">
                <span>⚠</span> {challengeError}
              </p>
            {/if}
          </div>

          <!-- Submit Button (estilo exacto del botón de Zea Personal en el móvil) -->
          <div class="pt-3">
            <button
              type="submit"
              disabled={isSubmitting}
              data-testid="contact-submit-btn"
              class="w-full py-3.5 px-5 rounded-2xl bg-white hover:bg-zinc-200 text-black font-semibold text-[13.5px] tracking-tight transition cursor-pointer shadow-lg active:scale-[0.99] flex items-center justify-center gap-2 disabled:bg-zinc-700 disabled:text-zinc-400"
            >
              {#if isSubmitting}
                <span class="w-3.5 h-3.5 rounded-full border-2 border-black border-t-transparent animate-spin"></span>
                <span>{lang === 'es' ? 'Enviando solicitud...' : 'Submitting request...'}</span>
              {:else}
                <span>{lang === 'es' ? 'Enviar solicitud de operaciones' : 'Submit operations request'}</span>
                <span class="text-sm">→</span>
              {/if}
            </button>
          </div>
        </form>
      {/if}
    </div>
  </div>
{/if}
