// Every choice the teacher makes for parallel lines cut by a transversal, with
// its default. The page address carries any non-default values, so a figure
// can be bookmarked or shared.
//
// One angle sets the figure: ∠2, between the first line and the transversal
// at their crossing's top right, kept as typed ("65", "47.5"). readLines()
// works out the other angles. The generator opens on lines m and n cut by t
// at 65°, with the eight angles numbered 1 to 8 and parallel arrows on m and n.
//
// Angles are numbered the way most worksheets do: 1 to 4 around the
// transversal's crossing with the first line (top left, top right, bottom
// left, bottom right), then 5 to 8 the same way around its crossing with the
// second. A second transversal's angles are 9 to 16. Each number is just the
// angle's label text, so the teacher can retype it as x or 3x + 5, or show
// the angle's measure instead.

import { parseNumber } from '$lib/shared/math.js'
import { cleanLabelSize, type LabelSize } from '$shared/labelSize'
import {
  LABEL_MODES, MARKS, ROUNDING,
  cleanAgainst, oneOf, queryAgainst, readMoved, writeMoved,
  type LabelMode, type RawSettings,
} from '$lib/shapes/parts.js'

export { readMoved, writeMoved }
export type { RawSettings }

/** The angles' numbers: 1–8 at the first transversal, 9–16 at the second. */
export const FIRST = [1, 2, 3, 4, 5, 6, 7, 8] as const
export const SECOND = [9, 10, 11, 12, 13, 14, 15, 16] as const
export const ANGLES = [...FIRST, ...SECOND]
export type AngleNo = (typeof ANGLES)[number]

/** Shading for an angle: none, or a light color that still prints in grayscale. */
export const SHADES = [
  { name: 'None', fill: '' },
  { name: 'Blue', fill: '#bfdbfe' },
  { name: 'Red', fill: '#fecaca' },
  { name: 'Green', fill: '#bbf7d0' },
  { name: 'Yellow', fill: '#fde68a' },
]
const SHADE_IDS = SHADES.map((_, i) => i)

/** The second line tilts at most this far from the first when they aren't parallel. */
export const MAX_TILT = 30
/** How far along the first line the second transversal may cross it, in gaps between the lines. */
export const MAX_SHIFT = 3

type AngleSettings = { [K in `a${AngleNo}Label`]: LabelMode } & { [K in `a${AngleNo}Text`]: string } & {
  [K in `a${AngleNo}Arcs` | `a${AngleNo}Shade`]: number
}

export type Settings = AngleSettings & {
  angle: string
  parallel: boolean
  tilt: number
  second: boolean
  angle2: string
  shift: number
  names: boolean
  line1: string
  line2: string
  trans1: string
  trans2: string
  crossPoints: boolean
  rayPoints: boolean
  pointNames: string
  arrows: number
  ends: boolean
  arcs: boolean
  square: boolean
  round: number
  rotate: number
  moved: string
  labelSize: LabelSize
}

const perAngle = Object.fromEntries(
  ANGLES.flatMap((k) => [[`a${k}Label`, 'text'], [`a${k}Text`, String(k)], [`a${k}Arcs`, 0], [`a${k}Shade`, 0]]),
)

export const DEFAULT_SETTINGS = {
  angle: '65',
  parallel: true,
  tilt: 12, // the second line's tilt, when the lines aren't parallel
  second: false,
  angle2: '120',
  shift: 1.5, // where the second transversal crosses the first line, from the first's crossing
  names: true,
  line1: 'm',
  line2: 'n',
  trans1: 't',
  trans2: 's',
  crossPoints: false,
  rayPoints: false,
  pointNames: 'A B C D E F G H I J K L M N O P',
  arrows: 1, // parallel arrows on both lines, when they're parallel
  ends: true, // arrowheads at the lines' ends
  arcs: false, // an arc at every labeled angle
  square: true, // a right-angle square where the transversal is perpendicular
  round: 1,
  rotate: 0,
  moved: '',
  labelSize: 'medium',
  ...perAngle,
} as Settings

/** Tidy raw values (from a form, a link or a stored preset) into usable settings. */
export function cleanSettings(s: RawSettings): Settings {
  const d = DEFAULT_SETTINGS
  const out = cleanAgainst(d, s)
  for (const k of ANGLES) {
    out[`a${k}Label`] = oneOf(LABEL_MODES, out[`a${k}Label`], 'text')
    out[`a${k}Text`] = out[`a${k}Text`].slice(0, 40)
    out[`a${k}Arcs`] = oneOf(MARKS, out[`a${k}Arcs`], 0)
    out[`a${k}Shade`] = oneOf(SHADE_IDS, out[`a${k}Shade`], 0)
  }
  out.tilt = Math.max(-MAX_TILT, Math.min(MAX_TILT, Math.round(out.tilt)))
  out.shift = Math.max(-MAX_SHIFT, Math.min(MAX_SHIFT, Math.round(out.shift * 4) / 4))
  for (const k of ['line1', 'line2', 'trans1', 'trans2']) out[k] = out[k].slice(0, 4)
  out.pointNames = out.pointNames.slice(0, 80)
  out.arrows = oneOf(MARKS, out.arrows, d.arrows)
  out.round = oneOf(ROUNDING, out.round, d.round)
  out.rotate = Math.max(-180, Math.min(180, Math.round(out.rotate)))
  out.moved = writeMoved(readMoved(out.moved))
  out.labelSize = cleanLabelSize(out.labelSize)
  return out as Settings
}

