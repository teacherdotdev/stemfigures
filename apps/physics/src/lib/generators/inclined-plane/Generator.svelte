<script lang="ts">
  // The Inclined Plane Generator: the object, the ramp and its marks on the
  // left, the figure on the right. Settings live in the page address.
  import { Box, MoveUpRight, Ruler, Triangle } from '@lucide/svelte'
  import Choice from '$lib/shared/Choice.svelte'
  import { createGenerator } from '$lib/shared/generator.svelte'
  import FigureOptions from '$lib/shared/FigureOptions.svelte'
  import GeneratorPage from '$shared/GeneratorPage.svelte'
  import LabelField from '$lib/shared/LabelField.svelte'
  import type { Label } from '$lib/shared/label'
  import Section from '$lib/shared/Section.svelte'
  import Incline from './Incline.svelte'
  import { inclineSettings } from './settings'

  const gen = createGenerator(inclineSettings, 'inclined-plane')
  const s = $derived(gen.snapshot())

  const shown = (l: Label) => (l.mode === 'text' ? `“${l.text}”` : l.mode === 'blank' ? 'blank' : 'no label')
  const objectSummary = $derived(s.objects.map((o) => `${o.kind} · ${shown(o.label)} · ${Math.round(o.size * 100)}% size`).join('; '))
  const rampSummary = $derived(`${s.angle}° · ${shown(s.angleLabel)} · ${s.surface}`)
  // Every vector: its name, the settings that turn it on (and point it), and its label.
  const VECTORS = [
    { key: 'gravity', name: 'Gravity', label: 'gravityLabel' },
    { key: 'normal', name: 'Normal force', label: 'normalLabel' },
    { key: 'friction', name: 'Friction', label: 'frictionLabel', along: true },
    { key: 'applied', name: 'Applied force', label: 'appliedLabel', along: true },
    { key: 'velocity', name: 'Velocity', label: 'velocityLabel', along: true },
    { key: 'acceleration', name: 'Acceleration', label: 'accelerationLabel', along: true },
  ] as const
  const isOn = (key: (typeof VECTORS)[number]['key']) => {
    const v = s[key]
    return v !== false && v !== 'none'
  }
  const vectorsSummary = $derived(
    VECTORS.filter((v) => isOn(v.key))
      .map((v) => v.name.toLowerCase())
      .join(', ') || 'none',
  )
  const marksSummary = $derived(
    [s.lengthMark ? `length ${shown(s.lengthLabel)}` : '', s.heightMark ? `height ${shown(s.heightLabel)}` : ''].filter(Boolean).join(' · ') ||
      'none',
  )
</script>

<GeneratorPage name="Inclined Plane Generator" filename="inclined-plane" {gen}>
  {#snippet settings()}
    <Section title="Object" icon={Box} summary={objectSummary}>
      {#each gen.s.objects as o, i (o)}
        <div class="field">
          <Choice name="Object" options={[['block', 'Block'], ['ball', 'Ball'], ['cart', 'Cart']]} bind:value={o.kind} />
        </div>
        <div class="field">Label <LabelField name="Object label" bind:label={o.label} /></div>
        <label class="field">
          Size
          <span class="slider">
            <input type="range" min="0.5" max="2" step="0.05" bind:value={o.size} />
            <output>{Math.round((s.objects[i]?.size ?? 1) * 100)}%</output>
          </span>
        </label>
      {/each}
      <label class="field">
        Where on the ramp
        <span class="slider">
          <input type="range" min="0.2" max="0.85" step="0.01" bind:value={gen.s.position} />
          <output>{s.position < 0.4 ? 'low' : s.position > 0.65 ? 'high' : 'middle'}</output>
        </span>
      </label>
    </Section>

    <Section title="Ramp" icon={Triangle} summary={rampSummary}>
      <label class="field">
        Angle
        <span class="slider">
          <input type="range" min="5" max="60" bind:value={gen.s.angle} />
          <output>{s.angle}°</output>
        </span>
      </label>
      <div class="field">Angle label <LabelField name="Angle label" bind:label={gen.s.angleLabel} /></div>
      <div class="field">
        Surface
        <Choice name="Surface" options={[['smooth', 'Smooth'], ['rough', 'Rough']]} bind:value={gen.s.surface} />
      </div>
    </Section>

    <Section title="Forces and motion" icon={MoveUpRight} summary={vectorsSummary}>
      {#each VECTORS as v (v.key)}
        <div class="vector">
          {#if 'along' in v}
            <div class="field">
              {v.name}
              <Choice
                name={v.name}
                options={[['none', 'None'], ['up', 'Up the ramp'], ['down', 'Down the ramp']]}
                bind:value={gen.s[v.key]}
              />
            </div>
          {:else}
            <label class="check"><input type="checkbox" bind:checked={gen.s[v.key]} /> {v.name}</label>
          {/if}
          {#if isOn(v.key)}
            <div class="field"><LabelField name="{v.name} label" bind:label={gen.s[v.label]} /></div>
          {/if}
        </div>
      {/each}
    </Section>

    <Section title="Marks" icon={Ruler} summary={marksSummary}>
      <label class="check"><input type="checkbox" bind:checked={gen.s.lengthMark} /> Length of the ramp</label>
      {#if s.lengthMark}<div class="field"><LabelField name="Length label" bind:label={gen.s.lengthLabel} /></div>{/if}
      <label class="check"><input type="checkbox" bind:checked={gen.s.heightMark} /> Height of the ramp</label>
      {#if s.heightMark}<div class="field"><LabelField name="Height label" bind:label={gen.s.heightLabel} /></div>{/if}
    </Section>
    <FigureOptions bind:mirror={gen.s.mirror} bind:color={gen.s.color} />
  {/snippet}

  {#snippet figure()}
    <Incline settings={s} id="f" />
  {/snippet}
</GeneratorPage>

<style>
  .vector + .vector { border-top: 1px solid var(--border); padding-top: 0.75rem; margin-top: 0.25rem; }
</style>
