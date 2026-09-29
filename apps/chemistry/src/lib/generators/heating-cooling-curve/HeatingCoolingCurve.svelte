<script lang="ts">
  // Heating and Cooling Curve: pick heating or cooling and the temperatures
  // it runs between, then give either the substance's properties (so every
  // segment is to scale) or how long each segment is, and get the curve on a
  // graph with its corners lettered and its segments labeled. The grid and
  // axes are $shared/graph's, the same as Math's coordinate grid.
  import { Maximize, Spline, Tag } from '@lucide/svelte'
  import GeneratorPage from '$shared/GeneratorPage.svelte'
  import { generatorState } from '$shared/generatorState.svelte'
  import AxisSettings from '$shared/graph/AxisSettings.svelte'
  import GridlineSettings from '$shared/graph/GridlineSettings.svelte'
  import TitleSettings from '$shared/graph/TitleSettings.svelte'
  import { readAxes } from '$shared/graph/axes'
  import { COLORS, type Color } from '$shared/graph/colors'
  import Section from '$shared/Section.svelte'
  import HelpTip from '$lib/shared/HelpTip.svelte'
  import { SUBSTANCES, isPlateau, segmentsOf, type Direction, type SegmentKey } from './curve'
  import { buildCurve, niceRange, placedSegments, segmentName } from './figure'
  import {
    PAGE_X_TITLES, SEGMENT_LABELS, SEGMENT_LABEL_NAMES, WIDTH_KEYS, curveSettings, temperaturesOf, xTitleFor,
    type CurveSettings, type XQuantity,
  } from './settings'
  import CurveFigure from './CurveFigure.svelte'

  const gen = generatorState(curveSettings, 'heating-cooling-curve')
  const s = gen.s
  const clean = $derived(gen.snapshot())
  const axes = $derived(readAxes(clean))
  const g = $derived(buildCurve(clean))
  const segs = $derived(clean.bp > clean.mp ? segmentsOf(clean.direction, temperaturesOf(clean)) : [])
  const has = (key: SegmentKey) => segs.some((seg) => seg.key === key)
  const freezes = $derived(clean.direction === 'cooling' && segs.some((seg, i) => seg.key === 'melt' && segs[i - 1]?.key === 'liquid'))
  let svg = $state<SVGSVGElement>()

  const sig = (v: number) => Number(v.toPrecision(3))
  const two = (v: number) => String(Math.round(v * 100) / 100)

  /** The x-axis title, if it's still one this page wrote, follows the curve. */
  function nameXAxis(dir: Direction, q: XQuantity) {
    if (PAGE_X_TITLES.includes(s.xTitle)) s.xTitle = xTitleFor(dir, q)
  }

  function chooseDirection(dir: Direction) {
    if (dir === clean.direction) return
    // The same substance run the other way: swap the ends so it still draws.
    Object.assign(s, { direction: dir, startT: clean.endT, endT: clean.startT })
    nameXAxis(dir, clean.xQuantity)
  }

  function chooseQuantity(q: XQuantity) {
    s.xQuantity = q
    nameXAxis(clean.direction, q)
  }

  /** Lengths copied from the properties' curve, so switching to them keeps it. */
  function chooseSource(source: CurveSettings['source']) {
    if (source === clean.source) return
    if (source === 'lengths') for (const seg of placedSegments(clean)) s[WIDTH_KEYS[seg.key]] = sig(seg.width)
    s.source = source
  }

  function chooseSubstance(id: string) {
    const sub = SUBSTANCES.find((x) => x.id === id)
    if (sub) Object.assign(s, { mp: sub.mp, bp: sub.bp, ...sub.properties })
  }

  /** Axes that just fit the curve, counting in tidy steps. */
  function fitAxes() {
    if (!g.span) return
    const [x0, x1, xs] = niceRange(0, g.end, true)
    const [y0, y1, ys] = niceRange(g.span.lo, g.span.hi)
    const blocks = (a: number, b: number, step: number) => Math.round((b - a) / step)
    Object.assign(s, {
      xFrom: String(x0), xTo: String(x1), xStep: String(xs), xEvery: blocks(x0, x1, xs) > 10 ? 2 : 1,
      yFrom: String(y0), yTo: String(y1), yStep: String(ys), yEvery: blocks(y0, y1, ys) > 10 ? 2 : 1,
    })
  }

  const xUnit = $derived(clean.xQuantity === 'time' ? 'min' : 'kJ')
  const totalHeat = $derived(g.rows.reduce((sum, r) => sum + r.heat, 0))
  const labelSummary = $derived(
    [clean.letters ? 'Letters' : '', clean.segmentLabels === 'none' ? '' : SEGMENT_LABEL_NAMES[clean.segmentLabels], clean.guides ? 'dashed lines' : '']
      .filter(Boolean)
      .join(' · ') || 'None',
  )
  const filename = $derived(
    (clean.titleMode === 'text' && clean.title.trim() ? clean.title.trim() : `${clean.direction}-curve`)
      .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'heating-curve',
  )

  type NumberKey = 'startT' | 'endT' | 'mp' | 'bp' | 'mass' | 'rate' | 'cSolid' | 'cLiquid' | 'cGas' | 'fusH' | 'vapH' | 'molarMass' | 'supercoolBy' | (typeof WIDTH_KEYS)[SegmentKey]
