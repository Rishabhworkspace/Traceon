// src/app/api/profile/[username]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getOrAnalyzeProfile } from "@/lib/profile/service";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";
import dbConnect from "@/lib/db/connection";
import User from "@/lib/db/models/User";
// Import our custom error classes
import { UserNotFoundError, GitHubRateLimitError } from "@/lib/errors";

export const maxDuration = 60;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> },
) {
  try {
    // Rate Limiting (5 requests per 1 minute)
    const ip = request.headers.get("x-forwarded-for") ?? "127.0.0.1";
    const rateLimitResult = await rateLimit(ip, 5, 60 * 1000);

    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: "Too Many Requests. Please try again later." },
        {
          status: 429,
          headers: {
            "X-RateLimit-Limit": rateLimitResult.limit.toString(),
            "X-RateLimit-Remaining": rateLimitResult.remaining.toString(),
            "X-RateLimit-Reset": rateLimitResult.reset.toString(),
          },
        },
      );
    }

    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resolvedParams = await params;
    const username = resolvedParams.username;

    await dbConnect();
    const dbUser = await User.findOne({ email: session.user.email });

    const isOwner = dbUser && dbUser.githubUsername && dbUser.githubUsername.toLowerCase() === username.toLowerCase();

    // GET requests perform read-only cached or on-demand retrieval (no force-refresh)
    const result = await getOrAnalyzeProfile(username, false);

    let forceRefreshRemaining = 0;
    if (isOwner && dbUser) {
      const now = new Date();
      const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const recentRefreshes = (dbUser.forceRefreshTimestamps || []).filter(
        (t: Date) => new Date(t).getTime() >= twentyFourHoursAgo.getTime()
      );
      forceRefreshRemaining = Math.max(0, 3 - recentRefreshes.length);
    }

    return NextResponse.json({
      ...result,
      isOwner: !!isOwner,
      forceRefreshRemaining,
    });
  } catch (error: unknown) {
    console.error("[Profile API Error]:", error);

    // Type-safe error handling using instanceof
    if (error instanceof UserNotFoundError) {
      return NextResponse.json(
        { error: "GitHub user not found" },
        { status: 404 },
      );
    }

    if (error instanceof GitHubRateLimitError) {
      return NextResponse.json(
        {
          error:
            "GitHub API rate limit exceeded. Please try again later or add a GITHUB_TOKEN.",
          resetTime: error.resetTime?.toISOString(), // Include reset time in response
        },
        { status: 429 },
      );
    }

    // Fallback for all other errors
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred during profile analysis",
      },
      { status: 500 },
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resolvedParams = await params;
    const username = resolvedParams.username;

    await dbConnect();
    const dbUser = await User.findOne({ email: session.user.email });
    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const isOwner = dbUser.githubUsername && dbUser.githubUsername.toLowerCase() === username.toLowerCase();
    if (!isOwner) {
      return NextResponse.json(
        { error: "Only the profile owner can force re-analysis" },
        { status: 403 }
      );
    }

    // Check forceRefresh rate limit (max 3 per 24 hours)
    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    dbUser.forceRefreshTimestamps = (dbUser.forceRefreshTimestamps || []).filter(
      (t: Date) => new Date(t).getTime() >= twentyFourHoursAgo.getTime()
    );

    if (dbUser.forceRefreshTimestamps.length >= 3) {
      return NextResponse.json(
        { error: "Re-analyze limit reached. Try again tomorrow." },
        { status: 429 }
      );
    }

    dbUser.forceRefreshTimestamps.push(now);
    await dbUser.save();

    const result = await getOrAnalyzeProfile(username, true);

    const recentRefreshes = (dbUser.forceRefreshTimestamps || []).filter(
      (t: Date) => new Date(t).getTime() >= twentyFourHoursAgo.getTime()
    );
    const forceRefreshRemaining = Math.max(0, 3 - recentRefreshes.length);

    return NextResponse.json({
      ...result,
      isOwner: true,
      forceRefreshRemaining,
    });
  } catch (error: unknown) {
    console.error("[Profile API Error]:", error);

    // Type-safe error handling using instanceof
    if (error instanceof UserNotFoundError) {
      return NextResponse.json(
        { error: "GitHub user not found" },
        { status: 404 },
      );
    }

    if (error instanceof GitHubRateLimitError) {
      return NextResponse.json(
        {
          error:
            "GitHub API rate limit exceeded. Please try again later or add a GITHUB_TOKEN.",
          resetTime: error.resetTime?.toISOString(), // Include reset time in response
        },
        { status: 429 },
      );
    }

    // Fallback for all other errors
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred during profile analysis",
      },
      { status: 500 },
    );
  }
}
