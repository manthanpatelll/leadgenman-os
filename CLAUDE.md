# Lead Gen Man Content OS

This folder is the operating system behind my Instagram content. Plain markdown holds the context, slash commands run the systems, one file per carousel comes out the other end. Read this file first in every session, then follow the load order below before touching any task.

## What lives here

| Path | What it is |
| - | - |
| personal-info.md | Who I am, how I talk, what I build, what I never say |
| business-info.md | Lead Gen Man, PenAnywhere, TiltIt, the newsletter, the community |
| offers.md | Every offer, its price, its keyword style, which content type plugs which offer |
| strategy.md | Pillars, the net new value filter, weekly calendar, funnel, what I never post |
| current-data.md | The only numbers allowed in copy. If it is not here, it does not get written |
| systems/brand-voice.md | Voice rules. Every line of copy obeys this file |
| systems/carousel-design-system.md | Format, colour, type, shadows, cover and CTA rules, export |
| systems/hook-rubric-20pt.md | Ten criteria, zero to two each. Every hook gets scored against it |
| systems/carousel-types.md | The eight carousel types, when to use each, slide skeletons, CTA style |
| references/ | Study material. Formats can be borrowed, words and artwork cannot |
| content/carousels/ | Output. One markdown file per carousel, status tracked at the top |
| archives/ | Published pieces, moved here 14 days after they go live |

## Load order before any content task

Read these in full, in this order, before writing a single word:

1. personal-info.md
2. business-info.md
3. offers.md
4. strategy.md
5. current-data.md
6. systems/brand-voice.md

Then load the system files the task needs. Carousel work always adds systems/carousel-design-system.md, systems/hook-rubric-20pt.md and systems/carousel-types.md. Never skip a file because the task looks small. The context is the product, the command is just the trigger.

## Voice

All copy follows systems/brand-voice.md. The rules that slip most often are repeated here so they cannot be missed:

- First person, present tense, one idea per sentence. Sounds like me talking to one person.
- Specific beats impressive. Name the tool, the file, the command, the result.
- Never the "no X, no Y, no Z" list. Never a three-word dramatic fragment. Never a "here is why this matters" bridge. Tell it straight.
- No em dashes. Commas and full stops do the work.
- No emojis in slide copy. No hashtags anywhere.

## Slash commands

| Command | Input | What it does | Output |
| - | - | - | - |
| /carousel <core idea> | One sentence describing the idea | Runs the full carousel system: loads context, picks the type, decides structure, writes three cover hooks and scores them, builds every slide in my voice with pattern interrupts, ends with the matching CTA, stops for approval | content/carousels/YYYY-MM-DD-<slug>.md with status draft |
| /hooks <idea> | One sentence | Writes ten hooks, scores each against the rubric, returns the top three with the score table | Printed in the session, nothing written |
| /schedule <file> | Path to an approved carousel file | Lints the copy, renders slides through the design system, picks the next slot from strategy.md, sends it to the Instagram scheduler, writes the confirmation back into the file | Same file with status scheduled |

Commands live in .claude/commands/. One command per repeatable job. If a job is done twice by hand, it becomes a command.

## Brand quick reference

- Lead Gen Man assets: brand green #9cff1e on black.
- Personal brand assets: coral #FF6B35 on an off-white background.
- Handle everywhere: @leadgenman. Site: leadgenman.com. Email: manthan@leadgenman.com.
- Products I own: PenAnywhere and TiltIt. Community: AI Inner Circle on Skool, paid, never described as free.

## Hard rules

1. Facts come from the markdown files. A number that is not in current-data.md does not get written.
2. Never reproduce another creator's script, list, artwork or layout. A format is fair game, the words are not.
3. Every idea passes the net new value filter in strategy.md before a single slide is written. Fail one gate, stop and say so.
4. Every cover hook is scored against systems/hook-rubric-20pt.md. Below 17 does not start the build.
5. One CTA per piece, one keyword per piece, keyword in curly double quotes. Pull the offer from offers.md, never improvise one.
6. Stop for approval before scheduling. No exceptions, no auto-publish.
7. Every carousel is 1080 x 1350 per slide and exports at 4x.
8. One carousel per run. Finish it, get approval, then start the next.
9. Do not edit the context files during a content run. If something looks stale, flag it at the end of the output, do not fix it silently.
10. Nothing in this folder, and nothing it produces, mentions the tooling behind it. The output is mine.

## Session start checklist

- Read this file.
- Read the six context files in order.
- Check content/carousels/ for anything with status draft or approved that is waiting on me.
- Then, and only then, take the task.
