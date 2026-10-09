<script lang="ts">
  // Parallel lines cut by a transversal, as a self-contained SVG that prints
  // crisply and exports cleanly to PNG/SVG (fonts and colors are inline, no
  // page CSS). With `onmove`, its labels can be dragged: onmove(part, [along,
  // across]) gets the label's new offset from its usual spot. The frame holds
  // still while a label is dragged, so the figure doesn't rescale under the pointer.
  import FigureLabels from '$lib/shapes/FigureLabels.svelte'
  import { INK, type Offset } from '$lib/shapes/parts.js'
  import { DOT, type LinesLayout, type Vec } from './layout.js'

  let {
    figure, svg = $bindable(), label = 'Parallel lines cut by a transversal', onmove = null,
  }: { figure: LinesLayout; svg?: SVGSVGElement; label?: string; onmove?: ((part: string, offset: Offset) => void) | null } = $props()

  let frozen = $state<LinesLayout['frame'] | null>(null)
  const f = $derived(frozen ?? figure.frame)
  const pts = (list: Vec[]) => list.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ')
</script>

<svg
  bind:this={svg}
  xmlns="http://www.w3.org/2000/svg"
  viewBox="{f.x} {f.y} {f.w} {f.h}"
  width={f.w}
  height={f.h}
  role="img"
  aria-label={label}
>
  <rect x={f.x} y={f.y} width={f.w} height={f.h} fill="#fff" />

  {#each figure.shades as sh}<path d={sh.d} fill={sh.fill} />{/each}

  <g fill="none" stroke={INK} stroke-width="1.6">
    {#each figure.arcs as d}<path {d} />{/each}
    {#each figure.squares as sq}<polyline points={pts(sq)} />{/each}
    {#each figure.arrows as a}<polyline points={pts(a)} stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round" />{/each}
  </g>

  <g stroke={INK} stroke-width="2.2" stroke-linecap="round">
    {#each figure.segments as g}
      <line x1={g.from[0].toFixed(1)} y1={g.from[1].toFixed(1)} x2={g.to[0].toFixed(1)} y2={g.to[1].toFixed(1)} />
    {/each}
  </g>
  {#each figure.heads as h}<polygon points={pts(h)} fill={INK} stroke={INK} stroke-width="1" stroke-linejoin="round" />{/each}
  {#each figure.dots as [x, y]}<circle cx={x.toFixed(1)} cy={y.toFixed(1)} r={DOT} fill={INK} />{/each}

  <FigureLabels labels={figure.labels} ink={INK} {onmove} ondrag={(on) => (frozen = on ? figure.frame : null)} />
</svg>

<style>
  svg { display: block; width: 100%; height: auto; user-select: none; -webkit-user-select: none; }
</style>
