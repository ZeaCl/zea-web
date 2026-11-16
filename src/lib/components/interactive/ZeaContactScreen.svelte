<script lang="ts">
  import { fade } from 'svelte/transition';
  import { dragScroll } from '../ds/dragScroll';
  import ZeaModeToggle from '../ds/ZeaModeToggle.svelte';

  let {
    lang = 'es',
    platform = 'ios',
    initialFocus = 'funds',
    onSelectProduct = (_product: 'venture' | 'edge' | 'sport') => {}
  }: {
    lang?: 'en' | 'es';
    platform?: 'ios' | 'android';
    initialFocus?: 'funds' | 'industrial' | 'sport' | 'core';
    onSelectProduct?: (product: 'venture' | 'edge' | 'sport') => void;
  } = $props();

  import { untrack } from 'svelte';

  const es = $derived(lang !== 'en');

  // Modes: 'chat' (AI Agent Onboarding) | 'app' (Direct Human Operator & Channels)
  let viewMode = $state<'chat' | 'app'>('chat');
  let selectedProduct = $state<'funds' | 'industrial' | 'sport' | null>(
    untrack(() => initialFocus === 'funds' ? 'funds' : initialFocus === 'industrial' ? 'industrial' : initialFocus === 'sport' ? 'sport' : null)
  );

  let userInput = $state('');
  let isAgentTyping = $state(false);

  // Messages log
  let chatMessages = $state<Array<{
    id: string;
    sender: 'agent' | 'user';
    text: string;
    time: string;
    action?: 'whatsapp' | 'product_pills' | null;
  }>>([
    {
      id: 'msg-1',
      sender: 'agent',
      text: untrack(() => lang !== 'en')
        ? 'Hola, soy el agente de ventas y onboarding de ZEA. Diseñamos e implementamos sistemas de inteligencia artificial para operaciones de misión crítica.'
        : 'Hello, I am ZEA\'s onboarding and sales agent. We engineer and deploy agentic AI systems for mission-critical operations.',
      time: '10:00',
      action: null
    },
    {
      id: 'msg-2',
      sender: 'agent',
      text: untrack(() => lang !== 'en')
        ? '¿Para qué área u operación te gustaría evaluar una implementación técnica?'
        : 'Which business area or technical operation are you looking to evaluate?',
      time: '10:01',
      action: 'product_pills'
    }
  ]);

  function sendUserChoice(product: 'funds' | 'industrial' | 'sport') {
    selectedProduct = product;
    const prodNames = {
      funds: 'Cooper (Capital Privado)',
      industrial: 'Allisbox (Infraestructura Industrial)',
      sport: 'Gus Training (Deporte & Rendimiento)'
    };

    chatMessages = [
      ...chatMessages,
      {
        id: `u-${Date.now()}`,
        sender: 'user',
        text: es ? `Me interesa evaluar ${prodNames[product]}.` : `I am interested in evaluating ${prodNames[product]}.`,
        time: '10:02'
      }
    ];

    isAgentTyping = true;
    setTimeout(() => {
      isAgentTyping = false;
      const responses = {
        funds: es
          ? 'Excelente elección. Cooper automatiza gobernanza de liquidez, llamadas de capital y balances contables auditables en tiempo real para GPs y fondos privados.\n\n¿Deseas coordinar una sesión técnica de 20 minutos con Carlos Hinostroza (Tech Lead) por WhatsApp?'
          : 'Great choice. Cooper automates liquidity governance, capital calls, and real-time auditable balance sheets for GPs and private funds.\n\nWould you like to coordinate a 20-minute technical session with Carlos Hinostroza via WhatsApp?',
        industrial: es
          ? 'Perfecto. Allisbox es el gemelo digital 3D y centro de control para faenas de asfalto, cubicación NCh 353 y mantención de activos en minería y obras civiles complejas.\n\n¿Quieres que revisemos la viabilidad en tu faena por WhatsApp?'
          : 'Understood. Allisbox provides 3D digital twins, NCh 353 takeoff calculations, and active maintenance tracking for mining, asphalt, and civil infrastructure.\n\nWould you like to connect directly via WhatsApp to review your operational site?',
        sport: es
          ? 'Gus Training automatiza agenda dinámica, cobros recurrentes y monitoreo biométrico de atletas y academias de alto rendimiento.\n\n¿Te gustaría coordinar una demo funcional directa por WhatsApp?'
          : 'Gus Training automates dynamic scheduling, recurring billing, and biometric performance tracking for athletic academies.\n\nWould you like to coordinate a direct functional demo via WhatsApp?'
      };

      chatMessages = [
        ...chatMessages,
        {
          id: `a-${Date.now()}`,
          sender: 'agent',
          text: responses[product],
          time: '10:03',
          action: 'whatsapp'
        }
      ];
    }, 500);
  }

  function handleSendText() {
    if (!userInput.trim()) return;
    const txt = userInput.trim();
    userInput = '';

    chatMessages = [
      ...chatMessages,
      {
        id: `u-${Date.now()}`,
        sender: 'user',
        text: txt,
        time: '10:04'
      }
    ];

    isAgentTyping = true;
    setTimeout(() => {
      isAgentTyping = false;
      chatMessages = [
        ...chatMessages,
        {
          id: `a-${Date.now()}`,
          sender: 'agent',
          text: es
            ? 'Entendido. He registrado tu requerimiento. Puedes conectar de inmediato con nuestro equipo técnico por WhatsApp para responder en detalle:'
            : 'Understood. I have recorded your requirement. You can connect directly with our engineering team on WhatsApp to review in depth:',
          time: '10:05',
          action: 'whatsapp'
        }
      ];
    }, 600);
  }

  function openWhatsApp(customText?: string) {
    const defaultMsg = es
      ? 'Hola Carlos, estuve revisando zea.cl y me gustaría coordinar una demo técnica.'
      : 'Hello Carlos, I was reviewing zea.cl and would like to coordinate a technical demo.';
    const textToSend = customText || (
      selectedProduct === 'funds'
        ? (es ? 'Hola Carlos, estuve revisando Cooper (Capital Privado) en zea.cl y me gustaría coordinar una demo.' : 'Hello Carlos, I was reviewing Cooper on zea.cl and would like to coordinate a demo.')
        : selectedProduct === 'industrial'
          ? (es ? 'Hola Carlos, estuve revisando Allisbox (Infraestructura & Operaciones) en zea.cl y me gustaría evaluar una faena.' : 'Hello Carlos, I was reviewing Allisbox on zea.cl and would like to evaluate a site.')
          : selectedProduct === 'sport'
            ? (es ? 'Hola Carlos, estuve revisando Gus Training en zea.cl y me gustaría ver la plataforma para academias.' : 'Hello Carlos, I was reviewing Gus Training on zea.cl and would like a demo.')
            : defaultMsg
    );
    window.open(`https://wa.me/56992200230?text=${encodeURIComponent(textToSend)}`, '_blank');
  }
