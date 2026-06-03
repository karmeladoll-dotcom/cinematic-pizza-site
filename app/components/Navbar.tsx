"use client";

import { useEffect, useState } from "react";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navLinks = [
    { label: "Menu", href: "#menu" },
    { label: "Story", href: "#story" },
    { label: "Reserve", href: "#reservation" },
  ];

  return (
    <nav
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 40,
        transition: "background 0.7s ease, backdrop-filter 0.7s ease, box-shadow 0.7s ease",
        background: scrolled ? "rgba(5,5,5,0.92)" : "transparent",
        backdropFilter: scrolled ? "blur(24px) saturate(180%)" : "none",
        WebkitBackdropFilter: scrolled ? "blur(24px) saturate(180%)" : "none",
        boxShadow: scrolled ? "0 1px 0 rgba(255,255,255,0.04)" : "none",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "clamp(1rem, 2vw, 1.5rem) clamp(1.5rem, 6vw, 5rem)",
          maxWidth: 1600,
          margin: "0 auto",
        }}
      >
        {/* Logo */}
        <a
          href="#"
          style={{
            fontFamily: "var(--font-cinematic, serif)",
            fontSize: "clamp(0.9rem, 1.5vw, 1.2rem)",
            fontWeight: 400,
            letterSpacing: "0.32em",
            color: "#ffffff",
            textDecoration: "none",
            flexShrink: 0,
          }}
        >
          FORNO NERO
        </a>

        {/* Desktop nav */}
        <ul
          className="hidden md:flex"
          style={{
            alignItems: "center",
            gap: "2.8rem",
            listStyle: "none",
            margin: 0,
            padding: 0,
          }}
        >
          {navLinks.map(({ label, href }) => (
            <li key={label}>
              <a
                href={href}
                style={{
                  fontFamily: "var(--font-cinematic, serif)",
                  fontSize: "0.6rem",
                  letterSpacing: "0.4em",
                  textTransform: "uppercase",
                  color: "rgba(161,161,170,0.7)",
                  textDecoration: "none",
                  transition: "color 0.3s ease",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#fbbf24")}
                onMouseLeave={(e) =>
                  (e.currentTarget.style.color = "rgba(161,161,170,0.7)")
                }
              >
                {label}
              </a>
            </li>
          ))}
        </ul>

        {/* CTA button */}
        <a
          href="#reservation"
          className="hidden md:block"
          style={{
            fontFamily: "var(--font-cinematic, serif)",
            fontSize: "0.58rem",
            letterSpacing: "0.3em",
            textTransform: "uppercase",
            color: "rgba(251,191,36,0.65)",
            border: "1px solid rgba(251,191,36,0.28)",
            padding: "0.6rem 1.5rem",
            textDecoration: "none",
            transition: "all 0.35s ease",
            flexShrink: 0,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "#fbbf24";
            e.currentTarget.style.borderColor = "rgba(251,191,36,0.75)";
            e.currentTarget.style.boxShadow =
              "0 0 28px rgba(251,191,36,0.14), inset 0 0 28px rgba(251,191,36,0.04)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "rgba(251,191,36,0.65)";
            e.currentTarget.style.borderColor = "rgba(251,191,36,0.28)";
            e.currentTarget.style.boxShadow = "none";
          }}
        >
          Book a Table
        </a>
      </div>
    </nav>
  );
}
