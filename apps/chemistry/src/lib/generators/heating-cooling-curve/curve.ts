// The physics behind a heating or cooling curve: a substance heated (or
// cooled) steadily from one temperature to another, drawn as its temperature
// against the heat added (or the time, at a steady rate). Each phase warms
// in a sloped segment (q = m·c·ΔT); each phase change is a flat plateau at
// its melting or boiling point (q = n·ΔH), where the heat goes into pulling
// the particles apart instead of speeding them up.
//
// A curve comes from one of two things the teacher types:
//   • the substance's properties: its mass, specific heats, enthalpies of
//     fusion and vaporization and molar mass, so every segment is to scale
//     (water's boiling plateau is about 6.8 times as long as its melting
//     plateau); or
//   • how long each segment is, for a simple worksheet curve drawn to no
//     particular scale.
//
// A cooling curve is a heating curve run backwards: the same segments, from
// the hot end, with the heat removed instead of added.

export const DIRECTIONS = ['heating', 'cooling'] as const
export type Direction = (typeof DIRECTIONS)[number]

/** The five segments of a curve from a solid to a gas, in heating order. */
export const SEGMENTS = ['solid', 'melt', 'liquid', 'boil', 'gas'] as const
export type SegmentKey = (typeof SEGMENTS)[number]

export const isPlateau = (k: SegmentKey) => k === 'melt' || k === 'boil'

/** The temperatures a curve runs between, and where it changes phase, in °C. */
export type Temperatures = { startT: number; endT: number; mp: number; bp: number }

/**
 * A substance's properties: specific heats in J/(g·°C), enthalpies in
 * kJ/mol, molar mass in g/mol.
 */
export type Properties = {
  cSolid: number
  cLiquid: number
  cGas: number
  fusH: number
  vapH: number
  molarMass: number
}

/**
 * Substances whose properties the teacher can fill in with one pick, each
 * from one source so the numbers match a textbook a teacher can check.
 */
export const SUBSTANCES = [
  {
    id: 'water',
    name: 'Water',
    // OpenStax Chemistry 2e, Example 10.10 (heating ice to steam) and Table 5.1:
    // ice 2.09, water 4.18, steam 1.86 J/(g·°C); ΔHfus 6.01 kJ/mol at 0 °C;
    // ΔHvap 40.67 kJ/mol at 100 °C (not the 44.01 at 25 °C); 18.02 g/mol.
    mp: 0,
    bp: 100,
    properties: { cSolid: 2.09, cLiquid: 4.18, cGas: 1.86, fusH: 6.01, vapH: 40.67, molarMass: 18.02 },
  },
] as const satisfies readonly { id: string; name: string; mp: number; bp: number; properties: Properties }[]

/** One segment of a curve: which it is, and the temperatures it runs from and to. */
export type Segment = { key: SegmentKey; t0: number; t1: number }

/**
 * The segments a curve passes through, in the order it passes them. A
 * plateau is included when the curve starts or ends right at it, so a curve
 * from ice at 0 °C begins by melting and one ending at 100 °C boils away.
 */
export function segmentsOf(dir: Direction, { startT, endT, mp, bp }: Temperatures): Segment[] {
  const lo = Math.min(startT, endT)
  const hi = Math.max(startT, endT)
  const ranges: Record<SegmentKey, [number, number]> = {
    solid: [-Infinity, mp],
    melt: [mp, mp],
    liquid: [mp, bp],
    boil: [bp, bp],
    gas: [bp, Infinity],
  }
  const out: Segment[] = []
  for (const key of SEGMENTS) {
    const [a, b] = ranges[key]
    if (isPlateau(key)) {
      if (lo <= a && a <= hi) out.push({ key, t0: a, t1: a })
      continue
    }
    const from = Math.max(a, lo)
    const to = Math.min(b, hi)
    if (to > from) out.push({ key, t0: from, t1: to })
  }
  return dir === 'heating' ? out : out.reverse().map((s) => ({ ...s, t0: s.t1, t1: s.t0 }))
}

/** The heat each segment takes (or gives out), in kJ, for this mass in g. */
export function heatOf(seg: Segment, mass: number, p: Properties): number {
  const dT = Math.abs(seg.t1 - seg.t0)
  switch (seg.key) {
    case 'solid':
      return (mass * p.cSolid * dT) / 1000
    case 'liquid':
      return (mass * p.cLiquid * dT) / 1000
    case 'gas':
      return (mass * p.cGas * dT) / 1000
    case 'melt':
      return (mass / p.molarMass) * p.fusH
    case 'boil':
      return (mass / p.molarMass) * p.vapH
  }
}

/** A segment laid along the x-axis: where it starts and how long it is. */
export type Placed = Segment & { x0: number; width: number }

/** Segments laid end to end from x = 0, each as long as `widthOf` says. */
export function placeSegments(segs: Segment[], widthOf: (s: Segment) => number): Placed[] {
  let x = 0
  return segs.map((s) => {
    const width = Math.max(0, widthOf(s))
    const placed = { ...s, x0: x, width }
    x += width
    return placed
  })
}

export type Point = { x: number; y: number }

/**
 * The curve through the placed segments, as points of the graph. A cooling
 * curve can be supercooled: the liquid keeps cooling past its freezing point
 * by `supercool` °C before the solid starts to form, and the heat it gives
 * out freezing warms it back up to the freezing point. The dip takes the
 * start of the freezing plateau, so the rest of the curve doesn't move.
 */
export function curvePoints(placed: Placed[], supercool = 0): Point[] {
  if (!placed.length) return []
  const pts: Point[] = [{ x: 0, y: placed[0].t0 }]
  for (const [i, s] of placed.entries()) {
    const freezing = s.key === 'melt' && s.t0 === s.t1 && placed[i - 1]?.key === 'liquid'
    if (freezing && supercool > 0 && s.width > 0) {
      // Keep going at the liquid's slope, but take at most 40% of the plateau.
      const before = placed[i - 1]
      const slope = before.width > 0 ? Math.abs(before.t1 - before.t0) / before.width : Infinity
      const down = Math.min(supercool / slope, s.width * 0.4)
      const back = down * 0.5
      pts.push({ x: s.x0 + down, y: s.t0 - supercool }, { x: s.x0 + down + back, y: s.t0 })
    }
    pts.push({ x: s.x0 + s.width, y: s.t1 })
  }
  return pts
}

/** Where a curve ends along the x-axis. */
export const curveEnd = (placed: Placed[]) => (placed.length ? placed.at(-1)!.x0 + placed.at(-1)!.width : 0)
