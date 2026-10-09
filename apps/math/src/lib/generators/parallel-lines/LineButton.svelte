<script lang="ts">
  // The button before a line's row: a miniature of how the line is drawn (its
  // line style, arrowheads and parallel arrows) that opens the line's popup.
  import type { LineBase } from './settings.js'

  let {
    line, name, expanded = false, button = $bindable(), onclick,
  }: { line: LineBase; name: string; expanded?: boolean; button?: HTMLButtonElement; onclick: () => void } = $props()

  const DASH = { solid: undefined, dashed: '5 3.5', dotted: '0.01 4' }
  const left = $derived(line.ends === 'both' || line.ends === 'left')
  const right = $derived(line.ends === 'both' || line.ends === 'right')
</script>

<button
  bind:this={button} type="button" class="line-button" aria-haspopup="dialog" aria-expanded={expanded}
  aria-label="Style of line {name}" data-tip={expanded ? undefined : 'Style'} {onclick}
>
  <svg viewBox="0 0 36 16" width="36" height="16" aria-hidden="true">
    <line x1={left ? 6 : 3} y1="8" x2={right ? 30 : 33} y2="8" stroke="currentColor" stroke-width="2" stroke-dasharray={DASH[line.style]} stroke-linecap="round" />
    {#if left}<polygon points="1,8 7,4.5 7,11.5" fill="currentColor" />{/if}
    {#if right}<polygon points="35,8 29,4.5 29,11.5" fill="currentColor" />{/if}
    {#each Array(line.arrows) as _, i}
      {@const x = 18 + (i - (line.arrows - 1) / 2) * 4.5}
      <polyline points="{x - 2},4.5 {x + 1.5},8 {x - 2},11.5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round" />
    {/each}
  </svg>
</button>

<style>
  .line-button {
    display: inline-grid; place-items: center; flex: none; width: 3.1rem; height: 2.6rem; padding: 0;
    border: 1.5px solid var(--border); border-radius: 10px; background: #fff; color: var(--ink);
  }
  .line-button:hover, .line-button[aria-expanded='true'] { border-color: var(--blue-border); background: var(--blue-soft); }
</style>
