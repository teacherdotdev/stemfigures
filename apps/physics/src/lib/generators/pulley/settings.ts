// Every choice the teacher makes on the Pulley Generator, with its default:
// the most common textbook version, an Atwood machine.

import { bool, choice, defineSettings, int, label, list, number, type SettingsOf } from '$lib/shared/settings'

/** One object. New fields go at the end, so old links keep working (see `list`). */
const object = {
  label: label({ mode: 'text', text: 'm' }),
  gravityLabel: label({ mode: 'text', text: 'mg' }),
  /** A block or a cart, for an object on a table or ramp; hanging objects are blocks. */
  kind: choice('block', ['block', 'cart']),
  size: number(1, 0.5, 2),
}

export const MIN_OBJECTS = 2
export const MAX_OBJECTS = 2

const text = (t: string) => ({ mode: 'text' as const, text: t })

/** The nth object (from 1), labeled m_n with weight m_n g. */
export const numberedObject = (n: number): PulleyObject => ({ label: text(`m_${n}`), gravityLabel: text(`m_${n} g`), kind: 'block', size: 1 })

/** Links from before the objects were a list named them a (the left one, or the one on the table or ramp) and b. */
const OLD = {
  aLabel: object.label,
  aSize: object.size,
  aKind: object.kind,
  aGravityLabel: object.gravityLabel,
  bLabel: object.label,
  bSize: object.size,
  bGravityLabel: object.gravityLabel,
}
const [first, second] = [numberedObject(1), numberedObject(2)]
const old = {
  fields: OLD,
  upgrade(raw: Record<string, unknown>) {
    if ('objects' in raw || !Object.keys(OLD).some((key) => key in raw)) return raw
    const or = (key: keyof typeof OLD, fallback: unknown) => (key in raw ? raw[key] : fallback)
    return {
      ...raw,
      objects: [
        { label: or('aLabel', first.label), gravityLabel: or('aGravityLabel', first.gravityLabel), kind: or('aKind', 'block'), size: or('aSize', 1) },
        { label: or('bLabel', second.label), gravityLabel: or('bGravityLabel', second.gravityLabel), kind: 'block', size: or('bSize', 1) },
      ],
    }
  },
}

export const pulleySettings = defineSettings(
  {
    setup: choice('atwood', ['atwood', 'table', 'ramp', 'tackle']),
    /** The objects: in an Atwood machine, the left and right ones; on a table or ramp, the one on it and the hanging one. */
    objects: list(object, [first, second], MAX_OBJECTS, MIN_OBJECTS),
    /** Which hanging object hangs lower in an Atwood machine, if either. */
    lower: choice('neither', ['neither', 'a', 'b']),
    angle: int(30, 10, 60),
    angleLabel: label({ mode: 'text', text: 'theta' }),
    surface: choice('smooth', ['smooth', 'rough']),
    /** A block and tackle: how many strands hold up its load. */
    strands: int(2, 1, 4),
    loadLabel: label({ mode: 'text', text: 'm' }),
    loadSize: number(1, 0.5, 2),
    // Vectors.
    tension: bool(false),
    tensionLabel: label({ mode: 'text', text: 'T' }),
    gravity: bool(false),
    loadGravityLabel: label({ mode: 'text', text: 'mg' }),
    /** The normal force and friction on the object on a table or ramp. Friction points toward or away from the pulley. */
    normal: bool(false),
    normalLabel: label({ mode: 'text', text: 'F_N' }),
    friction: choice('none', ['none', 'toward', 'away']),
    frictionLabel: label({ mode: 'text', text: 'F_f' }),
    /** Acceleration of every object. Forward is the way a hanging object falls (in a block and tackle, the load rising). */
    acceleration: choice('none', ['none', 'forward', 'backward']),
    accelerationLabel: label({ mode: 'text', text: 'a' }),
    mirror: bool(false),
    color: bool(false),
  },
  old,
)

export type PulleySettings = typeof pulleySettings.defaults
export type PulleyObject = SettingsOf<typeof object>
