"use client";

import { useEffect, useState } from "react";
import StravaStats from "./StravaStats";

interface StravaData {
  totalKm: number;
  count: number;
  longestKm: string;
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
        // Fallback data
        setStats({
          totalKm: 850,
          count: 72,
          longestKm: "42.2",
        });
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  return (
    <StravaStats
      totalKm={stats?.totalKm ?? null}
      count={stats?.count ?? null}
      longestKm={stats?.longestKm ?? null}
      loading={loading}
      error={error}
    />
  );
}
