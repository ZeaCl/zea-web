<script lang="ts">
  import { onDestroy, untrack } from 'svelte';
  import AppleLogo from '../atoms/AppleLogo.svelte';
  import AndroidLogo from '../atoms/AndroidLogo.svelte';
  import VisionIcon from '../atoms/VisionIcon.svelte';
  import MicIcon from '../atoms/MicIcon.svelte';
  import ZeaSportScreen from './ZeaSportScreen.svelte';
  import ZeaEdgeScreen from './ZeaEdgeScreen.svelte';

  export interface ActiveSkills {
    audio: boolean;
    vision: boolean;
    security: boolean;
  }

  let {
    lang = 'es',
    platform = 'ios',
    skills = $bindable({ audio: false, vision: false, security: false }),
    activePillar = 'none'
  }: {
    lang?: 'en' | 'es';
    platform?: 'ios' | 'android';
    skills?: ActiveSkills;
    activePillar?: 'none' | 'edge' | 'sport' | 'venture';
  } = $props();

  let isThinking = $state(false);
  let userInput = $state('');
  let messagesContainer: HTMLDivElement | null = $state(null);

  // Real Camera Stream State
  let videoElement: HTMLVideoElement | null = $state(null);
  let videoStream: MediaStream | null = $state(null);
  let cameraError = $state<string | null>(null);
  let cameraMode = $state<'photo' | 'video'>('photo');
  let isRecordingVideo = $state(false);

  // Real Microphone & Web Audio State
  let audioStream: MediaStream | null = $state(null);
  let audioContext: AudioContext | null = $state(null);
  let analyser: AnalyserNode | null = $state(null);
  let animFrameId: number | null = null;
  let audioLevels = $state<number[]>([6, 12, 18, 10, 16, 22, 14, 8, 12, 20, 15, 9, 13, 17, 11, 7]);

  // Real In-Browser MediaRecorder for WhatsApp Audio Messages
  let mediaRecorder: MediaRecorder | null = null;
  let recordedAudioChunks: Blob[] = [];
  let currentAudioElement: HTMLAudioElement | null = null;

  // Browser Native Speech Recognition (STT for optional text capture)
  let recognition: any = null;
  let isListening = $state(false);
  let liveTranscript = $state('');

  // WhatsApp-style Audio Recording Timer & State
  let isRecordingVoiceNote = $state(false);
  let audioRecordingSeconds = $state(0);
  let recordingInterval: any = null;
  let fallbackAudioInterval: any = null;
  let isAudioPaused = $state(false);
  let showAttachMenu = $state(false);
  let showDrawerMenu = $state(false);
  let playingAudioMsgId = $state<string | null>(null);

  $effect(() => {
    const isRecording = isRecordingVoiceNote || skills.audio;
    if (isRecording) {
      audioRecordingSeconds = 0;
      isAudioPaused = false;
      recordingInterval = setInterval(() => {
        if (!isAudioPaused) {
          audioRecordingSeconds++;
        }
      }, 1000);
    } else {
      if (recordingInterval) {
        clearInterval(recordingInterval);
        recordingInterval = null;
      }
      audioRecordingSeconds = 0;
      isAudioPaused = false;
    }
    return () => {
      if (recordingInterval) clearInterval(recordingInterval);
    };
  });

  const formattedAudioTime = $derived.by(() => {
    const mins = Math.floor(audioRecordingSeconds / 60);
    const secs = audioRecordingSeconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  });

  interface SimulatorMessage {
    id: string;
    role: 'user' | 'assistant';
    text: string;
    isAudio?: boolean;
    audioDuration?: string;
    audioUrl?: string;
    imageUrl?: string;
    action?: {
      name: string;
      params?: string;
      status?: 'pending' | 'success';
      result?: string;
    };
  }

  const initialMessagesEn: SimulatorMessage[] = [
    {
      id: '1',
      role: 'user',
      text: 'How do I embed autonomous AI agents natively with SwiftUI?'
    },
    {
      id: '2',
      role: 'assistant',
      text: 'Integrating the iOS Client is straightforward. Add our Swift Package in Xcode, initialize IOSClient with your App ID, and receive real-time action & text streaming directly in your SwiftUI views using async/await.'
    },
    {
      id: '3',
      role: 'user',
      text: 'Does the mobile client store my users’ conversation history?'
    },
    {
      id: '4',
      role: 'assistant',
      text: 'No, the mobile runtime is 100% Stateless. Agent execution runs in-memory over ultra-low latency WebSockets with zero persistent storage of chats or private data in the cloud. You keep complete data ownership.'
    }
  ];

  const initialMessagesEs: SimulatorMessage[] = [
    {
      id: '1',
      role: 'user',
      text: '¿Cómo integro agentes de IA autónomos directamente en SwiftUI?'
    },
    {
      id: '2',
      role: 'assistant',
      text: 'Integrar el cliente iOS es muy simple. Solo agregas el Swift Package en Xcode, inicializas IOSClient con tu App ID y recibes streaming de acciones y texto directamente en tus vistas de SwiftUI con async/await.'
    },
    {
      id: '3',
      role: 'user',
      text: '¿El cliente almacena las conversaciones de mis usuarios?'
    },
    {
      id: '4',
      role: 'assistant',
      text: 'No, la ejecución móvil es 100% Stateless. El agente corre en memoria a través de WebSockets de ultra-baja latencia y no guarda tus conversaciones ni datos privados en la nube. Tú mantienes el control total de tus datos.'
    }
  ];

  // Scenarios per Industry Pillar (Using realistic fictional operations)
  const edgeMessagesEs: SimulatorMessage[] = [
    {
      id: 'edge-1',
      role: 'user',
      text: 'Glia, recepcionando Mixer #42 en Tramo Km 12. Temperatura de asfalto en 154°C y asentamiento de cono en 8.5 cm. ¿Cumple con la norma técnica de faena?',
      isAudio: true,
      audioDuration: '0:07'
    },
    {
      id: 'edge-2',
      role: 'assistant',
      text: '✓ Conforme. Temperatura en rango operativo óptimo (145°C – 165°C). Asentamiento de cono dentro de tolerancia (±1.0 cm). Sello de recepción generado, validado con ITO y almacenado 100% offline en el dispositivo sin requerir internet.',
      action: {
        name: 'agent.use(IndustrialTelemetry)',
        params: 'faena="Autopista Tramo Km 12", mixer=42, status="verified_offline"',
        status: 'success'
      }
    }
  ];

  const edgeMessagesEn: SimulatorMessage[] = [
    {
      id: 'edge-1',
      role: 'user',
      text: 'Glia, receiving Concrete Mixer #42 at Highway Mile 12. Mix temperature at 154°C and slump cone at 8.5 cm. Does it meet field technical specifications?',
      isAudio: true,
      audioDuration: '0:07'
    },
    {
      id: 'edge-2',
      role: 'assistant',
      text: '✓ Compliant. Mix temperature within optimal field placement window (145°C – 165°C). Slump test within tolerance. Inspection receipt certified, validated with site inspector, and stored 100% offline on-device with zero cloud dependency.',
      action: {
        name: 'agent.use(IndustrialTelemetry)',
        params: 'site="Highway Mile 12", mixer=42, status="verified_offline"',
        status: 'success'
      }
    }
  ];

  const sportMessagesEs: SimulatorMessage[] = [
    {
      id: 'sport-1',
      role: 'user',
      text: 'Glia, serie 3 de sentadillas con 120 kg terminada. ¿Cómo estuvo la profundidad y el quiebre de cadera?',
      isAudio: true,
      audioDuration: '0:05'
    },
    {
      id: 'sport-2',
      role: 'assistant',
      text: '✓ 5 repeticiones válidas. Profundidad alcanzada a 92° en todas las repeticiones. En la repetición 4 hubo un leve valgo en rodilla derecha corregido en milisegundos. Bitácora de biomecánica actualizada y lista para tu coach.',
      action: {
        name: 'agent.use(BiomechanicsVision)',
        params: 'exercise="back_squat", depth="92deg", valid_reps=5',
        status: 'success'
      }
    }
  ];

  const sportMessagesEn: SimulatorMessage[] = [
    {
      id: 'sport-1',
      role: 'user',
      text: 'Glia, set 3 of back squats with 120 kg completed. How was my depth and hip hinge?',
      isAudio: true,
      audioDuration: '0:05'
    },
    {
      id: 'sport-2',
      role: 'assistant',
      text: '✓ 5/5 valid repetitions. Depth reached 92° across all reps. Minor right knee valgus detected on rep 4 and corrected in real time. Biomechanics log synced for your coach.',
      action: {
        name: 'agent.use(BiomechanicsVision)',
        params: 'exercise="back_squat", depth="92deg", valid_reps=5',
        status: 'success'
      }
    }
  ];

  const ventureMessagesEs: SimulatorMessage[] = [
    {
      id: 'venture-1',
      role: 'user',
      text: 'Glia, ¿cuál es el AUM consolidado del Fondo I al cierre de hoy y cuánto capital líquido disponible tenemos?',
      isAudio: true,
      audioDuration: '0:06'
    },
    {
      id: 'venture-2',
      role: 'assistant',
      text: 'AUM consolidado: $14.85M USD. Capital líquido disponible: $2.4M USD. 32 aportantes conciliados al 100% contra el banco custodio. Llamada de capital #4 lista para aprobación con FaceID.',
      action: {
        name: 'agent.use(FundLedgerAudit)',
        params: 'fund="Infraestructura I", aum="$14.85M", reconciled=true',
        status: 'success'
      }
    }
  ];

  const ventureMessagesEn: SimulatorMessage[] = [
    {
      id: 'venture-1',
      role: 'user',
      text: 'Glia, what is Fund I’s consolidated AUM as of today’s close and what is our available dry powder?',
      isAudio: true,
      audioDuration: '0:06'
    },
    {
      id: 'venture-2',
      role: 'assistant',
      text: 'Consolidated AUM: $14.85M USD. Available dry powder: $2.4M USD. 32 LPs fully reconciled against custodian bank. Capital Call #4 queued for FaceID sign-off.',
      action: {
        name: 'agent.use(FundLedgerAudit)',
        params: 'fund="Infra I", aum="$14.85M", reconciled=true',
        status: 'success'
      }
    }
  ];

  let messages = $state<SimulatorMessage[]>(initialMessagesEs);
  let prevLang = $state<string>('');
  let lastPillar = $state<'none' | 'edge' | 'sport' | 'venture'>('none');

  $effect(() => {
    const currentLang = lang;
    const currentPillar = activePillar;

    if (currentPillar !== lastPillar || currentLang !== prevLang) {
      lastPillar = currentPillar;
      prevLang = currentLang;

      untrack(() => {
        if (currentPillar === 'edge') {
          messages = currentLang === 'en' ? edgeMessagesEn : edgeMessagesEs;
        } else if (currentPillar === 'sport') {
          messages = currentLang === 'en' ? sportMessagesEn : sportMessagesEs;
        } else if (currentPillar === 'venture') {
          messages = currentLang === 'en' ? ventureMessagesEn : ventureMessagesEs;
        } else {
          messages = currentLang === 'en' ? initialMessagesEn : initialMessagesEs;
        }
      });
    }
  });

  // --- Real Camera Stream Lifecycle ---
  async function startCamera() {
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) return;
    cameraError = null;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 640 },
          height: { ideal: 480 }
        }
      });
      videoStream = stream;
      if (videoElement) {
        videoElement.srcObject = stream;
        videoElement.play().catch(() => {});
      }
    } catch (err: any) {
      console.warn('Camera access denied or unavailable:', err);
      cameraError = err?.message || 'Camera not accessible';
    }
  }

  function stopCamera() {
    if (videoStream) {
      videoStream.getTracks().forEach((track) => track.stop());
      videoStream = null;
    }
    if (videoElement) {
      videoElement.srcObject = null;
    }
    cameraError = null;
    isRecordingVideo = false;
  }

  function capturePhotoFromVideo(): string | null {
    if (typeof document === 'undefined') return null;
    if (!videoElement || videoElement.videoWidth === 0) return null;
    try {
      const canvas = document.createElement('canvas');
      canvas.width = videoElement.videoWidth || 640;
      canvas.height = videoElement.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (!ctx) return null;
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
      return canvas.toDataURL('image/jpeg', 0.85);
    } catch (err) {
      console.warn('Canvas snapshot capture error:', err);
      return null;
    }
  }

  function createFallbackPhotoUrl(): string {
    if (typeof document === 'undefined') return '';
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 640;
      canvas.height = 480;
      const ctx = canvas.getContext('2d');
      const fallbackSvg = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="640" height="480"><rect width="100%" height="100%" fill="%2310131a"/><circle cx="320" cy="220" r="40" fill="%2323e062"/><text x="320" y="310" fill="white" font-family="sans-serif" font-size="20" text-anchor="middle">ZEA Glia Camera Snapshot</text></svg>';
      if (!ctx) return fallbackSvg;

      // Sleek camera photo snapshot aesthetic
      const grad = ctx.createLinearGradient(0, 0, 640, 480);
      grad.addColorStop(0, '#0a0d14');
      grad.addColorStop(0.5, '#161c28');
      grad.addColorStop(1, '#0b0f17');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 640, 480);

      // Subtle reticle
      ctx.strokeStyle = 'rgba(35, 224, 98, 0.35)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(320, 220, 45, 0, Math.PI * 2);
      ctx.stroke();

      // Camera lens center
      ctx.fillStyle = '#23e062';
      ctx.beginPath();
      ctx.arc(320, 220, 10, 0, Math.PI * 2);
      ctx.fill();

      // Typography
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 22px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('ZEA Glia Camera Snapshot', 320, 310);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '13px monospace';
      ctx.fillText('Real-Time Vision Sensor • 1080p', 320, 340);

      return canvas.toDataURL('image/jpeg', 0.85);
    } catch {
      return 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="640" height="480"><rect width="100%" height="100%" fill="%2310131a"/><circle cx="320" cy="220" r="40" fill="%2323e062"/><text x="320" y="310" fill="white" font-family="sans-serif" font-size="20" text-anchor="middle">ZEA Glia Camera Snapshot</text></svg>';
    }
  }

  function takePhoto() {
    const photoUrl = capturePhotoFromVideo() || createFallbackPhotoUrl();
    skills = { ...skills, vision: false };

    const photoMsgId = Date.now().toString();
    messages = [
      ...messages,
      {
        id: photoMsgId,
        role: 'user',
        text: '',
        imageUrl: photoUrl
      }
    ];
    scrollToBottom();

    isThinking = true;
    setTimeout(() => {
      isThinking = false;
      const responseText = lang === 'en'
        ? '📷 Image received. Real-time visual perception and OCR processed locally on-device with zero cloud leakage.'
        : '📷 Foto recibida. Percepción visual y OCR en tiempo real procesados localmente en el dispositivo sin almacenamiento en servidores.';

      messages = [
        ...messages,
        {
          id: Date.now().toString(),
          role: 'assistant',
          text: responseText,
          action: {
            name: 'agent.use(VisionScanner)',
            params: 'format="jpeg", resolution="640x480", latency=16ms',
            status: 'success'
          }
        }
      ];
      scrollToBottom();
    }, 750);
  }

  function toggleVideoRecord() {
    if (!isRecordingVideo) {
      isRecordingVideo = true;
      setTimeout(() => {
        isRecordingVideo = false;
        skills = { ...skills, vision: false };
        const videoThumb = capturePhotoFromVideo() || createFallbackPhotoUrl();
        const msgId = Date.now().toString();
        messages = [
          ...messages,
          {
            id: msgId,
            role: 'user',
            text: '📹 0:02',
            imageUrl: videoThumb
          }
        ];
        scrollToBottom();
      }, 2000);
    } else {
      isRecordingVideo = false;
      skills = { ...skills, vision: false };
      const videoThumb = capturePhotoFromVideo() || createFallbackPhotoUrl();
      const msgId = Date.now().toString();
      messages = [
        ...messages,
        {
          id: msgId,
          role: 'user',
          text: '📹 0:02',
          imageUrl: videoThumb
        }
      ];
      scrollToBottom();
    }
  }

  function sendGalleryPhoto() {
    showAttachMenu = false;
    const photoUrl = createFallbackPhotoUrl();
    const photoMsgId = Date.now().toString();
    messages = [
      ...messages,
      {
        id: photoMsgId,
        role: 'user',
        text: lang === 'en' ? 'Architecture Diagram' : 'Diagrama de Arquitectura',
        imageUrl: photoUrl
      }
    ];
    scrollToBottom();

    isThinking = true;
    setTimeout(() => {
      isThinking = false;
      const responseText = lang === 'en'
        ? '🖼️ Photo from gallery received. Neural agent analyzing structural topology in memory.'
        : '🖼️ Foto de galería recibida. Agente neuronal analizando la topología estructural en memoria.';

      messages = [
        ...messages,
        {
          id: Date.now().toString(),
          role: 'assistant',
          text: responseText,
          action: {
            name: 'agent.use(MultimodalPerception)',
            params: 'source="gallery", codec="jpeg", latency=12ms',
            status: 'success'
          }
        }
      ];
      scrollToBottom();
    }, 750);
  }

  function closeCamera() {
    skills = { ...skills, vision: false };
    isRecordingVideo = false;
  }

  // --- Browser Native Speech-to-Text (STT) & Text-to-Speech (TTS) ---
  function initSpeechRecognition() {
    if (typeof window === 'undefined') return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    try {
      recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = lang === 'en' ? 'en-US' : 'es-ES';

      recognition.onstart = () => {
        isListening = true;
      };

      recognition.onresult = (event: any) => {
        let currentText = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          currentText += event.results[i][0].transcript;
        }
        if (currentText.trim()) {
          liveTranscript = currentText;
        }
      };

      recognition.onerror = (e: any) => {
        console.warn('Speech recognition warning/error:', e);
      };

      recognition.onend = () => {
        if ((skills.audio || isRecordingVoiceNote) && recognition) {
          try {
            recognition.start();
          } catch (_) {}
        } else {
          isListening = false;
        }
      };

      recognition.start();
    } catch (err) {
      console.warn('Speech recognition not available:', err);
    }
  }

  function stopSpeechRecognition() {
    if (recognition) {
      try {
        recognition.stop();
      } catch (_) {}
      recognition = null;
    }
    isListening = false;
    liveTranscript = '';
  }

  function handleSendVoiceTranscript() {
    const textToSend = liveTranscript.trim() || (lang === 'en' ? '🎙️ [Voice message]' : '🎙️ [Mensaje de voz]');
    liveTranscript = '';
    handleSend(textToSend);
  }

  // --- Real Audio Stream & Analyser Lifecycle (Pure Browser Recording) ---
  async function startAudio() {
    recordedAudioChunks = [];
    initSpeechRecognition();

    // Start fallback wave oscillation in case microphone is unavailable
    if (fallbackAudioInterval) clearInterval(fallbackAudioInterval);
    fallbackAudioInterval = setInterval(() => {
      if (!analyser && (skills.audio || isRecordingVoiceNote) && !isAudioPaused) {
        audioLevels = audioLevels.map(() => Math.floor(4 + Math.random() * 20));
      }
    }, 80);

    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioStream = stream;

      // Start real browser MediaRecorder to capture user microphone audio
      if (typeof MediaRecorder !== 'undefined') {
        try {
          const mimeType = MediaRecorder.isTypeSupported('audio/webm')
            ? 'audio/webm'
            : MediaRecorder.isTypeSupported('audio/mp4')
              ? 'audio/mp4'
              : '';
          mediaRecorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
          recordedAudioChunks = [];
          mediaRecorder.ondataavailable = (e) => {
            if (e.data && e.data.size > 0) {
              recordedAudioChunks.push(e.data);
            }
          };
          mediaRecorder.start(100);
        } catch (err) {
          console.warn('MediaRecorder initialization warning:', err);
        }
      }

      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;

      audioContext = new AudioCtx();
      const source = audioContext.createMediaStreamSource(stream);
      analyser = audioContext.createAnalyser();
      analyser.fftSize = 64;
      analyser.smoothingTimeConstant = 0.5;
      source.connect(analyser);

      const bufferLength = analyser.frequencyBinCount;
      const freqData = new Uint8Array(bufferLength);

      const updateAudio = () => {
        if (!analyser) return;
        if (isAudioPaused) {
          animFrameId = requestAnimationFrame(updateAudio);
          return;
        }
        analyser.getByteFrequencyData(freqData);

        // Map frequency bands to 16 dynamic bar heights (between 4px and 24px)
        const numBars = 16;
        const step = Math.floor(bufferLength / numBars) || 1;
        const newLevels = Array.from({ length: numBars }, (_, i) => {
          const val = freqData[i * step] || 0;
          return Math.max(4, Math.min(24, Math.round(4 + (val / 255) * 20)));
        });
        audioLevels = newLevels;

        animFrameId = requestAnimationFrame(updateAudio);
      };

      updateAudio();
    } catch (err) {
      console.warn('Microphone access denied or unavailable:', err);
    }
  }

  function startVoiceRecording() {
    isRecordingVoiceNote = true;
    startAudio();
  }

  function stopAudio() {
    isRecordingVoiceNote = false;
    stopSpeechRecognition();
    if (fallbackAudioInterval) {
      clearInterval(fallbackAudioInterval);
      fallbackAudioInterval = null;
    }
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      try {
        mediaRecorder.stop();
      } catch (_) {}
    }
    if (animFrameId) {
      cancelAnimationFrame(animFrameId);
      animFrameId = null;
    }
    if (audioStream) {
      audioStream.getTracks().forEach((track) => track.stop());
      audioStream = null;
    }
    if (audioContext && audioContext.state !== 'closed') {
      audioContext.close().catch(() => {});
      audioContext = null;
    }
    analyser = null;
    audioLevels = [6, 12, 18, 10, 16, 22, 14, 8, 12, 20, 15, 9, 13, 17, 11, 7];
    isAudioPaused = false;
  }

  function handleStopRecording() {
    isAudioPaused = !isAudioPaused;
    if (isAudioPaused) {
      if (mediaRecorder && mediaRecorder.state === 'recording') {
        try { mediaRecorder.pause(); } catch (_) {}
      }
      if (recognition) {
        try { recognition.stop(); } catch (_) {}
      }
    } else {
      if (mediaRecorder && mediaRecorder.state === 'paused') {
        try { mediaRecorder.resume(); } catch (_) {}
      }
      if (recognition && (skills.audio || isRecordingVoiceNote)) {
        try { recognition.start(); } catch (_) {}
      }
    }
  }

  function handleSendVoiceNote() {
    const durationStr = formattedAudioTime !== '0:00' ? formattedAudioTime : '0:04';
    const transcript = liveTranscript.trim();

    let audioBlobUrl: string | undefined = undefined;
    if (recordedAudioChunks.length > 0) {
      try {
        const mimeType = mediaRecorder?.mimeType || 'audio/webm';
        const blob = new Blob(recordedAudioChunks, { type: mimeType });
        audioBlobUrl = URL.createObjectURL(blob);
      } catch (err) {
        console.warn('Error creating audio blob:', err);
      }
    }

    stopAudio();
    isRecordingVoiceNote = false;
    if (skills.audio) {
      skills = { ...skills, audio: false };
    }

    const audioMsgId = `voice-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    messages = [
      ...messages,
      {
        id: audioMsgId,
        role: 'user',
        text: transcript || (lang === 'en' ? '🎙️ [Voice note]' : '🎙️ [Nota de voz]'),
        isAudio: true,
        audioDuration: durationStr,
        audioUrl: audioBlobUrl
      }
    ];
    scrollToBottom();

    isThinking = true;
    setTimeout(() => {
      isThinking = false;
      const responseText = transcript
        ? (lang === 'en'
            ? `Audio processed: "${transcript}". Executing agent action stateless in memory.`
            : `Audio procesado: "${transcript}". Ejecutando acción agéntica stateless en memoria.`)
        : (lang === 'en'
            ? `Voice note received (${durationStr}). Audio perception processed on-device with zero server storage.`
            : `Nota de voz recibida (${durationStr}). Percepción de audio procesada en el dispositivo sin almacenamiento en servidores.`);

      messages = [
        ...messages,
        {
          id: `asst-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          role: 'assistant',
          text: responseText,
          action: {
            name: 'agent.use(VoicePerception)',
            params: `duration=${durationStr}, codec="opus/native", stateless=true`,
            status: 'success'
          }
        }
      ];
      scrollToBottom();
    }, 850);
  }

  function togglePlayAudioMsg(id: string, audioUrl?: string) {
    if (playingAudioMsgId === id) {
      if (currentAudioElement) {
        currentAudioElement.pause();
        currentAudioElement = null;
      }
      playingAudioMsgId = null;
      return;
    }

    if (currentAudioElement) {
      currentAudioElement.pause();
      currentAudioElement = null;
    }

    playingAudioMsgId = id;

    if (audioUrl) {
      const audio = new Audio(audioUrl);
      currentAudioElement = audio;
      audio.onended = () => {
        if (playingAudioMsgId === id) playingAudioMsgId = null;
        currentAudioElement = null;
      };
      audio.onerror = () => {
        if (playingAudioMsgId === id) playingAudioMsgId = null;
        currentAudioElement = null;
      };
      audio.play().catch((err) => {
        console.warn('Audio play error:', err);
        if (playingAudioMsgId === id) playingAudioMsgId = null;
      });
    } else {
      // Fallback timer when audio recorded without media device (simulated)
      setTimeout(() => {
        if (playingAudioMsgId === id) {
          playingAudioMsgId = null;
        }
      }, 3000);
    }
  }

  function startLiveVoiceSession() {
    if (skills.audio) {
      skills.audio = false;
      return;
    }
    skills.audio = true;
    untrack(() => {
      messages = [
        ...messages,
        {
          id: Date.now().toString(),
          role: 'assistant',
          text: lang === 'en'
            ? '🎙️ [Live Call Active] Real-time bidirectional voice channel open. Speak freely.'
            : '🎙️ [Llamada Live Activa] Canal de voz bidireccional en tiempo real abierto. Habla libremente.',
          action: {
            name: 'agent.use(GeminiLiveStream)',
            params: 'mode="full_duplex", latency="sub_20ms"',
            status: 'success'
          }
        }
      ];
      scrollToBottom();
    });
  }

  // Reactive effect when superpower skills change (tracked non-reactively with plain JS object)
  let lastSkills = { audio: false, vision: false, security: false };
  $effect(() => {
    const currentAudio = skills.audio;
    const currentVision = skills.vision;
    const currentSecurity = skills.security;

    // Camera trigger
    if (currentVision && !lastSkills.vision) {
      startCamera();
      untrack(() => {
        messages = [
          ...messages,
          {
            id: Date.now().toString(),
            role: 'assistant',
            text: lang === 'en'
              ? '👁️ [Vision Stream Active] Live camera feed initialized. Real-time OCR and visual perception active.'
              : '👁️ [Stream de Visión Activo] Cámara en vivo inicializada. OCR en tiempo real y percepción visual activa.',
            action: {
              name: 'agent.use(VisionScanner)',
              params: 'source="real_camera_stream", fov=90deg, fps=60',
              status: 'success'
            }
          }
        ];
        scrollToBottom();
      });
    } else if (!currentVision && lastSkills.vision) {
      stopCamera();
    }

    // Audio trigger
    if (currentAudio && !lastSkills.audio) {
      startAudio();
      const activationMsg = lang === 'en'
        ? '🎙️ [Live Audio Stream Active] Microphone stream connected. Dynamic Island adapting to your real voice.'
        : '🎙️ [Stream de Audio Activo] Micrófono en vivo conectado. Dynamic Island adaptándose a tu voz real.';
      untrack(() => {
        messages = [
          ...messages,
          {
            id: Date.now().toString(),
            role: 'assistant',
            text: activationMsg,
            action: {
              name: 'agent.use(LiveAudioStream)',
              params: 'source="live_mic", latency=12ms, sample_rate=48kHz',
              status: 'success'
            }
          }
        ];
        scrollToBottom();
      });
    } else if (!currentAudio && lastSkills.audio) {
      stopAudio();
    }

    // Security trigger
    if (currentSecurity && !lastSkills.security) {
      untrack(() => {
        messages = [
          ...messages,
          {
            id: Date.now().toString(),
            role: 'assistant',
            text: lang === 'en'
              ? '🔐 [Secure Enclave Activated] Cryptographic keypair generated in hardware secure enclave. Zero cloud leakage.'
              : '🔐 [Secure Enclave Activo] Llave criptográfica generada en el enclave seguro de hardware. Cero filtración en la nube.',
            action: {
              name: 'agent.use(SecureEnclave)',
              params: 'chip="Apple Secure Enclave / Android StrongBox", algorithm="ECDSA_P256"',
              status: 'success'
            }
          }
        ];
        scrollToBottom();
      });
    }

    lastSkills = { audio: currentAudio, vision: currentVision, security: currentSecurity };
  });

  // Watch for videoElement mounting to attach stream
  $effect(() => {
    if (videoElement && videoStream && videoElement.srcObject !== videoStream) {
      videoElement.srcObject = videoStream;
      videoElement.play().catch(() => {});
    }
  });

  onDestroy(() => {
    stopCamera();
    stopAudio();
    if (currentAudioElement) {
      currentAudioElement.pause();
      currentAudioElement = null;
    }
  });

  function scrollToBottom() {
    setTimeout(() => {
      if (messagesContainer) {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
      }
    }, 50);
  }

  async function handleSend(promptText?: string) {
    const text = (promptText || userInput).trim();
    if (!text || isThinking) return;

    userInput = '';
    const userMsgId = Date.now().toString();

    messages = [
      ...messages,
      {
        id: userMsgId,
        role: 'user',
        text
      }
    ];
    scrollToBottom();

    isThinking = true;

    setTimeout(() => {
      const lower = text.toLowerCase();
      const isIos = lower.includes('ios') || lower.includes('swift') || lower.includes('apple') || lower.includes('xcode');
      const isAndroid = lower.includes('android') || lower.includes('kotlin') || lower.includes('compose');
      const isStateless = lower.includes('stateless') || lower.includes('guardar') || lower.includes('store') || lower.includes('privacy') || lower.includes('privacidad') || lower.includes('data');

      let action: SimulatorMessage['action'] | undefined = undefined;
      let replyText = lang === 'en'
        ? 'Our native iOS and Android Clients connect directly to your mobile app without intermediary servers. Would you like to see a Swift or Kotlin example?'
        : 'Nuestros clientes iOS y Android se conectan directamente a tu app móvil sin intermediarios. ¿Quieres ver un ejemplo en Swift o en Kotlin?';

      if (isIos) {
        action = {
          name: 'SwiftPackage.resolve',
          params: 'framework="SwiftUI", concurrency="async/await"',
          status: 'success'
        };
        replyText = lang === 'en'
          ? 'In Swift, simply instantiate IOSClient and stream events using `for await event in agent.run(prompt)`. The iOS Client automatically manages network reconnects and app lifecycle.'
          : 'En Swift solo necesitas instanciar IOSClient y suscribirte al stream con `for await event in agent.run(prompt)`. El cliente iOS maneja reconexiones de red y el ciclo de vida de la app.';
      } else if (isAndroid) {
        action = {
          name: 'cl.zea.client.AndroidClient.flow',
          params: 'framework="Jetpack Compose", async="Coroutines"',
          status: 'success'
        };
        replyText = lang === 'en'
          ? 'In Android, use our native AndroidClient with Coroutines and Flow. It binds directly to your ViewModel and updates Jetpack Compose reactively.'
          : 'En Android usas nuestro AndroidClient nativo con corrutinas y Flow. Se conecta directamente a tu ViewModel y actualiza tu interfaz de Compose de forma reactiva.';
      } else if (isStateless) {
        replyText = lang === 'en'
          ? 'Exactly. Zero data retention. The agent reasons and executes tools in-memory in real time, then disconnects without storing records on external databases.'
          : 'Exacto. Cero retención de datos. El agente razona y ejecuta herramientas en tiempo real en memoria y se desconecta sin almacenar registros en bases de datos ajenas.';
      } else {
        action = {
          name: platform === 'ios' ? 'IOSClient.dispatchAction' : 'AndroidClient.dispatchAction',
          params: 'target="mobile_runtime", latency=28ms',
          status: 'success'
        };
      }

      messages = [
        ...messages,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          text: replyText,
          ...(action ? { action } : {})
        }
      ];

      isThinking = false;
      scrollToBottom();
    }, 450);
  }
