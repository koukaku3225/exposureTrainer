import type { PracticeRecord, Theme } from './types';

/**
 * イフゼンプラン（if-thenプランニング）。
 * 「クリアしたい段の課題を、日常のどの場面でやるか」を1枚ずつ決めて持つ。
 * 暴露を思い出す・習慣にするための仕組みなので、場面（時間帯）でまとめて見せる。
 */

export type TimeSlot = 'morning' | 'commute' | 'work' | 'evening' | 'anytime';

export const SLOTS: { slot: TimeSlot; label: string }[] = [
  { slot: 'morning', label: '朝' },
  { slot: 'commute', label: '通勤・移動' },
  { slot: 'work', label: '仕事中' },
  { slot: 'evening', label: '帰宅後・夜' },
  { slot: 'anytime', label: 'いつでも' },
];

export type IfThenPlan = {
  id: string;
  // 段に紐づかない自由なプランは themeId / stageId が null
  themeId: string | null;
  stageId: string | null;
  slot: TimeSlot;
  trigger: string;
  action: string;
  // 今はやらないプランを消さずに休ませる
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

export function createPlan(input: {
  themeId: string | null;
  stageId: string | null;
  slot: TimeSlot;
  trigger: string;
  action: string;
}): IfThenPlan {
  const now = new Date().toISOString();
  return {
    id: crypto.randomUUID(),
    themeId: input.themeId,
    stageId: input.stageId,
    slot: input.slot,
    trigger: input.trigger.trim(),
    action: input.action.trim(),
    active: true,
    createdAt: now,
    updatedAt: now,
  };
}

export function groupBySlot(plans: IfThenPlan[]): { slot: TimeSlot; label: string; plans: IfThenPlan[] }[] {
  return SLOTS.map(({ slot, label }) => ({ slot, label, plans: plans.filter((p) => p.slot === slot) })).filter(
    (g) => g.plans.length > 0,
  );
}

export function countPlanRecords(records: PracticeRecord[], planId: string): number {
  return records.filter((r) => r.planId === planId).length;
}

export function updatePlan(
  plans: IfThenPlan[],
  id: string,
  patch: Partial<Omit<IfThenPlan, 'id' | 'createdAt'>>,
  now: string,
): IfThenPlan[] {
  return plans.map((p) => (p.id === id ? { ...p, ...patch, updatedAt: now } : p));
}

export function setPlanActive(plans: IfThenPlan[], id: string, active: boolean, now: string): IfThenPlan[] {
  return updatePlan(plans, id, { active }, now);
}

export function removePlan(plans: IfThenPlan[], id: string): IfThenPlan[] {
  return plans.filter((p) => p.id !== id);
}

/**
 * プラン画面より前は、if-thenはテーマに1つだけぶら下がっていた（Theme.ifThen）。
 * 二重管理になるので、初回だけプランへ移し、テーマ側は空にする。
 */
export function migrateLegacyIfThen(
  themes: Theme[],
  plans: IfThenPlan[],
): { themes: Theme[]; plans: IfThenPlan[]; migrated: boolean } {
  const legacy = themes.filter((t) => t.ifThen);
  if (legacy.length === 0) return { themes, plans, migrated: false };

  const now = new Date().toISOString();
  const added = legacy.map((t) => ({
    ...createPlan({
      themeId: t.id,
      stageId: t.stages.find((s) => s.status === 'now')?.id ?? null,
      slot: 'anytime' as TimeSlot,
      trigger: t.ifThen!.trigger,
      action: t.ifThen!.action,
    }),
    createdAt: now,
    updatedAt: now,
  }));

  return {
    themes: themes.map((t) => (t.ifThen ? { ...t, ifThen: null, updatedAt: now } : t)),
    plans: [...plans, ...added],
    migrated: true,
  };
}
