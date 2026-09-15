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
  // 自由記述の記録（stageId が null）は段階表の合格ラインに数えない。
  // ガードレールの解放も、段階表を実際にこなした記録だけで判定する。
  const forTheme = records
    .filter((r) => r.themeId === themeId && r.stageId !== null)
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

// アイデア「段階の後戻り」：いまの段が辛すぎるとき、1つ前の段に戻る。
// 前の段が無い（先頭の段が now）か、now の段が無い（全段クリア済み）ときは何もしない。
export function retreatOneStage(theme: Theme): Theme {
  const sorted = [...theme.stages].sort((a, b) => a.order - b.order);
  const nowIndex = sorted.findIndex((s) => s.status === 'now');
  if (nowIndex <= 0) return theme;
  const updatedStages = sorted.map((s, i) => {
    if (i === nowIndex) return { ...s, status: 'todo' as const };
    if (i === nowIndex - 1) return { ...s, status: 'now' as const };
    return s;
  });
  return { ...theme, stages: updatedStages, updatedAt: new Date().toISOString() };
}
