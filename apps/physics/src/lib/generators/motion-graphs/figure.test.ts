import { describe, expect, test } from 'vitest'
import { CELL } from '$shared/graph/grid'
import { buildMotion, fitAxes } from './figure'
import { motionOf, positionAt } from './motion'
import { motionSettings, newSegment, type MotionSettings } from './settings'

const from = (query: string) => buildMotion(motionSettings.fromParams(new URLSearchParams(query)))
const make = (over: Partial<MotionSettings> = {}) => buildMotion({ ...motionSettings.defaults, ...over })

/** A panel's point in the graph's own numbers, from the drawing (undoing layoutGrid's px). */
function reader(p: ReturnType<typeof make>['panels'][number]) {
  const g = p.layout.grid
  const { x, y } = p.axes
  return (pt: { x: number; y: number }) => ({ t: x.start + ((pt.x - g.x) / CELL) * x.step, v: y.start + ((g.y + g.h - pt.y) / CELL) * y.step })
}

describe('the settings', () => {
  test('keep the segments in the page address, and read them back', () => {
    const s = { ...motionSettings.defaults, segments: [newSegment({ kind: 'faster', size: 'fast', duration: 6, dir: 'back' }), newSegment({ kind: 'rest' })] }
    const query = motionSettings.toQuery(s)
    expect(query).toBe('segments=faster%2Cfast%2C6%2Cback%3Brest')
    expect(motionSettings.fromParams(new URLSearchParams(query)).segments).toEqual(s.segments)
  })

  test('hold up to six segments, each 1 to 10 s', () => {
    const s = motionSettings.fromParams(new URLSearchParams(`segments=${Array(8).fill('forward,slow,40').join(';')}`))
    expect(s.segments).toHaveLength(6)
    expect(s.segments[0].duration).toBe(10)
  })
})

describe('the graphs', () => {
  test('one by default, the position–time graph; all three stacked on the same time axis', () => {
    expect(make().panels.map((p) => p.view)).toEqual(['x'])
    const f = from('graphs=all')
    expect(f.panels.map((p) => p.view)).toEqual(['x', 'v', 'a'])
    // Lined up on their grids' left edges, the same width, one under the next.
    const left = f.panels.map((p) => p.at.x + p.layout.grid.x)
    expect(new Set(left).size).toBe(1)
    expect(new Set(f.panels.map((p) => p.layout.grid.w)).size).toBe(1)
    for (let i = 1; i < 3; i++) expect(f.panels[i].at.y).toBeGreaterThanOrEqual(f.panels[i - 1].at.y + f.panels[i - 1].layout.height)
  })

  test('only the bottom graph has the time axis title', () => {
    const f = from('graphs=all')
    const flat = f.titles.filter((t) => !t.rotate)
    expect(flat).toHaveLength(1)
    expect(flat[0].y).toBeGreaterThan(f.panels[2].at.y)
    expect(f.titles.filter((t) => t.rotate).map((t) => t.text)).toEqual(['Position (m)', 'Velocity (m/s)', 'Acceleration (m/s^2)'])
  })

  test('fit the motion: every value is on the grid, from 0 to the end of the motion', () => {
    const s = { ...motionSettings.defaults, segments: [newSegment({ kind: 'back', size: 'fast', duration: 5 }), newSegment({ kind: 'faster', duration: 4 })], start: 10 }
    const m = motionOf(s.segments, s.start)
    for (const view of ['x', 'v', 'a'] as const) {
      const fit = fitAxes(m, view, 8)
      expect(Number(fit.xTo)).toBeGreaterThanOrEqual(m.end)
      for (const p of m.pieces) {
        const values = view === 'x' ? [p.x0, p.x1] : view === 'v' ? [p.v0, p.v1] : [p.a]
        for (const v of values) {
          expect(v).toBeGreaterThanOrEqual(Number(fit.yFrom))
          expect(v).toBeLessThanOrEqual(Number(fit.yTo))
        }
      }
    }
  })

  test('draw each segment of the position–time graph as the exact parabola', () => {
    const f = make()
    const read = reader(f.panels[0])
    const m = f.motion
    f.panels[0].lines.forEach((line, i) => {
      const p = m.pieces[i]
      const nums = line.d.match(/-?[\d.]+/g)!.map(Number)
      const [a, , b] = p.a ? [{ x: nums[0], y: nums[1] }, { x: nums[2], y: nums[3] }, { x: nums[4], y: nums[5] }] : [{ x: nums[0], y: nums[1] }, null, { x: nums[2], y: nums[3] }]
      expect(read(a).t).toBeCloseTo(p.t0, 1)
      expect(read(a).v).toBeCloseTo(p.x0, 1)
      expect(read(b).t).toBeCloseTo(p.t1, 1)
      expect(read(b).v).toBeCloseTo(p.x1, 1)
      if (p.a) {
        // The Bézier's middle is the parabola's middle.
        const c = { x: nums[2], y: nums[3] }
        const mid = { x: (a.x + 2 * c.x + b.x) / 4, y: (a.y + 2 * c.y + b.y) / 4 }
        expect(read(mid).v).toBeCloseTo(positionAt(m, (p.t0 + p.t1) / 2), 1)
      }
    })
  })

  test('join a jump in velocity with a dotted line, and never one in position', () => {
    const f = from('graphs=all&segments=forward,medium,3;rest,medium,2;back')
    const [x, v, a] = f.panels
    expect(x.joins).toEqual([])
    expect(v.joins).toHaveLength(2)
    // Every segment is a constant velocity, so acceleration is zero throughout.
    expect(a.joins).toEqual([])
    const read = reader(v)
    const j = v.joins[0]
    expect([read({ x: j.x1, y: j.y1 }).v, read({ x: j.x2, y: j.y2 }).v].map((n) => Math.round(n))).toEqual([4, 0])
  })

  test('in each segment’s own line style when asked', () => {
    expect(new Set(make().panels[0].lines.map((l) => l.dash)).size).toBe(1)
    const styled = make({ styles: true }).panels[0].lines
    expect(new Set(styled.map((l) => l.dash)).size).toBe(styled.length)
  })
})

