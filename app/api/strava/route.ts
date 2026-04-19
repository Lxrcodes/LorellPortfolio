import { NextResponse } from "next/server";

// Cache for 1 hour
export const revalidate = 3600;

interface StravaActivity {
  id: number;
  type: string;
  distance: number;
  start_date: string;
  best_efforts?: BestEffort[];
}

interface BestEffort {
  name: string;
  elapsed_time: number;
  moving_time: number;
}

interface AthleteStats {
  all_run_totals: {
    count: number;
    distance: number;
    elapsed_time: number;
  };
}

function formatTime(seconds: number): string {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hrs > 0) {
    return `${hrs}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

function getWeekNumber(date: Date): string {
  const year = date.getFullYear();
  const startOfYear = new Date(year, 0, 1);
  const days = Math.floor((date.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000));
  const week = Math.ceil((days + startOfYear.getDay() + 1) / 7);
  return `${year}-W${week}`;
}

function calculateConsecutiveWeeks(activities: StravaActivity[]): number {
  if (activities.length === 0) return 0;

  // Get unique weeks with runs
  const weeksWithRuns = new Set<string>();
  activities.forEach((activity) => {
    const date = new Date(activity.start_date);
    weeksWithRuns.add(getWeekNumber(date));
  });

  // Get current week
  const now = new Date();
  const currentWeek = getWeekNumber(now);

  // Count backwards from current week
  let consecutiveWeeks = 0;
  let checkDate = new Date(now);

  // Start from current week
  while (true) {
    const weekKey = getWeekNumber(checkDate);
    if (weeksWithRuns.has(weekKey)) {
      consecutiveWeeks++;
      // Go back 7 days
      checkDate.setDate(checkDate.getDate() - 7);
    } else {
      // If current week has no runs yet, don't break - check previous
      if (weekKey === currentWeek && consecutiveWeeks === 0) {
        checkDate.setDate(checkDate.getDate() - 7);
        continue;
      }
      break;
    }
  }

  return consecutiveWeeks;
}

export async function GET() {
  try {
    const clientId = process.env.STRAVA_CLIENT_ID;
    const clientSecret = process.env.STRAVA_CLIENT_SECRET;
    const refreshToken = process.env.STRAVA_REFRESH_TOKEN;

    // Check if credentials are configured
    if (!clientId || !clientSecret || !refreshToken) {
      return NextResponse.json({
        error: true,
        cached: true,
        reason: "missing_credentials",
      });
    }

    // Exchange refresh token for access token
    const tokenRes = await fetch("https://www.strava.com/oauth/token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refreshToken,
        grant_type: "refresh_token",
      }),
      cache: "no-store",
    });

    if (!tokenRes.ok) {
      throw new Error(`Failed to refresh token: ${tokenRes.status}`);
    }

    const tokenData = await tokenRes.json();
    const accessToken = tokenData.access_token;
    const athleteId = tokenData.athlete?.id;

    // Fetch athlete stats for all-time totals
    const statsRes = await fetch(
      `https://www.strava.com/api/v3/athletes/${athleteId}/stats`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
        cache: "no-store",
      }
    );

    let allTimeStats = { count: 0, distance: 0 };
    if (statsRes.ok) {
      const stats: AthleteStats = await statsRes.json();
      allTimeStats = {
        count: stats.all_run_totals.count,
        distance: stats.all_run_totals.distance,
      };
    }

    // Fetch all activities to find best efforts and calculate streaks
    let allRuns: StravaActivity[] = [];
    let page = 1;

    while (true) {
      const res = await fetch(
        `https://www.strava.com/api/v3/athlete/activities?per_page=100&page=${page}`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
          cache: "no-store",
        }
      );

      if (!res.ok) break;

      const activities: StravaActivity[] = await res.json();
      if (!activities.length) break;

      allRuns = allRuns.concat(activities.filter((a) => a.type === "Run"));

      if (activities.length < 100) break;
      page++;
    }

    // Find longest run
    const longestRun = allRuns.length > 0
      ? Math.max(...allRuns.map((a) => a.distance)) / 1000
      : 0;

    // Calculate consecutive weeks
    const consecutiveWeeks = calculateConsecutiveWeeks(allRuns);

    // Fetch best efforts from recent activities (need individual activity details)
    // Best efforts are only available when fetching single activity
    const bestEfforts: Record<string, number | null> = {
      "5k": null,
      "10k": null,
      "half_marathon": null,
      "marathon": null,
    };

    // Fetch details for activities that might have best efforts (longer runs)
    const potentialBestEffortRuns = allRuns
      .filter((a) => a.distance >= 5000)
      .slice(0, 50); // Check last 50 long runs

    for (const run of potentialBestEffortRuns) {
      const activityRes = await fetch(
        `https://www.strava.com/api/v3/activities/${run.id}`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
          cache: "no-store",
        }
      );

      if (!activityRes.ok) continue;

      const activity = await activityRes.json();

      if (activity.best_efforts) {
        for (const effort of activity.best_efforts) {
          const name = effort.name.toLowerCase();
          const time = effort.elapsed_time;

          if (name === "5k" && (!bestEfforts["5k"] || time < bestEfforts["5k"])) {
            bestEfforts["5k"] = time;
          }
          if (name === "10k" && (!bestEfforts["10k"] || time < bestEfforts["10k"])) {
            bestEfforts["10k"] = time;
          }
          if (name === "half-marathon" && (!bestEfforts["half_marathon"] || time < bestEfforts["half_marathon"])) {
            bestEfforts["half_marathon"] = time;
          }
          if (name === "marathon" && (!bestEfforts["marathon"] || time < bestEfforts["marathon"])) {
            bestEfforts["marathon"] = time;
          }
        }
      }
    }

    return NextResponse.json({
      // All-time stats
      totalKm: Math.round(allTimeStats.distance / 1000),
      totalRuns: allTimeStats.count,
      longestRunKm: longestRun.toFixed(1),
      consecutiveWeeks,

      // Best efforts (formatted times)
      best5k: bestEfforts["5k"] ? formatTime(bestEfforts["5k"]) : null,
      best10k: bestEfforts["10k"] ? formatTime(bestEfforts["10k"]) : null,
      bestHalfMarathon: bestEfforts["half_marathon"] ? formatTime(bestEfforts["half_marathon"]) : null,
      bestMarathon: bestEfforts["marathon"] ? formatTime(bestEfforts["marathon"]) : null,
    });
  } catch (error) {
    console.error("Strava API error:", error);

    return NextResponse.json(
      {
        error: true,
        cached: true,
      },
      { status: 200 }
    );
  }
}
