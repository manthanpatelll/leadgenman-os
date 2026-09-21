# /carousel

Build one complete Instagram carousel from a single core idea, in my voice, through my system, then stop for approval.

Core idea: $ARGUMENTS

If $ARGUMENTS is empty, ask for the core idea in one line and stop. Do not guess a topic.

## 0. Load context (in this order, in full)

1. personal-info.md
2. business-info.md
3. offers.md
4. strategy.md
5. current-data.md
6. systems/brand-voice.md
7. systems/carousel-design-system.md
8. systems/carousel-types.md
9. systems/hook-rubric-20pt.md

Then run the core idea through the net new value filter in strategy.md. Print one line per gate (non-obvious, one of none, highly tactical) with pass or fail. If any gate fails, stop and say which one and why. Do not build a carousel that fails the filter.

## 1. Pick the carousel type

Match the core idea against the type table in systems/carousel-types.md. Pick exactly one. Print:

- Type chosen
- Why this type and not the runner-up (one sentence each)
- Which day in the weekly calendar in strategy.md this type belongs to

## 2. Decide the slide structure

Take the skeleton for the chosen type and fill in the slide count. Rules:

- Total slides between 8 and 12 including cover and CTA. Prompt lists may go longer when the count is the hook.
- Slide 1 is always the cover. The last slide is always the CTA.
- Print a one-line plan per slide: slide number, job of the slide, the one thing it must land.
- Mark pattern interrupt slots now, before writing. Place them at roughly one third and two thirds through the body slides. Never on the cover, never on the CTA, never on two adjacent slides. The two interrupts must be different types (see step 4).

## 3. Write three cover hooks and score them

Write three cover hook variations for the core idea. Each hook is at most 12 words and must break across two lines cleanly at 72px. Use different angles: one outcome-led, one mechanism-led, one contrarian or specific-number-led.

Score every hook against all ten criteria in systems/hook-rubric-20pt.md. Print the score table with criteria as rows and hooks as columns, plus a total row. Then:

- 17 to 20: ship it.
- 14 to 16: rewrite the two lowest-scoring criteria, rescore once, print the new table.
- 13 or below: discard and write a fresh set of three.

State the winner and the single sentence that explains why it won. The winner becomes the slide 1 headline word for word.

## 4. Build the carousel slide by slide

Write every slide in my voice per systems/brand-voice.md. For each slide output:

- Headline (max 8 words, this is the display text)
- Body (max 40 words, one idea, reads at scroll speed)
- Visual note (what is on the canvas, using the design family and colours from systems/carousel-design-system.md, with real project names, real file names and real tool names)
- Pattern interrupt marker on the two slots chosen in step 2, with its type

Pattern interrupt types, pick two different ones:

- Format switch: a real screenshot, a terminal, a file tree or a device mockup replaces the text layout.
- Direct question: one question to the reader, no answer on the slide.
- Contrarian line: one sentence that pushes against what the previous slides implied.
- Split slide: left half versus right half, two states side by side.
- Zoom: one detail from an earlier slide blown up to fill the frame.

Retention rules while writing:

- Every body slide ends on something that pulls to the next slide. A half-finished thought, a number without its meaning yet, a step that needs the next step.
- Numbers only from current-data.md. Tools, files and products only from business-info.md and personal-info.md.
- Banned: the "no X, no Y, no Z" list, three-word dramatic fragments, "here is why this matters" bridges, em dashes, emojis, hashtags, any mention of another creator's content.
- Never call the community free. Never say link in bio.

## 5. End with the CTA that matches the content type

Open offers.md, find the row that matches this content type, and use its primary plug and keyword style. The CTA slide always contains, in this order:

1. The keyword in curly double quotes, for example "SETUP"
2. follow for more.
3. @leadgenman

The caption CTA line reads: comment "KEYWORD" and I will send it straight to your DMs. State the value first, then the mechanic. One keyword, one offer, never stacked.

## 6. Write the caption

500 words or more, first person, no hashtags. Opens with the hook restated in a new sentence, then tells the full story of the carousel with more detail than the slides had room for, then the keyword CTA, then one line about the AI Inner Circle with its real price from offers.md.

## 7. Write the file and stop

Write everything to content/carousels/YYYY-MM-DD-<slug>.md using today's date and a short kebab-case slug from the winning hook. The file contains, in order: metadata table (status draft, type, pillar, calendar day, keyword, offer), filter result, hook score table, slide plan, every slide, CTA slide, caption, open questions for me.

Print the file path and the winning hook, then stop. Do not schedule. Wait for one of these replies:

- approved: set status to approved and run /schedule with the file path.
- change <notes>: apply the notes to the affected slides only, rescore the hook if it changed, rewrite the file, stop again.
- kill: set status to killed, leave the file in place for the record.