</script>

{#snippet numberField(id: string, name: string, unit: string, key: NumberKey, min: number, problem?: string | null)}
  <label class="number-field" for={id}>
    <span>{name}{#if unit}&nbsp;<span class="unit">({unit})</span>{/if}</span>
    <input {id} type="number" step="any" {min} aria-invalid={!!problem} bind:value={s[key]} />
  </label>
{/snippet}

<GeneratorPage name="Heating and Cooling Curve" {filename} {gen} {svg} bind:labelSize={s.labelSize}>
  {#snippet inputs()}
    <section class="curve-card">
      <div class="head-row">
        <h2 class="card-head">Curve</h2>
        <HelpTip id="curve-tip" label="How the curve is worked out">
          From a substance, each sloped segment takes q = m·c·ΔT and each plateau q = n·ΔH, so the curve is to scale:
          water's boiling plateau is almost 7 times as long as its melting plateau. From segment lengths, you set how
          long each one is, for a simpler worksheet curve.
        </HelpTip>
      </div>
      <div class="segmented" role="radiogroup" aria-label="Heating or cooling">
        <button type="button" role="radio" aria-checked={s.direction === 'heating'} class:on={s.direction === 'heating'} onclick={() => chooseDirection('heating')}>Heating</button>
        <button type="button" role="radio" aria-checked={s.direction === 'cooling'} class:on={s.direction === 'cooling'} onclick={() => chooseDirection('cooling')}>Cooling</button>
      </div>
      <div class="fields">
        {@render numberField('start-t', 'Starting temperature', '°C', 'startT', -273.15)}
        {@render numberField('end-t', 'Ending temperature', '°C', 'endT', -273.15, g.problems.endT)}
        {@render numberField('mp', clean.direction === 'heating' ? 'Melting point' : 'Freezing point', '°C', 'mp', -273.15)}
        {@render numberField('bp', 'Boiling point', '°C', 'bp', -273.15, g.problems.bp)}
      </div>
      {#each ['endT', 'bp'] as key}
        {#if g.problems[key]}<p class="help problem">{g.problems[key]}</p>{/if}
      {/each}

      <div class="field">
        <span>Along the x-axis</span>
        <div class="segmented" role="radiogroup" aria-label="Along the x-axis">
          <button type="button" role="radio" aria-checked={s.xQuantity === 'time'} class:on={s.xQuantity === 'time'} onclick={() => chooseQuantity('time')}>Time</button>
          <button type="button" role="radio" aria-checked={s.xQuantity === 'heat'} class:on={s.xQuantity === 'heat'} onclick={() => chooseQuantity('heat')}>{clean.direction === 'heating' ? 'Heat added' : 'Heat removed'}</button>
        </div>
      </div>

      <div class="field">
        <span>Work the curve out from</span>
        <div class="segmented" role="radiogroup" aria-label="Work the curve out from">
          <button type="button" role="radio" aria-checked={s.source === 'properties'} class:on={s.source === 'properties'} onclick={() => chooseSource('properties')}>A substance</button>
          <button type="button" role="radio" aria-checked={s.source === 'lengths'} class:on={s.source === 'lengths'} onclick={() => chooseSource('lengths')}>Segment lengths</button>
        </div>
      </div>

      {#if s.source === 'properties'}
        <label class="field">
          <span>Fill in a substance <span class="hint">values from OpenStax Chemistry 2e</span></span>
          <select value="" onchange={(e) => { chooseSubstance(e.currentTarget.value); e.currentTarget.value = '' }}>
            <option value="" disabled>Choose one…</option>
            {#each SUBSTANCES as sub}<option value={sub.id}>{sub.name}</option>{/each}
          </select>
        </label>
        <div class="fields">
          {@render numberField('mass', 'Mass', 'g', 'mass', 0.001)}
          {#if clean.xQuantity === 'time'}
            {@render numberField('rate', clean.direction === 'heating' ? 'Heat added per minute' : 'Heat removed per minute', 'kJ', 'rate', 0.001)}
          {/if}
          {#if has('solid')}{@render numberField('c-solid', 'Specific heat of the solid', 'J/g·°C', 'cSolid', 0.001)}{/if}
          {#if has('liquid')}{@render numberField('c-liquid', 'Specific heat of the liquid', 'J/g·°C', 'cLiquid', 0.001)}{/if}
          {#if has('gas')}{@render numberField('c-gas', 'Specific heat of the gas', 'J/g·°C', 'cGas', 0.001)}{/if}
          {#if has('melt')}{@render numberField('fus-h', 'ΔH of fusion', 'kJ/mol', 'fusH', 0.001)}{/if}
          {#if has('boil')}{@render numberField('vap-h', 'ΔH of vaporization', 'kJ/mol', 'vapH', 0.001)}{/if}
          {#if has('melt') || has('boil')}{@render numberField('molar-mass', 'Molar mass', 'g/mol', 'molarMass', 0.001)}{/if}
        </div>
        {#if g.rows.length}
          <ul class="readout">
            {#each g.rows as r}
              <li>
                {r.from}–{r.to} {segmentName(clean.direction, r.key)}: {two(r.heat)} kJ{#if clean.xQuantity === 'time'}, {two(r.width)} min{/if}
              </li>
            {/each}
            <li class="total">Total: {two(totalHeat)} kJ{#if clean.xQuantity === 'time'}, {two(g.end)} min{/if}</li>
          </ul>
        {/if}
      {:else}
        <div class="fields">
          {#each segs as seg (seg.key)}
            {@render numberField(`w-${seg.key}`, segmentName(clean.direction, seg.key), xUnit, WIDTH_KEYS[seg.key], 0)}
          {/each}
        </div>
        <p class="help">How long each segment runs along the x-axis.</p>
      {/if}

      {#if freezes}
        <label class="check">
          <input type="checkbox" bind:checked={s.supercool} />
          <span>
            <strong>Supercooled</strong>
            <small>The liquid cools past its freezing point before it starts to freeze, then warms back up to it.</small>
          </span>
        </label>
        {#if s.supercool}
          <div class="fields">{@render numberField('supercool-by', 'Below the freezing point', '°C', 'supercoolBy', 0.1)}</div>
        {/if}
      {/if}

      {#if g.problems.fit}<p class="help problem">{g.problems.fit}</p>{/if}
      <button type="button" class="btn-ghost small fit" onclick={fitAxes} disabled={!g.span}>
        <Maximize size={16} aria-hidden="true" /> Fit the axes to the curve
      </button>
    </section>
  {/snippet}

  {#snippet settings()}
    <Section title="Labels" icon={Tag} summary={labelSummary}>
      <label class="field setting">
        <span>Segment labels</span>
        <select bind:value={s.segmentLabels}>
          {#each SEGMENT_LABELS as m}<option value={m}>{SEGMENT_LABEL_NAMES[m]}</option>{/each}
        </select>
      </label>
      {#if s.segmentLabels === 'states' && segs.some((seg) => isPlateau(seg.key))}
        <label class="field setting">
          <span>Plateaus labeled with</span>
          <select bind:value={s.plateauLabels}>
            <option value="states">Both states (Solid + liquid)</option>
            <option value="change">The change ({clean.direction === 'heating' ? 'Melting' : 'Freezing'})</option>
          </select>
        </label>
      {/if}
      <label class="check">
        <input type="checkbox" bind:checked={s.letters} />
        <span>
          <strong>Letters at the corners</strong>
          <small>A, B, C… for questions like “What is happening between B and C?”</small>
        </span>
      </label>
      <label class="check">
        <input type="checkbox" bind:checked={s.guides} />
        <span>
          <strong>Dashed lines at the plateaus</strong>
          <small>Across to the temperature axis, to read the {clean.direction === 'heating' ? 'melting' : 'freezing'} and boiling points.</small>
        </span>
      </label>
    </Section>

    <Section title="Curve" icon={Spline} summary="{clean.color[0].toUpperCase()}{clean.color.slice(1)}">
      <div class="swatches" role="radiogroup" aria-label="Curve color">
        {#each Object.entries(COLORS) as [name, hex]}
          <button
            type="button" role="radio" aria-checked={s.color === name} aria-label={name} data-tip={name}
            class="swatch" class:on={s.color === name} style:--swatch={hex} onclick={() => (s.color = name as Color)}
          ></button>
        {/each}
      </div>
    </Section>

    <TitleSettings
      bind:title={s.title} bind:titleMode={s.titleMode} bind:xTitle={s.xTitle} bind:xTitleMode={s.xTitleMode}
      bind:yTitle={s.yTitle} bind:yTitleMode={s.yTitleMode}
      placeholders={{ title: 'Heating curve of water', xTitle: xTitleFor(clean.direction, clean.xQuantity), yTitle: 'Temperature (°C)' }}
    />
    <AxisSettings
      axis="x" read={axes.x} problems={axes.problems}
      bind:from={s.xFrom} bind:to={s.xTo} bind:step={s.xStep} bind:every={s.xEvery}
      bind:labelMode={s.xLabelMode} bind:label={s.xLabel} bind:startCap={s.xStartCap} bind:endCap={s.xEndCap}
    />
    <AxisSettings
      axis="y" read={axes.y} problems={axes.problems}
      bind:from={s.yFrom} bind:to={s.yTo} bind:step={s.yStep} bind:every={s.yEvery}
      bind:labelMode={s.yLabelMode} bind:label={s.yLabel} bind:startCap={s.yStartCap} bind:endCap={s.yEndCap}
    />
    <GridlineSettings bind:minor={s.minor} />
  {/snippet}

  {#snippet figure()}
    <CurveFigure settings={clean} bind:svg />
  {/snippet}
</GeneratorPage>

<style>
  .card-head { font-size: 0.8rem; font-weight: 800; letter-spacing: 0.06em; text-transform: uppercase; color: var(--muted); }
  .curve-card { padding: 1rem 1.1rem; display: flex; flex-direction: column; gap: 0.75rem; }
  .head-row { display: flex; align-items: center; justify-content: space-between; }
  .field { display: flex; flex-direction: column; gap: 0.35rem; font-weight: 600; font-size: 0.88rem; }
  .field .hint { font-weight: 400; color: var(--muted); }
  .fields { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 0.6rem; }
  .number-field { display: flex; flex-direction: column; justify-content: flex-end; gap: 0.3rem; font-weight: 600; font-size: 0.88rem; min-width: 0; }
  .number-field input { width: 100%; min-width: 0; }
  .unit { font-weight: 400; color: var(--muted); }
  .help { margin: 0; font-size: 0.84rem; color: var(--muted); }
  .help.problem { color: var(--red); font-weight: 600; }
  .readout { margin: 0; padding: 0.55rem 0.75rem; list-style: none; border-radius: 10px; background: var(--blue-soft); font-size: 0.85rem; font-weight: 600; }
  .readout li + li { margin-top: 0.2rem; }
  .readout .total { padding-top: 0.25rem; border-top: 1px solid var(--blue-border); }
  .fit { align-self: flex-start; display: inline-flex; align-items: center; gap: 0.4rem; }
  .setting { margin-bottom: 0.75rem; }
  .check { display: flex; align-items: flex-start; gap: 0.6rem; margin-top: 0.75rem; cursor: pointer; }
  .check input { width: 1.1rem; height: 1.1rem; margin: 0.15rem 0 0; accent-color: var(--blue); }
  .check span { display: flex; flex-direction: column; }
  .check strong { font-size: 0.9rem; }
  .check small { color: var(--muted); font-size: 0.82rem; }
  .curve-card .check { margin-top: 0; }
  .swatches { display: flex; gap: 0.5rem; }
  .swatch {
    width: 2rem; height: 2rem; border-radius: 999px; border: 3px solid #fff; background: var(--swatch);
    box-shadow: 0 0 0 1.5px var(--border); cursor: pointer;
  }
  .swatch.on { box-shadow: 0 0 0 2.5px var(--ink); }
</style>
