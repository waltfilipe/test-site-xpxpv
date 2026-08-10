import { HomeContent } from "@/components/HomeContent";
import { getMeta } from "@/lib/api";

export default async function HomePage() {
  let meta = { player_count: 0, description: "", leagues: [] as string[] };
  try {
    meta = await getMeta();
  } catch {
    /* API offline */
  }

  return <HomeContent meta={meta} />;
}
