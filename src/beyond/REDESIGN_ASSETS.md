# Beyond before/after mock-up assets

Illustrative fictional websites for the Beyond “Before / after concepts” slider.
They are not client sites, prospect sites, or screenshots of anyone’s real business.

Regenerate the WebP files with `scripts/beyond-redesign-mockups/render.sh`
(Google Chrome and Pillow). The script does not download anything.

## Shipped files

`public/beyond/redesigns/example-{1-5}-{before|after}-{desktop|mobile}.webp`

Desktop frames are 1600×1000. Mobile frames are 780×1688. On a small screen the
compare frame is 3:4 and crops from the top of that tall image, so the first
screen of every mobile mock-up carries the before/after point.

## Fictional businesses

| Example | Niche | Name |
| --- | --- | --- |
| 01 | Plumber | Nightriver Plumbing |
| 02 | Electrical & plumbing | Fuse & Flange |
| 03 | Plumber | Oakjoint Plumbing |
| 04 | Dental practice | Thimble Dental |
| 05 | Self-catering | Stonekettle Cottage |

Every phone number on these pages is the placeholder `0XX XXX XXXX`.
Addresses (14 Ferry Road, 8 Ridge Court, 2 Mill Lane) are invented.
Nothing here uses a real client or prospect name, logo, photograph, or number.

## Sources and licences

| Asset | Used in | Source | Licence |
| --- | --- | --- | --- |
| `scripts/beyond-redesign-mockups/assets/stonekettle-landscape.jpg` | Example 05 after, as the cottage hillside (desktop full-bleed and mobile hero) | Original illustration generated for Skillance in October 2026. Painted hillside and cottage. Not a photograph of a real property, and not a famous landmark. | Original work owned by Skillance. Commercial use on this site is allowed. No third-party licence. |
| All other imagery | Examples 01–04 in full, plus icons, patterns, broken-image marks, and interface chrome on every frame, including example 05 | Drawn in HTML, CSS, and SVG in `scripts/beyond-redesign-mockups/`. No external image files. | Original work, same as above. |
| Type rasterised into the WebP files | Every frame | Inter, Noto Serif Display, Liberation Sans, Liberation Serif, and DejaVu Sans Mono, from the machine that runs the render script. Those families are under the SIL Open Font License. The font files are not copied into the repo or the site. Only pixels ship. | OFL. Rasterising text does not relicense the fonts. |

Nothing is hotlinked. No stock photography. No third-party logos (the word “WhatsApp” is used as ordinary text next to a plain button, not as the WhatsApp logo).