describe('letters', () => {
  test('mark every boundary on every graph, A to one past the last segment', () => {
    const f = from('graphs=all&letters=1')
    for (const p of f.panels) expect(p.letters.map((l) => l.text).join('')).toBe('ABCDE')
  })

  test('sit on a dot where the line runs on, and beside the join where it jumps', () => {
    const f = from('graphs=all&letters=1&segments=forward,medium,3;rest,medium,2;back')
    expect(f.panels[0].dots).toHaveLength(4)
    // Velocity jumps at B and C, so only A and D have dots.
    expect(f.panels[1].dots).toHaveLength(2)
  })

  test('keep off the lines and each other', () => {
    const f = make({ letters: true })
    const boxes = f.panels[0].letters.map((l) => ({ x0: l.x - 12, x1: l.x + 12, y0: l.y - 14, y1: l.y + 4 }))
    for (let i = 1; i < boxes.length; i++) {
      const a = boxes[i - 1]
      const b = boxes[i]
      expect(a.x0 < b.x1 && b.x0 < a.x1 && a.y0 < b.y1 && b.y0 < a.y1, `${i}`).toBe(false)
    }
  })

  test('are off unless asked for', () => {
    expect(make().panels[0].letters).toEqual([])
  })
})

describe('the tangent', () => {
  test('touches the position–time graph with the velocity there as its slope', () => {
    const f = from('segments=faster,fast,6&tangent=1&tangentAt=4')
    const p = f.panels[0]
    const read = reader(p)
    const t = p.tangent!
    expect(read(t.at).t).toBeCloseTo(4, 2)
    expect(read(t.at).v).toBeCloseTo(8, 2)
    const a = read({ x: t.line.x1, y: t.line.y1 })
    const b = read({ x: t.line.x2, y: t.line.y2 })
    expect((b.v - a.v) / (b.t - a.t)).toBeCloseTo(4, 1)
  })

  test('is only on a position–time graph', () => {
    expect(from('graphs=vt&tangent=1').panels[0].tangent).toBeNull()
    expect(from('graphs=all&tangent=1').panels.map((p) => !!p.tangent)).toEqual([true, false, false])
  })
})

describe('numbers and gridlines', () => {
  test('hiding the numbers leaves only the shape', () => {
    const f = make({ numbers: false })
    expect(f.panels[0].layout.numbers).toEqual([])
    expect(f.panels[0].layout.vLines.length).toBeGreaterThan(0)
  })

  test('without gridlines, the axes have arrows, and tick marks where the numbers are', () => {
    const f = make({ gridlines: false })
    const p = f.panels[0]
    expect(p.layout.vLines).toEqual([])
    expect(p.layout.hLines).toEqual([])
    expect(p.grid.xEndCap).toBe('triangle')
    expect(p.ticks.length).toBeGreaterThan(0)
    expect(make({ gridlines: false, numbers: false }).panels[0].ticks).toEqual([])
  })
})

describe('titles', () => {
  test('a chart title on top, written or a blank line', () => {
    expect(make().chartTitle).toBeNull()
    expect(make({ title: { mode: 'text', text: 'A cart' } }).chartTitle?.text).toBe('A cart')
    expect(make({ title: { mode: 'blank', text: '' } }).chartBlank).not.toBeNull()
  })

  test('an axis title left blank is a line for students; one turned off is gone', () => {
    const blank = make({ xTitle: { mode: 'blank', text: 'Position (m)' } })
    expect(blank.titles.filter((t) => t.rotate)).toEqual([])
    expect(blank.panels[0].layout.blanks).toHaveLength(1)
    expect(make({ timeTitle: { mode: 'none', text: 'Time (s)' } }).titles.filter((t) => !t.rotate)).toEqual([])
  })
})
