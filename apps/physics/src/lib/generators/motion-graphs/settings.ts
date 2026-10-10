// Every choice the teacher makes on Motion Graphs, with its default: a cart
// that speeds up, cruises, slows down and stops, on a position–time graph.
// The motion is picked by shape, segment by segment; ./motion works out its
// numbers.

import { LABEL_SIZES, type LabelSize } from '$shared/labelSize'
import { bool, choice, defineSettings, int, label, list, number, type SettingsOf } from '$lib/shared/settings'

/** What a segment does: stays at rest, moves at a constant velocity forward or back, speeds up or slows down. */
export const KINDS = ['rest', 'forward', 'back', 'faster', 'slower'] as const
export type Kind = (typeof KINDS)[number]
export const KIND_NAMES: Record<Kind, string> = {
  rest: 'At rest',
  forward: 'Constant velocity forward',
  back: 'Constant velocity back',
  faster: 'Speeding up',
  slower: 'Slowing down',
}

/** How fast it moves, or how quickly its speed changes. */
export const SIZES = ['slow', 'medium', 'fast'] as const
export type Size = (typeof SIZES)[number]

/** One segment of the motion. New fields go at the end, so old links keep working (see `list`). */
const segment = {
  kind: choice('forward', KINDS),
  size: choice('medium', SIZES),
  /** How long it lasts, in seconds. */
  duration: int(3, 1, 10),
  /** Which way a segment speeding up from rest goes. Once moving, it keeps going the way it was. */
  dir: choice('forward', ['forward', 'back']),
}

export type Segment = SettingsOf<typeof segment>

export const MAX_SEGMENTS = 6

/** A segment with every setting at its default but these. */
export const newSegment = (over: Partial<Segment> = {}): Segment => ({ kind: 'forward', size: 'medium', duration: 3, dir: 'forward', ...over })

/** The graphs teachers can pick: one, or all three stacked on the same time axis. */
export const GRAPHS = {
  xt: { name: 'Position–time', views: ['x'] },
  vt: { name: 'Velocity–time', views: ['v'] },
  at: { name: 'Acceleration–time', views: ['a'] },
  all: { name: 'All three, stacked', views: ['x', 'v', 'a'] },
} as const satisfies Record<string, { name: string; views: readonly View[] }>
export type Graphs = keyof typeof GRAPHS
/** What a graph shows up its side: position, velocity or acceleration. */
export type View = 'x' | 'v' | 'a'

const text = (t: string) => ({ mode: 'text' as const, text: t })

export const motionSettings = defineSettings({
  segments: list(
    segment,
    [newSegment({ kind: 'faster', duration: 4 }), newSegment({ duration: 4 }), newSegment({ kind: 'slower', duration: 4 }), newSegment({ kind: 'rest' })],
    MAX_SEGMENTS,
  ),
  /** Where it starts, in meters. */
  start: int(0, -50, 50),
  graphs: choice('xt', Object.keys(GRAPHS) as Graphs[]),
  /** The numbers along both axes. Off, the graph shows only the shape. */
  numbers: bool(true),
  gridlines: bool(true),
  /** A, B, C… at the ends of the segments, for questions like “between B and C”. */
  letters: bool(false),
  /** Each segment in its own line style (and color, with color on). */
  styles: bool(false),
  /** A tangent to the position–time graph, for the instantaneous velocity. */
  tangent: bool(false),
  tangentAt: number(2, 0, 60),
  title: label({ mode: 'none', text: '' }),
  timeTitle: label(text('Time (s)')),
  xTitle: label(text('Position (m)')),
  vTitle: label(text('Velocity (m/s)')),
  aTitle: label(text('Acceleration (m/s^2)')),
  labelSize: choice<LabelSize>('medium', Object.keys(LABEL_SIZES) as LabelSize[]),
  color: bool(false),
})

export type MotionSettings = typeof motionSettings.defaults

export const viewsOf = (s: Pick<MotionSettings, 'graphs'>): readonly View[] => GRAPHS[s.graphs].views
