<script lang="ts">
  // A small panel opened at a spot on the screen: a point on the figure, or
  // under a button. Fixed-position like PartLabel's popup, so the scrolling
  // settings column can't clip it. It closes on Escape, a press outside it
  // (except on `owner`, the button that toggles it), or the page scrolling.
  import { tick, type Snippet } from 'svelte'

  let {
    at, label, owner = null, onclose, children,
  }: { at: { x: number; y: number }; label: string; owner?: Element | null; onclose: () => void; children: Snippet } = $props()

  let panel = $state<HTMLElement>()
  let pos = $state({ left: 0, top: 0 })
  const GAP = 10
  const EDGE = 8

  async function place() {
    await tick()
    if (!panel) return
    const [w, h] = [panel.offsetWidth, panel.offsetHeight]
    const below = at.y + GAP + h <= window.innerHeight - EDGE
    pos = {
      top: Math.max(EDGE, below ? at.y + GAP : at.y - GAP - h),
      left: Math.max(EDGE, Math.min(at.x - w / 2, window.innerWidth - EDGE - w)),
    }
  }
  $effect(() => {
    void at.x, at.y
    place()
  })
  $effect(() => {
    panel?.querySelector<HTMLElement>('input, button, [tabindex]')?.focus({ preventScroll: true })
  })

  function onpointerdown(event: PointerEvent) {
    const t = event.target as Node
    if (!panel?.contains(t) && !owner?.contains(t)) onclose()
  }
  function onkeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      event.preventDefault()
      onclose()
    }
  }
</script>

<svelte:window onpointerdowncapture={onpointerdown} onresize={onclose} onscrollcapture={(e) => !panel?.contains(e.target as Node) && onclose()} />

<div bind:this={panel} class="panel" role="dialog" tabindex="-1" aria-label={label} style="left: {pos.left}px; top: {pos.top}px" {onkeydown}>
  {@render children()}
</div>

<style>
  .panel {
    position: fixed; z-index: 60; display: flex; flex-direction: column; gap: 0.7rem; width: 17rem;
    padding: 0.8rem; border: 1px solid var(--border); border-radius: 12px; background: #fff;
    box-shadow: 0 12px 32px -8px rgb(17 24 39 / 25%);
  }
</style>
