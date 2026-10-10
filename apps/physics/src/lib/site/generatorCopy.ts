// The words in each generator's About drawer: what its figures show and how
// teachers use them, what can be set, and frequently asked questions, for
// GeneratorAbout and the page's structured data. Everything here should be
// true of the generator's code; check it when a generator changes.
// Plain text only: the same strings go into JSON-LD.

export interface Faq {
  q: string
  a: string
}

export interface GeneratorCopy {
  /** the drawer's visible heading */
  heading: string
  /** one or two short paragraphs */
  intro: string[]
  /** "What you can set", one line each */
  settings: string[]
  faqs: Faq[]
  /** what the generator's social card image (/og/<id>.png) shows */
  imageAlt: string
  /** schema.org educationalLevel */
  educationalLevel: string[]
}

export const COPY: Record<string, GeneratorCopy> = {
  'free-body-diagram': {
    heading: 'Free body diagrams with forces at any angle',
    intro: [
      'The Free Body Diagram Generator draws one body, a dot or a block, ball or cart, with every force on it drawn as an arrow from its middle, and nothing else around it: no floor, ramp or string. You set each force’s direction, in degrees counterclockwise from the right, and its length compared with the others, so equal forces are drawn equal and a bigger force is drawn longer.',
      'Teachers use it for Newton’s laws questions on tests, worksheets and slides: draw the forces for students to name, or leave the labels blank for them to fill in. For a force at an angle, mark its angle or show its components, for questions on resolving forces. Velocity and acceleration can go beside the body as dashed arrows, so they’re never taken for forces.',
    ],
    settings: [
      'The body: a dot, or a block, ball or cart drawn at 50% to 200% of its usual size',
      'Up to eight forces, each with its direction, length and label, added from buttons for gravity, normal, friction, tension, applied, spring and air resistance forces pointing the usual way',
      'For a force at an angle, an angle mark from the horizontal or vertical, and its horizontal and vertical components',
      'Every label written, with subscripts and Greek letters such as θ and μ, a blank line for students, or left off',
      'Velocity and acceleration arrows beside the body, drawn dashed',
      'Mirror, to flip the figure left to right, and color for slides',
    ],
    faqs: [
      {
        q: 'What goes on a free body diagram?',
        a: 'Only the body and the forces acting on it, each an arrow pointing the way the force acts. Forces the body exerts on other things don’t belong, and neither do the floor, ramp or rope. Velocity and acceleration aren’t forces, so the generator draws them dashed, beside the body rather than on it.',
      },
      {
        q: 'Should the body be a dot or a box?',
        a: 'Either. AP Physics asks for a dot, with every force starting from it. A block, ball or cart helps younger students see what the diagram is of; the forces still start from its middle.',
      },
      {
        q: 'How do I set which way a force points?',
        a: 'Directions are in degrees counterclockwise from the right: 0° points right, 90° up, 180° left and 270° down. The Up, Down, Left and Right buttons set those four, and the slider or the box sets any angle in between.',
      },
      {
        q: 'Are the forces drawn to scale?',
        a: 'Roughly. Each force has a length from 0.25 to 2 times the usual, measured past the body’s edge, so you can draw balanced forces equal and a bigger force longer. The lengths show which force is bigger, not an exact scale.',
      },
      {
        q: 'Which way do the normal force and friction point on a ramp?',
        a: 'The normal force points straight out of the surface, at a right angle to it, and friction points along the surface, against the way the body slides or would slide. On a ramp rising to the right at angle θ, the normal force is tilted θ from the vertical: set its direction to 90° plus θ.',
      },
      {
        q: 'How do I show components without giving away the answer?',
        a: 'Components are off until you turn them on for a force. They’re drawn as thinner, lighter dashed arrows along the horizontal and vertical, with dotted guides from the force’s tip, and their labels can be left blank for students.',
      },
    ],
    imageAlt: 'A printable free body diagram of a block with gravity, normal, applied and friction forces, made with the Free Body Diagram Generator',
    educationalLevel: ['High school', 'AP Physics'],
  },

  'vector-diagram': {
    heading: 'Vector addition diagrams, drawn to scale head to tail',
    intro: [
      'The Vector Diagram Generator draws up to three vectors to scale, head to tail, on a grid where one square is a magnitude of 1, with their resultant from the first tail to the last tip. You give each vector its magnitude, from 0.5 to 12 squares, and its direction in degrees counterclockwise from the right, and the generator tells you the resultant’s magnitude and direction for your answer key.',
      'It doesn’t say what the vectors are, so the same figure works for displacement, velocity and force problems. Draw any vector or the resultant dashed, or leave it off for students to draw in, and mark angles or show components for questions on resolving vectors.',
    ],
    settings: [
      'Up to three vectors, each with its magnitude in grid squares (0.5 to 12) and its direction',
      'Each vector and the resultant drawn solid, dashed or left off, with its own label',
      'For any arrow at an angle, an angle mark from the horizontal or vertical, and its x and y components',
      'A grid, one square per unit of magnitude, and plain x and y axes through the first tail',
      'Mirror, to flip the figure left to right, and color for slides',
    ],
    faqs: [
      {
        q: 'How do you add vectors head to tail?',
        a: 'Draw the first vector, then start the second at the first one’s tip (its head), and so on. The resultant runs from the first vector’s tail to the last vector’s tip. With A 4 squares to the right and B 3 squares up, the resultant is 5 squares long, about 36.9° above the horizontal.',
      },
      {
        q: 'How do you find a vector’s components?',
        a: 'A vector of magnitude A at angle θ above the horizontal has an x-component of A cos θ and a y-component of A sin θ. Turn on Show its components to draw them as thinner dashed arrows, along the horizontal and then up or down to the tip.',
      },
      {
        q: 'Can I subtract vectors?',
        a: 'There’s no subtraction setting, but A − B is A + (−B): add B with its direction turned around 180° and label it −B. The resultant is then A − B.',
      },
      {
        q: 'Can I leave the resultant for students to draw?',
        a: 'Yes. Set the resultant’s arrow to Left off. It isn’t drawn, but the Resultant settings still show its magnitude and direction for your key. Any vector can be left off the same way, leaving a gap in the chain for students to fill in.',
      },
      {
        q: 'What does one grid square stand for?',
        a: 'A magnitude of 1. The grid has no numbers, so you say what a square is worth, like 1 m, 1 m/s or 10 N. It’s lined up with the first tail, so tips land on grid points whenever the magnitudes and angles allow.',
      },
    ],
    imageAlt: 'A printable vector diagram: two vectors head to tail on a grid with their dashed resultant, made with the Vector Diagram Generator',
    educationalLevel: ['High school', 'AP Physics'],
  },

  'inclined-plane': {
    heading: 'Inclined plane diagrams: a block, ball or cart on a ramp',
    intro: [
      'The Inclined Plane Generator draws a ramp at any angle from 5° to 60° with a block, ball or cart on its slope and the angle marked at its foot. Mark the slope’s length and the ramp’s height, hatch the slope to show it’s rough, and add the forces on the object: gravity straight down, the normal force out of the slope, and friction or an applied force along it.',
      'Teachers use it for Newton’s laws, friction and energy questions. Every label can be written, a blank line for students, or left off, so the same ramp works as the question and as its key. Velocity and acceleration are drawn dashed, above the object, so they’re never taken for forces.',
    ],
    settings: [
      'The object: a block, ball or cart, its label, its size, and how far up the ramp it sits',
      'The ramp’s angle, 5° to 60°, and its label, like θ or 30°',
      'A smooth slope or a rough, hatched one',
      'Gravity and the normal force, and friction and an applied force up or down the slope, each with its label',
      'Velocity and acceleration up or down the slope, drawn dashed',
      'Marks for the slope’s length and the ramp’s height',
      'Mirror, so the ramp rises to the left, and color for slides',
    ],
    faqs: [
      {
        q: 'Which way does the normal force point on an incline?',
        a: 'Straight out of the slope, at a right angle to it, not straight up. On a ramp at angle θ it is tilted θ from the vertical, and when only gravity and the normal force act across the slope, it equals mg cos θ.',
      },
      {
        q: 'Which way does friction point on a ramp?',
        a: 'Along the slope, against the way the object slides or would slide. A block sliding down, or resting on the slope and held by friction, has friction up the slope; a block pushed up the slope has friction down it. Choose Up the ramp or Down the ramp.',
      },
      {
        q: 'Can it show gravity’s components along the slope?',
        a: 'No. Gravity is drawn as one arrow straight down, the way students first draw it, and resolving it into mg sin θ down the slope and mg cos θ into it is left for them.',
      },
      {
        q: 'Is the object drawn bigger for a bigger mass?',
        a: 'No. Every object starts the same size, so a 5 kg block isn’t drawn bigger than a 2 kg one. Its size is a setting of its own, from 50% to 200%, apart from its label.',
      },
      {
        q: 'Can the ramp rise to the left?',
        a: 'Yes. Turn on Mirror under Figure to flip the figure left to right. The labels stay readable.',
      },
    ],
    imageAlt: 'A printable inclined plane figure: a block on a rough ramp with gravity, the normal force and friction, made with the Inclined Plane Generator',
    educationalLevel: ['High school', 'AP Physics'],
  },

  'pulley': {
    heading: 'Pulley diagrams: Atwood machines, tables, ramps and block and tackle',
    intro: [
      'The Pulley Generator draws objects tied by string over pulleys, in four setups: an Atwood machine, with two masses hanging over one fixed pulley; a block or cart on a table, tied over a pulley at its edge to a hanging mass; a block or cart on a ramp, tied over a pulley at its top to a hanging mass; and a block and tackle, with 1 to 4 strands holding up a load. Strings are always drawn taut.',
      'Turn on tension, gravity, the normal force and friction to draw the forces for a Newton’s second law problem, and an acceleration arrow for each object. Every label can be written, a blank line for students, or left off.',
    ],
    settings: [
      'The setup: Atwood machine, table and hanging mass, ramp and hanging mass, or block and tackle',
      'Each object’s label and size; on a table or ramp, a block or a cart; in an Atwood machine, which side hangs lower',
      'The ramp’s angle, 10° to 60°, and its label, and a smooth or rough surface',
      'In a block and tackle, 1 to 4 strands holding up the load',
      'Tension along the strings, gravity on each object, the normal force and friction on the object on a table or ramp, and each object’s acceleration',
      'Mirror, to flip the figure left to right, and color for slides',
    ],
    faqs: [
      {
        q: 'What is an Atwood machine?',
        a: 'Two masses hanging from one string over a fixed pulley. With a light string and a frictionless pulley, the heavier mass falls and the lighter one rises, both with acceleration a = (m₂ − m₁)g / (m₁ + m₂), where m₂ is the heavier mass.',
      },
      {
        q: 'Why is every tension arrow labeled T?',
        a: 'With a light string over a light, frictionless pulley, the tension is the same all along the string, so every tension arrow has the same label. Change it to a blank line if students should work that out.',
      },
      {
        q: 'How does a block and tackle make lifting easier?',
        a: 'The load is held up by several strands of one rope, each pulling up with the same tension. With n strands holding the load, the effort at the free end is the load’s weight divided by n, ignoring friction and the pulleys’ weight, but the rope has to be pulled n times as far. That n is its ideal mechanical advantage.',
      },
      {
        q: 'Which way does friction point on the block?',
        a: 'Against the way the block slides or would slide. When the hanging mass pulls the block toward the pulley, friction points away from it. Choose Toward the pulley or Away from it.',
      },
      {
        q: 'Can I draw the forces on just one of the objects?',
        a: 'Use the Free Body Diagram Generator, which draws one body with only the forces on it, like the tension and weight on the hanging mass.',
      },
    ],
    imageAlt: 'A printable Atwood machine figure with tension, weight and acceleration arrows, made with the Pulley Generator',
    educationalLevel: ['High school', 'AP Physics'],
  },

  'projectile-motion': {
    heading: 'Projectile motion diagrams, from level ground or a cliff',
    intro: [
      'The Projectile Motion Generator draws a ball or dot launched to the right, from level ground at 10° to 85° or off the top of a cliff at 0° (a horizontal launch) to 85°, with the dashed path it follows until it lands. The path is the real parabola for the launch angle and cliff height, fitted to the figure, with no air resistance.',
      'Draw the launch velocity with its angle and components, the acceleration due to gravity, and marks for the maximum height, range and cliff height. The ball can be drawn again at equal time steps along the path, lettered A, B, C…, to show it moves the same distance across in each step but not the same distance down. Hide the path for “sketch the path” questions.',
    ],
    settings: [
      'Launched from level ground (10° to 85°) or off a cliff (0° to 85°), and how high the cliff is',
      'A ball, at the size you choose, or a dot',
      'The dashed path, shown or hidden',
      'The ball again at 1 to 8 equal time steps, lettered or not',
      'The launch velocity, its angle mark and its horizontal and vertical components, and g',
      'Marks for the maximum height, the range and the cliff’s height, each labeled, blank or left off',
      'Mirror, to launch to the left, and color for slides',
    ],
    faqs: [
      {
        q: 'Why is a projectile’s path a parabola?',
        a: 'Without air resistance, the ball moves across at a steady speed while gravity speeds it up downward at a steady rate. Its distance across grows evenly with time and its drop with time squared, which makes a parabola. The generator draws that exact curve for the launch angle and cliff height.',
      },
      {
        q: 'What do the equal time steps show?',
        a: 'The ball at equal times after the launch, the last where it lands. The steps are evenly spaced across, because the horizontal velocity doesn’t change, and unevenly spaced up and down, because gravity keeps changing the vertical velocity.',
      },
      {
        q: 'What launch angle gives the longest range?',
        a: 'On level ground, with no air resistance, 45°. Angles the same amount either side of 45°, like 30° and 60°, give the same range; the higher one goes higher and stays in the air longer.',
      },
      {
        q: 'Are the arrows drawn to scale?',
        a: 'No. The launch velocity, its components and g are drawn about the right size, not to scale, while the path’s shape is exact. The arrows are dashed, so they’re never taken for forces.',
      },
      {
        q: 'Can the ball be launched downward or land on a hill?',
        a: 'No. Launches are horizontal or upward, and the ball always lands on the level ground below its launch or at the cliff’s foot. Air resistance is left out.',
      },
    ],
    imageAlt: 'A printable projectile motion figure: a ball launched at an angle with its velocity components and dashed parabolic path, made with the Projectile Motion Generator',
    educationalLevel: ['High school', 'AP Physics'],
  },

  'motion-graphs': {
    heading: 'Position–time, velocity–time and acceleration–time graphs',
    intro: [
      'Motion Graphs draws the graphs of an object moving along a line, built from up to six segments. Each segment is at rest, moving at a constant velocity forward or back, speeding up or slowing down, for 1 to 10 seconds, slow, medium or fast. The numbers are worked out for you: the velocity–time graph is straight lines, and the position–time and acceleration–time graphs come from it exactly, so all three always match.',
      'Show the position–time, velocity–time or acceleration–time graph, or all three stacked on the same time axis, for questions that match one graph to another. Letter the segment ends A, B, C… for questions like “what is the cart doing between B and C?”, hide the numbers to show only the shapes, and draw a tangent on the position–time graph for instantaneous velocity.',
    ],
    settings: [
      'Up to six segments, each at rest, constant velocity forward or back, speeding up or slowing down, slow, medium or fast, lasting 1 to 10 seconds, in any order',
      'Which way a segment speeding up from rest goes, and where the motion starts',
      'The position–time, velocity–time or acceleration–time graph, or all three stacked',
      'Letters A, B, C… at the segment ends, and each segment in its own line style',
      'A tangent to the position–time graph at any time',
      'A chart title and axis titles, with superscripts and subscripts such as m/s², each written, a blank line, or left off',
      'Numbers on the axes or just the shapes, gridlines on or off, label size, and color for slides',
    ],
    faqs: [
      {
        q: 'How are the numbers worked out?',
        a: 'Each segment is a straight line on the velocity–time graph. A constant velocity is 2, 4 or 6 m/s for slow, medium and fast, and speeding up or slowing down gains or loses that much over the segment, starting from the velocity before it. The position is the area under the velocity–time graph and the acceleration is its slope, so the three graphs agree, and positions come out in whole meters.',
      },
      {
        q: 'Why does the velocity–time graph sometimes jump?',
        a: 'Going from one constant velocity, or rest, straight into another, the velocity changes in an instant, the way textbook position–time graphs made of straight lines assume. The graph shows the jump as a dotted line. Speeding up and slowing down always start from the velocity before them, so they never jump.',
      },
      {
        q: 'What do the shapes of a position–time graph mean?',
        a: 'Flat is at rest, a straight sloped line is a constant velocity, and the steeper it is the faster it moves. A curve getting steeper is speeding up, and one leveling off is slowing down. Moving forward, speeding up curves upward (concave up) and slowing down curves downward (concave down); moving back, it’s the other way round.',
      },
      {
        q: 'Can I make graphs without numbers?',
        a: 'Yes. Turn off Numbers on the axes to show only the shapes, and turn off Gridlines for plain axes with arrows. The settings panel still lists each segment’s velocities, acceleration and positions for your answer key.',
      },
      {
        q: 'What does the tangent show?',
        a: 'Its slope is the instantaneous velocity at the time it touches the position–time graph. Where the graph is curved, students can find the velocity there from the tangent’s rise over run; the settings panel shows the answer.',
      },
    ],
    imageAlt: 'A printable position–time graph of a cart that speeds up, moves at a constant velocity, slows down and stops, with its segment ends lettered A to E, made with Motion Graphs',
    educationalLevel: ['Middle school', 'High school', 'AP Physics'],
  },

  'spring-scale': {
    heading: 'Spring scale (newton meter) figures for reading force',
    intro: [
      'The Spring Scale Generator draws a lab spring scale, also called a newton meter or force meter, with its pointer at the force you type. It comes in the sizes a school lab has, 1, 2.5, 5, 10, 20, 30 and 50 N, each in its own color, and printed in newtons, grams or both. Readings go one digit past the smallest mark, the estimated digit.',
      'Hang a block or slotted masses from the hook, or nothing. Give the scale a zero offset for a zero error question, with the same scale drawn unloaded beside it, and add a magnified view of the pointer so the marks stay readable in print. Turn on the answer key to print the force under the figure.',
    ],
    settings: [
      'Capacity: 1, 2.5, 5, 10, 20, 30 or 50 N, color-coded or in black and white',
      'Printed in newtons, grams, or both',
      'The force on the hook, typed or picked at random',
      'A zero offset, with the scale also drawn unloaded beside it',
      'On the hook: nothing, a block with a short label, or 1 to 5 slotted masses',
      'A magnifier beside the scale or in place of it, spanning 1 to 6 numbered marks',
      'A chart title, and an answer key line with the force',
    ],
    faqs: [
      {
        q: 'How do you read a spring scale?',
        a: 'Hold it upright and read where the pointer sits against the marks. Work out what each small mark is worth, read the last mark the pointer has passed, and estimate one more digit between marks. On a 10 N scale marked every 0.1 N, that means reading to 0.01 N, like 3.47 N.',
      },
      {
        q: 'Why do some spring scales show grams?',
        a: 'A spring scale measures force, but many are also printed in grams so they can stand in for a balance. Like school scales, the generator puts 100 g beside every 1 N, taking g as 10 N/kg, so each gram mark lines up with a newton mark. Only the newton reading is a force.',
      },
      {
        q: 'What is a zero error?',
        a: 'With nothing hanging, a scale should read zero. If its pointer rests above or below zero instead, every reading is off by that much, so subtract the unloaded reading from the loaded one: a scale that rests at 0.20 N and reads 4.30 N with a load on it is measuring 4.10 N.',
      },
      {
        q: 'Why is each size a different color?',
        a: 'Lab spring scales are color-coded by capacity, so students can pick the right one at a glance. The generator gives each size its own color: pink for 1 N, blue for 2.5 N, green for 5 N, tan for 10 N, red for 20 N, white for 30 N and yellow for 50 N. Turn color off to draw it in black and white for photocopying.',
      },
      {
        q: 'How does the reading relate to a mass’s weight?',
        a: 'A mass hanging still from the hook pulls down with its weight, W = mg, so the scale reads its weight in newtons. A 250 g mass reads 2.45 N with g = 9.8 N/kg, or 2.5 N with g = 10 N/kg.',
      },
    ],
    imageAlt: 'A printable 10 N spring scale figure with a block on its hook and a magnified view of the pointer, made with the Spring Scale Generator',
    educationalLevel: ['Middle school', 'High school'],
  },
}

/** The copy for a generator; every generator on the site has some. */
export function copyFor(id: string): GeneratorCopy {
  const copy = COPY[id]
  if (!copy) throw new Error(`No page copy for the ${id} generator`)
  return copy
}
