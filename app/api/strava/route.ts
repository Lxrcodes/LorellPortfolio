import { NextResponse } from "next/server";

// Cache for 1 hour
export const revalidate = 3600;

interface StravaActivity {
  type: string;
  distance: number;
}

interface TokenResponse {
  access_token: string;
}

export async function GET() {
  try {
    const clientId = process.env.STRAVA_CLIENT_ID;
    const clientSecret = process.env.STRAVA_CLIENT_SECRET;
    const refreshToken = process.env.STRAVA_REFRESH_TOKEN;

    // Check if credentials are configured
    if (!clientId || !clientSecret || !refreshToken) {
      // Return fallback data if Strava is not configured
      return NextResponse.json({
        totalKm: 850,
        count: 72,
        longestKm: "42.2",
        cached: true,
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
    });

    if (!tokenRes.ok) {
      throw new Error("Failed to refresh Strava token");
    }

    const { access_token }: TokenResponse = await tokenRes.json();

    // Fetch this year's runs (paginated)
    const year = new Date().getFullYear();
    const after = Math.floor(new Date(`${year}-01-01`).getTime() / 1000);
    let page = 1;
    let runs: StravaActivity[] = [];

    while (true) {
      const res = await fetch(
        `https://www.strava.com/api/v3/athlete/activities?per_page=100&page=${page}&after=${after}`,
        {
          headers: { Authorization: `Bearer ${access_token}` },
        }
      );

      if (!res.ok) {
        throw new Error("Failed to fetch Strava activities");
      }

      const activities: StravaActivity[] = await res.json();

      if (!activities.length) break;

      runs = runs.concat(activities.filter((a) => a.type === "Run"));

      if (activities.length < 100) break;
      page++;
    }

    // Calculate stats
    const totalKm = runs.reduce((sum, activity) => sum + activity.distance, 0) / 1000;
    const longestKm =
      runs.length > 0
        ? Math.max(...runs.map((activity) => activity.distance)) / 1000
        : 0;

    return NextResponse.json({
      totalKm: Math.round(totalKm),
      count: runs.length,
      longestKm: longestKm.toFixed(1),
    });
  } catch (error) {
    console.error("Strava API error:", error);

    // Return fallback data on error
    return NextResponse.json(
      {
        totalKm: 850,
        count: 72,
        longestKm: "42.2",
        cached: true,
        error: true,
      },
      { status: 200 }
    );
  }
}
