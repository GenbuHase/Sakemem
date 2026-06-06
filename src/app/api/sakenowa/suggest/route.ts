import { NextResponse } from "next/server";
import { searchSakeBrands } from "@/lib/sakenowa/client";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q") ?? "";

  try {
    const suggestions = await searchSakeBrands(query);

    return NextResponse.json({
      suggestions,
      attributionUrl: "https://sakenowa.com",
    });
  } catch {
    return NextResponse.json(
      { error: "サジェストの取得に失敗しました。", suggestions: [] },
      { status: 502 },
    );
  }
}
