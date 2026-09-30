// Art direction for davidyen1124.github.io/portfolio.
// Every image is a single isolated object on a transparent background, so it can float
// as a parallax layer over any company's brand colour. One shared render style keeps
// the whole site looking like it came out of the same toy factory.
export const STYLE = `STYLE: Bold contemporary 3D illustration for an award-winning designer portfolio website. The look of a high-end Blender / Cinema 4D render of a collectible designer vinyl toy: chunky, slightly exaggerated rounded proportions, smooth soft-touch matte plastic with subtle satin highlights, clean simple forms, crisp softly bevelled edges, soft global-illumination studio lighting from the upper left, gentle ambient occlusion. Witty and a little deadpan, but polished: NOT childish clip-art, NO cartoon outlines, NOT photoreal. Isolated single subject on a genuinely TRANSPARENT background (real alpha channel): no backdrop, no floor, no drop shadow, no cast shadow, no vignette, no glow halo. Subject centred, filling about 80% of the canvas with a clear margin on every side, nothing cropped. Absolutely NO text, letters, numbers, logos, brand marks, watermarks or UI writing anywhere.`

const SQ = 'square (1024x1024 or larger)'
const LAND = 'landscape 3:2 (1536x1024)'

const pal = (s) => `COLOURS (strict): ${s}.`

const HERO = pal('warm cream #F4EFE6, tomato red #FF4A1C, ink black #111111, a little butter yellow #FFD23F')
const SPARKS = pal('Android green #3DDC84, deep bottle green #073B2A, electric spark yellow #FFD60A, white')
const DCARD = pal('Dcard sky blue #3397CF, deep blue #006AA6, navy #00324E, clean white, a tiny touch of warm pink #FF7A93')
const CHOCO = pal('dark chocolate #3B2016, milk chocolate #7B4A2D, candy pink #FF8FB1, cream #FFF1E0')
const YAHOO = pal('Yahoo purple #6001D2, bright violet #7E1FFF, lilac #C8A8FF, white, a tiny touch of hot magenta #FF0080')
const HOUZZ = pal('Houzz green #4DBC15, charcoal #222222, warm linen #F8F6F2, oatmeal #CEC7B5, natural oak wood, terracotta')
const TF = pal('Typeface red #FD243E, near-black #111013, off-white #F1F1F2, cool grey #C5C4C6, small accents of cobalt #3D5AFE')

