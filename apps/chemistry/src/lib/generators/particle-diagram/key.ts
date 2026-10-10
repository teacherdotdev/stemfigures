// The key beside the box: a bordered list headed "Key", one line per particle
// kind drawn exactly as in the box and followed by the name the teacher
// typed, with an optional note line at the bottom. Names and the note can
// have subscripts and superscripts (./keyText.ts). Also where the box and key
// sit in the figure for each Show setting. See CONTEXT.md "Key".

import { plainText, textRuns } from './keyText'
import { describeParticle, discBounds, particleDiscs, type Disc, type ParticleKind } from './particles'
import { BOX_SIDE, type BoxContents, type Show } from './settings'

/** Space inside the key's border. */
export const KEY_PAD = 12
/** Space between the drawings and the names. */
export const NAME_GAP = 12
/** Space between the box and the key. */
export const KEY_GAP = 24

const FONT_SIZE = 16
const HEADING_SIZE = 17
const NOTE_SIZE = 14
/** Height kept for a line of text: the heading, a name or the note. */
const TEXT_H = 20
const LINE_GAP = 10

/** About how wide text is set in Arial. The server can't measure text, so
 *  the key is sized from this: roughly 0.55 of the font size per character. */
export const textWidth = (text: string, fontSize: number) => 0.55 * fontSize * [...text].length

/** A subscript's or superscript's size as a share of its text's. */
export const SCRIPT = 0.7
/** How far a subscript drops and a superscript rises, as a share of the
 *  text's size. */
const SHIFT = { sub: 0.3, super: -0.4 }

/** A piece of key text as drawn: its size, and how far it moves up or down
 *  from the piece before (back to the line after a subscript, say). */
export interface Span {
  text: string
  size: number
  dy: number
}

/** Key text as pieces to draw at `size`. Plain text is one piece. */
export function textSpans(text: string, size: number): Span[] {
  let offset = 0
  return textRuns(text).map((run) => {
    const target = run.shift ? SHIFT[run.shift] * size : 0
    const dy = target - offset
    offset = target
    return { text: run.text, size: run.shift ? size * SCRIPT : size, dy }
  })
}

/** About how wide pieces of text are, each at its own size. */
export const spansWidth = (spans: Span[]) => spans.reduce((w, s) => w + textWidth(s.text, s.size), 0)

export interface KeyLine {
  name: string
  spans: Span[]
  /** the kind's discs, placed in the key */
  discs: Disc[]
  nameX: number
  nameY: number
}

export interface KeyLayout {
  width: number
  height: number
  headingY: number
  fontSize: number
  headingSize: number
  noteSize: number
  lines: KeyLine[]
  note?: { text: string; spans: Span[]; x: number; y: number }
}

/** The key laid out from (0, 0). Each drawing is centered in a column as
 *  wide as the widest one, and on its name, which all start after it. Text
 *  y values are the middle of the line. */
export function keyLayout(kinds: ParticleKind[], note: string): KeyLayout {
  const drawings = kinds.map((kind) => {
    const discs = particleDiscs(kind)
    return { kind, discs, bounds: discBounds(discs) }
  })
  const drawW = Math.max(...drawings.map(({ bounds: b }) => b.right - b.left))
  const nameX = KEY_PAD + drawW + NAME_GAP

  const headingY = KEY_PAD + TEXT_H / 2
  let y = KEY_PAD + TEXT_H + LINE_GAP
  const lines = drawings.map(({ kind, discs, bounds: b }) => {
    const lineH = Math.max(b.bottom - b.top, TEXT_H)
    const middle = y + lineH / 2
    const dx = KEY_PAD + drawW / 2 - (b.left + b.right) / 2
    const dy = middle - (b.top + b.bottom) / 2
    y += lineH + LINE_GAP
    const name = kind.name ?? ''
    return { name, spans: textSpans(name, FONT_SIZE), discs: discs.map((d) => ({ ...d, x: d.x + dx, y: d.y + dy })), nameX, nameY: middle }
  })

  const noteText = note.trim()
  let noteLine: KeyLayout['note']
  if (noteText) {
    noteLine = { text: noteText, spans: textSpans(noteText, NOTE_SIZE), x: KEY_PAD, y: y + TEXT_H / 2 }
    y += TEXT_H + LINE_GAP
  }

  const content = Math.max(
    textWidth('Key', HEADING_SIZE),
    drawW + NAME_GAP + Math.max(...lines.map((l) => spansWidth(l.spans))),
    noteLine ? spansWidth(noteLine.spans) : 0,
  )
  return {
    width: Math.ceil(2 * KEY_PAD + content),
    height: y - LINE_GAP + KEY_PAD,
    headingY,
    fontSize: FONT_SIZE,
    headingSize: HEADING_SIZE,
    noteSize: NOTE_SIZE,
    lines,
    note: noteLine,
  }
}

/** The least space between a before box and its after box, for the arrow. */
export const ARROW_GAP = 72
/** Space between the arrow's ends, or its label's, and the boxes. */
export const ARROW_PAD = 14
const ARROW_LABEL_SIZE = 15

export interface ArrowLayout {
  /** the space between the boxes */
  gap: number
  /** the label over the arrow, with subscripts and superscripts like key names */
  spans: Span[]
  labelSize: number
}

/** The arrow between a before box and its after box: the usual gap, or one
 *  wide enough for its label. */
export function arrowLayout(label: string): ArrowLayout {
  const spans = textSpans(label.trim(), ARROW_LABEL_SIZE)
  return { gap: Math.max(ARROW_GAP, Math.ceil(spansWidth(spans)) + 2 * ARROW_PAD), spans, labelSize: ARROW_LABEL_SIZE }
}

/** The size of what the figure shows for its box: the box, or both boxes
 *  with `gap` between them for the arrow. */
export const boxesSize = (box: BoxContents, gap = ARROW_GAP) => ({ width: box.after ? 2 * box.width + gap : box.width, height: box.height })

type Place = { x: number; y: number }

export interface FigureLayout {
  width: number
  height: number
  /** where the box's top left corner goes, when it's shown */
  box?: Place
  /** where the key's top left corner goes, when it's shown */
  key?: Place
}

type Size = { width: number; height: number }

/** The figure's size and where the box and key go in it for a Show
 *  setting. With both, the key is to the right of the box and the two are
 *  centered on each other; whichever is taller sets the height. The box is
 *  the scattered square unless a lattice's box is given. */
export function figureLayout(show: Show, key: Size, box: Size = { width: BOX_SIDE, height: BOX_SIDE }): FigureLayout {
  if (show === 'box') return { width: box.width, height: box.height, box: { x: 0, y: 0 } }
  if (show === 'key') return { width: key.width, height: key.height, key: { x: 0, y: 0 } }
  const height = Math.max(box.height, key.height)
  return {
    width: box.width + KEY_GAP + key.width,
    height,
    box: { x: 0, y: (height - box.height) / 2 },
    key: { x: box.width + KEY_GAP, y: (height - key.height) / 2 },
  }
}

/** The key as read by a screen reader, e.g. "Key: large light gray − ion,
 *  “Any negative ion”; small white + ion. H₂O molecules are not shown",
 *  starting with `lead`. */
export function keyLabel(kinds: ParticleKind[], note: string, lead = 'Key') {
  const lines = kinds.map((k) => `${describeParticle(k)}${k.name ? `, “${plainText(k.name)}”` : ''}`)
  return `${lead}: ${lines.join('; ')}${note.trim() ? `. ${plainText(note.trim())}` : ''}`
}
