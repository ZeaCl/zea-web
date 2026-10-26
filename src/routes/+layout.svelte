<script lang="ts">
  import '../app.css';

  let { children } = $props();
</script>

<div class="min-h-screen bg-[#1c1c22] text-[#f4f4f6]">
  {@render children()}
</div>
