<script lang="ts">
  // The Angles Generator: a card of rays on the left, each a row with its
  // direction from the baseline, and the figure on the right, where every
  // angle, ray and place for a point can be clicked to label or style it, as
  // on the Parallel Lines and Transversal Generator, whose drawing, picking
  // and popups it shares. Settings are mirrored into the page address so a
  // bookmark or shared link brings back exactly this figure, and the server
  // renders that same figure on first load.
  import { Plus, Shapes, X } from '@lucide/svelte'
  import { untrack } from 'svelte'
  import GeneratorPage from '$shared/GeneratorPage.svelte'
  import { generatorState } from '$shared/generatorState.svelte'
  import HelpTip from '$shared/HelpTip.svelte'
  import MathInput from '$lib/shared/MathInput.svelte'
  import Section from '$shared/Section.svelte'
  import LineStylePicker from '$lib/shapes/LineStylePicker.svelte'
  import { ROUND_NAMES } from '$lib/shapes/parts.js'
  import CapPicker from '../parallel-lines/CapPicker.svelte'
  import type { Part } from '../parallel-lines/layout.js'
  import LineButton from '../parallel-lines/LineButton.svelte'
  import LinesFigure from '../parallel-lines/LinesFigure.svelte'
  import PickLayer from '../parallel-lines/PickLayer.svelte'
  import Popover from '../parallel-lines/Popover.svelte'
  import ScrubAngle from '../parallel-lines/ScrubAngle.svelte'
  import { SHADES, type Mark } from '../parallel-lines/settings.js'
  import { buildAngles } from './layout.js'
  import {
    ANGLE_DEFAULTS, BASELINE, MAX_RAYS, cleanSettings, freeDirection, idsIn, newRay, nextId, readRays, settingsFromParams, settingsToQuery,
    type AngleStyle, type RawSettings, type Ray,
  } from './settings.js'

  const gen = generatorState(
    { tidy: (s) => cleanSettings(s as RawSettings), fromParams: settingsFromParams, toQuery: settingsToQuery, keyOf: settingsToQuery },
    'angles',
  )
  const s = gen.s
  const clean = $derived(gen.snapshot())
  const problems = $derived(readRays(clean).problems)

  const drawing = $derived(buildAngles(clean))

  const rayOf = (id: string): Ray | undefined => s.rays.find((r) => r.id === id)
  /** What the teacher calls a ray: the baseline, then Ray 2, Ray 3… in the list's order. */
  const nameOf = (id: string) => {
    const i = s.rays.findIndex((r) => r.id === id)
    return i <= 0 ? 'the baseline' : `ray ${i + 1}`
  }
  const capital = (text: string) => text[0].toUpperCase() + text.slice(1)
  /** A half-ray's name: a ray's own, or "the other side of" a two-sided one. */
  const halfName = (half: string) => (half.endsWith('-') ? `the other side of ${nameOf(half.slice(0, -1))}` : nameOf(half.slice(0, -1)))

  // The popup open, for one part of the figure, and where.
  let popup = $state<{ part: Part; at: { x: number; y: number }; owner: Element | null } | null>(null)
  const close = () => (popup = null)
  function open(part: Part, at: { x: number; y: number }, owner: Element | null = null) {
    if (part.kind === 'angle' && !s.angles[part.key]) s.angles[part.key] = { ...ANGLE_DEFAULTS }
    popup = { part, at, owner }
  }
  function openRay(id: string, button: HTMLElement | undefined) {
    if (popup?.part.kind === 'line' && popup.part.key === id) return close()
    const r = button!.getBoundingClientRect()
    open({ kind: 'line', key: id }, { x: r.left + r.width / 2, y: r.bottom }, button)
  }
  const buttons: Record<string, HTMLButtonElement> = $state({})

  const popupAngle = $derived(popup?.part.kind === 'angle' ? drawing.angles.find((a) => a.key === popup!.part.key) : null)
  const popupRay = $derived(popup?.part.kind === 'line' ? rayOf(popup.part.key) : null)
  // A part that's gone (its ray deleted, or no longer two-sided) closes its popup.
  $effect(() => {
    if (!popup) return
    const { kind, key } = popup.part
    const there =
      kind === 'line' ? !!rayOf(key) : kind === 'angle' ? drawing.angles.some((a) => a.key === key) : drawing.spots.some((p) => p.key === key)
    if (!there) close()
  })

  function addRay() {
    s.rays.push(newRay(nextId(s.rays), freeDirection(clean)))
  }
  /** Removes a ray, and what was set on its angles and points, so a new ray can't inherit them. */
  function removeRay(id: string) {
    if (id === BASELINE) return
    s.rays = s.rays.filter((r) => r.id !== id)
    for (const key of Object.keys(s.angles)) if (idsIn(key).includes(id)) delete s.angles[key]
    for (const key of Object.keys(s.points)) if (idsIn(key).includes(id)) delete s.points[key]
    if (popup?.part.key === id) close()
  }

  function togglePoint(key: string, on: boolean) {
    if (on && !(key in s.points)) s.points[key] = ''
    else if (!on) delete s.points[key]
  }
  /** What a point's popup is about: the vertex, or near which end of which ray. */
  function pointTitle(key: string) {
    if (key === 'v') return 'The vertex'
    const [id, end] = key.split(':')
    return end === 'end' ? `Near the tip of ${nameOf(id)}` : `Near the other end of ${nameOf(id)}`
  }

  const figureSummary = $derived(
    [clean.turn ? `turned ${clean.turn}°` : 'baseline pointing right', `measures to ${ROUND_NAMES[clean.round]}`].join(' · '),
  )

  const MARK_NAMES: Record<Mark, string> = { none: 'None', '1': 'One arc', '2': 'Two arcs', '3': 'Three arcs', right: 'Right-angle square' }
  /** Choosing a label gives an unmarked angle its usual mark, shown in the popup so it can be taken off. */
  function setLabel(a: AngleStyle, label: AngleStyle['label'], right: boolean) {
    a.label = label
    if (label !== 'none' && a.mark === 'none') a.mark = right ? 'right' : '1'
  }

  let svg = $state<SVGSVGElement>()
  // The turn as typed, kept apart from the setting so a half-typed "−" isn't undone; undo and presets still show through.
  let turnText = $state(String(s.turn))
  $effect(() => {
    const v = Number(turnText)
    if (Number.isFinite(v) && turnText.trim() !== '' && untrack(() => v !== s.turn)) s.turn = Math.max(-180, Math.min(180, Math.round(v)))
  })
  $effect(() => {
    const t = s.turn
    untrack(() => Number(turnText) !== t && (turnText = String(t)))
  })
