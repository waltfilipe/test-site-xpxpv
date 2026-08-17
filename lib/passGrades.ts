export function resolvePassGradeRelative(
  profile: {
    pass_grade_expected?: number | null;
    pass_grade_relative?: number | null;
  },
): number | null {
  const rel = profile.pass_grade_expected ?? profile.pass_grade_relative;
  return rel != null && Number.isFinite(rel) ? rel : null;
}

export function computeOverallPassGrade(
  absolute: number | null | undefined,
  relative: number | null | undefined,
  stored?: number | null | undefined,
): number | null {
  if (stored != null && Number.isFinite(stored)) {
    return Math.round(stored * 100) / 100;
  }
  if (
    absolute != null
    && relative != null
    && Number.isFinite(absolute)
    && Number.isFinite(relative)
  ) {
    return Math.round(((absolute + relative) / 2) * 100) / 100;
  }
  return null;
}
