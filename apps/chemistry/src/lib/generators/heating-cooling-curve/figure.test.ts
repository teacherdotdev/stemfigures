import { describe, expect, it } from 'vitest'
import { SUBSTANCES } from './curve'
import { buildCurve, fittedAxes, niceRange } from './figure'
import { curveSettings } from './settings'

const build = (query: string) => buildCurve(curveSettings.fromParams(new URLSearchParams(query)))

describe('a heating or cooling curve figure', () => {
  it('draws the default heating curve of water, labeled, with dashed lines at both plateaus', () => {
    const g = build('')
    expect(g.curve).toHaveLength(1)
    expect(g.guides).toHaveLength(2)
    expect(g.segmentLabels.map((l) => l.text)).toEqual(['Solid', 'Melting', 'Liquid', 'Boiling', 'Gas'])
    expect(g.letters).toHaveLength(0)
    expect(g.problems.fit).toBeUndefined()
  })

  it('letters every corner, A to F', () => {
    expect(build('letters=1').letters.map((l) => l.text)).toEqual(['A', 'B', 'C', 'D', 'E', 'F'])
  })

  it('names the changes on a cooling curve’s plateaus, or both states', () => {
    const g = build('direction=cooling&startT=120&endT=-20')
    expect(g.segmentLabels.map((l) => l.text)).toEqual(['Gas', 'Condensing', 'Liquid', 'Freezing', 'Solid'])
    expect(build('plateauLabels=states').segmentLabels[1].text).toBe('Solid + liquid')
  })

  it('leaves blank lines for students to label the segments', () => {
    const g = build('segmentLabels=blank')
    expect(g.segmentLabels).toHaveLength(0)
    expect(g.segmentBlanks).toHaveLength(5)
  })

  it('refuses a heating curve that ends colder than it starts, or a boiling point below melting', () => {
    expect(build('endT=-30').problems.endT).toContain('ends hotter')
    expect(build('substance=custom&bp=-5').problems.bp).toContain('higher than the melting point')
    expect(build('endT=-30').curve).toHaveLength(0)
  })

  it('works a substance’s curve out to scale, and says when it runs off the axis', () => {
    const g = build('source=properties&xQuantity=heat')
    expect(g.end).toBeCloseTo(308.8, 0) // 100 g of ice at −20 °C to steam at 120 °C
    expect(g.problems.fit).toContain('along the x-axis')
    expect(g.rows.map((r) => r.from + r.to)).toEqual(['AB', 'BC', 'CD', 'DE', 'EF'])
  })
})

describe('the substance', () => {
  it('takes a setup’s melting and boiling points, ignoring the custom ones', () => {
    const g = build('substance=ethanol&startT=-140&endT=100&mp=10&bp=20&yFrom=-140&yTo=100&yStep=20&pointLabels=values')
    expect(g.pointLabels.map((l) => l.text)).toEqual(['−114.1 °C', '78.3 °C'])
    expect(g.guides).toHaveLength(2)
  })

  it('takes the teacher’s own points when custom', () => {
    const g = build('substance=custom&mp=20&bp=60&startT=0&endT=80&yFrom=0&yTo=80&pointLabels=names')
    expect(g.pointLabels.map((l) => l.text)).toEqual(['m.p.', 'b.p.'])
    expect(build('substance=custom&mp=20&bp=60&direction=cooling&startT=80&endT=0&pointLabels=names&yFrom=0&yTo=80')
      .pointLabels.map((l) => l.text)).toEqual(['b.p.', 'f.p.'])
    expect(build('substance=custom&mp=20&bp=60&startT=0&endT=80&yFrom=0&yTo=80&pointLabels=blank').pointBlanks).toHaveLength(2)
  })

  it('works a setup’s curve out to scale from its own properties', () => {
    // 100 g of ethanol from −140 to 100 °C: 2.51 + 10.79 + 46.95 + 83.70 + 3.08 kJ
    const g = build('substance=ethanol&startT=-140&endT=100&source=properties&xQuantity=heat')
    expect(g.end).toBeCloseTo(147.03, 1)
  })

  it('has setups that each run through all five segments', () => {
    for (const sub of SUBSTANCES) {
      expect(sub.from, sub.id).toBeLessThan(sub.mp)
      expect(sub.bp, sub.id).toBeGreaterThan(sub.mp)
      expect(sub.to, sub.id).toBeGreaterThan(sub.bp)
      const s = curveSettings.tidy({ ...curveSettings.defaults, substance: sub.id, startT: sub.from, endT: sub.to })
      const g = buildCurve({ ...s, ...fittedAxes(s) })
      expect(g.rows, sub.id).toHaveLength(5)
      expect(g.problems.fit, sub.id).toBeUndefined()
    }
  })
})

describe('fitting an axis', () => {
  it('counts in tidy steps', () => {
    expect(niceRange(0, 308.8, true)).toEqual([0, 320, 20])
    expect(niceRange(-20, 120)).toEqual([-20, 120, 10])
    expect(niceRange(0, 20, true)).toEqual([0, 20, 1])
  })
})
