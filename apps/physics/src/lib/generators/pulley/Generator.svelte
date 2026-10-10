<script lang="ts">
  // The Pulley Generator: the objects on the left, the figure on the right.
  // Settings live in the page address.
  import { Box, Cog, MoveUpRight, Triangle } from '@lucide/svelte'
  import Choice from '$lib/shared/Choice.svelte'
  import { createGenerator } from '$lib/shared/generator.svelte'
  import FigureOptions from '$lib/shared/FigureOptions.svelte'
  import GeneratorPage from '$shared/GeneratorPage.svelte'
  import LabelField from '$lib/shared/LabelField.svelte'
  import type { Label } from '$lib/shared/label'
  import Section from '$lib/shared/Section.svelte'
  import Pulley from './Pulley.svelte'
  import { pulleySettings } from './settings'

  const gen = createGenerator(pulleySettings, 'pulley')
  const s = $derived(gen.snapshot())

  const shown = (l: Label) => (l.mode === 'text' ? `“${l.text}”` : l.mode === 'blank' ? 'blank' : 'no label')
  const SETUPS = { atwood: 'Atwood machine', table: 'table and hanging mass', ramp: 'ramp and hanging mass', tackle: 'block and tackle' }
  // What each object is called in each setup.
  const NAMES = {
    atwood: ['Left object', 'Right object'],
    table: ['On the table', 'Hanging'],
    ramp: ['On the ramp', 'Hanging'],
    tackle: [],
  }
  const names = $derived<string[]>(NAMES[s.setup])
  const onSurface = $derived(s.setup === 'table' || s.setup === 'ramp')
  /** Is this object on the table or ramp (so a block or a cart)? */
  const resting = (i: number) => onSurface && i < s.objects.length - 1
  const objectsSummary = $derived(
    s.setup === 'tackle'
      ? `${shown(s.loadLabel)} held by ${s.strands} strand${s.strands === 1 ? '' : 's'}`
      : `${s.objects.map((o) => shown(o.label)).join(' and ')}${s.setup === 'atwood' && s.lower !== 'neither' ? ` · ${s.lower === 'a' ? 'left' : 'right'} lower` : ''}`,
  )
  const vectorsSummary = $derived(
    [
      s.tension ? 'tension' : '',
      s.gravity ? 'gravity' : '',
      onSurface && s.normal ? 'normal force' : '',
      onSurface && s.friction !== 'none' ? 'friction' : '',
      s.acceleration !== 'none' ? 'acceleration' : '',
    ]
      .filter(Boolean)
      .join(', ') || 'none',
  )
  const FORWARD = { atwood: 'Right falls', table: 'Hanging falls', ramp: 'Hanging falls', tackle: 'Load rises' }
  const BACKWARD = { atwood: 'Left falls', table: 'Hanging rises', ramp: 'Hanging rises', tackle: 'Load falls' }
  const surfaceSummary = $derived(s.setup === 'ramp' ? `${s.angle}° · ${shown(s.angleLabel)} · ${s.surface}` : s.surface)
</script>

