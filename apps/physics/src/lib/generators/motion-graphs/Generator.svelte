<script lang="ts">
  // The Motion Graph Generator: the motion segment by segment, the graphs, marks, titles
  // and grid on the left, the figure on the right. Settings live in the page
  // address. The grids and axes are $shared/graph's, the same as Chemistry's
  // titration curve and Biology's population growth.
  import { ArrowDown, ArrowUp, ChartLine, Grid3x3, Heading, MapPin, Plus, Route, SlidersHorizontal, Trash2 } from '@lucide/svelte'
  import Choice from '$lib/shared/Choice.svelte'
  import { createGenerator } from '$lib/shared/generator.svelte'
  import GeneratorPage from '$shared/GeneratorPage.svelte'
  import LabelField from '$lib/shared/LabelField.svelte'
  import type { Label } from '$lib/shared/label'
  import Section from '$lib/shared/Section.svelte'
  import { buildMotion, fittedRanges } from './figure'
  import { motionOf, numberText, segmentLines, tangentAt, velocityAt } from './motion'
  import MotionGraphs from './MotionGraphs.svelte'
  import RangeFields from './RangeFields.svelte'
  import { GRAPHS, KIND_NAMES, KINDS, MAX_SEGMENTS, motionSettings, newSegment, viewsOf, type Graphs, type Kind } from './settings'

  const gen = createGenerator(motionSettings, 'motion-graphs')
  const s = $derived(gen.snapshot())
  const m = $derived(motionOf(s.segments, s.start))
  const lines = $derived(segmentLines(m))
  const views = $derived(viewsOf(s))

  const shown = (l: Label) => (l.mode === 'text' ? `“${l.text}”` : l.mode === 'blank' ? 'blank' : '')
  const SHORT: Record<Kind, string> = { rest: 'rest', forward: 'forward', back: 'back', faster: 'speeding up', slower: 'slowing down' }
  const motionSummary = $derived(s.segments.map((g) => SHORT[g.kind]).join(', ') || 'none')
  const marksSummary = $derived(
    [s.letters ? 'letters' : '', s.styles ? 'segment styles' : '', s.tangent && views.includes('x') ? `tangent at ${numberText(tangentAt(m, s.tangentAt).t)} s` : '']
      .filter(Boolean)
      .join(' · ') || 'none',
  )
  const TITLE_FIELDS = [
    { key: 'title', name: 'Chart title', placeholder: 'Motion of a cart' },
    { key: 'timeTitle', name: 'Time axis', placeholder: 'Time (s)' },
    { key: 'xTitle', name: 'Position axis', placeholder: 'Position (m)', view: 'x' },
    { key: 'vTitle', name: 'Velocity axis', placeholder: 'Velocity (m/s)', view: 'v' },
    { key: 'aTitle', name: 'Acceleration axis', placeholder: 'Acceleration (m/s^2)', view: 'a' },
  ] as const
  const titleFields = $derived(TITLE_FIELDS.filter((f) => !('view' in f) || views.includes(f.view)))
  const titlesSummary = $derived(titleFields.map((f) => shown(s[f.key])).filter(Boolean).join(' · ') || 'none')
  const gridSummary = $derived(
    [s.ranges ? 'ranges set' : 'fitted to the motion', s.numbers ? 'numbered' : 'no numbers', s.gridlines ? 'gridlines' : 'no gridlines'].join(' · '),
  )

  // Setting the ranges starts from the ones fitted to the motion, so the
  // figure doesn't jump; going back to fitted ones forgets them, so the page
  // address is as it was.
  const problems = $derived(s.ranges ? buildMotion(s).problems : {})
  const RANGE_KEYS = Object.keys(fittedRanges(motionSettings.defaults)) as (keyof ReturnType<typeof fittedRanges>)[]
  function setRanges(on: boolean) {
    gen.s.ranges = on
    const next = on ? fittedRanges(s) : motionSettings.defaults
    for (const key of RANGE_KEYS) gen.s[key] = next[key]
  }
  const AXES = [
    { id: 'x', name: 'Position', unit: 'm' },
    { id: 'v', name: 'Velocity', unit: 'm/s' },
    { id: 'a', name: 'Acceleration', unit: 'm/s²' },
  ] as const

  const full = $derived(s.segments.length >= MAX_SEGMENTS)
  const add = (kind: Kind) => {
    if (!full) gen.s.segments.push(newSegment({ kind }))
  }
  const remove = (i: number) => gen.s.segments.splice(i, 1)
  function move(i: number, by: -1 | 1) {
    const [seg] = gen.s.segments.splice(i, 1)
    gen.s.segments.splice(i + by, 0, seg)
  }
  // Which way a segment speeding up goes is only asked when it starts at rest.
  const fromRest = (i: number) => s.segments[i]?.kind === 'faster' && (i === 0 ? true : m.pieces[i - 1]?.v1 === 0)
  const tangentNote = $derived.by(() => {
    const t = tangentAt(m, s.tangentAt)
    const piece = m.pieces.find((p) => t.t >= p.t0 && t.t <= p.t1)
    const straight = piece && piece.a === 0
    return `Its slope is the velocity there, ${numberText(velocityAt(m, t.t))} m/s.${straight ? ' The graph is straight there, so the tangent lies along it.' : ''}`
  })
