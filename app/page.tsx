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
        body="From co-founding a B2B marketplace to e-commerce builds, brand identities and enterprise audits - every project gets the same obsessive attention I give to race day. No half-measures."
      />

      {/* Projects grid */}
      <ProjectsGrid />

      {/* Running intro section */}
      <JourneySection
        id="running"
        number="02"
        label="The runner"
        heading="42.2KM OF PROOF"
        body="I've ran 3 Marathons with a 3:40 PB. I bring those same traits that carry me through 26 miles of pain into every project. No exceptions."
        fullHeight={false}
      />

      {/* Paris Marathon video */}
      <section className="px-6 md:px-12 py-8">
        <div className="max-w-[1400px] mx-auto">
          <p className="font-mono text-sm text-muted mb-4">Watch me complete the Paris Marathon 2025</p>
          <div className="aspect-video w-full max-w-3xl">
            <iframe
              className="w-full h-full border border-ink-3"
              src="https://www.youtube.com/embed/XrOkdzodIM4?start=135"
              title="Paris Marathon 2025"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      </section>

      {/* Strava stats */}
      <StravaStatsWrapper />

      {/* Experience timeline */}
      <Timeline />

      {/* Finish / Contact section */}
      <FinishSection />
    </main>
  );
}
