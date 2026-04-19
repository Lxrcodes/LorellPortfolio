"use client";

import { useEffect, useState } from "react";
import StravaStats from "./StravaStats";

interface StravaData {
  totalKm: number;
  totalRuns: number;
  longestRunKm: string;
  consecutiveWeeks: number;
  best5k: string | null;
  best10k: string | null;
  bestHalfMarathon: string | null;
  bestMarathon: string | null;
  cached?: boolean;
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
      totalKm={stats?.totalKm ?? null}
      totalRuns={stats?.totalRuns ?? null}
      longestRunKm={stats?.longestRunKm ?? null}
      consecutiveWeeks={stats?.consecutiveWeeks ?? null}
      best5k={stats?.best5k ?? null}
      best10k={stats?.best10k ?? null}
      bestHalfMarathon={stats?.bestHalfMarathon ?? null}
      bestMarathon={stats?.bestMarathon ?? null}
      loading={loading}
      error={error}
    />
  );
}
