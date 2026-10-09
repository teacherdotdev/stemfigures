<script lang="ts">
  // What the teacher can point at on the figure, drawn over LinesFigure.svelte
  // in an SVG of its own so nothing here reaches a copy or an export. A mouse
  // hovering an angle or a line lights it ghost blue; clicking or tapping one
  // calls onpick with where to open its popup. Near a crossing the angles
  // win, even right on a line; a line is picked farther out. Pressing a
  // transversal and moving slides it: ondrag hears the move on the page, in
  // the figure's units, from where the press started. `ghost` is an angle
  // shown with its measure (the one a transversal's value sets, while it's
  // being changed), and `selected` the part whose popup is open.
  import type { LinesLayout, Part, Vec } from './layout.js'

  let {
    figure, ghost = null, selected = null, onpick, ondrag,
  }: {
    figure: LinesLayout
    ghost?: string | null
    selected?: Part | null
    onpick: (part: Part, at: { x: number; y: number }) => void
    ondrag: (id: string, phase: 'start' | 'move' | 'end', moved: Vec) => void
  } = $props()

  const BLUE = '#2563eb'
  let svg = $state<SVGSVGElement>()
  let hover = $state<Part | null>(null)
  const f = $derived(figure.frame)
  const lit = (p: Part) => (hover?.kind === p.kind && hover.key === p.key) || (selected?.kind === p.kind && selected.key === p.key)
  const ghostAngle = $derived(ghost ? figure.angles.find((a) => a.key === ghost) : null)
  // Its measure is written over it, unless its own label already says it.
  const ghostText = $derived(ghostAngle && !figure.labels.some((l) => l.part === `angle:${ghost}`) ? ghostAngle.ghost : null)

  /** A point on the figure, on the screen. */
  function onScreen([x, y]: Vec) {
    const m = svg!.getScreenCTM()!
    return { x: m.a * x + m.c * y + m.e, y: m.b * x + m.d * y + m.f }
  }

  let press: { id: number; part: Part; x: number; y: number; dragging: boolean; at: Vec } | null = null
  function down(event: PointerEvent, part: Part, at: Vec) {
    if (event.button !== 0) return
    event.preventDefault()
    ;(event.currentTarget as Element).setPointerCapture(event.pointerId)
    press = { id: event.pointerId, part, x: event.clientX, y: event.clientY, dragging: false, at }
  }
  function move(event: PointerEvent) {
    if (!press || event.pointerId !== press.id) return
    const d: Vec = [event.clientX - press.x, event.clientY - press.y]
    const slides = press.part.kind === 'line' && press.part.key.startsWith('t')
    if (!press.dragging && slides && Math.hypot(...d) > 4) {
      press.dragging = true
      ondrag(press.part.key, 'start', [0, 0])
    }
    if (press.dragging) {
      const k = svg!.getScreenCTM()?.a || 1
      ondrag(press.part.key, 'move', figure.back([d[0] / k, d[1] / k]))
    }
  }
  function up(event: PointerEvent) {
    if (!press || event.pointerId !== press.id) return
    const p = press
    press = null
    if (p.dragging) ondrag(p.part.key, 'end', [0, 0])
    else if (event.type === 'pointerup') onpick(p.part, onScreen(p.at))
  }
  const enter = (event: PointerEvent, part: Part) => event.pointerType === 'mouse' && !press && (hover = part)
  const leave = (part: Part) => hover?.kind === part.kind && hover.key === part.key && (hover = null)
  const key = (event: KeyboardEvent, part: Part, at: Vec) => {
    if (event.key !== 'Enter' && event.key !== ' ') return
    event.preventDefault()
    onpick(part, onScreen(at))
  }
  const mid = (g: { from: Vec; to: Vec }): Vec => [(g.from[0] + g.to[0]) / 2, (g.from[1] + g.to[1]) / 2]
</script>

<svg bind:this={svg} class="layer" viewBox="{f.x} {f.y} {f.w} {f.h}" aria-label="Parts of the figure">
  <!-- Highlights -->
  <g pointer-events="none">
    {#each figure.angles as a (a.key)}
      {#if lit({ kind: 'angle', key: a.key }) && a.key !== ghost}<path d={a.wedge} fill={BLUE} fill-opacity="0.18" />{/if}
    {/each}
    {#if ghostAngle}
      <path d={ghostAngle.wedge} fill={BLUE} fill-opacity="0.22" />
    {/if}
    {#if ghostText}
      <text x={ghostText.at[0]} y={ghostText.at[1]} fill={BLUE} font-family="'Times New Roman', Times, serif" font-size="20" text-anchor="middle" dominant-baseline="central" stroke="#fff" stroke-width="4" paint-order="stroke">{ghostText.text}</text>
    {/if}
    {#each figure.segments as g (g.id)}
      {#if lit({ kind: 'line', key: g.id })}
        <line x1={g.from[0]} y1={g.from[1]} x2={g.to[0]} y2={g.to[1]} stroke={BLUE} stroke-opacity="0.3" stroke-width="9" stroke-linecap="round" />
      {/if}
    {/each}
  </g>

  <!-- What can be pointed at: angles over lines, so near a crossing the angle wins, even right on a line -->
  {#each figure.segments as g (g.id)}
    {@const part = { kind: 'line', key: g.id } as Part}
    <line
      x1={g.from[0]} y1={g.from[1]} x2={g.to[0]} y2={g.to[1]} stroke="transparent" stroke-width="16" stroke-linecap="round"
      class="hit" class:slides={g.kind === 't'} role="button" tabindex="0" aria-label={g.kind === 't' ? 'Transversal' : 'Parallel line'}
      onpointerdown={(e) => down(e, part, mid(g))} onpointermove={move} onpointerup={up} onpointercancel={up}
      onpointerenter={(e) => enter(e, part)} onpointerleave={() => leave(part)} onkeydown={(e) => key(e, part, mid(g))}
    />
  {/each}
  {#each figure.angles as a (a.key)}
    {@const part = { kind: 'angle', key: a.key } as Part}
    <path
      d={a.wedge} fill="transparent" class="hit" role="button" tabindex="0" aria-label="Angle of {Math.round(a.measure)}°"
      onpointerdown={(e) => down(e, part, a.anchor)} onpointermove={move} onpointerup={up} onpointercancel={up}
      onpointerenter={(e) => enter(e, part)} onpointerleave={() => leave(part)} onkeydown={(e) => key(e, part, a.anchor)}
    />
  {/each}
</svg>

<style>
  .layer { position: absolute; inset: 0; width: 100%; height: 100%; overflow: visible; touch-action: none; }
  .hit { cursor: pointer; outline: none; }
  .hit.slides { cursor: grab; }
  .hit:focus-visible { stroke: #2563eb; stroke-opacity: 0.5; }
</style>
