"use client";

import { useEffect, useState } from "react";
import StravaStats from "./StravaStats";
import { bestEfforts } from "@/lib/runningStats";

interface StravaData {
  totalKm: number;
  totalRuns: number;
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
      best5k={bestEfforts["5k"]}
      best10k={bestEfforts["10k"]}
      bestHalfMarathon={bestEfforts["halfMarathon"]}
      bestMarathon={bestEfforts["marathon"]}
      loading={loading}
      error={error}
    />
  );
}
