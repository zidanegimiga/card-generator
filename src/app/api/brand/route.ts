import { pullBrand } from "@/lib/brand-pull/pull-brand";

export async function GET(request: Request) {
  const url = new URL(request.url).searchParams.get("url");
  if (!url || url.length > 2048) {
    return Response.json(
      { error: "Enter a website address." },
      { status: 400 },
    );
  }

  const result = await pullBrand(url);
  if (!result.ok) {
    return Response.json({ error: result.error }, { status: result.status });
  }

  return Response.json(result.brand, {
    // Brands rarely change; let the CDN absorb repeat lookups.
    headers: {
      "cache-control": "public, s-maxage=86400, stale-while-revalidate=604800",
    },
  });
}
