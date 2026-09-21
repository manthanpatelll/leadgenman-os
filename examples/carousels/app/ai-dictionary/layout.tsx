import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Dictionary · Carousel",
  description: "Carousel examples by Lead Gen Man",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