</script>

<div class="flex flex-col items-center justify-center w-full select-none py-2">
  <!-- Realistic Native Device Frame Container -->
  <div class="relative mx-auto max-w-[390px] w-full" data-testid="mobile-simulator">
    <!-- Outer Beveled Chassis (Titanium Natural / Dark) -->
    <div
      class="relative p-[4px] bg-[#26262d] shadow-[0_30px_90px_rgba(0,0,0,0.95)] border-[2.5px] border-[#3f3f4c] ring-1 ring-white/10 {platform === 'ios' ? 'rounded-[56px]' : 'rounded-[46px]'}"
    >
      <!-- Inner Screen Bezel (Edge-to-Edge OLED) -->
      <div
        class="relative bg-black overflow-hidden flex flex-col h-[740px] {platform === 'ios' ? 'rounded-[52px]' : 'rounded-[42px]'}"
      >
        <!-- Native Mobile Status Bar & Dynamic Island -->
        <div class="flex items-center justify-between z-20 text-white select-none {platform === 'ios' ? 'pt-3.5 pb-1 px-7' : 'pt-4 pb-2.5 px-6'}">
          {#if platform === 'ios'}
            <span class="font-semibold text-[13.5px] tracking-tight w-12 text-left font-sans">6:04</span>

            <!-- Dynamic Island (Reacts live to voice with real AudioContext analyser) -->
            <div
              class="h-[34px] bg-black rounded-full flex items-center justify-between px-3.5 shadow-inner border border-zinc-900/80 transition-all duration-300 {skills.audio ? 'w-[170px] ring-1 ring-emerald-500/60 shadow-[0_0_15px_rgba(52,211,153,0.3)]' : 'w-[125px]'}"
            >
              <!-- Front Camera Lens -->
              <div class="h-3 w-3 rounded-full bg-[#111116] border border-zinc-800 flex items-center justify-center shrink-0">
                <div class="h-1 w-1 rounded-full bg-zinc-900"></div>
              </div>

              {#if skills.audio}
                <!-- Real-time Equalizer Waveform driven by real microphone input -->
                <div class="flex items-center gap-1 px-1">
                  {#each audioLevels as level}
                    <span
                      class="w-1 bg-emerald-400 rounded-full transition-all duration-75"
                      style="height: {level}px;"
                    ></span>
                  {/each}
                </div>
              {/if}

              <!-- Live Agent Indicator -->
              <div class="h-2 w-2 rounded-full {skills.audio ? 'bg-emerald-400' : 'bg-[#23e062]'} animate-pulse shrink-0"></div>
            </div>

            <!-- iOS Status Icons -->
            <div class="flex items-center gap-1.5 w-12 justify-end">
              <!-- Cellular Signal Bars -->
              <div class="flex items-end gap-[1.5px] h-3">
                <div class="w-[2.5px] h-1 bg-white rounded-2xs"></div>
                <div class="w-[2.5px] h-1.5 bg-white rounded-2xs"></div>
                <div class="w-[2.5px] h-2 bg-white rounded-2xs"></div>
                <div class="w-[2.5px] h-2.5 bg-white rounded-2xs"></div>
              </div>
              <!-- Wi-Fi -->
              <svg class="h-3.5 w-3.5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 4C7.31 4 3.07 5.9 0 8.98L12 21 24 8.98A16.88 16.88 0 0012 4zm0 3c3.78 0 7.22 1.44 9.81 3.82L12 18.66 2.19 10.82A13.9 13.9 0 0112 7z" />
              </svg>
              <!-- Battery with Level -->
              <div class="w-5 h-2.5 rounded-[3px] border border-white/80 p-[1px] flex items-center">
                <div class="bg-white h-full w-4/5 rounded-2xs"></div>
              </div>
            </div>
          {:else}
            <span class="font-semibold text-xs w-12 text-left">10:00</span>

            <!-- Punch-Hole Camera (Android) + Live Real-Audio Equalizer Pill -->
            <div class="flex items-center gap-2">
              <div class="w-4 h-4 bg-black rounded-full border border-zinc-800 flex items-center justify-center">
                <div class="w-1.5 h-1.5 rounded-full bg-[#121218]"></div>
              </div>
              {#if skills.audio}
                <div class="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/50">
                  {#each audioLevels.slice(0, 3) as level}
                    <span
                      class="w-0.5 bg-emerald-400 rounded-full transition-all duration-75"
                      style="height: {Math.max(4, Math.round(level * 0.6))}px;"
                    ></span>
                  {/each}
                </div>
              {/if}
            </div>

            <!-- Android Icons -->
            <div class="flex items-center gap-1.5 w-12 justify-end text-[10px]">
              <span>5G</span>
              <div class="w-4 h-2 rounded-xs border border-zinc-400 p-0.5 flex items-center">
                <div class="bg-[#23e062] h-full w-4/5"></div>
              </div>
            </div>
          {/if}
        </div>

        {#if skills.vision}
          <!-- FULL-SCREEN NATIVE CAMERA VIEW (No chat, no chips, no input bar, no tabs) -->
          <div class="relative flex-1 bg-black flex flex-col justify-between overflow-hidden" data-testid="real-camera-viewfinder">
            <!-- Real Video Stream from User's Webcam -->
            <video
              bind:this={videoElement}
              autoplay
              playsinline
              muted
              class="absolute inset-0 w-full h-full object-cover scale-x-[-1]"
            ></video>

            <!-- Minimal fallback state if camera permissions are denied or pending -->
            {#if cameraError || !videoStream}
              <div class="absolute inset-0 flex flex-col items-center justify-center bg-zinc-950/90 text-zinc-400 p-6 text-center">
                <p class="text-xs font-semibold text-white">{lang === 'en' ? 'Camera' : 'Cámara'}</p>
                <p class="text-[10px] text-zinc-500 mt-1 max-w-[220px]">
                  {cameraError ? (lang === 'en' ? 'Camera permission required.' : 'Permite el acceso a la cámara en tu navegador.') : (lang === 'en' ? 'Starting camera...' : 'Iniciando cámara...')}
                </p>
              </div>
            {/if}

            <!-- Top Camera Controls: Close [X] and Recording indicator -->
            <div class="relative z-10 pt-3 px-5 flex items-center justify-between">
              <!-- Close Button (returns to chat) -->
              <button
                type="button"
                onclick={closeCamera}
                class="h-9 w-9 rounded-full bg-black/60 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-black/90 transition cursor-pointer"
                aria-label={lang === 'en' ? 'Close camera' : 'Cerrar cámara'}
                data-testid="camera-close-btn"
                data-close-camera="true"
              >
                <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>

              {#if isRecordingVideo}
                <!-- Live Recording Badge -->
                <div class="flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-600/90 text-white font-mono text-xs font-bold animate-pulse shadow-lg">
                  <span class="w-2 h-2 rounded-full bg-white"></span>
                  <span>REC</span>
                </div>
              {/if}
            </div>

            <!-- Bottom Camera Controls: Mode Switcher (VIDEO | FOTO) and Concentric Shutter Button -->
            <div class="relative z-10 pb-4 pt-3 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col items-center gap-3">
              <!-- Mode Switcher: VIDEO | FOTO (iPhone style) -->
              <div class="flex items-center gap-6 text-xs font-semibold tracking-wider font-sans select-none">
                <button
                  type="button"
                  onclick={() => cameraMode = 'video'}
                  class="transition-colors cursor-pointer {cameraMode === 'video' ? 'text-yellow-400 font-bold' : 'text-zinc-400 hover:text-white'}"
                  data-testid="camera-mode-video"
                >
                  VIDEO
                </button>
                <button
                  type="button"
                  onclick={() => cameraMode = 'photo'}
                  class="transition-colors cursor-pointer {cameraMode === 'photo' ? 'text-yellow-400 font-bold' : 'text-zinc-400 hover:text-white'}"
                  data-testid="camera-mode-photo"
                >
                  {lang === 'en' ? 'PHOTO' : 'FOTO'}
                </button>
              </div>

              <!-- Shutter Row: Gallery placeholder, Central Concentric Shutter Button, Flip Button -->
              <div class="w-full px-8 flex items-center justify-between">
                <!-- Gallery thumbnail icon -->
                <div class="w-10 h-10 rounded-lg border border-white/20 bg-zinc-900/60 overflow-hidden flex items-center justify-center">
                  <svg class="h-5 w-5 text-white/40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                    <circle cx="8.5" cy="8.5" r="1.5"/>
                    <polyline points="21 15 16 10 5 21"/>
                  </svg>
                </div>

                <!-- Center iPhone Shutter Button (Concentric circle) -->
                <button
                  type="button"
                  onclick={() => {
                    if (cameraMode === 'photo') {
                      takePhoto();
                    } else {
                      toggleVideoRecord();
                    }
                  }}
                  class="h-16 w-16 rounded-full border-[3.5px] border-white flex items-center justify-center cursor-pointer transition-transform active:scale-90 shadow-2xl"
                  aria-label={cameraMode === 'photo' ? 'Tomar foto' : (isRecordingVideo ? 'Detener grabación' : 'Grabar video')}
                  data-testid="camera-shutter-btn"
                >
                  {#if cameraMode === 'photo'}
                    <!-- Solid White Circle for Photo -->
                    <div class="h-12 w-12 rounded-full bg-white transition-all"></div>
                  {:else}
                    <!-- Red Circle for Video (scales to rounded square if recording) -->
                    <div class="h-12 w-12 rounded-full bg-red-500 transition-all {isRecordingVideo ? 'scale-75 rounded-md' : ''}"></div>
                  {/if}
                </button>

                <!-- Flip Camera Button -->
                <button
                  type="button"
                  onclick={() => {}}
                  class="h-10 w-10 rounded-full bg-black/40 border border-white/20 flex items-center justify-center text-white hover:bg-black/70 transition cursor-pointer"
                  aria-label={lang === 'en' ? 'Flip camera' : 'Cambiar cámara'}
                >
                  <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M20 10c0-4.418-3.582-8-8-8s-8 3.582-8 8c0 2.21.896 4.21 2.344 5.656L4 18h6v-6l-2.28 2.28C6.67 13.23 6 11.7 6 10c0-3.314 2.686-6 6-6s6 2.686 6 6c0 1.7-.67 3.23-1.72 4.28L14 12v6h6l-2.344-2.344C19.104 14.21 20 12.21 20 10z"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        {:else if showDrawerMenu}
          <!-- FULL-SCREEN 100% MENU / SESSIONS SCREEN (Same bg-black as chat, No Home Indicator) -->
          <div
            class="relative flex-1 bg-black flex flex-col justify-between overflow-hidden animate-in fade-in duration-150"
            data-testid="menu-full-screen"
          >
            <!-- Top App Bar for Full Screen Menu: iOS/Android Client at Top Left, Close [X] at Top Right -->
            <div class="flex items-center justify-between z-20 bg-transparent {platform === 'android' ? 'px-6 pt-3 pb-3' : 'px-5 py-2.5'}">
              <!-- Platform Identity on Left -->
              <div class="flex items-center gap-2">
                {#if platform === 'ios'}
                  <AppleLogo class="h-4 w-auto text-white" />
                {:else}
                  <AndroidLogo class="h-4.5 w-auto text-emerald-400" />
                {/if}
                <span class="text-sm font-semibold text-white tracking-tight font-sans">
                  {platform === 'ios' ? 'iOS Client' : 'Android Client'}
                </span>
              </div>

              <!-- Close [X] Action on Right -->
              <button
                type="button"
                onclick={() => (showDrawerMenu = false)}
                aria-label={lang === 'en' ? 'Close' : 'Cerrar'}
                class="p-1.5 -mr-1.5 text-zinc-400 hover:text-white transition cursor-pointer rounded-full hover:bg-white/10"
                data-testid="menu-close-btn"
              >
                <svg class="h-4.5 w-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <!-- Scrollable Content of the 100% Screen -->
            <div class="flex-1 overflow-y-auto {platform === 'android' ? 'px-6 py-3 space-y-4.5' : 'px-5 py-3 space-y-4'} text-left font-sans text-xs">
              <!-- 1. Nueva Sesión: Botón de texto minimalista con icono simple SVG (sin emojis) -->
              <button
                type="button"
                onclick={() => {
                  messages = [
                    {
                      id: Date.now().toString(),
                      role: 'assistant',
                      text: lang === 'en'
                        ? 'New stateless session initialized. All computation runs on-device in memory.'
                        : 'Nueva sesión stateless inicializada. Todo el procesamiento corre en el dispositivo.'
                    }
                  ];
                  showDrawerMenu = false;
                }}
                class="w-full text-left py-2 px-2.5 rounded-xl text-zinc-200 hover:text-white hover:bg-white/5 transition cursor-pointer flex items-center gap-2.5 font-medium text-xs group"
                data-testid="menu-new-session-btn"
              >
                <!-- Simple SVG Plus Icon -->
                <svg class="h-4 w-4 text-zinc-400 group-hover:text-white transition" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                <span>{lang === 'en' ? 'New session' : 'Nueva sesión'}</span>
              </button>

              <!-- 2. Opciones de Configuración -->
              <div>
                <div class="text-[10px] uppercase font-mono tracking-wider text-zinc-500 mb-2 px-1">
                  {lang === 'en' ? 'Configuration' : 'Configuración'}
                </div>
                <div class="p-3.5 rounded-2xl bg-[#1C1C20] border border-[#2D2D34] space-y-2 text-zinc-300">
                  <div class="flex items-center justify-between text-[11px] py-0.5">
                    <span class="text-zinc-400 font-mono">{lang === 'en' ? 'Runtime' : 'Runtime'}</span>
                    <span class="font-medium text-white">100% Stateless</span>
                  </div>
                  <div class="flex items-center justify-between text-[11px] py-0.5 border-t border-zinc-800/60">
                    <span class="text-zinc-400 font-mono">{lang === 'en' ? 'Platform SDK' : 'Plataforma SDK'}</span>
                    <span class="font-medium text-white">{platform === 'ios' ? 'SwiftUI Native' : 'Jetpack Compose'}</span>
                  </div>
                  <div class="flex items-center justify-between text-[11px] py-0.5 border-t border-zinc-800/60">
                    <span class="text-zinc-400 font-mono">{lang === 'en' ? 'Storage Policy' : 'Almacenamiento'}</span>
                    <span class="font-medium text-emerald-400">{lang === 'en' ? 'Zero Server Storage' : 'Zero Servidor (En Memoria)'}</span>
                  </div>
                  <div class="flex items-center justify-between text-[11px] py-0.5 border-t border-zinc-800/60">
                    <span class="text-zinc-400 font-mono">{lang === 'en' ? 'Connection' : 'Conexión'}</span>
                    <span class="font-medium text-white">WebSocket Stream (&lt;20ms)</span>
                  </div>
                </div>
              </div>

              <!-- 3. Sesiones y las conversaciones -->
              <div>
                <div class="text-[10px] uppercase font-mono tracking-wider text-zinc-500 mb-2 px-1">
                  {lang === 'en' ? 'Sessions' : 'Sesiones'}
                </div>
                <div class="space-y-1.5">
                  <!-- Active Conversation -->
                  <button
                    type="button"
                    onclick={() => (showDrawerMenu = false)}
                    class="w-full text-left p-3 rounded-2xl bg-[#1C1C20] border border-[#2D2D34] hover:border-zinc-500 text-white transition cursor-pointer flex items-center justify-between group"
                  >
                    <div class="flex items-center gap-2.5 min-w-0">
                      <span class="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)] shrink-0"></span>
                      <div class="min-w-0">
                        <p class="text-xs font-semibold text-white truncate">{lang === 'en' ? 'Current Chat' : 'Chat actual'}</p>
                        <p class="text-[10.5px] text-zinc-400 truncate font-mono">
                          {messages.length} {lang === 'en' ? 'messages' : 'mensajes'} • Stateless session
                        </p>
                      </div>
                    </div>
                    <svg class="h-4 w-4 text-zinc-500 group-hover:text-white transition shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M9 18l6-6-6-6" />
                    </svg>
                  </button>

                  <!-- Conversation 1 -->
                  <button
                    type="button"
                    onclick={() => {
                      messages = [
                        {
                          id: Date.now().toString(),
                          role: 'assistant',
                          text: platform === 'ios'
                            ? (lang === 'en' ? 'Here is the Swift package setup for your SwiftUI views.' : 'Aquí tienes la configuración del paquete Swift para tus vistas SwiftUI.')
                            : (lang === 'en' ? 'Here is the Kotlin setup with Jetpack Compose.' : 'Aquí tienes la configuración en Kotlin con Jetpack Compose.')
                        }
                      ];
                      showDrawerMenu = false;
                    }}
                    class="w-full text-left p-2.5 px-3 rounded-xl bg-transparent hover:bg-[#1C1C20]/50 text-zinc-300 hover:text-white transition cursor-pointer flex items-center justify-between group"
                  >
                    <div class="flex items-center gap-2.5 min-w-0">
                      <svg class="h-3.5 w-3.5 text-zinc-500 group-hover:text-zinc-300 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                      </svg>
                      <span class="text-xs truncate">{platform === 'ios' ? 'Integración en SwiftUI' : 'Integración en Kotlin Compose'}</span>
                    </div>
                    <span class="text-[10px] text-zinc-500 font-mono shrink-0">1d</span>
                  </button>

                  <!-- Conversation 2 -->
                  <button
                    type="button"
                    onclick={() => {
                      messages = [
                        {
                          id: Date.now().toString(),
                          role: 'assistant',
                          text: lang === 'en'
                            ? 'Our direct WebSocket stream delivers sub-20ms latency with zero intermediary servers.'
                            : 'El stream WebSocket directo ofrece latencia menor a 20ms sin servidores intermediarios.'
                        }
                      ];
                      showDrawerMenu = false;
                    }}
                    class="w-full text-left p-2.5 px-3 rounded-xl bg-transparent hover:bg-[#1C1C20]/50 text-zinc-300 hover:text-white transition cursor-pointer flex items-center justify-between group"
                  >
                    <div class="flex items-center gap-2.5 min-w-0">
                      <svg class="h-3.5 w-3.5 text-zinc-500 group-hover:text-zinc-300 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                      </svg>
                      <span class="text-xs truncate">{lang === 'en' ? 'Low-latency WebSockets' : 'WebSockets de baja latencia'}</span>
                    </div>
                    <span class="text-[10px] text-zinc-500 font-mono shrink-0">2d</span>
                  </button>
                </div>
              </div>
            </div>

            <!-- Bottom User Profile Bar: Avatar, User Name, Gear Icon (No Home indicator) -->
            <div class="px-5 py-3 border-t border-[#222226] bg-[#0E0E11] flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div class="h-8 w-8 rounded-full bg-gradient-to-tr from-zinc-700 to-zinc-500 border border-zinc-600 flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-sm">
                  DU
                </div>
                <div class="flex flex-col text-left">
                  <span class="text-xs font-semibold text-white tracking-tight leading-tight">Dev User</span>
                  <span class="text-[10px] text-zinc-400 font-mono leading-tight">dev@zea.cl</span>
                </div>
              </div>

              <!-- Gear Icon (Tuerca de configuración) -->
              <button
                type="button"
                aria-label={lang === 'en' ? 'Settings' : 'Configuración'}
                class="h-8 w-8 rounded-full hover:bg-white/10 flex items-center justify-center text-zinc-400 hover:text-white transition cursor-pointer"
                data-testid="user-settings-btn"
              >
                <svg class="h-4.5 w-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="3"></circle>
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                </svg>
              </button>
            </div>
          </div>
        {:else if activePillar === 'edge'}
          <!-- ZEA Edge Industrial Heavy Operations (Caterpillar Theme) -->
          <ZeaEdgeScreen {lang} {platform} />
        {:else if activePillar === 'sport'}
          <!-- ZEA Sport Native Gus Training Experience -->
          <ZeaSportScreen {lang} {platform} />
        {:else}
          <!-- Seamless Top Bar: Part of the dark background canvas (no border, generous breathing room) -->
          <div class="flex items-center justify-between z-20 bg-transparent {platform === 'android' ? 'px-6 pt-3 pb-3.5' : 'px-5 py-2.5'}">
            <div class="flex items-center gap-2.5">
              <!-- Menu / Expand Icon on Left -->
              <button
                type="button"
                onclick={() => (showDrawerMenu = !showDrawerMenu)}
                aria-label={lang === 'en' ? 'Open menu' : 'Abrir menú'}
                class="p-1.5 -ml-1.5 text-zinc-400 hover:text-white transition cursor-pointer flex items-center justify-center rounded-full hover:bg-white/10"
                data-testid="header-menu-btn"
              >
                <!-- Clean 3-line Menu / Sidebar Icon -->
                <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="4" y1="7" x2="20" y2="7" />
                  <line x1="4" y1="12" x2="16" y2="12" />
                  <line x1="4" y1="17" x2="20" y2="17" />
                </svg>
              </button>

              <!-- Platform Logo + Client Title (Part of the background, clean) -->
              <div class="flex items-center gap-2">
                {#if platform === 'ios'}
                  <AppleLogo class="h-3.5 w-auto text-white" />
                {:else}
                  <AndroidLogo class="h-4 w-auto text-emerald-400" />
                {/if}
                <span class="text-[13px] font-semibold text-white tracking-tight font-sans">
                  {platform === 'ios' ? 'iOS Client' : 'Android Client'}
                </span>
              </div>
            </div>

            <!-- Clean Right Action: New Chat Action Icon -->
            <button
              type="button"
              onclick={() => {
                messages = [
                  {
                    id: Date.now().toString(),
                    role: 'assistant',
                    text: lang === 'en'
                      ? 'Hello! How can I assist you with your mobile architecture today?'
                      : '¡Hola! ¿En qué puedo ayudarte hoy con tu arquitectura móvil?'
                  }
                ];
              }}
              aria-label={lang === 'en' ? 'New chat' : 'Nuevo chat'}
              class="p-1.5 -mr-1.5 text-zinc-400 hover:text-white transition cursor-pointer rounded-full hover:bg-white/10"
              data-testid="header-new-chat-btn"
            >
              <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 20h9"/>
                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
              </svg>
            </button>
          </div>

          <!-- Relative Container for Chat and Superpower Overlays -->
          <div class="relative flex-1 flex flex-col min-h-0 overflow-hidden">

          <!-- SUPERPOWER OVERLAY: Secure Enclave Biometrics -->
          {#if skills.security}
            <div class="absolute top-3 left-1/2 -translate-x-1/2 z-40 bg-zinc-950/95 border border-violet-500/60 rounded-2xl px-3.5 py-2 flex items-center gap-2.5 shadow-[0_0_25px_rgba(167,139,250,0.4)] backdrop-blur-md">
              <div class="h-6 w-6 rounded-full bg-violet-950/80 border border-violet-500/60 flex items-center justify-center shrink-0">
                <svg class="h-3.5 w-3.5 text-violet-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  <path stroke-linecap="round" stroke-linejoin="round" d="m9 12 2 2 4-4"/>
                </svg>
              </div>
              <div class="text-left font-sans">
                <p class="text-[11px] font-semibold text-white tracking-tight">Secure Enclave Hardware Key</p>
                <p class="text-[9px] font-mono text-violet-300/80">Biometric Verified • 0x8a92...f7</p>
              </div>
            </div>
          {/if}

          <!-- Chat Scrollable Body -->
          <div bind:this={messagesContainer} class="flex-1 overflow-y-auto text-left text-xs {platform === 'android' ? 'px-6 py-4 space-y-5.5' : 'px-5 py-3 space-y-4'}">
            {#each messages as msg (msg.id)}
              {#if msg.role === 'user'}
                {#if msg.isAudio}
                  <!-- User Audio Note Bubble: Elevated Charcoal (#1C1C20, border #2D2D34) -->
                  <div class="flex justify-end">
                    <div
                      class="max-w-[85%] px-4 py-3 bg-[#1C1C20] border border-[#2D2D34] text-white rounded-[20px] shadow-sm font-sans flex flex-col gap-1.5"
                    >
                      <div class="flex items-center gap-2.5">
                        <button
                          type="button"
                          onclick={() => togglePlayAudioMsg(msg.id, msg.audioUrl)}
                          class="h-7 w-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white shrink-0 transition cursor-pointer"
                          aria-label="Reproducir nota de voz"
                        >
                          {#if playingAudioMsgId === msg.id}
                            <svg class="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24">
                              <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
                            </svg>
                          {:else}
                            <svg class="h-3.5 w-3.5 fill-current ml-0.5" viewBox="0 0 24 24">
                              <path d="M8 5v14l11-7z"/>
                            </svg>
                          {/if}
                        </button>
                        <div class="flex items-center gap-[2.5px] flex-1 h-5">
                          {#each [6, 12, 18, 14, 8, 16, 20, 14, 10, 15, 18, 12, 8, 14, 10, 6] as h, i}
                            <span
                              class="w-[2px] rounded-full transition-all duration-75 {playingAudioMsgId === msg.id ? 'bg-white animate-pulse' : 'bg-zinc-400'}"
                              style="height: {h}px; animation-delay: {i * 40}ms;"
                            ></span>
                          {/each}
                        </div>
                        <div class="flex flex-col items-end shrink-0 text-[10px] font-mono text-zinc-400 font-medium leading-tight">
                          <span>{msg.audioDuration || '0:04'}</span>
                          <span class="text-[9px] text-zinc-400">✓✓</span>
                        </div>
                      </div>
                      {#if msg.text && !msg.text.startsWith('🎙️')}
                        <p class="text-[10.5px] text-zinc-300 font-medium italic border-t border-zinc-700/50 pt-1">
                          "{msg.text}"
                        </p>
                      {/if}
                    </div>
                  </div>
                {:else if msg.imageUrl}
                  <!-- User Photo Message Bubble: Elevated Charcoal (#1C1C20, border #2D2D34) -->
                  <div class="flex justify-end">
                    <div
                      class="max-w-[78%] p-1 bg-[#1C1C20] border border-[#2D2D34] rounded-[20px] shadow-md overflow-hidden relative group"
                      data-testid="whatsapp-photo-message"
                    >
                      <div class="relative rounded-[16px] overflow-hidden bg-black/40">
                        <img
                          src={msg.imageUrl}
                          alt="Foto capturada"
                          class="w-full h-auto max-h-[220px] object-cover block"
                        />
                        <!-- Photo Timestamp Overlay -->
                        <div class="absolute bottom-1.5 right-1.5 bg-black/60 backdrop-blur-xs px-1.5 py-0.5 rounded-full flex items-center gap-1 text-[9px] font-mono text-white/95">
                          <span>6:04</span>
                          <span class="text-white font-bold">✓✓</span>
                        </div>
                      </div>
                      {#if msg.text}
                        <p class="px-2 pt-1 pb-0.5 text-xs text-zinc-200 font-medium leading-snug">
                          {msg.text}
                        </p>
                      {/if}
                    </div>
                  </div>
                {:else}
                  <!-- User Question Bubble: Elevated Charcoal (#1C1C20, border #2D2D34, text-zinc-100) -->
                  <div class="flex justify-end">
                    <div
                      class="max-w-[84%] px-4.5 py-3 bg-[#1C1C20] border border-[#2D2D34] text-zinc-100 font-sans text-xs leading-relaxed rounded-[20px] shadow-sm"
                    >
                      {msg.text}
                    </div>
                  </div>
                {/if}
              {:else}
                <!-- Assistant Message: Direct Stream (No Bubble Container, Modern Native AI Agent Pattern) -->
                <div class="flex items-start gap-3.5 max-w-[95%]">
                  <div class="h-6.5 w-6.5 rounded-full bg-[#1C1C20] border border-[#2D2D34] flex items-center justify-center shrink-0 mt-0.5">
                    {#if platform === 'ios'}
                      <AppleLogo class="h-3 w-auto text-zinc-100" />
                    {:else}
                      <AndroidLogo class="h-3.5 w-auto text-emerald-400" />
                    {/if}
                  </div>

                  <div class="flex-1 text-zinc-200 text-xs leading-[1.65] font-sans pt-0.5">
                    {#if msg.action}
                      <div class="inline-flex items-center gap-1.5 px-2.5 py-1 mb-2.5 bg-[#1C1C20] border border-[#2D2D34] rounded-lg text-zinc-300 text-[11px] font-medium">
                        <svg class="h-3 w-3 text-amber-400 fill-current" viewBox="0 0 24 24">
                          <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                        </svg>
                        <span>{platform === 'ios' ? `Action: ${msg.action.name}` : `Tool: ${msg.action.name}`}</span>
                      </div>
                    {/if}

                    <p class="text-zinc-200">{msg.text}</p>
                  </div>
                </div>
              {/if}
            {/each}

            <!-- Subtle Typing Indicator when thinking (No Bubble) -->
            {#if isThinking}
              <div class="flex items-center gap-2.5 max-w-[90%]">
                <div class="h-6 w-6 rounded-full bg-[#1C1C20] border border-[#2D2D34] flex items-center justify-center shrink-0">
                  {#if platform === 'ios'}
                    <AppleLogo class="h-3 w-auto text-zinc-100" />
                  {:else}
                    <AndroidLogo class="h-3 w-auto text-emerald-400" />
                  {/if}
                </div>
                <div class="flex items-center gap-1.5 py-1">
                  <span class="h-1.5 w-1.5 rounded-full bg-zinc-400 animate-pulse"></span>
                  <span class="h-1.5 w-1.5 rounded-full bg-zinc-400 animate-pulse [animation-delay:150ms]"></span>
                  <span class="h-1.5 w-1.5 rounded-full bg-zinc-400 animate-pulse [animation-delay:300ms]"></span>
                </div>
              </div>
            {/if}
          </div>
        </div>

        <!-- Quick Action Prompt Chips (Neutral Dark Gray, No Blue Typography, Generous Padding) -->
        <div class="px-5 py-2.5 flex items-center gap-2 overflow-x-auto no-scrollbar border-t border-[#222226]/80 bg-[#0E0E11]">
          <button
            type="button"
            onclick={() => handleSend(lang === 'en' ? 'How do I install the SDK in iOS with Swift?' : '¿Cómo instalo el SDK en iOS con Swift?')}
            class="shrink-0 px-3.5 py-1.5 rounded-full text-[11px] font-sans font-medium text-zinc-200 bg-[#1C1C20] border border-[#2D2D34] hover:border-zinc-400 hover:text-white transition cursor-pointer flex items-center gap-1.5 shadow-xs"
          >
            <AppleLogo class="h-3 w-auto text-white" />
            <span>{lang === 'en' ? 'Install in Swift / iOS' : 'Instalar en Swift / iOS'}</span>
          </button>
          <button
            type="button"
            onclick={() => handleSend(lang === 'en' ? 'How do I configure the SDK in Android with Kotlin?' : '¿Cómo configuro el SDK en Android con Kotlin?')}
            class="shrink-0 px-3.5 py-1.5 rounded-full text-[11px] font-sans font-medium text-zinc-200 bg-[#1C1C20] border border-[#2D2D34] hover:border-zinc-400 hover:text-white transition cursor-pointer flex items-center gap-1.5 shadow-xs"
          >
            <AndroidLogo class="h-3 w-auto text-emerald-400" />
            <span>{lang === 'en' ? 'Configure in Android' : 'Configurar en Android'}</span>
          </button>
          <button
            type="button"
            onclick={() => handleSend(lang === 'en' ? 'How does the mobile runtime guarantee it is 100% Stateless?' : '¿Cómo garantiza el runtime móvil que es 100% Stateless?')}
            class="shrink-0 px-3.5 py-1.5 rounded-full text-[11px] font-sans font-medium text-zinc-200 bg-[#1C1C20] border border-[#2D2D34] hover:border-zinc-400 hover:text-white transition cursor-pointer flex items-center gap-1.5 shadow-xs"
          >
            <svg class="h-3 w-3 text-zinc-400" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <span>{lang === 'en' ? 'How does Stateless work?' : '¿Cómo funciona Stateless?'}</span>
          </button>
        </div>

        <!-- Input Bar: Audio Recording Active: + | señal | STOP | flecha hacia arriba -->
        {#if isRecordingVoiceNote || skills.audio}
          <div
            class="px-4.5 py-2.5 {platform === 'android' ? 'pb-2' : ''} border-t border-[#222226]/80 bg-[#0E0E11] flex items-center gap-2 z-20 relative"
            data-testid="audio-recording-bar"
          >
            <!-- WhatsApp "+" Button on Left -->
            <button
              type="button"
              onclick={() => (showAttachMenu = !showAttachMenu)}
              aria-label={lang === 'en' ? 'Add attachment' : 'Adjuntar acción'}
              class="h-8 w-8 rounded-full bg-[#1C1C20] border border-[#2D2D34] text-zinc-300 hover:text-white flex items-center justify-center transition cursor-pointer shrink-0"
              data-testid="whatsapp-plus-btn"
            >
              <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </button>

            <!-- Señal: Dynamic Real-time Soundwave (Clean Zinc-200) -->
            <div
              class="flex-1 h-8 bg-[#1C1C20] border border-[#2D2D34] rounded-full px-3 flex items-center justify-center min-w-0"
              data-testid="audio-recording-input"
            >
              <div class="flex items-center gap-[3px] w-full justify-center" data-testid="audio-signal-wave">
                {#each audioLevels as level, i}
                  <span
                    class="w-[2.5px] bg-zinc-200 rounded-full transition-all duration-75 {isAudioPaused ? 'opacity-40' : ''}"
                    style="height: {isAudioPaused ? '4px' : `${level}px`};"
                  ></span>
                {/each}
              </div>
            </div>

            <!-- STOP: Native Stop Button -->
            <button
              type="button"
              onclick={handleStopRecording}
              aria-label={isAudioPaused ? (lang === 'en' ? 'Resume recording' : 'Reanudar grabación') : (lang === 'en' ? 'Stop recording' : 'Detener grabación')}
              class="h-8 w-8 rounded-full bg-[#281414] border border-red-500/40 text-red-400 flex items-center justify-center hover:opacity-80 transition cursor-pointer shrink-0"
              data-testid="audio-stop-btn"
            >
              <div class="h-3 w-3 bg-[#FF453A] rounded-[2px] {isAudioPaused ? 'opacity-50' : ''}"></div>
            </button>

            <!-- Flecha hacia arriba: Send voice note to chat (Monochrome White Button) -->
            <button
              type="button"
              onclick={handleSendVoiceNote}
              aria-label={lang === 'en' ? 'Send voice note' : 'Enviar nota de voz'}
              class="h-8 w-8 rounded-full bg-white text-zinc-950 flex items-center justify-center font-extrabold hover:bg-zinc-200 transition cursor-pointer shrink-0 shadow-sm"
              data-testid="audio-send-btn"
            >
              <svg class="h-4 w-4 text-zinc-950" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
            </button>
          </div>
        {:else}
          <!-- Input Bar: Reposo / Typing -->
          <form
            onsubmit={(e) => {
              e.preventDefault();
              if (userInput.trim()) handleSend();
            }}
            class="px-4.5 py-2.5 {platform === 'android' ? 'pb-2' : ''} border-t border-[#222226]/80 bg-[#0E0E11] flex items-center gap-2 z-20 relative"
          >
            <!-- WhatsApp "+" Action Button on Left -->
            <button
              type="button"
              onclick={() => (showAttachMenu = !showAttachMenu)}
              aria-label={lang === 'en' ? 'Add attachment' : 'Adjuntar acción'}
              class="h-8 w-8 rounded-full bg-[#1C1C20] border border-[#2D2D34] text-zinc-300 hover:text-white flex items-center justify-center transition cursor-pointer shrink-0"
              data-testid="whatsapp-plus-btn"
            >
              <svg class="h-4 w-4 {showAttachMenu ? 'rotate-45 text-white' : ''} transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </button>

            <!-- Attachment Popup Menu (Camera from +) -->
            {#if showAttachMenu}
              <div class="absolute bottom-12 left-3 bg-[#1E1E22] border border-[#2D2D34] rounded-2xl shadow-2xl p-1.5 z-50 flex flex-col gap-1 w-48 backdrop-blur-md">
                <button
                  type="button"
                  onclick={() => {
                    showAttachMenu = false;
                    skills.vision = true;
                  }}
                  class="flex items-center gap-3 px-3 py-2 text-xs text-white hover:bg-[#282830] rounded-xl transition cursor-pointer text-left"
                  data-testid="whatsapp-camera-btn"
                >
                  <div class="h-7 w-7 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0">
                    <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                      <circle cx="12" cy="13" r="4" />
                    </svg>
                  </div>
                  <span class="font-medium">{lang === 'en' ? 'Camera' : 'Cámara'}</span>
                </button>

                <button
                  type="button"
                  onclick={sendGalleryPhoto}
                  class="flex items-center gap-3 px-3 py-2 text-xs text-white hover:bg-[#282830] rounded-xl transition cursor-pointer text-left"
                  data-testid="whatsapp-gallery-btn"
                >
                  <div class="h-7 w-7 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
                    <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                      <circle cx="8.5" cy="8.5" r="1.5"/>
                      <polyline points="21 15 16 10 5 21"/>
                    </svg>
                  </div>
                  <span class="font-medium">{lang === 'en' ? 'Photos & Videos' : 'Fotos y videos'}</span>
                </button>

                <button
                  type="button"
                  onclick={() => {
                    showAttachMenu = false;
                    handleSend(lang === 'en' ? '📄 [Architecture Document attached]' : '📄 [Documento de arquitectura adjunto]');
                  }}
                  class="flex items-center gap-3 px-3 py-2 text-xs text-white hover:bg-[#282830] rounded-xl transition cursor-pointer text-left"
                >
                  <div class="h-7 w-7 rounded-full bg-zinc-700/40 text-zinc-300 flex items-center justify-center shrink-0">
                    <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                      <polyline points="14 2 14 8 20 8"/>
                    </svg>
                  </div>
                  <span class="font-medium">{lang === 'en' ? 'Document' : 'Documento'}</span>
                </button>
              </div>
            {/if}

            <!-- Normal Text Input Bar (Neutral Dark Gray, No Blue) -->
            <input
              type="text"
              bind:value={userInput}
              placeholder={lang === 'en' ? 'Ask about the mobile SDK, Swift, Kotlin...' : 'Pregunta sobre el SDK móvil, Swift, Kotlin...'}
              disabled={isThinking}
              class="flex-1 bg-[#1C1C20] border border-[#2D2D34] rounded-full px-4 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-400 transition min-w-0"
            />

            {#if userInput.trim()}
              <!-- Send arrow button when user types text (Monochrome White Button) -->
              <button
                type="submit"
                aria-label="Enviar mensaje"
                disabled={isThinking}
                class="h-8 w-8 rounded-full bg-white text-zinc-950 flex items-center justify-center font-extrabold hover:bg-zinc-200 transition cursor-pointer shrink-0 shadow-sm"
                data-testid="send-msg-btn"
              >
                <svg class="h-4 w-4 text-zinc-950" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
              </button>
            {:else}
              <!-- WhatsApp Mic Button: Starts Local Voice Note Recording without activating external headers -->
              <button
                type="button"
                onclick={startVoiceRecording}
                aria-label={lang === 'en' ? 'Record voice message' : 'Grabar mensaje de voz'}
                class="h-8 w-8 rounded-full bg-[#1C1C20] border border-[#2D2D34] text-zinc-300 hover:text-white flex items-center justify-center transition cursor-pointer shrink-0"
                data-testid="whatsapp-mic-btn"
              >
                <svg class="h-4.5 w-4.5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
                  <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
                </svg>
              </button>

              <!-- Gemini Live Interactive Button (Circle with 3 vertical waveform lines of different heights) -->
              <button
                type="button"
                onclick={startLiveVoiceSession}
                aria-label={lang === 'en' ? 'Gemini Live interactive conversation' : 'Conversación interactiva Gemini Live'}
                title={lang === 'en' ? 'Gemini Live' : 'Modo Interactivo Live'}
                class="h-8 w-8 rounded-full bg-[#1C1C20] border border-[#2D2D34] text-zinc-300 hover:text-white flex items-center justify-center transition cursor-pointer shrink-0 group"
                data-testid="gemini-live-btn"
              >
                <div class="flex items-center gap-[2.5px] h-4">
                  <span class="w-[2px] h-2 bg-current rounded-full group-hover:scale-y-125 transition-transform"></span>
                  <span class="w-[2px] h-3.5 bg-current rounded-full group-hover:scale-y-110 transition-transform"></span>
                  <span class="w-[2px] h-2.5 bg-current rounded-full group-hover:scale-y-125 transition-transform"></span>
                </div>
              </button>
            {/if}
          </form>
        {/if}

        {/if}

        <!-- Bottom Home Indicator: Apple Home Indicator vs Android Gesture Bar (Hidden on full screen menu) -->
        {#if !showDrawerMenu}
          <div class="flex justify-center z-20 {platform === 'android' ? 'pb-3.5 pt-2 bg-[#121214]' : 'pb-2.5 pt-1.5 bg-[#000000]'}">
            {#if platform === 'ios'}
              <div class="w-32 h-1 bg-white/40 rounded-full"></div>
            {:else}
              <div class="w-20 h-1 bg-white/40 rounded-full"></div>
            {/if}
          </div>
        {/if}
      </div>
    </div>
  </div>
</div>
