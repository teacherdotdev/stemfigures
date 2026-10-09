// Lays out parallel lines cut by a transversal for LinesFigure.svelte to
// draw: the two lines and one or two transversals, with arrowheads at their
// ends, and at every crossing its four angles' labels, arcs and shading.
// Parallel arrows mark the two lines while they're parallel, and the lines
// and points can be named.
//
// The figure is worked out with the lines 1 apart (see settings.ts), then
// turned and scaled to fit the same box whatever its angles, so every figure
// pastes in at a similar size; the SVG's frame then grows to hold its labels.
// A label the teacher drags keeps its offset in its part's own directions, so
// it follows the part when the figure is turned or reshaped.
//
// Label ids: "angleA" to "angleP" for angles 1 to 16, "lineA" and "lineB" for
// the lines' names, "transA" and "transB" for the transversals', and "ptA",
// "ptB"… for the points, in the order they're named.

import { LABEL_SCALE } from '$shared/labelSize'
import { layoutMath, type MathBox } from '$lib/shared/mathSvg.js'
import type { PlacedLabel } from '$lib/shapes/layout.js'
import { roundTo } from '$lib/shapes/parts.js'
import { ANGLES, SHADES, crossingsOf, pointNameList, readMoved, type AngleNo, type Lines, type Settings, type Vec } from './settings.js'

export type { PlacedLabel, Vec }

const BASE_FS = 20 // label font size, at medium labels
const BASE_NAME_FS = 21
const FIT_W = 440
const FIT_H = 280
const PAD = 12
const REACH = 0.75 // how far each line runs past its outermost crossing, in gaps between the lines
const ARC = 20 // angle arc radius
const ARC_GAP = 4.5 // between congruence arcs
const SHADE = 40 // shading's radius
const SQUARE = 13 // right-angle square
const HEAD = 12 // an arrowhead's length, and
const HEAD_W = 5.5 // half its width
const ARROW = 4.5 // half a parallel arrow's length, and
const ARROW_W = 5 // half its width
const ARROW_GAP = 6
const DOT = 3.5
const RAD = Math.PI / 180

const add = (p: Vec, q: Vec): Vec => [p[0] + q[0], p[1] + q[1]]
const sub = (p: Vec, q: Vec): Vec => [p[0] - q[0], p[1] - q[1]]
const mul = (p: Vec, k: number): Vec => [p[0] * k, p[1] * k]
const dot = (p: Vec, q: Vec) => p[0] * q[0] + p[1] * q[1]
const cross = (p: Vec, q: Vec) => p[0] * q[1] - p[1] * q[0]
const len = (p: Vec) => Math.hypot(p[0], p[1])
const unit = (p: Vec) => mul(p, 1 / (len(p) || 1))
const perp = (p: Vec): Vec => [-p[1], p[0]]
const r1 = (v: number) => Math.round(v * 10) / 10
const LETTERS = 'ABCDEFGHIJKLMNOP'

/** How far a label's box reaches from its middle in direction d. */
const reach = (box: MathBox, d: Vec) => (box.w / 2) * Math.abs(d[0]) + ((box.asc + box.desc) / 2) * Math.abs(d[1])

/** The id of the label at angle k. */
export const angleId = (k: AngleNo) => `angle${LETTERS[k - 1]}`

/** The figure laid out for LinesFigure.svelte to draw. */
export type LinesLayout = ReturnType<typeof buildLines>