</script>

<div
  class="flex flex-col h-full w-full bg-[#0B0B0E] text-[#F4F4F6] relative overflow-hidden select-none font-sans"
  data-testid="zea-contact-screen"
>
  <!-- Fixed Top Header: Titanium Monochrome Navigation -->
  <header class="px-4 py-2.5 bg-black/95 backdrop-blur-md border-b border-[#222228] flex items-center justify-between z-20 shrink-0">
    <div class="flex items-center gap-2">
      <div class="w-7 h-7 rounded-full bg-white/10 border border-white/20 flex items-center justify-center font-bold text-white text-[11px] font-mono shadow-xs">
        Z
      </div>
      <div>
        <h2 class="text-[13px] font-bold tracking-tight text-white leading-none">
          ZEA Connect
        </h2>
        <p class="text-[9.5px] text-zinc-400 font-mono mt-0.5">
          {es ? 'Soporte & Ventas Directas' : 'Direct Sales & Support'}
        </p>
      </div>
    </div>

    <!-- Toggle: Chat AI vs Operador Humano -->
    <ZeaModeToggle
      theme="default"
      bind:viewMode
      variant="dark"
    />
  </header>

  <!-- Main Body Area -->
  <div class="flex-1 min-h-0 flex flex-col overflow-hidden bg-[#0B0B0E]">
    {#if viewMode === 'chat'}
      <!-- MODE A: AI AGENT CONVERSATION -->
      <div class="flex-1 overflow-y-auto px-3.5 py-3.5 space-y-3.5 text-left scroll-smooth" use:dragScroll>
        {#each chatMessages as msg (msg.id)}
          {#if msg.sender === 'user'}
            <div class="flex flex-col items-end gap-1 pl-10" in:fade={{ duration: 120 }}>
              <div class="bg-[#1C1C22] border border-white/20 text-white rounded-2xl rounded-br-xs px-3.5 py-2 shadow-xs">
                <p class="text-[12.5px] leading-relaxed">{msg.text}</p>
              </div>
              <span class="text-[9.5px] text-zinc-500 font-mono pr-1">{msg.time} <span class="text-white font-bold">✓✓</span></span>
            </div>
          {:else}
            <div class="flex flex-col items-start gap-1.5 pr-4 w-full" in:fade={{ duration: 120 }}>
              <div class="bg-[#141418] border border-[#26262E] text-zinc-200 rounded-2xl rounded-tl-xs px-3.5 py-2.5 max-w-[94%] space-y-2.5 shadow-md">
                <p class="text-[12.5px] leading-relaxed whitespace-pre-line">{msg.text}</p>

                <!-- Interactive Pills: Choose Product -->
                {#if msg.action === 'product_pills'}
                  <div class="pt-1.5 flex flex-col gap-1.5 border-t border-white/10">
                    <button
                      type="button"
                      onclick={() => sendUserChoice('funds')}
                      class="w-full text-left px-2.5 py-2 rounded-lg bg-[#1E1E24] hover:bg-[#2A2A33] border border-white/10 text-[11.5px] text-white font-medium flex items-center justify-between transition cursor-pointer"
                    >
                      <span>Cooper · Capital Privado</span>
                      <span class="text-zinc-400 font-mono text-[10px]">→</span>
                    </button>
                    <button
                      type="button"
                      onclick={() => sendUserChoice('industrial')}
                      class="w-full text-left px-2.5 py-2 rounded-lg bg-[#1E1E24] hover:bg-[#2A2A33] border border-white/10 text-[11.5px] text-white font-medium flex items-center justify-between transition cursor-pointer"
                    >
                      <span>Allisbox · Infraestructura & Faenas</span>
                      <span class="text-zinc-400 font-mono text-[10px]">→</span>
                    </button>
                    <button
                      type="button"
                      onclick={() => sendUserChoice('sport')}
                      class="w-full text-left px-2.5 py-2 rounded-lg bg-[#1E1E24] hover:bg-[#2A2A33] border border-white/10 text-[11.5px] text-white font-medium flex items-center justify-between transition cursor-pointer"
                    >
                      <span>Gus Training · Deporte & Rendimiento</span>
                      <span class="text-zinc-400 font-mono text-[10px]">→</span>
                    </button>
                  </div>
                {/if}

                <!-- Action: Open WhatsApp -->
                {#if msg.action === 'whatsapp'}
                  <div class="pt-2 border-t border-white/10">
                    <button
                      type="button"
                      onclick={() => openWhatsApp()}
                      class="w-full px-3 py-2.5 rounded-xl bg-white hover:bg-zinc-200 text-black font-semibold text-[12px] flex items-center justify-center gap-1.5 transition cursor-pointer shadow-md"
                    >
                      <span>{es ? 'Conversar por WhatsApp ↗' : 'Connect on WhatsApp ↗'}</span>
                    </button>
                  </div>
                {/if}
              </div>
            </div>
          {/if}
        {/each}

        {#if isAgentTyping}
          <div class="flex items-center gap-2 pt-1" in:fade={{ duration: 100 }}>
            <div class="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center text-[8px] font-bold text-white font-mono">Z</div>
            <div class="bg-[#141418] border border-[#24242C] rounded-full px-2.5 py-1 flex items-center gap-1 shadow-xs">
              <span class="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-bounce" style="animation-delay: 0ms"></span>
              <span class="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-bounce" style="animation-delay: 150ms"></span>
              <span class="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-bounce" style="animation-delay: 300ms"></span>
            </div>
          </div>
        {/if}
      </div>

      <!-- Bottom Chat Input Bar -->
      <form
        onsubmit={(e) => {
          e.preventDefault();
          handleSendText();
        }}
        class="px-3 py-2 bg-[#101014] border-t border-[#222228] flex items-center gap-2 shrink-0"
      >
        <input
          type="text"
          bind:value={userInput}
          placeholder={es ? 'Escribe tu consulta o requerimiento...' : 'Type your requirement or question...'}
          class="flex-1 bg-[#18181E] border border-white/15 rounded-full px-3.5 py-1.5 text-[12px] text-white placeholder-zinc-500 focus:outline-none focus:border-white/40 transition"
        />
        <button
          type="submit"
          disabled={!userInput.trim()}
          class="w-7 h-7 rounded-full bg-white disabled:bg-white/20 text-black flex items-center justify-center text-xs font-bold transition cursor-pointer disabled:cursor-not-allowed"
          aria-label={es ? 'Enviar mensaje' : 'Send message'}
        >
          ↑
        </button>
      </form>
    {:else}
      <!-- MODE B: DIRECT HUMAN OPERATOR (CARLOS HINOSTROZA & TECH TEAM) -->
      <div class="flex-1 overflow-y-auto px-4 py-4 space-y-4 text-left scroll-smooth" use:dragScroll>
        <!-- Executive Contact Header -->
        <div class="p-4 rounded-2xl bg-[#141418] border border-[#26262E] space-y-2">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-sm font-bold text-white font-mono">
              CH
            </div>
            <div>
              <h3 class="text-[14px] font-bold text-white leading-tight">Carlos Hinostroza</h3>
              <p class="text-[11px] text-zinc-400 font-mono">Tech Lead & Founder · ZEA</p>
            </div>
          </div>
          <p class="text-[12px] text-zinc-300 leading-relaxed pt-1">
            {es
              ? 'Atención directa para fundadores, gerentes de operaciones y comités de inversión que requieren evaluar factibilidad técnica y costos.'
              : 'Direct consultation for founders, operations leaders, and investment committees evaluating technical feasibility.'}
          </p>
        </div>

        <!-- Direct Channels Cards -->
        <div class="space-y-2.5">
          <!-- WhatsApp Primary Button -->
          <button
            type="button"
            onclick={() => openWhatsApp()}
            class="w-full p-3.5 rounded-xl bg-white hover:bg-zinc-200 text-black font-bold text-[13px] flex items-center justify-between transition cursor-pointer shadow-md"
          >
            <div class="flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-emerald-600"></span>
              <span>{es ? 'Conversar por WhatsApp' : 'Chat via WhatsApp'}</span>
            </div>
            <span class="text-xs font-mono">↗</span>
          </button>

          <!-- Email Secondary Card -->
          <a
            href="mailto:c@zea.cl?subject=Contacto%20Comercial%20ZEA"
            class="w-full p-3.5 rounded-xl bg-[#141418] hover:bg-[#1A1A22] border border-white/15 text-white text-[12.5px] flex items-center justify-between transition cursor-pointer block"
          >
            <div>
              <span class="font-medium text-white block">Email Corporativo</span>
              <span class="text-zinc-400 text-[11px] font-mono">c@zea.cl</span>
            </div>
            <span class="text-zinc-400 font-mono text-xs">→</span>
          </a>
        </div>

        <!-- Operational Commitments -->
        <div class="p-3.5 rounded-xl bg-[#101014] border border-[#222228] space-y-1.5 text-[11px] text-zinc-400 font-mono">
          <div class="flex items-center gap-2 text-zinc-300">
            <span class="text-emerald-400">●</span>
            <span>{es ? 'Respuesta en menos de 2 horas hábiles' : 'Response time under 2 business hours'}</span>
          </div>
          <div>{es ? 'Santiago, Chile · Infraestructura GCP Suramérica' : 'Santiago, Chile · GCP South America Infra'}</div>
        </div>
      </div>
    {/if}
  </div>
</div>
