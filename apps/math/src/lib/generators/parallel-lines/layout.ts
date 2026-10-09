// Lays out parallel lines cut by transversals for LinesFigure.svelte to draw,
// and works out what the teacher can point at on it: every angle, line and
// crossing.
//
// The figure is worked out with the parallel lines 1 apart, running along the
// x-axis from the top one at y = 0 downward, and each transversal through
// (pos, 0) at its angle. Everything is then turned and scaled to fit the same
// box, so every figure pastes in at a similar size; the SVG's frame grows to
// hold the labels.
//
// The figure covers the band of parallel lines and a margin around it. Any
// two lines that cross inside it make a crossing; the rays out from a
// crossing split the space around it into angles, each named by its two rays
// (see settings.ts), so its label follows it as the lines move.

import { LABEL_SCALE } from '$shared/labelSize'
import { layoutMath, type MathBox } from '$lib/shared/mathSvg.js'
import type { PlacedLabel } from '$lib/shapes/layout.js'
import { roundTo } from '$lib/shapes/parts.js'
import { ANGLE_DEFAULTS, SHADES, angleKey, readAngle, type LineBase, type LineStyle, type Settings } from './settings.js'

export type Vec = [number, number]
export type { PlacedLabel }
/** Something on the figure the teacher can point at: an angle, a line or a crossing, by its key or id. */
export type Part = { kind: 'angle' | 'line'; key: string }

const BASE_FS = 20 // label font size, at medium labels
const BASE_NAME_FS = 21
const FIT_W = 440
const FIT_H = 280
const PAD = 12
const REACH = 0.9 // how far the lines run past the outermost crossing, in gaps between the parallel lines
const ARC = 20 // angle arc radius
const ARC_GAP = 4.5 // between congruence arcs
export const WEDGE = 40 // shading's radius, and the highlight's
const SQUARE = 13 // right-angle square
const HEAD = 12 // an arrowhead's length, and
const HEAD_W = 5.5 // half its width
const ARROW = 4.5 // half a parallel arrow's length, and
const ARROW_W = 5 // half its width
const ARROW_GAP = 6
export const DOT = 3.5
const RAD = Math.PI / 180
const SAME = 1e-3 // how close two crossings are, in gaps, to count as one

const add = (p: Vec, q: Vec): Vec => [p[0] + q[0], p[1] + q[1]]
const sub = (p: Vec, q: Vec): Vec => [p[0] - q[0], p[1] - q[1]]
const mul = (p: Vec, k: number): Vec => [p[0] * k, p[1] * k]
const dot = (p: Vec, q: Vec) => p[0] * q[0] + p[1] * q[1]
const cross = (p: Vec, q: Vec) => p[0] * q[1] - p[1] * q[0]
const len = (p: Vec) => Math.hypot(p[0], p[1])
const unit = (p: Vec) => mul(p, 1 / (len(p) || 1))
const perp = (p: Vec): Vec => [-p[1], p[0]]
const r1 = (v: number) => Math.round(v * 10) / 10

/** How far a label's box reaches from its middle in direction d. */
const reach = (box: MathBox, d: Vec) => (box.w / 2) * Math.abs(d[0]) + ((box.asc + box.desc) / 2) * Math.abs(d[1])

/** How the figure's own units map onto the SVG, kept still while the teacher drags a transversal. */
export type Fit = { scale: number; x0: number; y0: number; frame: { x: number; y: number; w: number; h: number } }

/** A line of the figure in its own units: a point on it and its "+" direction. */
type Geo = { id: string; kind: 'p' | 't'; line: LineBase; at: Vec; d: Vec; theta?: number }

/** The lines that can be drawn, in the figure's own units, and what to fix about any transversal that can't. */
export function readLines(s: Settings) {
  const problems: Record<string, string> = {}
  const lines: Geo[] = s.parallels.map((p, j) => ({ id: p.id, kind: 'p', line: p, at: [0, -j], d: [1, 0] }))
  for (const t of s.transversals) {
    const v = readAngle(t.angle)
    if (typeof v === 'string') problems[t.id] = v
    else lines.push({ id: t.id, kind: 't', line: t, at: [t.pos, 0], d: [Math.cos(v * RAD), Math.sin(v * RAD)], theta: v })
  }
  return { lines, problems }
}

