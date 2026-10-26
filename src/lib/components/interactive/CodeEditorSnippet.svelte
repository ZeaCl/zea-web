<script lang="ts">
  import MicIcon from '../atoms/MicIcon.svelte';
  import VisionIcon from '../atoms/VisionIcon.svelte';
  import ShieldIcon from '../atoms/ShieldIcon.svelte';

  export interface ActiveSkills {
    audio: boolean;
    vision: boolean;
    security: boolean;
  }

  let {
    platform = 'ios',
    skills = { audio: false, vision: false, security: false },
    onToggleSkill
  }: {
    platform?: 'ios' | 'android';
    skills: ActiveSkills;
    onToggleSkill: (skill: keyof ActiveSkills) => void;
  } = $props();
</script>

<div class="w-full rounded-2xl bg-[#0c0d12]/90 border border-zinc-800/80 shadow-2xl backdrop-blur-xl overflow-hidden font-mono text-xs sm:text-sm">
  <!-- Top bar: File identity on left, minimalist icons with NO text on right -->
  <div class="flex items-center justify-between px-4 py-3 border-b border-zinc-800/60 bg-zinc-950/40">
    <!-- Window controls + Filename -->
    <div class="flex items-center gap-3">
      <div class="flex items-center gap-1.5">
        <span class="w-2.5 h-2.5 rounded-full bg-zinc-800"></span>
        <span class="w-2.5 h-2.5 rounded-full bg-zinc-800"></span>
        <span class="w-2.5 h-2.5 rounded-full bg-zinc-800"></span>
      </div>
      <span class="text-zinc-500 text-xs tracking-wider font-sans">
        {platform === 'ios' ? 'AgentRuntime.swift' : 'AgentRuntime.kt'}
      </span>
    </div>

    <!-- Minimalist Superpower Activators: Naked icons that light up when clicked, NO text labels -->
    <div class="flex items-center gap-3">
      <!-- Audio Skill Toggle -->
      <button
        type="button"
        onclick={() => onToggleSkill('audio')}
        class="p-1 transition-all duration-200 cursor-pointer {skills.audio ? 'text-emerald-400 scale-115 drop-shadow-[0_0_10px_rgba(52,211,153,0.7)]' : 'text-zinc-600 hover:text-zinc-400'}"
        aria-label="Toggle Live Audio Stream"
        data-testid="skill-toggle-audio"
      >
        <MicIcon class="h-4.5 w-auto" />
      </button>

      <!-- Vision Skill Toggle -->
      <button
        type="button"
        onclick={() => onToggleSkill('vision')}
        class="p-1 transition-all duration-200 cursor-pointer {skills.vision ? 'text-cyan-400 scale-115 drop-shadow-[0_0_10px_rgba(34,211,238,0.7)]' : 'text-zinc-600 hover:text-zinc-400'}"
        aria-label="Toggle Vision Scanner"
        data-testid="skill-toggle-vision"
      >
        <VisionIcon class="h-4.5 w-auto" />
      </button>

      <!-- Security Skill Toggle -->
      <button
        type="button"
        onclick={() => onToggleSkill('security')}
        class="p-1 transition-all duration-200 cursor-pointer {skills.security ? 'text-violet-400 scale-115 drop-shadow-[0_0_10px_rgba(167,139,250,0.7)]' : 'text-zinc-600 hover:text-zinc-400'}"
        aria-label="Toggle Secure Enclave"
        data-testid="skill-toggle-security"
      >
        <ShieldIcon class="h-4.5 w-auto" />
      </button>
    </div>
  </div>

  <!-- Code Body -->
  <div class="p-4 sm:p-5 overflow-x-auto leading-relaxed select-text">
    {#if platform === 'ios'}
      <!-- Swift Code Snippet -->
      <div class="space-y-1">
        <div class="text-zinc-500">
          <span class="text-purple-400">import</span> <span class="text-white">GliaMobileSDK</span>
        </div>
        <div class="h-2"></div>

        <div>
          <span class="text-purple-400">let</span> <span class="text-blue-300">agent</span> = <span class="text-amber-300">GliaAgent</span>(id: <span class="text-emerald-300">"mobile-core"</span>)
        </div>

        <div class="h-1.5"></div>
        <div class="text-zinc-600 text-[11px] select-none">// Superpower skills:</div>

        <!-- Audio Skill Line -->
        <div class="transition-all duration-300">
          {#if skills.audio}
            <div class="text-emerald-400 font-medium drop-shadow-[0_0_8px_rgba(52,211,153,0.35)] flex items-center gap-2">
              <span class="text-zinc-700 select-none">›</span>
              <span>agent.<span class="text-blue-300">use</span>(<span class="text-emerald-300">LiveAudioStream</span>())</span>
            </div>
          {:else}
            <div class="text-zinc-600 opacity-60 flex items-center gap-2">
              <span class="text-zinc-800 select-none">//</span>
              <span>agent.use(LiveAudioStream())</span>
            </div>
          {/if}
        </div>

        <!-- Vision Skill Line -->
        <div class="transition-all duration-300">
          {#if skills.vision}
            <div class="text-cyan-400 font-medium drop-shadow-[0_0_8px_rgba(34,211,238,0.35)] flex items-center gap-2">
              <span class="text-zinc-700 select-none">›</span>
              <span>agent.<span class="text-blue-300">use</span>(<span class="text-cyan-300">VisionScanner</span>())</span>
            </div>
          {:else}
            <div class="text-zinc-600 opacity-60 flex items-center gap-2">
              <span class="text-zinc-800 select-none">//</span>
              <span>agent.use(VisionScanner())</span>
            </div>
          {/if}
        </div>

        <!-- Security Skill Line -->
        <div class="transition-all duration-300">
          {#if skills.security}
            <div class="text-violet-400 font-medium drop-shadow-[0_0_8px_rgba(167,139,250,0.35)] flex items-center gap-2">
              <span class="text-zinc-700 select-none">›</span>
              <span>agent.<span class="text-blue-300">use</span>(<span class="text-violet-300">SecureEnclave</span>())</span>
            </div>
          {:else}
            <div class="text-zinc-600 opacity-60 flex items-center gap-2">
              <span class="text-zinc-800 select-none">//</span>
              <span>agent.use(SecureEnclave())</span>
            </div>
          {/if}
        </div>

        <div class="h-2"></div>
        <div>
          <span class="text-purple-400">for await</span> <span class="text-white">event</span> <span class="text-purple-400">in</span> <span class="text-blue-300">agent</span>.<span class="text-blue-300">stream</span>() &#123;
        </div>
        <div class="pl-4 text-zinc-400">
          <span class="text-blue-300">event</span>.<span class="text-yellow-200">executeNatively</span>()
        </div>
        <div>&#125;</div>
      </div>
    {:else}
      <!-- Kotlin Code Snippet -->
      <div class="space-y-1">
        <div class="text-zinc-500">
          <span class="text-purple-400">import</span> <span class="text-white">cl.zea.glia.GliaAgent</span>
        </div>
        <div class="h-2"></div>

        <div>
          <span class="text-purple-400">val</span> <span class="text-blue-300">agent</span> = <span class="text-amber-300">GliaAgent</span>(id = <span class="text-emerald-300">"mobile-core"</span>)
        </div>

        <div class="h-1.5"></div>
        <div class="text-zinc-600 text-[11px] select-none">// Superpower skills:</div>

        <!-- Audio Skill Line -->
        <div class="transition-all duration-300">
          {#if skills.audio}
            <div class="text-emerald-400 font-medium drop-shadow-[0_0_8px_rgba(52,211,153,0.35)] flex items-center gap-2">
              <span class="text-zinc-700 select-none">›</span>
              <span>agent.<span class="text-blue-300">use</span>(<span class="text-emerald-300">LiveAudioStream</span>())</span>
            </div>
          {:else}
            <div class="text-zinc-600 opacity-60 flex items-center gap-2">
              <span class="text-zinc-800 select-none">//</span>
              <span>agent.use(LiveAudioStream())</span>
            </div>
          {/if}
        </div>

        <!-- Vision Skill Line -->
        <div class="transition-all duration-300">
          {#if skills.vision}
            <div class="text-cyan-400 font-medium drop-shadow-[0_0_8px_rgba(34,211,238,0.35)] flex items-center gap-2">
              <span class="text-zinc-700 select-none">›</span>
              <span>agent.<span class="text-blue-300">use</span>(<span class="text-cyan-300">VisionScanner</span>())</span>
            </div>
          {:else}
            <div class="text-zinc-600 opacity-60 flex items-center gap-2">
              <span class="text-zinc-800 select-none">//</span>
              <span>agent.use(VisionScanner())</span>
            </div>
          {/if}
        </div>

        <!-- Security Skill Line -->
        <div class="transition-all duration-300">
          {#if skills.security}
            <div class="text-violet-400 font-medium drop-shadow-[0_0_8px_rgba(167,139,250,0.35)] flex items-center gap-2">
              <span class="text-zinc-700 select-none">›</span>
              <span>agent.<span class="text-blue-300">use</span>(<span class="text-violet-300">SecureEnclave</span>())</span>
            </div>
          {:else}
            <div class="text-zinc-600 opacity-60 flex items-center gap-2">
              <span class="text-zinc-800 select-none">//</span>
              <span>agent.use(SecureEnclave())</span>
            </div>
          {/if}
        </div>

        <div class="h-2"></div>
        <div>
          <span class="text-blue-300">agent</span>.<span class="text-blue-300">stream</span>().<span class="text-yellow-200">collect</span> &#123; <span class="text-white">event</span> ->
        </div>
        <div class="pl-4 text-zinc-400">
          <span class="text-blue-300">event</span>.<span class="text-yellow-200">executeNatively</span>()
        </div>
        <div>&#125;</div>
      </div>
    {/if}
  </div>
</div>
