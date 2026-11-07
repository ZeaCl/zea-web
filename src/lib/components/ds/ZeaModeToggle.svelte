<script lang="ts">
  import type { ZeaTheme } from './tokens';
  import { ZEA_THEMES } from './tokens';

  let {
    viewMode = $bindable<'chat' | 'app'>('chat'),
    theme = 'sport',
    onToggle
  }: {
    viewMode: 'chat' | 'app';
    theme?: ZeaTheme;
    onToggle?: (mode: 'chat' | 'app') => void;
  } = $props();

  const cfg = $derived(ZEA_THEMES[theme] || ZEA_THEMES.sport);

  function setMode(mode: 'chat' | 'app') {
    viewMode = mode;
    onToggle?.(mode);
  }
</script>

<div class="inline-flex items-center p-0.5 rounded-full bg-[#16161C] border border-[#2B2B36] shadow-inner" data-testid="sport-mode-toggle">
  <!-- Mode 1: App Normal / Standalone Dashboard -->
  <button
    type="button"
    onclick={() => setMode('app')}
    aria-label="Modo App clásica"
    title="Modo App clásica"
    class="px-2 py-1 rounded-full text-xs transition flex items-center gap-1 cursor-pointer {viewMode === 'app' ? 'bg-white/20 text-white shadow-xs font-semibold' : 'text-zinc-500 hover:text-zinc-300'}"
    data-testid="mode-app-btn"
  >
    <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <rect x="3" y="3" width="7" height="7" rx="1.5"></rect>
      <rect x="14" y="3" width="7" height="7" rx="1.5"></rect>
      <rect x="14" y="14" width="7" height="7" rx="1.5"></rect>
      <rect x="3" y="14" width="7" height="7" rx="1.5"></rect>
    </svg>
  </button>

  <!-- Mode 2: AI Chat Agent -->
  <button
    type="button"
    onclick={() => setMode('chat')}
    aria-label="Modo ZEA Chat AI"
    title="Modo ZEA Chat AI"
    class="px-2 py-1 rounded-full text-xs transition flex items-center gap-1 cursor-pointer {viewMode === 'chat' ? 'border shadow-xs font-semibold' : 'text-zinc-500 hover:text-zinc-300'}"
    style="{viewMode === 'chat' ? `background-color: ${cfg.accentMuted}; color: ${cfg.accent}; border-color: ${cfg.accentBorder};` : ''}"
    data-testid="mode-chat-btn"
  >
    <div class="relative flex items-center">
      <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
      </svg>
      <span class="absolute -top-1 -right-1 w-1.5 h-1.5 rounded-full" style="background-color: {cfg.accent}"></span>
    </div>
  </button>
</div>
