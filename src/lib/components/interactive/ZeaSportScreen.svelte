<script lang="ts">
  import { fade } from 'svelte/transition';
  import { tick } from 'svelte';
  import { dragScroll } from '../ds/dragScroll';
  import ZeaModeToggle from '../ds/ZeaModeToggle.svelte';
  import ZeaFocusCard from '../ds/ZeaFocusCard.svelte';
  import ZeaConcentricRings from '../ds/ZeaConcentricRings.svelte';
  import ZeaTimeline from '../ds/ZeaTimeline.svelte';
  import ZeaApprovalCard from '../ds/ZeaApprovalCard.svelte';
  import ZeaMetricTrend from '../ds/ZeaMetricTrend.svelte';
  import ZeaGliaBar from '../ds/ZeaGliaBar.svelte';
  import ZeaSheet from '../ds/ZeaSheet.svelte';

  let {
    lang = 'es',
    platform = 'ios'
  }: {
    lang?: 'en' | 'es';
    platform?: 'ios' | 'android';
  } = $props();

  // Navigation and Mode states
  let activeTab = $state<'progress' | 'agenda' | 'students' | 'profile'>('progress');
  let viewMode = $state<'chat' | 'app'>('chat');
  
  // Interactive toast state
  let toastMessage = $state<string | null>(null);
  let toastTimeout: any = null;
  let pendingApproved = $state(false);
  let pendingRejected = $state(false);
  let checkinDone = $state(false);
  
  // Sheet state
  let sheetOpen = $state(false);
  let sheetStudent = $state<any>(null);

  // Filters
  let selectedVenueFilter = $state<'all' | 'Parque Araucano' | 'Gimnasio Central'>('all');
  let selectedDayId = $state('tue-27');
  let studentSearchQuery = $state('');
  let selectedStudentFilter = $state('all');
  let isCurrentDayBlocked = $state(false);

  // Chat message management
  interface ChatMessage {
    id: string;
    sender: 'user' | 'agent';
    time: string;
    text: string;
    isPrimarySummary?: boolean;
    quickCard?: 'felipe' | 'matias-approved' | 'free-slots' | null;
  }

  let progressChat = $state<ChatMessage[]>([
    {
      id: 'p-1',
      sender: 'user',
      time: '09:34',
      text: '¿Qué tenemos para hoy?'
    },
    {
      id: 'p-2',
      sender: 'agent',
      time: '09:34',
      text: '¡Hola, Gustavo! Hoy tienes 4 clases y 1 reserva por aprobar. Tu foco principal es la próxima clase en 25 minutos con Felipe Soto.',
      isPrimarySummary: true
    }
  ]);

  let agendaChat = $state<ChatMessage[]>([
    {
      id: 'a-1',
      sender: 'user',
      time: '09:32',
      text: '¿Cómo viene la agenda de esta semana?'
    },
    {
      id: 'a-2',
      sender: 'agent',
      time: '09:32',
      text: 'Tienes 18 clases programadas y 6 cupos disponibles entre Parque Araucano y Gimnasio Central. Aquí tienes el selector de semana y los slots detallados:'
    }
  ]);

  let studentsChat = $state<ChatMessage[]>([
    {
      id: 's-1',
      sender: 'user',
      time: '09:30',
      text: '¿Quiénes necesitan renovar su plan este mes?'
    },
    {
      id: 's-2',
      sender: 'agent',
      time: '09:30',
      text: 'Tienes 28 alumnos activos. Matías Valdés y Valentina Rojas ya consumieron su último crédito del ciclo y requieren renovación prioritaria:'
    }
  ]);

  let profileChat = $state<ChatMessage[]>([
    {
      id: 'pr-1',
      sender: 'user',
      time: '09:28',
      text: '¿Cómo van mis métricas del mes y mi enlace de reservas?'
    },
    {
      id: 'pr-2',
      sender: 'agent',
      time: '09:28',
      text: 'Tu enlace público zea.cl/gus-training está activo (+20% de visitas vs el mes anterior). Aquí tienes tu balance consolidado:'
    }
  ]);

  let chatInputText = $state('');
  let isAgentTyping = $state(false);

  // Container refs for auto-scroll
  let progressScrollEl = $state<HTMLDivElement | null>(null);
  let agendaScrollEl = $state<HTMLDivElement | null>(null);
  let studentsScrollEl = $state<HTMLDivElement | null>(null);
  let profileScrollEl = $state<HTMLDivElement | null>(null);

  async function scrollToBottom(el: HTMLDivElement | null) {
    await tick();
    if (el) {
      el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
    }
  }

  function handleSendPrompt(promptText: string) {
    if (!promptText.trim()) return;
    const text = promptText.trim();
    chatInputText = '';
    const now = '09:35';

    if (activeTab === 'progress') {
      progressChat.push({
        id: `p-${Date.now()}`,
        sender: 'user',
        time: now,
        text
      });
      scrollToBottom(progressScrollEl);

      isAgentTyping = true;
      setTimeout(() => {
        isAgentTyping = false;
        let reply = '';
        let quickCard: 'felipe' | 'matias-approved' | 'free-slots' | null = null;

        if (text.toLowerCase().includes('felipe')) {
          reply = 'Felipe Soto tiene 9 de 12 sesiones completadas (98% de asistencia). Su disciplina es Fuerza en Parque Araucano.';
          quickCard = 'felipe';
        } else if (text.toLowerCase().includes('matías') || text.toLowerCase().includes('aprobar')) {
          pendingApproved = true;
          reply = '✓ He aprobado la reserva de Matías Valdés para el Jueves 29 a las 09:00 en Gimnasio Central. Notificación enviada por WhatsApp.';
          quickCard = 'matias-approved';
          showToast('Reserva de Matías aprobada');
        } else if (text.toLowerCase().includes('cupo') || text.toLowerCase().includes('libre')) {
          reply = 'Hoy te quedan 2 cupos libres: a las 11:00 en Parque Araucano y a las 15:00 en Gimnasio Central.';
          quickCard = 'free-slots';
        } else {
          reply = `Entendido Gustavo. He registrado "${text}" y actualizado el estado del día.`;
        }

        progressChat.push({
          id: `p-agent-${Date.now()}`,
          sender: 'agent',
          time: now,
          text: reply,
          quickCard
        });
        scrollToBottom(progressScrollEl);
      }, 550);
    } else if (activeTab === 'agenda') {
      agendaChat.push({
        id: `a-${Date.now()}`,
        sender: 'user',
        time: now,
        text
      });
      scrollToBottom(agendaScrollEl);

      isAgentTyping = true;
      setTimeout(() => {
        isAgentTyping = false;
        agendaChat.push({
          id: `a-agent-${Date.now()}`,
          sender: 'agent',
          time: now,
          text: `Perfecto. He filtrado y actualizado tu agenda según tu solicitud.`
        });
        scrollToBottom(agendaScrollEl);
      }, 500);
    } else if (activeTab === 'students') {
      studentsChat.push({
        id: `s-${Date.now()}`,
        sender: 'user',
        time: now,
        text
      });
      scrollToBottom(studentsScrollEl);

      isAgentTyping = true;
      setTimeout(() => {
        isAgentTyping = false;
        studentsChat.push({
          id: `s-agent-${Date.now()}`,
          sender: 'agent',
          time: now,
          text: `Mostrando alumnos correspondientes a tu búsqueda.`
        });
        scrollToBottom(studentsScrollEl);
      }, 500);
    } else if (activeTab === 'profile') {
      profileChat.push({
        id: `pr-${Date.now()}`,
        sender: 'user',
        time: now,
        text
      });
      scrollToBottom(profileScrollEl);

      isAgentTyping = true;
      setTimeout(() => {
        isAgentTyping = false;
        profileChat.push({
          id: `pr-agent-${Date.now()}`,
          sender: 'agent',
          time: now,
          text: `Enlace público listo: zea.cl/gus-training copiado al portapapeles.`
        });
        showToast('Link copiado: zea.cl/gus-training');
        scrollToBottom(profileScrollEl);
      }, 500);
    }
  }

  function showToast(msg: string) {
    if (toastTimeout) clearTimeout(toastTimeout);
    toastMessage = msg;
    toastTimeout = setTimeout(() => {
      toastMessage = null;
    }, 2400);
  }

  function openStudentModal(student: any) {
    sheetStudent = student;
    sheetOpen = true;
  }

  function closeSheet() {
    sheetOpen = false;
  }

  // Apple Fitness concentric rings SVG calculations
  const coachRings = [
    { label: 'Clases', value: '18 / 24', delta: '+3', pct: 18 / 24, color: '#FA7343' },
    { label: 'Ocupación', value: '84%', delta: '+6%', pct: 0.84, color: '#A78BFA' },
    { label: 'Alumnos activos', value: '28 / 30', delta: '=', pct: 28 / 30, color: '#5EEAD4' }
  ];

  const coachWeeks = [9, 11, 10, 13, 12, 14, 15, 18];
  const sportDistribution = [
    { label: 'Parque Araucano', percentage: 62 },
    { label: 'Gimnasio Central', percentage: 38 }
  ];

  const days = [
    { id: 'mon-26', label: 'Lun', date: 26, month: 'Oct', isToday: false },
    { id: 'tue-27', label: 'Mar', date: 27, month: 'Oct', isToday: true },
    { id: 'wed-28', label: 'Mié', date: 28, month: 'Oct', isToday: false },
    { id: 'thu-29', label: 'Jue', date: 29, month: 'Oct', isToday: false },
    { id: 'fri-30', label: 'Vie', date: 30, month: 'Oct', isToday: false },
    { id: 'sat-31', label: 'Sáb', date: 31, month: 'Oct', isToday: false },
    { id: 'sun-1',  label: 'Dom', date: 1,  month: 'Nov', isToday: false }
  ];

  const DISCIPLINE_META: Record<string, { label: string; color: string; badgeBg: string; badgeText: string }> = {
    fuerza: {
      label: 'Fuerza',
      color: '#FDE68A',
      badgeBg: 'rgba(253, 230, 138, 0.12)',
      badgeText: '#FDE68A'
    },
    hipertrofia: {
      label: 'Hipertrofia',
      color: '#DDD6FE',
      badgeBg: 'rgba(221, 214, 254, 0.12)',
      badgeText: '#DDD6FE'
    },
    running: {
      label: 'Running',
      color: '#BAE6FD',
      badgeBg: 'rgba(186, 230, 253, 0.12)',
      badgeText: '#BAE6FD'
    },
    rehab: {
      label: 'Rehab',
      color: '#A7F3D0',
      badgeBg: 'rgba(167, 243, 208, 0.12)',
      badgeText: '#A7F3D0'
    }
  };

  const scheduleData: Record<string, any[]> = {
    'tue-27': [
      { time: '08:00 – 09:00', type: 'booked', status: 'completed', discipline: 'running', student: 'Camila Alvarez', sessionNum: '8ª sesión', location: 'Parque Araucano', initials: 'CA' },
      { time: '09:00 – 10:00', type: 'available', discipline: 'hipertrofia', location: 'Parque Araucano' },
      { time: '10:00 – 11:00', type: 'booked', isNext: true, discipline: 'fuerza', student: 'Felipe Soto', sessionNum: '12ª sesión', location: 'Parque Araucano', initials: 'FS' },
      { time: '11:00 – 12:00', type: 'available', discipline: 'running', location: 'Parque Araucano' },
      { time: '15:00 – 16:00', type: 'available', discipline: 'rehab', location: 'Gimnasio Central' },
      { time: '16:00 – 17:00', type: 'booked', discipline: 'hipertrofia', student: 'Rodrigo Morales', sessionNum: '5ª sesión', location: 'Gimnasio Central', initials: 'RM' }
    ],
    'mon-26': [
      { time: '08:00 – 09:00', type: 'booked', status: 'completed', discipline: 'fuerza', student: 'Diego Herrera', sessionNum: '14ª sesión', location: 'Parque Araucano', initials: 'DH' },
      { time: '10:00 – 11:00', type: 'booked', status: 'completed', discipline: 'running', student: 'Camila Alvarez', sessionNum: '7ª sesión', location: 'Parque Araucano', initials: 'CA' },
      { time: '16:00 – 17:00', type: 'booked', status: 'completed', discipline: 'rehab', student: 'Matías Valdés', sessionNum: '3ª sesión', location: 'Gimnasio Central', initials: 'MV' }
    ],
    'wed-28': [
      { time: '08:00 – 09:00', type: 'booked', discipline: 'fuerza', student: 'Diego Herrera', sessionNum: '15ª sesión', location: 'Parque Araucano', initials: 'DH' },
      { time: '09:00 – 10:00', type: 'available', discipline: 'fuerza', location: 'Parque Araucano' },
      { time: '10:00 – 11:00', type: 'available', discipline: 'running', location: 'Parque Araucano' },
      { time: '16:00 – 17:00', type: 'booked', discipline: 'rehab', student: 'Valentina Rojas', sessionNum: '9ª sesión', location: 'Gimnasio Central', initials: 'VR' }
    ],
    'thu-29': [
      { time: '09:00 – 10:00', type: 'available', discipline: 'rehab', location: 'Gimnasio Central' },
      { time: '10:00 – 11:00', type: 'booked', discipline: 'fuerza', student: 'Felipe Soto', sessionNum: '13ª sesión', location: 'Parque Araucano', initials: 'FS' },
      { time: '15:00 – 16:00', type: 'available', discipline: 'hipertrofia', location: 'Gimnasio Central' }
    ],
    'fri-30': [
      { time: '08:00 – 09:00', type: 'booked', discipline: 'running', student: 'Camila Alvarez', sessionNum: '9ª sesión', location: 'Parque Araucano', initials: 'CA' },
      { time: '09:00 – 10:00', type: 'available', discipline: 'fuerza', location: 'Parque Araucano' },
      { time: '11:00 – 12:00', type: 'available', discipline: 'hipertrofia', location: 'Gimnasio Central' }
    ]
  };

  const studentsList = [
    { id: 'felipe', name: 'Felipe Soto', initials: 'FS', planLabel: '12 sesiones / mes', venue: 'Parque Araucano', discipline: 'fuerza', usedSessions: 9, totalSessions: 12, attendance: '98%', needsRenewal: false },
    { id: 'camila', name: 'Camila Alvarez', initials: 'CA', planLabel: '8 sesiones / mes', venue: 'Parque Araucano', discipline: 'running', usedSessions: 7, totalSessions: 8, attendance: '94%', needsRenewal: false },
    { id: 'rodrigo', name: 'Rodrigo Morales', initials: 'RM', planLabel: '12 sesiones / mes', venue: 'Gimnasio Central', discipline: 'hipertrofia', usedSessions: 5, totalSessions: 12, attendance: '92%', needsRenewal: false },
    { id: 'diego', name: 'Diego Herrera', initials: 'DH', planLabel: '16 sesiones / mes', venue: 'Parque Araucano', discipline: 'fuerza', usedSessions: 14, totalSessions: 16, attendance: '100%', needsRenewal: false },
    { id: 'matias', name: 'Matías Valdés', initials: 'MV', planLabel: '4 sesiones / mes', venue: 'Gimnasio Central', discipline: 'rehab', usedSessions: 4, totalSessions: 4, attendance: '88%', needsRenewal: true, renewalNote: 'Plan finalizado' },
    { id: 'valentina', name: 'Valentina Rojas', initials: 'VR', planLabel: '8 sesiones / mes', venue: 'Gimnasio Central', discipline: 'rehab', usedSessions: 8, totalSessions: 8, attendance: '90%', needsRenewal: true, renewalNote: 'Último crédito usado' }
  ];

  const currentSlots = $derived.by(() => {
    const raw = scheduleData[selectedDayId] || scheduleData['tue-27'];
    if (selectedVenueFilter === 'all') return raw;
    return raw.filter((s: any) => s.location === selectedVenueFilter);
  });

  const filteredStudents = $derived.by(() => {
    return studentsList.filter(s => {
      const matchSearch = s.name.toLowerCase().includes(studentSearchQuery.toLowerCase()) || s.venue.toLowerCase().includes(studentSearchQuery.toLowerCase());
      if (selectedStudentFilter === 'renewal') return matchSearch && s.needsRenewal;
      if (selectedStudentFilter !== 'all') return matchSearch && s.discipline === selectedStudentFilter;
      return matchSearch;
    });
  });

  // Timeline entries for ZeaTimeline
  const sportTimelineEntries = [
    { id: '1', time: '08:00', title: 'Camila Alvarez', subtitle: 'Running · Completada', status: 'completed' as const },
    { id: '2', time: '10:00', title: 'Felipe Soto', subtitle: 'Fuerza · Parque Araucano', status: 'active' as const, onClick: () => openStudentModal(studentsList[0]) },
    { id: '3', time: '15:00', title: 'Cupo libre', subtitle: 'Gimnasio Central', status: 'available' as const, actionLabel: 'Compartir', onAction: () => showToast('Link de reserva copiado') },
    { id: '4', time: '16:00', title: 'Rodrigo Morales', subtitle: 'Hipertrofia · Gimnasio Central', status: 'scheduled' as const }
  ];
