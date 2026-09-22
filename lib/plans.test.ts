import { describe, it, expect } from 'vitest';
import {
  SLOTS,
  countPlanRecords,
  createPlan,
  groupBySlot,
  migrateLegacyIfThen,
  removePlan,
  setPlanActive,
  updatePlan,
} from './plans';
import type { IfThenPlan } from './plans';
import type { PracticeRecord, Theme } from './types';

const plan = (over: Partial<IfThenPlan>): IfThenPlan => ({
  id: 'p1',
  themeId: 't1',
  stageId: 's1',
  slot: 'anytime',
  trigger: '会議が始まる',
  action: '一言だけ発言する',
  active: true,
  createdAt: '2026-09-22T00:00:00Z',
  updatedAt: '2026-09-22T00:00:00Z',
  ...over,
});

const rec = (over: Partial<PracticeRecord>): PracticeRecord => ({
  id: 'r1',
  themeId: 't1',
  stageId: 's1',
  planId: null,
  freeText: null,
  memo: null,
  isImagined: false,
  anxietyBefore: 5,
  anxietyAfter: 2,
  choice: null,
  createdAt: '2026-09-22T00:00:00Z',
  ...over,
});

describe('createPlan', () => {
  it('入力した場面とやることを持ち、最初から有効になっている', () => {
    const created = createPlan({ themeId: 't1', stageId: 's1', slot: 'morning', trigger: '　朝起きたら　', action: '　声を出す　' });
    expect(created.trigger).toBe('朝起きたら');
    expect(created.action).toBe('声を出す');
    expect(created.active).toBe(true);
    expect(created.slot).toBe('morning');
  });

  it('段に紐づけない自由なプランも作れる', () => {
    const created = createPlan({ themeId: null, stageId: null, slot: 'anytime', trigger: '道に迷ったら', action: '人に聞く' });
    expect(created.themeId).toBeNull();
    expect(created.stageId).toBeNull();
  });
});

describe('groupBySlot', () => {
  it('場面の並びは朝→通勤→仕事中→帰宅後→いつでも の順で、空のグループは出さない', () => {
    const plans = [plan({ id: 'a', slot: 'evening' }), plan({ id: 'b', slot: 'morning' })];
    const groups = groupBySlot(plans);
    expect(groups.map((g) => g.slot)).toEqual(['morning', 'evening']);
    expect(groups.map((g) => g.plans.map((p) => p.id))).toEqual([['b'], ['a']]);
  });

  it('同じ場面のプランはまとまる', () => {
    const plans = [plan({ id: 'a', slot: 'work' }), plan({ id: 'b', slot: 'work' })];
    expect(groupBySlot(plans)[0].plans.map((p) => p.id)).toEqual(['a', 'b']);
  });

  it('一時停止中のプランもグループには残る（消えたと勘違いしないように）', () => {
    expect(groupBySlot([plan({ active: false })])[0].plans.length).toBe(1);
  });

  it('場面の見出しはすべて名前を持つ', () => {
    expect(SLOTS.every((s) => s.label.length > 0)).toBe(true);
  });
});

describe('countPlanRecords', () => {
  it('そのプランから記録した回数だけ数える', () => {
    const records = [
      rec({ id: 'r1', planId: 'p1' }),
      rec({ id: 'r2', planId: 'p2' }),
      rec({ id: 'r3', planId: 'p1' }),
      rec({ id: 'r4', planId: null }),
    ];
    expect(countPlanRecords(records, 'p1')).toBe(2);
  });

  it('1回も無ければ0', () => {
    expect(countPlanRecords([], 'p1')).toBe(0);
  });
});

describe('updatePlan / setPlanActive / removePlan', () => {
  it('指定したプランだけ書き換わり、updatedAt が更新される', () => {
    const plans = [plan({ id: 'p1' }), plan({ id: 'p2' })];
    const next = updatePlan(plans, 'p1', { trigger: '帰宅したら' }, '2026-09-23T00:00:00Z');
    expect(next[0].trigger).toBe('帰宅したら');
    expect(next[0].updatedAt).toBe('2026-09-23T00:00:00Z');
    expect(next[1]).toEqual(plans[1]);
  });

  it('一時停止と再開ができる', () => {
    const plans = [plan({ id: 'p1', active: true })];
    expect(setPlanActive(plans, 'p1', false, '2026-09-23T00:00:00Z')[0].active).toBe(false);
    expect(setPlanActive(plans, 'p1', true, '2026-09-23T00:00:00Z')[0].active).toBe(true);
  });

  it('削除すると一覧から消える', () => {
    const plans = [plan({ id: 'p1' }), plan({ id: 'p2' })];
    expect(removePlan(plans, 'p1').map((p) => p.id)).toEqual(['p2']);
  });
});

describe('migrateLegacyIfThen', () => {
  const theme = (over: Partial<Theme>): Theme => ({
    id: 't1',
    name: 'テーマ',
    createdAt: '',
    updatedAt: '',
    ifThen: null,
    stages: [],
    ...over,
  });

  it('テーマが持っていた古いif-thenがプランに移り、テーマ側からは消える', () => {
    const themes = [theme({ id: 't1', ifThen: { trigger: '会議が始まる', action: '一言発言する' } })];
    const result = migrateLegacyIfThen(themes, []);
    expect(result.migrated).toBe(true);
    expect(result.plans.length).toBe(1);
    expect(result.plans[0]).toMatchObject({ themeId: 't1', trigger: '会議が始まる', action: '一言発言する' });
    expect(result.themes[0].ifThen).toBeNull();
  });

  it('移すものが無ければ何も変えない（毎回開くたびに増えない）', () => {
    const themes = [theme({ id: 't1', ifThen: null })];
    const existing = [plan({ id: 'p1' })];
    const result = migrateLegacyIfThen(themes, existing);
    expect(result.migrated).toBe(false);
    expect(result.plans).toEqual(existing);
    expect(result.themes).toEqual(themes);
  });
});