export function buildLines(s: Settings, lines: Lines) {
  const FS = BASE_FS * LABEL_SCALE[s.labelSize]
  const NAME_FS = BASE_NAME_FS * LABEL_SCALE[s.labelSize]
  const { theta, phi } = lines

  // In the figure's own units: the first line is y = ½ running right, the
  // second passes through (0, −½) tilted φ, and each transversal points up.
  const u1: Vec = [1, 0]
  const u2: Vec = [Math.cos(phi * RAD), Math.sin(phi * RAD)]
  const q2: Vec = [0, -0.5]
  const trans = theta.map((t, i) => {
    const { top, bottom } = crossingsOf(t, phi, i ? lines.shift : 0)
    return { w: [Math.cos(t * RAD), Math.sin(t * RAD)] as Vec, top, bottom }
  })
  // Both lines run past every crossing, so they come out about as long as each other.
  const all = trans.flatMap((t) => [t.top, t.bottom])
  const span = (origin: Vec, u: Vec) => {
    const along = all.map((p) => dot(sub(p, origin), u))
    return [Math.min(...along) - REACH, Math.max(...along) + REACH]
  }
  const [a1, b1] = span([0, 0.5], u1)
  const [a2, b2] = span(q2, u2)
  const raw = {
    lines: [
      [add([0, 0.5], mul(u1, a1)), add([0, 0.5], mul(u1, b1))],
      [add(q2, mul(u2, a2)), add(q2, mul(u2, b2))],
    ] as [Vec, Vec][],
    trans: trans.map((t) => [add(t.bottom, mul(t.w, -REACH * 0.8)), add(t.top, mul(t.w, REACH * 0.8))] as [Vec, Vec]),
  }

  // Turned, then in SVG's y-down coordinates, scaled to fit.
  const turn = s.rotate * RAD
  const dir = ([x, y]: Vec): Vec => [x * Math.cos(turn) - y * Math.sin(turn), -(x * Math.sin(turn) + y * Math.cos(turn))]
  const ends = [...raw.lines, ...raw.trans].flat().map(dir)
  const xs = ends.map((p) => p[0])
  const ys = ends.map((p) => p[1])
  const scale = Math.min(FIT_W / (Math.max(...xs) - Math.min(...xs) || 1), FIT_H / (Math.max(...ys) - Math.min(...ys) || 1))
  const [x0, y0] = [Math.min(...xs), Math.min(...ys)]
  const at = (p: Vec): Vec => {
    const [x, y] = dir(p)
    return [(x - x0) * scale, (y - y0) * scale]
  }
  const way = (v: Vec) => unit(dir(v))

  const segments = [...raw.lines, ...raw.trans].map(([p, q]) => ({ from: at(p), to: at(q) }))

  const moved = readMoved(s.moved)
  const labels: PlacedLabel[] = []
  const boxAt = (box: MathBox, [cx, cy]: Vec) => ({ l: cx - box.w / 2 - 2, r: cx + box.w / 2 + 2, t: cy - (box.asc + box.desc) / 2 - 1, b: cy + (box.asc + box.desc) / 2 + 1 })
  const overlaps = (box: MathBox, c: Vec) => {
    const a = boxAt(box, c)
    return labels.some((l) => {
      const b = boxAt(l.box, [l.cx, l.cy])
      return a.l < b.r && b.l < a.r && a.t < b.b && b.t < a.b
    })
  }
  const place = (part: string, box: MathBox, center: Vec, along: Vec, across: Vec) => {
    const o = moved[part] ?? [0, 0]
    const [cx, cy] = add(center, add(mul(along, o[0]), mul(across, o[1])))
    labels.push({ part, box, cx, cy, x: cx - box.w / 2, y: cy + (box.asc - box.desc) / 2, along, across, offset: o })
  }
  /** Places a label at the first of the spots (each a center and the direction it sits out from) that's clear of the labels so far. */
  const placeClear = (part: string, box: MathBox, spots: { at: Vec; out: Vec }[]) => {
    const spot = spots.find((p) => !overlaps(box, p.at)) ?? spots[0]
    place(part, box, spot.at, spot.out, perp(spot.out))
  }

  const rounded = (v: number) => roundTo(v, s.round)
  function content(k: AngleNo) {
    const mode = s[`a${k}Label`]
    const given = k === 2 || k === 10
    if (mode === 'text') return layoutMath(s[`a${k}Text`], FS)
    if (mode === 'measure' || (mode === 'auto' && given)) {
      const typed = k === 2 ? s.angle.trim() : k === 10 ? s.angle2.trim() : ''
      return layoutMath(typed || rounded(lines.measures[k]!), FS, { suffix: '°' })
    }
    return null
  }

  // Points: where the lines cross first, then one out on every ray, named in that order.
  const dots: Vec[] = []
  const names = pointNameList(s)
  let next = 0
  const point = (p: Vec, spots: (box: MathBox) => { at: Vec; out: Vec }[]) => {
    dots.push(p)
    const name = names[next]
    const id = `pt${LETTERS[next] ?? ''}`
    next++
    const box = name ? layoutMath(name, NAME_FS) : null
    if (box && LETTERS[next - 1]) placeClear(id, box, spots(box))
  }

  // Each crossing's four angles: top left, top right, bottom left, bottom right.
  const arcs: string[] = []
  const shades: { d: string; fill: string }[] = []
  const squares: Vec[][] = []
  const crossings: Vec[] = []
  trans.forEach((t, i) => {
    ;[
      { p: t.top, u: u1 },
      { p: t.bottom, u: u2 },
    ].forEach(({ p, u }, j) => {
      const v = at(p)
      crossings.push(v)
      const [right, up] = [way(u), way(t.w)]
      const [left, down] = [mul(right, -1), mul(up, -1)]
      const quads: [Vec, Vec][] = [[left, up], [right, up], [left, down], [right, down]]
      const ks = quads.map((_, q) => (i * 8 + j * 4 + q + 1) as AngleNo)
      // The crossing's name tucks into its widest angle, before the angles' labels, which make way for it.
      if (s.crossPoints) {
        const widest = ks.reduce((a, b, q) => (lines.measures[b]! > lines.measures[ks[a]]! + 1e-9 ? q : a), 0)
        const out = unit(add(...quads[widest]))
        point(v, (box) => [{ at: add(v, mul(out, 8 + reach(box, out))), out }])
      }
      quads.forEach(([e1, e2], q) => {
        const k = ks[q]
        const measure = lines.measures[k]!
        const sweep = cross(e1, e2) > 0 ? 1 : 0
        const sector = (r: number) => {
          const [a, b] = [add(v, mul(e1, r)), add(v, mul(e2, r))]
          return `M${r1(a[0])},${r1(a[1])} A${r1(r)},${r1(r)} 0 0 ${sweep} ${r1(b[0])},${r1(b[1])}`
        }
        const fill = SHADES[s[`a${k}Shade`]]?.fill
        if (fill) shades.push({ d: `M${r1(v[0])},${r1(v[1])} L${sector(SHADE).slice(1)} Z`, fill })

        const box = content(k)
        const count = s[`a${k}Arcs`]
        let outer = 0
        if (s.square && Math.abs(measure - 90) < 1e-6) {
          if (q === 1) squares.push([add(v, mul(e1, SQUARE)), add(v, add(mul(e1, SQUARE), mul(e2, SQUARE))), add(v, mul(e2, SQUARE))])
          outer = SQUARE * Math.SQRT2
        } else if (count || (box && s.arcs)) {
          for (let n = 0; n < Math.max(1, count); n++) arcs.push(sector(ARC + n * ARC_GAP))
          outer = ARC + (Math.max(1, count) - 1) * ARC_GAP
        }
        if (box) {
          // Far enough in to clear the arc, and to fit between the angle's two rays.
          const mid = unit(add(e1, e2))
          const half = Math.sin((measure * RAD) / 2)
          const toSide = Math.max(...[e1, e2].map((e) => (reach(box, perp(e)) + 3) / half))
          let d = Math.max(outer + 5 + reach(box, mid), toSide, 12 + reach(box, mid))
          // Further out along the angle, to clear a point's name.
          for (let n = 0; n < 12 && overlaps(box, add(v, mul(mid, d))); n++) d += 4
          place(angleId(k), box, add(v, mul(mid, d)), mid, perp(mid))
        }
      })
    })
  })

  // Arrowheads at both ends of every line, pointing out.
  const heads: Vec[][] = []
  if (s.ends) {
    for (const { from, to } of segments) {
      for (const [tip, back] of [[to, from], [from, to]]) {
        const d = unit(sub(tip, back))
        const base = add(tip, mul(d, -HEAD))
        heads.push([add(base, mul(perp(d), HEAD_W)), tip, add(base, mul(perp(d), -HEAD_W))])
      }
    }
  }

  // Parallel arrows halfway between each line's left end and its first crossing.
  const arrows: Vec[][] = []
  if (s.parallel && s.arrows) {
    raw.lines.forEach(([start], j) => {
      const u = j ? u2 : u1
      const origin = j ? q2 : ([0, 0.5] as Vec)
      const first = Math.min(...trans.map((t) => dot(sub(j ? t.bottom : t.top, origin), u)))
      const c = at(mul(add(start, add(origin, mul(u, first))), 0.5))
      // Every arrow points rightward on the page (or down, on an upright line), so the two lines' arrows match.
      let t = way(u)
      if (t[0] < -1e-9 || (Math.abs(t[0]) <= 1e-9 && t[1] < 0)) t = mul(t, -1)
      const n = perp(t)
      for (let a = 0; a < s.arrows; a++) {
        const m = add(c, mul(t, (a - (s.arrows - 1) / 2) * ARROW_GAP))
        const back = add(m, mul(t, -ARROW))
        arrows.push([add(back, mul(n, ARROW_W)), add(m, mul(t, ARROW)), add(back, mul(n, -ARROW_W))])
      }
    })
  }

  // The lines' names just past their right ends, the transversals' past their top ends.
  if (s.names) {
    const named: [string, string, Vec, Vec][] = [
      ['lineA', s.line1, raw.lines[0][1], u1],
      ['lineB', s.line2, raw.lines[1][1], u2],
      ...raw.trans.map((t, i) => [i ? 'transB' : 'transA', i ? s.trans2 : s.trans1, t[1], trans[i].w] as [string, string, Vec, Vec]),
    ]
    for (const [id, name, end, u] of named) {
      const box = name.trim() ? layoutMath(name.trim(), NAME_FS) : null
      if (!box) continue
      const out = way(u)
      place(id, box, add(at(end), mul(out, 8 + reach(box, out))), out, perp(out))
    }
  }

  const beside = (p: Vec, u: Vec) => (box: MathBox) => {
    const n = way(perp(u))
    return [n, mul(n, -1)].map((out) => ({ at: add(p, mul(out, 8 + reach(box, out))), out }))
  }
  if (s.rayPoints) {
    raw.lines.forEach(([start, end], j) => {
      const u = j ? u2 : u1
      const origin = j ? q2 : ([0, 0.5] as Vec)
      const along = trans.map((t) => dot(sub(j ? t.bottom : t.top, origin), u))
      const near = (e: Vec, k: number) => add(add(origin, mul(u, k)), mul(sub(e, add(origin, mul(u, k))), 0.75))
      for (const p of [near(start, Math.min(...along)), near(end, Math.max(...along))]) point(at(p), beside(at(p), u))
    })
    raw.trans.forEach(([start, end], i) => {
      const t = trans[i]
      for (const p of [add(t.top, mul(sub(end, t.top), 0.75)), add(t.bottom, mul(sub(start, t.bottom), 0.75))]) point(at(p), beside(at(p), t.w))
    })
  }

  // The frame holds the lines, their arrowheads, the shading and every label.
  const points: Vec[] = [...segments.flatMap((g) => [g.from, g.to]), ...heads.flat()]
  for (const v of crossings) if (shades.length) points.push(add(v, [-SHADE, -SHADE]), add(v, [SHADE, SHADE]))
  for (const l of labels) points.push([l.cx - l.box.w / 2, l.y - l.box.asc], [l.cx + l.box.w / 2, l.y + l.box.desc])
  const minX = Math.min(...points.map((p) => p[0])) - PAD
  const minY = Math.min(...points.map((p) => p[1])) - PAD
  const maxX = Math.max(...points.map((p) => p[0])) + PAD
  const maxY = Math.max(...points.map((p) => p[1])) + PAD

  return {
    frame: { x: r1(minX), y: r1(minY), w: r1(maxX - minX), h: r1(maxY - minY) },
    segments,
    heads,
    shades,
    arcs,
    squares,
    arrows,
    dots,
    labels,
  }
}

/** Every angle that's drawn: 1–8, and 9–16 with a second transversal. */
export const drawnAngles = (s: Settings) => ANGLES.filter((k) => s.second || k <= 8)

export { DOT }
