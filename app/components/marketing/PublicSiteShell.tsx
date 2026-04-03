"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import type { ReactNode } from "react";

type PublicSiteShellProps = {
  activePath: "/" | "/about" | "/contact" | "/donate" | "/impact" | "/volunteer" | "/verify";
  children: ReactNode;
};

const navItems = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/volunteer", label: "Volunteer" },
  { href: "/impact", label: "Impact Map" },
  { href: "/contact", label: "Contact" },
] as const;

function navClass(active: boolean) {
  return active ? "nav-link active" : "nav-link";
}

export function PublicSiteShell({ activePath, children }: PublicSiteShellProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <main className="static-site">
      <header className="site-header">
        <div className="container header-inner">
          <div className="brand-section">
            <Image src="/logo.png" alt="Help Me Help You logo" width={48} height={48} className="logo" />
            <Link href="/" className="brand">
              Help Me Help you
            </Link>
          </div>

          <nav className={`nav${menuOpen ? " active" : ""}`} aria-label="Primary navigation" id="nav-menu">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={navClass(activePath === item.href)}
                onClick={() => setMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <button
            className="menu-toggle"
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
            aria-controls="nav-menu"
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
          >
            ☰
          </button>
        </div>
      </header>

      {children}

      <footer className="site-footer">
        <div className="container footer-inner">
          <div className="footer-bottom">
            <div className="footer-left">
              <Link href="/login" className="footer-admin-link">
                Admin
              </Link>
            </div>
            <div className="footer-right">
              <p>© 2026 Help me Help you NGO — Nagpur, MH</p>
              <div className="socials">
                <a href="https://youtube.com" target="_blank" rel="noreferrer" aria-label="YouTube">
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      fill="currentColor"
                      d="M23.5 6.2a2.97 2.97 0 0 0-2.09-2.1C19.54 3.6 12 3.6 12 3.6s-7.54 0-9.41.5A2.97 2.97 0 0 0 .5 6.2 31.4 31.4 0 0 0 0 12a31.4 31.4 0 0 0 .5 5.8 2.97 2.97 0 0 0 2.09 2.1c1.87.5 9.41.5 9.41.5s7.54 0 9.41-.5a2.97 2.97 0 0 0 2.09-2.1A31.4 31.4 0 0 0 24 12a31.4 31.4 0 0 0-.5-5.8ZM9.6 15.63V8.37L15.84 12 9.6 15.63Z"
                    />
                  </svg>
                </a>
                <a
                  href="https://www.facebook.com/GauravPrakashKohale"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Facebook"
                >
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      fill="currentColor"
                      d="M13.5 21v-7h2.35l.35-2.73H13.5V9.53c0-.79.22-1.33 1.35-1.33h1.44V5.76c-.25-.03-1.11-.1-2.12-.1-2.1 0-3.54 1.28-3.54 3.64v1.97H8.25V14h2.38v7h2.87Z"
                    />
                  </svg>
                </a>
                <a href="https://instagram.com" target="_blank" rel="noreferrer" aria-label="Instagram">
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      fill="currentColor"
                      d="M7.75 2h8.5A5.75 5.75 0 0 1 22 7.75v8.5A5.75 5.75 0 0 1 16.25 22h-8.5A5.75 5.75 0 0 1 2 16.25v-8.5A5.75 5.75 0 0 1 7.75 2Zm0 1.8A3.95 3.95 0 0 0 3.8 7.75v8.5a3.95 3.95 0 0 0 3.95 3.95h8.5a3.95 3.95 0 0 0 3.95-3.95v-8.5a3.95 3.95 0 0 0-3.95-3.95h-8.5Zm8.9 1.35a1.1 1.1 0 1 1 0 2.2 1.1 1.1 0 0 1 0-2.2ZM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 1.8A3.2 3.2 0 1 0 12 15.2 3.2 3.2 0 0 0 12 8.8Z"
                    />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
