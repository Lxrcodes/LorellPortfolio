export interface Project {
  id: string;
  name: string;
  role: string;
  headline: string;
  description: string;
  tags: string[];
  status?: string;
  url?: string | null;
  featured?: boolean;
  image?: string;
  macbookImage?: string;
  phoneImage?: string;
}

export const projects: Project[] = [
  {
    id: "tipperconnect",
    name: "TipperConnect",
    role: "Developer · 2025–present",
    headline: "The UK's first two-sided marketplace for construction waste haulage.",
    description:
      "Site managers book licensed tipper trucks. Quarries and contractors manage jobs and fleets. Built with Stripe Connect for split payments and the DEFRA Digital Waste Tracking API for compliance.",
    tags: ["Next.js", "Stripe Connect", "DEFRA API", "B2B Marketplace"],
    url: "https://tipperconnect.co.uk/",
    macbookImage: "/images/projects/macbook/tipperconnect-macbook.png",
    phoneImage: "/images/projects/phone/tipperconnect-phone.png",
  },
  {
    id: "check-a-truck",
    name: "CheckATruck",
    role: "Freelance · 2025",
    headline: "Digital vehicle inspection platform for commercial HGV fleets.",
    description:
      "A DVSA-compliant daily walkaround check tool replacing paper forms with a fast, mobile-first digital workflow. Drivers log defects on the go, fleet managers review live status, and compliance evidence is always audit-ready.",
    tags: ["Fleet Management", "Next.js", "Mobile-first", "HGV", "Compliance"],
    url: "https://checkatruck.co.uk/",
    macbookImage: "/images/projects/macbook/check-a-truck-macbook.png",
    phoneImage: "/images/projects/phone/check-a-truck-phone.png",
  },
  {
    id: "pt-with-peter",
    name: "PT with Peter",
    role: "Freelance · 2025",
    headline: "Landing page and client portal for a London-based personal trainer.",
    description:
      "Lead capture, programme overview, and a private client area for session tracking and check-ins. Clean, conversion-focused, fast.",
    tags: ["React", "Client portal", "Landing page"],
    url: "https://ptwithpeter.netlify.app/",
    macbookImage: "/images/projects/macbook/pt-with-peter-maccbook.png",
    phoneImage: "/images/projects/phone/pt-with-peter-phone.png",
  },
  {
    id: "purple-haze-tattoos",
    name: "Purple Haze Tattoos",
    role: "Freelance · 2025",
    headline: "Full branding and booking site for a tattoo artist.",
    description:
      "Custom identity, portfolio gallery, and an integrated booking flow — built to match the artist's aesthetic without looking like a template.",
    tags: ["Branding", "Webflow", "Booking integration"],
    url: "https://purplehazetattoos.netlify.app/",
    macbookImage: "/images/projects/macbook/purple-haze-tattoos-macbook.png",
    phoneImage: "/images/projects/phone/purple-haze-tattoos-phone.png",
  },
  {
    id: "oxevo",
    name: "Oxevo",
    role: "Side project · 2026",
    headline: "Instagram analytics for creators who are serious about growth.",
    description:
      "Connect your account and get a clean breakdown of your top-performing posts, best times to post, and a weekly digest — without the noise of native Instagram insights. Built with a shareable monthly report card, streak tracking, and a creator discovery feed. Pro features from £7/month.",
    tags: ["Next.js", "Supabase", "Stripe", "Instagram API", "SaaS"],
    url: null,
    macbookImage: "/images/projects/macbook/oxevo-macbook.png",
    phoneImage: "/images/projects/phone/oxevo-phone.png",
  },
  {
    id: "ask-security",
    name: "ASK Security",
    role: "Freelance · 2026",
    headline: "End-to-end UX and SEO audit for a UK physical security firm.",
    description:
      "Delivered as a 23-page report with prioritised recommendations, a full redesign brief, and partial implementation. The kind of work that turns 'our website doesn't convert' into a clear roadmap.",
    tags: ["UX audit", "SEO", "Redesign brief", "Implementation"],
    url: "https://asksecurity.co.uk/",
    macbookImage: "/images/projects/macbook/ask-security-macbook.png",
    phoneImage: "/images/projects/phone/ask-security-phone.png",
  },
  {
    id: "delucas-deli",
    name: "Delucas Deli",
    role: "Freelance · 2024",
    headline: "Restaurant website with a full online menu for a neighbourhood deli-cafe.",
    description:
      "Built in React and TypeScript for a local food establishment — covering brand presentation, the full deli menu, and a clean customer-facing experience.",
    tags: ["React", "TypeScript", "Online Menu", "Food & Beverage"],
    url: "https://delucas.co.uk/",
    macbookImage: "/images/projects/macbook/delucas-deli-macbook.png",
    phoneImage: "/images/projects/phone/delucas-deli-phone.png",
  },
];
