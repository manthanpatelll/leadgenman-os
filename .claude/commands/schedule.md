# /schedule

Take an approved carousel file, render it through the design system, and book it into the next open slot on Instagram.

Carousel file: $ARGUMENTS

If $ARGUMENTS is empty, list every file in content/carousels/ with status approved and ask which one. Do not schedule anything without a file.

## 0. Load context

1. strategy.md (weekly calendar and platform priorities)
2. offers.md (to verify the CTA is a real offer)
3. current-data.md (to verify every number in the copy)
4. systems/brand-voice.md
5. systems/carousel-design-system.md
6. The carousel file itself, in full

## 1. Gate the file

Refuse to continue unless every check passes. Print each check with pass or fail.

- Status is approved. Draft, killed and scheduled files are rejected with the reason.
- Exactly one keyword, wrapped in curly double quotes, present on the CTA slide and in the caption.
- The offer on the CTA slide matches a row in offers.md for this content type.
- Every number in the slides and caption appears in current-data.md.
- Caption is 500 words or more and contains zero hashtags.
- Copy lint: no em dashes, no "no X, no Y, no Z" lists, no three-word dramatic fragments, no emojis, no mention of another creator, the community is never called free.
- Slide count is between 8 and 20.

A failed gate stops the run. Print what to fix and where. Do not fix copy silently.

## 2. Render the slides

Render every slide through systems/carousel-design-system.md:

- 1080 x 1350 per slide, exported at 4x (4320 x 5400), PNG.
- The visual note on each slide decides the layout. The design family, palette and type pairing are fixed for the whole carousel and never change between slides.
- Cover slide, inner slides and CTA slide follow their own rule blocks in the design system.
- Produce three outputs in exports/<slug>/: one PNG per slide at 4x, one zip of all slides, one PDF of all slides for the LinkedIn version.
- Open the export folder for a visual check. Confirm the cover is readable at phone size, the CTA keyword is in curly quotes, and nothing important sits inside 50px of any edge.

## 3. Pick the slot

- Find the carousel type's day in the weekly calendar in strategy.md.
- Take the next occurrence of that day that has no other carousel already scheduled in content/carousels/.
- Posting time is the carousel time in strategy.md. If none is set, use 6:00 PM Dubai time.
- Friday is never a carousel slot. If the math lands on a Friday, move to Saturday.
- Print the chosen date, time and the reason the slot was picked.

## 4. Send to the Instagram scheduler

Create one scheduled carousel post in the Instagram scheduler with:

- All slide images in order
- The caption from the file
- The scheduled time from step 3
- Post type: carousel, account @leadgenman

Wait for the scheduler to return a confirmation ID. If the scheduler errors, print the error, leave the file status as approved, and stop. Never retry blindly and never publish immediately as a fallback.

## 5. Write the confirmation back

Update the metadata table at the top of the carousel file:

- status: scheduled
- scheduled_for: the date and time
- scheduler_id: the confirmation ID
- exported: exports/<slug>/ with slide count and resolution

Then print this block and stop:

```
SCHEDULED
File:        content/carousels/YYYY-MM-DD-<slug>.md
Hook:        <winning hook>
Slides:      <n> at 4320 x 5400
Keyword:     "<KEYWORD>"
Slot:        <Day DD Mon YYYY, HH:MM Dubai>
Scheduler:   <confirmation ID>
Next check:  reply to keyword comments within the first hour
```

## After publish

Fourteen days after the post goes live, move the file to archives/ per archives/README.md. Do not do this inside /schedule.
