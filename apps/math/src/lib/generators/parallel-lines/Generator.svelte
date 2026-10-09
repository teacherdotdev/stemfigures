<script lang="ts">
  // The Parallel Lines and Transversal Generator: presets, the transversal's
  // angle and the eight angles' labels on the left, collapsed settings below,
  // the figure card on the right. Settings are mirrored into the page address
  // so a bookmark or shared link brings back exactly this figure, and the
  // server renders that same figure on first load. When the angles stop making
  // a figure, the last one that did stays on screen.
  import { Highlighter, RotateCw, Spline, Tag } from '@lucide/svelte'
  import GeneratorPage from '$shared/GeneratorPage.svelte'
  import { generatorState } from '$shared/generatorState.svelte'
  import HelpTip from '$lib/shared/HelpTip.svelte'
  import MathInput from '$lib/shared/MathInput.svelte'
  import Section from '$lib/shared/Section.svelte'
  import PartLabel from '$lib/shapes/PartLabel.svelte'
  import { ROUND_NAMES, roundTo, type Offset } from '$lib/shapes/parts.js'
  import { buildLines, drawnAngles } from './layout.js'
  import LinesFigure from './LinesFigure.svelte'
  import {
    FIRST, MAX_SHIFT, MAX_TILT, SECOND, SHADES,
    cleanSettings, readLines, readMoved, settingsFromParams, settingsToQuery, writeMoved,
    type AngleNo, type Lines, type RawSettings,
  } from './settings.js'

  const gen = generatorState(
    { tidy: (s) => cleanSettings(s as RawSettings), fromParams: settingsFromParams, toQuery: settingsToQuery, keyOf: settingsToQuery },
    'parallel-lines',
  )
  const s = gen.s
  const clean = $derived(gen.snapshot())
  const read = $derived(readLines(clean))

  // The last angles that made a figure, drawn with the current settings.
  let lastGood: Lines = readLines(cleanSettings({})).lines! // the opening figure always reads
  const shown = $derived.by(() => {
    if (read.lines) lastGood = read.lines
    return lastGood
  })
  const drawing = $derived(buildLines(clean, shown))

  const name = (key: 'line1' | 'line2' | 'trans1' | 'trans2', fallback: string) => clean[key].trim() || fallback
  const rounded = (v: number) => roundTo(v, clean.round)
  const measureOf = (k: AngleNo) => (shown.measures[k] === undefined ? null : `${rounded(shown.measures[k]!)}°`)
  const given = (k: AngleNo) => k === 2 || k === 10
  function noteOf(k: AngleNo) {
    if (given(k)) return 'Its measure, as you typed it.'
    const from = k > 8 ? '∠10' : '∠2'
    return clean.parallel ? `Worked out from ${from}, rounded to ${ROUND_NAMES[clean.round]}.` : `Measured on the drawing, from ${from} and the tilt, rounded to ${ROUND_NAMES[clean.round]}.`
  }

  /** Set every drawn angle's label at once. */
  function labelAll(mode: 'number' | 'measure' | 'none') {
    for (const k of drawnAngles(clean)) {
      s[`a${k}Label`] = mode === 'number' ? 'text' : mode
      if (mode === 'number') s[`a${k}Text`] = String(k)
    }
  }

  function moveLabel(part: string, offset: Offset) {
    const moved = readMoved(s.moved)
    moved[part] = offset
    s.moved = writeMoved(moved)
  }

  const secondSummary = $derived(clean.second ? `${name('trans2', 's')} at ${clean.angle2.trim() || '?'}°` : 'None')
  const namesSummary = $derived(
    [
      clean.names ? [name('line1', ''), name('line2', ''), name('trans1', ''), clean.second ? name('trans2', '') : ''].filter(Boolean).join(', ') || 'no names' : 'lines not named',
      clean.crossPoints ? 'crossing points' : '',
      clean.rayPoints ? 'points on rays' : '',
      clean.moved ? 'labels moved' : '',
    ].filter(Boolean).join(' · '),
  )
  const markingsSummary = $derived(
    [
      clean.parallel && clean.arrows ? `${'›'.repeat(clean.arrows)} parallel arrows` : '',
      clean.ends ? 'arrowheads' : 'no arrowheads',
      clean.arcs ? 'arcs on labeled angles' : '',
      `rounded to ${ROUND_NAMES[clean.round]}`,
    ].filter(Boolean).join(' · '),
  )

  let svg = $state<SVGSVGElement>()
  const filename = 'parallel-lines-transversal'
