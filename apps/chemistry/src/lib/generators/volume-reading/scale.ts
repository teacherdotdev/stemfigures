// The scale printed on each volume instrument, and what counts as a valid
// reading on it: one digit beyond the smallest mark (the estimated digit).

export const INSTRUMENTS = ['cylinder', 'buret', 'beaker'] as const
export type Instrument = (typeof INSTRUMENTS)[number]

export const CYLINDER_SIZES = ['10', '25', '50', '100', '250', '1000'] as const
export type CylinderSize = (typeof CYLINDER_SIZES)[number]

export const BEAKER_SIZES = ['small', 'medium', 'large'] as const
export type BeakerSize = (typeof BEAKER_SIZES)[number]

/** Which instrument, and the size of each kind that has sizes. */
export interface VolumeInstrument {
  instrument: Instrument
  size: CylinderSize
  beaker: BeakerSize
}

export interface Scale {
  capacity: number
  /** mL at the lowest mark; below it the glass is unmarked */
  lowest: number
  /** mL between numbered marks */
  labelEvery: number
  /** mL between the smallest marks */
  minorEvery: number
  /** decimal places in a reading */
  decimals: number
  /** true when 0 is at the top and readings grow downward (a buret) */
  readsDown: boolean
}

type Marks = Omit<Scale, 'decimals' | 'readsDown' | 'lowest'> & { lowest?: number }

// Numbered every tenth of capacity, except where real cylinders differ: the
// 25 mL has 0.5 mL marks numbered every 1 mL; the 50 mL has 1 mL marks
// rather than 0.5 mL, and is numbered every 10 mL like the 100 mL so it gets
// the same medium mark halfway between numbers; the 250 mL has 2 mL marks
// from 10 mL up, numbered 10, 30, 50… 250.
const CYLINDERS: Record<CylinderSize, Marks> = {
  '10': { capacity: 10, labelEvery: 1, minorEvery: 0.1 },
  '25': { capacity: 25, labelEvery: 1, minorEvery: 0.5 },
  '50': { capacity: 50, labelEvery: 10, minorEvery: 1 },
  '100': { capacity: 100, labelEvery: 10, minorEvery: 1 },
  '250': { capacity: 250, lowest: 10, labelEvery: 20, minorEvery: 2 },
  '1000': { capacity: 1000, labelEvery: 100, minorEvery: 10 },
}

// Beakers are marked coarsely, like real ones: a line every 10, 25 or 50 mL.
const BEAKERS: Record<BeakerSize, Marks> = {
  small: { capacity: 50, labelEvery: 10, minorEvery: 10 },
  medium: { capacity: 250, labelEvery: 50, minorEvery: 25 },
  large: { capacity: 600, labelEvery: 100, minorEvery: 50 },
}

/** Decimal places that reach one digit past the smallest mark: 0.1 → 2, 0.5 → 2, 1 → 1, 10 → 0, 50 → 0. */
const estimatedDecimals = (minorEvery: number) => Math.max(0, Math.ceil(-Math.log10(minorEvery) - 1e-9) + 1)

export function volumeScale({ instrument, size, beaker }: VolumeInstrument): Scale {
  const marks: Marks =
    instrument === 'buret' ? { capacity: 50, labelEvery: 1, minorEvery: 0.1 } : instrument === 'beaker' ? BEAKERS[beaker] : CYLINDERS[size]
  return { ...marks, lowest: marks.lowest ?? 0, decimals: estimatedDecimals(marks.minorEvery), readsDown: instrument === 'buret' }
}

/** What a figure's instrument is called, e.g. "250 mL beaker". */
export function instrumentName(choice: VolumeInstrument): string {
  const { capacity } = volumeScale(choice)
  const kind = { cylinder: 'graduated cylinder', buret: 'buret', beaker: 'beaker' }[choice.instrument]
  return `${capacity} mL ${kind}`
}

export function roundReading(scale: Scale, value: number): number {
  const clamped = Math.min(scale.capacity, Math.max(scale.lowest, value))
  return Number(clamped.toFixed(scale.decimals))
}

export const formatReading = (scale: Scale, value: number) => value.toFixed(scale.decimals)

/** A reading a teacher might set: away from the very ends of a buret, and a
 *  cylinder or beaker neither nearly empty nor nearly full. */
export function randomReading(scale: Scale, random: () => number = Math.random): number {
  const [low, high] = scale.readsDown ? [0.01, 0.99] : [0.15, 0.9]
  return roundReading(scale, scale.capacity * (low + random() * (high - low)))
}
