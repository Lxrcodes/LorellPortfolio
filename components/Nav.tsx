"use client";

import { useEffect, useState } from "react";
import gsap from "gsap";

const navLinks = [
  { label: "Work", href: "#work" },
  { label: "Running", href: "#running" },
  { label: "Experience", href: "#experience" },
  { label: "Contact", href: "#contact" },
];

export default function Nav() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Animate menu overlay in/out
  useEffect(() => {
    const overlay = document.getElementById("mobile-menu");
    if (!overlay) return;

    if (menuOpen) {
      gsap.set(overlay, { display: "flex" });
      gsap.fromTo(
        overlay,
        { opacity: 0 },
        { opacity: 1, duration: 0.3, ease: "power2.out" }
      );
      gsap.fromTo(
        "#mobile-menu-links > *",
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.4, stagger: 0.07, ease: "power3.out", delay: 0.1 }
      );
      document.body.style.overflow = "hidden";
    } else {
      gsap.to(overlay, {
        opacity: 0,
        duration: 0.25,
        ease: "power2.in",
        onComplete: () => { gsap.set(overlay, { display: "none" }); },
      });
      document.body.style.overflow = "";
    }
  }, [menuOpen]);

  const handleLinkClick = (href: string) => {
    setMenuOpen(false);
    // Small delay lets the menu close before scroll
    setTimeout(() => {
      const el = document.querySelector(href);
      el?.scrollIntoView({ behavior: "smooth" });
    }, 300);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled ? "py-4" : "py-6"
        }`}
      >
        <div className="max-w-[1400px] mx-auto px-6 md:px-12 flex items-center justify-between">
          {/* Logo */}
          <button
            onClick={scrollToTop}
            className="font-display text-2xl text-sand hover:text-coral transition-colors"
          >
            L—
          </button>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="font-mono text-sm text-muted hover:text-coral transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="md:hidden font-mono text-sm text-muted hover:text-coral transition-colors"
            aria-label="Toggle menu"
          >
            {menuOpen ? "Close" : "Menu"}
          </button>
        </div>
      </nav>

      {/* Mobile menu overlay */}
      <div
        id="mobile-menu"
        className="fixed inset-0 bg-ink z-[49] flex-col items-center justify-center hidden"
      >
        {/* Noise overlay matches the body */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.03]"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
          }}
        />

        <nav id="mobile-menu-links" className="flex flex-col items-center gap-8">
          {navLinks.map((link) => (
            <button
              key={link.href}
              onClick={() => handleLinkClick(link.href)}
              className="font-display text-6xl text-sand hover:text-coral transition-colors opacity-0"
            >
              {link.label}
            </button>
          ))}
        </nav>

        {/* Availability badge */}
        <div className="absolute bottom-12 flex items-center gap-3">
          <div className="w-2 h-2 bg-green rounded-full animate-green-pulse" />
          <span className="font-mono text-sm text-muted">Available for projects</span>
        </div>
      </div>
    </>
  );
}
