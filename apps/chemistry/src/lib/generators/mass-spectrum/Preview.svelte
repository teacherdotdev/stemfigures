<script lang="ts">
  // Mass Spectrum's picture on the directory: magnesium's three isotopes,
  // each with its abundance.
  import MassSpectrumFigure from './MassSpectrumFigure.svelte'
  import { massSpectrumSettings } from './settings'
</script>

<MassSpectrumFigure settings={massSpectrumSettings.defaults} id="preview-mass-spectrum" />