</script>

{#snippet markIcon(m: Mark)}
  <!-- An angle with its mark as the figure draws it: nested arcs, or a square at a right angle. -->
  <svg viewBox="0 0 26 18" width="26" height="18" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round">
    {#if m === 'right'}
      <path d="M5,16 L24,16 M5,16 L5,1" stroke-width="1.3" />
      <path d="M5,9 L12,9 L12,16" />
    {:else}
      <path d="M3,16 L25,16 M3,16 L20,2" stroke-width="1.3" />
      {#each Array(m === 'none' ? 0 : Number(m)) as _, i}
        {@const r = 8 + i * 3.4}
        <path d="M{3 + r},16 A{r},{r} 0 0 0 {3 + r * 0.772},{16 - r * 0.636}" />
      {/each}
      {#if m === 'none'}<line x1="9" y1="5" x2="17" y2="13" stroke-width="1.3" opacity="0.5" />{/if}
    {/if}
  </svg>
{/snippet}

{#snippet sidesIcon(two: boolean)}
  <!-- A ray from a dot, or a line through it. -->
  <svg viewBox="0 0 30 14" width="30" height="14" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round">
    <line x1={two ? 3 : 15} y1="7" x2="27" y2="7" />
    <circle cx="15" cy="7" r="2.6" fill="currentColor" stroke="none" />
  </svg>
{/snippet}

{#snippet rayRow(ray: Ray, i: number)}
  <div class="row" role="group" aria-label={capital(nameOf(ray.id))}>
    <LineButton
      line={{ ...ray, name: '', arrows: 0, startCap: ray.twoSided ? ray.startCap : 'none' }} name={nameOf(ray.id)}
      expanded={popup?.part.kind === 'line' && popup.part.key === ray.id} bind:button={buttons[ray.id]} onclick={() => openRay(ray.id, buttons[ray.id])}
    />
    {#if i === 0}
      <span class="baseline">Baseline <span class="deg">0°</span></span>
    {:else}
      <div class="direction">
        <ScrubAngle id="direction-{ray.id}" label="the direction of {nameOf(ray.id)} from the baseline" min={0} max={359} invalid={!!problems[ray.id]} bind:value={ray.direction} />
      </div>
    {/if}
    <button
      type="button" class="sides" aria-pressed={ray.twoSided} aria-label="Run {nameOf(ray.id)} through the vertex, as a line"
      data-tip={ray.twoSided ? 'Line through the vertex' : 'Ray from the vertex'} onclick={() => (ray.twoSided = !ray.twoSided)}
    >{@render sidesIcon(ray.twoSided)}</button>
    <button type="button" class="remove" aria-label="Remove {nameOf(ray.id)}" data-tip="Remove" disabled={i === 0} onclick={() => removeRay(ray.id)}><X size={16} /></button>
  </div>
  {#if problems[ray.id]}<p class="help problem">{problems[ray.id]}</p>{/if}
{/snippet}

<GeneratorPage name="Angles Generator" filename="angles" {gen} {svg} bind:labelSize={s.labelSize} printWidth={5}>
  {#snippet inputs()}
    <section class="card-body">
      <div class="head-row">
        <h2 class="card-head">Rays</h2>
        <HelpTip id="angles-tip" label="How the figure works">
          Every ray starts at the vertex. The baseline points right, and each other ray's direction is its angle from the
          baseline, counterclockwise, as a protractor reads it: 90° points straight up. Turn a ray into a line through the
          vertex with the button after it. Click any angle on the figure to label, mark or shade it, or click the vertex or
          near a ray's end to put a named point there.
        </HelpTip>
      </div>
      <p class="hint">Each direction is measured from the baseline, counterclockwise. Drag the ∠ to change it.</p>
      {#each s.rays as ray, i (ray.id)}{@render rayRow(ray, i)}{/each}
      <button type="button" class="btn-ghost add" disabled={s.rays.length >= MAX_RAYS} onclick={addRay}><Plus size={16} /> Add ray</button>
      <p class="hint on-figure">On the figure, click an angle or a ray to label or style it, or the vertex or near a ray's end to add a point.</p>
    </section>
  {/snippet}

  {#snippet settings()}
    <Section title="Figure" icon={Shapes} summary={figureSummary}>
      <div class="field">
        <span>Turn the figure</span>
        <div class="turn"><ScrubAngle id="turn" label="the figure's turn" symbol="↻" min={-180} max={180} bind:value={turnText} /></div>
      </div>
      <label class="field">
        Round measures to
        <select bind:value={s.round}>
          <option value={0}>Whole numbers</option>
          <option value={1}>Tenths</option>
          <option value={2}>Hundredths</option>
        </select>
      </label>
    </Section>
  {/snippet}

  {#snippet figure()}
    <div class="stage">
      <LinesFigure figure={drawing} label="Angles" bind:svg />
      <PickLayer figure={drawing} selected={popup?.part ?? null} onpick={(part, at) => open(part, at)} />
    </div>
  {/snippet}
</GeneratorPage>

{#if popup}
  {@const key = popup.part.key}
  <Popover at={popup.at} owner={popup.owner} onclose={close} label="Settings for this part of the figure">
    {#if popup.part.kind === 'angle' && s.angles[key] && popupAngle}
      {@const a = s.angles[key]}
      {@const [from, to] = popupAngle.rays}
      {@const right = popupAngle.right}
      <div class="pop-head">
        <span>Angle from {halfName(from)} to {halfName(to)}</span>
        <span class="measure">{popupAngle.ghost.text}</span>
      </div>
      <div class="group">
        <span class="name" id="pop-label">Label</span>
        <div class="segmented" role="radiogroup" aria-labelledby="pop-label">
          {#each ([['none', 'None'], ['measure', 'Measure'], ['text', 'Text']] as const) as [value, title]}
            <button type="button" role="radio" aria-checked={a.label === value} class:on={a.label === value} onclick={() => setLabel(a, value, right)}>{title}</button>
          {/each}
        </div>
        {#if a.label === 'text'}<MathInput id="pop-text" aria-label="Label text" placeholder="x" bind:value={a.text} />{/if}
      </div>
      <div class="group">
        <span class="name" id="pop-mark">{right ? 'Right-angle mark' : 'Congruence arcs'}</span>
        <div class="segmented" role="radiogroup" aria-labelledby="pop-mark">
          {#each (right ? ['none', 'right'] : ['none', '1', '2', '3']) as Mark[] as m}
            {@const on = a.mark === m || (!right && a.mark === 'right' && m === '1')}
            <button type="button" role="radio" aria-checked={on} class:on aria-label={MARK_NAMES[m]} title={MARK_NAMES[m]} onclick={() => (a.mark = m)}>
              {@render markIcon(m)}
            </button>
          {/each}
        </div>
      </div>
      <div class="group">
        <span class="name" id="pop-shade">Shading</span>
        <div class="swatches" role="radiogroup" aria-labelledby="pop-shade">
          {#each SHADES as shade, i}
            <button
              type="button" role="radio" aria-checked={a.shade === i} aria-label={shade.name} title={shade.name} class="swatch" class:on={a.shade === i}
              style="background: {shade.fill || '#fff'}" onclick={() => (a.shade = i)}
            >{#if !shade.fill}<X size={14} />{/if}</button>
          {/each}
        </div>
      </div>
    {:else if popup.part.kind === 'point'}
      <div class="pop-head"><span>{pointTitle(key)}</span></div>
      {@const shown = key in s.points}
      <div class="group">
        <span class="name" id="pop-point">Point</span>
        <div class="segmented" role="radiogroup" aria-labelledby="pop-point">
          <button type="button" role="radio" aria-checked={!shown} class:on={!shown} aria-label="No point" title="No point" onclick={() => togglePoint(key, false)}><X size={15} /></button>
          <button type="button" role="radio" aria-checked={shown} class:on={shown} onclick={() => togglePoint(key, true)}>Show</button>
        </div>
      </div>
      {#if shown}
        <label class="group"><span class="name">Label</span><input type="text" maxlength="4" placeholder="A" bind:value={s.points[key]} /></label>
      {/if}
    {:else if popup.part.kind === 'line' && popupRay}
      {@const ray = popupRay}
      <div class="pop-head"><span>{capital(nameOf(ray.id))}</span></div>
      <div class="group">
        <span class="name" id="pop-sides">Through the vertex</span>
        <div class="segmented" role="radiogroup" aria-labelledby="pop-sides">
          <button type="button" role="radio" aria-checked={!ray.twoSided} class:on={!ray.twoSided} onclick={() => (ray.twoSided = false)}>Ray</button>
          <button type="button" role="radio" aria-checked={ray.twoSided} class:on={ray.twoSided} onclick={() => (ray.twoSided = true)}>Line</button>
        </div>
      </div>
      <div class="group">
        <span class="name">End points{#if ray.twoSided} <span class="sides-names">Other end · Tip</span>{/if}</span>
        <div class="caps">
          {#if ray.twoSided}<CapPicker side="start" label="Other end" bind:value={ray.startCap} />{/if}
          <CapPicker side="end" label="Tip" bind:value={ray.endCap} />
        </div>
      </div>
      <LineStylePicker id="pop-style" bind:value={ray.style} />
      <button type="button" class="btn-ghost delete" disabled={ray.id === BASELINE} onclick={() => removeRay(ray.id)}>Delete this ray</button>
    {/if}
  </Popover>
{/if}

<style>
  .card-head { font-size: 0.8rem; font-weight: 800; letter-spacing: 0.06em; text-transform: uppercase; color: var(--muted); }
  .card-body { padding: 1rem 1.1rem; display: flex; flex-direction: column; gap: 0.45rem; }
  .head-row { display: flex; align-items: center; justify-content: space-between; gap: 0.5rem; }
  .row { display: flex; align-items: center; gap: 0.35rem; }
  .direction { flex: 1; min-width: 0; }
  .baseline { flex: 1; min-width: 0; padding-left: 0.6rem; font-weight: 600; font-size: 0.9rem; color: var(--muted); }
  .baseline .deg { font-family: 'Times New Roman', Times, serif; font-weight: 400; font-size: 1.05rem; color: var(--ink); margin-left: 0.3rem; }
  .sides {
    display: inline-grid; place-items: center; width: 2.6rem; height: 2.6rem; flex: none; padding: 0;
    border: 1.5px solid var(--border); border-radius: 10px; background: #fff; color: var(--muted);
  }
  .sides:hover { border-color: var(--blue-border); }
  .sides[aria-pressed='true'] { border-color: var(--blue-border); background: var(--blue-soft); color: var(--blue); }
  .remove { display: inline-grid; place-items: center; width: 2rem; height: 2.6rem; flex: none; border: 0; background: none; color: var(--muted); border-radius: 8px; }
  .remove:hover:not(:disabled) { color: var(--red); background: #fef2f2; }
  .remove:disabled { opacity: 0.35; }
  .add { align-self: flex-start; display: inline-flex; align-items: center; gap: 0.35rem; padding: 0.45rem 0.8rem; font-size: 0.85rem; border-radius: 10px; }

  .help { margin: 0; font-size: 0.84rem; color: var(--muted); }
  .help.problem { color: var(--red); font-weight: 600; }
  .hint { font-weight: 400; color: var(--muted); font-size: 0.84rem; margin: 0; }

  .field { display: flex; flex-direction: column; gap: 0.35rem; font-weight: 600; font-size: 0.88rem; margin-bottom: 0.75rem; }
  .turn { max-width: 9rem; }

  .stage { position: relative; }
  .on-figure { margin-top: 0.35rem; }

  .pop-head { display: flex; justify-content: space-between; align-items: baseline; gap: 0.5rem; font-weight: 700; font-size: 0.88rem; }
  .pop-head .measure { font-family: 'Times New Roman', Times, serif; font-weight: 400; font-size: 1.05rem; color: var(--muted); }
  .group { display: flex; flex-direction: column; gap: 0.35rem; }
  .group .name { font-size: 0.75rem; font-weight: 700; color: var(--muted); }
  .segmented button { flex: 1; display: inline-grid; place-items: center; padding: 0.3rem 0.4rem; }
  .caps { display: flex; gap: 0.5rem; }
  .sides-names { font-weight: 400; }
  .swatches { display: flex; gap: 0.4rem; }
  .swatch { width: 2rem; height: 2rem; display: grid; place-items: center; border: 1.5px solid var(--border); border-radius: 8px; color: var(--muted); padding: 0; }
  .swatch.on { border-color: var(--blue); box-shadow: 0 0 0 2px var(--blue-soft); }
  .delete { color: var(--red); font-size: 0.85rem; padding: 0.45rem 0.8rem; border-radius: 10px; align-self: flex-start; }
</style>