export const settingsToQuery = (s: Settings) => queryAgainst(DEFAULT_SETTINGS, s)

export function settingsFromParams(params: URLSearchParams): Settings {
  const s: RawSettings = { ...DEFAULT_SETTINGS }
  for (const key of Object.keys(DEFAULT_SETTINGS)) if (params.has(key)) s[key] = params.get(key)
  return cleanSettings(s)
}

/** The point names, in order: where lines cross first, then one on each ray. */
export const pointNameList = (s: Settings) => s.pointNames.trim().split(/[\s,]+/).filter(Boolean)

/**
 * The figure's angles: θ for each transversal (its ∠2 or ∠10, against the
 * first line), φ for the second line's tilt (0 when parallel), and
 * every numbered angle's measure in degrees.
 */
export type Lines = { theta: number[]; phi: number; shift: number; measures: Partial<Record<AngleNo, number>> }

/** What the settings mean, or what to fix, as a message for the settings panel and the field it belongs to. */
export type LinesRead = { lines: Lines | null; problem: string | null; field: 'angle' | 'angle2' | 'shift' | null }

const NOT_A_NUMBER = 'Type a number of degrees, like 65 or 47.5.'

function readAngle(typed: string): number | string {
  if (!typed.trim()) return 'Give the angle a measure.'
  const v = parseNumber(typed)
  if (v === null) return NOT_A_NUMBER
  if (v <= 0 || v >= 180) return 'The angle has to be between 0° and 180°.'
  if (v < 10 || v > 170) return 'Keep the angle between 10° and 170°, so the figure fits on a page.'
  return v
}

/** Measures of the four angles where a transversal at θ crosses a line tilted φ: top left, top right, bottom left, bottom right. */
const around = (theta: number, phi: number) => {
  const rel = theta - phi
  return [180 - rel, rel, rel, 180 - rel]
}

/** A point or direction in the figure's own units: the lines are 1 apart, y up. */
export type Vec = [number, number]
const RAD = Math.PI / 180

/**
 * Where a transversal at θ, crossing the first line (y = ½) at x, crosses the
 * second line (through (0, −½), tilted φ). `s` is how far along the
 * transversal that is, negative when below the first line, as it has to be.
 */
export function crossingsOf(theta: number, phi: number, x: number) {
  const w: Vec = [Math.cos(theta * RAD), Math.sin(theta * RAD)]
  const u: Vec = [Math.cos(phi * RAD), Math.sin(phi * RAD)]
  const top: Vec = [x, 0.5]
  const qp: Vec = [0 - x, -0.5 - 0.5]
  const s = (qp[0] * u[1] - qp[1] * u[0]) / (w[0] * u[1] - w[1] * u[0])
  return { top, bottom: [x + s * w[0], 0.5 + s * w[1]] as Vec, s }
}

export function readLines(s: Settings): LinesRead {
  const phi = s.parallel ? 0 : s.tilt
  const theta: number[] = []
  const fields = s.second ? (['angle', 'angle2'] as const) : (['angle'] as const)
  for (const field of fields) {
    const v = readAngle(s[field])
    if (typeof v === 'string') return { lines: null, problem: v, field }
    // Measured against the second line, the transversal has to cross it too, not run alongside it.
    if (v - phi < 10 || v - phi > 170) {
      return { lines: null, problem: `The transversal is too close to running along line ${s.line2.trim() || 'n'}. Change its angle or the tilt.`, field }
    }
    theta.push(v)
  }
  if (s.second && s.shift === 0) {
    return { lines: null, problem: 'The transversals can’t cross the first line at the same point. Slide the second one along.', field: 'shift' }
  }
  const crossings = theta.map((t, i) => crossingsOf(t, phi, i ? s.shift : 0))
  if (crossings.some((c) => c.s > -0.2)) {
    const field = crossings[0].s > -0.2 ? 'angle' : s.second ? 'shift' : 'angle'
    return { lines: null, problem: `Lines ${s.line1.trim() || 'm'} and ${s.line2.trim() || 'n'} meet before the transversal crosses them both. Tilt the line less.`, field }
  }
  if (crossings.length === 2 && Math.abs(crossings[0].bottom[0] - crossings[1].bottom[0]) < 0.05) {
    return { lines: null, problem: 'The transversals can’t cross the second line at the same point. Slide the second one along.', field: 'shift' }
  }
  const measures: Partial<Record<AngleNo, number>> = {}
  theta.forEach((t, i) => {
    const top = around(t, 0)
    const bottom = around(t, phi)
    ;[...top, ...bottom].forEach((m, j) => (measures[(i * 8 + j + 1) as AngleNo] = m))
  })
  return { lines: { theta, phi, shift: s.shift, measures }, problem: null, field: null }
}
