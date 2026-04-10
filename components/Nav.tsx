"use client";

import { useEffect, useState } from "react";

const navLinks = [
  { label: "Work", href: "#work" },
  { label: "Running", href: "#running" },
  { label: "Experience", href: "#experience" },
  { label: "Contact", href: "#contact" },
];

export default function Nav() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
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

        {/* Nav Links */}
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

        {/* Mobile menu button */}
        <button className="md:hidden font-mono text-sm text-muted hover:text-coral transition-colors">
          Menu
        </button>
      </div>
    </nav>
  );
}
