import type { Metadata } from "next";

export async function generateMetadata(
  { params }: { params: { slug: string } }
): Promise<Metadata> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
    const res = await fetch(`${baseUrl}/products/${params.slug}/`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) throw new Error("not found");
    const product = await res.json();
    return {
      title:       product.name,
      description: product.description?.slice(0, 160) || `${product.name} — UzBox`,
      openGraph: {
        title:       product.name,
        description: product.description?.slice(0, 160),
        images:      product.primary_image ? [{ url: product.primary_image }] : [],
      },
    };
  } catch {
    return {
      title:       "Mahsulot",
      description: "UzBox mahsulot sahifasi",
    };
  }
}
