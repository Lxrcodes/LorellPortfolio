import Hero from "@/components/Hero";
import RouteCanvas from "@/components/RouteCanvas";
import JourneySection from "@/components/JourneySection";
import ProjectsGrid from "@/components/ProjectsGrid";
import StravaStatsWrapper from "@/components/StravaStatsWrapper";
import Timeline from "@/components/Timeline";
import FinishSection from "@/components/FinishSection";

export default function Home() {
  return (
    <main className="relative z-[2]">
      {/* Marathon route canvas - fixed behind content */}
      <RouteCanvas />

      {/* Hero section */}
      <Hero />

      {/* Work intro section */}
      <JourneySection
        number="01"
        label="The work"
        heading="BUILT TO LAST"
        body="From founding a B2B marketplace to e-commerce builds, brand identities and enterprise audits — every project gets the same obsessive attention I give to race day. No half-measures."
      />

      {/* Projects grid */}
      <ProjectsGrid />

      {/* Running intro section */}
      <JourneySection
        id="running"
        number="02"
        label="The runner"
        heading="42.2KM OF PROOF"
        body="London Marathon 2025. 3:40 PB. The same traits that carry you through mile 22 — showing up, managing pace, refusing to quit — are what I bring to every project. No exceptions."
      />

      {/* Strava stats */}
      <StravaStatsWrapper />

      {/* Experience timeline */}
      <Timeline />

      {/* Finish / Contact section */}
      <FinishSection />
    </main>
  );
}
