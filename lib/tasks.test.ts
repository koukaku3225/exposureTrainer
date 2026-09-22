import { describe, it, expect } from 'vitest';
import { padTasks, getTaskOptions, getEditableTasks, getStageTitle } from './tasks';
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

describe('getEditableTasks', () => {
  it('tasksがあればそのまま返す', () => {
    expect(getEditableTasks(stage({ tasks: ['a', 'b'] }))).toEqual(['a', 'b']);
  });

  it('tasksが空配列ならnameを1枠目に補う（フォームが全空欄になるのを防ぐ）', () => {
    expect(getEditableTasks(stage({ tasks: [], name: '元の課題' }))).toEqual(['元の課題']);
  });

  it('tasksが未定義（古いデータ）でもnameを補う', () => {
    const legacy = stage({ name: '旧データの課題' });
    // @ts-expect-error 古いデータを想定してわざと tasks を外す
    delete legacy.tasks;
    expect(getEditableTasks(legacy)).toEqual(['旧データの課題']);
  });
});

describe('getStageTitle', () => {
  const stage = (over: Partial<Stage>): Stage => ({
    id: 's1',
    level: 1,
    name: '自動で付いた長い段の名前',
    tasks: [],
    status: 'todo',
    order: 0,
    ...over,
  });

  it('課題1を書いていれば、それが段のタイトルになる', () => {
    expect(getStageTitle(stage({ tasks: ['バーで隣の人に話しかける', '', ''] }))).toBe('バーで隣の人に話しかける');
  });

  it('課題1が空欄なら、元の段の名前をそのまま使う', () => {
    expect(getStageTitle(stage({ tasks: ['', '', ''] }))).toBe('自動で付いた長い段の名前');
  });

  it('課題1が空欄でも、2件目が書いてあればそれを使う', () => {
    expect(getStageTitle(stage({ tasks: ['', '駅で道を聞く', ''] }))).toBe('駅で道を聞く');
  });

  it('tasks が無い古いデータでも元の名前で落ちない', () => {
    expect(getStageTitle({ ...stage({}), tasks: undefined as unknown as string[] })).toBe('自動で付いた長い段の名前');
  });

  it('前後の空白は落とす', () => {
    expect(getStageTitle(stage({ tasks: ['　声をかける　', '', ''] }))).toBe('声をかける');
  });
});
