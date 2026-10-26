<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { type Language } from '../../config/i18n';

  let {
    lang = 'es'
  }: {
    lang?: Language;
  } = $props();

  interface AgentNode {
    id: string;
    name: string;
    role: string;
    roleEn: string;
    x: number; // percentage 0-100
    y: number; // percentage 0-100
    color: string;
    accentGlow: string;
    status: 'ACTIVE' | 'REASONING' | 'SYNCED' | 'DISPATCHING';
    pulseRate: number;
    tasksCount: number;
    log: string[];
    logEn: string[];
  }

  interface DataPacket {
    fromId: string;
    toId: string;
    label: string;
    progress: number; // 0 to 1
    speed: number;
    color: string;
  }

  interface RippleWave {
    x: number;
    y: number;
    radius: number;
    maxRadius: number;
    color: string;
    alpha: number;
  }

  let canvasEl: HTMLCanvasElement;
  let containerEl: HTMLDivElement;
  let animFrameId: number;

  const agents: AgentNode[] = [
    {
      id: 'core',
      name: 'ZEA CORE ORCHESTRATOR',
      role: 'Núcleo Autónomo de Decisión y Consenso',
      roleEn: 'Autonomous Decision & Consensus Kernel',
      x: 50,
      y: 46,
      color: '#f97316',
      accentGlow: 'rgba(249, 115, 22, 0.4)',
      status: 'ACTIVE',
      pulseRate: 1.2,
      tasksCount: 4290,
      log: [
        'Consenso distribuido alcanzado entre 5 agentes especializados.',
        'Supervisando tolerancia de fallos y latencia P99 (1.4ms).',
        'Directiva de misión crítica en ejecución continua.'
      ],
      logEn: [
        'Distributed consensus achieved across 5 specialized agents.',
        'Supervising fault tolerance and P99 latency (1.4ms).',
        'Mission-critical directive under continuous execution.'
      ]
    },
    {
      id: 'legal',
      name: 'LEGAL CONTRACT AUDITOR',
      role: 'Auditoría Continua & Generación de Gantt',
      roleEn: 'Continuous Audit & Gantt Calculation',
      x: 23,
      y: 30,
      color: '#06b6d4',
      accentGlow: 'rgba(6, 182, 212, 0.4)',
      status: 'REASONING',
      pulseRate: 1.6,
      tasksCount: 2604,
      log: [
        'Extrayendo matriz de obligaciones de 18 adendas técnicas.',
        'Evaluando 456 dependencias de ruta crítica con holgura cero.',
        'Certificación de cumplimiento contractual vigente.'
      ],
      logEn: [
        'Extracting obligation matrix from 18 technical addenda.',
        'Evaluating 456 critical path milestones with zero slack.',
        'Contractual compliance verification active.'
      ]
    },
    {
      id: 'finance',
      name: 'DETERMINISTIC LEDGER',
      role: 'Balance Contable & Cálculo de AUM',
      roleEn: 'Accounting Balance & AUM Engine',
      x: 77,
      y: 30,
      color: '#10b981',
      accentGlow: 'rgba(16, 185, 129, 0.4)',
      status: 'SYNCED',
      pulseRate: 0.9,
      tasksCount: 1845,
      log: [
        'Motor determinista sin alucinación reconciliando custodios.',
        'Ejecución algorítmica de waterfall (LPs 80% / GP 20% carry).',
        'Descuadre contable verificado en libros: $0.00 USD.'
      ],
      logEn: [
        'Deterministic zero-hallucination engine reconciling custodians.',
        'Algorithmic waterfall execution (LPs 80% / GP 20% carry).',
        'Mathematical discrepancy certified: $0.00 USD.'
      ]
    },
    {
      id: 'field',
      name: 'FIELD TELEMETRY KERNEL',
      role: 'Supervisión en Terreno & Sensores IoT',
      roleEn: 'Field Supervision & IoT Stream',
      x: 30,
      y: 72,
      color: '#f59e0b',
      accentGlow: 'rgba(245, 158, 11, 0.4)',
      status: 'DISPATCHING',
      pulseRate: 1.4,
      tasksCount: 8920,
      log: [
        'Ingestando telemetría térmica de 14 camiones tolva en ruta.',
        'Tolerancia de extendido validada: +9°C sobre umbral de falla.',
        'Reconciliando cubicación de pesaje en báscula versus avance.'
      ],
      logEn: [
        'Ingesting thermal telemetry from 14 trucks in transit.',
        'Placement tolerance validated: +9°C above failure threshold.',
        'Cross-checking weight survey scale vs physical spread.'
      ]
    },
    {
      id: 'safety',
      name: 'SAFETY & COMPLIANCE GUARD',
      role: 'Guardrails Criptográficos & Políticas',
      roleEn: 'Cryptographic Guardrails & Policies',
      x: 70,
      y: 72,
      color: '#a855f7',
      accentGlow: 'rgba(168, 85, 247, 0.4)',
      status: 'ACTIVE',
      pulseRate: 1.1,
      tasksCount: 5120,
      log: [
        'Validando firmas ED25519 en cada intercambio entre agentes.',
        'Cero filtración de datos privados fuera del enclave seguro.',
        'Audit trail inmutable emitido a registro distribuido.'
      ],
      logEn: [
        'Validating ED25519 signatures on each inter-agent exchange.',
        'Zero private data exfiltration outside secure enclave.',
        'Immutable audit trail committed to distributed ledger.'
      ]
    },
    {
      id: 'edge',
      name: 'GLIA MOBILE RUNTIME',
      role: 'Ejecución Nativa Swift & Kotlin',
      roleEn: 'Native Swift & Kotlin Execution',
      x: 50,
      y: 18,
      color: '#e4e4e7',
      accentGlow: 'rgba(228, 228, 231, 0.4)',
      status: 'SYNCED',
      pulseRate: 1.3,
      tasksCount: 1420,
      log: [
        'Streaming reactivo de acciones hacia SwiftUI y Jetpack Compose.',
        'Arquitectura stateless: cero servidores intermedios requeridos.',
        'Latencia socket dispositivo-a-agente: 12ms.'
      ],
      logEn: [
        'Reactive action streaming into SwiftUI and Jetpack Compose.',
        'Stateless architecture: zero intermediary servers required.',
        'Device-to-agent socket latency: 12ms.'
      ]
    }
  ];

  let selectedAgent = $state<AgentNode | null>(agents[0]);
  let packets: DataPacket[] = [];
  let ripples: RippleWave[] = [];
  let lastEventTime = 0;
  let pulseCounter = 0;
  let isSimulatingBurst = $state(false);

  const connections = [
    { from: 'core', to: 'legal', label: 'CLAUSE_CHECK' },
    { from: 'core', to: 'finance', label: 'LEDGER_BAL' },
    { from: 'core', to: 'field', label: 'TELEMETRY_SYNC' },
    { from: 'core', to: 'safety', label: 'POLICY_AUDIT' },
    { from: 'core', to: 'edge', label: 'ACTION_STREAM' },
    { from: 'legal', to: 'safety', label: 'RISK_GATE' },
    { from: 'finance', to: 'safety', label: 'CARRY_VERIFY' },
    { from: 'field', to: 'core', label: 'GPS_HEAT_TICK' },
    { from: 'edge', to: 'core', label: 'USER_INTENT' }
  ];

  function triggerMissionEvent() {
    isSimulatingBurst = true;
    setTimeout(() => (isSimulatingBurst = false), 1800);

    // Create ripple at core
    const core = agents.find((a) => a.id === 'core')!;
    if (containerEl) {
      const rect = containerEl.getBoundingClientRect();
      const cx = (core.x / 100) * rect.width;
      const cy = (core.y / 100) * rect.height;

      ripples.push({
        x: cx,
        y: cy,
        radius: 10,
        maxRadius: Math.max(rect.width, rect.height) * 0.6,
        color: '#f97316',
        alpha: 0.8
      });

      // Spawn burst packets to all connected peers
      for (const conn of connections) {
        packets.push({
          fromId: conn.from,
          toId: conn.to,
          label: conn.label,
          progress: 0,
          speed: 0.015 + Math.random() * 0.01,
          color: agents.find((a) => a.id === conn.from)?.color || '#ffffff'
        });
      }
    }
  }

  function resizeCanvas() {
    if (!canvasEl || !containerEl) return;
    const rect = containerEl.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvasEl.width = rect.width * dpr;
    canvasEl.height = rect.height * dpr;
    canvasEl.style.width = `${rect.width}px`;
    canvasEl.style.height = `${rect.height}px`;
  }

  onMount(() => {
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    let lastTime = performance.now();

    function render(currentTime: number) {
      const delta = (currentTime - lastTime) / 1000;
      lastTime = currentTime;
      pulseCounter += delta;

      if (!canvasEl || !containerEl) {
        animFrameId = requestAnimationFrame(render);
        return;
      }

      const ctx = canvasEl.getContext('2d');
      if (!ctx) return;

      const dpr = window.devicePixelRatio || 1;
      const w = canvasEl.width / dpr;
      const h = canvasEl.height / dpr;

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, w, h);

      // Draw background ambient particles grid
      ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
      const step = 40;
      for (let x = step / 2; x < w; x += step) {
        for (let y = step / 2; y < h; y += step) {
          ctx.beginPath();
          ctx.arc(x, y, 0.8, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Draw active ripples
      for (let i = ripples.length - 1; i >= 0; i--) {
        const r = ripples[i];
        r.radius += delta * 240;
        r.alpha -= delta * 0.45;

        if (r.alpha <= 0 || r.radius >= r.maxRadius) {
          ripples.splice(i, 1);
          continue;
        }

        ctx.strokeStyle = r.color;
        ctx.globalAlpha = Math.max(0, r.alpha);
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.globalAlpha = 1;
      }

      // Periodically spawn data packets between agents
      if (currentTime - lastEventTime > 650) {
        lastEventTime = currentTime;
        const randomConn = connections[Math.floor(Math.random() * connections.length)];
        const fromAgent = agents.find((a) => a.id === randomConn.from);
        if (fromAgent) {
          packets.push({
            fromId: randomConn.from,
            toId: randomConn.to,
            label: randomConn.label,
            progress: 0,
            speed: 0.008 + Math.random() * 0.008,
            color: fromAgent.color
          });
        }
      }

      // Draw connection lines
      for (const conn of connections) {
        const a1 = agents.find((a) => a.id === conn.from);
        const a2 = agents.find((a) => a.id === conn.to);
        if (!a1 || !a2) continue;

        const x1 = (a1.x / 100) * w;
        const y1 = (a1.y / 100) * h;
        const x2 = (a2.x / 100) * w;
        const y2 = (a2.y / 100) * h;

        // Subtle curved arc
        const midX = (x1 + x2) / 2 + (y2 - y1) * 0.08;
        const midY = (y1 + y2) / 2 - (x2 - x1) * 0.08;

        const isConnectedToSelected =
          selectedAgent && (selectedAgent.id === a1.id || selectedAgent.id === a2.id);

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.quadraticCurveTo(midX, midY, x2, y2);
        ctx.strokeStyle = isConnectedToSelected
          ? 'rgba(255, 255, 255, 0.28)'
          : 'rgba(61, 61, 75, 0.35)';
        ctx.lineWidth = isConnectedToSelected ? 1.5 : 1;
        ctx.stroke();
      }

      // Draw and animate traveling data packets
      for (let i = packets.length - 1; i >= 0; i--) {
        const p = packets[i];
        p.progress += p.speed;

        if (p.progress >= 1) {
          packets.splice(i, 1);
          continue;
        }

        const a1 = agents.find((a) => a.id === p.fromId);
        const a2 = agents.find((a) => a.id === p.toId);
        if (!a1 || !a2) continue;

        const x1 = (a1.x / 100) * w;
        const y1 = (a1.y / 100) * h;
        const x2 = (a2.x / 100) * w;
        const y2 = (a2.y / 100) * h;

        const midX = (x1 + x2) / 2 + (y2 - y1) * 0.08;
        const midY = (y1 + y2) / 2 - (x2 - x1) * 0.08;

        // Quadratic bezier position at progress t
        const t = p.progress;
        const px = (1 - t) * (1 - t) * x1 + 2 * (1 - t) * t * midX + t * t * x2;
        const py = (1 - t) * (1 - t) * y1 + 2 * (1 - t) * t * midY + t * t * y2;

        // Glowing packet dot
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(px, py, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Tiny floating label
        ctx.font = '9px monospace';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.fillText(p.label, px + 6, py - 4);
      }

      ctx.restore();
      animFrameId = requestAnimationFrame(render);
    }

    animFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animFrameId);
      window.removeEventListener('resize', resizeCanvas);
    };
  });

  onDestroy(() => {
    if (typeof window !== 'undefined' && animFrameId) {
      cancelAnimationFrame(animFrameId);
    }
  });
</script>

<div
  bind:this={containerEl}
  class="relative w-full h-[calc(100vh-65px)] min-h-[640px] max-h-[1080px] bg-[#141418] overflow-hidden select-none flex flex-col justify-between"
>
  <!-- Background Canvas for particles, conduits and ripples -->
  <canvas
    bind:this={canvasEl}
    class="pointer-events-none absolute inset-0 z-0"
  ></canvas>

  <!-- Ambient Center Glow behind Core -->
  <div class="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-gradient-to-tr from-orange-500/10 via-cyan-500/5 to-purple-500/10 blur-3xl"></div>

  <!-- Top Status Bar & Disruptive Mission Statement -->
  <div class="relative z-10 px-6 pt-6 flex flex-wrap items-center justify-between gap-4 pointer-events-auto">
    <div class="flex items-center gap-3">
      <span class="flex h-2.5 w-2.5 relative">
        <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
        <span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
      </span>
      <span class="font-mono text-xs text-zinc-300 font-semibold tracking-wider uppercase">
        {lang === 'es' ? 'ENJAMBRE DE AGENTES AUTÓNOMOS EN VIVO' : 'LIVE AUTONOMOUS AGENT SWARM'}
      </span>
      <span class="hidden sm:inline-block text-zinc-600">|</span>
      <span class="hidden sm:inline-block font-mono text-[11px] text-zinc-400">
        P99 Latency: <span class="text-emerald-400 font-bold">1.2ms</span> · Protocol: <span class="text-zinc-300">ZEA-Phoenix-RPC</span>
      </span>
    </div>

    <!-- Disruptive Action Trigger -->
    <div class="flex items-center gap-3">
      <button
        type="button"
        onclick={triggerMissionEvent}
        class="z-btn z-btn--gradient-border z-btn--sm font-mono text-xs uppercase tracking-wider font-bold cursor-pointer shadow-lg {isSimulatingBurst ? 'scale-105 brightness-125' : ''}"
        data-testid="trigger-swarm-btn"
      >
        <span>⚡ {lang === 'es' ? 'Disparar Tarea de Misión Crítica' : 'Inject Mission-Critical Task'}</span>
      </button>
    </div>
  </div>

  <!-- Central Constellation Nodes (Interactive DOM Elements) -->
  <div class="relative z-10 flex-1 w-full h-full">
    {#each agents as agent}
      {@const isSelected = selectedAgent?.id === agent.id}
      <button
        type="button"
        onclick={() => (selectedAgent = agent)}
        style="left: {agent.x}%; top: {agent.y}%;"
        class="absolute -translate-x-1/2 -translate-y-1/2 group cursor-pointer text-left transition-transform duration-200 hover:scale-110 focus:outline-none"
        data-testid={`agent-node-${agent.id}`}
        aria-label={agent.name}
      >
        <!-- Outer Glowing Ring -->
        <div
          class="relative flex items-center justify-center rounded-2xl transition-all duration-300 {isSelected ? 'scale-110 shadow-2xl ring-2' : ''}"
          style="
            background: rgba(28, 28, 34, 0.88);
            border: 1px solid {isSelected ? agent.color : '#3d3d4b'};
            box-shadow: {isSelected ? `0 0 30px ${agent.accentGlow}` : '0 4px 20px rgba(0,0,0,0.5)'};
            backdrop-filter: blur(8px);
            padding: {agent.id === 'core' ? '14px 20px' : '10px 16px'};
          "
        >
          <!-- Pulsing Status Dot -->
          <div class="flex items-center gap-2.5">
            <span
              class="inline-block w-2.5 h-2.5 rounded-full"
              style="background-color: {agent.color}; box-shadow: 0 0 8px {agent.color};"
            ></span>
            <div>
              <div class="font-mono font-bold text-white tracking-wide {agent.id === 'core' ? 'text-xs' : 'text-[11px]'}">
                {agent.name}
              </div>
              <div class="text-[10px] font-mono text-zinc-400">
                {lang === 'es' ? agent.role : agent.roleEn}
              </div>
            </div>
          </div>

          <!-- Mini status tag -->
          <span
            class="ml-3 text-[9px] font-mono font-semibold px-1.5 py-0.5 rounded border"
            style="
              color: {agent.color};
              border-color: {agent.color}40;
              background-color: {agent.color}15;
            "
          >
            {agent.status}
          </span>
        </div>
      </button>
    {/each}
  </div>

  <!-- Bottom Drawer: Selected Agent Live Telemetry & Thought Log -->
  {#if selectedAgent}
    <div
      class="relative z-20 mx-auto w-full max-w-4xl px-4 pb-6 transition-all duration-300"
      data-testid="agent-telemetry-hud"
    >
      <div class="rounded-2xl border border-[#3d3d4b] bg-[#17171f]/95 backdrop-blur-xl p-5 shadow-2xl">
        <div class="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-[#2b2b38]">
          <div class="flex items-center gap-3">
            <span
              class="w-3 h-3 rounded-full"
              style="background-color: {selectedAgent.color}; box-shadow: 0 0 10px {selectedAgent.color};"
            ></span>
            <span class="font-mono text-xs font-bold text-white uppercase tracking-wider">
              {selectedAgent.name}
            </span>
            <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
              {selectedAgent.status}
            </span>
          </div>

          <div class="flex items-center gap-4 text-xs font-mono text-zinc-400">
            <span>{lang === 'es' ? 'Transacciones Auditadas' : 'Audited Operations'}: <strong class="text-white font-bold">{selectedAgent.tasksCount.toLocaleString()}</strong></span>
            <button
              type="button"
              onclick={() => (selectedAgent = null)}
              class="text-zinc-500 hover:text-white transition p-1"
              aria-label="Cerrar telemetría"
            >
              ✕
            </button>
          </div>
        </div>

        <!-- Live Agent Thought Stream Log -->
        <div class="pt-3 space-y-1.5 font-mono text-xs">
          {#each (lang === 'es' ? selectedAgent.log : selectedAgent.logEn) as logLine, idx}
            <div class="flex items-start gap-2 text-zinc-300">
              <span class="text-zinc-500 select-none text-[10px]">T+{idx * 140}ms</span>
              <span style="color: {selectedAgent.color};" class="font-bold">›</span>
              <span>{logLine}</span>
            </div>
          {/each}
        </div>
      </div>
    </div>
  {/if}
</div>