/** The figure laid out for LinesFigure.svelte, with what can be pointed at on it. */
export type LinesLayout = ReturnType<typeof buildLines>
export type AngleSpot = LinesLayout['angles'][number]

export function buildLines(s: Settings, lock: Fit | null = null) {
  const FS = BASE_FS * LABEL_SCALE[s.labelSize]
  const NAME_FS = BASE_NAME_FS * LABEL_SCALE[s.labelSize]
  const { lines } = readLines(s)
  const P = s.parallels.length
  const margin = P > 1 ? 0.9 : 1.3
  const [yLo, yHi] = [-(P - 1) - margin, margin]

  // Every pair of lines that cross inside the band, as crossings of two or more lines.
  const found: { at: Vec; ids: Set<string> }[] = []
  for (let i = 0; i < lines.length; i++) {
    for (let j = i + 1; j < lines.length; j++) {
      const [a, b] = [lines[i], lines[j]]
      const k = cross(a.d, b.d)
      if (Math.abs(k) < 1e-9) continue
      const at = add(a.at, mul(a.d, cross(sub(b.at, a.at), b.d) / k))
      if (at[1] < yLo + margin * 0.2 || at[1] > yHi - margin * 0.2) continue
      const same = found.find((c) => len(sub(c.at, at)) < SAME)
      if (same) same.ids.add(a.id).add(b.id)
      else found.push({ at, ids: new Set([a.id, b.id]) })
    }
  }
  const xs = found.map((c) => c.at[0])
  let [xLo, xHi] = xs.length ? [Math.min(...xs) - REACH, Math.max(...xs) + REACH] : [-1.5, 1.5]
  if (xHi - xLo < 3) [xLo, xHi] = [(xLo + xHi) / 2 - 1.5, (xLo + xHi) / 2 + 1.5]

  // Each line's stretch inside the box, as distances along it from its point.
  const ends = new Map<string, [number, number]>()
  for (const g of lines) {
    let [t0, t1] = [-Infinity, Infinity]
    let inside = true
    for (const [p, d, lo, hi] of [[g.at[0], g.d[0], xLo, xHi], [g.at[1], g.d[1], yLo, yHi]]) {
      if (Math.abs(d) < 1e-12) {
        if (p < lo || p > hi) inside = false
        continue
      }
      const [a, b] = [(lo - p) / d, (hi - p) / d].sort((u, v) => u - v)
      ;[t0, t1] = [Math.max(t0, a), Math.min(t1, b)]
    }
    if (inside && t1 > t0) ends.set(g.id, [t0, t1])
  }
  const shown = lines.filter((g) => ends.has(g.id))
  const pointOn = (g: Geo, t: number) => add(g.at, mul(g.d, t))

  // Turned, then in SVG's y-down coordinates, scaled to fit (or held still while dragging).
  const turn = s.turn * RAD
  const dir = ([x, y]: Vec): Vec => [x * Math.cos(turn) - y * Math.sin(turn), -(x * Math.sin(turn) + y * Math.cos(turn))]
  const corners = shown.flatMap((g) => ends.get(g.id)!.map((t) => dir(pointOn(g, t))))
  const cx = corners.map((p) => p[0])
  const cy = corners.map((p) => p[1])
  const scale = lock?.scale ?? Math.min(FIT_W / (Math.max(...cx) - Math.min(...cx) || 1), FIT_H / (Math.max(...cy) - Math.min(...cy) || 1))
  const [x0, y0] = lock ? [lock.x0, lock.y0] : [Math.min(...cx), Math.min(...cy)]
  const at = (p: Vec): Vec => {
    const [x, y] = dir(p)
    return [(x - x0) * scale, (y - y0) * scale]
  }
  const way = (v: Vec) => unit(dir(v))
  /** Turns a move on the page back into the figure's own units. */
  const back = ([dx, dy]: Vec): Vec => {
    const [x, y] = [dx / scale, -dy / scale]
    return [x * Math.cos(-turn) - y * Math.sin(-turn), x * Math.sin(-turn) + y * Math.cos(-turn)]
  }

  const byId = new Map(shown.map((g) => [g.id, g]))
  const segments = shown.map((g) => {
    const [t0, t1] = ends.get(g.id)!
    return { id: g.id, kind: g.kind, from: at(pointOn(g, t0)), to: at(pointOn(g, t1)), style: g.line.style as LineStyle }
  })
  const segment = new Map(segments.map((g) => [g.id, g]))

  const labels: PlacedLabel[] = []
  const boxAt = (box: MathBox, [cx, cy]: Vec) => ({ l: cx - box.w / 2 - 2, r: cx + box.w / 2 + 2, t: cy - (box.asc + box.desc) / 2 - 1, b: cy + (box.asc + box.desc) / 2 + 1 })
  const overlaps = (box: MathBox, c: Vec) => {
    const a = boxAt(box, c)
    return labels.some((l) => {
      const b = boxAt(l.box, [l.cx, l.cy])
      return a.l < b.r && b.l < a.r && a.t < b.b && b.t < a.b
    })
  }
  const place = (part: string, box: MathBox, [cx, cy]: Vec, out: Vec) => {
    labels.push({ part, box, cx, cy, x: cx - box.w / 2, y: cy + (box.asc - box.desc) / 2, along: out, across: perp(out), offset: [0, 0] })
  }

  // The crossings, each with the rays out from it in turn around it, and the angles between them.
  const rounded = (v: number) => roundTo(v, s.round)
  const angleOf = (u: Vec) => Math.atan2(u[1], u[0])
  const crossings = found
    .filter((c) => [...c.ids].every((id) => byId.has(id)))
    .map((c) => {
      const v = at(c.at)
      const rays = [...c.ids].flatMap((id) => {
        const g = byId.get(id)!
        return [
          { ray: `${id}+`, u: way(g.d) },
          { ray: `${id}-`, u: way(mul(g.d, -1)) },
        ]
      })
      rays.sort((a, b) => angleOf(a.u) - angleOf(b.u))
      const angles = rays.map((r, i) => {
        const next = rays[(i + 1) % rays.length]
        const sweep = (angleOf(next.u) - angleOf(r.u) + 2 * Math.PI) % (2 * Math.PI)
        return { key: angleKey(r.ray, next.ray), e1: r.u, e2: next.u, measure: sweep / RAD, rays: [r.ray, next.ray] }
      })
      return { key: [...c.ids].sort().join('.'), v, ids: [...c.ids], angles }
    })

  // How far a ray runs from its crossing before leaving the figure, in the SVG's units.
  const rayRoom = (v: Vec, ray: string) => {
    const g = segment.get(ray.slice(0, -1))!
    return len(sub(ray.endsWith('+') ? g.to : g.from, v))
  }

  // A crossing's point and name, in its widest unlabeled angle (its widest, if all are labeled),
  // placed before the angles' labels, which make way for it.
  const dots: Vec[] = []
  for (const c of crossings) {
    if (!(c.key in s.points)) continue
    dots.push(c.v)
    const name = s.points[c.key].trim()
    const box = name ? layoutMath(name, NAME_FS) : null
    if (!box) continue
    const free = c.angles.filter((a) => (s.angles[a.key] ?? ANGLE_DEFAULTS).label === 'none')
    const widest = (free.length ? free : c.angles).reduce((a, b) => (b.measure > a.measure + 1e-9 ? b : a))
    const out = unit(add(widest.e1, widest.e2))
    place(`pt:${c.key}`, box, add(c.v, mul(out, 8 + reach(box, out))), out)
  }

  // The lines' names past their "+" ends: the right end of a parallel line, the top of a transversal.
  for (const g of segments) {
    const name = byId.get(g.id)!.line.name.trim()
    const box = name ? layoutMath(name, NAME_FS) : null
    if (!box) continue
    const out = unit(sub(g.to, g.from))
    place(`name:${g.id}`, box, add(g.to, mul(out, 8 + reach(box, out))), out)
  }

  // Each angle: shading, arcs or a right-angle square, its label, and where the teacher can point at it.
  const arcs: string[] = []
  const shades: { d: string; fill: string }[] = []
  const squares: Vec[][] = []
  const sectorPath = (v: Vec, e1: Vec, e2: Vec, r: number, closed: boolean) => {
    const [a, b] = [add(v, mul(e1, r)), add(v, mul(e2, r))]
    const large = cross(e1, e2) < 0 ? 1 : 0 // more than half a turn
    const arc = `A${r1(r)},${r1(r)} 0 ${large} 1 ${r1(b[0])},${r1(b[1])}`
    return closed ? `M${r1(v[0])},${r1(v[1])} L${r1(a[0])},${r1(a[1])} ${arc} Z` : `M${r1(a[0])},${r1(a[1])} ${arc}`
  }
  const angles = crossings.flatMap((c) =>
    c.angles.map((a) => {
      const style = s.angles[a.key] ?? ANGLE_DEFAULTS
      const room = 0.4 * Math.min(...a.rays.map((ray) => rayRoom(c.v, ray)))
      const radius = Math.max(16, Math.min(WEDGE, room))
      const fill = SHADES[style.shade]?.fill
      if (fill) shades.push({ d: sectorPath(c.v, a.e1, a.e2, radius, true), fill })
      const box = style.label === 'text' ? layoutMath(style.text, FS) : style.label === 'measure' ? layoutMath(rounded(a.measure), FS, { suffix: '°' }) : null
      // Only the mark the teacher set: a square at a right angle, or that many arcs.
      const right = Math.abs(a.measure - 90) < 1e-4
      let outer = 0
      if (style.mark === 'right' && right) {
        squares.push([add(c.v, mul(a.e1, SQUARE)), add(c.v, add(mul(a.e1, SQUARE), mul(a.e2, SQUARE))), add(c.v, mul(a.e2, SQUARE))])
        outer = SQUARE * Math.SQRT2
      } else if (style.mark !== 'none') {
        const count = style.mark === 'right' ? 1 : Number(style.mark)
        for (let n = 0; n < count; n++) arcs.push(sectorPath(c.v, a.e1, a.e2, ARC + n * ARC_GAP, false))
        outer = ARC + (count - 1) * ARC_GAP
      }
      // Far enough in to clear the arc, and to fit between the angle's two rays.
      const mid = unit(add(a.e1, a.e2))
      const half = Math.sin((Math.min(a.measure, 179) * RAD) / 2)
      const distance = (b: MathBox) => {
        const toSide = Math.max(...[a.e1, a.e2].map((e) => (reach(b, perp(e)) + 3) / half))
        return Math.max(outer + 5 + reach(b, mid), toSide, 12 + reach(b, mid))
      }
      if (box) {
        let d = distance(box)
        for (let n = 0; n < 12 && overlaps(box, add(c.v, mul(mid, d))); n++) d += 4 // clear of a point's name
        place(`angle:${a.key}`, box, add(c.v, mul(mid, d)), mid)
      }
      const ghostText = `${rounded(a.measure)}°`
      const ghostBox = layoutMath(rounded(a.measure), FS, { suffix: '°' })!
      return {
        key: a.key,
        crossing: c.key,
        rays: a.rays,
        measure: a.measure,
        /** Whether it's 90°, so its mark can be a right-angle square. */
        right,
        /** The wedge that's highlighted, and pointed at to pick the angle. */
        wedge: sectorPath(c.v, a.e1, a.e2, radius, true),
        /** Where its measure is written while it's highlighted. */
        ghost: { at: add(c.v, mul(mid, distance(ghostBox))), text: ghostText },
        /** Where its popup opens. */
        anchor: add(c.v, mul(mid, radius * 0.7)),
      }
    }),
  )

  // Each end's cap: a filled arrowhead or an open one pointing out, or a dot.
  const heads: Vec[][] = []
  const openHeads: Vec[][] = []
  for (const g of segments) {
    const line = byId.get(g.id)!.line
    for (const [cap, tip, from] of [[line.startCap, g.from, g.to], [line.endCap, g.to, g.from]] as const) {
      const d = unit(sub(tip, from))
      const base = add(tip, mul(d, -HEAD))
      const head = [add(base, mul(perp(d), HEAD_W)), tip, add(base, mul(perp(d), -HEAD_W))]
      if (cap === 'triangle') heads.push(head)
      else if (cap === 'line') openHeads.push(head)
      else if (cap === 'circle') dots.push(tip)
    }
  }

  // Where a line meets the others, as distances in from its start, for its arrows and end points.
  const crossingsOn = (g: (typeof segments)[number]) => {
    const d = unit(sub(g.to, g.from))
    const along = crossings.filter((c) => c.ids.includes(g.id)).map((c) => dot(sub(c.v, g.from), d))
    return { d, along, length: len(sub(g.to, g.from)) }
  }

  // Parallel arrows halfway between a line's start and its first crossing, all pointing rightward on the page.
  const arrows: Vec[][] = []
  for (const g of segments) {
    const count = byId.get(g.id)!.line.arrows
    if (!count) continue
    const { d, along, length } = crossingsOn(g)
    const c = add(g.from, mul(d, (along.length ? Math.min(...along) : length) / 2))
    const t = d[0] < -1e-9 || (Math.abs(d[0]) <= 1e-9 && d[1] < 0) ? mul(d, -1) : d
    const n = perp(t)
    for (let a = 0; a < count; a++) {
      const m = add(c, mul(t, (a - (count - 1) / 2) * ARROW_GAP))
      const tail = add(m, mul(t, -ARROW))
      arrows.push([add(tail, mul(n, ARROW_W)), add(m, mul(t, ARROW)), add(tail, mul(n, -ARROW_W))])
    }
  }

  // Named points near each end of a line, between its outermost crossing and its end.
  for (const g of segments) {
    const line = byId.get(g.id)!.line
    const { d, along, length } = crossingsOn(g)
    const first = along.length ? Math.min(...along) : length / 2
    const last = along.length ? Math.max(...along) : length / 2
    const near = [
      { name: line.startPoint, t: first * 0.35 },
      { name: line.endPoint, t: length - (length - last) * 0.35 },
    ]
    near.forEach(({ name, t }, i) => {
      if (!name.trim()) return
      const p = add(g.from, mul(d, t))
      dots.push(p)
      const box = layoutMath(name.trim(), NAME_FS)!
      const n = perp(d)
      const spots = [n, mul(n, -1)].map((out) => ({ at: add(p, mul(out, 8 + reach(box, out))), out }))
      const spot = spots.find((sp) => !overlaps(box, sp.at)) ?? spots[0]
      place(`end:${g.id}:${i}`, box, spot.at, spot.out)
    })
  }

  // The frame holds the lines, their arrowheads and every label.
  const points: Vec[] = [...segments.flatMap((g) => [g.from, g.to]), ...heads.flat(), ...openHeads.flat()]
  for (const l of labels) points.push([l.cx - l.box.w / 2, l.y - l.box.asc], [l.cx + l.box.w / 2, l.y + l.box.desc])
  const minX = Math.min(...points.map((p) => p[0])) - PAD
  const minY = Math.min(...points.map((p) => p[1])) - PAD
  const maxX = Math.max(...points.map((p) => p[0])) + PAD
  const maxY = Math.max(...points.map((p) => p[1])) + PAD
  const frame = lock?.frame ?? { x: r1(minX), y: r1(minY), w: r1(maxX - minX), h: r1(maxY - minY) }

  return {
    frame,
    segments,
    heads,
    openHeads,
    shades,
    arcs,
    squares,
    arrows,
    dots,
    labels,
    angles,
    crossings: crossings.map((c) => ({ key: c.key, at: c.v, ids: c.ids })),
    fit: { scale, x0, y0, frame } as Fit,
    back,
  }
}

/**
 * Where a transversal should cross the top line (its pos) to meet another
 * transversal exactly on one of the parallel lines: one place for each other
 * transversal and parallel line.
 */
export function snapPositions(s: Settings, id: string): number[] {
  const { lines } = readLines(s)
  const me = lines.find((g) => g.id === id)
  if (!me?.theta) return []
  const cot = (deg: number) => 1 / Math.tan(deg * RAD)
  const out: number[] = []
  for (const other of lines) {
    if (other.kind !== 't' || other.id === id) continue
    for (let j = 0; j < s.parallels.length; j++) out.push(other.at[0] - j * cot(other.theta!) + j * cot(me.theta))
  }
  return out
}
