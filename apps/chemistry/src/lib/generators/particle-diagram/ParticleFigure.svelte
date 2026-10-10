<script lang="ts">
  // The Particle Diagram figure: the box with its particles scattered or its
  // lattice, its key to the right, or both, as Show says. `box` is what the
  // box holds for these settings, worked out by whoever shows the figure,
  // since the page also reports what didn't fit.
  import FigureFrame from '$lib/shared/FigureFrame.svelte'
  import Discs from './Discs.svelte'
  import KeyDrawing from './KeyDrawing.svelte'
  import { figureLayout, keyLabel, keyLayout } from './key'
  import { describeKind, describeParticle } from './particles'
  import { DOUBLE_INSET, keyKinds, type BoxContents, type ParticleSettings } from './settings'

  let { settings, box, svg = $bindable() }: { settings: ParticleSettings; box: BoxContents; svg?: SVGSVGElement } = $props()

  const listed = $derived(keyKinds(settings, box))
  const key = $derived(keyLayout(listed, settings.keyNote))
  const layout = $derived(figureLayout(settings.show, key, box))

  const boxLabel = $derived(
    settings.layout === 'lattice'
      ? `A particle diagram: a lattice of ${box.kinds.map((k) => `${describeParticle(k)}s`).join(' and ')}`
      : `A particle diagram: ${
          box.kinds
            .filter((k) => k.count)
            .map(describeKind)
            .join(', ') || 'an empty box'
        }`,
  )
  const label = $derived(
    settings.show === 'box'
      ? boxLabel
      : settings.show === 'both'
        ? `${boxLabel}. ${keyLabel(listed, settings.keyNote)}`
        : keyLabel(listed, settings.keyNote, 'A particle diagram key'),
  )
</script>

<FigureFrame bind:svg width={layout.width} height={layout.height} {label} title={settings.titleMode === 'text' ? settings.title : ''}>
  {#if layout.box}
    <g transform="translate({layout.box.x} {layout.box.y})">
      {#if box.border !== 'none'}
        <rect x="0.75" y="0.75" width={box.width - 1.5} height={box.height - 1.5} fill="none" stroke="#222" stroke-width="1.5" />
      {/if}
      {#if box.border === 'double'}
        <rect
          x={DOUBLE_INSET}
          y={DOUBLE_INSET}
          width={box.width - 2 * DOUBLE_INSET}
          height={box.height - 2 * DOUBLE_INSET}
          fill="none"
          stroke="#222"
          stroke-width="1.5"
        />
      {/if}
      <Discs discs={box.discs} />
    </g>
  {/if}
  {#if layout.key}
    <g transform="translate({layout.key.x} {layout.key.y})">
      <KeyDrawing {key} />
    </g>
  {/if}
</FigureFrame>