</script>

{#snippet angleRow(k: AngleNo)}
  <div class="row">
    <span class="mname">∠{k}</span>
    <span class="fixed" class:solved={!given(k)}>{measureOf(k) ?? '?'}</span>
    <PartLabel
      name="∠{k}" id="a{k}" given={given(k)} measure={measureOf(k)} note={noteOf(k)} markKind="arcs"
      bind:mode={s[`a${k}Label`]} bind:text={s[`a${k}Text`]} bind:marks={s[`a${k}Arcs`]}
    />
    <select class="shade" aria-label="Shading for ∠{k}" title="Shading" bind:value={s[`a${k}Shade`]}>
      {#each SHADES as shade, i}<option value={i}>{shade.name}</option>{/each}
    </select>
  </div>
{/snippet}

{#snippet angleRows(list: readonly AngleNo[], t: string)}
  <h3 class="sub">Where {t} crosses {name('line1', 'm')}</h3>
  {#each list.slice(0, 4) as k}{@render angleRow(k)}{/each}
  <h3 class="sub">Where {t} crosses {name('line2', 'n')}</h3>
  {#each list.slice(4) as k}{@render angleRow(k)}{/each}
{/snippet}

<GeneratorPage name="Parallel Lines and Transversal Generator" {filename} gen={gen} {svg} bind:labelSize={s.labelSize} printWidth={6}>
  {#snippet inputs()}
    <section class="measures">
      <div class="head-row">
        <h2 class="card-head">Lines</h2>
        <HelpTip id="lines-tip" label="How to set the lines">
          Give ∠2, the angle at the top right where the transversal crosses the first line. Every other angle is worked
          out from it. The angles are numbered 1 to 4 around the top crossing and 5 to 8 around the bottom one, left to
          right and top to bottom. The button after each angle sets its label: its number, its measure, or text you type,
          like x or 3x + 5.
        </HelpTip>
      </div>

      <div class="field">
        <label for="m-angle">∠2 <span class="hint">between {name('line1', 'm')} and {name('trans1', 't')}</span></label>
        <div class="row">
          <MathInput id="m-angle" aria-label="The measure of angle 2" aria-invalid={read.field === 'angle'} bind:value={s.angle} />
          <span class="suffix" aria-hidden="true">°</span>
        </div>
        {#if read.field === 'angle'}<p class="help problem">{read.problem}</p>{/if}
      </div>

      <div class="field">
        <span id="parallel">The lines are</span>
        <div class="segmented" role="radiogroup" aria-labelledby="parallel">
          {#each ([[true, 'Parallel'], [false, 'Not parallel']] as const) as [value, title]}
            <button type="button" role="radio" aria-checked={clean.parallel === value} class:on={clean.parallel === value} onclick={() => (s.parallel = value)}>{title}</button>
          {/each}
        </div>
        {#if !clean.parallel}
          <label for="tilt" class="hint">{name('line2', 'n')} tilts {clean.tilt}° from {name('line1', 'm')}</label>
          <input id="tilt" type="range" min={-MAX_TILT} max={MAX_TILT} step="1" bind:value={s.tilt} />
        {/if}
      </div>

      <div class="head-row">
        <h3 class="sub">Angles</h3>
        <div class="bulk" role="group" aria-label="Label every angle">
          <button type="button" class="btn-ghost tiny" onclick={() => labelAll('number')}>Numbers</button>
          <button type="button" class="btn-ghost tiny" onclick={() => labelAll('measure')}>Measures</button>
          <button type="button" class="btn-ghost tiny" onclick={() => labelAll('none')}>Blank</button>
        </div>
      </div>
      {@render angleRows(FIRST, name('trans1', 't'))}
    </section>
  {/snippet}

  {#snippet settings()}
    <Section title="Second transversal" icon={Spline} summary={secondSummary}>
      <label class="check">
        <input type="checkbox" bind:checked={s.second} />
        <span>A second transversal <span class="hint">its angles are numbered 9 to 16</span></span>
      </label>
      {#if clean.second}
        <div class="field">
          <label for="m-angle2">∠10 <span class="hint">between {name('line1', 'm')} and {name('trans2', 's')}</span></label>
          <div class="row">
            <MathInput id="m-angle2" aria-label="The measure of angle 10" aria-invalid={read.field === 'angle2'} bind:value={s.angle2} />
            <span class="suffix" aria-hidden="true">°</span>
          </div>
          {#if read.field === 'angle2'}<p class="help problem">{read.problem}</p>{/if}
        </div>
        <div class="field">
          <label for="shift">Where it crosses {name('line1', 'm')} <span class="hint">{clean.shift > 0 ? 'right of' : 'left of'} {name('trans1', 't')}</span></label>
          <input id="shift" type="range" min={-MAX_SHIFT} max={MAX_SHIFT} step="0.25" bind:value={s.shift} />
          {#if read.field === 'shift'}<p class="help problem">{read.problem}</p>{/if}
        </div>
        {@render angleRows(SECOND, name('trans2', 's'))}
      {/if}
    </Section>

    <Section title="Names and points" icon={Tag} summary={namesSummary}>
      <label class="check">
        <input type="checkbox" bind:checked={s.names} />
        <span>Name the lines <span class="hint">at their ends</span></span>
      </label>
      {#if clean.names}
        <div class="two">
          <label class="field">First line <input type="text" maxlength="4" placeholder="m" bind:value={s.line1} /></label>
          <label class="field">Second line <input type="text" maxlength="4" placeholder="n" bind:value={s.line2} /></label>
          <label class="field">Transversal <input type="text" maxlength="4" placeholder="t" bind:value={s.trans1} /></label>
          {#if clean.second}<label class="field">Second transversal <input type="text" maxlength="4" placeholder="s" bind:value={s.trans2} /></label>{/if}
        </div>
      {/if}
      <label class="check">
        <input type="checkbox" bind:checked={s.crossPoints} />
        <span>Points where the lines cross</span>
      </label>
      <label class="check">
        <input type="checkbox" bind:checked={s.rayPoints} />
        <span>A point on every ray <span class="hint">for naming angles like ∠ABC</span></span>
      </label>
      {#if clean.crossPoints || clean.rayPoints}
        <label class="field">
          <span>Point names <span class="hint">in order: the crossings, then the rays</span></span>
          <input type="text" maxlength="80" placeholder="A B C D" bind:value={s.pointNames} />
        </label>
      {/if}
      <div class="reset-row">
        <p class="hint">Drag any label on the figure to move it.</p>
        <button class="btn-ghost small" disabled={!clean.moved} onclick={() => (s.moved = '')}>Reset label positions</button>
      </div>
    </Section>

    <Section title="Markings" icon={Highlighter} summary={markingsSummary}>
      <div class="field">
        <span id="arrows">Parallel arrows <span class="hint">{clean.parallel ? 'on both lines' : 'only while the lines are parallel'}</span></span>
        <div class="segmented" role="radiogroup" aria-labelledby="arrows">
          {#each [0, 1, 2, 3] as n}
            <button type="button" role="radio" aria-checked={clean.arrows === n} class:on={clean.arrows === n} disabled={!clean.parallel} onclick={() => (s.arrows = n)}>{n ? '›'.repeat(n) : 'None'}</button>
          {/each}
        </div>
      </div>
      <label class="check">
        <input type="checkbox" bind:checked={s.ends} />
        <span>Arrowheads <span class="hint">at the ends of every line</span></span>
      </label>
      <label class="check">
        <input type="checkbox" bind:checked={s.arcs} />
        <span>Arcs at labeled angles <span class="hint">congruence arcs always show</span></span>
      </label>
      <label class="check">
        <input type="checkbox" bind:checked={s.square} />
        <span>Right-angle squares <span class="hint">where a transversal is perpendicular</span></span>
      </label>
      <label class="field">
        Round measures to
        <select bind:value={s.round}>
          <option value={0}>Whole numbers</option>
          <option value={1}>Tenths</option>
          <option value={2}>Hundredths</option>
        </select>
      </label>
    </Section>

    <Section title="Position" icon={RotateCw} summary={clean.rotate ? `turned ${clean.rotate}°` : 'lines across the page'}>
      <div class="field">
        <label for="rotate">Turn <span class="hint">{clean.rotate}°</span></label>
        <div class="turn">
          <input id="rotate" type="range" min="-180" max="180" step="1" bind:value={s.rotate} />
          <button class="btn-ghost small" disabled={!clean.rotate} onclick={() => (s.rotate = 0)}>Straighten</button>
        </div>
      </div>
    </Section>
  {/snippet}

  {#snippet figure()}
    <LinesFigure figure={drawing} bind:svg onmove={moveLabel} />
  {/snippet}
</GeneratorPage>

<style>
  .card-head { font-size: 0.8rem; font-weight: 800; letter-spacing: 0.06em; text-transform: uppercase; color: var(--muted); }

  .measures { padding: 1rem 1.1rem; display: flex; flex-direction: column; gap: 0.45rem; }
  .head-row { display: flex; align-items: center; justify-content: space-between; gap: 0.5rem; }
  .sub { font-size: 0.8rem; font-weight: 700; color: var(--muted); margin-top: 0.3rem; }
  .row { display: flex; align-items: center; gap: 0.3rem; margin-bottom: 0.3rem; }
  .row > :global(.caret-field) { flex: 1; min-width: 0; }
  .mname { width: 2.2rem; flex: none; font-family: 'Times New Roman', Times, serif; font-size: 1.05rem; }
  .suffix { width: 1rem; flex: none; font-family: 'Times New Roman', Times, serif; color: var(--muted); }
  .fixed {
    flex: 1; min-width: 0; min-height: 2.6rem; box-sizing: border-box; display: flex; align-items: center; padding: 0 0.6rem;
    border: 1.5px dashed var(--border); border-radius: 10px; font-family: 'Times New Roman', Times, serif; font-size: 1.05rem;
    color: var(--ink); overflow: hidden; white-space: nowrap; text-overflow: ellipsis;
  }
  .solved { color: var(--muted); }
  .shade { width: 4.6rem; flex: none; align-self: stretch; font-size: 0.8rem; padding: 0 0.3rem; }
  .bulk { display: flex; gap: 0.25rem; }
  .tiny { padding: 0.25rem 0.5rem; font-size: 0.75rem; border-radius: 8px; }

  .help { margin: 0.2rem 0 0; font-size: 0.84rem; color: var(--muted); }
  .help.problem { color: var(--red); font-weight: 600; }
  .hint { font-weight: 400; color: var(--muted); font-size: 0.84rem; margin: 0; }

  .check { display: flex; align-items: flex-start; gap: 0.5rem; font-weight: 600; font-size: 0.88rem; margin-bottom: 0.75rem; cursor: pointer; }
  .check input { width: 1.05rem; height: 1.05rem; margin: 0.08rem 0 0; accent-color: var(--blue); flex: none; }
  .check .hint { display: block; }

  .field { display: flex; flex-direction: column; gap: 0.35rem; font-weight: 600; font-size: 0.88rem; margin-bottom: 0.75rem; }
  .measures .field { margin-bottom: 0.3rem; }
  .field input[type='range'] { accent-color: var(--blue); }
  .segmented button { flex: 1; display: inline-grid; place-items: center; padding: 0.3rem 0.4rem; }
  .two { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 0 0.6rem; }

  .reset-row { display: flex; align-items: center; justify-content: space-between; gap: 0.75rem; }
  .small { padding: 0.45rem 0.8rem; font-size: 0.85rem; border-radius: 10px; white-space: nowrap; }
  .turn { display: flex; align-items: center; gap: 0.6rem; }
  .turn input { flex: 1; accent-color: var(--blue); }
</style>
