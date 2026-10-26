<script lang="ts">
  import { onDestroy, untrack } from 'svelte';
  import AppleLogo from '../atoms/AppleLogo.svelte';
  import AndroidLogo from '../atoms/AndroidLogo.svelte';
  import VisionIcon from '../atoms/VisionIcon.svelte';
  import MicIcon from '../atoms/MicIcon.svelte';

  export interface ActiveSkills {
    audio: boolean;
    vision: boolean;
    security: boolean;
  }

  let {
    lang = 'es',
    platform = 'ios',
    skills = $bindable({ audio: false, vision: false, security: false })
  }: {
    lang?: 'en' | 'es';
    platform?: 'ios' | 'android';
    skills?: ActiveSkills;
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
  let audioRecordingSeconds = $state(0);
  let recordingInterval: any = null;
  let fallbackAudioInterval: any = null;
  let isAudioPaused = $state(false);
  let showAttachMenu = $state(false);
  let playingAudioMsgId = $state<string | null>(null);

  $effect(() => {
    if (skills.audio) {
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

  let messages = $state<SimulatorMessage[]>(initialMessagesEs);
  let prevLang = $state<string>('');

  $effect(() => {
    if (lang !== prevLang) {
      prevLang = lang;
      untrack(() => {
        messages = lang === 'en' ? initialMessagesEn : initialMessagesEs;
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
        if (skills.audio && recognition) {
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
      if (!analyser && skills.audio && !isAudioPaused) {
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

  function stopAudio() {
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
      if (recognition && skills.audio) {
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
    skills.audio = false;

    const audioMsgId = Date.now().toString();
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
          id: Date.now().toString(),
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
        <div class="pt-3.5 px-7 flex items-center justify-between z-20 text-white select-none">
          {#if platform === 'ios'}
            <span class="font-semibold text-[13.5px] tracking-tight w-12 text-left font-sans">6:04</span>

            <!-- Dynamic Island (Reacts live to voice with real AudioContext analyser) -->
            <div
              class="h-[34px] bg-black rounded-full flex items-center justify-between px-3.5 shadow-inner border border-zinc-900/80 transition-all duration-300 {skills.audio ? 'w-[170px] ring-1 ring-emerald-500/60 shadow-[0_0_15px_rgba(52,211,153,0.3)]' : 'w-[125px]'}"
            >
              <!-- Front Camera Lens -->
              <div class="h-3 w-3 rounded-full bg-[#111116] border border-zinc-800 flex items-center justify-center shrink-0">
                <div class="h-1 w-1 rounded-full bg-blue-950/80"></div>
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
        {:else}
          <!-- App Header: Conectado + Platform Logo + Option Menu Button -->
          <div class="px-5 py-2 flex items-center justify-between z-20">
            <div class="flex items-center gap-2">
              <span class="h-2 w-2 rounded-full bg-[#23e062] shadow-[0_0_8px_rgba(35,224,98,0.9)] animate-pulse"></span>
              {#if platform === 'ios'}
                <AppleLogo class="h-3.5 w-auto text-white" />
              {:else}
                <AndroidLogo class="h-3.5 w-auto text-emerald-400" />
              {/if}
              <span class="text-xs font-semibold text-white font-sans tracking-tight">
                {platform === 'ios' ? 'iOS Client' : 'Android Client'}
              </span>
            </div>

            <button
              type="button"
              aria-label="Opciones"
              class="h-7 w-7 rounded-full bg-[#1c1c20] border border-[#2f2f35] flex items-center justify-center text-zinc-400 hover:text-white transition cursor-pointer"
            >
              <svg class="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M6 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm12 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm-6 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
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
          <div bind:this={messagesContainer} class="flex-1 overflow-y-auto px-4 py-2 space-y-3.5 text-left text-xs">
            {#each messages as msg (msg.id)}
              {#if msg.role === 'user'}
                {#if msg.isAudio}
                  <!-- User Glia SDK Audio Note Bubble -->
                  <div class="flex justify-end">
                    <div class="max-w-[85%] px-3.5 py-2.5 {platform === 'ios' ? 'bg-[#007aff]' : 'bg-[#2563eb]'} text-white rounded-[18px] rounded-br-xs shadow-sm font-sans flex flex-col gap-1.5">
                      <div class="flex items-center gap-2.5">
                        <button
                          type="button"
                          onclick={() => togglePlayAudioMsg(msg.id, msg.audioUrl)}
                          class="h-7 w-7 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white shrink-0 transition cursor-pointer"
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
                              class="w-[2px] rounded-full transition-all duration-75 {playingAudioMsgId === msg.id ? 'bg-white animate-pulse' : 'bg-white/75'}"
                              style="height: {h}px; animation-delay: {i * 40}ms;"
                            ></span>
                          {/each}
                        </div>
                        <div class="flex flex-col items-end shrink-0 text-[10px] font-mono text-white/90 font-medium leading-tight">
                          <span>{msg.audioDuration || '0:04'}</span>
                          <span class="text-[9px] text-white/80">✓✓</span>
                        </div>
                      </div>
                      {#if msg.text && !msg.text.startsWith('🎙️')}
                        <p class="text-[10.5px] text-white/90 font-medium italic border-t border-white/20 pt-1">
                          "{msg.text}"
                        </p>
                      {/if}
                    </div>
                  </div>
                {:else if msg.imageUrl}
                  <!-- User Glia SDK Photo Message Bubble -->
                  <div class="flex justify-end">
                    <div
                      class="max-w-[78%] p-1 {platform === 'ios' ? 'bg-[#007aff]' : 'bg-[#2563eb]'} rounded-[18px] rounded-br-xs shadow-md overflow-hidden relative group"
                      data-testid="whatsapp-photo-message"
                    >
                      <div class="relative rounded-[15px] overflow-hidden bg-black/40">
                        <img
                          src={msg.imageUrl}
                          alt="Foto capturada"
                          class="w-full h-auto max-h-[220px] object-cover block"
                        />
                        <!-- Photo Timestamp & Checkmarks Overlay -->
                        <div class="absolute bottom-1.5 right-1.5 bg-black/60 backdrop-blur-xs px-1.5 py-0.5 rounded-full flex items-center gap-1 text-[9px] font-mono text-white/95">
                          <span>6:04</span>
                          <span class="text-white font-bold">✓✓</span>
                        </div>
                      </div>
                      {#if msg.text}
                        <p class="px-2 pt-1 pb-0.5 text-xs text-white font-medium leading-snug">
                          {msg.text}
                        </p>
                      {/if}
                    </div>
                  </div>
                {:else}
                  <!-- User Question Bubble: Glia SDK Blue (iOS #007aff / Android #2563eb, text-white) -->
                  <div class="flex justify-end">
                    <div
                      class="max-w-[80%] px-4 py-2 {platform === 'ios' ? 'bg-[#007aff]' : 'bg-[#2563eb]'} text-white font-medium text-xs leading-relaxed rounded-[18px] rounded-br-xs shadow-sm font-sans"
                    >
                      {msg.text}
                    </div>
                  </div>
                {/if}
              {:else}
                <!-- Assistant Dark Card with Platform Avatar -->
                <div class="flex items-start gap-2 max-w-[90%]">
                  <div class="h-6 w-6 rounded-full bg-[#1c1c20] border border-[#2f2f35] flex items-center justify-center shrink-0 mt-0.5">
                    {#if platform === 'ios'}
                      <AppleLogo class="h-3 w-auto text-white" />
                    {:else}
                      <AndroidLogo class="h-3 w-auto text-emerald-400" />
                    {/if}
                  </div>

                  <div
                    class="px-4 py-3 bg-[#1c1c20] border border-[#2a2a30] text-zinc-100 text-xs leading-relaxed rounded-[20px] rounded-tl-xs font-sans shadow-sm flex-1"
                  >
                    {#if msg.action}
                      <div class="inline-flex items-center gap-1.5 px-2.5 py-1 mb-2 bg-[#25252c] text-zinc-300 rounded-lg text-[11px] font-medium border border-[#343440]">
                        <svg class="h-3 w-3 text-amber-400 fill-current" viewBox="0 0 24 24">
                          <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                        </svg>
                        <span>Action: {msg.action.name}</span>
                      </div>
                    {/if}

                    <p>{msg.text}</p>
                  </div>
                </div>
              {/if}
            {/each}

            <!-- Subtle Typing Dots when thinking -->
            {#if isThinking}
              <div class="flex items-center gap-1.5 px-4 py-2.5 bg-[#1c1c20] border border-[#2a2a30] rounded-[20px] rounded-bl-xs w-16">
                <span class="h-1.5 w-1.5 rounded-full bg-[#23e062] animate-pulse"></span>
                <span class="h-1.5 w-1.5 rounded-full bg-[#23e062] animate-pulse"></span>
                <span class="h-1.5 w-1.5 rounded-full bg-[#23e062] animate-pulse"></span>
              </div>
            {/if}
          </div>
        </div>

        <!-- Quick Action Prompt Chips (Glia SDK Theme: surface #1c1c20, border #2a2a32, text #60a5fa) -->
        <div class="px-3.5 py-1.5 flex items-center gap-1.5 overflow-x-auto no-scrollbar border-t border-[#18181c] bg-[#0c0c0e]">
          <button
            type="button"
            onclick={() => handleSend(lang === 'en' ? 'How do I install the SDK in iOS with Swift?' : '¿Cómo instalo el SDK en iOS con Swift?')}
            class="shrink-0 px-2.5 py-1.5 rounded-full text-[10px] font-mono text-blue-300 bg-[#1c1c20] border border-[#2a2a32] hover:border-blue-500 hover:text-white transition cursor-pointer flex items-center gap-1.5"
          >
            <AppleLogo class="h-3 w-auto text-white" />
            <span>{lang === 'en' ? 'Install in Swift / iOS' : 'Instalar en Swift / iOS'}</span>
          </button>
          <button
            type="button"
            onclick={() => handleSend(lang === 'en' ? 'How do I configure the SDK in Android with Kotlin?' : '¿Cómo configuro el SDK en Android con Kotlin?')}
            class="shrink-0 px-2.5 py-1.5 rounded-full text-[10px] font-mono text-blue-300 bg-[#1c1c20] border border-[#2a2a32] hover:border-blue-500 hover:text-white transition cursor-pointer flex items-center gap-1.5"
          >
            <AndroidLogo class="h-3 w-auto text-emerald-400" />
            <span>{lang === 'en' ? 'Configure in Android' : 'Configurar en Android'}</span>
          </button>
          <button
            type="button"
            onclick={() => handleSend(lang === 'en' ? 'How does the mobile runtime guarantee it is 100% Stateless?' : '¿Cómo garantiza el runtime móvil que es 100% Stateless?')}
            class="shrink-0 px-2.5 py-1.5 rounded-full text-[10px] font-mono text-blue-300 bg-[#1c1c20] border border-[#2a2a32] hover:border-blue-500 hover:text-white transition cursor-pointer flex items-center gap-1.5"
          >
            <svg class="h-3 w-3 text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <span>{lang === 'en' ? 'How does Stateless work?' : '¿Cómo funciona Stateless?'}</span>
          </button>
        </div>

        <!-- Input Bar: Audio Recording Active: + | señal | STOP | flecha hacia arriba -->
        {#if skills.audio}
          <div
            class="px-3 py-2 border-t border-[#18181c] bg-[#0c0c0e] flex items-center gap-2 z-20 relative"
            data-testid="audio-recording-bar"
          >
            <!-- WhatsApp "+" Button on Left -->
            <button
              type="button"
              onclick={() => (showAttachMenu = !showAttachMenu)}
              aria-label={lang === 'en' ? 'Add attachment' : 'Adjuntar acción'}
              class="h-8 w-8 rounded-full bg-[#18181c] border border-[#2f2f35] flex items-center justify-center text-zinc-400 hover:text-white transition cursor-pointer shrink-0"
              data-testid="whatsapp-plus-btn"
            >
              <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </button>

            <!-- Señal: Dynamic Real-time Soundwave -->
            <div
              class="flex-1 h-8 bg-[#141418] border border-[#262630] rounded-full px-3 flex items-center justify-center min-w-0"
              data-testid="audio-recording-input"
            >
              <div class="flex items-center gap-[3px] w-full justify-center" data-testid="audio-signal-wave">
                {#each audioLevels as level, i}
                  <span
                    class="w-[2.5px] {platform === 'ios' ? 'bg-[#007aff]' : 'bg-[#3b82f6]'} rounded-full transition-all duration-75 {isAudioPaused ? 'opacity-40' : ''}"
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
              class="h-8 w-8 rounded-full bg-[#241414] border border-red-500/40 text-red-400 hover:bg-red-500/20 hover:border-red-400 flex items-center justify-center transition cursor-pointer shrink-0"
              data-testid="audio-stop-btn"
            >
              <div class="h-3 w-3 bg-red-400 rounded-[2px] {isAudioPaused ? 'opacity-50' : ''}"></div>
            </button>

            <!-- Flecha hacia arriba: Send voice note to chat -->
            <button
              type="button"
              onclick={handleSendVoiceNote}
              aria-label={lang === 'en' ? 'Send voice note' : 'Enviar nota de voz'}
              class="h-8 w-8 rounded-full {platform === 'ios' ? 'bg-[#007aff]' : 'bg-[#2563eb]'} text-white flex items-center justify-center font-extrabold shadow-[0_0_12px_rgba(37,99,235,0.5)] hover:opacity-90 transition cursor-pointer shrink-0"
              data-testid="audio-send-btn"
            >
              <svg class="h-4 w-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor">
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
            class="px-3 py-2 border-t border-[#18181c] bg-[#0c0c0e] flex items-center gap-2 z-20 relative"
          >
            <!-- WhatsApp "+" Action Button on Left -->
            <button
              type="button"
              onclick={() => (showAttachMenu = !showAttachMenu)}
              aria-label={lang === 'en' ? 'Add attachment' : 'Adjuntar acción'}
              class="h-8 w-8 rounded-full bg-[#18181c] border border-[#2f2f35] flex items-center justify-center text-zinc-400 hover:text-white hover:border-zinc-500 transition cursor-pointer shrink-0"
              data-testid="whatsapp-plus-btn"
            >
              <svg class="h-4 w-4 {showAttachMenu ? 'rotate-45 text-white' : ''} transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </button>

            <!-- Attachment Popup Menu (Camera from +) -->
            {#if showAttachMenu}
              <div class="absolute bottom-12 left-3 bg-[#1c1c20] border border-[#2f2f35] rounded-2xl shadow-2xl p-1.5 z-50 flex flex-col gap-1 w-48 backdrop-blur-md">
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
                  <div class="h-7 w-7 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                    <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                      <polyline points="14 2 14 8 20 8"/>
                    </svg>
                  </div>
                  <span class="font-medium">{lang === 'en' ? 'Document' : 'Documento'}</span>
                </button>
              </div>
            {/if}

            <!-- Normal Text Input Bar -->
            <input
              type="text"
              bind:value={userInput}
              placeholder={lang === 'en' ? 'Ask about the mobile SDK, Swift, Kotlin...' : 'Pregunta sobre el SDK móvil, Swift, Kotlin...'}
              disabled={isThinking}
              class="flex-1 bg-[#18181c] border border-[#2c2c34] rounded-full px-4 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#3b82f6] transition min-w-0"
            />

            {#if userInput.trim()}
              <!-- Send arrow button when user types text -->
              <button
                type="submit"
                aria-label="Enviar mensaje"
                disabled={isThinking}
                class="h-8 w-8 rounded-full {platform === 'ios' ? 'bg-[#007aff]' : 'bg-[#2563eb]'} flex items-center justify-center text-white font-extrabold shadow-[0_0_12px_rgba(37,99,235,0.5)] hover:opacity-90 transition cursor-pointer shrink-0"
                data-testid="send-msg-btn"
              >
                <svg class="h-4 w-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
              </button>
            {:else}
              <!-- WhatsApp Mic Button -->
              <button
                type="button"
                onclick={() => {
                  skills.audio = true;
                }}
                aria-label={lang === 'en' ? 'Record voice message' : 'Grabar mensaje de voz'}
                class="h-8 w-8 rounded-full bg-[#18181c] border border-[#2f2f35] flex items-center justify-center text-zinc-300 hover:text-white hover:border-zinc-500 transition cursor-pointer shrink-0"
                data-testid="whatsapp-mic-btn"
              >
                <svg class="h-4.5 w-4.5 text-zinc-300" viewBox="0 0 24 24" fill="currentColor">
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
                class="h-8 w-8 rounded-full bg-[#18181c] border border-[#2f2f35] flex items-center justify-center text-zinc-300 hover:text-blue-400 hover:border-blue-500/60 transition cursor-pointer shrink-0 group"
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

        <!-- Native Mobile Bottom Tab Bar -->
        <nav class="border-t border-[#1a1a20] bg-[#0c0c0e] px-4 pt-2 pb-1 flex items-center justify-between z-20 select-none text-[10px] font-sans">
          <!-- Tab: Home -->
          <div class="flex flex-col items-center gap-1 text-zinc-500 hover:text-white cursor-pointer transition">
            <svg class="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
            </svg>
            <span class="font-medium">Home</span>
          </div>

          <!-- Tab: Progreso / Progress -->
          <div class="flex flex-col items-center gap-1 text-zinc-500 hover:text-white cursor-pointer transition">
            <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
            <span class="font-medium">{lang === 'en' ? 'Progress' : 'Progreso'}</span>
          </div>

          <!-- Tab: Central Floating Plus Action Button (+) with Glia blue glow -->
          <div class="relative -top-2 flex flex-col items-center cursor-pointer group">
            <div class="h-11 w-11 rounded-full {platform === 'ios' ? 'bg-[#007aff]' : 'bg-[#2563eb]'} flex items-center justify-center text-white font-extrabold text-2xl shadow-[0_0_20px_rgba(37,99,235,0.7)] group-hover:scale-105 transition-transform">
              <span class="leading-none mb-0.5">+</span>
            </div>
          </div>

          <!-- Tab: Chat IA / AI Chat (Active) -->
          <div class="flex flex-col items-center gap-1 text-white cursor-pointer">
            <svg class="h-5 w-5 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 9h12v2H6V9zm8 5H6v-2h8v2zm4-6H6V6h12v2z" />
            </svg>
            <span class="font-semibold text-white">{lang === 'en' ? 'AI Chat' : 'Chat IA'}</span>
          </div>

          <!-- Tab: Perfil / Profile -->
          <div class="flex flex-col items-center gap-1 text-zinc-500 hover:text-white cursor-pointer transition">
            <svg class="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
            </svg>
            <span class="font-medium">{lang === 'en' ? 'Profile' : 'Perfil'}</span>
          </div>
        </nav>
        {/if}

        <!-- Bottom Home Indicator -->
        <div class="pb-2 pt-1 bg-[#0c0c0e] flex justify-center z-20">
          <div class="w-32 h-1 bg-white/40 rounded-full"></div>
        </div>
      </div>
    </div>
  </div>
</div>
