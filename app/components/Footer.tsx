"use client";

const SOCIAL_LINKS = [
  { label: "Instagram", href: "#" },
  { label: "Facebook", href: "#" },
  { label: "TripAdvisor", href: "#" },
];

const serif = "var(--font-cinematic, serif)";

export default function Footer() {
  return (
    <footer
      style={{
        background: "#040404",
        borderTop: "1px solid rgba(255,255,255,0.05)",
        padding: "clamp(3.5rem, 7vw, 6rem) clamp(1.5rem, 8vw, 8rem) clamp(2rem, 4vw, 3rem)",
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "clamp(2rem, 4vw, 4rem)",
        }}
      >
        {/* Brand column */}
        <div>
          <p
            style={{
              fontFamily: serif,
              fontSize: "clamp(1rem, 1.6vw, 1.25rem)",
              fontWeight: 400,
              letterSpacing: "0.3em",
              color: "#ffffff",
              marginBottom: "1.2rem",
            }}
          >
            FORNO NERO
          </p>
          <p
            style={{
              fontFamily: serif,
              fontSize: "0.72rem",
              letterSpacing: "0.08em",
              color: "rgba(161,161,170,0.35)",
              lineHeight: 1.9,
            }}
          >
            Via dei Tribunali 94
            <br />
            80138 Naples, Italy
          </p>
        </div>

        {/* Hours column */}
        <div>
          <p
            style={{
              fontFamily: serif,
              fontSize: "0.52rem",
              letterSpacing: "0.48em",
              textTransform: "uppercase",
              color: "rgba(251,191,36,0.42)",
              marginBottom: "1.3rem",
            }}
          >
            Hours
          </p>
          <p
            style={{
              fontFamily: serif,
              fontSize: "0.78rem",
              color: "rgba(161,161,170,0.38)",
              lineHeight: 2.1,
            }}
          >
            Tuesday — Saturday
            <br />
            19:00 — 23:00
            <br />
            Closed Sunday & Monday
          </p>
        </div>

        {/* Contact / social column */}
        <div>
          <p
            style={{
              fontFamily: serif,
              fontSize: "0.52rem",
              letterSpacing: "0.48em",
              textTransform: "uppercase",
              color: "rgba(251,191,36,0.42)",
              marginBottom: "1.3rem",
            }}
          >
            Follow
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.65rem" }}>
            {SOCIAL_LINKS.map(({ label, href }) => (
              <a
                key={label}
                href={href}
                style={{
                  fontFamily: serif,
                  fontSize: "0.72rem",
                  letterSpacing: "0.12em",
                  color: "rgba(161,161,170,0.38)",
                  textDecoration: "none",
                  transition: "color 0.3s ease",
                  width: "fit-content",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.color = "rgba(251,191,36,0.65)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.color = "rgba(161,161,170,0.38)")
                }
              >
                {label}
              </a>
            ))}
          </div>
        </div>

        {/* Reservations column */}
        <div>
          <p
            style={{
              fontFamily: serif,
              fontSize: "0.52rem",
              letterSpacing: "0.48em",
              textTransform: "uppercase",
              color: "rgba(251,191,36,0.42)",
              marginBottom: "1.3rem",
            }}
          >
            Reservations
          </p>
          <a
            href="mailto:reservations@fornonero.com"
            style={{
              display: "block",
              fontFamily: serif,
              fontSize: "0.72rem",
              letterSpacing: "0.06em",
              color: "rgba(161,161,170,0.38)",
              textDecoration: "none",
              transition: "color 0.3s ease",
              marginBottom: "0.65rem",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.color = "rgba(251,191,36,0.65)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.color = "rgba(161,161,170,0.38)")
            }
          >
            reservations@fornonero.com
          </a>
          <a
            href="tel:+390815551234"
            style={{
              display: "block",
              fontFamily: serif,
              fontSize: "0.72rem",
              letterSpacing: "0.06em",
              color: "rgba(161,161,170,0.38)",
              textDecoration: "none",
              transition: "color 0.3s ease",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.color = "rgba(251,191,36,0.65)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.color = "rgba(161,161,170,0.38)")
            }
          >
            +39 081 555 1234
          </a>
        </div>
      </div>

      {/* Bottom bar */}
      <div
        style={{
          maxWidth: 1200,
          margin: "clamp(2.5rem, 4vw, 4rem) auto 0",
          paddingTop: "2rem",
          borderTop: "1px solid rgba(255,255,255,0.04)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "0.8rem",
        }}
      >
        <p
          style={{
            fontFamily: serif,
            fontSize: "0.52rem",
            letterSpacing: "0.32em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.1)",
          }}
        >
          © 2026 Forno Nero. All rights reserved.
        </p>
        <p
          style={{
            fontFamily: serif,
            fontSize: "0.52rem",
            letterSpacing: "0.32em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.1)",
          }}
        >
          Crafted with Fire
        </p>
      </div>
    </footer>
  );
}
