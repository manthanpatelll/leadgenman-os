# Carousel Design System

The rules every carousel I ship obeys. A slide that breaks one of these is not finished. Cover, inner and CTA slides each have their own block at the bottom.

## Format

| Setting | Value |
| - | - |
| Slide size | 1080 x 1350 (4:5) |
| Slide count | 8 to 12 including cover and CTA. Prompt lists may run longer when the count is the hook. Instagram caps at 20 |
| Export | 4x per slide, 4320 x 5400 PNG. Plus one zip of all slides and one PDF for the LinkedIn version |
| Safe zone | 50px inset on every edge. Readable text never leaves it. Only display text and decorative shapes may cross it |
| Grid | 8px base. Spacing in 8, 16, 24, 32, 40, 48, 64, 80, 96. 4px only for icon nudges |
| Watermark | @leadgenman, 18px, 50% black, top right, on the slides I choose |

## Colour

### Backgrounds (60% of every slide)

Never flat white, never flat black. Pick one per carousel and keep it for every slide.

| Hex | Name | When |
| - | - | - |
| #F5F3EE | Cream | Default. The Finder carousel background, warm and premium |
| #FAFAFA | Cloud Mist | Near white when the design needs a cleaner look |
| #EAE8E1 | Muted Sage | Editorial, warm greige |
| #FFFFF0 | Silk Ivory | Warm cream for long text carousels |
| #0A0A0A | Near black | Lead Gen Man branded pieces only |

### Brand marks (never used as accents)

- Lead Gen Man assets: green #9cff1e on near black #0A0A0A. Course thumbnails, community banners, anything that carries the Lead Gen Man name.
- Personal brand assets: coral #FF6B35 on an off-white background. Most carousels live here.

### Accent set (the 10%)

Flat primaries read cheap. Accents come from this set only, each with its deep tone for the shadow side of a shape.

| Name | Fill | Deep |
| - | - | - |
| Indigo | #818CF8 | #6366F1 |
| Amber | #F5A623 | #CC8A10 |
| Lime | #5CC93E | #44A82B |
| Rose | #F43F5E | #D1293F |
| Peach | #FF8F6B | #D96E4A |
| Teal | #38C9BE | #2AA89E |

Claude topics may use terracotta #D97757 as the accent. Text on light backgrounds is #333333, secondary text #666666.

### 60-30-10

The ratio is for the whole slide, not per component. 60% background, 30% text blocks and containers, 10% one accent on the single most important element. Two accents on one slide is a mistake. Accent at 20% or more kills the impact.

## Typography

| Slot | Font | Size and weight |
| - | - | - |
| Hero (cover) | SF Pro Display, fallback Inter | 72px, weight 800, condensed tracking, max two lines |
| Slide headline | SF Pro Display, fallback Inter | 56 to 64px, weight 700 |
| Body | SF Pro Text, fallback Inter | 34px, weight 400, line height 1.3. Readable on a phone at arm's length |
| Label and badge | SF Pro Text | 18 to 20px, weight 500, uppercase with tracking |
| Code and file paths | JetBrains Mono, fallback Menlo | 24 to 28px, weight 400 |
| Text inside dark mockup cards | Same stack | 13 to 15px minimum, never smaller |

Maximum three weights per carousel. Hierarchy comes from size, not decoration. Serif only for an editorial family, never mixed into a mockup family.

## Depth

Every card, plate, folder, device or screenshot on a light background lifts off the page with a two-layer shadow. One soft shadow reads as a sticker.

| Layer | Colour | Blur | Offset Y |
| - | - | - | - |
| Ambient | rgba(17,17,22, 0.15) | 48 to 60px | 17 to 22px |
| Contact | rgba(17,17,22, 0.26) | 15 to 20px | 7 to 10px |

Screenshot and window frames get a 1.5px black outline plus an 18px blur shadow, 6px down, at 25% opacity. Never a 3px outline, never a gradient outline. Folder and card shapes carry a 1px white highlight along the top edge and use the deep tone of their accent on the shaded side.

## Design families (pick one per carousel, never mix)

| Family | Use for | Signature |
| - | - | - |
| Finder | Setup, folder structure, systems | macOS window chrome, cream background, coloured folders, dark mockup cards, folder alternates left and right |
| VS Code mockup | Files, commands, config, CLAUDE.md | Light Modern editor, file tree left, editor right, real file names, window title carries my name |
| Editorial steps | Step by step, roadmaps | Alternating light and dark slides, step pills, large watermark numbers, callout boxes |
| Category cards | Tool stacks, comparisons | 80px rounded icon plates on a two-layer shadow, one accent per card, stacked rows |
| Seamless canvas | Lists, timelines, A to Z | One continuous canvas split into slides, a bold element crosses every boundary |

## Seamless rules

- Design the whole canvas first, then split. Slide boundaries fall every 1080px.
- Something bold and high opacity crosses every cut line: a large shape cut halfway, a display headline split mid-word, a device or illustration bleeding across, a continuous path. Faint hints at low opacity do not count.
- Body text never crosses a boundary. Faces never sit on a boundary. CTAs never sit on a boundary.
- Every export slide is cropped from the same continuous render so the joins are exact.

## Cover slide

- One dominant visual element, never a collage. The winning hook is the only text, plus a small badge.
- Hook at 72px weight 800, breaks into two lines, sits in the top half so it survives the profile grid crop.
- The design family is announced here: the window chrome, the keyboard, the folder. Slide 1 sets the mechanism the rest of the carousel uses.
- Accent appears once, on the badge or one highlighted word.

## Inner slides

- One idea per slide. Headline, body, one visual. Content fills 80% or more of the vertical space, no dead zones.
- Mockups are realistic: real repo names, real file paths, real terminal output, my project names. Never lorem ipsum, never placeholder text.
- Slide indicators are characters or numbered pills, never a row of dots.
- Alternate composition left and right across slides so the swipe has rhythm.

## CTA slide

- Top: the family's character or mark, large.
- follow for more. at 72px weight 800.
- A thin 60px divider.
- comment at 32px grey, then the keyword in a white pill with the two-layer shadow, in curly double quotes: "SETUP".
- One line at 32px grey stating what they get.
- @leadgenman at the bottom. Nothing else on the slide.

## Banned on sight

- Dots connected by lines, constellations, particle fields, dot grids, blueprint grids, low-opacity arcs, glass panels, random blobs. Anything that could be described as scatter and connect.
- Flat primary accents. Pastel or dusty rose palettes. Pure #FFFFFF or #000000 backgrounds outside the Lead Gen Man block.
- Dot slide indicators. 3px outlines. Single flat shadows. Text under 13px anywhere.
- Another creator's artwork, layout file, illustration or thumbnail. Formats can be studied, assets cannot be reused.