</script>

<GeneratorPage name="Motion Graph Generator" filename="motion-graphs" {gen} settingsWidth={26} bind:labelSize={gen.s.labelSize}>
  {#snippet settings()}
    <Section title="Motion" icon={Route} summary={motionSummary}>
      {#each gen.s.segments as seg, i (seg)}
        <div class="segment">
          <div class="segment-head">
            <span>Segment {i + 1}</span>
            <span class="moves">
              <button type="button" class="icon-btn" aria-label="Move segment {i + 1} earlier" data-tip="Earlier" disabled={i === 0} onclick={() => move(i, -1)}>
                <ArrowUp size={17} />
              </button>
              <button type="button" class="icon-btn" aria-label="Move segment {i + 1} later" data-tip="Later" disabled={i === s.segments.length - 1} onclick={() => move(i, 1)}>
                <ArrowDown size={17} />
              </button>
              <button type="button" class="icon-btn" aria-label="Remove segment {i + 1}" data-tip="Remove" onclick={() => remove(i)}>
                <Trash2 size={17} />
              </button>
            </span>
          </div>
          <label class="field">
            What it does
            <select bind:value={seg.kind}>
              {#each KINDS as k}<option value={k}>{KIND_NAMES[k]}</option>{/each}
            </select>
          </label>
          {#if seg.kind !== 'rest'}
            <div class="field">
              {seg.kind === 'faster' || seg.kind === 'slower' ? 'How quickly' : 'How fast'}
              <Choice name="Segment {i + 1} size" options={[['slow', 'Slow'], ['medium', 'Medium'], ['fast', 'Fast']]} bind:value={seg.size} />
            </div>
          {/if}
          {#if fromRest(i)}
            <div class="field">
              Which way
              <Choice name="Segment {i + 1} direction" options={[['forward', 'Forward'], ['back', 'Back']]} bind:value={seg.dir} />
            </div>
          {/if}
          <label class="field">
            Lasts
            <span class="slider">
              <input type="range" min="1" max="10" bind:value={seg.duration} />
              <output>{s.segments[i]?.duration} s</output>
            </span>
          </label>
          {#if lines[i]}<p class="note numbers">{lines[i]}</p>{/if}
          {#if m.stillSlowing.includes(i)}<p class="note warning" role="status">It starts at rest, so there’s nothing to slow down: it stays at rest.</p>{/if}
        </div>
      {/each}

      <div class="field add">
        {full ? `A motion has up to ${MAX_SEGMENTS} segments.` : 'Add a segment'}
        <div class="starters">
          {#each KINDS as k}
            <button type="button" class="btn-ghost" disabled={full} onclick={() => add(k)}><Plus size={15} aria-hidden="true" /> {KIND_NAMES[k]}</button>
          {/each}
        </div>
      </div>
      <label class="field">
        Starting position (m)
        <input type="number" min="-50" max="50" step="1" bind:value={gen.s.start} />
      </label>
      <p class="note">Speeding up and slowing down carry on from the velocity before them; slow, medium and fast are steps of 2, 4 and 6 m/s.</p>
    </Section>

    <Section title="Graphs" icon={ChartLine} summary={GRAPHS[s.graphs].name}>
      <label class="field">
        Show
        <select bind:value={gen.s.graphs}>
          {#each Object.entries(GRAPHS) as [id, g]}<option value={id as Graphs}>{g.name}</option>{/each}
        </select>
      </label>
      {#if views.length > 1}<p class="note">Position, velocity and acceleration, stacked on the same time axis.</p>{/if}
    </Section>

    <Section title="Marks" icon={MapPin} summary={marksSummary}>
      <label class="check"><input type="checkbox" bind:checked={gen.s.letters} /> Letter the segment ends A, B, C…</label>
      <label class="check"><input type="checkbox" bind:checked={gen.s.styles} /> Each segment in its own line style</label>
      {#if views.includes('x')}
        <label class="check"><input type="checkbox" bind:checked={gen.s.tangent} /> Tangent to the position–time graph</label>
        {#if s.tangent}
          <label class="field">
            At
            <span class="slider">
              <input type="range" min="0" max={m.end} step="0.5" bind:value={gen.s.tangentAt} />
              <output>{numberText(tangentAt(m, s.tangentAt).t)} s</output>
            </span>
          </label>
          <p class="note">{tangentNote}</p>
        {/if}
      {/if}
    </Section>

    <Section title="Titles" icon={Heading} summary={titlesSummary}>
      {#each titleFields as f (f.key)}
        <div class="field">{f.name} <LabelField name={f.name} placeholder={f.placeholder} bind:label={gen.s[f.key]} /></div>
      {/each}
      <p class="note">Type ^ for a superscript, as in m/s^2, and _ for a subscript.</p>
    </Section>

    <Section title="Axes and grid" icon={Grid3x3} summary={gridSummary}>
      <label class="check"><input type="checkbox" bind:checked={gen.s.numbers} /> Numbers on the axes</label>
      {#if !s.numbers}<p class="note">Just the shapes: straight, curving up or curving down.</p>{/if}
      <label class="check"><input type="checkbox" bind:checked={gen.s.gridlines} /> Gridlines</label>
      <label class="check">
        <input type="checkbox" checked={s.ranges} onchange={(e) => setRanges(e.currentTarget.checked)} /> Set the ranges myself
      </label>
      {#if s.ranges}
        <p class="note">To match graphs on a worksheet. {views.length > 1 ? 'The graphs share the time axis.' : ''}</p>
        <RangeFields name="Time" unit="s" id="t" {problems} bind:from={gen.s.tFrom} bind:to={gen.s.tTo} bind:step={gen.s.tStep} />
        {#each AXES.filter((a) => views.includes(a.id)) as a (a.id)}
          <RangeFields
            name={a.name} unit={a.unit} id={a.id} {problems}
            bind:from={gen.s[`${a.id}From`]} bind:to={gen.s[`${a.id}To`]} bind:step={gen.s[`${a.id}Step`]}
          />
        {/each}
        <button type="button" class="btn-ghost small" onclick={() => setRanges(true)}>Fit to the motion</button>
      {/if}
    </Section>

    <Section title="Figure" icon={SlidersHorizontal} summary={s.color ? 'color' : 'black and white'}>
      <label class="check"><input type="checkbox" bind:checked={gen.s.color} /> Color (for slides)</label>
    </Section>
  {/snippet}

  {#snippet figure()}
    <MotionGraphs settings={s} id="f" />
  {/snippet}
</GeneratorPage>

<style>
  .segment { border-bottom: 1px solid var(--border); padding-bottom: 0.75rem; margin-bottom: 0.75rem; }
  .segment-head { display: flex; align-items: center; justify-content: space-between; font-weight: 800; margin-bottom: 0.25rem; }
  .moves { display: flex; gap: 0.15rem; }
  .numbers { margin: 0; }
  .warning { color: var(--ink); background: #fffbeb; border-left: 3px solid var(--amber); border-radius: 6px; padding: 0.5rem 0.7rem; margin: 0.5rem 0 0; }
  .starters { display: flex; flex-wrap: wrap; gap: 0.4rem; }
  .small { padding: 0.4rem 0.75rem; font-size: 0.86rem; border-radius: 10px; }
  .starters button { display: inline-flex; align-items: center; gap: 0.25rem; padding: 0.35rem 0.65rem; font-size: 0.85rem; border-radius: 9px; }
</style>
