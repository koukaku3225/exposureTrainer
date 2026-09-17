import { describe, it, expect } from 'vitest';
import { drawGrowth } from './growth-draw';
import { buildGrowth } from './growth';
import type { Stage, Theme } from './types';

const stage = (over: Partial<Stage>): Stage => ({
  id: 's1',
  level: 1,
  name: '段',
  tasks: ['段'],
  status: 'todo',
  order: 0,
  ...over,
});

describe('drawGrowth', () => {
  it('木が1本も無くても例外を投げない', () => {
    expect(() => drawGrowth({ trees: [] })).not.toThrow();
  });

  it('段のある木は、木ごとに幹（wood）が1本以上できる', () => {
    const theme: Theme = {
      id: 't1',
      name: 'テーマ',
      createdAt: '',
      updatedAt: '',
      ifThen: null,
      stages: [
        stage({ id: 's1', order: 0, status: 'clear' }),
        stage({ id: 's2', order: 1, status: 'now' }),
      ],
    };
    const model = buildGrowth([theme], []);
    const drawing = drawGrowth(model);
    expect(drawing.wood.length).toBeGreaterThan(0);
    expect(drawing.hits).toEqual([{ themeId: 't1', labelX: expect.any(Number), labelY: expect.any(Number), label: 'テーマ' }]);
  });

  it('花の状態(clear)の段がある木には flowers が1つ以上できる', () => {
    const theme: Theme = {
      id: 't1',
      name: 'テーマ',
      createdAt: '',
      updatedAt: '',
      ifThen: null,
      stages: [stage({ id: 's1', status: 'clear' })],
    };
    const drawing = drawGrowth(buildGrowth([theme], []));
    expect(drawing.flowers.length).toBeGreaterThan(0);
  });

  it('全段クリアの木には実(fruits)が3つできる', () => {
    const theme: Theme = {
      id: 't1',
      name: 'テーマ',
      createdAt: '',
      updatedAt: '',
      ifThen: null,
      stages: [stage({ id: 's1', status: 'clear' })],
    };
    const drawing = drawGrowth(buildGrowth([theme], []));
    expect(drawing.fruits.length).toBe(3);
  });
});