<GeneratorPage name="Pulley Generator" filename="pulley" {gen}>
  {#snippet settings()}
    <Section title="Setup" icon={Cog} summary={SETUPS[s.setup]}>
      <div class="field">
        <Choice
          name="Setup"
          options={[['atwood', 'Atwood'], ['table', 'Table'], ['ramp', 'Ramp'], ['tackle', 'Block & tackle']]}
          bind:value={gen.s.setup}
        />
      </div>
    </Section>

    <Section title={s.setup === 'tackle' ? 'Load' : 'Objects'} icon={Box} summary={objectsSummary}>
      {#if s.setup === 'tackle'}
        <label class="field">
          Strands holding up the load
          <span class="slider">
            <input type="range" min="1" max="4" bind:value={gen.s.strands} />
            <output>{s.strands}</output>
          </span>
        </label>
        <div class="field">Label <LabelField name="Load label" bind:label={gen.s.loadLabel} /></div>
        <label class="field">
          Size
          <span class="slider">
            <input type="range" min="0.5" max="2" step="0.05" bind:value={gen.s.loadSize} />
            <output>{Math.round(s.loadSize * 100)}%</output>
          </span>
        </label>
      {/if}
      {#if s.setup !== 'tackle'}
        {#each gen.s.objects as o, i (o)}
          <p class="subhead">{names[i]}</p>
          {#if resting(i)}
            <div class="field">
              <Choice name="{names[i]} object" options={[['block', 'Block'], ['cart', 'Cart']]} bind:value={o.kind} />
            </div>
          {/if}
          <div class="field">Label <LabelField name="{names[i]} label" bind:label={o.label} /></div>
          <label class="field">
            Size
            <span class="slider">
              <input type="range" min="0.5" max="2" step="0.05" bind:value={o.size} />
              <output>{Math.round((s.objects[i]?.size ?? 1) * 100)}%</output>
            </span>
          </label>
        {/each}
      {/if}
      {#if s.setup === 'atwood'}
        <div class="field">
          Hangs lower
          <Choice name="Hangs lower" options={[['neither', 'Neither'], ['a', 'Left'], ['b', 'Right']]} bind:value={gen.s.lower} />
        </div>
      {/if}
    </Section>

    {#if s.setup === 'table' || s.setup === 'ramp'}
      <Section title={s.setup === 'ramp' ? 'Ramp' : 'Table'} icon={Triangle} summary={surfaceSummary}>
        {#if s.setup === 'ramp'}
          <label class="field">
            Angle
            <span class="slider">
              <input type="range" min="10" max="60" bind:value={gen.s.angle} />
              <output>{s.angle}°</output>
            </span>
          </label>
          <div class="field">Angle label <LabelField name="Angle label" bind:label={gen.s.angleLabel} /></div>
        {/if}
        <div class="field">
          Surface
          <Choice name="Surface" options={[['smooth', 'Smooth'], ['rough', 'Rough']]} bind:value={gen.s.surface} />
        </div>
      </Section>
    {/if}

    <Section title="Forces and motion" icon={MoveUpRight} summary={vectorsSummary}>
      <div class="vector">
        <label class="check"><input type="checkbox" bind:checked={gen.s.tension} /> Tension</label>
        {#if s.tension}<div class="field"><LabelField name="Tension label" bind:label={gen.s.tensionLabel} /></div>{/if}
      </div>
      <div class="vector">
        <label class="check"><input type="checkbox" bind:checked={gen.s.gravity} /> Gravity</label>
        {#if s.gravity}
          {#if s.setup === 'tackle'}
            <div class="field">On the load <LabelField name="Gravity label on the load" bind:label={gen.s.loadGravityLabel} /></div>
          {:else}
            {#each gen.s.objects as o, i (o)}
              {@const whose = names[i].toLowerCase()}
              <div class="field">On the {whose} <LabelField name="Gravity label on the {whose}" bind:label={o.gravityLabel} /></div>
            {/each}
          {/if}
        {/if}
      </div>
      {#if onSurface}
        <div class="vector">
          <label class="check"><input type="checkbox" bind:checked={gen.s.normal} /> Normal force</label>
          {#if s.normal}<div class="field"><LabelField name="Normal force label" bind:label={gen.s.normalLabel} /></div>{/if}
        </div>
        <div class="vector">
          <div class="field">
            Friction
            <Choice
              name="Friction"
              options={[['none', 'None'], ['toward', 'Toward the pulley'], ['away', 'Away from it']]}
              bind:value={gen.s.friction}
            />
          </div>
          {#if s.friction !== 'none'}<div class="field"><LabelField name="Friction label" bind:label={gen.s.frictionLabel} /></div>{/if}
        </div>
      {/if}
      <div class="vector">
        <div class="field">
          Acceleration
          <Choice
            name="Acceleration"
            options={[['none', 'None'], ['forward', FORWARD[s.setup]], ['backward', BACKWARD[s.setup]]]}
            bind:value={gen.s.acceleration}
          />
        </div>
        {#if s.acceleration !== 'none'}<div class="field"><LabelField name="Acceleration label" bind:label={gen.s.accelerationLabel} /></div>{/if}
      </div>
    </Section>
    <FigureOptions bind:mirror={gen.s.mirror} bind:color={gen.s.color} />
  {/snippet}

  {#snippet figure()}
    <Pulley settings={s} id="f" />
  {/snippet}
</GeneratorPage>

<style>
  .vector + .vector { border-top: 1px solid var(--border); padding-top: 0.75rem; margin-top: 0.25rem; }
</style>
