"use client";

import { useEffect, useState } from "react";
import StravaStats from "./StravaStats";
import { bestEfforts, marathonGoal } from "@/lib/runningStats";

interface StravaData {
  totalKm: number;
  totalRuns: number;
  longestRunKm: string;
  consecutiveWeeks: number;
  ytdKm: number;
  ytdRuns: number;
  error?: boolean;
}

export default function StravaStatsWrapper() {
  const [stats, setStats] = useState<StravaData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch("/api/strava");
        if (!res.ok) {
          throw new Error("Failed to fetch");
        }
        const data = await res.json();
        setStats(data);
        setError(data.error || false);
      } catch (err) {
        console.error("Error fetching Strava stats:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  return (
    <StravaStats
      // From Strava API
      totalKm={stats?.totalKm ?? null}
      totalRuns={stats?.totalRuns ?? null}
      longestRunKm={stats?.longestRunKm ?? null}
      consecutiveWeeks={stats?.consecutiveWeeks ?? null}
      // From config (your manual PBs)
      best5k={bestEfforts["5k"]}
      best10k={bestEfforts["10k"]}
      bestHalfMarathon={bestEfforts["halfMarathon"]}
      bestMarathon={bestEfforts["marathon"]}
      marathonGoal={`${marathonGoal.race} — ${marathonGoal.target}`}
      loading={loading}
      error={error}
    />
  );
}
