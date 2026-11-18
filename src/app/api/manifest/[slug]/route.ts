import { NextRequest, NextResponse } from "next/server";
import { getPgBySlug } from "@/lib/data/pgs";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const pg = await getPgBySlug(slug);

  const brandName = pg?.name || "Student & Executive Living";
  const primaryColor = pg?.primary_color || "#4F46E5";
  const logoUrl =
    pg?.logo_url || "/icons/icon-192.svg";

  const manifest = {
    name: `${brandName} — Resident App`,
    short_name: brandName.length > 12 ? brandName.slice(0, 12) : brandName,
    description: `Official resident mobile PWA for ${brandName}. Powered by Shuny Stays.`,
    start_url: `/pg/${slug}`,
    scope: `/pg/${slug}`,
    display: "standalone",
    orientation: "portrait",
    background_color: "#0f172a",
    theme_color: primaryColor,
    icons: [
      {
        src: logoUrl,
        sizes: "192x192",
        type: "image/png",
        purpose: "any maskable",
      },
      {
        src: logoUrl,
        sizes: "512x512",
        type: "image/png",
        purpose: "any maskable",
      },
    ],
  };

  return new NextResponse(JSON.stringify(manifest, null, 2), {
    headers: {
      "Content-Type": "application/manifest+json; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
