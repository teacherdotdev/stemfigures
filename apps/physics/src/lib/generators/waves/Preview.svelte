<script lang="ts">
  // The Waves Generator's picture on the directory: its default figure, drawn
  // by the same code the generator uses.
  import Waves from './Waves.svelte'
  import { waveSettings } from './settings'
</script>

<Waves settings={waveSettings.defaults} id="preview" />
