// Heating and Cooling Curve's address parameters, for /linking and
// /llms.txt. The grid and axis fields come from $shared/graph, whose fields
// don't say what values they take, so those are said here from the same lists.

import { CAPS } from '$shared/graph/caps'
import { EVERY, LABEL_MODES, MINOR, TITLE_MODES } from '$shared/graph/axes'
import { LABEL_SIZES } from '$shared/labelSize'
import { describeLinking, type ParamDoc } from '$lib/linking/define'
import type { FieldAbout } from '$lib/shared/settings'
import { curveSettings } from './settings'

/** The most characters $shared's text() keeps. */
const SHARED_TEXT: FieldAbout = { type: 'text', maxLength: 120 }
const titleModes: FieldAbout = { type: 'choice', options: TITLE_MODES }
const TITLE_MODE_WORDS = 'text: the words given; blank: a blank line for students to write on; none: nothing'
const labelModes: FieldAbout = { type: 'choice', options: LABEL_MODES }
const caps: FieldAbout = { type: 'choice', options: Object.keys(CAPS) }
const every: FieldAbout = { type: 'choice', options: EVERY.map(String) }
const range = (axis: 'x' | 'y', end: string, unit: string): ParamDoc => ({
  what: `The ${axis}-axis’s ${end}, ${unit}, written as a plain number (e.g. 0, 2.5).`,
  about: SHARED_TEXT,
})
const cap = (axis: 'x' | 'y', end: string): ParamDoc => ({ what: `How the ${axis}-axis’s ${end} end is finished.`, about: caps })
const LENGTHS = 'source=lengths, and the curve passes through this segment'

