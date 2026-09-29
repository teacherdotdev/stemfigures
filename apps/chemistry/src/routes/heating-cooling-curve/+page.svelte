<script lang="ts">
  import HeatingCoolingCurve from '$lib/generators/heating-cooling-curve/HeatingCoolingCurve.svelte'
  import { findGenerator } from '$lib/generators/index'
  import Seo from '$lib/site/Seo.svelte'

  const generator = findGenerator('/heating-cooling-curve')!
</script>

<Seo title="{generator.name} Generator" description={generator.description} path={generator.path} />
<HeatingCoolingCurve />