export const ASSETS = [
  // ——— Hero: who is this guy ———
  { name: 'hero-laptop', size: SQ, prompt: `A chunky, friendly retro laptop, lid open about 110 degrees, seen at a three-quarter angle from slightly above. The screen is a blank glowing warm-white panel with no content. A tiny red sticky note is stuck on the top corner of the lid (blank). ${HERO}` },
  { name: 'hero-boba', size: SQ, prompt: `A Taiwanese bubble tea cup: clear chunky plastic cup, creamy milk tea, a generous layer of glossy black tapioca pearls at the bottom, a sealed film lid and a very fat tomato-red straw poking out at an angle. Slightly tilted, as if mid-float. ${HERO}` },
  { name: 'hero-duck', size: SQ, prompt: `A classic yellow rubber duck (for rubber-duck debugging) wearing tiny black rectangular glasses, looking slightly to the side with a flat, deadpan, unimpressed expression, as if it has heard your explanation of the bug three times already. ${HERO}` },
  { name: 'hero-keycap', size: SQ, prompt: `One single oversized mechanical keyboard keycap, sculpted top with a soft dish, tomato red, completely blank (no legend), tilted at a dynamic angle showing its cross-shaped stem underneath. ${HERO}` },

  // ——— Sparks Lab, 2012: indie Android, 150k installs, two national 1st places ———
  { name: 'sparks-phone', size: SQ, prompt: `A chunky 2012-era Android smartphone with rounded corners and three capacitive buttons area below the screen (buttons are just blank shapes), screen glowing bright green and blank, with several chunky zig-zag electric sparks and little lightning bolts bursting out from behind it. ${SPARKS}` },
  { name: 'sparks-trophy', size: SQ, prompt: `A shiny golden first-place trophy cup with two big looped handles on a chunky dark green base, a green-and-yellow ribbon rosette tied around its stem. All surfaces blank, no engraving. ${SPARKS} plus polished gold.` },
  { name: 'sparks-guzheng', size: SQ, prompt: `A small toy-like guzheng (long Chinese plucked zither) seen at a three-quarter angle, warm wooden body with a row of little bridges and taut strings, a few green musical-note-free sparkles popping above the strings. ${SPARKS} plus warm honey wood.` },
  { name: 'sparks-bolt', size: SQ, prompt: `One single chunky, puffy 3D lightning bolt, spark yellow, slightly inflated like a balloon, tilted dynamically. ${SPARKS}` },

  // ——— Dcard, 2013: founding engineer, 10x growth, push notifications, a new card every midnight ———
  { name: 'dcard-card', size: SQ, prompt: `A single floating white profile card with generous rounded corners, slightly bent as if flipping in the air, a blank round avatar circle and a few blank rounded bars suggesting text lines (no actual text), a small warm-pink heart sticker on one corner, and a sky-blue card behind it peeking out. ${DCARD}` },
  { name: 'dcard-bell', size: SQ, prompt: `A chunky push-notification bell, glossy white with a deep-blue clapper, mid-ring and tilted, with a small round warm-pink notification badge (blank, no number) on its shoulder and three little motion arcs on each side. ${DCARD}` },
  { name: 'dcard-clock', size: SQ, prompt: `A chunky twin-bell alarm clock in sky blue, both hands pointing straight up to midnight, a completely blank white dial with no numbers, the clock hopping slightly as if ringing. ${DCARD}` },
  { name: 'dcard-plane', size: SQ, prompt: `A crisp white paper airplane made of thick folded card, in mid-flight, banking upward, with a thin deep-blue stripe along one wing edge. ${DCARD}` },

  // ——— CHOCOLABS, 2014: R&D intern, iMusee music app 1k → 10k users, 90% test coverage ———
  { name: 'choco-bar', size: SQ, prompt: `A thick chocolate bar half unwrapped from a candy-pink foil wrapper, the exposed squares glossy dark chocolate, one corner bitten off with a clean bite mark. Blank wrapper, no printing. ${CHOCO}` },
  { name: 'choco-vinyl', size: SQ, prompt: `A vinyl record made entirely of glossy dark chocolate with fine concentric grooves, a candy-pink centre label (blank), tilted at a jaunty three-quarter angle, a tiny drip of melted chocolate at the edge. ${CHOCO}` },
  { name: 'choco-headphones', size: SQ, prompt: `Chunky over-ear headphones in milk-chocolate brown with plump candy-pink ear cushions, the headband shaped like a glossy chocolate bar segment. ${CHOCO}` },
  { name: 'choco-tube', size: SQ, prompt: `A laboratory test tube made of clear glass, tilted, filled about ninety percent full with glossy melted dark chocolate, a candy-pink rubber stopper on top, one drip of chocolate running down the outside. ${CHOCO}` },

  // ——— Yahoo, 2017–2021: cohort reporting, halved report time, anomaly dashboard ———
  { name: 'yahoo-bang', size: SQ, prompt: `One single big chunky glossy exclamation mark (the punctuation symbol only: a tall rounded slanted bar above a round dot), bright purple, leaning forward with energy. Nothing else in the image. ${YAHOO}` },
  { name: 'yahoo-chart', size: SQ, prompt: `A chunky 3D bar chart object: five rounded pillars of rising height in purple, violet and lilac on a thick rounded white base, with a fat glossy magenta arrow curving up and over the tallest bar. No axis labels. ${YAHOO}` },
  { name: 'yahoo-hourglass', size: SQ, prompt: `A chunky hourglass with a purple frame and two clear glass bulbs; the lilac sand has run exactly halfway, and the hourglass is tilted as if hurrying. ${YAHOO}` },
  { name: 'yahoo-magnifier', size: SQ, prompt: `A chunky magnifying glass with a purple handle, its lens enlarging one small, spiky, grumpy magenta glitch-blob creature (a cute little data anomaly) that looks caught red-handed. ${YAHOO}` },

  // ——— Houzz, 2021–2023: home feed in TypeScript, unified search, faster photo pages ———
  { name: 'houzz-sofa', size: SQ, prompt: `A mid-century modern three-seat sofa in rich Houzz-green velvet with tapered natural oak legs and two plump linen cushions, seen at a three-quarter angle. ${HOUZZ}` },
  { name: 'houzz-lamp', size: SQ, prompt: `A designer arc floor lamp with a charcoal marble base, a thin curved brass-and-charcoal arm and a big dome shade in Houzz green, the bulb glowing warm. ${HOUZZ}` },
  { name: 'houzz-plant', size: SQ, prompt: `A lush monstera plant with big split leaves in a chunky round terracotta pot, slightly leaning, leaves a vivid green. ${HOUZZ}` },
  { name: 'houzz-house', size: SQ, prompt: `A tiny modern architectural model house: simple gabled form with a tall slim window, charcoal standing-seam roof, warm linen walls, a green front door, a bright little window glowing warm, sitting on a small patch of green lawn (the lawn is part of the object, no floor beyond it). ${HOUZZ}` },

  // ——— Typeface, 2023–now: −65% bundle, ISR 60 min → 2 s, Canva plugin, infinite canvas ———
  { name: 'tf-cursor', size: SQ, prompt: `A giant chunky glossy near-black mouse pointer arrow (the classic computer cursor shape), with a crisp off-white edge bevel, tilted dynamically as if mid-click, a small red click-burst of three short strokes near its tip. ${TF}` },
  { name: 'tf-clamp', size: SQ, prompt: `A cardboard shipping box being squeezed comically thin inside a big red C-clamp, the box bulging and wrinkling, a few little packing peanuts popping out. Blank box, no printing or labels. ${TF}` },
  { name: 'tf-canvas', size: SQ, prompt: `A floating, tilted off-white design artboard panel (like an infinite canvas tile) with a tidy abstract layout of rounded rectangles and circles in red, cobalt and grey (no text), a couple of loose layout tiles drifting off its edge, and a small black mouse pointer hovering over it. ${TF}` },
  { name: 'tf-rosette', size: SQ, prompt: `A first-place award rosette ribbon: a pleated red fan circle around a blank off-white centre button, two long red and black ribbon tails. No text. ${TF}` },

  // ——— Side projects ———
  { name: 'p-jiaobei', size: SQ, prompt: `A pair of red crescent-moon-shaped Taiwanese temple divination blocks (jiaobei / poe), polished lacquered red wood, one lying flat-side-up and one curved-side-up, as if they just landed after being tossed. Soft warm light.` },
  { name: 'p-gong', size: SQ, prompt: `A small brass Chinese opera gong hanging in a lacquered red wooden frame, with a padded mallet striking it, little golden vibration arcs around the gong.` },
  { name: 'p-train', size: SQ, prompt: `A chunky toy commuter train locomotive in brushed silver with a bold red stripe, seen at a three-quarter angle, big friendly headlights. No logos or numbers.` },
  { name: 'p-cloud', size: SQ, prompt: `A puffy, cute weather cloud with a warm yellow sun peeking out from behind it and three glossy blue raindrops falling from its underside.` },
  { name: 'p-beaver', size: SQ, prompt: `A brown beaver lying back on a bright pink inflatable pool float ring, wearing tiny sunglasses, arms behind its head, completely relaxed, flat tail hanging off the float.` },
  { name: 'p-neck', size: SQ, prompt: `A small calm office-worker figurine with a serene smile and an absurdly, impossibly long neck that rises and gently curves like a noodle, wearing a neat collared shirt. Deadpan, peaceful, a little ridiculous.` },
  { name: 'p-calc', size: SQ, prompt: `A chunky retro pocket calculator floating on top of a small fluffy cloud, blank buttons, blank display glowing faintly green.` },
  { name: 'p-robot', size: SQ, prompt: `A friendly retro tin-toy robot giving a big thumbs-up with one hand, boxy head with round eyes and a little antenna, blue and silver.` },
  { name: 'p-rocket', size: SQ, prompt: `A fat cardboard firework rocket with a candy-striped red and white body, a lit fuse throwing little sparks, tilted as if about to launch.` },
  { name: 'p-soup', size: SQ, prompt: `A round ceramic soup bowl full of glossy orange soup swirling into a spiral vortex, a few noodles and a spoon being pulled into the whirlpool.` },

  // ——— Humour department ———
  { name: 'cookie', size: SQ, prompt: `One single thick chocolate chip cookie, golden brown, big glossy chocolate chunks, a small bite taken out of one side, a few crumbs attached. Slightly tilted.` },
  { name: 'bot', size: SQ, prompt: `The head of a small, awkward chatbot robot: rounded cube head in off-white with a dark visor face showing two simple glowing oval eyes and a nervous wobbly smile, one tiny antenna, a single sweat drop on its temple. It looks like it is trying its best.` },
]
