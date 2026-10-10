// Particle Diagram's settings, as they appear in the page address.

import { choice, defineSettings, json, number, text } from '$lib/shared/settings'
import { LATTICE_PATTERNS, LATTICE_SPACINGS, lattice, latticeRoom } from './lattice'
import { scatter } from './layout'
import {
  DEFAULT_OUTER,
  MAX_NAME,
  atomKinds,
  isObject,
  tidyAtomNames,
  tidyKinds,
  tidyLook,
  type AtomName,
  type Disc,
  type Look,
  type ParticleKind,
} from './particles'

/** Particles scattered at random in the box, or packed in a lattice. */
export const LAYOUTS = ['scattered', 'lattice'] as const
export type Layout = (typeof LAYOUTS)[number]

export const BORDERS = ['single', 'double', 'none'] as const
export type Border = (typeof BORDERS)[number]

/** The box is always this square around scattered particles, whatever is in
 *  it, so answer choices made one at a time line up (see CONTEXT.md "Box"). */
export const BOX_SIDE = 300

/** How far a double border's inner line sits inside the outer one. */
export const DOUBLE_INSET = 6

/** Space between a lattice and the border around it. */
export const LATTICE_MARGIN = 10

export const MAX_SEED = 999999
export const MAX_LATTICE = 12

/** What the figure shows: the box, the box and its key, or just the key
 *  (so answer choices made one at a time can share one key). */
export const SHOWS = ['box', 'both', 'key'] as const
export type Show = (typeof SHOWS)[number]

export const MAX_NOTE = 80

/** What the key of scattered particles lists: each kind whole, or each
 *  different atom in them, for students to write formulas from. */
export const KEY_LISTS = ['particles', 'atoms'] as const
export type KeyList = (typeof KEY_LISTS)[number]

const DEFAULT_KINDS: ParticleKind[] = [
  { count: 4, shape: 'single', look: { size: 'l', shade: 'light', charge: '-' }, outer: { ...DEFAULT_OUTER } },
  { count: 4, shape: 'single', look: { size: 's', shade: 'white', charge: '+' }, outer: { ...DEFAULT_OUTER } },
]

const look = (fallback: Look) => json(fallback, (v) => (isObject(v) ? tidyLook(v, fallback) : undefined))

export const particleSettings = defineSettings(
  {
    layout: choice(LAYOUTS, 'scattered'),
    particles: json(DEFAULT_KINDS, tidyKinds),
    seed: number({ min: 1, max: MAX_SEED, fallback: 2 }),
    border: choice(BORDERS, 'single'),
    pattern: choice(LATTICE_PATTERNS, 'alternate'),
    rows: number({ min: 1, max: MAX_LATTICE, fallback: 4 }),
    columns: number({ min: 1, max: MAX_LATTICE, fallback: 5 }),
    spacing: choice(LATTICE_SPACINGS, 'touching'),
    main: look({ size: 'l', shade: 'light', charge: '-' }),
    second: look({ size: 's', shade: 'white', charge: '+' }),
    secondCount: number({ min: 0, max: MAX_LATTICE * MAX_LATTICE, fallback: 4 }),
    mainName: text('', MAX_NAME),
    secondName: text('', MAX_NAME),
    // lattices are usually drawn without a box, so theirs starts off
    latticeBorder: choice(BORDERS, 'none'),
    show: choice(SHOWS, 'box'),
    keyNote: text('', MAX_NOTE),
    keyList: choice(KEY_LISTS, 'particles'),
    atomNames: json<AtomName[]>([], tidyAtomNames),
    titleMode: choice(['none', 'text'] as const, 'none'),
    title: text(''),
  },
  (s) => ({
    ...s,
    seed: Math.round(s.seed),
    rows: Math.round(s.rows),
    columns: Math.round(s.columns),
    secondCount: Math.round(s.secondCount),
  }),
)

export type ParticleSettings = typeof particleSettings.defaults

/** A seed for a new random layout. */
export const newSeed = () => 1 + Math.floor(Math.random() * MAX_SEED)

/** The particles scattered in the box for these settings, inside the inner
 *  line of a double border, and how many didn't fit. */
export function boxParticles(s: ParticleSettings) {
  const inset = s.border === 'double' ? DOUBLE_INSET : 0
  const { discs, missing } = scatter(s.particles, BOX_SIDE - 2 * inset, BOX_SIDE - 2 * inset, s.seed)
  return { discs: discs.map((d) => ({ ...d, x: d.x + inset, y: d.y + inset })), missing }
}

/** A lattice's atoms or ions as particle kinds, for its key: the main one,
 *  and the second one when any of it is drawn. */
function latticeKinds(s: ParticleSettings, discs: Disc[]): ParticleKind[] {
  const kind = (look: Look, name: string, count: number): ParticleKind => ({
    count,
    shape: 'single',
    look,
    outer: { ...DEFAULT_OUTER },
    ...(name.trim() ? { name } : {}),
  })
  const seconds = s.pattern === 'pure' ? 0 : s.pattern === 'alternate' ? Math.floor((s.rows * s.columns) / 2) : Math.min(s.secondCount, latticeRoom(s))
  const main = kind(s.main, s.mainName, discs.length - seconds)
  return seconds ? [main, kind(s.second, s.secondName, seconds)] : [main]
}

export interface BoxContents {
  width: number
  height: number
  border: Border
  discs: Disc[]
  /** particles, or a lattice's second atoms, that had no room */
  missing: number
  /** what the key lists */
  kinds: ParticleKind[]
}

/** Everything in the box for these settings: the fixed square of scattered
 *  particles, or a lattice with a box just fitting it. */
export function boxContents(s: ParticleSettings): BoxContents {
  if (s.layout === 'scattered') return { width: BOX_SIDE, height: BOX_SIDE, border: s.border, ...boxParticles(s), kinds: s.particles }
  const grid = lattice(s)
  const border = s.latticeBorder
  const pad = border === 'none' ? 0 : LATTICE_MARGIN + (border === 'double' ? DOUBLE_INSET : 0)
  return {
    width: grid.width + 2 * pad,
    height: grid.height + 2 * pad,
    border,
    discs: grid.discs.map((d) => ({ ...d, x: d.x + pad, y: d.y + pad })),
    missing: grid.missing,
    kinds: latticeKinds(s, grid.discs),
  }
}

/** What the key lists: the box's kinds, or each different atom in them when
 *  the teacher lists each atom (a lattice's kinds are atoms already). */
export const keyKinds = (s: ParticleSettings, box: BoxContents) =>
  s.layout === 'scattered' && s.keyList === 'atoms' ? atomKinds(box.kinds, s.atomNames) : box.kinds
