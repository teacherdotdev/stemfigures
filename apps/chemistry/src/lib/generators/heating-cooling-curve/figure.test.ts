import { describe, expect, it } from 'vitest'
import { buildCurve, niceRange } from './figure'
import { curveSettings } from './settings'

const build = (query: string) => buildCurve(curveSettings.fromParams(new URLSearchParams(query)))

describe('a heating or cooling curve figure', () => {
  it('draws the default heating curve of water, labeled, with dashed lines at both plateaus', () => {
    const g = build('')
    expect(g.curve).toHaveLength(1)
    expect(g.guides).toHaveLength(2)
    expect(g.segmentLabels.map((l) => l.text)).toEqual(['Solid', 'Solid + liquid', 'Liquid', 'Liquid + gas', 'Gas'])
    expect(g.letters).toHaveLength(0)
    expect(g.problems.fit).toBeUndefined()
  })

  it('letters every corner, A to F', () => {
    expect(build('letters=1').letters.map((l) => l.text)).toEqual(['A', 'B', 'C', 'D', 'E', 'F'])
  })

  it('names the changes on a cooling curve’s plateaus', () => {
    const g = build('direction=cooling&startT=120&endT=-20&plateauLabels=change')
    expect(g.segmentLabels.map((l) => l.text)).toEqual(['Gas', 'Condensing', 'Liquid', 'Freezing', 'Solid'])
  })

  it('leaves blank lines for students to label the segments', () => {
    const g = build('segmentLabels=blank')
    expect(g.segmentLabels).toHaveLength(0)
    expect(g.segmentBlanks).toHaveLength(5)
  })

  it('refuses a heating curve that ends colder than it starts, or a boiling point below melting', () => {
    expect(build('endT=-30').problems.endT).toContain('ends hotter')
    expect(build('bp=-5').problems.bp).toContain('higher than the melting point')
    expect(build('endT=-30').curve).toHaveLength(0)
  })

  it('works a substance’s curve out to scale, and says when it runs off the axis', () => {
    const g = build('source=properties&xQuantity=heat')
    expect(g.end).toBeCloseTo(308.8, 0) // 100 g of ice at −20 °C to steam at 120 °C
    expect(g.problems.fit).toContain('along the x-axis')
    expect(g.rows.map((r) => r.from + r.to)).toEqual(['AB', 'BC', 'CD', 'DE', 'EF'])
  })
})

describe('fitting an axis', () => {
  it('counts in tidy steps', () => {
    expect(niceRange(0, 308.8, true)).toEqual([0, 320, 20])
    expect(niceRange(-20, 120)).toEqual([-20, 120, 10])
    expect(niceRange(0, 20, true)).toEqual([0, 20, 1])
  })
})
