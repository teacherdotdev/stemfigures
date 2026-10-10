// Example figures: real figures from each generator, each with its own page
// (/<generator>/examples/<slug>) and a PNG in static/examples/, so search
// engines can index them as images. Each is the generator's own settings, so
// "Edit this figure" opens exactly the figure shown.
//
// After adding or changing one, redo the pictures with
// scripts/snapshot-examples.mjs (see the app's README). The first example of
// each generator is also its social card (static/og/<generator>.png).
//
// Captions say only what the figure shows; answer keys come from the
// generators' own logic (./details.server.ts), never typed here.

import { CATALOG } from '$shared/catalog/index'
import type { Force } from '$lib/generators/free-body-diagram/settings'
import type { Segment } from '$lib/generators/motion-graphs/settings'
import type { Vector } from '$lib/generators/vector-diagram/settings'
import type { Label } from '$lib/shared/label'
import { SITE_ID } from '$lib/site/config'
import sizes from './sizes.json'
import type { Example, ExampleGeneratorId, ExampleSpec } from './types'

const SIZES = sizes as Record<string, number[]>

/** A generator's examples, or none while it is turned off (see $shared/catalog). */
function examplesOf<G extends ExampleGeneratorId>(generator: G, specs: ExampleSpec<G>[]): Example[] {
  if (!CATALOG.some((g) => g.site === SITE_ID && g.id === generator)) return []
  return specs.map((spec) => {
    const image = `/examples/${generator}/${spec.slug}.png`
    const [width, height] = SIZES[image] ?? [0, 0]
    return { ...spec, generator, settings: spec.settings as Record<string, unknown>, path: `/${generator}/examples/${spec.slug}`, image, width, height }
  })
}

// Labels are written as in a page address: F_N is F with N below it, theta is θ, 30deg is 30°.
const text = (t: string): Label => ({ mode: 'text', text: t })
const blank = (t: string): Label => ({ mode: 'blank', text: t })

/** A Free Body Diagram force, with its other fields at their defaults. */
const force = (angle: number, length: number, label: string, more: Partial<Force> = {}): Force => ({
  angle,
  length,
  label: text(label),
  arc: false,
  from: 'h',
  arcLabel: text('theta'),
  parts: false,
  xLabel: text('F_x'),
  yLabel: text('F_y'),
  ...more,
})

/** A Motion Graphs segment. */
const segment = (kind: Segment['kind'], size: Segment['size'], duration: number, dir: Segment['dir'] = 'forward'): Segment => ({ kind, size, duration, dir })

/** A Vector Diagram vector, with its other fields at their defaults. */
const vector = (magnitude: number, angle: number, label: string, more: Partial<Vector> = {}): Vector => ({
  magnitude,
  angle,
  label: text(label),
  style: 'solid',
  arc: false,
  from: 'h',
  arcLabel: text('theta'),
  parts: false,
  xLabel: text('A_x'),
  yLabel: text('A_y'),
  ...more,
})

