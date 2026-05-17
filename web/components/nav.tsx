"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/", label: "Dashboard" },
  { href: "/council", label: "Council Chamber" },
  { href: "/time-machine", label: "Time Machine" },
];

export function Nav() {
  const pathname = usePathname();

  return (
    <nav className="border-b border-[#262626] bg-[#161616]/95 backdrop-blur-sm sticky top-0 z-20">
      <div className="max-w-[1400px] mx-auto px-8 py-4 flex items-center justify-between">
        <Link
          href="/"
          className="text-base font-bold tracking-wider text-[#f4f4f4] hover:text-white transition-colors"
        >
          QUORUM
        </Link>

        <div className="flex items-center gap-1">
          {LINKS.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                style={{
                  backgroundColor: active ? "#262626" : "transparent",
                  color: active ? "#f4f4f4" : "#8d8d8d",
                }}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        <span className="text-sm text-[#6f6f6f] font-mono tracking-wide">
          Powered by{" "}
          <span className="font-semibold" style={{ color: "#0f62fe" }}>
            IBM Bob
          </span>
        </span>
      </div>
    </nav>
  );
}
