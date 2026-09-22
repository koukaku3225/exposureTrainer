import { describe, it, expect } from 'vitest';
import { createCustomTheme, removeTheme, removeThemeRecords, setThemeHidden, splitByVisibility } from './themeAdmin';
import type { PracticeRecord, Theme } from './types';

const theme = (over: Partial<Theme>): Theme => ({
  id: 't1',
  name: 'テーマ',
  createdAt: '2026-09-01T00:00:00Z',
  updatedAt: '2026-09-01T00:00:00Z',
  ifThen: null,
  stages: [],
  ...over,
});

describe('setThemeHidden', () => {
  it('指定したテーマだけ hidden が true になり、他のテーマは変わらない', () => {
    const themes = [theme({ id: 't1' }), theme({ id: 't2' })];
    const next = setThemeHidden(themes, 't1', true, '2026-09-20T00:00:00Z');
    expect(next[0].hidden).toBe(true);
    expect(next[0].updatedAt).toBe('2026-09-20T00:00:00Z');
    expect(next[1]).toEqual(themes[1]);
  });

  it('false を渡すと表示に戻る', () => {
    const themes = [theme({ id: 't1', hidden: true })];
    expect(setThemeHidden(themes, 't1', false, '2026-09-20T00:00:00Z')[0].hidden).toBe(false);
  });

  it('段階や記録に紐づくデータ（stages）は消えない', () => {
    const stages = [{ id: 's1', level: 1, name: '段', tasks: ['段'], status: 'now' as const, order: 0 }];
    const next = setThemeHidden([theme({ stages })], 't1', true, '2026-09-20T00:00:00Z');
    expect(next[0].stages).toEqual(stages);
  });
});

describe('splitByVisibility', () => {
  it('hidden が無い古いデータは表示側に入る', () => {
    const { visible, hidden } = splitByVisibility([theme({ id: 't1' })]);
    expect(visible.map((t) => t.id)).toEqual(['t1']);
    expect(hidden).toEqual([]);
  });

  it('hidden が true のテーマだけ非表示側に入り、順序は保たれる', () => {
    const themes = [theme({ id: 'a' }), theme({ id: 'b', hidden: true }), theme({ id: 'c' })];
    const { visible, hidden } = splitByVisibility(themes);
    expect(visible.map((t) => t.id)).toEqual(['a', 'c']);
    expect(hidden.map((t) => t.id)).toEqual(['b']);
  });
});

const rec = (over: Partial<PracticeRecord>): PracticeRecord => ({
  id: 'r1',
  themeId: 't1',
  stageId: 's1',
  freeText: null,
  memo: null,
  isImagined: false,
  anxietyBefore: 5,
  anxietyAfter: 2,
  choice: null,
  createdAt: '2026-09-20T00:00:00Z',
  ...over,
});

describe('removeTheme', () => {
  it('指定したテーマだけ一覧から消える', () => {
    const themes = [theme({ id: 't1' }), theme({ id: 't2' })];
    expect(removeTheme(themes, 't1').map((t) => t.id)).toEqual(['t2']);
  });

  it('無いidを渡しても他のテーマは消えない', () => {
    const themes = [theme({ id: 't1' })];
    expect(removeTheme(themes, 'zzz')).toEqual(themes);
  });
});

describe('removeThemeRecords', () => {
  it('消したテーマの記録だけ消え、他のテーマの記録は残る', () => {
    const records = [rec({ id: 'r1', themeId: 't1' }), rec({ id: 'r2', themeId: 't2' })];
    expect(removeThemeRecords(records, 't1').map((r) => r.id)).toEqual(['r2']);
  });
});

describe('createCustomTheme', () => {
  it('入力した名前のテーマができ、最初の段が挑戦中になる', () => {
    const created = createCustomTheme('　自分で決めたテーマ　');
    expect(created.name).toBe('自分で決めたテーマ');
    expect(created.stages[0].status).toBe('now');
    expect(created.stages.slice(1).every((s) => s.status === 'todo')).toBe(true);
  });

  it('難易度1から10まで、10段そろって作られる', () => {
    const created = createCustomTheme('テスト');
    expect(created.stages.map((s) => s.level)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  });

  it('段は難しさ順に並び、それぞれ課題を3枠持つ', () => {
    const created = createCustomTheme('テスト');
    expect(created.stages.map((s) => s.order)).toEqual(created.stages.map((_, i) => i));
    expect(created.stages.every((s) => s.tasks.length === 3)).toBe(true);
  });

  it('段の名前はすべて違う（段階表で見分けられるように）', () => {
    const names = createCustomTheme('テスト').stages.map((s) => s.name);
    expect(new Set(names).size).toBe(names.length);
  });

  it('テーマ名は段の名前にも入る（何のテーマか段階表で分かるように）', () => {
    expect(createCustomTheme('犬に近づく').stages.every((s) => s.name.includes('犬に近づく'))).toBe(true);
  });

  it('作ったテーマは表示状態（hiddenではない）', () => {
    expect(createCustomTheme('テスト').hidden).toBeFalsy();
  });
});
