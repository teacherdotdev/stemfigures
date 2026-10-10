<script lang="ts">
  // Motion Graphs' picture on the directory: its default figure, drawn by the
  // same code the generator uses.
  import MotionGraphs from './MotionGraphs.svelte'
  import { motionSettings } from './settings'
</script>

<MotionGraphs settings={motionSettings.defaults} id="preview" />
