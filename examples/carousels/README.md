# Carousel Examples by Lead Gen Man

Three Canvas 2D Instagram carousel editors, extracted from Manthan Patel's private content tooling
and packaged as a standalone Next.js 15 app. Every slide is drawn on a `<canvas>` and exported at 4x.

## Run locally

```bash
npm install
npm run dev
```

Then open http://localhost:3000

## Routes

| Route | What it is | Canvas |
| --- | --- | --- |
| `/ai-dictionary` | AI Dictionary, 9-slide seamless keyboard carousel | 1080 x 1440 per slide |
| `/claude-replaced-team` | Hub for the 8-slide Finder carousel, links to `/claude-replaced-team/slide1` through `slide8` | 1080 x 1350 per slide |
| `/claude-code-folders` | Claude Code Finder folders, 3 slides plus a side-by-side sheet export | 1080 x 1080 per slide |

## Production

```bash
npm run build
PORT=3000 npm run start
```

Made by Manthan Patel, [@leadgenman](https://www.instagram.com/leadgenman/).
