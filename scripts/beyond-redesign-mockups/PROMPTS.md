# Higgsfield prompts for the "after" mock-ups

20 images, 4 per fictional business. Save each as a JPG in `assets/generated/` with the exact filename shown
(for example `assets/generated/example-1-hero.jpg`). Then run `render.sh`. Until a file exists, the page shows a
striped placeholder labelled with the filename it is waiting for.

`python gen.py` runs these prompts through the Higgsfield CLI (`higgsfield auth login` first; GPT Image 2, medium, 2k, about 2 credits each) and saves any slot that is still missing.

Settings that work well: **GPT Image 2** (quality high, 2k) or **Nano Banana Pro** (2k). Photorealistic, not illustrated.
Do not use a reference photo of a real business. Pick the best of two or three tries per slot.

Aspect ratios and crops: slots are cropped with `object-fit: cover`, so keep the subject in the middle band of the frame.

| Slot | Ratio | Why |
| --- | --- | --- |
| `hero` for examples 1 and 5 | 21:9 | Full-bleed banner with copy over the left half. Subject on the **right**, left half calm and darker. |
| `hero` for examples 2, 3, 4 | 3:2 | Sits beside the headline as a rounded photo. Subject centred. |
| `a`, `b`, `c` | 3:2 | Service cards, cropped to a wide strip. Subject in the middle third from top to bottom. |

## Add to the end of every prompt

> Photorealistic documentary photograph, natural light, shallow depth of field, 35mm look. South African home or workplace.
> No text, no logos, no brand names, no readable signs, no watermark, no screens showing interfaces. Hands and tools anatomically
> correct. No identifiable real person. Clean, uncluttered, believable, not stock-photo glossy.

## Example 1: Nightriver Plumbing (emergency plumber, night-time green and amber)

- **`example-1-hero.jpg` (21:9)**: A plumber in a plain dark work shirt kneeling at a kitchen sink cupboard at night, head torch on, tightening a copper pipe joint with a wrench, a small clean puddle on the floor. Warm amber torch light against deep teal-green shadows. The plumber is on the right third of the frame, the left half is dark kitchen cabinets with soft empty space.
- **`example-1-a.jpg` (3:2)**: An old white electric geyser in a ceiling cupboard being replaced, a plumber's hands on the copper pipes and a new geyser box on the floor, evening light from a passage.
- **`example-1-b.jpg` (3:2)**: A burst copper pipe under a basin spraying a fine jet of water, caught mid-spray, a gloved hand reaching in with a pipe clamp, wet tiles, bright side light.
- **`example-1-c.jpg` (3:2)**: A plain white double-cab pickup (bakkie) with a ladder rack and tool boxes parked at the kerb of a suburban house at dusk, headlights on, no signwriting or text on the vehicle.

## Example 2: Fuse & Flange (electrical and plumbing, navy and yellow)

- **`example-2-hero.jpg` (3:2)**: Two tradespeople, one electrician and one plumber, in navy work shirts and yellow hi-vis vests standing side by side in a bright home hallway, one holding a cable tester, one holding a pipe wrench, friendly and confident, faces turned partly away. Clean daylight, navy and yellow accents in the scene.
- **`example-2-a.jpg` (3:2)**: A neat open electrical distribution board with tidy coloured wiring and a gloved hand on a circuit breaker, bright work light.
- **`example-2-b.jpg` (3:2)**: A new chrome mixer tap being fitted to a white basin, plumber's hand tightening the connection from below, spotless bathroom.
- **`example-2-c.jpg` (3:2)**: A white work van with its side door open showing neatly organised tool drawers, one side for electrical cable and one for pipe fittings, plain unmarked van, suburban driveway, morning light.

## Example 3: Oakjoint Plumbing (warm white, teal and oak)

- **`example-3-hero.jpg` (3:2)**: A freshly finished modern bathroom with a wall-hung basin, black tap, oak shelf and visible neat copper pipework before the final panel goes on, a plumber's spirit level resting on the basin. Soft daylight, teal tiles, oak wood accents.
- **`example-3-a.jpg` (3:2)**: A plumber clearing an outside drain with a drain rod, inspection cover lifted, a garden path and wet paving, clear daylight.
- **`example-3-b.jpg` (3:2)**: Close-up of a new brushed brass bath tap and spout being fitted, clean grout lines, warm light.
- **`example-3-c.jpg` (3:2)**: A new white geyser installed neatly on a bracket in a clean utility cupboard, copper pipes lagged, a drip tray under it, tidy and bright.

## Example 4: Thimble Dental (soft sage and teal, calm)

- **`example-4-hero.jpg` (3:2)**: A calm modern dental practice reception: pale oak desk, a green plant, soft sage walls, a bench with cushions, a bright window. Empty of people. Welcoming and quiet.
- **`example-4-a.jpg` (3:2)**: A clean treatment room (check-up): dental chair, overhead light, small tray of instruments, soft sage walls, window light. Empty of people.
- **`example-4-b.jpg` (3:2)**: A hygiene room with a reclined chair, a small tray with a polishing tool, a framed abstract print, warm natural light. Empty of people.
- **`example-4-c.jpg` (3:2)**: An emergency room with a chair, a bright but gentle overhead light, a wall cabinet and a small stool, slightly brisker and brighter feel but still calm. Empty of people.

## Example 5: Stonekettle Cottage (moss, stone, copper)

- **`example-5-hero.jpg` (21:9)**: A small stone cottage with a pitched tin roof and a wooden stoep on the right side of the frame, set on a quiet hillside, a wide valley and distant hills at golden hour, smoke from the chimney. The left half of the frame is open sky and soft grassy hillside, calm and less detailed so text can sit over it. No people, no cars.
- **`example-5-a.jpg` (3:2)**: A bedroom with a made-up linen bed, thick curtains pulled open and a window looking over the valley, a wooden bedside table with a lamp, morning light.
- **`example-5-b.jpg` (3:2)**: A stone-walled lounge with a lit fireplace, a dining table for four and a sofa, warm evening light, a stack of logs, a kettle on a stove in the background.
- **`example-5-c.jpg` (3:2)**: A wooden stoep with a braai and two chairs, a coffee cup on a rail, a wide hazy valley behind, late afternoon light.
