import { describe, it, expect } from 'vitest';
import { buildGrowth, FULL_GROWTH_RECORDS } from './growth';
import type { PracticeRecord, Stage, Theme } from './types';

const stage = (over: Partial<Stage>): Stage => ({
  id: 's1',
  level: 1,
  name: '段',
  tasks: ['段'],
  status: 'todo',
  order: 0,
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
  createdAt: '2026-09-17T00:00:00Z',
  ...over,
});

describe('buildGrowth', () => {
  it('段の数だけ小枝ができ、状態が todo/now/clear からそれぞれ対応する', () => {
    const t = theme({
      stages: [
        stage({ id: 's1', order: 0, status: 'clear' }),
        stage({ id: 's2', order: 1, status: 'now' }),
        stage({ id: 's3', order: 2, status: 'todo' }),
      ],
    });
    const model = buildGrowth([t], []);
    const twigs = model.trees[0].twigs;
    expect(twigs.map((w) => w.state)).toEqual(['flower', 'open', 'bud']);
  });

  it('全段クリアなら done が true になる', () => {
    const t = theme({
      stages: [stage({ id: 's1', status: 'clear' }), stage({ id: 's2', order: 1, status: 'clear' })],
    });
    expect(buildGrowth([t], []).trees[0].done).toBe(true);
  });

  it('段が1つでも未クリアなら done は false', () => {
    const t = theme({
      stages: [stage({ id: 's1', status: 'clear' }), stage({ id: 's2', order: 1, status: 'now' })],
    });
    expect(buildGrowth([t], []).trees[0].done).toBe(false);
  });

  it('実践回数が増えるほど growth が大きくなり、フルサイズを超えない', () => {
    const t = theme({ stages: [stage({})] });
    const many = Array.from({ length: FULL_GROWTH_RECORDS + 20 }, (_, i) => rec({ id: `r${i}` }));
    const model = buildGrowth([t], many);
    expect(model.trees[0].growth).toBe(1);
  });

  it('実践記録が0件でも growth は最低値(0.3)を保つ（縮んで見えない）', () => {
    const t = theme({ stages: [stage({})] });
    expect(buildGrowth([t], []).trees[0].growth).toBe(0.3);
  });

  it('他のテーマの記録は数えない', () => {
    const t = theme({ id: 't1', stages: [stage({})] });
    const records = [rec({ themeId: 't2' }), rec({ themeId: 't2' })];
    expect(buildGrowth([t], records).trees[0].totalRecords).toBe(0);
  });

  it('「今回はここでよかった」を選んだ回数ぶん落ち葉が増える', () => {
    const t = theme({ stages: [stage({})] });
    const records = [
      rec({ id: 'r1', choice: 'stop_here' }),
      rec({ id: 'r2', choice: 'advance' }),
      rec({ id: 'r3', choice: 'stop_here' }),
    ];
    expect(buildGrowth([t], records).trees[0].fallenCount).toBe(2);
  });

  it('クリア済みの段が多いほど vigor が上がり、0件でも枯れ切らない（最低0.4）', () => {
    const noProgress = theme({ id: 't1', stages: [stage({ status: 'todo' })] });
    const allClear = theme({ id: 't2', stages: [stage({ status: 'clear' })] });
    const model = buildGrowth([noProgress, allClear], []);
    expect(model.trees[0].vigor).toBe(0.4);
    expect(model.trees[1].vigor).toBe(1);
  });
});
