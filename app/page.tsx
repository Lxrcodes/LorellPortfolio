import Hero from "@/components/Hero";
import AboutSection from "@/components/AboutSection";
import RouteCanvas from "@/components/RouteCanvas";
import ThreeBackground from "@/components/ThreeBackground";
import ProjectsGrid from "@/components/ProjectsGrid";
import RunningSection from "@/components/RunningSection";
import StravaStatsWrapper from "@/components/StravaStatsWrapper";
import Timeline from "@/components/Timeline";
import FinishSection from "@/components/FinishSection";

export default function Home() {
  return (
    <main className="relative z-[2]">
      {/* Painted shader background — lowest layer */}
      <ThreeBackground />

      {/* Marathon route canvas — above shader, below content */}
      <RouteCanvas />

      {/* Hero section */}
      <Hero />

      {/* About section */}
      <AboutSection />

      {/* Projects grid */}
      <ProjectsGrid />

      {/* Running section */}
      <RunningSection />

      {/* Strava stats */}
      <StravaStatsWrapper />

      {/* Experience timeline */}
      <Timeline />

      {/* Finish / Contact section */}
      <FinishSection />
    </main>
  );
}