export const EXAMPLES: Example[] = [
  ...examplesOf('free-body-diagram', [
    {
      slug: 'free-body-diagram-box-pushed-across-floor-with-friction',
      title: 'Free body diagram of a box pushed across a floor with friction',
      alt: 'A free body diagram of a block with four forces: F_g down, F_N up, F_A to the right and a shorter F_f to the left, with a dashed velocity arrow v to the right',
      caption:
        'A block with four forces drawn from its middle: gravity F_g straight down, the normal force F_N straight up, an applied force F_A to the right and a shorter friction force F_f to the left. A dashed velocity arrow v beside the block points to the right, the way the box slides. There is no floor or hand in the figure, only the forces on the box.',
      settings: {
        body: 'block',
        forces: [force(270, 1, 'F_g'), force(90, 1, 'F_N'), force(0, 1, 'F_A'), force(180, 0.6, 'F_f')],
        velocity: true,
      },
    },
    {
      slug: 'free-body-diagram-block-sliding-down-incline-with-friction',
      title: 'Free body diagram of a block sliding down an incline with friction',
      alt: 'A free body diagram of a block with F_g straight down, F_N tilted 30° from the vertical and marked θ, and F_f pointing up the slope, with a dashed velocity arrow down the slope',
      caption:
        'A block sliding down a ramp that rises to the right at 30°, drawn without the ramp. Gravity F_g points straight down; the normal force F_N points up and to the left, square to the slope, with an angle mark θ between it and the dashed vertical; friction F_f points up the slope. A dashed velocity arrow v points down the slope.',
      settings: {
        body: 'block',
        forces: [force(270, 1, 'F_g'), force(120, 0.85, 'F_N', { arc: true, from: 'v' }), force(30, 0.5, 'F_f')],
        velocity: true,
        velocityAngle: 210,
      },
    },
    {
      slug: 'free-body-diagram-sign-hanging-from-two-cables',
      title: 'Free body diagram of a sign hanging from two cables',
      alt: 'A free body diagram of a dot with tensions T_1 and T_2 pulling up and out at θ above the horizontal on each side, and F_g straight down',
      caption:
        'A dot with three forces: tensions T_1 up and to the left and T_2 up and to the right, each 30° above the horizontal and marked θ from a dashed horizontal line, and the weight F_g straight down. All three are drawn the same length.',
      settings: {
        forces: [force(150, 1, 'T_1', { arc: true }), force(30, 1, 'T_2', { arc: true }), force(270, 1, 'F_g')],
      },
    },
    {
      slug: 'free-body-diagram-falling-ball-with-air-resistance',
      title: 'Free body diagram of a falling ball with air resistance',
      alt: 'A free body diagram of a ball with a long F_g arrow down and a shorter F_air arrow up, beside dashed v and a arrows pointing down',
      caption:
        'A ball falling through the air, with gravity F_g straight down and a shorter air resistance force F_air straight up. Beside it, dashed arrows show its velocity v and acceleration a, both pointing down.',
      settings: {
        body: 'ball',
        forces: [force(270, 1, 'F_g'), force(90, 0.5, 'F_{air}')],
        velocity: true,
        velocityAngle: 270,
        acceleration: true,
        accelerationAngle: 270,
      },
    },
    {
      slug: 'free-body-diagram-sled-pulled-at-an-angle',
      title: 'Free body diagram of a sled pulled at an angle',
      alt: 'A free body diagram of a block pulled by F_A at θ above the horizontal, with F_g down, a shorter F_N up and F_f to the left',
      caption:
        'A block pulled by a rope, with the applied force F_A pointing up and to the right at 35° above the horizontal, its angle marked θ from a dashed horizontal line. Gravity F_g points down, friction F_f to the left, and the normal force F_N up, drawn shorter than F_g.',
      settings: {
        body: 'block',
        forces: [
          force(270, 1, 'F_g'),
          force(90, 0.6, 'F_N'),
          force(180, 0.5, 'F_f'),
          force(35, 1, 'F_A', { arc: true }),
        ],
      },
    },
  ]),

  ...examplesOf('inclined-plane', [
    {
      slug: 'block-on-rough-inclined-plane-gravity-normal-friction',
      title: 'Block on a rough inclined plane with gravity, normal force and friction',
      alt: 'A block labeled m on a hatched ramp at angle θ, with F_g straight down, F_N out of the slope and F_f up the slope',
      caption:
        'A block labeled m resting on a ramp that rises to the right at 30°, its angle marked θ at the foot. The slope is hatched to show it is rough. Gravity F_g points straight down from the block, the normal force F_N points out of the slope, and friction F_f points up the slope along the bottom of the block.',
      settings: { surface: 'rough', gravity: true, normal: true, friction: 'up' },
    },
    {
      slug: 'cart-rolling-down-a-20-degree-ramp',
      title: 'Cart rolling down a 20° ramp',
      alt: 'A cart labeled m on a smooth ramp at 20°, with dashed velocity v and acceleration a arrows pointing down the slope',
      caption:
        'A cart labeled m on a smooth ramp rising to the right, its angle labeled 20° at the foot. Dashed arrows above the cart show its velocity v and acceleration a, both pointing down the slope. No forces are drawn, so students can add them.',
      settings: { object: 'cart', angle: 20, angleLabel: text('20deg'), velocity: 'down', acceleration: 'down' },
    },
    {
      slug: 'ball-on-ramp-length-height-angle-labeled',
      title: 'Ball on a ramp with its length, height and angle labeled',
      alt: 'A ball labeled m on a ramp, with the slope’s length marked L, the ramp’s height marked h and its angle marked θ',
      caption:
        'A ball labeled m on a smooth ramp rising to the right at 25°. The length of the slope is marked L along it, the ramp’s height is marked h beside its tall side, and the angle at the foot is marked θ. Use it for energy questions, such as the ball’s speed at the bottom.',
      settings: { object: 'ball', angle: 25, lengthMark: true, heightMark: true },
    },
    {
      slug: 'label-the-forces-block-on-a-35-degree-incline',
      title: 'Label the forces: 5 kg block on a 35° incline',
      alt: 'A block labeled 5 kg on a rough ramp at 35°, with three force arrows, down, out of the slope and up the slope, each with a blank line for its label',
      caption:
        'A block labeled 5 kg on a rough, hatched ramp at 35°. Three force arrows are drawn from the block, straight down, out of the slope and up the slope, each with a blank line where its name goes, for students to label gravity, the normal force and friction.',
      settings: {
        objectLabel: text('5 kg'),
        angle: 35,
        angleLabel: text('35deg'),
        surface: 'rough',
        gravity: true,
        gravityLabel: blank('F_g'),
        normal: true,
        normalLabel: blank('F_N'),
        friction: 'up',
        frictionLabel: blank('F_f'),
      },
    },
    {
      slug: 'block-pushed-up-a-rough-incline',
      title: 'Block pushed up a rough incline with an applied force',
      alt: 'A block labeled m on a rough ramp at θ, with F_A up the slope, F_f down the slope, F_g down and F_N out of the slope, and a dashed velocity v up the slope',
      caption:
        'A block labeled m pushed up a rough ramp at 30°, its angle marked θ. The applied force F_A points up the slope and friction F_f points down it, opposing the motion; gravity F_g points straight down and the normal force F_N out of the slope. A dashed velocity arrow v points up the slope.',
      settings: { surface: 'rough', gravity: true, normal: true, friction: 'down', applied: 'up', velocity: 'up' },
    },
  ]),

  ...examplesOf('pulley', [
    {
      slug: 'atwood-machine-tension-weight-acceleration',
      title: 'Atwood machine with tension, weight and acceleration',
      alt: 'An Atwood machine: masses m_1 and m_2 hanging over one fixed pulley, with tension T up each side of the string, weights m_1 g and m_2 g down, and dashed acceleration arrows a, up on the left and down on the right',
      caption:
        'Two blocks, m_1 on the left and m_2 on the right, hang from one string over a fixed pulley hung from the ceiling. Tension T is drawn on each side of the string, pulling up on each block and down on the pulley, and the weights m_1 g and m_2 g point down from the blocks. Dashed acceleration arrows a point up beside m_1 and down beside m_2.',
      settings: { tension: true, gravity: true, acceleration: 'forward' },
    },
    {
      slug: 'block-on-table-pulled-by-hanging-mass-over-pulley',
      title: 'Block on a table pulled by a hanging mass over a pulley',
      alt: 'A block m_1 on a rough table tied over a pulley at the table’s edge to a hanging block m_2, with tension, weight, normal force, friction and acceleration arrows',
      caption:
        'A block m_1 on a rough, hatched table is tied by a string over a pulley at the table’s edge to a block m_2 hanging below. Tension T runs along both parts of the string; m_1 g and m_2 g point down, the normal force F_N points up from m_1, and friction F_f points away from the pulley. Dashed arrows a show m_1 moving toward the pulley and m_2 falling.',
      settings: { setup: 'table', surface: 'rough', tension: true, gravity: true, normal: true, friction: 'away', acceleration: 'forward' },
    },
    {
      slug: 'block-on-incline-tied-over-pulley-to-hanging-mass',
      title: 'Block on an incline tied over a pulley to a hanging mass',
      alt: 'A block m_1 on a ramp at angle θ, tied by a string over a pulley at the top of the ramp to a hanging block m_2, with tension, weights and the normal force drawn',
      caption:
        'A block m_1 on a smooth ramp at 40°, its angle marked θ, tied by a string running parallel to the slope over a pulley at the top of the ramp to a block m_2 hanging beside the ramp’s tall side. Tension T is drawn along the string, the weights m_1 g and m_2 g point straight down and the normal force F_N points out of the slope.',
      settings: { setup: 'ramp', angle: 40, tension: true, gravity: true, normal: true },
    },
    {
      slug: 'block-and-tackle-3-strands-holding-the-load',
      title: 'Block and tackle with 3 strands holding up the load',
      alt: 'A block and tackle: a load m hanging from a bar under a movable pulley, held up by three strands of rope, with tension T up each strand, T down at the free end, and the weight mg',
      caption:
        'A block and tackle with a load m held up by three strands of one rope, running over two fixed pulleys at the ceiling and a movable pulley on a bar above the load. Tension T points up in each of the three strands holding the load and down at the free end, where the effort pulls, and the load’s weight mg points down.',
      settings: { setup: 'tackle', strands: 3, tension: true, gravity: true },
    },
    {
      slug: 'cart-on-table-and-hanging-mass-masses-left-blank',
      title: 'Cart on a table and a hanging mass, masses left blank',
      alt: 'A cart on a smooth table tied over a pulley to a hanging block, with blank lines on the cart and the block for their masses',
      caption:
        'A cart on a smooth table, tied by a string over a pulley at the table’s edge to a block hanging below. Both have a blank line in place of a label, so you can write in the masses for your problem. No forces are drawn.',
      settings: { setup: 'table', aKind: 'cart', aLabel: blank('m_1'), bLabel: blank('m_2') },
    },
  ]),

  ...examplesOf('projectile-motion', [
    {
      slug: 'projectile-launched-at-30-degrees-with-velocity-components',
      title: 'Projectile launched at 30° with its velocity components',
      alt: 'A ball launched from level ground at 30°, with the launch velocity v_0, its components v_0x and v_0y, and the dashed parabolic path to where it lands',
      caption:
        'A ball launched from level ground at 30° above the horizontal, the angle labeled 30°. The launch velocity v_0 is drawn at the ball, with its horizontal and vertical components v_0x and v_0y, and a dashed parabola shows the path to where the ball lands on the ground.',
      settings: { angle: 30, angleLabel: text('30deg'), components: true },
    },
    {
      slug: 'ball-launched-horizontally-off-a-cliff',
      title: 'Ball launched horizontally off a cliff',
      alt: 'A ball launched horizontally off the top of a cliff with velocity v_0, drawn again at four equal time steps along its dashed path, with g down and the cliff’s height h and range R marked',
      caption:
        'A ball launched horizontally from the top corner of a cliff, with its launch velocity v_0 and the acceleration due to gravity g pointing down. The ball is drawn again at four equal time steps along its dashed path, the last where it lands: evenly spaced across, but farther apart each step down. The cliff’s height h and the range R are marked.',
      settings: { start: 'cliff', angle: 0, positions: 4, gravity: true, cliffMark: true, rangeMark: true },
    },
    {
      slug: 'projectile-path-at-equal-time-steps-lettered',
      title: 'Projectile path with the ball at equal time steps, lettered',
      alt: 'A ball launched at 60° from level ground, shown at the launch and six equal time steps along its path, lettered A to G',
      caption:
        'A ball launched from level ground at 60°, with its dashed path and the ball drawn at the launch and at six equal time steps after it, lettered A to G from the launch to the landing. No vectors are drawn, so students can add the velocity or acceleration at each point.',
      settings: { angle: 60, positions: 6, letters: true, velocity: false },
    },
    {
      slug: 'projectile-maximum-height-and-range-labeled',
      title: 'Projectile with its maximum height and range labeled',
      alt: 'A ball launched at 45° with velocity v_0, its dashed path, g pointing down, the maximum height marked H and the range marked R',
      caption:
        'A ball launched from level ground at 45°, the angle marked θ, with its launch velocity v_0 and the acceleration due to gravity g pointing down. Its maximum height is marked H and its range along the ground R.',
      settings: { gravity: true, heightMark: true, rangeMark: true },
    },
    {
      slug: 'sketch-the-path-ball-launched-upward-off-a-cliff',
      title: 'Sketch the path: ball launched upward off a cliff',
      alt: 'A ball on the top corner of a cliff with a launch velocity v_0 at θ above the horizontal and the cliff’s height marked h, with no path drawn',
      caption:
        'A ball on the top corner of a cliff, launched at 30° above the horizontal with velocity v_0, the angle marked θ, and the cliff’s height marked h. The path is left off, so students sketch it themselves.',
      settings: { start: 'cliff', angle: 30, path: false, cliffMark: true },
    },
  ]),

  ...examplesOf('motion-graphs', [
    {
      slug: 'position-time-graph-speeding-up-constant-velocity-slowing-down-lettered',
      title: 'Position–time graph: speeding up, constant velocity, slowing down, lettered',
      alt: 'A position–time graph with its segment ends lettered A to E: curving upward from A to B, a straight line from B to C, curving over and leveling off from C to D, and flat from D to E',
      caption:
        'A position–time graph of a cart that speeds up from rest for 4 s, moves at a constant 4 m/s for 4 s, slows down to a stop over 4 s and stays at rest for 3 s. Its segment ends are lettered A to E: the line curves upward from A to B, is straight from B to C, curves over from C to D, and is flat from D to E.',
      settings: { letters: true },
    },
    {
      slug: 'matching-position-velocity-acceleration-time-graphs-stacked',
      title: 'Matching position–time, velocity–time and acceleration–time graphs',
      alt: 'Position–time, velocity–time and acceleration–time graphs stacked on one time axis for a cart that goes forward, stops, then goes back, each segment in its own line style, with the segment ends lettered A to F',
      caption:
        'Three graphs of one motion stacked on the same time axis: position, velocity and acceleration. The cart speeds up forward from A to B, moves at 4 m/s from B to C, slows to a stop at D, speeds up backward from D to E and slows to a stop again at F. Each segment has its own line style, and the segment ends are lettered A to F on every graph.',
      settings: {
        graphs: 'all',
        letters: true,
        styles: true,
        segments: [segment('faster', 'medium', 2), segment('forward', 'medium', 3), segment('slower', 'medium', 2), segment('faster', 'medium', 2, 'back'), segment('slower', 'medium', 2)],
      },
    },
    {
      slug: 'velocity-time-graph-speeding-up-and-slowing-down',
      title: 'Velocity–time graph of a cart speeding up and slowing down',
      alt: 'A velocity–time graph of straight lines lettered A to F: flat at zero from A to B, rising gently from B to C, rising more steeply from C to D, level from D to E, and falling back to zero from E to F',
      caption:
        'A velocity–time graph made of straight lines, lettered A to F. The cart is at rest from A to B, speeds up to 2 m/s from B to C, speeds up more quickly to 6 m/s from C to D, holds 6 m/s from D to E, and slows to a stop from E to F. The steeper the line, the greater the acceleration.',
      settings: {
        graphs: 'vt',
        letters: true,
        segments: [segment('rest', 'medium', 2), segment('faster', 'slow', 3), segment('faster', 'medium', 3), segment('forward', 'fast', 3), segment('slower', 'fast', 3)],
      },
    },
    {
      slug: 'position-time-graph-shapes-without-numbers',
      title: 'Position–time graph shapes without numbers',
      alt: 'A position–time graph with no numbers or gridlines, lettered A to F: curving upward, straight, curving over, flat, then a straight line sloping down',
      caption:
        'A position–time graph on plain axes with no numbers or gridlines, so only the shapes show. From A to B the line curves upward (speeding up), from B to C it is straight (constant velocity), from C to D it curves over (slowing down), from D to E it is flat (at rest), and from E to F it slopes straight down (moving back at a constant velocity).',
      settings: {
        numbers: false,
        gridlines: false,
        letters: true,
        segments: [segment('faster', 'medium', 3), segment('forward', 'medium', 2), segment('slower', 'medium', 3), segment('rest', 'medium', 2), segment('back', 'medium', 3)],
      },
    },
    {
      slug: 'position-time-graph-tangent-instantaneous-velocity',
      title: 'Tangent to a position–time graph for instantaneous velocity',
      alt: 'A position–time graph curving upward for 6 s, with a dashed tangent line touching the curve at 4 s',
      caption:
        'A position–time graph of a cart speeding up steadily from rest for 6 s, so the line curves upward. A dashed tangent line touches the curve at 4 s; its slope is the cart’s instantaneous velocity at that moment.',
      settings: { segments: [segment('faster', 'fast', 6)], tangent: true, tangentAt: 4 },
    },
  ]),

  ...examplesOf('spring-scale', [
    {
      slug: 'spring-scale-reading-6-25-n',
      title: 'Spring scale reading 6.25 N',
      alt: 'A tan 10 N spring scale with a block on its hook, the pointer at 6.25 N, with a magnified view of the pointer',
      caption:
        'A tan 10 N spring scale, numbered every 1 N and marked every 0.1 N, with a block hanging from its hook. The pointer is between the 6.2 and 6.3 N marks, and a magnified circle beside the scale shows the marks around it.',
      settings: { force: 6.25 },
    },
    {
      slug: '5-n-spring-scale-with-slotted-masses',
      title: '5 N spring scale with slotted masses',
      alt: 'A green 5 N spring scale holding a hanger with four slotted masses, the pointer at 2.45 N, with a magnified view',
      caption:
        'A green 5 N spring scale, numbered every 0.5 N and marked every 0.1 N, holding a hanger with four slotted masses stacked on it. The pointer sits between the 2.4 and 2.5 N marks, shown enlarged in the magnifier beside the scale.',
      settings: { capacity: '5', force: 2.45, hanging: 'masses', masses: 4 },
    },
    {
      slug: 'spring-scale-reading-in-grams',
      title: 'Spring scale reading in grams',
      alt: 'A pink 1 N spring scale printed in grams, from 0 to 100 g, with a block on its hook and the pointer at 45.5 g',
      caption:
        'A pink 1 N spring scale printed only in grams, its tag reading 100 g, from 0 to 100 g, numbered every 10 g and marked every 1 g, with a block on its hook. The pointer is between the 45 and 46 g marks, shown in the magnifier beside it.',
      settings: { capacity: '1', units: 'grams', force: 0.455 },
    },
    {
      slug: 'spring-scale-with-a-zero-error',
      title: 'Spring scale with a zero error',
      alt: 'Two 10 N spring scales: on the left, with nothing hanging, the pointer rests at 0.20 N; on the right, with a block, it reads 4.30 N',
      caption:
        'The same 10 N spring scale twice. On the left, with nothing on its hook, the pointer rests below zero, at 0.20 N; on the right, with a block hanging, it points to 4.30 N. Students take the zero error off the reading to find the force.',
      settings: { force: 4.1, zero: 0.2 },
    },
    {
      slug: '50-n-spring-scale-in-newtons-and-grams',
      title: '50 N spring scale in newtons and grams',
      alt: 'A black and white 50 N spring scale printed in newtons on the left and grams on the right, with a block on its hook and the pointer at 27.50 N (2750 g)',
      caption:
        'A 50 N spring scale drawn in black and white, printed in newtons left of the slot and grams right of it: 0 to 50 N, numbered every 5 N and marked every 0.5 N, and 0 to 5000 g. A block hangs from its hook and the pointer sits on the 27.5 N mark, level with 2750 g, shown in the magnifier beside it.',
      settings: { capacity: '50', units: 'both', force: 27.5, color: false },
    },
  ]),

  ...examplesOf('vector-diagram', [
    {
      slug: 'adding-two-perpendicular-vectors-head-to-tail',
      title: 'Adding two perpendicular vectors head to tail',
      alt: 'On a grid, vector A 6 squares to the right, then vector B 8 squares up from its tip, with the dashed resultant R from A’s tail to B’s tip and its angle marked θ',
      caption:
        'Two vectors drawn to scale head to tail on a grid: A, 6 squares to the right, then B, 8 squares straight up from A’s tip. The dashed resultant R runs from A’s tail to B’s tip, with its angle above the horizontal marked θ.',
      settings: { vectors: [vector(6, 0, 'A'), vector(8, 90, 'B')], resultantArc: true },
    },
    {
      slug: 'adding-three-vectors-head-to-tail',
      title: 'Adding three vectors head to tail',
      alt: 'On a grid, vectors A, B and C drawn head to tail, A to the right, B up and to the right, C up and to the left, with the dashed resultant R from A’s tail to C’s tip',
      caption:
        'Three vectors drawn to scale head to tail on a grid: A, 5 squares to the right; B, 4 squares at 60°; and C, 3 squares at 150°, up and to the left. The dashed resultant R runs from the first tail to the last tip.',
      settings: { vectors: [vector(5, 0, 'A'), vector(4, 60, 'B'), vector(3, 150, 'C')] },
    },
    {
      slug: 'resolving-a-vector-into-x-and-y-components',
      title: 'Resolving a vector into x and y components',
      alt: 'On a grid with x and y axes, vector A at θ above the x axis, with its dashed components A_x along the x axis and A_y up to A’s tip',
      caption:
        'One vector A, 5 squares long at 37° above the horizontal, drawn from where the x and y axes cross, on a grid. Its angle is marked θ from the x axis, and its components A_x along the horizontal and A_y up to its tip are drawn as thinner dashed arrows.',
      settings: {
        vectors: [vector(5, 37, 'A', { arc: true, parts: true })],
        resultant: 'none',
        axes: true,
      },
    },
    {
      slug: 'vector-addition-worksheet-draw-the-resultant',
      title: 'Vector addition worksheet: draw the resultant',
      alt: 'On a grid, vector A 4 squares at 30° and vector B 5 squares at 120° drawn head to tail, with no resultant drawn',
      caption:
        'Two vectors drawn to scale head to tail on a grid: A, 4 squares at 30°, and B, 5 squares at 120°, starting from A’s tip. The resultant is left off, so students draw it from A’s tail to B’s tip and measure it.',
      settings: { vectors: [vector(4, 30, 'A'), vector(5, 120, 'B')], resultant: 'none' },
    },
    {
      slug: 'subtracting-vectors-a-minus-b',
      title: 'Subtracting vectors: A − B as A + (−B)',
      alt: 'On a grid, vector A 5 squares to the right, then −B 3 squares straight down from its tip, with the dashed resultant A − B',
      caption:
        'Vector subtraction drawn as addition: A, 5 squares to the right, then −B, 3 squares straight down from A’s tip, the opposite of a B pointing up. The dashed resultant from A’s tail to −B’s tip is labeled A − B.',
      settings: { vectors: [vector(5, 0, 'A'), vector(3, 270, '−B')], resultantLabel: text('A − B') },
    },
  ]),
]

/** A generator's examples, in order; the first is its best. */
export const examplesFor = (generator: string) => EXAMPLES.filter((e) => e.generator === generator)

export const findExample = (generator: string, slug: string) => EXAMPLES.find((e) => e.generator === generator && e.slug === slug)

/** Generators with examples. */
export const EXAMPLE_GENERATORS = [...new Set(EXAMPLES.map((e) => e.generator))]

/** The generator's social card image (static/og/<generator>.png), made from its first example. */
export const ogImage = (generator: string) => `/og/${generator}.png`
