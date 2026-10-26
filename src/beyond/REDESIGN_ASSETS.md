# Beyond before/after mock-up assets

Illustrative fictional websites for the Beyond “Before / after concepts” slider.
They are not client sites, prospect sites, or screenshots of anyone’s real business.

Regenerate the WebP files with `scripts/beyond-redesign-mockups/render.sh`
(Node, Google Chrome and Pillow). The script does not download anything.
Pages are generated from `examples.mjs` by `build.mjs`; styles are `before.css` and `after.css`.

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
| `scripts/beyond-redesign-mockups/assets/generated/example-N-{hero,a,b,c}.jpg` | The photos on every before and after frame (the before frames reuse the same photos small and desaturated) | Generated in Higgsfield for Skillance from the prompts in `scripts/beyond-redesign-mockups/PROMPTS.md`. Not photographs of real businesses or people. | Owned by Skillance under the Higgsfield plan terms. |
| Icons, layout, chrome | Every frame | Drawn in HTML and CSS in `scripts/beyond-redesign-mockups/`. No external image files. | Original work. |
| Type rasterised into the WebP files | Every frame | System fonts on the machine that runs the render (Segoe UI, Georgia, Cambria, Bahnschrift, Verdana). The font files are not copied into the repo or the site. Only pixels ship. | Rasterising text does not relicense the fonts. |

Nothing is hotlinked. No stock photography. No third-party logos (the word "WhatsApp" is used as ordinary text next to a plain button, not as the WhatsApp logo).
