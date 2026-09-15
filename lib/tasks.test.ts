import { describe, it, expect } from 'vitest';
import { padTasks, getTaskOptions } from './tasks';
import type { Stage } from './types';

const stage = (over: Partial<Stage>): Stage => ({
  id: 's1',
  level: 1,
  name: 'デフォルトの課題',
  tasks: [],
  status: 'now',
  order: 0,
  ...over,
});

describe('padTasks', () => {
  it('足りない分を空文字で3枠にそろえる', () => {
    expect(padTasks(['a'])).toEqual(['a', '', '']);
  });

  it('3件を超える分は切り捨てる', () => {
    expect(padTasks(['a', 'b', 'c', 'd'])).toEqual(['a', 'b', 'c']);
  });

  it('空配列は3つの空文字になる', () => {
    expect(padTasks([])).toEqual(['', '', '']);
  });
});

describe('getTaskOptions', () => {
  it('入力済みのものだけを返す（空欄は除く）', () => {
    expect(getTaskOptions(stage({ tasks: ['a', '', 'c'] }))).toEqual(['a', 'c']);
  });

  it('1件も入力されていなければnameにフォールバックする', () => {
    expect(getTaskOptions(stage({ tasks: ['', ''], name: 'フォールバック' }))).toEqual(['フォールバック']);
  });

  it('tasksが未定義（古いデータ）でもnameにフォールバックする', () => {
    const legacy = stage({ name: '旧データの課題' });
    // @ts-expect-error 古いデータを想定してわざと tasks を外す
    delete legacy.tasks;
    expect(getTaskOptions(legacy)).toEqual(['旧データの課題']);
  });
});
