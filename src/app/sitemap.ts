import type { MetadataRoute } from "next";
import dbConnect from "@/lib/db/connection";
import { ProfileAnalysis } from "@/lib/db/models/ProfileAnalysis";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  await dbConnect();
  
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/home`,
      lastModified: new Date(),
    },
  ];

  const profiles = await ProfileAnalysis.find({})
    .select("username lastAnalyzedAt")
    .lean();

  const profileRoutes: MetadataRoute.Sitemap = profiles.map((profile) => ({
    url: `${baseUrl}/profile/${profile.username}`,
    lastModified: profile.lastAnalyzedAt || new Date(),
  }));

  return [...staticRoutes, ...profileRoutes];
}