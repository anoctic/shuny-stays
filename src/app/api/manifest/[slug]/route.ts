import { NextRequest, NextResponse } from "next/server";
import { getPgBySlug } from "@/lib/data/pgs";

export const runtime = "edge";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const pg = await getPgBySlug(slug);

  const brandName = pg?.name || "Student & Executive Living";
  const primaryColor = pg?.primary_color || "#4F46E5";
  const logoUrl = pg?.logo_url;

  const icons = logoUrl
    ? [
        {
          src: logoUrl,
          sizes: "192x192",
          type: "image/png",
          purpose: "any",
        },
        {
          src: logoUrl,
          sizes: "512x512",
          type: "image/png",
          purpose: "any",
        },
      ]
    : [
        {
          src: "/icons/icon-192.png",
          sizes: "192x192",
          type: "image/png",
          purpose: "any",
        },
        {
          src: "/icons/icon-512.png",
          sizes: "512x512",
          type: "image/png",
          purpose: "any",
        },
        {
          src: "/icons/icon-maskable-512.png",
          sizes: "512x512",
          type: "image/png",
          purpose: "maskable",
        },
      ];

  const manifest = {
    name: `${brandName} — Resident App`,
    short_name: brandName.length > 12 ? brandName.slice(0, 12) : brandName,
    description: `Official resident mobile PWA for ${brandName}. Powered by Shuny Stays.`,
    start_url: `/pg/${slug}`,
    scope: `/pg/${slug}`,
    display: "standalone",
    orientation: "portrait",
    background_color: "#4F46E5",
    theme_color: primaryColor,
    icons,
  };

  return new NextResponse(JSON.stringify(manifest, null, 2), {
    headers: {
      "Content-Type": "application/manifest+json; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
