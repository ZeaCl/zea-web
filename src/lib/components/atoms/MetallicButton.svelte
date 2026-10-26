<script lang="ts">
  import type { Snippet } from 'svelte';

  let {
    href,
    variant = 'gradient-border',
    size = 'md',
    type = 'button',
    disabled = false,
    class: className = '',
    onclick,
    children
  }: {
    href?: string;
    variant?: 'gradient-border' | 'primary' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    type?: 'button' | 'submit' | 'reset';
    disabled?: boolean;
    class?: string;
    onclick?: (e: MouseEvent) => void;
    children?: Snippet;
  } = $props();

  const variantClass = $derived(
    variant === 'gradient-border'
      ? 'z-btn--gradient-border'
      : variant === 'primary'
      ? 'z-btn--primary'
      : 'z-btn--ghost'
  );

  const sizeClass = $derived(
    size === 'sm' ? 'z-btn--sm' : size === 'lg' ? 'z-btn--lg' : 'z-btn--md'
  );
</script>

{#if href}
  <a
    {href}
    class="z-btn {variantClass} {sizeClass} {className}"
    {onclick}
  >
    {#if children}
      {@render children()}
    {/if}
  </a>
{:else}
  <button
    {type}
    {disabled}
    class="z-btn {variantClass} {sizeClass} {className} {disabled ? 'opacity-50 cursor-not-allowed' : ''}"
    {onclick}
  >
    {#if children}
      {@render children()}
    {/if}
  </button>
{/if}
