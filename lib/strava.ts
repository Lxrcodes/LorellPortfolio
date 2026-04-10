export interface StravaStats {
  totalKm: number;
  count: number;
  longestKm: string;
}

export async function fetchStravaStats(): Promise<StravaStats | null> {
  try {
    const res = await fetch("/api/strava");
    if (!res.ok) {
      throw new Error("Failed to fetch Strava data");
    }
    return res.json();
  } catch (error) {
    console.error("Error fetching Strava stats:", error);
    return null;
  }
}
