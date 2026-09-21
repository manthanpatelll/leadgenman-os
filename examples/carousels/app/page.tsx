import Link from "next/link";

const CORAL = "#FF6B35";

type Example = {
  title: string;
  description: string;
  canvas: string;
  href: string;
};

const EXAMPLES: Example[] = [
  {
    title: "AI Dictionary (9-slide seamless keyboard carousel)",
    description:
      "Nine AI terms on a keyboard that runs seamlessly across the whole carousel, one letter per slide.",
    canvas: "1080 x 1440, 9 slides",
    href: "/ai-dictionary",
  },
  {
    title: "My Claude Code Setup That Replaced a 5-Person Team (8-slide Finder carousel)",
    description:
      "A macOS Finder window per slide, each folder opening into the tools that replaced one role.",
    canvas: "1080 x 1350, 8 slides",
    href: "/claude-replaced-team",
  },
  {
    title: "Claude Code Finder Folders (3 slides)",
    description:
      "Three square slides of Finder folders with the Clawd mascot, plus a side-by-side sheet export.",
    canvas: "1080 x 1080, 3 slides",
    href: "/claude-code-folders",
  },
];

export default function IndexPage() {
  return (
    <main
      className="min-h-screen flex flex-col items-center px-6 py-16"
      style={{ background: "#0c0c10", color: "#ededed" }}
    >
      <div className="w-full max-w-2xl">
        <p
          className="text-[11px] uppercase tracking-[2px] mb-3"
          style={{ color: CORAL }}
        >
          Canvas 2D carousel editors
        </p>
        <h1 className="text-3xl font-bold m-0">Carousel Examples</h1>
        <p className="text-sm mt-2" style={{ color: "rgba(255,255,255,0.5)" }}>
          Three Instagram carousels drawn on canvas. Open one, tweak the fields, export at 4x.
        </p>

        <div className="flex flex-col gap-3 mt-10">
          {EXAMPLES.map((ex) => (
            <Link key={ex.href} href={ex.href} className="no-underline">
              <div
                className="rounded-xl p-5 transition-colors"
                style={{
                  border: "1px solid rgba(255,255,255,0.08)",
                  background: "rgba(255,255,255,0.02)",
                }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-base font-semibold" style={{ color: "#ffffff" }}>
                      {ex.title}
                    </div>
                    <div className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.55)" }}>
                      {ex.description}
                    </div>
                    <div
                      className="text-xs mt-3 font-mono"
                      style={{ color: CORAL }}
                    >
                      {ex.canvas}
                    </div>
                  </div>
                  <span className="text-lg" style={{ color: "rgba(255,255,255,0.25)" }}>
                    &rarr;
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <footer className="mt-16 text-sm" style={{ color: "rgba(255,255,255,0.45)" }}>
          Made by Manthan Patel,{" "}
          <a
            href="https://www.instagram.com/leadgenman/"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: CORAL, textDecoration: "none" }}
          >
            @leadgenman
          </a>
        </footer>
      </div>
    </main>
  );
}
