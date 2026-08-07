import { NextRequest, NextResponse } from "next/server";
import { getStaticMeta } from "@/lib/staticStore.server";

export function GET(request: NextRequest) {
  const positionFamily = request.nextUrl.searchParams.get("position_family") ?? "midfielders";
  if (positionFamily !== "midfielders") {
    return NextResponse.json({ detail: "Only midfielders pool available in test site" }, { status: 400 });
  }
  return NextResponse.json(getStaticMeta());
}
