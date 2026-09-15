import { describe, it, expect } from 'vitest';
import { meetsClearRequirement, isThemeUnlocked, isStageLocked, retreatOneStage } from './progression';
import type { PracticeRecord, Stage, Theme } from './types';

const rec = (over: Partial<PracticeRecord>): PracticeRecord => ({
  id: 'r',
  themeId: 't1',
  stageId: 's1',
  freeText: null,
  memo: null,
  isImagined: false,
  anxietyBefore: 6,
  anxietyAfter: 3,
  choice: null,
  createdAt: '2026-09-14T00:00:00Z',
  ...over,
});

describe('meetsClearRequirement', () => {
  it('直近count件がすべて基準以下ならtrue', () => {
    const records = [rec({ anxietyAfter: 3 }), rec({ anxietyAfter: 2 }), rec({ anxietyAfter: 1 })];
    expect(meetsClearRequirement(records, 's1', { count: 3, maxAnxietyAfter: 3 })).toBe(true);
  });

  it('件数が足りなければfalse', () => {
    const records = [rec({ anxietyAfter: 1 }), rec({ anxietyAfter: 1 })];
    expect(meetsClearRequirement(records, 's1', { count: 3, maxAnxietyAfter: 3 })).toBe(false);
  });

  it('直近count件のうち1件でも基準を超えたらfalse', () => {
    const records = [rec({ anxietyAfter: 3 }), rec({ anxietyAfter: 5 }), rec({ anxietyAfter: 1 })];
    expect(meetsClearRequirement(records, 's1', { count: 3, maxAnxietyAfter: 3 })).toBe(false);
  });

  it('別ステージの記録は数えない', () => {
    const records = [
      rec({ stageId: 's2', anxietyAfter: 1 }),
      rec({ anxietyAfter: 1 }),
      rec({ anxietyAfter: 1 }),
      rec({ anxietyAfter: 1 }),
    ];
    expect(meetsClearRequirement(records, 's1', { count: 3, maxAnxietyAfter: 3 })).toBe(true);
  });
});

describe('isThemeUnlocked', () => {
  it('テーマ内の直近3件が基準以下ならtrue（ステージを問わない）', () => {
    const records = [
      rec({ stageId: 's1', anxietyAfter: 3 }),
      rec({ stageId: 's2', anxietyAfter: 2 }),
      rec({ stageId: 's1', anxietyAfter: 3 }),
    ];
    expect(isThemeUnlocked(records, 't1', 3)).toBe(true);
  });

  it('記録がなければfalse', () => {
    expect(isThemeUnlocked([], 't1', 3)).toBe(false);
  });

  it('自由記述の記録（stageIdがnull）は数えない', () => {
    const records = [
      rec({ stageId: null, freeText: '急な会議', anxietyAfter: 1 }),
      rec({ stageId: 's1', anxietyAfter: 3 }),
      rec({ stageId: 's1', anxietyAfter: 2 }),
    ];
    // 自由記述を除くと2件しかないので、まだ解放条件を満たさない
    expect(isThemeUnlocked(records, 't1', 3)).toBe(false);
  });
});

describe('retreatOneStage', () => {
  const stages: Stage[] = [
    { id: 's1', level: 1, name: '段1', status: 'clear', order: 0 },
    { id: 's2', level: 2, name: '段2', status: 'now', order: 1 },
    { id: 's3', level: 3, name: '段3', status: 'todo', order: 2 },
  ];
  const theme: Theme = { id: 't1', name: 'テーマ', createdAt: '', updatedAt: '', ifThen: null, stages };

  it('いまの段をtodoに、1つ前の段をnowに戻す', () => {
    const next = retreatOneStage(theme);
    const byId = Object.fromEntries(next.stages.map((s) => [s.id, s.status]));
    expect(byId.s1).toBe('now');
    expect(byId.s2).toBe('todo');
    expect(byId.s3).toBe('todo');
  });

  it('先頭の段がnowのときは何もしない', () => {
    const firstNow: Theme = {
      ...theme,
      stages: stages.map((s, i) => ({ ...s, status: i === 0 ? 'now' : 'todo' })),
    };
    const next = retreatOneStage(firstNow);
    expect(next).toBe(firstNow);
  });

  it('nowの段が無い（全段クリア済み）ときは何もしない', () => {
    const allClear: Theme = { ...theme, stages: stages.map((s) => ({ ...s, status: 'clear' })) };
    const next = retreatOneStage(allClear);
    expect(next).toBe(allClear);
  });
});

describe('isStageLocked', () => {
  const stage = (over: Partial<Stage>): Stage => ({
    id: 's8',
    level: 8,
    name: '難しい段',
    status: 'todo',
    order: 8,
    ...over,
  });
  const theme = (over: Partial<Theme>): Theme => ({
    id: 't1',
    name: 'テーマ',
    createdAt: '',
    updatedAt: '',
    ifThen: null,
    stages: [],
    ...over,
  });

  it('難易度が閾値以上で、解放条件未達ならロック', () => {
    expect(isStageLocked(stage({ level: 8 }), theme({}), [], 8)).toBe(true);
  });

  it('難易度が閾値未満なら常にロックしない', () => {
    expect(isStageLocked(stage({ level: 5 }), theme({}), [], 8)).toBe(false);
  });

  it('直近3件が基準を満たせばロック解除', () => {
    const records = [
      rec({ themeId: 't1', anxietyAfter: 2 }),
      rec({ themeId: 't1', anxietyAfter: 3 }),
      rec({ themeId: 't1', anxietyAfter: 1 }),
    ];
    expect(isStageLocked(stage({ level: 8 }), theme({ id: 't1' }), records, 8)).toBe(false);
  });
});
