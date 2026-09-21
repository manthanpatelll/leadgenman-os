'use client';
import Link from 'next/link';

const SF = '-apple-system, SF Pro Display, SF Pro Text, system-ui, sans-serif';

const SLIDES = [
  { num: 1, title: 'Cover', desc: '6 folders + Clawd + hook text', href: '/claude-replaced-team/slide1', ready: true },
  { num: 2, title: 'Content/', desc: 'GitHub, Claude Code, SFX, Trends', href: '/claude-replaced-team/slide2', ready: true },
  { num: 3, title: 'Code/', desc: 'VS Code, Git log, Tests, Stack', href: '/claude-replaced-team/slide3', ready: true },
  { num: 4, title: 'Deploy/', desc: 'Vercel, CLI, CI/CD, Domains', href: '/claude-replaced-team/slide4', ready: true },
  { num: 5, title: 'Research/', desc: 'Web search, Trends, HN, Competitors', href: '/claude-replaced-team/slide5', ready: true },
  { num: 6, title: 'Design/', desc: 'Canvas 2D, Logos, Colors, Export', href: '/claude-replaced-team/slide6', ready: true },
  { num: 7, title: 'Automate/', desc: 'Hooks, MCP, Cron, Auto-commit', href: '/claude-replaced-team/slide7', ready: true },
  { num: 8, title: 'CTA', desc: 'Comment "SETUP" for the guide', href: '/claude-replaced-team/slide8', ready: true },
];

const FOLDER_COLORS = ['#E8654A', '#F5A623', '#5CC93E', '#D97757', '#FF8F6B', '#38C9BE'];

export default function CarouselHub() {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#0A0A0F',
      fontFamily: SF,
      padding: '60px 24px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 40,
    }}>
      <div style={{ textAlign: 'center', maxWidth: 680 }}>
        <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 2, color: '#FF6B35', marginBottom: 12 }}>
          Instagram Carousel
        </div>
        <h1 style={{ fontSize: 32, fontWeight: 700, color: '#FFFFFF', margin: 0 }}>
          My Claude Code setup that replaced a 5-person team
        </h1>
        <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', marginTop: 8 }}>
          8 slides &middot; 1080 x 1350 &middot; PNG export at 4x
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%', maxWidth: 480 }}>
        {SLIDES.map(s => (
          <Link key={s.num} href={s.href} style={{ textDecoration: 'none' }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 16,
              padding: '14px 18px', borderRadius: 12,
              border: '1px solid rgba(255,255,255,0.06)',
              background: 'rgba(255,255,255,0.02)',
              cursor: 'pointer',
            }}>
              <div style={{
                width: 32, height: 32, borderRadius: 8,
                background: s.num <= 1 ? 'rgba(255,107,53,0.12)' : s.num === 8 ? 'rgba(255,107,53,0.12)' : `${FOLDER_COLORS[s.num - 2]}18`,
                color: s.num <= 1 ? '#FF6B35' : s.num === 8 ? '#FF6B35' : FOLDER_COLORS[s.num - 2],
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 13, fontWeight: 700,
              }}>{s.num}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#FFFFFF' }}>{s.title}</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>{s.desc}</div>
              </div>
              <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 14 }}>&rarr;</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
