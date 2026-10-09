<script lang="ts">
  // The Parallel Lines and Transversal Generator's picture on the directory:
  // the figure it opens with, drawn by the same code the generator uses.
  import { buildLines } from './layout.js'
  import LinesFigure from './LinesFigure.svelte'
  import { DEFAULT_SETTINGS, cleanSettings, readLines } from './settings.js'

  const settings = cleanSettings(DEFAULT_SETTINGS)
  const figure = buildLines(settings, readLines(settings).lines!) // the opening figure always reads
</script>

<LinesFigure {figure} />
