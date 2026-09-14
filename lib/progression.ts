import type { PracticeRecord, Stage, Theme } from './types';

export function meetsClearRequirement(
  records: PracticeRecord[],
  stageId: string,
  req: { count: number; maxAnxietyAfter: number },
): boolean {
  const forStage = records
    .filter((r) => r.stageId === stageId)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  if (forStage.length < req.count) return false;
  const recent = forStage.slice(-req.count);
  return recent.every((r) => r.anxietyAfter <= req.maxAnxietyAfter);
}

export function isThemeUnlocked(
  records: PracticeRecord[],
  themeId: string,
  maxAnxietyAfter: number,
): boolean {
  const forTheme = records
    .filter((r) => r.themeId === themeId)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  if (forTheme.length < 3) return false;
  const recent = forTheme.slice(-3);
  return recent.every((r) => r.anxietyAfter <= maxAnxietyAfter);
}

export function isStageLocked(
  stage: Stage,
  theme: Theme,
  records: PracticeRecord[],
  guardrailThreshold: number,
): boolean {
  if (stage.level < guardrailThreshold) return false;
  return !isThemeUnlocked(records, theme.id, 3);
}