export const curveLinking = describeLinking(curveSettings, {
  id: 'heating-cooling-curve',
  summary:
    'A graph of a substance’s temperature in °C (up the side) as it is heated or cooled steadily, against the time or the heat added or removed (along the bottom). Each phase warms or cools in a sloped segment and each phase change is a flat plateau. Segment lengths are either typed (source=lengths) or worked out from the substance’s properties (source=properties).',
  notes: [
    'The curve runs from startT to endT and has only the segments those pass through: solid, melting, liquid, boiling and gas when heating, in the opposite order when cooling. A heating curve must end hotter than it starts, a cooling curve colder, and bp must be above mp, or nothing is drawn.',
    'With source=lengths (the default) each segment is as long along the x-axis as solidW, meltW, liquidW, boilW and gasW say. The properties are ignored.',
    'With source=properties each sloped segment takes q = m·c·ΔT and each plateau q = n·ΔH, from mass, cSolid, cLiquid, cGas, fusH, vapH and molarMass, so the curve is to scale. With xQuantity=time the heat is turned into minutes at rate kJ per minute; with xQuantity=heat the x-axis is the heat in kJ.',
    'The defaults are water (mp 0 °C, bp 100 °C) heated from −20 to 120 °C, with OpenStax Chemistry 2e’s properties for water and 100 g heated at 10 kJ per minute.',
    'The x-axis title is not changed by the link: with xQuantity=heat also set xTitle, e.g. “Heat added (kJ)”. The axes are not fitted to the curve either: set xTo (and the y range) so the whole curve is on the grid.',
    'Axis ranges are text holding plain numbers. From xFrom to xTo counting by xStep makes the gridlines, at most 50 blocks per axis.',
  ],
  params: {
    direction: { what: 'Whether the substance is heated or cooled.' },
    source: { what: 'What the segment lengths come from.', values: 'properties: worked out from the substance’s properties, to scale; lengths: typed' },
    xQuantity: { what: 'What runs along the x-axis.', values: 'time: minutes, at a steady rate; heat: the heat added or removed, in kJ' },
    startT: { what: 'The temperature the curve starts at, in °C.' },
    endT: { what: 'The temperature the curve ends at, in °C.' },
    mp: { what: 'The melting (and freezing) point, in °C.' },
    bp: { what: 'The boiling (and condensation) point, in °C.' },
    mass: { what: 'The sample’s mass, in g.', when: 'source=properties' },
    rate: { what: 'The heat added or removed each minute, in kJ.', when: 'source=properties and xQuantity=time' },
    cSolid: { what: 'The solid’s specific heat, in J/(g·°C).', when: 'source=properties' },
    cLiquid: { what: 'The liquid’s specific heat, in J/(g·°C).', when: 'source=properties' },
    cGas: { what: 'The gas’s specific heat, in J/(g·°C).', when: 'source=properties' },
    fusH: { what: 'The enthalpy of fusion, in kJ/mol.', when: 'source=properties' },
    vapH: { what: 'The enthalpy of vaporization, in kJ/mol.', when: 'source=properties' },
    molarMass: { what: 'The molar mass, in g/mol, for the plateaus’ moles.', when: 'source=properties' },
    solidW: { what: 'How long the solid segment is along the x-axis.', when: LENGTHS },
    meltW: { what: 'How long the melting (freezing) plateau is along the x-axis.', when: LENGTHS },
    liquidW: { what: 'How long the liquid segment is along the x-axis.', when: LENGTHS },
    boilW: { what: 'How long the boiling (condensing) plateau is along the x-axis.', when: LENGTHS },
    gasW: { what: 'How long the gas segment is along the x-axis.', when: LENGTHS },
    supercool: { what: 'Whether the liquid cools past its freezing point before it freezes, then warms back up to it.', when: 'direction=cooling and the curve freezes' },
    supercoolBy: { what: 'How far below the freezing point the liquid cools, in °C.', when: 'supercool=1' },
    letters: { what: 'Whether the start of the curve and the end of each segment are lettered A, B, C…' },
    segmentLabels: { what: 'What each segment is labeled with.', values: 'states: its state; blank: a blank line for students; none: nothing' },
    plateauLabels: {
      what: 'What a plateau is labeled with.',
      when: 'segmentLabels=states',
      values: 'states: both states (Solid + liquid); change: the change (Melting, Boiling, Freezing, Condensing)',
    },
    guides: { what: 'Whether dashed lines run from each plateau across to the temperature axis.' },
    color: { what: 'The curve’s color.' },
    xFrom: range('x', 'start', 'in minutes or kJ'),
    xTo: range('x', 'end', 'in minutes or kJ'),
    xStep: range('x', 'gridline spacing', 'in minutes or kJ'),
    yFrom: range('y', 'start', 'in °C'),
    yTo: range('y', 'end', 'in °C'),
    yStep: range('y', 'gridline spacing', 'in °C'),
    xEvery: { what: 'Number every nth x gridline; 0 leaves the x-axis unnumbered.', about: every },
    yEvery: { what: 'Number every nth y gridline; 0 leaves the y-axis unnumbered.', about: every },
    title: { what: 'The chart title’s words.', when: 'titleMode=text', about: SHARED_TEXT },
    titleMode: { what: 'The chart title across the top.', about: titleModes, values: TITLE_MODE_WORDS },
    xTitle: { what: 'The x-axis title’s words.', when: 'xTitleMode=text', about: SHARED_TEXT },
    xTitleMode: { what: 'The x-axis title.', about: titleModes, values: TITLE_MODE_WORDS },
    yTitle: { what: 'The y-axis title’s words.', when: 'yTitleMode=text', about: SHARED_TEXT },
    yTitleMode: { what: 'The y-axis title.', about: titleModes, values: TITLE_MODE_WORDS },
    xLabel: { what: 'The letter at the end of the x-axis.', when: 'xLabelMode=text', about: SHARED_TEXT },
    xLabelMode: { what: 'Whether the x-axis has a letter at its end.', about: labelModes },
    yLabel: { what: 'The letter at the end of the y-axis.', when: 'yLabelMode=text', about: SHARED_TEXT },
    yLabelMode: { what: 'Whether the y-axis has a letter at its end.', about: labelModes },
    xStartCap: cap('x', 'left'),
    xEndCap: cap('x', 'right'),
    yStartCap: cap('y', 'bottom'),
    yEndCap: cap('y', 'top'),
    minor: { what: 'Minor gridlines: how many parts each grid block is split into; 0 for none.', about: { type: 'choice', options: MINOR.map(String) } },
    labelSize: { what: 'How big the figure’s text is compared to its lines.', about: { type: 'choice', options: Object.keys(LABEL_SIZES) } },
  },
  examples: [
    { shows: 'Water heated from ice at −20 °C to steam at 120 °C, its corners lettered A to F and each segment labeled with its state.', settings: { letters: true } },
    {
      shows: 'Water cooled from steam at 120 °C to ice at −20 °C, its plateaus labeled Condensing and Freezing.',
      settings: { direction: 'cooling', startT: 120, endT: -20, plateauLabels: 'change' },
    },
    {
      shows: 'The heating curve of 100 g of ice at −20 °C to steam at 120 °C against the heat added, to scale, with blank lines for students to label the segments.',
      settings: { source: 'properties', xQuantity: 'heat', xTo: '320', xStep: '20', xEvery: 2, xTitle: 'Heat added (kJ)', segmentLabels: 'blank' },
    },
  ],
})