</script>

<!-- Outer Screen Container (Flex Column with min-h-0 for proper scroll containment) -->
<div class="relative flex-1 min-h-0 bg-black flex flex-col justify-between overflow-hidden select-none text-white font-sans text-left" data-testid="zea-sport-screen">

  <!-- ============================================== -->
  <!-- TAB 1: RESUMEN (CHAT AI VS APP CLÁSICA)        -->
  <!-- ============================================== -->
  {#if activeTab === 'progress'}
    {#if viewMode === 'chat'}
      <!-- MODE A: CONVERSATIONAL AI CHAT -->
      <div class="flex-1 min-h-0 flex flex-col overflow-hidden bg-black">
        <!-- Top Navigation Bar with Mode Switcher on Right -->
        <div class="px-5 pt-2.5 pb-2 bg-black/90 backdrop-blur-md sticky top-0 z-20 flex items-center justify-between border-b border-[#1C1C22]">
          <div class="flex items-center gap-2.5">
            <div class="relative">
              <div class="w-8 h-8 rounded-full bg-gradient-to-tr from-[#FA7343] to-[#FDBA8C] flex items-center justify-center font-bold text-[12px] text-black">
                Z
              </div>
              <span class="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-black"></span>
            </div>
            <div>
              <h2 class="font-semibold text-[13.5px] tracking-tight text-white leading-tight flex items-center gap-1.5">
                ZEA Coach Agent
                <span class="text-[9px] font-mono px-1.5 py-0.2 rounded-md bg-[#FA7343]/15 text-[#FA7343] border border-[#FA7343]/30 font-bold">SPORT</span>
              </h2>
              <span class="text-[11px] text-zinc-400">En línea · Asistente autónomo</span>
            </div>
          </div>

          <!-- Reusable Mode Switcher -->
          <ZeaModeToggle bind:viewMode theme="sport" onToggle={(m) => showToast(m === 'chat' ? 'Modo ZEA Chat AI activado' : 'Modo App clásica activado')} />
        </div>

        <!-- Scrollable Chat Stream (Generative UI Cards inside Message Bubbles) -->
        <div
          class="flex-1 min-h-0 overflow-y-auto no-scrollbar px-4 pt-3 pb-3 space-y-4 overscroll-contain touch-pan-y"
          bind:this={progressScrollEl}
          use:dragScroll
          role="region"
          aria-label="Chat de Resumen ZEA Sport"
        >
          <!-- Time Divider -->
          <div class="flex items-center justify-center">
            <span class="text-[10px] text-zinc-500 bg-[#16161C] px-2.5 py-0.5 rounded-full font-mono">Hoy, 09:34 AM</span>
          </div>

          {#each progressChat as msg (msg.id)}
            {#if msg.sender === 'user'}
              <div class="flex flex-col items-end gap-1 pl-12" in:fade={{ duration: 120 }}>
                <div class="bg-[#2A2A33] border border-white/10 text-white rounded-[20px] rounded-br-xs px-4 py-2.5 shadow-md">
                  <p class="text-[14px] leading-relaxed font-sans">{msg.text}</p>
                </div>
                <div class="flex items-center gap-1 text-[10px] text-zinc-500 font-mono pr-1">
                  <span>{msg.time}</span>
                  <span class="text-[#FA7343]">✓✓</span>
                </div>
              </div>
            {:else}
              <div class="flex flex-col items-start gap-2 pr-2" in:fade={{ duration: 120 }}>
                <div class="flex items-center gap-2">
                  <div class="w-5 h-5 rounded-full bg-[#FA7343] flex items-center justify-center text-[10px] font-bold text-black">Z</div>
                  <span class="text-[12px] font-semibold text-zinc-300">ZEA Coach Agent</span>
                </div>

                <!-- Text Bubble -->
                <div class="bg-[#141418] border border-[#24242C] text-zinc-200 rounded-[20px] rounded-tl-xs px-4 py-2.5 max-w-[95%]">
                  <p class="text-[13.5px] leading-relaxed">{msg.text}</p>
                </div>

                <!-- IF PRIMARY SUMMARY: Render Generative UI cards -->
                {#if msg.isPrimarySummary}
                  <div class="w-full space-y-4 pt-1">
                    
                    <!-- COMPONENT 1: Próxima clase (ZeaFocusCard) -->
                    <ZeaFocusCard
                      theme="sport"
                      badgeText="Próxima clase"
                      etaText="en 25 min"
                      mainMetric="10:00"
                      metricSuffix=" – 11:00"
                      avatarText="FS"
                      title="Felipe Soto"
                      subtitle="Fuerza · Parque Araucano · 12ª sesión"
                      secondaryActionLabel="Ver ficha"
                      primaryActionLabel="Check-in"
                      primaryDoneLabel="✓ Listo"
                      isDone={checkinDone}
                      onSecondaryAction={() => openStudentModal(studentsList[0])}
                      onPrimaryAction={() => {
                        checkinDone = true;
                        showToast('Check-in registrado');
                      }}
                    />

                    <!-- COMPONENT 2: Agenda del día (ZeaTimeline) -->
                    <ZeaTimeline
                      theme="sport"
                      title="Hoy"
                      headerActionLabel="Ver agenda"
                      onHeaderAction={() => activeTab = 'agenda'}
                      entries={sportTimelineEntries}
                    />

                    <!-- COMPONENT 3: Por aprobar (ZeaApprovalCard) -->
                    <ZeaApprovalCard
                      theme="sport"
                      title="Por aprobar"
                      avatarText="MV"
                      entityName="Matías Valdés"
                      entityDetails="Jue 29 · 09:00 · Rehab"
                      isApproved={pendingApproved}
                      isRejected={pendingRejected}
                      onApprove={() => {
                        pendingApproved = true;
                        showToast('Reserva aprobada');
                      }}
                      onReject={() => {
                        pendingRejected = true;
                        showToast('Reserva rechazada');
                      }}
                    />

                    <!-- COMPONENT 4: Anillos Concéntricos Apple Fitness (ZeaConcentricRings) -->
                    <ZeaConcentricRings
                      theme="sport"
                      title="Esta semana"
                      subtitle="27 oct – 2 nov"
                      items={coachRings}
                    />

                    <!-- COMPONENT 5: Tendencia 8 semanas (ZeaMetricTrend) -->
                    <ZeaMetricTrend
                      theme="sport"
                      title="Últimas 8 semanas"
                      badgeText="+20% vs mes anterior"
                      bars={coachWeeks}
                      distribution={sportDistribution}
                    />
                  </div>
                {/if}

                {#if msg.quickCard === 'felipe'}
                  <div class="p-3.5 rounded-2xl bg-[#181820] border border-[#2E2E38] w-full flex items-center justify-between">
                    <div class="flex items-center gap-3">
                      <div class="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center font-bold text-white text-xs">FS</div>
                      <div>
                        <p class="text-xs font-semibold text-white">Felipe Soto · Parque Araucano</p>
                        <p class="text-[11px] text-zinc-400">9 de 12 clases (98% asistencia)</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onclick={() => openStudentModal(studentsList[0])}
                      class="px-2.5 py-1 rounded-xl bg-white/10 hover:bg-white/20 text-xs text-white"
                    >
                      Ver ficha
                    </button>
                  </div>
                {/if}

              </div>
            {/if}
          {/each}

          {#if isAgentTyping}
            <div class="flex items-center gap-2 pt-1" in:fade={{ duration: 100 }}>
              <div class="w-5 h-5 rounded-full bg-[#FA7343] flex items-center justify-center text-[10px] font-bold text-black">Z</div>
              <div class="bg-[#141418] border border-[#24242C] rounded-full px-3 py-1.5 flex items-center gap-1.5 shadow-xs">
                <span class="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-bounce" style="animation-delay: 0ms"></span>
                <span class="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-bounce" style="animation-delay: 150ms"></span>
                <span class="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-bounce" style="animation-delay: 300ms"></span>
              </div>
            </div>
          {/if}
        </div>

        <!-- Glia / Gemini Conversational Bar (Only in Chat Mode) -->
        <ZeaGliaBar
          theme="sport"
          placeholder="Pregunta a ZEA Agent o pide un cambio..."
          chips={['¿Cómo viene Felipe Soto?', 'Aprobar reserva de Matías', '¿Cuántos cupos quedan hoy?']}
          bind:inputText={chatInputText}
          onSendPrompt={handleSendPrompt}
        />
      </div>
    {:else}
      <!-- MODE B: APP CLÁSICA NATIVA (EXACT DASHBOARD VIEW) -->
      <div class="flex-1 min-h-0 flex flex-col overflow-hidden bg-black">
        <!-- Top Navigation Bar with Mode Switcher on Right -->
        <div class="px-5 pt-2.5 pb-2 bg-black/90 backdrop-blur-md sticky top-0 z-20 flex items-center justify-between border-b border-[#1C1C22]">
          <div>
            <h2 class="font-semibold text-[22px] tracking-tight text-white leading-tight">Resumen</h2>
            <span class="text-[11px] text-zinc-400 font-mono">Mar 27 oct</span>
          </div>

          <!-- Reusable Mode Switcher -->
          <ZeaModeToggle bind:viewMode theme="sport" onToggle={(m) => showToast(m === 'chat' ? 'Modo ZEA Chat AI activado' : 'Modo App clásica activado')} />
        </div>

        <!-- Scrollable Pure App Feed -->
        <div
          class="flex-1 min-h-0 overflow-y-auto no-scrollbar px-5 pt-3 pb-8 space-y-5 overscroll-contain touch-pan-y"
          use:dragScroll
        >
          <!-- Saludo directo -->
          <section class="pt-0.5">
            <h3 class="text-[26px] font-semibold tracking-tight text-white leading-tight">Hola, Gustavo</h3>
            <p class="text-[13px] text-zinc-400 mt-1">
              Hoy tienes <span class="text-white font-medium">4 clases</span> y
              <span class="text-[#FA7343] font-medium">1 reserva por aprobar</span>.
            </p>
          </section>

          <!-- Próxima clase (ZeaFocusCard) -->
          <ZeaFocusCard
            theme="sport"
            badgeText="Próxima clase"
            etaText="en 25 min"
            mainMetric="10:00"
            metricSuffix=" – 11:00"
            avatarText="FS"
            title="Felipe Soto"
            subtitle="Fuerza · Parque Araucano · 12ª sesión"
            secondaryActionLabel="Ver ficha"
            primaryActionLabel="Check-in"
            primaryDoneLabel="✓ Listo"
            isDone={checkinDone}
            onSecondaryAction={() => openStudentModal(studentsList[0])}
            onPrimaryAction={() => {
              checkinDone = true;
              showToast('Check-in registrado');
            }}
          />

          <!-- Agenda del día (ZeaTimeline) -->
          <ZeaTimeline
            theme="sport"
            title="Hoy"
            headerActionLabel="Ver agenda"
            onHeaderAction={() => activeTab = 'agenda'}
            entries={sportTimelineEntries}
          />

          <!-- Por aprobar (ZeaApprovalCard) -->
          <ZeaApprovalCard
            theme="sport"
            title="Por aprobar"
            avatarText="MV"
            entityName="Matías Valdés"
            entityDetails="Jue 29 · 09:00 · Rehab"
            isApproved={pendingApproved}
            isRejected={pendingRejected}
            onApprove={() => {
              pendingApproved = true;
              showToast('Reserva aprobada');
            }}
            onReject={() => {
              pendingRejected = true;
              showToast('Reserva rechazada');
            }}
          />

          <!-- Esta semana: anillos concéntricos Apple Fitness (ZeaConcentricRings) -->
          <ZeaConcentricRings
            theme="sport"
            title="Esta semana"
            subtitle="27 oct – 2 nov"
            items={coachRings}
          />

          <!-- Tendencia (ZeaMetricTrend) -->
          <ZeaMetricTrend
            theme="sport"
            title="Últimas 8 semanas"
            badgeText="+20% vs mes anterior"
            bars={coachWeeks}
            distribution={sportDistribution}
          />
        </div>
      </div>
    {/if}

  <!-- ============================================== -->
  <!-- TAB 2: AGENDA                                  -->
  <!-- ============================================== -->
  {:else if activeTab === 'agenda'}
    <div class="flex-1 min-h-0 flex flex-col overflow-hidden bg-black">
      <!-- Top Navigation Bar with Mode Switcher on Right -->
      <div class="px-5 pt-2.5 pb-2 bg-black/90 backdrop-blur-md sticky top-0 z-20 flex items-center justify-between border-b border-[#1C1C22]">
        <div class="flex items-center gap-2">
          <h2 class="font-semibold text-[20px] tracking-tight text-white leading-tight">Agenda</h2>
          {#if viewMode === 'chat'}
            <span class="text-[9px] font-mono px-1.5 py-0.2 rounded-md bg-violet-500/15 text-violet-300 border border-violet-500/30">AGENT</span>
          {/if}
        </div>

        <div class="flex items-center gap-2">
          <button
            type="button"
            onclick={() => {
              isCurrentDayBlocked = !isCurrentDayBlocked;
              showToast(isCurrentDayBlocked ? 'Día marcado como libre' : 'Día habilitado');
            }}
            class="px-2.5 py-1 rounded-full text-[11px] font-medium transition flex items-center gap-1.5 bg-[#1C1C20] hover:bg-[#25252D] text-zinc-300"
          >
            <span class="w-1.5 h-1.5 rounded-full {isCurrentDayBlocked ? 'bg-red-400' : 'bg-emerald-400'}"></span>
            <span>{isCurrentDayBlocked ? 'Libre' : 'Activo'}</span>
          </button>

          <ZeaModeToggle bind:viewMode theme="sport" />
        </div>
      </div>

      <!-- Agenda Content Body -->
      <div
        class="flex-1 min-h-0 overflow-y-auto no-scrollbar px-4 pt-3 pb-6 space-y-4 overscroll-contain touch-pan-y"
        bind:this={agendaScrollEl}
        use:dragScroll
      >
        {#if viewMode === 'chat'}
          <!-- Chat bubbles in Chat Mode -->
          {#each agendaChat as msg (msg.id)}
            {#if msg.sender === 'user'}
              <div class="flex flex-col items-end gap-1 pl-12">
                <div class="bg-[#2A2A33] border border-white/10 text-white rounded-[20px] rounded-br-xs px-4 py-2.5 shadow-md">
                  <p class="text-[14px]">{msg.text}</p>
                </div>
                <span class="text-[10px] text-zinc-500 font-mono pr-1">{msg.time} ✓✓</span>
              </div>
            {:else}
              <div class="bg-[#141418] border border-[#24242C] text-zinc-200 rounded-[20px] rounded-tl-xs px-4 py-2.5 max-w-[95%]">
                <p class="text-[13.5px] leading-relaxed">{msg.text}</p>
              </div>
            {/if}
          {/each}
        {/if}

        <!-- Interactive Calendar & Slots (Visible in both App and Chat Mode) -->
        <div class="space-y-3">
          <!-- Venue Pills -->
          <div class="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            <button
              type="button"
              onclick={() => selectedVenueFilter = 'all'}
              class="px-3 py-1 rounded-full text-[11px] font-medium {selectedVenueFilter === 'all' ? 'bg-white text-black' : 'bg-[#1C1C20] text-zinc-400 hover:text-white'} transition shrink-0 cursor-pointer"
            >
              Todas
            </button>
            <button
              type="button"
              onclick={() => selectedVenueFilter = 'Parque Araucano'}
              class="px-3 py-1 rounded-full text-[11px] font-medium {selectedVenueFilter === 'Parque Araucano' ? 'bg-white text-black' : 'bg-[#1C1C20] text-zinc-400 hover:text-white'} transition shrink-0 cursor-pointer"
            >
              Parque Araucano
            </button>
            <button
              type="button"
              onclick={() => selectedVenueFilter = 'Gimnasio Central'}
              class="px-3 py-1 rounded-full text-[11px] font-medium {selectedVenueFilter === 'Gimnasio Central' ? 'bg-white text-black' : 'bg-[#1C1C20] text-zinc-400 hover:text-white'} transition shrink-0 cursor-pointer"
            >
              Gimnasio Central
            </button>
          </div>

          <!-- Calendar Header Bar -->
          <div class="p-3 rounded-2xl bg-[#141418] border border-[#24242C] flex items-center justify-between">
            <span class="text-[13px] font-semibold text-white">Octubre 2026</span>
            <button
              type="button"
              onclick={() => selectedDayId = 'tue-27'}
              class="px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#1C1C20] text-zinc-300 hover:text-white transition cursor-pointer"
            >
              Hoy
            </button>
          </div>

          <!-- Days Carousel -->
          <div class="flex items-center justify-between gap-1 overflow-x-auto no-scrollbar p-1">
            {#each days as d}
              <button
                type="button"
                onclick={() => selectedDayId = d.id}
                class="flex-1 min-w-[42px] py-2 rounded-2xl flex flex-col items-center gap-1 transition cursor-pointer {selectedDayId === d.id ? 'bg-white text-black font-semibold shadow-md' : 'bg-[#141418] text-zinc-400 hover:bg-[#1C1C20] hover:text-white'}"
              >
                <span class="text-[10px] uppercase font-mono">{d.label}</span>
                <span class="text-[14px] font-semibold">{d.date}</span>
              </button>
            {/each}
          </div>

          <!-- Slots List of Selected Day -->
          <div class="space-y-2">
            {#each currentSlots as slot}
              <div class="p-3 rounded-2xl border transition {slot.isNext ? 'bg-gradient-to-r from-[#2B1810]/60 to-[#141010] border-[#FA7343]/40' : 'bg-[#141418] border-[#24242C]'}">
                <div class="flex items-center justify-between">
                  <span class="text-[12px] font-mono {slot.isNext ? 'text-[#FA7343] font-bold' : 'text-zinc-400'}">{slot.time}</span>
                  <span class="text-[10px] px-2 py-0.5 rounded-full font-medium" style="background:{DISCIPLINE_META[slot.discipline]?.badgeBg || 'rgba(255,255,255,0.1)'}; color:{DISCIPLINE_META[slot.discipline]?.badgeText || '#fff'}">
                    {DISCIPLINE_META[slot.discipline]?.label || slot.discipline}
                  </span>
                </div>
                <div class="mt-2 flex items-center justify-between">
                  {#if slot.type === 'booked'}
                    <div class="flex items-center gap-2">
                      <div class="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-[11px] font-semibold text-white">{slot.initials}</div>
                      <div>
                        <p class="text-[13px] font-medium text-white">{slot.student}</p>
                        <p class="text-[10.5px] text-zinc-500">{slot.location} · {slot.sessionNum}</p>
                      </div>
                    </div>
                  {:else}
                    <div>
                      <p class="text-[13px] font-medium text-zinc-300">Cupo disponible</p>
                      <p class="text-[10.5px] text-zinc-500">{slot.location}</p>
                    </div>
                    <button
                      type="button"
                      onclick={() => showToast('Link de reserva copiado')}
                      class="px-2.5 py-1 rounded-full text-[11px] bg-white/10 hover:bg-white/20 text-white font-medium"
                    >
                      Compartir
                    </button>
                  {/if}
                </div>
              </div>
            {/each}
          </div>
        </div>
      </div>

      <!-- Glia Input Bar only in Chat Mode -->
      {#if viewMode === 'chat'}
        <ZeaGliaBar
          theme="sport"
          placeholder="Pide un cambio de horario o reserva..."
          chips={['Marcar día libre', 'Ver Parque Araucano', 'Horarios disponibles']}
          bind:inputText={chatInputText}
          onSendPrompt={handleSendPrompt}
        />
      {/if}
    </div>

  <!-- ============================================== -->
  <!-- TAB 3: ALUMNOS                                 -->
  <!-- ============================================== -->
  {:else if activeTab === 'students'}
    <div class="flex-1 min-h-0 flex flex-col overflow-hidden bg-black">
      <!-- Top Navigation Bar with Mode Switcher on Right -->
      <div class="px-5 pt-2.5 pb-2 bg-black/90 backdrop-blur-md sticky top-0 z-20 flex items-center justify-between border-b border-[#1C1C22]">
        <div class="flex items-baseline gap-2">
          <h2 class="font-semibold text-[20px] tracking-tight text-white leading-tight">Alumnos</h2>
          <span class="text-[11px] text-zinc-400">28 activos</span>
        </div>

        <div class="flex items-center gap-2">
          <button
            type="button"
            onclick={() => showToast('Link de invitación copiado')}
            class="px-2.5 py-1 rounded-full text-[11px] font-medium bg-[#1C1C20] hover:bg-[#25252D] text-zinc-200 transition"
          >
            + Invitar
          </button>

          <ZeaModeToggle bind:viewMode theme="sport" />
        </div>
      </div>

      <div
        class="flex-1 min-h-0 overflow-y-auto no-scrollbar px-4 pt-3 pb-6 space-y-4 overscroll-contain touch-pan-y"
        bind:this={studentsScrollEl}
        use:dragScroll
      >
        {#if viewMode === 'chat'}
          {#each studentsChat as msg (msg.id)}
            {#if msg.sender === 'user'}
              <div class="flex flex-col items-end gap-1 pl-12">
                <div class="bg-[#2A2A33] border border-white/10 text-white rounded-[20px] rounded-br-xs px-4 py-2.5 shadow-md">
                  <p class="text-[14px]">{msg.text}</p>
                </div>
                <span class="text-[10px] text-zinc-500 font-mono pr-1">{msg.time} ✓✓</span>
              </div>
            {:else}
              <div class="bg-[#141418] border border-[#24242C] text-zinc-200 rounded-[20px] rounded-tl-xs px-4 py-2.5 max-w-[95%]">
                <p class="text-[13.5px] leading-relaxed">{msg.text}</p>
              </div>
            {/if}
          {/each}
        {/if}

        <!-- Search and Students List -->
        <div class="space-y-3">
          <div class="relative">
            <input
              type="text"
              bind:value={studentSearchQuery}
              placeholder="Buscar alumno o sede..."
              class="w-full pl-8 pr-3 py-1.5 rounded-xl bg-[#141418] border border-[#24242C] text-[12px] text-white placeholder-zinc-500 focus:outline-none"
            />
            <span class="absolute left-2.5 top-2 text-zinc-500 text-xs">🔍</span>
          </div>

          <!-- Discipline Filter Pills -->
          <div class="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            <button
              type="button"
              onclick={() => selectedStudentFilter = 'all'}
              class="px-2.5 py-1 rounded-full text-[11px] font-medium {selectedStudentFilter === 'all' ? 'bg-white text-black' : 'bg-[#1C1C20] text-zinc-400 hover:text-white'} transition shrink-0 cursor-pointer"
            >
              Todos
            </button>
            <button
              type="button"
              onclick={() => selectedStudentFilter = 'renewal'}
              class="px-2.5 py-1 rounded-full text-[11px] font-medium {selectedStudentFilter === 'renewal' ? 'bg-[#FA7343] text-black font-semibold' : 'bg-[#1C1C20] text-zinc-400 hover:text-white'} transition shrink-0 cursor-pointer"
            >
              Por renovar
            </button>
            <button
              type="button"
              onclick={() => selectedStudentFilter = 'fuerza'}
              class="px-2.5 py-1 rounded-full text-[11px] font-medium {selectedStudentFilter === 'fuerza' ? 'bg-white text-black' : 'bg-[#1C1C20] text-zinc-400 hover:text-white'} transition shrink-0 cursor-pointer"
            >
              Fuerza
            </button>
          </div>

          <!-- Students Interactive List -->
          <div class="space-y-2">
            {#each filteredStudents as s}
              <button
                type="button"
                onclick={() => openStudentModal(s)}
                class="w-full p-3 rounded-2xl bg-[#141418] border border-[#24242C] hover:border-zinc-500 text-left transition flex items-center justify-between cursor-pointer"
              >
                <div class="flex items-center gap-3">
                  <div class="w-9 h-9 rounded-full bg-[#1F1F28] flex items-center justify-center font-bold text-white text-xs">
                    {s.initials}
                  </div>
                  <div>
                    <p class="text-[13px] font-semibold text-white">{s.name}</p>
                    <p class="text-[11px] text-zinc-400">{s.venue} · {s.discipline}</p>
                  </div>
                </div>
                <div class="text-right">
                  <span class="text-[11.5px] font-mono text-white font-semibold">{s.usedSessions}/{s.totalSessions}</span>
                  {#if s.needsRenewal}
                    <span class="block text-[10px] text-[#FA7343] font-semibold">Renovar</span>
                  {:else}
                    <span class="block text-[10px] text-zinc-500">{s.attendance}</span>
                  {/if}
                </div>
              </button>
            {/each}
          </div>
        </div>
      </div>

      {#if viewMode === 'chat'}
        <ZeaGliaBar
          theme="sport"
          placeholder="Preguntar sobre un alumno o plan..."
          chips={['Alumnos por renovar', 'Ver alumnos de Fuerza', 'Asistencia general']}
          bind:inputText={chatInputText}
          onSendPrompt={handleSendPrompt}
        />
      {/if}
    </div>

  <!-- ============================================== -->
  <!-- TAB 4: PERFIL                                  -->
  <!-- ============================================== -->
  {:else if activeTab === 'profile'}
    <div class="flex-1 min-h-0 flex flex-col overflow-hidden bg-black">
      <!-- Top Navigation Bar with Mode Switcher on Right -->
      <div class="px-5 pt-2.5 pb-2 bg-black/90 backdrop-blur-md sticky top-0 z-20 flex items-center justify-between border-b border-[#1C1C22]">
        <h2 class="font-semibold text-[20px] tracking-tight text-white leading-tight">Perfil</h2>

        <div class="flex items-center gap-2">
          <button
            type="button"
            onclick={() => showToast('Link copiado: zea.cl/gus-training')}
            class="px-2.5 py-1 rounded-full text-[11px] font-medium bg-[#1C1C20] hover:bg-[#25252D] text-zinc-200 transition"
          >
            Compartir link
          </button>

          <ZeaModeToggle bind:viewMode theme="sport" />
        </div>
      </div>

      <div
        class="flex-1 min-h-0 overflow-y-auto no-scrollbar px-4 pt-3 pb-6 space-y-4 overscroll-contain touch-pan-y"
        bind:this={profileScrollEl}
        use:dragScroll
      >
        {#if viewMode === 'chat'}
          {#each profileChat as msg (msg.id)}
            {#if msg.sender === 'user'}
              <div class="flex flex-col items-end gap-1 pl-12">
                <div class="bg-[#2A2A33] border border-white/10 text-white rounded-[20px] rounded-br-xs px-4 py-2.5 shadow-md">
                  <p class="text-[14px]">{msg.text}</p>
                </div>
                <span class="text-[10px] text-zinc-500 font-mono pr-1">{msg.time} ✓✓</span>
              </div>
            {:else}
              <div class="bg-[#141418] border border-[#24242C] text-zinc-200 rounded-[20px] rounded-tl-xs px-4 py-2.5 max-w-[95%]">
                <p class="text-[13.5px] leading-relaxed">{msg.text}</p>
              </div>
            {/if}
          {/each}
        {/if}

        <!-- Profile Details Card Component -->
        <div class="space-y-3">
          <div class="p-4 rounded-[24px] bg-[#141418] border border-[#24242C]">
            <div class="flex items-center gap-3.5">
              <div class="w-12 h-12 rounded-full bg-gradient-to-tr from-zinc-700 to-zinc-500 flex items-center justify-center font-bold text-white text-base">
                GH
              </div>
              <div>
                <h3 class="font-semibold text-white text-[16px]">Gustavo Hinostroza</h3>
                <p class="text-[11.5px] text-zinc-400">Coach certificado ZEA · Fuerza & Rehab</p>
              </div>
            </div>
            <div class="mt-3.5 pt-3 border-t border-white/5 flex items-center justify-between text-xs">
              <span class="text-zinc-400">zea.cl/gus-training</span>
              <button
                type="button"
                onclick={() => showToast('Link copiado: zea.cl/gus-training')}
                class="px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/15 text-white"
              >
                Copiar
              </button>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-2">
            <div class="p-3.5 rounded-2xl bg-[#141418] border border-[#24242C]">
              <span class="text-[11px] text-zinc-400 block">Facturación proyectada</span>
              <span class="text-[16px] font-semibold text-white font-mono">$2.450.000</span>
            </div>
            <div class="p-3.5 rounded-2xl bg-[#141418] border border-[#24242C]">
              <span class="text-[11px] text-zinc-400 block">Horas impartidas</span>
              <span class="text-[16px] font-semibold text-white font-mono">72 hrs</span>
            </div>
          </div>
        </div>
      </div>

      {#if viewMode === 'chat'}
        <ZeaGliaBar
          theme="sport"
          placeholder="Preguntar sobre estadísticas o enlaces..."
          chips={['Copiar link de reservas', 'Ver facturación', 'Historial del mes']}
          bind:inputText={chatInputText}
          onSendPrompt={handleSendPrompt}
        />
      {/if}
    </div>
  {/if}

  <!-- ============================================== -->
  <!-- NATIVE BOTTOM TAB BAR                          -->
  <!-- ============================================== -->
  <div id="bottom-tabbar" class="shrink-0 h-14 bg-black/95 backdrop-blur-md border-t border-[#24242f] flex items-center justify-around px-2 z-20">
    <!-- TAB 1: RESUMEN -->
    <button
      type="button"
      onclick={() => activeTab = 'progress'}
      class="flex flex-col items-center gap-1 transition px-3 cursor-pointer {activeTab === 'progress' ? 'text-zinc-100 font-semibold' : 'text-zinc-500 hover:text-zinc-300'}"
    >
      <div class="relative">
        <svg class="w-5 h-5 fill-none stroke-current stroke-2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>
        {#if viewMode === 'chat'}
          <span class="absolute -top-1 -right-1 w-1.5 h-1.5 rounded-full bg-[#FA7343]"></span>
        {/if}
      </div>
      <span class="text-[10px] tracking-tight">Resumen</span>
    </button>

    <!-- TAB 2: AGENDA -->
    <button
      type="button"
      onclick={() => activeTab = 'agenda'}
      class="flex flex-col items-center gap-1 transition px-3 cursor-pointer {activeTab === 'agenda' ? 'text-zinc-100 font-semibold' : 'text-zinc-500 hover:text-zinc-300'}"
    >
      <svg class="w-5 h-5 fill-none stroke-current stroke-2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
      <span class="text-[10px] tracking-tight">Agenda</span>
    </button>
    
    <!-- TAB 3: ALUMNOS -->
    <button
      type="button"
      onclick={() => activeTab = 'students'}
      class="flex flex-col items-center gap-1 transition px-3 cursor-pointer {activeTab === 'students' ? 'text-zinc-100 font-semibold' : 'text-zinc-500 hover:text-zinc-300'}"
    >
      <svg class="w-5 h-5 fill-none stroke-current stroke-2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
      <span class="text-[10px] tracking-tight">Alumnos</span>
    </button>
    
    <!-- TAB 4: PERFIL -->
    <button
      type="button"
      onclick={() => activeTab = 'profile'}
      class="flex flex-col items-center gap-1 transition px-3 cursor-pointer {activeTab === 'profile' ? 'text-zinc-100 font-semibold' : 'text-zinc-500 hover:text-zinc-300'}"
    >
      <svg class="w-5 h-5 fill-none stroke-current stroke-2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
      <span class="text-[10px] tracking-tight">Perfil</span>
    </button>
  </div>

  <!-- Reusable Bottom Sheet (Ficha del alumno) -->
  {#if sheetStudent}
    <ZeaSheet
      theme="sport"
      isOpen={sheetOpen}
      avatarText={sheetStudent.initials}
      title={sheetStudent.name}
      subtitle="{sheetStudent.planLabel} · {sheetStudent.venue}"
      progressLabel="Progreso del ciclo actual"
      progressValueText="{sheetStudent.usedSessions} de {sheetStudent.totalSessions} sesiones"
      progressPct={Math.round((sheetStudent.usedSessions / sheetStudent.totalSessions) * 100)}
      stats={[
        { label: 'Asistencia', value: sheetStudent.attendance },
        { label: 'Sede', value: sheetStudent.venue }
      ]}
      onClose={closeSheet}
    />
  {/if}

  <!-- Toast Notification -->
  {#if toastMessage}
    <div
      class="fixed bottom-20 left-1/2 -translate-x-1/2 px-4 py-2 bg-[#22222d] border border-[#3b3b4f] text-zinc-100 font-medium text-xs rounded-full shadow-2xl z-50 flex items-center gap-2 pointer-events-none"
      transition:fade={{ duration: 150 }}
    >
      <span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
      <span>{toastMessage}</span>
    </div>
  {/if}
</div>
