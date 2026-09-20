import { describe, it, expect } from 'vitest';
import { setThemeHidden, splitByVisibility } from './themeVisibility';
import type { Theme } from './types';

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
