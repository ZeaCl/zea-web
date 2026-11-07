<script lang="ts">
  import type { ZeaTheme } from './tokens';
  import { ZEA_THEMES } from './tokens';

  let {
    theme = 'sport',
    placeholder = 'Pregunta a ZEA Agent o pide un cambio...',
    chips = [],
    inputText = $bindable(''),
    onSendPrompt,
    onVoiceClick
  }: {
    theme?: ZeaTheme;
    placeholder?: string;
    chips?: string[];
    inputText?: string;
    onSendPrompt?: (text: string) => void;
    onVoiceClick?: () => void;
  } = $props();

  const cfg = $derived(ZEA_THEMES[theme] || ZEA_THEMES.sport);

  function submit(text: string) {
    if (!text.trim()) return;
    onSendPrompt?.(text.trim());
    inputText = '';
  }
</script>

<div class="shrink-0 bg-black/95 border-t border-[#1C1C24] p-3 space-y-2 z-20">
  <!-- Horizontal Suggestion Chips -->
  {#if chips && chips.length > 0}
    <div class="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
      {#each chips as chip}
        <button
          type="button"
          onclick={() => submit(chip)}
          class="shrink-0 px-3 py-1 rounded-full text-[11px] font-medium bg-[#16161C] border border-[#292934] text-zinc-300 hover:text-white transition cursor-pointer"
          style="hover:border-color: {cfg.accent};"
        >
          {chip}
        </button>
      {/each}
    </div>
  {/if}

  <!-- Conversational Form -->
  <form
    onsubmit={(e) => {
      e.preventDefault();
      submit(inputText);
    }}
    class="flex items-center gap-2"
  >
    <!-- Glia Audio Waveform / Mic Button -->
    <button
      type="button"
      onclick={() => onVoiceClick?.() || submit('Reporte de estado')}
      aria-label="Modo de voz con ZEA Agent"
      title="Hablar con ZEA Agent"
      class="w-8 h-8 rounded-full bg-[#181820] border border-[#2C2C38] flex items-center justify-center text-zinc-300 hover:text-white transition cursor-pointer shrink-0"
      style="hover:border-color: {cfg.accent};"
    >
      <div class="flex items-center gap-[2px] h-3.5">
        <span class="w-[2px] h-2 bg-current rounded-full"></span>
        <span class="w-[2px] h-3.5 bg-current rounded-full"></span>
        <span class="w-[2px] h-2.5 bg-current rounded-full"></span>
      </div>
    </button>

    <!-- Text Input Capsule -->
    <div class="flex-1 relative">
      <input
        type="text"
        bind:value={inputText}
        {placeholder}
        class="w-full bg-[#141418] border border-[#262632] rounded-full px-3.5 py-1.5 text-[12.5px] text-white placeholder-zinc-500 focus:outline-none transition"
        style="focus:border-color: {cfg.accent};"
      />
    </div>

    <!-- Send Button -->
    <button
      type="submit"
      aria-label="Enviar instrucción"
      class="w-8 h-8 rounded-full flex items-center justify-center transition cursor-pointer shrink-0 disabled:opacity-40"
      style="{theme === 'industrial' ? `background-color: ${cfg.btnPrimaryBg}; color: ${cfg.btnPrimaryText};` : 'background-color: #FFFFFF; color: #000000;'}"
      disabled={!inputText.trim()}
    >
      <svg class="w-3.5 h-3.5 fill-none stroke-current stroke-[2.5]" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" d="M5 12h14m-6-6l6 6-6 6" />
      </svg>
    </button>
  </form>
</div>
