import { describe, it, expect } from 'vitest';
import { meetsClearRequirement, isThemeUnlocked, isStageLocked } from './progression';
import type { PracticeRecord, Stage, Theme } from './types';

const rec = (over: Partial<PracticeRecord>): PracticeRecord => ({
  id: 'r',
  themeId: 't1',
  stageId: 's1',
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
});

describe('isStageLocked', () => {
  const stage = (over: Partial<Stage>): Stage => ({
    id: 's8',
    level: 8,
    name: '難しい段',
    status: 'todo',
    order: 8,
    clearRequirement: { count: 3, maxAnxietyAfter: 3 },
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
