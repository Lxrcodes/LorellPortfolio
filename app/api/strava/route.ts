import { NextResponse } from "next/server";

// Cache for 1 hour
export const revalidate = 3600;

interface StravaActivity {
  id: number;
  type: string;
  distance: number;
  start_date: string;
}

interface AthleteStats {
  biggest_run_distance: number;
  all_run_totals: {
    count: number;
    distance: number;
    moving_time: number;
    elapsed_time: number;
    elevation_gain: number;
  };
  ytd_run_totals: {
    count: number;
    distance: number;
  };
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

  const weeksWithRuns = new Set<string>();
  activities.forEach((activity) => {
    const date = new Date(activity.start_date);
    weeksWithRuns.add(getWeekNumber(date));
  });

  const now = new Date();
  let consecutiveWeeks = 0;
  let checkDate = new Date(now);

  while (true) {
    const weekKey = getWeekNumber(checkDate);
    if (weeksWithRuns.has(weekKey)) {
      consecutiveWeeks++;
      checkDate.setDate(checkDate.getDate() - 7);
    } else {
      // If current week has no runs yet, check previous week
      if (consecutiveWeeks === 0) {
        checkDate.setDate(checkDate.getDate() - 7);
        const prevWeekKey = getWeekNumber(checkDate);
        if (weeksWithRuns.has(prevWeekKey)) {
          consecutiveWeeks++;
          checkDate.setDate(checkDate.getDate() - 7);
          continue;
        }
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

    if (!clientId || !clientSecret || !refreshToken) {
      return NextResponse.json({
        error: true,
        reason: "missing_credentials",
      });
    }

    // Get access token
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
      const errorText = await tokenRes.text();
      console.error("Token refresh failed:", tokenRes.status, errorText);
      throw new Error(`Token refresh failed: ${tokenRes.status}`);
    }

    const tokenData = await tokenRes.json();
    const accessToken = tokenData.access_token;
    const athleteId = tokenData.athlete?.id;

    if (!athleteId) {
      throw new Error("No athlete ID in token response");
    }

    // Fetch athlete stats - this gives us all-time totals
    const statsRes = await fetch(
      `https://www.strava.com/api/v3/athletes/${athleteId}/stats`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
        cache: "no-store",
      }
    );

    if (!statsRes.ok) {
      const errorText = await statsRes.text();
      console.error("Stats fetch failed:", statsRes.status, errorText);
      throw new Error(`Stats fetch failed: ${statsRes.status}`);
    }

    const stats: AthleteStats = await statsRes.json();

    // Fetch recent activities for consecutive weeks calculation
    let allRuns: StravaActivity[] = [];
    let page = 1;

    // Only fetch last 2 years of activities for streak calculation
    const twoYearsAgo = Math.floor(Date.now() / 1000) - (2 * 365 * 24 * 60 * 60);

    while (page <= 10) { // Limit to 1000 activities max
      const res = await fetch(
        `https://www.strava.com/api/v3/athlete/activities?per_page=100&page=${page}&after=${twoYearsAgo}`,
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

    const consecutiveWeeks = calculateConsecutiveWeeks(allRuns);

    return NextResponse.json({
      // From athlete stats endpoint
      totalKm: Math.round(stats.all_run_totals.distance / 1000),
      totalRuns: stats.all_run_totals.count,
      longestRunKm: (stats.biggest_run_distance / 1000).toFixed(1),

      // Calculated from activities
      consecutiveWeeks,

      // Year to date
      ytdKm: Math.round(stats.ytd_run_totals.distance / 1000),
      ytdRuns: stats.ytd_run_totals.count,
    });
  } catch (error) {
    console.error("Strava API error:", error);
    return NextResponse.json({ error: true }, { status: 200 });
  }
}
