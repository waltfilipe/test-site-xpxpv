/** Position family options — shared without pulling in full filter defaults. */

export const POSITION_FAMILIES = [
  { key: "midfielders", label: "Meio-campistas" },
] as const;

export type ProfileGroupCard = {
  key: string;
  title: string;
  subtitle: string;
  description: string;
  accent: string;
  positionGroup: string | null;
};

export const PROFILE_GROUP_CARDS: ProfileGroupCard[] = [
  {
    key: "all",
    title: "Todos os meio-campistas",
    subtitle: "Pool completo",
    description: "Os 45 perfis curados — centrais e ofensivos — com rankings no pool europeu.",
    accent: "#a78bfa",
    positionGroup: null,
  },
  {
    key: "cm",
    title: "Meio-campistas centrais",
    subtitle: "Engine room",
    description: "Progressão, volume e construção de jogo a partir do meio-campo central.",
    accent: "#38bdf8",
    positionGroup: "central_midfielders",
  },
  {
    key: "am",
    title: "Meio-campistas ofensivos",
    subtitle: "Creative hub",
    description: "Criação de chance, linha de ruptura e impacto no terço final.",
    accent: "#34d399",
    positionGroup: "attacking_midfielders",
  },
];

export function positionBlocksForFamily(family: string): { key: string; label: string }[] {
  const match = POSITION_FAMILIES.find((f) => f.key === family);
  const label = match?.label.toLowerCase() ?? "jogadores";
  const blocks = [{ key: "all", label: `Todos os ${label}` }];
  if (family === "midfielders") {
    blocks.push(
      { key: "cm", label: "Meio-campistas centrais" },
      { key: "am", label: "Meio-campistas ofensivos" },
    );
  }
  return blocks;
}

export function profileGroupCounts(
  players: { position_group?: string | null }[],
): Record<string, number> {
  const counts: Record<string, number> = { all: players.length };
  for (const card of PROFILE_GROUP_CARDS) {
    if (!card.positionGroup) continue;
    counts[card.key] = players.filter((p) => p.position_group === card.positionGroup).length;
  }
  return counts;
}
